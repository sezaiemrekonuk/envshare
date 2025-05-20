import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();

// Register a new user
router.post('/register', (req, res) => {
  authController.register(req, res);
});

// Login a user
router.post('/login', (req, res) => {
  authController.login(req, res);
});

// Refresh access token
router.post('/refresh', (req, res) => {
  authController.refreshToken(req, res);
});

// Logout a user
router.post('/logout', (req, res) => {
  authController.logout(req, res);
});

// Get current user profile (protected route)
router.get('/profile', authMiddleware, (req, res) => {
  authController.getProfile(req, res);
});

export default router; 