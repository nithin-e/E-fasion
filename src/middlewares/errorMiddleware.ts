import { Request, Response, NextFunction } from 'express';
import { HTTP } from '../utils/statuscodes';
import { logger } from '../utils/logger';

// Custom application error class
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 404 handler
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, HTTP.NOT_FOUND));
};

// Global error handler
export const globalErrorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const appErr = err as AppError;
  const statusCode = appErr.statusCode || HTTP.INTERNAL_ERROR;
  const isOperational = appErr.isOperational ?? false;

  // Log
  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} → ${statusCode}: ${err.message}`, {
      stack: err.stack,
    });
  } else {
    logger.warn(`[${req.method}] ${req.originalUrl} → ${statusCode}: ${err.message}`);
  }

  // Mongoose duplicate key
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    res.status(HTTP.CONFLICT).json({ success: false, message: `${field} already in use` });
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    res.status(HTTP.BAD_REQUEST).json({ success: false, message: err.message });
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(HTTP.UNAUTHORIZED).json({ success: false, message: 'Invalid token' });
    return;
  }
  if (err.name === 'TokenExpiredError') {
    res.status(HTTP.UNAUTHORIZED).json({ success: false, message: 'Token expired' });
    return;
  }

  res.status(statusCode).json({
    success: false,
    message: isOperational || process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
