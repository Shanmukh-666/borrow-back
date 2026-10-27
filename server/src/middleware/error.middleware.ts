import { Request, Response, NextFunction } from 'express';
import { AppError } from '../services/requestLifecycle.service';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // If it's our custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ERROR',
        message: `A record with this ${field} already exists.`,
        details: [{ field, message: `${field} must be unique.` }],
      },
    });
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = Object.keys(err.errors || {}).map((key) => ({
      field: key,
      message: err.errors[key].message,
    }));
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed for one or more fields.',
        details,
      },
    });
    return;
  }

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: `Invalid identifier for field ${err.path}.`,
      },
    });
    return;
  }

  // Malformed JSON syntax error in request body
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: 'Malformed JSON payload in request body.',
      },
    });
    return;
  }

  // Unexpected errors
  console.error('[Internal Server Error]:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal server error occurred.',
    },
  });
};
