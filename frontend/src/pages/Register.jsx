import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import './Auth.css';

const ADMIN_WA = import.meta.env.VITE_ADMIN_WHATSAPP || '+50212345678';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') || '';

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    referral_code: refCode,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await register(form.name, form.email, form.password, form.referral_code);
      setSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const waMsg = encodeURIComponent(
      `Hola! Soy ${success.user.name} (${success.user.email}). Adjunto mi comprobante de pago de Q50 para activar mi cuenta en la Quiniela Mundial 2026. Mi código: ${success.user.referral_code}`
    );
    return (
      <div className="auth-page">
        <div className="auth-card card fade-up success-card">
          <div className="success-icon">🎉</div>
          <h2>¡Registro exitoso!</h2>
          <p className="success-sub">Tu cuenta fue creada. Para activarla y participar por los premios, realiza el pago de <strong>Q50.00</strong>.</p>

          <div className="payment-steps">
            <div className="pay-step">
              <span className="pay-num">1</span>
              <span>Realiza transferencia de <strong>Q50.00</strong> a la cuenta designada</span>
            </div>
            <div className="pay-step">
              <span className="pay-num">2</span>
              <span>Envía tu comprobante por WhatsApp al administrador</span>
            </div>
            <div className="pay-step">
              <span className="pay-num">3</span>
              <span>Tu cuenta se activará en máximo <strong>24 horas</strong></span>
            </div>
          </div>

          <a
            href={`https://wa.me/${ADMIN_WA.replace(/\D/g, '')}?text=${waMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-lg w-full"
            style={{ background: '#25D366', marginTop: 8 }}
          >
            📱 Enviar comprobante por WhatsApp
          </a>

          <div className="referral-box">
            <p className="ref-label">Tu código de referidos</p>
            <p className="ref-code">{success.user.referral_code}</p>
            <p className="ref-hint">Compártelo para tener ventaja en desempates</p>
          </div>

          <button className="btn btn-outline w-full" onClick={() => navigate('/login')}>
            Ir al login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb"></div>
      </div>
      <div className="auth-card card fade-up">
        <div className="auth-header">
          <div className="auth-logo">🏆</div>
          <h1>Únete a la quiniela</h1>
          <p>Registro gratis · Pago de activación Q50</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Nombre completo</label>
            <input
              type="text"
              name="name"
              placeholder="Tu nombre"
              value={form.name}
              onChange={handleChange}
              required
              minLength={2}
            />
          </div>

          <div className="input-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              name="email"
              placeholder="tu@correo.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              placeholder="Mínimo 8 caracteres"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
            />
          </div>

          <div className="input-group">
            <label>Código de referido <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(opcional)</span></label>
            <input
              type="text"
              name="referral_code"
              placeholder="Ej. ABCD1234"
              value={form.referral_code}
              onChange={handleChange}
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          {error && <p className="error-msg">⚠ {error}</p>}

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? <span className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span> : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login">Ingresar</Link>
        </p>
      </div>
    </div>
  );
}
