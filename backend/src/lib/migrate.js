import { sql } from './db.js';

async function migrate() {
  console.log('Running database migrations...');

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
  console.log('Table created: users');

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
  console.log('Table created: matches');

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
  console.log('Table created: predictions');

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
  console.log('Table created: leaderboard_cache');

  await sql`
    INSERT INTO matches (match_number, phase, home_team, away_team, home_flag, away_flag, match_date, venue)
    VALUES
      (1,  'Grupo A', 'Mexico', 'Por definir', '🇲🇽', '🏳️', '2026-06-11 19:00:00-06', 'Estadio Azteca, CDMX'),
      (2,  'Grupo A', 'Ecuador', 'Suiza', '🇪🇨', '🇨🇭', '2026-06-12 16:00:00-06', 'Estadio BBVA, Monterrey'),
      (3,  'Grupo A', 'Mexico', 'Ecuador', '🇲🇽', '🇪🇨', '2026-06-16 19:00:00-06', 'Estadio Jalisco, Guadalajara'),
      (4,  'Grupo A', 'Suiza', 'Por definir', '🇨🇭', '🏳️', '2026-06-17 16:00:00-06', 'Estadio Akron, Guadalajara'),
      (5,  'Grupo B', 'Estados Unidos', 'Canada', '🇺🇸', '🇨🇦', '2026-06-12 19:00:00-05', 'MetLife Stadium, NY/NJ'),
      (6,  'Grupo B', 'Costa Rica', 'Panama', '🇨🇷', '🇵🇦', '2026-06-13 15:00:00-05', 'AT&T Stadium, Dallas'),
      (7,  'Grupo B', 'Estados Unidos', 'Costa Rica', '🇺🇸', '🇨🇷', '2026-06-17 20:00:00-05', 'SoFi Stadium, LA'),
      (8,  'Grupo B', 'Canada', 'Panama', '🇨🇦', '🇵🇦', '2026-06-18 18:00:00-05', 'BMO Field, Toronto'),
      (9,  'Grupo C', 'Brasil', 'Uruguay', '🇧🇷', '🇺🇾', '2026-06-13 20:00:00-05', 'Hard Rock Stadium, Miami'),
      (10, 'Grupo C', 'Colombia', 'Peru', '🇨🇴', '🇵🇪', '2026-06-14 15:00:00-05', 'NRG Stadium, Houston'),
      (11, 'Grupo C', 'Brasil', 'Colombia', '🇧🇷', '🇨🇴', '2026-06-18 21:00:00-05', 'Rose Bowl, LA'),
      (12, 'Grupo C', 'Uruguay', 'Peru', '🇺🇾', '🇵🇪', '2026-06-19 18:00:00-05', 'Arrowhead Stadium, Kansas City'),
      (13, 'Grupo D', 'Argentina', 'Chile', '🇦🇷', '🇨🇱', '2026-06-14 20:00:00-05', 'Levi''s Stadium, SF'),
      (14, 'Grupo D', 'Paraguay', 'Venezuela', '🇵🇾', '🇻🇪', '2026-06-15 16:00:00-05', 'Lumen Field, Seattle'),
      (15, 'Grupo D', 'Argentina', 'Paraguay', '🇦🇷', '🇵🇾', '2026-06-19 20:00:00-05', 'Lincoln Financial Field, Philadelphia'),
      (16, 'Grupo D', 'Chile', 'Venezuela', '🇨🇱', '🇻🇪', '2026-06-20 16:00:00-05', 'Bank of America Stadium, Charlotte'),
      (17, 'Grupo E', 'Espana', 'Portugal', '🇪🇸', '🇵🇹', '2026-06-15 20:00:00-05', 'Gillette Stadium, Boston'),
      (18, 'Grupo E', 'Francia', 'Alemania', '🇫🇷', '🇩🇪', '2026-06-16 17:00:00-05', 'BC Place, Vancouver'),
      (19, 'Grupo E', 'Espana', 'Francia', '🇪🇸', '🇫🇷', '2026-06-20 20:00:00-05', 'MetLife Stadium, NY/NJ'),
      (20, 'Grupo E', 'Portugal', 'Alemania', '🇵🇹', '🇩🇪', '2026-06-21 18:00:00-05', 'AT&T Stadium, Dallas'),
      (21, 'Grupo F', 'Inglaterra', 'Paises Bajos', '🏴', '🇳🇱', '2026-06-16 20:00:00-05', 'SoFi Stadium, LA'),
      (22, 'Grupo F', 'Croacia', 'Serbia', '🇭🇷', '🇷🇸', '2026-06-17 17:00:00-05', 'NRG Stadium, Houston'),
      (23, 'Grupo F', 'Inglaterra', 'Croacia', '🏴', '🇭🇷', '2026-06-21 20:00:00-05', 'Rose Bowl, LA'),
      (24, 'Grupo F', 'Paises Bajos', 'Serbia', '🇳🇱', '🇷🇸', '2026-06-22 18:00:00-05', 'Levi''s Stadium, SF'),
      (25, 'Grupo G', 'Italia', 'Belgica', '🇮🇹', '🇧🇪', '2026-06-17 20:00:00-05', 'Arrowhead Stadium, Kansas City'),
      (26, 'Grupo G', 'Suecia', 'Dinamarca', '🇸🇪', '🇩🇰', '2026-06-18 16:00:00-05', 'Lumen Field, Seattle'),
      (27, 'Grupo G', 'Italia', 'Suecia', '🇮🇹', '🇸🇪', '2026-06-22 20:00:00-05', 'Hard Rock Stadium, Miami'),
      (28, 'Grupo G', 'Belgica', 'Dinamarca', '🇧🇪', '🇩🇰', '2026-06-23 18:00:00-05', 'Gillette Stadium, Boston'),
      (29, 'Grupo H', 'Marruecos', 'Senegal', '🇲🇦', '🇸🇳', '2026-06-18 20:00:00-05', 'Bank of America Stadium, Charlotte'),
      (30, 'Grupo H', 'Egipto', 'Nigeria', '🇪🇬', '🇳🇬', '2026-06-19 16:00:00-05', 'Lincoln Financial Field, Philadelphia'),
      (31, 'Grupo H', 'Marruecos', 'Egipto', '🇲🇦', '🇪🇬', '2026-06-23 20:00:00-05', 'BMO Field, Toronto'),
      (32, 'Grupo H', 'Senegal', 'Nigeria', '🇸🇳', '🇳🇬', '2026-06-24 18:00:00-05', 'BC Place, Vancouver'),
      (33, 'Grupo I', 'Japon', 'Corea del Sur', '🇯🇵', '🇰🇷', '2026-06-19 20:00:00-05', 'Estadio Azteca, CDMX'),
      (34, 'Grupo I', 'Iran', 'Arabia Saudita', '🇮🇷', '🇸🇦', '2026-06-20 16:00:00-05', 'Estadio BBVA, Monterrey'),
      (35, 'Grupo I', 'Japon', 'Iran', '🇯🇵', '🇮🇷', '2026-06-24 20:00:00-05', 'Estadio Jalisco, Guadalajara'),
      (36, 'Grupo I', 'Corea del Sur', 'Arabia Saudita', '🇰🇷', '🇸🇦', '2026-06-25 18:00:00-05', 'Estadio Akron, Guadalajara'),
      (37, 'Grupo J', 'Australia', 'Nueva Zelanda', '🇦🇺', '🇳🇿', '2026-06-20 20:00:00-05', 'MetLife Stadium, NY/NJ'),
      (38, 'Grupo J', 'Camerun', 'Ghana', '🇨🇲', '🇬🇭', '2026-06-21 16:00:00-05', 'AT&T Stadium, Dallas'),
      (39, 'Grupo J', 'Australia', 'Camerun', '🇦🇺', '🇨🇲', '2026-06-25 20:00:00-05', 'SoFi Stadium, LA'),
      (40, 'Grupo J', 'Nueva Zelanda', 'Ghana', '🇳🇿', '🇬🇭', '2026-06-26 18:00:00-05', 'NRG Stadium, Houston'),
      (41, 'Grupo K', 'Croacia', 'Suiza', '🇭🇷', '🇨🇭', '2026-06-21 20:00:00-05', 'Levi''s Stadium, SF'),
      (42, 'Grupo K', 'Ucrania', 'Polonia', '🇺🇦', '🇵🇱', '2026-06-22 16:00:00-05', 'Rose Bowl, LA'),
      (43, 'Grupo K', 'Croacia', 'Ucrania', '🇭🇷', '🇺🇦', '2026-06-26 20:00:00-05', 'Arrowhead Stadium, Kansas City'),
      (44, 'Grupo K', 'Suiza', 'Polonia', '🇨🇭', '🇵🇱', '2026-06-27 18:00:00-05', 'Gillette Stadium, Boston'),
      (45, 'Grupo L', 'Mexico', 'Canada', '🇲🇽', '🇨🇦', '2026-06-22 20:00:00-06', 'Estadio Azteca, CDMX'),
      (46, 'Grupo L', 'Estados Unidos', 'Por definir', '🇺🇸', '🏳️', '2026-06-23 16:00:00-05', 'BMO Field, Toronto'),
      (47, 'Grupo L', 'Mexico', 'Estados Unidos', '🇲🇽', '🇺🇸', '2026-06-27 20:00:00-06', 'Estadio BBVA, Monterrey'),
      (48, 'Grupo L', 'Canada', 'Por definir', '🇨🇦', '🏳️', '2026-06-28 18:00:00-05', 'BC Place, Vancouver')
    ON CONFLICT DO NOTHING
  `;
  console.log('Seed complete: matches (World Cup 2026)');

  const bcrypt = await import('bcryptjs');
  const hash = await bcrypt.default.hash('Admin2026!', 12);
  await sql`
    INSERT INTO users (name, email, password_hash, referral_code, is_active, is_admin)
    VALUES ('Administrador', 'admin@quinielamundial.gt', ${hash}, 'ADMIN2026', true, true)
    ON CONFLICT (email) DO NOTHING
  `;
  console.log('Seed complete: admin user (email: admin@quinielamundial.gt / pass: Admin2026!)');

  console.log('\nMigration complete!');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
