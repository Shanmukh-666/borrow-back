import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../services/requestLifecycle.service';

const getCookieOptions = (isClearing = false) => {
  const isProd = process.env.NODE_ENV === 'production';
  const configuredSameSite = process.env.COOKIE_SAME_SITE as 'lax' | 'none' | 'strict' | undefined;
  const sameSite = configuredSameSite || (isProd ? 'none' : 'lax');

  return {
    httpOnly: true,
    secure: isProd || sameSite === 'none',
    sameSite,
    path: '/',
    ...(isClearing ? {} : { maxAge: 7 * 24 * 60 * 60 * 1000 }), // 7 days
  };
};

const generateToken = (payload: { id: string; email: string; name: string }): string => {
  const secret = process.env.JWT_SECRET || 'borrowback_development_super_secret_jwt_key_at_least_32_characters';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const plainPassword = typeof password === 'string' ? password : '';

    const validationDetails: Array<{ field: string; message: string }> = [];

    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 60) {
      validationDetails.push({ field: 'name', message: 'Name must be between 2 and 60 characters' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      validationDetails.push({ field: 'email', message: 'Enter a valid email address' });
    }

    if (!plainPassword || plainPassword.length < 8) {
      validationDetails.push({ field: 'password', message: 'Password must be at least 8 characters' });
    }

    if (validationDetails.length > 0) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Validation failed for registration', validationDetails);
    }

    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      throw new AppError(409, 'DUPLICATE_EMAIL', 'An account with this email already exists', [
        { field: 'email', message: 'Email is already registered' },
      ]);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(plainPassword, salt);

    const user = new User({
      name: trimmedName,
      email: trimmedEmail,
      passwordHash,
    });

    await user.save();

    const safeUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    const token = generateToken(safeUser);
    res.cookie('token', token, getCookieOptions());

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { user: safeUser },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const plainPassword = typeof password === 'string' ? password : '';

    if (!trimmedEmail || !plainPassword) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Email and password are required', [
        ...(!trimmedEmail ? [{ field: 'email', message: 'Email is required' }] : []),
        ...(!plainPassword ? [{ field: 'password', message: 'Password is required' }] : []),
      ]);
    }

    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const isMatch = await bcrypt.compare(plainPassword, user.passwordHash);
    if (!isMatch) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const safeUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    const token = generateToken(safeUser);
    res.cookie('token', token, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: { user: safeUser },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie('token', getCookieOptions(true));
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
    data: {},
  });
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.clearCookie('token', { path: '/' });
      throw new AppError(401, 'USER_NOT_FOUND', 'Session user no longer exists');
    }

    const safeUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      data: { user: safeUser },
    });
  } catch (error) {
    next(error);
  }
};
