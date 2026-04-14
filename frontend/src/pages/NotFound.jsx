import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container" style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: '40px 20px' }}>
      <div className="card" style={{ maxWidth: 560, textAlign: 'center' }}>
        <p style={{ color: 'var(--green)', letterSpacing: 2, textTransform: 'uppercase', fontSize: 12 }}>Error 404</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', letterSpacing: 3, margin: '6px 0 12px' }}>
          Pagina no encontrada
        </h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 18 }}>
          La ruta que buscabas no existe o fue movida. Vuelve al inicio para seguir con tus pronosticos.
        </p>
        <Link to="/" className="btn btn-primary">Volver al inicio</Link>
      </div>
    </div>
  );
}
