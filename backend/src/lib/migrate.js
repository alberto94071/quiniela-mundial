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
      (1,  'Grupo A', 'Mexico', 'South Africa', '🇲🇽', '🇿🇦', '2026-06-11 13:00:00-06', 'Estadio Azteca, Mexico City'),
      (2,  'Grupo A', 'South Korea', 'Czech Republic', '🇰🇷', '🇨🇿', '2026-06-11 20:00:00-06', 'Estadio Akron, Guadalajara'),
      (3,  'Grupo A', 'Czech Republic', 'South Africa', '🇨🇿', '🇿🇦', '2026-06-18 12:00:00-05', 'Mercedes-Benz Stadium, Atlanta'),
      (4,  'Grupo A', 'Mexico', 'South Korea', '🇲🇽', '🇰🇷', '2026-06-18 20:00:00-06', 'Estadio Akron, Guadalajara'),
      (5,  'Grupo A', 'Czech Republic', 'Mexico', '🇨🇿', '🇲🇽', '2026-06-24 20:00:00-06', 'Estadio Azteca, Mexico City'),
      (6,  'Grupo A', 'South Africa', 'South Korea', '🇿🇦', '🇰🇷', '2026-06-24 20:00:00-06', 'Estadio BBVA, Monterrey'),
      (7,  'Grupo B', 'Canada', 'Bosnia and Herzegovina', '🇨🇦', '🇧🇦', '2026-06-12 15:00:00-05', 'BMO Field, Toronto'),
      (8,  'Grupo B', 'Qatar', 'Switzerland', '🇶🇦', '🇨🇭', '2026-06-13 12:00:00-05', 'Levi''s Stadium, Santa Clara'),
      (9,  'Grupo B', 'Switzerland', 'Bosnia and Herzegovina', '🇨🇭', '🇧🇦', '2026-06-18 18:00:00-05', 'SoFi Stadium, Inglewood'),
      (10, 'Grupo B', 'Canada', 'Qatar', '🇨🇦', '🇶🇦', '2026-06-18 21:00:00-05', 'BC Place, Vancouver'),
      (11, 'Grupo B', 'Switzerland', 'Canada', '🇨🇭', '🇨🇦', '2026-06-24 20:00:00-05', 'BC Place, Vancouver'),
      (12, 'Grupo B', 'Bosnia and Herzegovina', 'Qatar', '🇧🇦', '🇶🇦', '2026-06-24 20:00:00-05', 'Lumen Field, Seattle'),
      (13, 'Grupo C', 'Brazil', 'Morocco', '🇧🇷', '🇲🇦', '2026-06-13 18:00:00-05', 'MetLife Stadium, East Rutherford'),
      (14, 'Grupo C', 'Haiti', 'Scotland', '🇭🇹', '🏴', '2026-06-13 21:00:00-05', 'Gillette Stadium, Foxborough'),
      (15, 'Grupo C', 'Scotland', 'Morocco', '🏴', '🇲🇦', '2026-06-19 16:00:00-05', 'Gillette Stadium, Foxborough'),
      (16, 'Grupo C', 'Brazil', 'Haiti', '🇧🇷', '🇭🇹', '2026-06-19 20:00:00-05', 'Lincoln Financial Field, Philadelphia'),
      (17, 'Grupo C', 'Scotland', 'Brazil', '🏴', '🇧🇷', '2026-06-24 20:00:00-05', 'Hard Rock Stadium, Miami Gardens'),
      (18, 'Grupo C', 'Morocco', 'Haiti', '🇲🇦', '🇭🇹', '2026-06-24 20:00:00-05', 'Mercedes-Benz Stadium, Atlanta'),
      (19, 'Grupo D', 'United States', 'Paraguay', '🇺🇸', '🇵🇾', '2026-06-12 18:00:00-05', 'SoFi Stadium, Inglewood'),
      (20, 'Grupo D', 'Australia', 'Turkey', '🇦🇺', '🇹🇷', '2026-06-13 21:00:00-05', 'BC Place, Vancouver'),
      (21, 'Grupo D', 'Turkey', 'Paraguay', '🇹🇷', '🇵🇾', '2026-06-19 16:00:00-05', 'Lumen Field, Seattle'),
      (22, 'Grupo D', 'United States', 'Australia', '🇺🇸', '🇦🇺', '2026-06-19 20:00:00-05', 'Levi''s Stadium, Santa Clara'),
      (23, 'Grupo D', 'Turkey', 'United States', '🇹🇷', '🇺🇸', '2026-06-25 20:00:00-05', 'SoFi Stadium, Inglewood'),
      (24, 'Grupo D', 'Paraguay', 'Australia', '🇵🇾', '🇦🇺', '2026-06-25 20:00:00-05', 'Levi''s Stadium, Santa Clara'),
      (25, 'Grupo E', 'Germany', 'Curacao', '🇩🇪', '🇨🇼', '2026-06-14 12:00:00-05', 'NRG Stadium, Houston'),
      (26, 'Grupo E', 'Ivory Coast', 'Ecuador', '🇨🇮', '🇪🇨', '2026-06-14 19:00:00-05', 'Lincoln Financial Field, Philadelphia'),
      (27, 'Grupo E', 'Ecuador', 'Curacao', '🇪🇨', '🇨🇼', '2026-06-20 16:00:00-05', 'BMO Field, Toronto'),
      (28, 'Grupo E', 'Germany', 'Ivory Coast', '🇩🇪', '🇨🇮', '2026-06-20 20:00:00-05', 'Arrowhead Stadium, Kansas City'),
      (29, 'Grupo E', 'Ecuador', 'Germany', '🇪🇨', '🇩🇪', '2026-06-25 20:00:00-05', 'Lincoln Financial Field, Philadelphia'),
      (30, 'Grupo E', 'Curacao', 'Ivory Coast', '🇨🇼', '🇨🇮', '2026-06-25 20:00:00-05', 'MetLife Stadium, East Rutherford'),
      (31, 'Grupo F', 'Netherlands', 'Japan', '🇳🇱', '🇯🇵', '2026-06-14 15:00:00-05', 'AT&T Stadium, Arlington'),
      (32, 'Grupo F', 'Sweden', 'Tunisia', '🇸🇪', '🇹🇳', '2026-06-14 20:00:00-06', 'Estadio BBVA, Monterrey'),
      (33, 'Grupo F', 'Tunisia', 'Japan', '🇹🇳', '🇯🇵', '2026-06-20 12:00:00-05', 'NRG Stadium, Houston'),
      (34, 'Grupo F', 'Netherlands', 'Sweden', '🇳🇱', '🇸🇪', '2026-06-20 20:00:00-06', 'Estadio BBVA, Monterrey'),
      (35, 'Grupo F', 'Tunisia', 'Netherlands', '🇹🇳', '🇳🇱', '2026-06-25 16:00:00-05', 'AT&T Stadium, Arlington'),
      (36, 'Grupo F', 'Japan', 'Sweden', '🇯🇵', '🇸🇪', '2026-06-25 20:00:00-05', 'Arrowhead Stadium, Kansas City'),
      (37, 'Grupo G', 'Belgium', 'Egypt', '🇧🇪', '🇪🇬', '2026-06-15 15:00:00-05', 'Lumen Field, Seattle'),
      (38, 'Grupo G', 'Iran', 'New Zealand', '🇮🇷', '🇳🇿', '2026-06-15 19:00:00-05', 'SoFi Stadium, Inglewood'),
      (39, 'Grupo G', 'New Zealand', 'Egypt', '🇳🇿', '🇪🇬', '2026-06-21 15:00:00-05', 'SoFi Stadium, Inglewood'),
      (40, 'Grupo G', 'Belgium', 'Iran', '🇧🇪', '🇮🇷', '2026-06-21 19:00:00-05', 'BC Place, Vancouver'),
      (41, 'Grupo G', 'New Zealand', 'Belgium', '🇳🇿', '🇧🇪', '2026-06-26 16:00:00-05', 'Lumen Field, Seattle'),
      (42, 'Grupo G', 'Egypt', 'Iran', '🇪🇬', '🇮🇷', '2026-06-26 20:00:00-05', 'BC Place, Vancouver'),
      (43, 'Grupo H', 'Spain', 'Cape Verde', '🇪🇸', '🇨🇻', '2026-06-15 16:00:00-05', 'Mercedes-Benz Stadium, Atlanta'),
      (44, 'Grupo H', 'Saudi Arabia', 'Uruguay', '🇸🇦', '🇺🇾', '2026-06-15 20:00:00-05', 'Hard Rock Stadium, Miami Gardens'),
      (45, 'Grupo H', 'Uruguay', 'Cape Verde', '🇺🇾', '🇨🇻', '2026-06-21 16:00:00-05', 'Mercedes-Benz Stadium, Atlanta'),
      (46, 'Grupo H', 'Spain', 'Saudi Arabia', '🇪🇸', '🇸🇦', '2026-06-21 20:00:00-05', 'Hard Rock Stadium, Miami Gardens'),
      (47, 'Grupo H', 'Uruguay', 'Spain', '🇺🇾', '🇪🇸', '2026-06-26 16:00:00-05', 'NRG Stadium, Houston'),
      (48, 'Grupo H', 'Cape Verde', 'Saudi Arabia', '🇨🇻', '🇸🇦', '2026-06-26 20:00:00-06', 'Estadio Akron, Guadalajara'),
      (49, 'Grupo I', 'France', 'Senegal', '🇫🇷', '🇸🇳', '2026-06-16 16:00:00-05', 'MetLife Stadium, East Rutherford'),
      (50, 'Grupo I', 'Iraq', 'Norway', '🇮🇶', '🇳🇴', '2026-06-16 20:00:00-05', 'Gillette Stadium, Foxborough'),
      (51, 'Grupo I', 'Norway', 'Senegal', '🇳🇴', '🇸🇳', '2026-06-22 16:00:00-05', 'Lincoln Financial Field, Philadelphia'),
      (52, 'Grupo I', 'France', 'Iraq', '🇫🇷', '🇮🇶', '2026-06-22 20:00:00-05', 'MetLife Stadium, East Rutherford'),
      (53, 'Grupo I', 'Norway', 'France', '🇳🇴', '🇫🇷', '2026-06-26 16:00:00-05', 'Gillette Stadium, Foxborough'),
      (54, 'Grupo I', 'Senegal', 'Iraq', '🇸🇳', '🇮🇶', '2026-06-26 20:00:00-05', 'BMO Field, Toronto'),
      (55, 'Grupo J', 'Argentina', 'Algeria', '🇦🇷', '🇩🇿', '2026-06-16 16:00:00-05', 'Arrowhead Stadium, Kansas City'),
      (56, 'Grupo J', 'Austria', 'Jordan', '🇦🇹', '🇯🇴', '2026-06-16 20:00:00-05', 'Levi''s Stadium, Santa Clara'),
      (57, 'Grupo J', 'Jordan', 'Algeria', '🇯🇴', '🇩🇿', '2026-06-22 16:00:00-05', 'AT&T Stadium, Arlington'),
      (58, 'Grupo J', 'Argentina', 'Austria', '🇦🇷', '🇦🇹', '2026-06-22 20:00:00-05', 'Levi''s Stadium, Santa Clara'),
      (59, 'Grupo J', 'Jordan', 'Argentina', '🇯🇴', '🇦🇷', '2026-06-27 16:00:00-05', 'Arrowhead Stadium, Kansas City'),
      (60, 'Grupo J', 'Algeria', 'Austria', '🇩🇿', '🇦🇹', '2026-06-27 20:00:00-05', 'AT&T Stadium, Arlington'),
      (61, 'Grupo K', 'Portugal', 'DR Congo', '🇵🇹', '🇨🇩', '2026-06-17 12:00:00-05', 'NRG Stadium, Houston'),
      (62, 'Grupo K', 'Uzbekistan', 'Colombia', '🇺🇿', '🇨🇴', '2026-06-17 19:00:00-06', 'Estadio Azteca, Mexico City'),
      (63, 'Grupo K', 'Colombia', 'DR Congo', '🇨🇴', '🇨🇩', '2026-06-23 12:00:00-05', 'NRG Stadium, Houston'),
      (64, 'Grupo K', 'Portugal', 'Uzbekistan', '🇵🇹', '🇺🇿', '2026-06-23 20:00:00-06', 'Estadio Akron, Guadalajara'),
      (65, 'Grupo K', 'Colombia', 'Portugal', '🇨🇴', '🇵🇹', '2026-06-27 16:00:00-05', 'Hard Rock Stadium, Miami Gardens'),
      (66, 'Grupo K', 'DR Congo', 'Uzbekistan', '🇨🇩', '🇺🇿', '2026-06-27 20:00:00-05', 'Mercedes-Benz Stadium, Atlanta'),
      (67, 'Grupo L', 'England', 'Croatia', '🏴', '🇭🇷', '2026-06-17 15:00:00-05', 'AT&T Stadium, Arlington'),
      (68, 'Grupo L', 'Ghana', 'Panama', '🇬🇭', '🇵🇦', '2026-06-17 18:00:00-05', 'BMO Field, Toronto'),
      (69, 'Grupo L', 'Panama', 'Croatia', '🇵🇦', '🇭🇷', '2026-06-23 16:00:00-05', 'Gillette Stadium, Foxborough'),
      (70, 'Grupo L', 'England', 'Ghana', '🏴', '🇬🇭', '2026-06-23 19:00:00-05', 'BMO Field, Toronto'),
      (71, 'Grupo L', 'Panama', 'England', '🇵🇦', '🏴', '2026-06-27 16:00:00-05', 'MetLife Stadium, East Rutherford'),
      (72, 'Grupo L', 'Croatia', 'Ghana', '🇭🇷', '🇬🇭', '2026-06-27 20:00:00-05', 'Lincoln Financial Field, Philadelphia')
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
