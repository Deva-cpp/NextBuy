import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import authRoutes from "./routes/authRoutes.js";
import botProtectionRoutes from "./routes/botProtectionRoutes.js";
import adminRoutes from "./routes/admin.js";
import productRoutes from "./routes/productRoutes.js";
import benchmarkRoutes from "./routes/benchmarkRoutes.js";
import { 
  apiRateLimit, 
  authRateLimit, 
  detectHeadlessBrowser, 
  analyzeIP, 
  deviceFingerprinting,
  botDetection,
  sqlInjectionCheck
} from "./middleware/botProtection.js";
import { logRequest } from "./utils/botMetricsMonitor.js";


dotenv.config();
const server = express();

// Security middleware
server.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://cdn.jsdelivr.net"
      ],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"]
    }
  }
})); // Helps secure Express apps by setting HTTP response headers

// Custom sanitization middleware that works with Express 5
server.use((req, res, next) => {
  // Only sanitize req.body and req.params which are writable
  if (req.body) req.body = mongoSanitize.sanitize(req.body, { replaceWith: '_' });
  if (req.params) req.params = mongoSanitize.sanitize(req.params, { replaceWith: '_' });
  next();
});

server.use(hpp()); // Protect against HTTP Parameter Pollution attacks

server.use(cors());
server.use(express.json({ limit: '10mb' }));
server.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Log all requests for metrics
server.use((req, res, next) => {
  if (!req.path.startsWith('/api/benchmark')) {
    logRequest({
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      path: req.path
    });
  }
  next();
});

// Benchmark routes (without bot protection)
server.use("/api/benchmark", benchmarkRoutes);

// Apply SQL injection protection before rate limiting
server.use(sqlInjectionCheck);

// Apply rate limiting to API endpoints (but not health/root)
server.use('/api', apiRateLimit);

// Apply bot detection middleware to all routes
server.use(detectHeadlessBrowser);
server.use(analyzeIP);
server.use(deviceFingerprinting);
server.use(botDetection);

const PORT = process.env.PORT || 5000;
server.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// MongoDB connection with graceful error handling
let dbConnected = false;
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log(`✅ NextBuy database connected successfully`);
      dbConnected = true;
    })
    .catch((err) => {
      console.warn(`⚠️ Database connection failed: ${err.message}`);
      console.log(`📝 Running in memory-only mode. Bot metrics will be stored temporarily.`);
      dbConnected = false;
    });
} else {
  console.log(`📝 No MongoDB URI found. Running in memory-only mode.`);
}

// Apply stricter rate limiting to auth routes
server.use("/api/auth", authRateLimit, authRoutes);

// Bot protection routes
server.use("/api/bot-protection", botProtectionRoutes);

// Admin routes for bot metrics and dashboard
server.use("/api/admin", adminRoutes);

// Product routes
server.use("/api/products", productRoutes);

// Benchmark routes (without bot protection)

// Add root endpoint and health check
server.get('/', (req, res) => {
  res.json({
    message: 'NextBuy Server is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      dashboard: `/api/admin/bot-dashboard`,
      metrics: `/api/admin/bot-metrics`,
      auth: `/api/auth`,
      botProtection: `/api/bot-protection`
    }
  });
});

server.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`NextBuy Server running on port ${PORT}`);
  console.log(`Bot metrics dashboard available at: http://localhost:${PORT}/api/admin/bot-dashboard`);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
});
