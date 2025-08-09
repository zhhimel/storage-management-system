// src/app.ts
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import httpStatus from 'http-status';
import passport from 'passport';
import session from 'express-session';

// Load environment variables
dotenv.config();

// Import routes
import { authRoutes } from './modules/auth/auth.routes';
import { userRoutes } from './modules/user/user.routes';
import { storageRoutes } from './modules/storage/storage.routes';
import { itemRoutes } from './modules/item/item.routes';
import { folderRoutes } from './modules/folder/folder.routes';

// Import middlewares
import { errorHandler } from './middlewares/error.middleware';

// Import Google Auth Strategy
import './modules/auth/googleAuth';

const app: Application = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Session for passport (required for Google OAuth)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'session_secret',
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/', (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Storage Management System API is running!',
  });
});

// Global error handler
app.use(errorHandler);

export default app;
