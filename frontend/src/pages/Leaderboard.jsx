import { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { api } from '../lib/api';
import './Leaderboard.css';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/leaderboard')
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading"><div className="loading-spinner"></div><span>Cargando tabla...</span></div>;

  const { leaderboard = [], prizes = {} } = data || {};

  return (
    <div className="leaderboard-page container">
      <div className="page-header">
        <div>
          <h1 className="page-title">TABLA</h1>
          <p className="page-sub">Posiciones en tiempo real · Mundial 2026</p>
        </div>
      </div>

      {/* Prize pool */}
      <div className="pot-banner card">
        <div className="pot-main">
          <span className="pot-label">💰 Pozo Acumulado</span>
          <span className="pot-amount">Q{prizes.total_pot?.toLocaleString() || '0'}</span>
          <span className="pot-players">{prizes.total_players || 0} jugadores activos × Q50</span>
        </div>
        <div className="pot-breakdown">
          <div className="pot-item gold">
            <span>🥇 1er lugar</span>
            <strong>Q{prizes.first_place?.toLocaleString() || '0'}</strong>
          </div>
          <div className="pot-item silver">
            <span>🥈 2do lugar</span>
            <strong>Q{prizes.second_place?.toLocaleString() || '0'}</strong>
          </div>
          <div className="pot-item bronze">
            <span>🥉 3er lugar</span>
            <strong>Q{prizes.third_place?.toLocaleString() || '0'}</strong>
          </div>
        </div>
      </div>

      {/* Table */}
      {leaderboard.length === 0 ? (
        <div className="empty-state card">
          <p>🏟 La tabla estará disponible una vez que comiencen los partidos.</p>
        </div>
      ) : (
        <div className="lb-table card">
          <div className="lb-header">
            <span className="col-rank">#</span>
            <span className="col-player">Jugador</span>
            <span className="col-stat">Pts</span>
            <span className="col-stat hide-sm">Exactos</span>
            <span className="col-stat hide-sm">Referidos</span>
          </div>

          {leaderboard.map((row, i) => {
            const isMe = user && row.referral_code === user.referral_code;
            const topThree = i < 3;

            return (
              <div key={row.referral_code} className={`lb-row ${topThree ? 'top-row' : ''} ${isMe ? 'my-row' : ''}`}>
                <span className="col-rank">
                  {i < 3 ? <span className="medal">{MEDALS[i]}</span> : <span className="rank-num">{row.rank}</span>}
                </span>
                <span className="col-player">
                  <span className="player-name">{row.name}</span>
                  {isMe && <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>Tú</span>}
                  <span className="player-code">{row.referral_code}</span>
                </span>
                <span className="col-stat points">{row.total_points}</span>
                <span className="col-stat hide-sm">{row.exact_scores}</span>
                <span className="col-stat hide-sm">{row.valid_referrals}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Tiebreak rules */}
      <div className="tiebreak-card card">
        <h3>⚖ Criterios de Desempate</h3>
        <div className="tiebreak-list">
          <div className="tb-item">
            <span className="tb-num">1</span>
            <div><strong>Referidos válidos</strong> — Quien haya invitado más jugadores activos (con pago confirmado).</div>
          </div>
          <div className="tb-item">
            <span className="tb-num">2</span>
            <div><strong>Marcadores exactos</strong> — Quien tenga más pronósticos de 5 puntos.</div>
          </div>
          <div className="tb-item">
            <span className="tb-num">3</span>
            <div><strong>División</strong> — Si persiste el empate, el premio se divide en partes iguales.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
