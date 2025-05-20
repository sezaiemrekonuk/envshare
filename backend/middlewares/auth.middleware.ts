import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AppError } from '../errors';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        username: string;
        email?: string;
      };
    }
  }
}

const authService = new AuthService();

/**
 * Middleware to authenticate requests using JWT
 * Extracts the token from the Authorization header and verifies it
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next(new AppError('Authorization header missing', 401));
    }

    // Check if it's a Bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next(new AppError('Invalid authorization format', 401));
    }

    const token = parts[1];
    
    // Verify token
    const decoded = authService.verifyAccessToken(token);
    
    // Set user information in request object for downstream middleware/controllers
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email
    };
    
    next();
  } catch (error) {
    next(new AppError('Unauthorized', 401));
  }
}

/**
 * Optional authentication middleware that doesn't require a token
 * but will set the user property if a valid token is provided
 */
export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        const token = parts[1];
        const decoded = authService.verifyAccessToken(token);
        
        req.user = {
          userId: decoded.userId,
          username: decoded.username,
          email: decoded.email
        };
      }
    }
    
    next();
  } catch (error) {
    // Continue even if token verification fails
    next();
  }
} 