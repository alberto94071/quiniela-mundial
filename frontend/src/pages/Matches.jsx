import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import './Matches.css';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('es-GT', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Guatemala'
  });
}

function isClosed(matchDate) {
  const cutoff = new Date(new Date(matchDate).getTime() - 5 * 60 * 1000);
  return new Date() >= cutoff;
}

export default function Matches() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [messages, setMessages] = useState({});
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);
    try {
      const { matches } = await api.get('/api/matches');
      setMatches(matches);

      if (user?.is_active) {
        const { predictions: myPreds } = await api.get('/api/predictions/my');
        const map = {};
        myPreds.forEach((p) => { map[p.match_id] = p; });
        setPredictions(map);
        const draftMap = {};
        myPreds.forEach((p) => {
          draftMap[p.match_id] = { home: p.home_score, away: p.away_score };
        });
        setDrafts(draftMap);
      }
    } finally {
      setLoading(false);
    }
  }

  function setDraft(matchId, side, val) {
    const num = Math.max(0, Math.min(30, parseInt(val) || 0));
    setDrafts((d) => ({ ...d, [matchId]: { ...d[matchId], [side]: num } }));
  }

  async function savePrediction(matchId) {
    const draft = drafts[matchId];
    if (!draft || draft.home === undefined || draft.away === undefined) return;
    setSaving((s) => ({ ...s, [matchId]: true }));
    setMessages((m) => ({ ...m, [matchId]: null }));
    try {
      await api.post('/api/predictions', {
        match_id: matchId,
        home_score: draft.home,
        away_score: draft.away,
      });
      setMessages((m) => ({ ...m, [matchId]: { type: 'success', text: '✓ Pronóstico guardado' } }));
      setPredictions((p) => ({ ...p, [matchId]: { home_score: draft.home, away_score: draft.away } }));
    } catch (err) {
      setMessages((m) => ({ ...m, [matchId]: { type: 'error', text: err.message } }));
    } finally {
      setSaving((s) => ({ ...s, [matchId]: false }));
      setTimeout(() => setMessages((m) => ({ ...m, [matchId]: null })), 3000);
    }
  }

  const phases = ['all', ...new Set(matches.map((m) => m.phase))];
  const filtered = filter === 'all' ? matches : matches.filter((m) => m.phase === filter);

  if (loading) {
    return <div className="page-loading"><div className="loading-spinner"></div><span>Cargando partidos...</span></div>;
  }

  return (
    <div className="matches-page container">
      <div className="page-header">
        <div>
          <h1 className="page-title">PARTIDOS</h1>
          <p className="page-sub">Mundial 2026 · USA · Canadá · México</p>
        </div>
        {user && !user.is_active && (
          <div className="inactive-banner">
            ⚠ Cuenta pendiente de activación. <a href={`https://wa.me/${(import.meta.env.VITE_ADMIN_WHATSAPP || '').replace(/\D/g, '')}`} target="_blank" rel="noopener">Envía tu comprobante →</a>
          </div>
        )}
      </div>

      {/* Phase filter */}
      <div className="phase-filter">
        {phases.map((p) => (
          <button key={p} className={`phase-btn ${filter === p ? 'active' : ''}`} onClick={() => setFilter(p)}>
            {p === 'all' ? 'Todos' : p}
          </button>
        ))}
      </div>

      <div className="matches-list">
        {filtered.map((match) => {
          const closed = isClosed(match.match_date);
          const finished = match.status === 'finished';
          const myPred = predictions[match.match_id || match.id];
          const draft = drafts[match.match_id || match.id] || { home: '', away: '' };
          const matchId = match.id;
          const msg = messages[matchId];

          return (
            <div key={matchId} className={`match-card card ${finished ? 'finished' : ''}`}>
              <div className="match-meta">
                <span className="match-phase">{match.phase}</span>
                <span className="match-date">{formatDate(match.match_date)}</span>
                {match.venue && <span className="match-venue">📍 {match.venue}</span>}
              </div>

              <div className="match-teams">
                <div className="team home">
                  <span className="team-flag">{match.home_flag}</span>
                  <span className="team-name">{match.home_team}</span>
                </div>

                <div className="match-center">
                  {finished ? (
                    <div className="final-score">
                      <span>{match.home_score}</span>
                      <span className="score-sep">–</span>
                      <span>{match.away_score}</span>
                    </div>
                  ) : (
                    <div className="vs-block">
                      <span className="vs-text">VS</span>
                      {closed && <span className="closed-label">CERRADO</span>}
                    </div>
                  )}
                </div>

                <div className="team away">
                  <span className="team-name">{match.away_team}</span>
                  <span className="team-flag">{match.away_flag}</span>
                </div>
              </div>

              {/* Prediction section */}
              {user?.is_active && !finished && (
                <div className="prediction-section">
                  <p className="pred-label">Tu pronóstico</p>
                  <div className="pred-inputs">
                    <input
                      type="number"
                      min="0" max="30"
                      value={draft.home ?? ''}
                      onChange={(e) => setDraft(matchId, 'home', e.target.value)}
                      disabled={closed}
                      className="score-input"
                      placeholder="0"
                    />
                    <span className="pred-sep">–</span>
                    <input
                      type="number"
                      min="0" max="30"
                      value={draft.away ?? ''}
                      onChange={(e) => setDraft(matchId, 'away', e.target.value)}
                      disabled={closed}
                      className="score-input"
                      placeholder="0"
                    />
                    {!closed && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => savePrediction(matchId)}
                        disabled={saving[matchId]}
                      >
                        {saving[matchId] ? '...' : myPred ? 'Actualizar' : 'Guardar'}
                      </button>
                    )}
                  </div>
                  {msg && <p className={msg.type === 'success' ? 'success-msg' : 'error-msg'}>{msg.text}</p>}
                  {closed && <p className="closed-msg">🔒 Pronósticos cerrados para este partido</p>}
                </div>
              )}

              {/* Show existing prediction for inactive/guest */}
              {finished && myPred && (
                <div className="pred-result">
                  <span>Tu pronóstico: <strong>{myPred.home_score} – {myPred.away_score}</strong></span>
                  <span className={`badge ${myPred.points_earned === 5 ? 'badge-gold' : myPred.points_earned >= 3 ? 'badge-green' : 'badge-muted'}`}>
                    {myPred.points_earned} pts
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
