import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { api } from '../lib/api';
import './Admin.css';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('users');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultForm, setResultForm] = useState({});
  const [savingResult, setSavingResult] = useState({});
  const [messages, setMessages] = useState({});
  const [newMatch, setNewMatch] = useState({ match_number: '', phase: '', home_team: '', away_team: '', home_flag: '', away_flag: '', match_date: '', venue: '' });
  const [addingMatch, setAddingMatch] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (!user.is_admin) { navigate('/'); return; }
    loadAll();
  }, [user]);

  async function loadAll() {
    setLoading(true);
    try {
      const [s, u, m] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/users'),
        api.get('/api/matches'),
      ]);
      setStats(s);
      setUsers(u.users);
      setMatches(m.matches);
    } finally {
      setLoading(false);
    }
  }

  async function toggleUser(userId, currentStatus) {
    try {
      await api.patch(`/api/admin/users/${userId}/activate`, {
        is_active: !currentStatus,
        payment_status: !currentStatus ? 'confirmed' : 'pending',
      });
      setUsers((us) => us.map((u) => u.id === userId ? { ...u, is_active: !currentStatus, payment_status: !currentStatus ? 'confirmed' : 'pending' } : u));
      showMsg('users_' + userId, 'success', !currentStatus ? '✓ Cuenta activada' : '✓ Cuenta desactivada');
    } catch (err) {
      showMsg('users_' + userId, 'error', err.message);
    }
  }

  async function saveResult(matchId) {
    const form = resultForm[matchId];
    if (!form || form.home === undefined || form.away === undefined) return;
    setSavingResult((s) => ({ ...s, [matchId]: true }));
    try {
      await api.patch(`/api/matches/${matchId}/result`, { home_score: Number(form.home), away_score: Number(form.away) });
      setMatches((ms) => ms.map((m) => m.id === matchId ? { ...m, home_score: form.home, away_score: form.away, status: 'finished' } : m));
      showMsg('match_' + matchId, 'success', '✓ Resultado guardado y puntos calculados');
    } catch (err) {
      showMsg('match_' + matchId, 'error', err.message);
    } finally {
      setSavingResult((s) => ({ ...s, [matchId]: false }));
    }
  }

  async function createMatch(e) {
    e.preventDefault();
    setAddingMatch(true);
    try {
      await api.post('/api/matches', {
        ...newMatch,
        match_number: Number(newMatch.match_number),
      });
      await loadAll();
      setNewMatch({ match_number: '', phase: '', home_team: '', away_team: '', home_flag: '', away_flag: '', match_date: '', venue: '' });
      showMsg('new_match', 'success', '✓ Partido creado');
    } catch (err) {
      showMsg('new_match', 'error', err.message);
    } finally {
      setAddingMatch(false);
    }
  }

  function showMsg(key, type, text) {
    setMessages((m) => ({ ...m, [key]: { type, text } }));
    setTimeout(() => setMessages((m) => ({ ...m, [key]: null })), 3000);
  }

  if (loading) return <div className="page-loading"><div className="loading-spinner"></div><span>Cargando panel...</span></div>;

  return (
    <div className="admin-page container">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ color: 'var(--gold)' }}>ADMIN</h1>
          <p className="page-sub">Panel de administración · Quiniela Mundial 2026</p>
        </div>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card card">
            <span className="sc-icon">👥</span>
            <span className="sc-val">{stats.users.total_users}</span>
            <span className="sc-label">Usuarios registrados</span>
          </div>
          <div className="stat-card card active">
            <span className="sc-icon">✅</span>
            <span className="sc-val">{stats.users.active_users}</span>
            <span className="sc-label">Cuentas activas</span>
          </div>
          <div className="stat-card card pending">
            <span className="sc-icon">⏳</span>
            <span className="sc-val">{stats.users.pending_users}</span>
            <span className="sc-label">Pendientes</span>
          </div>
          <div className="stat-card card gold">
            <span className="sc-icon">💰</span>
            <span className="sc-val">Q{stats.prize_pool.total?.toLocaleString()}</span>
            <span className="sc-label">Pozo total</span>
          </div>
          <div className="stat-card card">
            <span className="sc-icon">⚽</span>
            <span className="sc-val">{stats.predictions.total_predictions}</span>
            <span className="sc-label">Pronósticos</span>
          </div>
          <div className="stat-card card">
            <span className="sc-icon">🏁</span>
            <span className="sc-val">{stats.matches.finished_matches}/{stats.matches.total_matches}</span>
            <span className="sc-label">Partidos jugados</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs">
        <button className={`tab-btn ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>👥 Usuarios</button>
        <button className={`tab-btn ${tab === 'matches' ? 'active' : ''}`} onClick={() => setTab('matches')}>⚽ Partidos</button>
        <button className={`tab-btn ${tab === 'add' ? 'active' : ''}`} onClick={() => setTab('add')}>➕ Agregar Partido</button>
      </div>

      {/* Users tab */}
      {tab === 'users' && (
        <div className="admin-table card">
          <div className="at-header">
            <span>Usuario</span>
            <span>Estado</span>
            <span>Referidos</span>
            <span>Puntos</span>
            <span>Acción</span>
          </div>
          {users.map((u) => (
            <div key={u.id} className="at-row">
              <div className="at-user">
                <span className="at-name">{u.name}</span>
                <span className="at-email">{u.email}</span>
                {u.referred_by && <span className="at-ref">ref: {u.referred_by}</span>}
              </div>
              <span>
                <span className={`badge ${u.is_active ? 'badge-green' : 'badge-muted'}`}>
                  {u.is_active ? 'Activo' : u.payment_status === 'pending' ? 'Pendiente' : 'Inactivo'}
                </span>
              </span>
              <span className="at-center">{u.valid_referrals}</span>
              <span className="at-center">{u.total_points}</span>
              <div className="at-actions">
                <button
                  className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-primary'}`}
                  onClick={() => toggleUser(u.id, u.is_active)}
                >
                  {u.is_active ? 'Desactivar' : 'Activar'}
                </button>
                {messages['users_' + u.id] && (
                  <span className={messages['users_' + u.id].type === 'success' ? 'success-msg' : 'error-msg'} style={{ fontSize: '0.75rem' }}>
                    {messages['users_' + u.id].text}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Matches tab */}
      {tab === 'matches' && (
        <div className="admin-table card">
          <div className="at-header matches-header">
            <span>Partido</span>
            <span>Fecha</span>
            <span>Cargar Resultado</span>
          </div>
          {matches.map((m) => (
            <div key={m.id} className="at-row matches-row">
              <div className="at-match">
                <span className="at-teams">{m.home_flag} {m.home_team} vs {m.away_team} {m.away_flag}</span>
                <span className="at-phase">{m.phase}</span>
                {m.status === 'finished' && (
                  <span className="badge badge-muted" style={{ fontSize: '0.7rem' }}>
                    Final: {m.home_score}–{m.away_score}
                  </span>
                )}
              </div>
              <span className="at-date">{new Date(m.match_date).toLocaleDateString('es-GT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
              <div className="result-form">
                <input
                  type="number" min="0" max="30"
                  placeholder={m.home_score ?? '0'}
                  className="score-input-sm"
                  onChange={(e) => setResultForm((f) => ({ ...f, [m.id]: { ...f[m.id], home: e.target.value } }))}
                />
                <span>–</span>
                <input
                  type="number" min="0" max="30"
                  placeholder={m.away_score ?? '0'}
                  className="score-input-sm"
                  onChange={(e) => setResultForm((f) => ({ ...f, [m.id]: { ...f[m.id], away: e.target.value } }))}
                />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => saveResult(m.id)}
                  disabled={savingResult[m.id]}
                >
                  {savingResult[m.id] ? '...' : 'Guardar'}
                </button>
                {messages['match_' + m.id] && (
                  <span className={messages['match_' + m.id].type === 'success' ? 'success-msg' : 'error-msg'} style={{ fontSize: '0.75rem' }}>
                    {messages['match_' + m.id].text}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add match tab */}
      {tab === 'add' && (
        <div className="add-match-form card">
          <h3>Agregar nuevo partido</h3>
          <form onSubmit={createMatch} className="match-form-grid">
            <div className="input-group">
              <label>Número de partido</label>
              <input type="number" value={newMatch.match_number} onChange={(e) => setNewMatch({ ...newMatch, match_number: e.target.value })} required />
            </div>
            <div className="input-group">
              <label>Fase</label>
              <input type="text" placeholder="Ej: Grupo A, Octavos" value={newMatch.phase} onChange={(e) => setNewMatch({ ...newMatch, phase: e.target.value })} required />
            </div>
            <div className="input-group">
              <label>Equipo local</label>
              <input type="text" value={newMatch.home_team} onChange={(e) => setNewMatch({ ...newMatch, home_team: e.target.value })} required />
            </div>
            <div className="input-group">
              <label>Bandera local (emoji)</label>
              <input type="text" placeholder="🇲🇽" value={newMatch.home_flag} onChange={(e) => setNewMatch({ ...newMatch, home_flag: e.target.value })} />
            </div>
            <div className="input-group">
              <label>Equipo visitante</label>
              <input type="text" value={newMatch.away_team} onChange={(e) => setNewMatch({ ...newMatch, away_team: e.target.value })} required />
            </div>
            <div className="input-group">
              <label>Bandera visitante (emoji)</label>
              <input type="text" placeholder="🇺🇸" value={newMatch.away_flag} onChange={(e) => setNewMatch({ ...newMatch, away_flag: e.target.value })} />
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label>Fecha y hora (ISO)</label>
              <input type="datetime-local" value={newMatch.match_date} onChange={(e) => setNewMatch({ ...newMatch, match_date: e.target.value })} required />
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label>Sede</label>
              <input type="text" placeholder="Estadio Azteca, CDMX" value={newMatch.venue} onChange={(e) => setNewMatch({ ...newMatch, venue: e.target.value })} />
            </div>
            {messages.new_match && (
              <p className={messages.new_match.type === 'success' ? 'success-msg' : 'error-msg'} style={{ gridColumn: '1 / -1' }}>{messages.new_match.text}</p>
            )}
            <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1' }} disabled={addingMatch}>
              {addingMatch ? 'Creando...' : '➕ Crear partido'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
