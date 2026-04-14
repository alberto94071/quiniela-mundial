import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { sql } from './db.js';

async function resetDatabase() {
  const rl = readline.createInterface({ input, output });

  try {
    const confirmation = await rl.question('¿Estás seguro? Escribe RESET para confirmar: ');
    if (confirmation.trim() !== 'RESET') {
      console.log('Operación cancelada.');
      process.exit(0);
    }

    await sql`DROP TABLE IF EXISTS leaderboard_cache CASCADE`;
    await sql`DROP TABLE IF EXISTS predictions CASCADE`;
    await sql`DROP TABLE IF EXISTS matches CASCADE`;
    await sql`DROP TABLE IF EXISTS users CASCADE`;
    console.log('Tablas eliminadas.');

    await sql`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        referral_code VARCHAR(10) UNIQUE NOT NULL,
        referred_by VARCHAR(10),
        is_active BOOLEAN DEFAULT FALSE,
        is_admin BOOLEAN DEFAULT FALSE,
        payment_proof_url TEXT,
        payment_status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE matches (
        id SERIAL PRIMARY KEY,
        match_number INTEGER NOT NULL,
        phase VARCHAR(50) NOT NULL,
        home_team VARCHAR(60) NOT NULL,
        away_team VARCHAR(60) NOT NULL,
        home_flag VARCHAR(10),
        away_flag VARCHAR(10),
        match_date TIMESTAMPTZ NOT NULL,
        venue VARCHAR(100),
        home_score INTEGER,
        away_score INTEGER,
        status VARCHAR(20) DEFAULT 'upcoming',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE predictions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
        home_score INTEGER NOT NULL,
        away_score INTEGER NOT NULL,
        points_earned INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, match_id)
      )
    `;

    await sql`
      CREATE TABLE leaderboard_cache (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        total_points INTEGER DEFAULT 0,
        exact_scores INTEGER DEFAULT 0,
        result_hits INTEGER DEFAULT 0,
        valid_referrals INTEGER DEFAULT 0,
        rank INTEGER,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    console.log('Base de datos reseteada y tablas recreadas.');
  } finally {
    rl.close();
  }
}

resetDatabase().catch((err) => {
  console.error('Error al resetear la base de datos:', err);
  process.exit(1);
});
