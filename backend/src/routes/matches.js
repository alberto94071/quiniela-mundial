import express from 'express';
import { sql } from '../lib/db.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/matches - all matches (public)
router.get('/', async (req, res) => {
  try {
    const matches = await sql`
      SELECT id, match_number, phase, home_team, away_team, home_flag, away_flag,
             match_date, venue, home_score, away_score, status
      FROM matches
      ORDER BY match_date ASC
    `;
    res.json({ matches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener partidos' });
  }
});

// GET /api/matches/:id - single match
router.get('/:id', async (req, res) => {
  try {
    const [match] = await sql`
      SELECT * FROM matches WHERE id = ${req.params.id}
    `;
    if (!match) return res.status(404).json({ error: 'Partido no encontrado' });
    res.json({ match });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener partido' });
  }
});

// POST /api/matches - admin creates a match
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { match_number, phase, home_team, away_team, home_flag, away_flag, match_date, venue } = req.body;

    if (!match_number || !phase || !home_team || !away_team || !match_date) {
      return res.status(400).json({ error: 'Datos del partido incompletos' });
    }

    const [match] = await sql`
      INSERT INTO matches (match_number, phase, home_team, away_team, home_flag, away_flag, match_date, venue)
      VALUES (${match_number}, ${phase}, ${home_team}, ${away_team}, ${home_flag || ''}, ${away_flag || ''}, ${match_date}, ${venue || ''})
      RETURNING *
    `;
    res.status(201).json({ match });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear partido' });
  }
});

// PATCH /api/matches/:id/result - admin sets result and triggers point calculation
router.patch('/:id/result', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { home_score, away_score } = req.body;

    if (home_score === undefined || away_score === undefined) {
      return res.status(400).json({ error: 'Se requieren home_score y away_score' });
    }

    const [match] = await sql`
      UPDATE matches
      SET home_score = ${home_score}, away_score = ${away_score}, status = 'finished', updated_at = NOW()
      WHERE id = ${req.params.id}
      RETURNING *
    `;

    if (!match) return res.status(404).json({ error: 'Partido no encontrado' });

    // Calculate points for all predictions of this match
    const predictions = await sql`
      SELECT id, user_id, home_score AS pred_home, away_score AS pred_away
      FROM predictions WHERE match_id = ${req.params.id}
    `;

    for (const pred of predictions) {
      let points = 0;

      // Determine actual result
      const actualResult = home_score > away_score ? 'home' : away_score > home_score ? 'away' : 'draw';
      const predResult = pred.pred_home > pred.pred_away ? 'home' : pred.pred_away > pred.pred_home ? 'away' : 'draw';

      if (actualResult === predResult) {
        points += 3; // correct result
        if (pred.pred_home === home_score && pred.pred_away === away_score) {
          points += 2; // exact score bonus
        }
      }

      await sql`
        UPDATE predictions SET points_earned = ${points}, updated_at = NOW()
        WHERE id = ${pred.id}
      `;
    }

    // Rebuild leaderboard cache
    await rebuildLeaderboard();

    res.json({ match, message: `Resultado cargado. ${predictions.length} pronósticos actualizados.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al cargar resultado' });
  }
});

async function rebuildLeaderboard() {
  // Get all active users with their stats
  const stats = await sql`
    SELECT
      u.id AS user_id,
      COALESCE(SUM(p.points_earned), 0) AS total_points,
      COALESCE(SUM(CASE WHEN p.points_earned = 5 THEN 1 ELSE 0 END), 0) AS exact_scores,
      COALESCE(SUM(CASE WHEN p.points_earned >= 3 THEN 1 ELSE 0 END), 0) AS result_hits,
      (SELECT COUNT(*) FROM users r WHERE r.referred_by = u.referral_code AND r.is_active = true) AS valid_referrals
    FROM users u
    LEFT JOIN predictions p ON p.user_id = u.id
    WHERE u.is_active = true AND u.is_admin = false
    GROUP BY u.id, u.referral_code
  `;

  for (const s of stats) {
    await sql`
      INSERT INTO leaderboard_cache (user_id, total_points, exact_scores, result_hits, valid_referrals)
      VALUES (${s.user_id}, ${s.total_points}, ${s.exact_scores}, ${s.result_hits}, ${s.valid_referrals})
      ON CONFLICT (user_id) DO UPDATE SET
        total_points = ${s.total_points},
        exact_scores = ${s.exact_scores},
        result_hits = ${s.result_hits},
        valid_referrals = ${s.valid_referrals},
        updated_at = NOW()
    `;
  }

  // Assign ranks (order: points DESC, referrals DESC, exact_scores DESC)
  const ranked = await sql`
    SELECT id FROM leaderboard_cache
    ORDER BY total_points DESC, valid_referrals DESC, exact_scores DESC
  `;
  for (let i = 0; i < ranked.length; i++) {
    await sql`UPDATE leaderboard_cache SET rank = ${i + 1} WHERE id = ${ranked[i].id}`;
  }
}

export { rebuildLeaderboard };
export default router;
