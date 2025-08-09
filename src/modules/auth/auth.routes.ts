// src/modules/auth/auth.routes.ts
import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { registerUser, loginUser,sendVerificationCode,resetPassword,verifyCode} from './auth.controller';
import '../auth/googleAuth'; // Initialize Google strategy

const router = express.Router();

/**
 * Local authentication routes
 */
router.post('/register', registerUser);
router.post('/login', loginUser);

/**
 * Google OAuth routes
 */
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  (req: any, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    });
    res.redirect(`http://localhost:3000?token=${token}`);
  }
);

router.post("/forgot-password", sendVerificationCode);
router.post("/verify-code", verifyCode);
router.post("/reset-password", resetPassword);

export const authRoutes = router;
