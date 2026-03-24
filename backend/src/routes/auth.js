import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { sql } from '../lib/db.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, referral_code } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    // Check if email already exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()}`;
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Este email ya está registrado' });
    }

    // Validate referral code if provided
    let referredBy = null;
    if (referral_code) {
      const referrer = await sql`SELECT id FROM users WHERE referral_code = ${referral_code.toUpperCase()} AND is_active = true`;
      if (referrer.length === 0) {
        return res.status(400).json({ error: 'Código de referido inválido o inactivo' });
      }
      referredBy = referral_code.toUpperCase();
    }

    const password_hash = await bcrypt.hash(password, 12);
    const myReferralCode = nanoid(8).toUpperCase();

    const [user] = await sql`
      INSERT INTO users (name, email, password_hash, referral_code, referred_by)
      VALUES (${name.trim()}, ${email.toLowerCase()}, ${password_hash}, ${myReferralCode}, ${referredBy})
      RETURNING id, name, email, referral_code, is_active, is_admin, created_at
    `;

    res.status(201).json({
      message: 'Registro exitoso. Para activar tu cuenta, realiza el pago de Q50.00 y envía el comprobante vía WhatsApp.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        referral_code: user.referral_code,
        is_active: user.is_active,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const [user] = await sql`
      SELECT id, name, email, password_hash, referral_code, is_active, is_admin
      FROM users WHERE email = ${email.toLowerCase()}
    `;

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, is_admin: user.is_admin, is_active: user.is_active },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        referral_code: user.referral_code,
        is_active: user.is_active,
        is_admin: user.is_admin,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No autorizado' });
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [user] = await sql`
      SELECT id, name, email, referral_code, is_active, is_admin, created_at
      FROM users WHERE id = ${decoded.id}
    `;
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ user });
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
});

export default router;
