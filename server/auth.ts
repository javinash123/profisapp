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

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          console.log("Password mismatch for:", username);
          return done(null, false, { message: "Invalid username or password" });
        }

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

  (app as any).post("/register", async (req: any, res: any) => {
    try {
      const body = req.body;
      console.log("Registration request received (Full Body):", JSON.stringify(body, null, 2));
      
      const { username, email, password } = body;
      
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

  (app as any).post("/login", (req: any, res: any, next: any) => {
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

  (app as any).post("/logout", (req: any, res: any, next: any) => {
    req.logout((err: any) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  (app as any).get("/user", (req: any, res: any) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    res.json(req.user);
  });

  (app as any).get("/check-auth", (req: any, res: any) => {
    res.json({ authenticated: req.isAuthenticated(), user: req.user });
  });
}
