// src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Something went wrong';

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });
};
