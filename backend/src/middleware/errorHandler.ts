import { Request, Response, NextFunction } from 'express';

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

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const requestId = (req as any).requestId || 'unknown';

  if (process.env.NODE_ENV === 'development') {
    console.error(`[${requestId}] Error:`, err);
  } else {
    // Production: log minimal info
    console.error(`[${requestId}] ${err.message} (${err.name})`);
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode
    });
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      error: 'Database operation failed',
      statusCode: 400
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: err.message,
      statusCode: 400
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    statusCode: 500
  });
};
