import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import bcrypt from "bcryptjs";
import MongoStore from "connect-mongo";
import { User } from "./mongodb";

export function setupAuth(app: Express) {
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

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Allow login with either username or email
        const user = await User.findOne({
          $or: [{ username: username }, { email: username }]
        });
        if (!user || !(await bcrypt.compare(password, user.password))) {
          return done(null, false);
        }
        return done(null, user);
      } catch (err) {
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

  app.post("/api/register", async (req, res) => {
    try {
      // Body parsing might be nested depending on the client implementation
      const body = req.body;
      console.log("Registration request received (Full Body):", JSON.stringify(body, null, 2));
      
      const { username, email, password } = body;
      
      if (!username || !email || !password) {
        console.log("Validation failed: missing fields", { username, email, hasPassword: !!password });
        return res.status(400).json({ error: "Missing required fields", received: Object.keys(body) });
      }

      const existingUserByUsername = await User.findOne({ username });
      if (existingUserByUsername) {
        console.log("Registration failed: Username exists", username);
        return res.status(400).json({ error: "Username already exists" });
      }

      const existingUserByEmail = await User.findOne({ email });
      if (existingUserByEmail) {
        console.log("Registration failed: Email exists", email);
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        username,
        email,
        password: hashedPassword,
      });
      await user.save();
      console.log("User saved successfully in MongoDB:", user._id);

      req.login(user, (err) => {
        if (err) {
          console.error("Login error after registration:", err);
          return res.status(500).json({ error: "Error logging in after registration" });
        }
        console.log("User logged in successfully after registration");
        // Don't send the password back
        const userResponse = {
          _id: user._id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt
        };
        res.status(201).json(userResponse);
      });
    } catch (err) {
      console.error("CRITICAL: Registration error:", err);
      res.status(500).json({ error: "Error creating user" });
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
