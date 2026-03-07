import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import apiRoutes from './routes';
import { notFound, globalErrorHandler } from './middlewares/errorMiddleware';
import { logger } from './utils/logger';

const app = express();

// ── Security middleware ────────────────────────────────────────────────────────
app.use(helmet());
app.use(mongoSanitize());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
  })
);

// Stricter limit for auth endpoints
app.use(
  '/api/v1/auth',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, message: 'Too many auth attempts' } })
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── HTTP logging ──────────────────────────────────────────────────────────────
app.use(morgan('combined', { stream: { write: (msg) => logger.http(msg.trim()) } }));

// ── Health probe ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', env: env.NODE_ENV }));

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/v1', apiRoutes);

// ── Error handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(globalErrorHandler);

export default app;
