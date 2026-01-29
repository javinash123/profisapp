import express from "express";
import type { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupAuth } from "./auth";
import { connectDB } from "./mongodb";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const app = express();
const log = console.log;

// Support subdirectory hosting (e.g., /pegpro/)
const BASE_PATH = process.env.BASE_PATH || "";
const apiRouter = express.Router();

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

function setupCors(app: express.Application | express.Router) {
  app.use((req, res, next) => {
    const origin = req.header("Origin") || "*";
    res.header("Access-Control-Allow-Origin", origin);
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    );
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, expo-platform, Accept, Cookie");
    res.header("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }

    next();
  });
}

function setupBodyParsing(app: express.Application | express.Router) {
  app.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.use(express.urlencoded({ extended: false }));
}

function setupRequestLogging(app: express.Application | express.Router) {
  app.use((req, res, next) => {
    log(`Incoming ${req.method} request to: ${req.url}`);
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      if (!path.startsWith("/api")) return;

      const duration = Date.now() - start;

      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    });

    next();
  });
}

function setupErrorHandler(app: express.Application | express.Router) {
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const error = err as {
      status?: number;
      statusCode?: number;
      message?: string;
    };

    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";

    res.status(status).json({ message });

    throw err;
  });
}

(async () => {
  await connectDB();
  
  // Register routes on apiRouter
  setupCors(apiRouter);
  setupBodyParsing(apiRouter);
  setupRequestLogging(apiRouter);
  setupAuth(apiRouter);
  await registerRoutes(apiRouter as any);

  // Global app setup
  setupCors(app);
  setupBodyParsing(app);

  // BASE_PATH strategy that matches the last working setup
  const normalizedBasePath = BASE_PATH ? (BASE_PATH.startsWith('/') ? BASE_PATH : `/${BASE_PATH}`) : "";
  
  // Register API router on root first
  app.use("/api", apiRouter);

  if (normalizedBasePath && normalizedBasePath !== "/") {
    log(`Registering subpath: ${normalizedBasePath}`);
    // IMPORTANT: Registering the router WITHOUT the /api prefix inside the subpath mount
    // so it handles the trailing part of the URL
    app.use(`${normalizedBasePath}/api`, apiRouter);
    
    app.use(`${normalizedBasePath}/assets`, express.static(path.resolve(process.cwd(), "assets")));
    app.use(`${normalizedBasePath}/static-build`, express.static(path.resolve(process.cwd(), "static-build")));
    
    // Landing page for subpath
    app.get([normalizedBasePath, `${normalizedBasePath}/`], (req, res) => {
      res.send("<html><body><h1>PegPro API</h1><p>Running in Production (Subpath)</p></body></html>");
    });
  }

  // Handle static files at root
  app.use("/assets", express.static(path.resolve(process.cwd(), "assets")));
  app.use("/static-build", express.static(path.resolve(process.cwd(), "static-build")));

  // Root landing page
  app.get("/", (req, res) => {
    res.send("<html><body><h1>PegPro API</h1><p>Running in Production</p></body></html>");
  });

  // Final 404 handler - only for unmatched routes
  app.use((req: Request, res: Response) => {
    res.status(404).json({ 
      message: `API endpoint not found: ${req.originalUrl}`,
      path: req.originalUrl,
      method: req.method
    });
  });

  setupErrorHandler(app);

  const port = parseInt(process.env.PORT || "5000", 10);
  app.listen({ port, host: "0.0.0.0" }, () => {
    log(`express server serving on port ${port} with BASE_PATH: ${BASE_PATH}`);
  });
})();
