import express from 'express';
import { sql } from '../lib/db.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

// GET /api/admin/users - list all users
router.get('/users', async (req, res) => {
  try {
    const users = await sql`
      SELECT
        u.id, u.name, u.email, u.referral_code, u.referred_by,
        u.is_active, u.is_admin, u.payment_status, u.created_at,
        (SELECT COUNT(*) FROM users r WHERE r.referred_by = u.referral_code AND r.is_active = true) AS valid_referrals,
        (SELECT COALESCE(SUM(p.points_earned), 0) FROM predictions p WHERE p.user_id = u.id) AS total_points
      FROM users u
      WHERE u.is_admin = false
      ORDER BY u.created_at DESC
    `;
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// PATCH /api/admin/users/:id/activate - activate user account
router.patch('/users/:id/activate', async (req, res) => {
  try {
    const { is_active, payment_status } = req.body;
    const [user] = await sql`
      UPDATE users
      SET is_active = ${is_active}, payment_status = ${payment_status || 'confirmed'}, updated_at = NOW()
      WHERE id = ${req.params.id} AND is_admin = false
      RETURNING id, name, email, is_active, payment_status
    `;
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ user, message: `Cuenta ${is_active ? 'activada' : 'desactivada'} exitosamente` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// GET /api/admin/stats - dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [totals] = await sql`
      SELECT
        COUNT(*) FILTER (WHERE is_admin = false) AS total_users,
        COUNT(*) FILTER (WHERE is_active = true AND is_admin = false) AS active_users,
        COUNT(*) FILTER (WHERE is_active = false AND is_admin = false) AS pending_users
      FROM users
    `;

    const [matchStats] = await sql`
      SELECT
        COUNT(*) AS total_matches,
        COUNT(*) FILTER (WHERE status = 'finished') AS finished_matches,
        COUNT(*) FILTER (WHERE status = 'upcoming') AS upcoming_matches
      FROM matches
    `;

    const [predStats] = await sql`SELECT COUNT(*) AS total_predictions FROM predictions`;

    const totalPot = parseInt(totals.active_users) * 50;

    res.json({
      users: totals,
      matches: matchStats,
      predictions: predStats,
      prize_pool: {
        total: totalPot,
        first: Math.round(totalPot * 0.40),
        second: Math.round(totalPot * 0.20),
        third: Math.round(totalPot * 0.10),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

export default router;
