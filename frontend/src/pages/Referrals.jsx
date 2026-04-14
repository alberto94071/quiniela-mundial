import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { api } from '../lib/api';
import './Referrals.css';

var LEVELS = [
  {
    level: 1,
    required: 3,
    icon: '🔑',
    title: 'Llaveros Conmemorativos',
    subtitle: 'Mundial 2026',
    description: 'Llaveros conmemorativos oficiales del Mundial 2026. Premio físico entregado en San Marcos. Si estás fuera de San Marcos, el costo de envío corre por tu cuenta.',
    color: '#CD7F32',
    badge: 'BRONCE',
  },
  {
    level: 2,
    required: 7,
    icon: '🍔',
    title: 'Combo McDonald\'s',
    subtitle: 'A convenir entre las opciones disponibles',
    description: 'Un combo McDonald\'s a convenir entre las propuestas disponibles. Se coordina con un restaurante cercano a tu zona para entrega a domicilio.',
    color: '#C0C0C0',
    badge: 'PLATA',
  },
  {
    level: 3,
    required: 13,
    icon: '🍗',
    title: 'Caja de 24 McNuggets',
    subtitle: 'Menú Grande McDonald\'s',
    description: 'Caja de 24 McNuggets McDonald\'s (Menú Grande para compartir). Se coordina entrega con restaurante cercano a tu zona.',
    link: 'https://mcdonalds.com.gt/menu/almuerzos-y-cenas/Para%20compartir/Caja%20de%2024%20McNuggets',
    color: '#FFD700',
    badge: 'ORO',
  },
];

var BONUS_PRIZES = [
  {
    icon: '🎽',
    title: 'Sorteo de Camisolas del Mundial',
    description: 'Los TOP 15 referidores que hayan completado el Nivel 3 (13+ referidos activos) entran automáticamente al sorteo de camisolas oficiales del Mundial 2026. El sorteo se realiza al finalizar el torneo.',
    requirement: 'Requiere completar Nivel 3 + estar entre los Top 15',
  },
  {
    icon: '🎁',
    title: 'Premio Sorpresa',
    description: 'El referidor #1 con más referidos activos al finalizar el torneo, habiendo completado los 3 niveles, recibe un premio sorpresa especial.',
    requirement: 'Solo para el #1 referidor con Nivel 3 completado',
  },
];

