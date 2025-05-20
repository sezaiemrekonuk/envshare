import { User } from '@prisma/client';
import prisma from '../config/prisma';
import bcrypt from 'bcrypt';
// Import jwt using require instead of import to avoid type issues
const jwt = require('jsonwebtoken');
import { config } from '../config';
import { RegisterDto, LoginDto, AuthResponseDto, TokenResponseDto } from '../dto/auth.dto';
import crypto from 'crypto';

// Extend User type for our use case since Prisma might have null username
type SafeUser = Omit<User, 'username'> & { username: string };

export class AuthService {
  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUserQuery: any = { email: registerDto.email };
    
    // Only check username if it was provided
    if (registerDto.username) {
      existingUserQuery.username = registerDto.username;
    }
    
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: registerDto.email },
          ...(registerDto.username ? [{ username: registerDto.username }] : [])
        ]
      }
    });

    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    // Generate a username from email if not provided
    const username = registerDto.username || 
      `user_${registerDto.email.split('@')[0]}_${Math.floor(Math.random() * 10000)}`;

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(registerDto.password, saltRounds);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username,
        email: registerDto.email,
        password_hash: passwordHash
      }
    });

    // Ensure user has username for token generation
    const safeUser: SafeUser = {
      ...newUser,
      username: newUser.username || ''
    };

    // Generate tokens
    const tokens = await this.generateTokens(safeUser);

    // Return user info and tokens
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: newUser.id,
        username: newUser.username || '',
        email: newUser.email
      }
    };
  }

  /**
   * Authenticate a user and return tokens
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: loginDto.email }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password_hash);
    
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Ensure user has username for token generation
    const safeUser: SafeUser = {
      ...user,
      username: user.username || ''
    };

    // Generate tokens
    const tokens = await this.generateTokens(safeUser);

    // Return user info and tokens
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        username: user.username || '',
        email: user.email
      }
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponseDto> {
    // Verify the refresh token
    try {
      // Find the token in the database
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true }
      });

      if (!storedToken || storedToken.revoked || storedToken.expires_at < new Date()) {
        throw new Error('Invalid refresh token');
      }

      // Ensure user has username for token generation
      const safeUser: SafeUser = {
        ...storedToken.user,
        username: storedToken.user.username || ''
      };

      // Generate new tokens
      const tokens = await this.generateTokens(safeUser);

      // Revoke the old refresh token
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoked: true }
      });

      return tokens;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Logout a user by revoking their refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revoked: true }
      });
    } catch (error) {
      throw new Error('Failed to logout');
    }
  }

  /**
   * Generate access and refresh tokens for a user
   */
  private async generateTokens(user: SafeUser): Promise<TokenResponseDto> {
    // Generate access token
    const accessToken = jwt.sign(
      { 
        userId: user.id,
        username: user.username,
        email: user.email
      },
      config.jwt.accessToken.secret,
      { expiresIn: config.jwt.accessToken.expiresIn }
    );

    // Generate refresh token
    const refreshToken = crypto.randomBytes(40).toString('hex');
    
    // Calculate expiry date for refresh token
    const refreshExpiresIn = config.jwt.refreshToken.expiresIn;
    const expiresInDays = parseInt(refreshExpiresIn.replace('d', ''));
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        expires_at: expiresAt,
        user: {
          connect: { id: user.id }
        }
      }
    });

    return {
      accessToken,
      refreshToken
    };
  }

  /**
   * Verify and decode JWT access token
   */
  verifyAccessToken(token: string): { userId: string; username: string; email: string } {
    try {
      const decoded = jwt.verify(token, config.jwt.accessToken.secret) as { userId: string; username: string; email: string };
      return {
        userId: decoded.userId,
        username: decoded.username || '',
        email: decoded.email
      };
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }
}
