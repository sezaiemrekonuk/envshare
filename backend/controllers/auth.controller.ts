import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginDtoSchema, RefreshTokenDtoSchema, RegisterDtoSchema } from '../dto/auth.dto';
import { ZodError } from 'zod';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register a new user
   */
  async register(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = RegisterDtoSchema.parse(req.body);
      
      // Register the user
      const result = await this.authService.register(validatedData);
      
      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors
        });
      }
      
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Login a user
   */
  async login(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = LoginDtoSchema.parse(req.body);
      
      // Login the user
      const result = await this.authService.login(validatedData);
      
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors
        });
      }
      
      if (error instanceof Error) {
        return res.status(401).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = RefreshTokenDtoSchema.parse(req.body);
      
      // Refresh the token
      const result = await this.authService.refreshToken(validatedData.refreshToken);
      
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors
        });
      }
      
      if (error instanceof Error) {
        return res.status(401).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Logout a user
   */
  async logout(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = RefreshTokenDtoSchema.parse(req.body);
      
      // Logout the user
      await this.authService.logout(validatedData.refreshToken);
      
      return res.status(200).json({ message: 'Successfully logged out' });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors
        });
      }
      
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req: Request, res: Response) {
    try {
      // The user is already attached to the request by the auth middleware
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      return res.status(200).json({ 
        userId: req.user.userId,
        username: req.user.username
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
} 