# Quiniela Mundial 2026

Aplicacion fullstack para pronosticos del Mundial 2026.

## Stack

- Backend: Node.js, Express, Neon PostgreSQL serverless, JWT, bcryptjs
- Frontend: React 18, React Router v6, Vite
- Deploy: Render (API) + Cloudflare Pages (SPA)

## Estructura

```txt
quiniela-mundial/
├── backend/
└── frontend/
```

## Checklist de deploy (Render + Cloudflare)

### 1) Backend en Render

1. Crear `Web Service` conectado al repo.
2. Configurar:
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm start`
3. Agregar variables de entorno en Render:
   - `DATABASE_URL` = URL de Neon
   - `JWT_SECRET` = secreto largo/aleatorio
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = URL publica de Cloudflare Pages (ej: `https://quiniela-mundial.pages.dev`)
   - `PORT` = `3000`
   - `ADMIN_WHATSAPP` = numero admin (ej: `+502XXXXXXXX`)
4. Deploy inicial.
5. Verificar endpoint health: `https://TU_BACKEND.onrender.com/health`.

### 2) Frontend en Cloudflare Pages

1. Crear proyecto Pages conectado al repo.
2. Configurar:
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Build output directory: `dist`
3. Agregar variables en Cloudflare Pages:
   - `VITE_API_URL` = `https://TU_BACKEND.onrender.com`
   - `VITE_ADMIN_WHATSAPP` = numero admin
4. Deploy y validar en navegador.

## Variables de entorno por plataforma

### Render (backend)

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
NODE_ENV=production
FRONTEND_URL=https://quiniela-mundial.pages.dev
PORT=3000
ADMIN_WHATSAPP=+502XXXXXXXX
```

### Cloudflare Pages (frontend)

```env
VITE_API_URL=https://quiniela-mundial-api.onrender.com
VITE_ADMIN_WHATSAPP=+502XXXXXXXX
```

### Desarrollo local recomendado

`backend/.env`

```env
DATABASE_URL=postgresql://...
JWT_SECRET=dev_secret
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
PORT=3000
ADMIN_WHATSAPP=+502XXXXXXXX
```

`frontend/.env`

```env
VITE_API_URL=http://localhost:3000
VITE_ADMIN_WHATSAPP=+502XXXXXXXX
```

## Migraciones despues del deploy

Desde shell de Render (o local con variables de produccion):

```bash
cd backend
npm run db:migrate
```

Esto:
- crea tablas (`users`, `matches`, `predictions`, `leaderboard_cache`)
- inserta admin base
- inserta 72 partidos de fase de grupos (12 grupos x 6 partidos)

## Reset de base de datos (solo desarrollo)

```bash
cd backend
npm run db:reset
```

El script pide confirmacion: `¿Estás seguro? Escribe RESET para confirmar:`

## Troubleshooting

### CORS bloqueado en produccion

- Confirmar `FRONTEND_URL` en Render con URL exacta de Pages.
- Revisar que el frontend este llamando a `VITE_API_URL` correcto.
- El backend acepta subdominios `*.pages.dev` para staging.

### Cold start de Render (free tier)

- El backend puede tardar al primer request despues de inactividad.
- El frontend ejecuta keep-alive a `/health` cada 14 minutos mientras la app esta abierta.

### Error por `DATABASE_URL`

- Confirmar que existe en Render y/o `.env` local.
- Verificar formato PostgreSQL y `sslmode=require` en Neon.
- Si Neon no responde, la API devuelve `503` temporal en vez de error generico.

### Frontend no conecta con API

- Revisar `VITE_API_URL` en Cloudflare Pages (Production + Preview).
- Re-deploy del frontend tras cambios de variables.
- Verificar `/health` del backend en navegador.

## Nota de calendario

- El seed de partidos en `backend/src/lib/migrate.js` está alineado con el fixture oficial publicado por FIFA para el Mundial 2026.
- Referencia oficial: https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/articles/calendario-fixture-mundial-2026-partidos-fechas
