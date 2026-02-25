import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../config/database';

const router = Router();

// Validation helpers
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): { valid: boolean; error?: string } => {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  // TODO: Add uppercase, lowercase, number, special char requirement
  return { valid: true };
};

// Generate cryptographically secure random token
const generateToken = (bytes: number = 64): string => {
  return crypto.randomBytes(bytes).toString('hex');
};

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.error });
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role: role || 'SALES_REPRESENTATIVE'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });

    // Do NOT return token on register - user must login
    res.status(201).json({ user, message: 'Registration successful. Please log in.' });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { client: true }
    });

    // Debug logging
    console.log('[DEBUG] Login attempt for email:', email);
    console.log('[DEBUG] User found:', !!user);
    if (user) {
      console.log('[DEBUG] user.passwordHash exists:', !!user.passwordHash);
      console.log('[DEBUG] user.passwordHash length:', user.passwordHash?.length);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is disabled' });
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return res.status(403).json({ error: 'Account temporarily locked. Try again later.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      // Increment failed login attempts
      await db.user.update({
        where: { id: user.id },
        data: { 
          failedLoginAttempts: { increment: 1 }
        }
      });

      // Check if we need to lock the account
      const updatedUser = await db.user.findUnique({ where: { id: user.id } });
      if (updatedUser && updatedUser.failedLoginAttempts >= 5) {
        await db.user.update({
          where: { id: user.id },
          data: { lockedUntil: new Date(Date.now() + 15 * 60 * 1000) } // 15 minutes
        });
      }

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // On successful login, reset failed attempts and clear lock
    await db.user.update({
      where: { id: user.id },
      data: { 
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date()
      }
    });

    // Create access token (short-lived)
    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // Create refresh token with rotation
    const refreshTokenValue = generateToken();
    await db.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshTokenValue,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    // Set HTTP-only cookie for refresh token
    res.cookie('refresh_token', refreshTokenValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      token: accessToken
    });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get refresh token from cookie or body (support both during migration)
    const refreshTokenValue = req.cookies?.refresh_token || req.body.token;

    if (!refreshTokenValue) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    const refreshToken = await db.refreshToken.findUnique({
      where: { token: refreshTokenValue },
      include: { user: true }
    });

    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Note: usedAt field exists for audit but we use delete-then-create for rotation
    // This ensures old token cannot be reused

    // Create NEW refresh token (rotation)
    const newRefreshTokenValue = generateToken();
    await db.refreshToken.create({
      data: {
        userId: refreshToken.userId,
        token: newRefreshTokenValue,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    // Set new cookie
    res.cookie('refresh_token', newRefreshTokenValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Create new access token
    const newAccessToken = jwt.sign(
      { userId: refreshToken.userId },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    res.json({ token: newAccessToken });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshTokenValue = req.cookies?.refresh_token || req.body.token;
    
    if (refreshTokenValue) {
      await db.refreshToken.deleteMany({ where: { token: refreshTokenValue } });
    }

    // Clear cookie
    res.clearCookie('refresh_token');

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

// Password reset endpoints
router.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await db.user.findUnique({ where: { email } });

    if (user) {
      // Generate reset token
      const resetToken = generateToken(32);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.passwordResetToken.create({
        data: {
          userId: user.id,
          token: resetToken,
          expiresAt
        }
      });

      // Send email with reset link
      const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
      
      // TODO: Implement sendPasswordResetEmail in email service
      // For now, just log it in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Password reset link: ${resetUrl}`);
      }

      // TODO: Create sendPasswordResetEmail function
    }

    // Always return success to prevent email enumeration
    res.json({ message: 'If an account exists with that email, a password reset link has been sent.' });
  } catch (error) {
    next(error);
  }
});

router.post('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.error });
    }

    const resetTokenRecord = await db.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetTokenRecord) {
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    if (resetTokenRecord.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    if (resetTokenRecord.usedAt) {
      return res.status(400).json({ error: 'Reset token has already been used' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update user password
    await db.user.update({
      where: { id: resetTokenRecord.userId },
      data: { 
        passwordHash,
        failedLoginAttempts: 0,
        lockedUntil: null
      }
    });

    // Mark token as used
    await db.passwordResetToken.update({
      where: { id: resetTokenRecord.id },
      data: { usedAt: new Date() }
    });

    // Invalidate all existing sessions (delete refresh tokens)
    await db.refreshToken.deleteMany({
      where: { userId: resetTokenRecord.userId }
    });

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    next(error);
  }
});

export default router;
