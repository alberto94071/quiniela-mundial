import express from 'express';
import { sql } from '../lib/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/predictions/my - get logged-in user's predictions
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const predictions = await sql`
      SELECT p.*, m.home_team, m.away_team, m.home_flag, m.away_flag,
             m.match_date, m.status, m.home_score AS match_home, m.away_score AS match_away
      FROM predictions p
      JOIN matches m ON m.id = p.match_id
      WHERE p.user_id = ${req.user.id}
      ORDER BY m.match_date ASC
    `;
    res.json({ predictions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener pronósticos' });
  }
});

// POST /api/predictions - create or update a prediction
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (!req.user.is_active) {
      return res.status(403).json({ error: 'Tu cuenta no está activa. Realiza el pago de Q50 para participar.' });
    }

    const { match_id, home_score, away_score } = req.body;

    if (!match_id || home_score === undefined || away_score === undefined) {
      return res.status(400).json({ error: 'match_id, home_score y away_score son requeridos' });
    }

    if (home_score < 0 || away_score < 0 || home_score > 30 || away_score > 30) {
      return res.status(400).json({ error: 'Marcador inválido' });
    }

    // Check if match exists and is still open (5 min before kickoff)
    const [match] = await sql`SELECT * FROM matches WHERE id = ${match_id}`;
    if (!match) return res.status(404).json({ error: 'Partido no encontrado' });

    if (match.status === 'finished') {
      return res.status(400).json({ error: 'Este partido ya terminó' });
    }

    const kickoff = new Date(match.match_date);
    const cutoff = new Date(kickoff.getTime() - 5 * 60 * 1000); // 5 min before
    if (new Date() >= cutoff) {
      return res.status(400).json({ error: 'El plazo para pronósticos de este partido ya cerró (5 min antes del pitazo)' });
    }

    // Upsert prediction
    const [prediction] = await sql`
      INSERT INTO predictions (user_id, match_id, home_score, away_score)
      VALUES (${req.user.id}, ${match_id}, ${home_score}, ${away_score})
      ON CONFLICT (user_id, match_id) DO UPDATE SET
        home_score = ${home_score},
        away_score = ${away_score},
        updated_at = NOW()
      RETURNING *
    `;

    res.json({ prediction, message: 'Pronóstico guardado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar pronóstico' });
  }
});

// GET /api/predictions/match/:matchId - after match, see all user predictions (public)
router.get('/match/:matchId', async (req, res) => {
  try {
    const [match] = await sql`SELECT status FROM matches WHERE id = ${req.params.matchId}`;
    if (!match) return res.status(404).json({ error: 'Partido no encontrado' });

    if (match.status !== 'finished') {
      return res.status(403).json({ error: 'Los pronósticos solo son visibles después del partido' });
    }

    const predictions = await sql`
      SELECT p.home_score, p.away_score, p.points_earned, u.name
      FROM predictions p
      JOIN users u ON u.id = p.user_id
      WHERE p.match_id = ${req.params.matchId}
      ORDER BY p.points_earned DESC
    `;
    res.json({ predictions });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener pronósticos' });
  }
});

export default router;
