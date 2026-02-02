import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          $or: [{ googleId: profile.id }, { email: profile.emails[0].value }],
        });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            firstName: profile.name ? profile.name.givenName : "",
            lastName: profile.name ? profile.name.familyName : "",
            email: profile.emails[0].value,
            emailStatus: "VERIFIED",
          });
        }

        const token = jwt.sign(
          {
            _id: user._id,
            role: user.role,
            emailStatus: user.emailStatus,
            identityStatus: user.identityStatus,
          },
          process.env.JWT_KEY
        );

        return done(null, { user, token });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/api/auth/facebook/callback",
      profileFields: ["id", "emails", "name"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ facebookId: profile.id });

        if (!user) {
          user = await User.create({
            facebookId: profile.id,
            firstName: profile.name ? profile.name.givenName : "",
            lastName: profile.name ? profile.name.familyName : "",
            emailStatus: "VERIFIED",
          });
        } else if (!user.facebookId) {
          user.facebookId = profile.id;
          await user.save();
        }

        const token = jwt.sign(
          {
            _id: user._id,
            role: user.role,
            emailStatus: user.emailStatus,
            identityStatus: user.identityStatus,
          },
          process.env.JWT_KEY
        );

        return done(null, { user, token });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport;
