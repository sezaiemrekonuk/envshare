import { Router } from 'express';
import authRoutes from './auth.routes';
import { config } from '../config';

const router = Router();

// API version prefix
const API_PREFIX = '/v' + config.apiVersion;

// Auth routes
router.use(`/auth`, authRoutes);

// Add other route modules here as the application grows
// Example: router.use(`${API_PREFIX}/users`, userRoutes);

export default router; 