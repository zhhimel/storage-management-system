// src/app.ts
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import httpStatus from 'http-status';

// import { authRoutes } from './modules/auth/auth.routes';
// import { userRoutes } from './modules/user/user.routes';
// import { storageRoutes } from './modules/storage/storage.routes';
// // import other routes like folderRoutes, pdfRoutes, etc.

// import { errorHandler } from './middlewares/error.middleware';

dotenv.config();

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/storage', storageRoutes);
// app.use('/api/folders', folderRoutes);
// app.use('/api/pdfs', pdfRoutes);
// app.use('/api/images', imageRoutes);
// app.use('/api/notes', noteRoutes);

// Health check
app.get('/', (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Storage Management System API is running!',
  });
});

// Global Error Handler
// app.use(errorHandler);

export default app;
