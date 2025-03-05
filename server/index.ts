import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import knex from 'knex'; // Assume knex is used for database migrations

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Placeholder for database configuration -  REPLACE WITH YOUR ACTUAL CONFIGURATION
const knexConfig = {
  client: 'pg', // Or your database client
  connection: {
    host : 'localhost',
    user : 'your_db_user',
    password : 'your_db_password',
    database : 'your_db_name'
  },
  migrations: {
    directory: './migrations' // Path to your migrations directory
  }
};

const db = knex(knexConfig);


async function checkAndMigrateDatabase() {
  try {
    await db.migrate.latest();
    log('Database migrations complete.');
  } catch (error) {
    console.error('Error during database migration:', error);
    process.exit(1); // Exit if migration fails
  }
}

(async () => {
  // Check and migrate database before starting server
  await checkAndMigrateDatabase();

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Try to serve the app on port 5000, fall back to another port if needed
  let port = 5000;
  const startServer = () => {
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    }).on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        log(`Port ${port} is already in use, trying port ${port + 1}`);
        port += 1;
        startServer();
      } else {
        console.error('Server error:', err);
      }
    });
  };

  startServer();
})();