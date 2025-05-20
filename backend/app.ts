// app.ts, which will contain the main application logic.

import express from 'express';
import { config } from './config';
import cors from 'cors';
import cookieparser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import csrf from 'csurf';
import multer from 'multer';
import mongoose from 'mongoose';
import prisma from './config/prisma';
import { loggerMiddleware } from './middlewares/logger.middleware';
import routes from './routes';

// Initialize Express app
const app = express();

// Secure the app by setting various HTTP headers
app.use(helmet());

// Custom logger middleware (logs request/response and timing)
app.use(loggerMiddleware);

// Middleware to handle CORS and JSON requests
app.use(cors({
    origin: config.corsOrigin,
    credentials: true
}));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static('public'));

// Cookie parser middleware
app.use(cookieparser());

// Middleware for logging HTTP requests
app.use(morgan('combined'));

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// CSRF protection middleware - only apply to browser-based routes, not API routes
// const csrfProtection = csrf({ cookie: true });

// Apply CSRF protection only to non-API routes
// Skip CSRF for API routes (including auth routes)
// app.use((req, res, next) => {
//     // Skip CSRF for /auth routes and any API routes
//     if (req.path.startsWith('/auth') || req.path.includes('/api/')) {
//         return next();
//     }
    
//     // Apply CSRF protection to all other routes
//     return csrfProtection(req, res, next);
// });

// Multipart/form-data parsing middleware
app.use(multer({ dest: 'uploads/' }).single('file'));

// Register all routes with /api
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        apiVersion: config.apiVersion,
    });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
    });
});

export { app, prisma };
