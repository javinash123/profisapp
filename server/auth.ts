import express, { Express, Router } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import bcrypt from "bcryptjs";
import MongoStore from "connect-mongo";
import { User } from "./mongodb";

export function setupAuth(app: Express | Router) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "fishing-match-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions'
    }),
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  };

  if ('set' in app && typeof (app as any).set === 'function') {
    (app as any).set("trust proxy", 1);
  }
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy({ usernameField: 'username', passwordField: 'password' }, async (username, password, done) => {
      try {
        console.log("Login attempt for:", username);
        // Allow login with either username or email
        const user = await User.findOne({
          $or: [{ username: username }, { email: username }]
        });
        
        if (!user) {
          console.log("User not found:", username);
          return done(null, false, { message: "Invalid username or password" });
        }

        // Check if account is locked
        if (user.lockUntil && user.lockUntil > new Date()) {
          return done(null, false, { message: "Your account has been locked after 5 failed login attempts. Please reset your password to continue." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          console.log("Password mismatch for:", username);
          
          // Increment login attempts
          user.loginAttempts = (user.loginAttempts || 0) + 1;
          console.log(`User ${username} now has ${user.loginAttempts} failed attempts`);

          if (user.loginAttempts >= 5) {
            user.lockUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Lock indefinitely (1 year) until reset
            await user.save();
            console.log(`User ${username} account LOCKED`);
            return done(null, false, { message: "Your account has been locked after 5 failed login attempts. Please reset your password to continue." });
          }
          await user.save();
          
          return done(null, false, { message: `Invalid username or password. Attempt ${user.loginAttempts} of 5.` });
        }

        // Reset login attempts on successful login
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();

        console.log("Login successful for:", username);
        return done(null, user);
      } catch (err) {
        console.error("LocalStrategy error:", err);
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, (user as any)._id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  (app as any).post("/api/register", async (req: any, res: any) => {
    try {
      const body = req.body;
      console.log("Registration request received (Full Body):", JSON.stringify(body, null, 2));
      
      const { username, email, password, biometricsEnabled } = body;
      
      if (!username || !email || !password) {
        console.log("Validation failed: missing fields", { username, email, hasPassword: !!password });
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [
          { username: username.toLowerCase() }, 
          { email: email.toLowerCase() }
        ] 
      });

      if (existingUser) {
        const field = existingUser.username.toLowerCase() === username.toLowerCase() ? "Username" : "Email";
        console.log(`Registration failed: ${field} exists`, username);
        return res.status(400).json({ error: `${field} already exists` });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: hashedPassword,
        biometricsEnabled: biometricsEnabled || false,
      });
      await user.save();
      console.log("User saved successfully in MongoDB:", user._id);

      req.login(user, (err: any) => {
        if (err) {
          console.error("Login error after registration:", err);
          return res.status(500).json({ error: "Error logging in after registration" });
        }
        res.status(201).json({
          _id: user._id,
          username: user.username,
          email: user.email,
        });
      });
    } catch (err) {
      console.error("CRITICAL: Registration error:", err);
      res.status(500).json({ error: "Error creating user" });
    }
  });

  (app as any).post("/api/login", (req: any, res: any, next: any) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error("Auth error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }
      if (!user) {
        console.log("Login failed info:", info);
        return res.status(401).json({ message: info?.message || "Invalid username or password" });
      }
      req.login(user, (err: any) => {
        if (err) {
          console.error("Login session error:", err);
          return res.status(500).json({ message: "Error establishing session" });
        }
        console.log("Session established for:", user.username);
        return res.json(user);
      });
    })(req, res, next);
  });

  (app as any).post("/api/logout", (req: any, res: any, next: any) => {
    req.logout((err: any) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  (app as any).get("/api/user", (req: any, res: any) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    res.json(req.user);
  });

  (app as any).get("/api/check-auth", (req: any, res: any) => {
    res.json({ authenticated: req.isAuthenticated(), user: req.user });
  });

  // Password Reset Routes
  (app as any).post("/api/password-reset/request", async (req: any, res: any) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        // Return 200 even if user not found for security
        return res.json({ message: "If an account with that email exists, a reset link has been sent." });
      }

      const token = Math.random().toString(36).slice(-8); // Simple token for demo
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();

      console.log(`Password reset token for ${email}: ${token}`);
      res.json({ message: "If an account with that email exists, a reset link has been sent.", token }); // Including token for demo/testing
    } catch (err) {
      res.status(500).json({ error: "Error requesting password reset" });
    }
  });

  (app as any).post("/api/password-reset/reset", async (req: any, res: any) => {
    try {
      const { token, password } = req.body;
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ error: "Password reset token is invalid or has expired." });
      }

      user.password = await bcrypt.hash(password, 10);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();

      res.json({ message: "Password has been reset successfully." });
    } catch (err) {
      res.status(500).json({ error: "Error resetting password" });
    }
  });

  // Biometric Settings
  (app as any).post("/api/user/biometrics", async (req: any, res: any) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    try {
      const { enabled } = req.body;
      const user = await User.findById(req.user._id);
      user.biometricsEnabled = enabled;
      await user.save();
      res.json({ biometricsEnabled: user.biometricsEnabled });
    } catch (err) {
      res.status(500).json({ error: "Error updating biometric settings" });
    }
  });
}
