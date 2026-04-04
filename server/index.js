import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import http from 'http';
import { connectDB } from './src/config/db.js';
import authRoutes from './src/routes/auth.js';
import reminderRoutes from './src/routes/reminders.js';
import adminRoutes from './src/routes/admin.js';
import ttsRoutes from './src/routes/tts.js';
import { errorHandler, notFound } from './src/middleware/errorHandler.js';
import { startAllAgents } from './src/agents/agentRunner.js';

const app = express();
const PORT = process.env.PORT || 5000;

/* ── Security & middleware ── */
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true,
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, please try again later.' },
});
app.use('/api/auth/', authLimiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

/* ── Routes ── */
app.use('/api/auth', authRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tts', ttsRoutes);

app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'Chronos API', uptime: process.uptime() });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.use(notFound);
app.use(errorHandler);

/* ── Keep-alive self-ping (prevents free-tier sleep) ── */
let keepAliveTimer = null;

function startKeepAlive() {
  const interval = 13 * 60 * 1000; // 13 min — safely under Render's 15-min sleep threshold
  const host = process.env.SERVER_URL || `http://localhost:${PORT}`;

  keepAliveTimer = setInterval(() => {
    const url = new URL('/api/health', host);
    const req = http.get(url.toString(), (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        console.log(`[KeepAlive] ping → ${res.statusCode} at ${new Date().toISOString()}`);
      });
    });
    req.on('error', err => console.warn('[KeepAlive] ping failed:', err.message));
    req.setTimeout(8000, () => { req.destroy(); console.warn('[KeepAlive] ping timeout'); });
  }, interval);

  console.log('[KeepAlive] Self-ping every 13 min to stay awake.');
}

/* ── Graceful shutdown ── */
let httpServer = null;

function gracefulShutdown(signal) {
  console.log(`\n[Server] ${signal} received — shutting down gracefully…`);
  if (keepAliveTimer) clearInterval(keepAliveTimer);
  if (httpServer) {
    httpServer.close(() => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
    // Force exit after 10 s if connections don't drain
    setTimeout(() => {
      console.error('[Server] Force exit after 10s timeout.');
      process.exit(1);
    }, 10_000).unref();
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));

/* ── Crash safety ── */
process.on('uncaughtException', err => {
  console.error('[Uncaught Exception]', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection]', reason);
  // Don't exit — log and continue
});

/* ── Boot ── */
connectDB().then(() => {
  httpServer = app.listen(PORT, () => {
    console.log(`\x1b[36m🚀 Chronos server running on port ${PORT}\x1b[0m`);
    console.log(`   ENV: ${process.env.NODE_ENV || 'development'}`);
  });

  startAllAgents();

  // Only self-ping in production to avoid noise locally
  if (process.env.NODE_ENV === 'production') {
    startKeepAlive();
  }
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err.message);
  process.exit(1);
});
