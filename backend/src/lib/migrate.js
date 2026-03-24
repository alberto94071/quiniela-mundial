import { sql } from './db.js';

async function migrate() {
  console.log('🚀 Running database migrations...');

  await sql`
    CREATE TABLE IF NOT EXISTS users (
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
  console.log('✅ Table: users');

  await sql`
    CREATE TABLE IF NOT EXISTS matches (
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
  console.log('✅ Table: matches');

  await sql`
    CREATE TABLE IF NOT EXISTS predictions (
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
  console.log('✅ Table: predictions');

  await sql`
    CREATE TABLE IF NOT EXISTS leaderboard_cache (
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
  console.log('✅ Table: leaderboard_cache');

  // Seed some World Cup 2026 group stage matches
  await sql`
    INSERT INTO matches (match_number, phase, home_team, away_team, home_flag, away_flag, match_date, venue)
    VALUES
      (1,  'Grupo A', 'México',     'USA',          '🇲🇽', '🇺🇸', '2026-06-11 19:00:00-06', 'Estadio Azteca, CDMX'),
      (2,  'Grupo A', 'Uruguay',    'Angola',       '🇺🇾', '🇦🇴', '2026-06-11 22:00:00-06', 'SoFi Stadium, LA'),
      (3,  'Grupo B', 'Brasil',     'Alemania',     '🇧🇷', '🇩🇪', '2026-06-12 16:00:00-06', 'MetLife Stadium, NY'),
      (4,  'Grupo B', 'Argentina',  'España',       '🇦🇷', '🇪🇸', '2026-06-12 19:00:00-06', 'AT&T Stadium, Dallas'),
      (5,  'Grupo C', 'Francia',    'Portugal',     '🇫🇷', '🇵🇹', '2026-06-13 16:00:00-06', 'BC Place, Vancouver'),
      (6,  'Grupo C', 'Inglaterra', 'Colombia',     '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🇨🇴', '2026-06-13 19:00:00-06', 'Levi Stadium, SF'),
      (7,  'Grupo D', 'Países Bajos','Marruecos',   '🇳🇱', '🇲🇦', '2026-06-14 16:00:00-06', 'Gillette Stadium, Boston'),
      (8,  'Grupo D', 'Italia',     'Ecuador',      '🇮🇹', '🇪🇨', '2026-06-14 19:00:00-06', 'Rose Bowl, LA'),
      (9,  'Grupo E', 'Canadá',     'Bélgica',      '🇨🇦', '🇧🇪', '2026-06-15 16:00:00-06', 'BMO Field, Toronto'),
      (10, 'Grupo E', 'Japón',      'Senegal',      '🇯🇵', '🇸🇳', '2026-06-15 19:00:00-06', 'NRG Stadium, Houston')
    ON CONFLICT DO NOTHING
  `;
  console.log('✅ Seeded: matches (World Cup 2026)');

  // Create admin user
  const bcrypt = await import('bcryptjs');
  const hash = await bcrypt.default.hash('Admin2026!', 12);
  await sql`
    INSERT INTO users (name, email, password_hash, referral_code, is_active, is_admin)
    VALUES ('Administrador', 'admin@quinielamundial.gt', ${hash}, 'ADMIN2026', true, true)
    ON CONFLICT (email) DO NOTHING
  `;
  console.log('✅ Seeded: admin user (email: admin@quinielamundial.gt / pass: Admin2026!)');

  console.log('\n🎉 Migration complete!');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
