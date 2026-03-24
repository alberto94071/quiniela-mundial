import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { api } from '../lib/api';
import './MyPredictions.css';

export default function MyPredictions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (!user.is_active) { setLoading(false); return; }

    api.get('/api/predictions/my')
      .then((d) => setPredictions(d.predictions))
      .finally(() => setLoading(false));
  }, [user]);

  const totalPoints = predictions.reduce((s, p) => s + (p.points_earned || 0), 0);
  const exactScores = predictions.filter((p) => p.points_earned === 5).length;
  const resultHits = predictions.filter((p) => p.points_earned >= 3).length;
  const finished = predictions.filter((p) => p.status === 'finished');
  const pending = predictions.filter((p) => p.status !== 'finished');

  const referralLink = `${window.location.origin}/registro?ref=${user?.referral_code}`;
  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="page-loading"><div className="loading-spinner"></div></div>;

  return (
    <div className="mypred-page container">
      {/* Profile header */}
      <div className="profile-card card">
        <div className="profile-avatar">{user?.name?.[0]?.toUpperCase()}</div>
        <div className="profile-info">
          <h2>{user?.name}</h2>
          <p className="profile-email">{user?.email}</p>
          <div className="profile-status">
            {user?.is_active ? (
              <span className="badge badge-green">✓ Cuenta activa</span>
            ) : (
              <span className="badge badge-red">⏳ Pendiente de activación</span>
            )}
          </div>
        </div>
        <div className="profile-stats">
          <div className="pstat">
            <span className="pstat-val">{totalPoints}</span>
            <span className="pstat-label">Puntos</span>
          </div>
          <div className="pstat">
            <span className="pstat-val">{exactScores}</span>
            <span className="pstat-label">Exactos</span>
          </div>
          <div className="pstat">
            <span className="pstat-val">{resultHits}</span>
            <span className="pstat-label">Resultados</span>
          </div>
        </div>
      </div>

      {/* Referral */}
      <div className="referral-card-my card">
        <div className="ref-header">
          <h3>🤝 Tu código de referidos</h3>
          <span className="ref-code-big">{user?.referral_code}</span>
        </div>
        <p className="ref-desc">Comparte este enlace. Cada referido activo te da ventaja en desempates.</p>
        <div className="ref-link-box">
          <input type="text" readOnly value={referralLink} className="ref-link-input" />
          <button className={`btn btn-primary btn-sm ${copied ? 'copied' : ''}`} onClick={copyLink}>
            {copied ? '✓ Copiado' : 'Copiar'}
          </button>
        </div>
        <a
          href={`https://wa.me/?text=${encodeURIComponent('¡Únete a la Quiniela Mundial 2026! Usa mi código: ' + referralLink)}`}
          target="_blank" rel="noopener"
          className="btn btn-sm"
          style={{ background: '#25D366', color: '#000', alignSelf: 'flex-start' }}
        >
          📱 Compartir por WhatsApp
        </a>
      </div>

      {/* Inactive notice */}
      {!user?.is_active && (
        <div className="inactive-notice card">
          <h3>⚠ Cuenta pendiente de activación</h3>
          <p>Para ingresar pronósticos y participar por los premios, debes activar tu cuenta enviando el comprobante de pago de <strong>Q50.00</strong>.</p>
          <a
            href={`https://wa.me/${(import.meta.env.VITE_ADMIN_WHATSAPP || '').replace(/\D/g, '')}`}
            target="_blank" rel="noopener"
            className="btn btn-primary"
          >
            📱 Enviar comprobante por WhatsApp
          </a>
        </div>
      )}

      {/* Predictions list */}
      {user?.is_active && (
        <>
          {predictions.length === 0 ? (
            <div className="empty-preds card">
              <p>Aún no tienes pronósticos guardados.</p>
              <a href="/partidos" className="btn btn-primary">Ver partidos →</a>
            </div>
          ) : (
            <>
              {pending.length > 0 && (
                <div className="preds-section">
                  <h3 className="preds-title">Próximos partidos</h3>
                  <div className="preds-list">
                    {pending.map((p) => (
                      <PredRow key={p.id} pred={p} />
                    ))}
                  </div>
                </div>
              )}
              {finished.length > 0 && (
                <div className="preds-section">
                  <h3 className="preds-title">Partidos finalizados</h3>
                  <div className="preds-list">
                    {finished.map((p) => (
                      <PredRow key={p.id} pred={p} finished />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

function PredRow({ pred, finished }) {
  const pts = pred.points_earned;
  return (
    <div className={`pred-row card ${finished ? 'pred-finished' : ''}`}>
      <div className="pred-teams">
        <span>{pred.home_flag} {pred.home_team}</span>
        <span className="pred-vs">vs</span>
        <span>{pred.away_team} {pred.away_flag}</span>
      </div>
      <div className="pred-scores">
        <div className="pred-my">
          <span className="pred-score-label">Mi pronóstico</span>
          <span className="pred-score-val">{pred.home_score} – {pred.away_score}</span>
        </div>
        {finished && (
          <>
            <div className="pred-actual">
              <span className="pred-score-label">Resultado</span>
              <span className="pred-score-val">{pred.match_home} – {pred.match_away}</span>
            </div>
            <span className={`badge ${pts === 5 ? 'badge-gold' : pts >= 3 ? 'badge-green' : 'badge-muted'}`}>
              {pts === 5 ? '⭐ 5 pts' : pts >= 3 ? `✓ ${pts} pts` : `✗ ${pts} pts`}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
