import { Request, Response } from 'express';
import httpStatus from 'http-status';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { User } from '../user/user.model';
import { sendEmail } from '../../utils/sendEmail';
import { ApiError } from '../../utils/ApiError';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

// ========== SIGNUP ==========
export const registerUser = async (req: Request, res: Response) => {
  console.log('Register request body:', req.body); // debug

  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'All fields are required');
  }

  if (password !== confirmPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Passwords don't match");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  const token = generateToken(newUser._id.toString());

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'User registered successfully',
    data: {
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    },
  });
};


// ========== LOGIN ==========
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
  }

  const token = generateToken(user._id.toString());

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Logged in successfully',
    data: {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    },
  });
};

// ========== FORGOT PASSWORD (SEND CODE) ==========
const verificationCodes: Record<string, string> = {}; // In-memory map (for testing — use Redis in prod)

export const sendVerificationCode = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const code = crypto.randomInt(100000, 999999).toString();
  verificationCodes[email] = code;

  await sendEmail({
    to: email,
    subject: 'Your Password Reset Code',
    text: `Your verification code is: ${code}`,
  });

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Verification code sent to email',
  });
};

// ========== VERIFY CODE ==========
export const verifyCode = async (req: Request, res: Response) => {
  const { email, code } = req.body;

  if (verificationCodes[email] !== code) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired code');
  }

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Verification code is valid',
  });
};

// ========== RESET PASSWORD ==========
export const resetPassword = async (req: Request, res: Response) => {
  const { email, code, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Passwords do not match');
  }

  if (verificationCodes[email] !== code) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired code');
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await User.findOneAndUpdate({ email }, { password: hashed });

  // Clear code after use
  delete verificationCodes[email];

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Password has been reset successfully',
  });
};

// ========== GOOGLE SIGN-IN (Placeholder) ==========
export const googleSignIn = async (req: Request, res: Response) => {
  // You’ll implement this using Passport.js or Firebase Auth
  res.status(httpStatus.NOT_IMPLEMENTED).json({
    success: false,
    message: 'Google sign-in not implemented yet',
  });
};
