import express from "express";
import type { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupAuth } from "./auth";
import { connectDB } from "./mongodb";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";

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
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, expo-platform, Accept");
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

function getAppName(): string {
  try {
    const appJsonPath = path.resolve(process.cwd(), "app.json");
    const appJsonContent = fs.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}

function serveExpoManifest(platform: string, res: Response) {
  const manifestPath = path.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json",
  );

  if (!fs.existsSync(manifestPath)) {
    return res
      .status(404)
      .json({ error: `Manifest not found for platform: ${platform}` });
  }

  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");

  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}

function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName,
}: {
  req: Request;
  res: Response;
  landingPageTemplate: string;
  appName: string;
}) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}${BASE_PATH}`;
  const expsUrl = `${host}${BASE_PATH}`;

  log(`baseUrl`, baseUrl);
  log(`expsUrl`, expsUrl);

  const html = landingPageTemplate
    .replace(/BASE_URL_PLACEHOLDER/g, baseUrl)
    .replace(/EXPS_URL_PLACEHOLDER/g, expsUrl)
    .replace(/APP_NAME_PLACEHOLDER/g, appName);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}

function configureExpoAndLanding(app: express.Application | express.Router) {
  const landingPageTemplate = "<html><head><title>PegPro API</title></head><body><h1>PegPro API</h1><p>Running on Port 6119</p></body></html>";
  const appName = getAppName();

  log("Serving static Expo files with dynamic manifest routing");

  const assetsPath = path.resolve(process.cwd(), "assets");
  const staticBuildPath = path.resolve(process.cwd(), "static-build");

  (app as any).use("/assets", express.static(assetsPath));
  (app as any).use("/static-build", express.static(staticBuildPath));

  (app as any).get("/manifest", (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api")) return next();
    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }
    res.status(404).send("Not found");
  });

  (app as any).get("/", (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api")) return next();
    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }
    return serveLandingPage({
      req,
      res,
      landingPageTemplate,
      appName,
    });
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
  
  // Apply middleware to apiRouter
  setupCors(apiRouter);
  setupBodyParsing(apiRouter);
  setupRequestLogging(apiRouter);
  setupAuth(apiRouter);
  await registerRoutes(apiRouter as any);

  const mainRouter = express.Router();
  
  // IMPORTANT: configureExpoAndLanding uses app.get("/") and app.get("/manifest")
  // which can catch everything if not careful. We must ensure it doesn't intercept /api
  const expoRouter = express.Router();
  configureExpoAndLanding(expoRouter);
  
  // CORS configuration to allow pegslam.com
  app.use((req, res, next) => {
    const origin = req.header("Origin") || "*";
    res.header("Access-Control-Allow-Origin", origin);
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    );
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, expo-platform, Accept, Cookie");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Expose-Headers", "Set-Cookie");

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Use absolute path for API routes to match client expectations
  app.use(`/api`, apiRouter);
  
  // Catch-all for /api/* that didn't match anything in apiRouter
  app.use(`/api`, (req: Request, res: Response) => {
    console.log("404 API Request (Fallback):", req.method, req.originalUrl);
    res.status(404).json({ 
      message: `API endpoint not found: ${req.originalUrl}`,
      path: req.originalUrl,
      method: req.method
    });
  });

  // Proxy all non-API requests to Metro bundler for Expo Go mobile preview
  const metroProxy = createProxyMiddleware({
    target: 'http://localhost:8081',
    changeOrigin: true,
    ws: true,
    logger: console,
  });

  app.use(`/`, (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    // Proxy to Metro bundler for Expo
    metroProxy(req, res, next);
  });

  setupErrorHandler(app);

  const port = parseInt(process.env.PORT || "5000", 10);
  app.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
      log(`express server serving on port ${port} with BASE_PATH: ${BASE_PATH}`);
    },
  );
})();
