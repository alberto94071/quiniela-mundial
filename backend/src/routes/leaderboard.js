import express from 'express';
import { sql } from '../lib/db.js';

const router = express.Router();

// GET /api/leaderboard - public leaderboard
router.get('/', async (req, res) => {
  try {
    const leaderboard = await sql`
      SELECT
        lc.rank,
        lc.total_points,
        lc.exact_scores,
        lc.result_hits,
        lc.valid_referrals,
        u.name,
        u.referral_code
      FROM leaderboard_cache lc
      JOIN users u ON u.id = lc.user_id
      ORDER BY lc.rank ASC
      LIMIT 100
    `;

    // Calculate prize pool
    const [countRow] = await sql`SELECT COUNT(*) AS total FROM users WHERE is_active = true AND is_admin = false`;
    const totalPlayers = parseInt(countRow.total);
    const totalPot = totalPlayers * 50; // Q50 per player
    const prizes = {
      total_pot: totalPot,
      admin_cut: Math.round(totalPot * 0.30),
      first_place: Math.round(totalPot * 0.40),
      second_place: Math.round(totalPot * 0.20),
      third_place: Math.round(totalPot * 0.10),
      total_players: totalPlayers,
    };

    res.json({ leaderboard, prizes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener tabla de posiciones' });
  }
});

export default router;
