import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import matchesRoutes from './routes/matches.js';
import predictionsRoutes from './routes/predictions.js';
import leaderboardRoutes from './routes/leaderboard.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isDevelopment = (process.env.NODE_ENV || 'development') !== 'production';

function isNeonConnectionError(err) {
  const msg = (err?.message || '').toLowerCase();
  const code = (err?.code || '').toString().toLowerCase();
  return (
    msg.includes('neon') ||
    msg.includes('fetch failed') ||
    msg.includes('connection') ||
    msg.includes('connect') ||
    code.includes('econn') ||
    code.includes('57p01')
  );
}

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    const exactOrigins = new Set([
      process.env.FRONTEND_URL,
    ].filter(Boolean));

    if (isDevelopment) {
      exactOrigins.add('http://localhost:5173');
      exactOrigins.add('http://localhost:4173');
    }

    if (exactOrigins.has(origin)) return callback(null, true);

    try {
      const parsedOrigin = new URL(origin);
      if (parsedOrigin.hostname.endsWith('.pages.dev')) {
        return callback(null, true);
      }
    } catch {
      return callback(new Error('Origen inválido para CORS'));
    }

    return callback(new Error('No permitido por CORS'));
  },
  credentials: true,
};

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes, intenta más tarde.' },
});

// CORS
app.use(cors(corsOptions));
app.use(helmet());
app.use(globalLimiter);

app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/predictions', predictionsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (isNeonConnectionError(err)) {
    return res.status(503).json({ error: 'Servidor temporalmente no disponible, intenta de nuevo' });
  }
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`🌍 Quiniela Mundial 2026 API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