export default function Referrals() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myReferrals, setMyReferrals] = useState([]);
  const [topReferrers, setTopReferrers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeLevel, setActiveLevel] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);
    try {
      const lb = await api.get('/api/leaderboard');
      var all = lb.leaderboard || [];
      setTopReferrers(all.filter(function(r) { return r.valid_referrals >= 13; }).slice(0, 15));

      if (user) {
        var me = all.find(function(r) { return r.referral_code === user.referral_code; });
        if (me) {
          setMyReferrals(me.valid_referrals || 0);
        } else {
          setMyReferrals(0);
        }
      }
    } catch (err) {
      setMyReferrals(0);
    } finally {
      setLoading(false);
    }
  }

  var referralLink = window.location.origin + '/registro?ref=' + (user?.referral_code || '');
  var validReferrals = typeof myReferrals === 'number' ? myReferrals : 0;

  function getCurrentLevel() {
    if (validReferrals >= 13) return 3;
    if (validReferrals >= 7) return 2;
    if (validReferrals >= 3) return 1;
    return 0;
  }

  function getNextLevel() {
    if (validReferrals >= 13) return null;
    if (validReferrals >= 7) return LEVELS[2];
    if (validReferrals >= 3) return LEVELS[1];
    return LEVELS[0];
  }

  function getProgressToNext() {
    var next = getNextLevel();
    if (!next) return 100;
    var prev = next.level === 1 ? 0 : LEVELS[next.level - 2].required;
    return Math.min(100, Math.round(((validReferrals - prev) / (next.required - prev)) * 100));
  }

  function copyLink() {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(function() { setCopied(false); }, 2000);
  }

  var currentLevel = getCurrentLevel();
  var nextLevel = getNextLevel();
  var progress = getProgressToNext();

  if (loading) {
    return <div className="page-loading"><div className="loading-spinner"></div><span>Cargando referidos...</span></div>;
  }

  return (
    <div className="referrals-page container">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">REFERIDOS</h1>
          <p className="page-sub">Invita amigos, sube de nivel y gana premios</p>
        </div>
      </div>

      {/* My status card */}
      <div className="my-status card">
        <div className="status-top">
          <div className="status-left">
            <div className="status-count">
              <span className="count-num">{validReferrals}</span>
              <span className="count-label">referidos activos</span>
            </div>
            <div className={`level-badge ${currentLevel > 0 ? 'unlocked' : ''}`}>
              {currentLevel > 0 ? (
                <span>✅ Nivel {currentLevel} desbloqueado — {LEVELS[currentLevel - 1].badge}</span>
              ) : (
                <span>Sin nivel aún · ¡Invita 3 personas para empezar!</span>
              )}
            </div>
          </div>
          <div className="ref-code-box">
            <span className="ref-code-label">Tu código</span>
            <span className="ref-code-val">{user?.referral_code}</span>
          </div>
        </div>

        {/* Progress to next level */}
        {nextLevel && (
          <div className="progress-section">
            <div className="progress-info">
              <span className="progress-text">
                {nextLevel.icon} Nivel {nextLevel.level} — {nextLevel.title}
              </span>
              <span className="progress-nums">
                {validReferrals} / {nextLevel.required}
                <strong style={{ color: 'var(--green)', marginLeft: 8 }}>
                  {nextLevel.required - validReferrals} más
                </strong>
              </span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: progress + '%' }}></div>
            </div>
          </div>
        )}

        {currentLevel === 3 && (
          <div className="max-level-banner">
            🏆 ¡Completaste todos los niveles! Estás en el grupo élite para el sorteo de camisolas.
          </div>
        )}

        {/* Share link */}
        <div className="share-section">
          <div className="share-link-row">
            <input type="text" readOnly value={referralLink} className="share-link-input" />
            <button className={'btn btn-primary btn-sm' + (copied ? ' copied' : '')} onClick={copyLink}>
              {copied ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>
          <a
            href={'https://wa.me/?text=' + encodeURIComponent('⚽ ¡Únete a la Quiniela del Mundial 2026! Predice partidos, compite y gana premios. Regístrate con mi código: ' + referralLink)}
            target="_blank"
            rel="noopener"
            className="btn btn-sm wa-btn"
          >
            📱 Compartir por WhatsApp
          </a>
        </div>
      </div>

      {/* Levels */}
      <h2 className="section-heading">Niveles de Premios</h2>
      <div className="levels-grid">
        {LEVELS.map(function(lvl) {
          var unlocked = validReferrals >= lvl.required;
          var isCurrent = currentLevel === lvl.level;
          var isNext = nextLevel && nextLevel.level === lvl.level;

          return (
            <div
              key={lvl.level}
              className={'level-card card ' + (unlocked ? 'unlocked' : '') + (isCurrent ? ' current' : '') + (isNext ? ' next' : '')}
              onClick={function() { setActiveLevel(activeLevel === lvl.level ? null : lvl.level); }}
              style={{ '--level-color': lvl.color }}
            >
              <div className="level-header">
                <div className="level-num-badge" style={{ background: lvl.color }}>
                  NIVEL {lvl.level}
                </div>
                {unlocked && <span className="unlocked-check">✅ DESBLOQUEADO</span>}
                {isNext && !unlocked && <span className="next-tag">SIGUIENTE</span>}
              </div>

              <div className="level-icon">{lvl.icon}</div>
              <h3 className="level-title">{lvl.title}</h3>
              <p className="level-subtitle">{lvl.subtitle}</p>

              <div className="level-req">
                <span className="req-num" style={{ color: lvl.color }}>{lvl.required}</span>
                <span className="req-label">referidos activos</span>
              </div>

              {activeLevel === lvl.level && (
                <div className="level-detail">
                  <p>{lvl.description}</p>
                  {lvl.link && (
                    <a href={lvl.link} target="_blank" rel="noopener" className="btn btn-outline btn-sm" style={{ marginTop: 10 }}>
                      Ver en McDonald's GT →
                    </a>
                  )}
                </div>
              )}

              <div className="level-progress-mini">
                <div
                  className="level-progress-fill"
                  style={{
                    width: Math.min(100, Math.round((validReferrals / lvl.required) * 100)) + '%',
                    background: lvl.color
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bonus prizes */}
      <h2 className="section-heading">Premios Especiales</h2>
      <div className="bonus-grid">
        {BONUS_PRIZES.map(function(prize, i) {
          return (
            <div key={i} className="bonus-card card">
              <div className="bonus-icon">{prize.icon}</div>
              <div className="bonus-info">
                <h3>{prize.title}</h3>
                <p>{prize.description}</p>
                <span className="bonus-req">{prize.requirement}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rules */}
      <div className="rules-card card">
        <h3>📋 Términos y condiciones de los premios por referidos</h3>
        <ul className="rules-list">
          <li>Solo cuentan los referidos con cuenta <strong>activa</strong> (pago de Q50 confirmado).</li>
          <li>El premio de cada nivel <strong>reemplaza</strong> al anterior — solo se entrega el premio del nivel más alto alcanzado.</li>
          <li><strong>Premio Nivel 1 (Llaveros):</strong> entrega presencial en San Marcos. Si el ganador se encuentra fuera de San Marcos, el costo de envío corre por su cuenta.</li>
          <li><strong>Premio Nivel 2 (Combo McDonald's):</strong> se coordina con un restaurante McDonald's cercano a la zona del ganador para entrega a domicilio.</li>
          <li><strong>Premio Nivel 3 (Caja 24 McNuggets):</strong> se coordina entrega con restaurante cercano a la zona del ganador.</li>
          <li>El <strong>sorteo de camisolas</strong> aplica solo para los TOP 15 referidores que hayan completado el Nivel 3. El sorteo se realiza al finalizar el torneo.</li>
          <li>El <strong>premio sorpresa</strong> es exclusivo para el referidor #1 que haya completado los 3 niveles.</li>
          <li>Los premios se coordinarán con el administrador vía WhatsApp al finalizar el torneo o al alcanzar el nivel correspondiente.</li>
          <li>El administrador se reserva el derecho de verificar la autenticidad de los referidos.</li>
        </ul>
      </div>

      {/* Top referrers */}
      {topReferrers.length > 0 && (
        <div className="top-ref-section">
          <h2 className="section-heading">🏆 Top Referidores — Nivel 3+</h2>
          <div className="top-ref-table card">
            <div className="tr-header">
              <span>#</span>
              <span>Jugador</span>
              <span>Referidos</span>
              <span>Estado</span>
            </div>
            {topReferrers.map(function(r, i) {
              var isMe = user && r.referral_code === user.referral_code;
              return (
                <div key={r.referral_code} className={'tr-row ' + (isMe ? 'my-row' : '')}>
                  <span className="tr-pos">
                    {i === 0 ? '👑' : i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                  </span>
                  <span className="tr-name">
                    {r.name}
                    {isMe && <span className="badge badge-green" style={{ fontSize: '0.65rem', marginLeft: 6 }}>Tú</span>}
                  </span>
                  <span className="tr-refs" style={{ color: 'var(--green)', fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>
                    {r.valid_referrals}
                  </span>
                  <span>
                    <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>Nivel 3 ✅</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}