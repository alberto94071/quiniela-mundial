import { Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import './Home.css';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb orb1"></div>
          <div className="hero-orb orb2"></div>
          <div className="pitch-lines"></div>
        </div>
        <div className="container hero-content">
          <div className="hero-badge fade-up">
            <span>🏆</span> Mundial 2026 · USA · Canadá · México
          </div>
          <h1 className="hero-title fade-up" style={{ animationDelay: '0.1s' }}>
            LA QUINIELA<br />
            <span className="title-accent">MUNDIALISTA</span>
          </h1>
          <p className="hero-sub fade-up" style={{ animationDelay: '0.2s' }}>
            Predice resultados, acumula puntos y compite por el pozo.<br />
            El conocimiento futbolero vale dinero.
          </p>
          <div className="hero-actions fade-up" style={{ animationDelay: '0.3s' }}>
            {user ? (
              <Link to="/partidos" className="btn btn-primary btn-lg">Ver Partidos ⚽</Link>
            ) : (
              <>
                <Link to="/registro" className="btn btn-primary btn-lg">Unirse Ahora</Link>
                <Link to="/login" className="btn btn-outline btn-lg">Ya tengo cuenta</Link>
              </>
            )}
          </div>
          <div className="hero-stats fade-up" style={{ animationDelay: '0.4s' }}>
            <div className="stat">
              <span className="stat-num">Q50</span>
              <span className="stat-label">Inscripción</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-num">5 pts</span>
              <span className="stat-label">Máx. por partido</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-num">70%</span>
              <span className="stat-label">Del pozo en premios</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-section">
        <div className="container">
          <h2 className="section-title">¿Cómo funciona?</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-num">01</div>
              <div className="step-icon">📝</div>
              <h3>Regístrate</h3>
              <p>Crea tu cuenta gratis. Paga Q50 y envía tu comprobante por WhatsApp para activarla en máximo 24h.</p>
            </div>
            <div className="step-card">
              <div className="step-num">02</div>
              <div className="step-icon">🎯</div>
              <h3>Pronostica</h3>
              <p>Ingresa tu marcador exacto para cada partido antes del pitazo inicial. Cierre: 5 minutos antes.</p>
            </div>
            <div className="step-card">
              <div className="step-num">03</div>
              <div className="step-icon">⭐</div>
              <h3>Acumula puntos</h3>
              <p>3 pts por acertar el resultado. +2 pts extra si adivinas el marcador exacto. Máximo 5 puntos por partido.</p>
            </div>
            <div className="step-card">
              <div className="step-num">04</div>
              <div className="step-icon">🏆</div>
              <h3>Gana el pozo</h3>
              <p>Los 3 mejores al final del torneo se reparten el 70% del pozo acumulado.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Prizes */}
      <section className="prizes-section">
        <div className="container">
          <h2 className="section-title">Distribución de Premios</h2>
          <div className="prizes-grid">
            <div className="prize-card silver">
              <div className="prize-pos">2°</div>
              <div className="prize-pct">20%</div>
              <div className="prize-label">del pozo</div>
            </div>
            <div className="prize-card gold">
              <div className="prize-crown">👑</div>
              <div className="prize-pos">1°</div>
              <div className="prize-pct">40%</div>
              <div className="prize-label">del pozo</div>
            </div>
            <div className="prize-card bronze">
              <div className="prize-pos">3°</div>
              <div className="prize-pct">10%</div>
              <div className="prize-label">del pozo</div>
            </div>
          </div>
          <p className="prizes-note">
            Con 20 jugadores: el pozo sería <strong>Q1,000</strong> · 1° lugar gana <strong>Q400</strong> · 2° lugar <strong>Q200</strong> · 3° lugar <strong>Q100</strong>
          </p>
        </div>
      </section>

      {/* Referral */}
      <section className="referral-section">
        <div className="container">
          <div className="referral-card card">
            <div className="referral-icon">🤝</div>
            <div className="referral-text">
              <h3>Sistema de Referidos</h3>
              <p>¿Empate en puntos? Gana quien invitó más personas. Comparte tu código único y cada referido activo te da ventaja en el desempate.</p>
            </div>
            {!user && (
              <Link to="/registro" className="btn btn-gold">Registrarse y obtener código</Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
