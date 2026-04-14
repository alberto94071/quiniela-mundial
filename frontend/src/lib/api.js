const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
let keepAliveIntervalId = null;

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    if (res.status === 503) {
      throw new Error('Servidor temporalmente no disponible, intenta de nuevo');
    }
    throw new Error(data.error || 'Error en la solicitud');
  }
  return data;
}

export function keepAlive() {
  if (keepAliveIntervalId) return () => {};

  const ping = () => {
    fetch(`${BASE_URL}/health`).catch(() => null);
  };

  ping();
  keepAliveIntervalId = window.setInterval(ping, 14 * 60 * 1000);

  return () => {
    if (keepAliveIntervalId) {
      window.clearInterval(keepAliveIntervalId);
      keepAliveIntervalId = null;
    }
  };
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};
