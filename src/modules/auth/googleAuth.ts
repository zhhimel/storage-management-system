// src/modules/auth/googleAuth.ts
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../user/user.model';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ email: profile.emails?.[0].value });

        if (existingUser) return done(null, existingUser);

        const newUser = await User.create({
          username: profile.displayName,
          email: profile.emails?.[0].value,
          image: profile.photos?.[0].value,
          password: 'google_auth', // You can put a random hash here if needed
        });

        done(null, newUser);
      } catch (err) {
        done(err as any, false);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
