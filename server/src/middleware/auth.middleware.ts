import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Please log in.',
      },
    });
    return;
  }

  const secret = process.env.JWT_SECRET || 'borrowback_development_super_secret_jwt_key_at_least_32_characters';

  try {
    const decoded = jwt.verify(token, secret) as { id: string; email: string; name: string };
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired session. Please log in again.',
      },
    });
  }
};

export const optionalAuthenticate = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const token = req.cookies?.token;
  if (!token) {
    return next();
  }

  const secret = process.env.JWT_SECRET || 'borrowback_development_super_secret_jwt_key_at_least_32_characters';
  try {
    const decoded = jwt.verify(token, secret) as { id: string; email: string; name: string };
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    };
  } catch {
    // Ignore invalid token on optional auth
  }
  next();
};
