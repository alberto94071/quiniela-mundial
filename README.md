# ⚽ Quiniela Mundial 2026

Sistema completo de quiniela para el Mundial 2026.
- **BD:** Neon Tech (PostgreSQL serverless)
- **Backend:** Express.js → Render
- **Frontend:** React + Vite → Cloudflare Pages

---

## 🗂 Estructura del Proyecto

```
quiniela-mundial/
├── backend/          → API Express (desplegado en Render)
│   ├── src/
│   │   ├── index.js              # servidor principal
│   │   ├── lib/
│   │   │   ├── db.js             # conexión Neon
│   │   │   └── migrate.js        # crea tablas + datos iniciales
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT middleware
│   │   └── routes/
│   │       ├── auth.js           # registro / login
│   │       ├── matches.js        # partidos y resultados
│   │       ├── predictions.js    # pronósticos
│   │       ├── leaderboard.js    # tabla de posiciones
│   │       └── admin.js          # panel admin
│   ├── package.json
│   └── .env.example
└── frontend/         → React (desplegado en Cloudflare Pages)
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── lib/
    │   │   ├── api.js            # cliente HTTP
    │   │   └── AuthContext.jsx   # estado de autenticación
    │   ├── components/
    │   │   └── Navbar.jsx
    │   ├── pages/
    │   │   ├── Home.jsx          # landing page
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Matches.jsx       # partidos + pronósticos
    │   │   ├── Leaderboard.jsx   # tabla de posiciones
    │   │   ├── MyPredictions.jsx # perfil + mis pronósticos
    │   │   └── Admin.jsx         # panel admin
    │   └── styles/
    │       └── global.css
    ├── index.html
    ├── vite.config.js
    └── .env.example
```

---

## 🚀 PASO 1 — Base de Datos (Neon Tech)

1. Entra a [https://neon.tech](https://neon.tech) y crea una cuenta gratuita
2. Crea un nuevo proyecto → nombre: `quinielamundial`
3. Copia el **Connection string** (formato: `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`)
4. Guárdalo, lo usarás en el siguiente paso

---

## 🚀 PASO 2 — Backend en Render

### 2.1 Preparar el repositorio

Sube el código a GitHub:
```bash
cd quiniela-mundial
git init
git add .
git commit -m "Quiniela Mundial 2026 - initial commit"
# Crea un repo en GitHub y conecta:
git remote add origin https://github.com/TU_USUARIO/quiniela-mundial.git
git push -u origin main
```

### 2.2 Crear el servicio en Render

1. Ve a [https://render.com](https://render.com) → New → **Web Service**
2. Conecta tu repo de GitHub
3. Configura:
   - **Name:** `quiniela-mundial-api`
   - **Root Directory:** `backend`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (o Starter para mejor rendimiento)

4. Agrega las **Environment Variables**:
   ```
   DATABASE_URL     = (tu connection string de Neon)
   JWT_SECRET       = (genera uno con: openssl rand -base64 32)
   NODE_ENV         = production
   FRONTEND_URL     = https://quiniela-mundial.pages.dev
   ADMIN_WHATSAPP   = +502XXXXXXXX
   PORT             = 3000
   ```

5. Click **Create Web Service** y espera que termine el deploy

### 2.3 Correr las migraciones

Una vez que el servicio esté corriendo, ve a la consola Shell de Render y ejecuta:
```bash
node src/lib/migrate.js
```

Esto crea todas las tablas y el usuario admin:
- **Email:** `admin@quinielamundial.gt`
- **Contraseña:** `Admin2026!`

⚠️ **Cambia la contraseña del admin inmediatamente después.**

Anota la URL de tu API, ejemplo: `https://quiniela-mundial-api.onrender.com`

---

## 🚀 PASO 3 — Frontend en Cloudflare Pages

### 3.1 Configurar variables de entorno del frontend

Crea `frontend/.env.production`:
```env
VITE_API_URL=https://quiniela-mundial-api.onrender.com
VITE_ADMIN_WHATSAPP=+502XXXXXXXX
```

### 3.2 Deploy en Cloudflare Pages

**Opción A — Desde GitHub (recomendado):**
1. Ve a [https://pages.cloudflare.com](https://pages.cloudflare.com)
2. New project → Connect to Git
3. Selecciona tu repositorio
4. Configura el build:
   - **Project name:** `quiniela-mundial`
   - **Root directory:** `frontend`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Agrega las **Environment Variables** en Cloudflare:
   ```
   VITE_API_URL           = https://quiniela-mundial-api.onrender.com
   VITE_ADMIN_WHATSAPP    = +502XXXXXXXX
   ```
6. Click **Save and Deploy**

**Opción B — Deploy manual:**
```bash
cd frontend
npm install
npm run build
# Instala Wrangler CLI:
npm install -g wrangler
wrangler pages deploy dist --project-name quiniela-mundial
```

---

## 🎮 Uso del Sistema

### Como administrador:
1. Ingresa con `admin@quinielamundial.gt` / `Admin2026!`
2. Ve al panel `/admin`
3. **Tab "Usuarios":** Activa cuentas de usuarios que enviaron comprobante
4. **Tab "Partidos":** Carga resultados cuando termine cada partido
5. Al cargar un resultado, el sistema automáticamente:
   - Calcula puntos de todos los pronósticos
   - Recalcula la tabla de posiciones

### Como jugador:
1. Se registra en `/registro` (con código de referido si tiene)
2. Paga Q50 y envía comprobante por WhatsApp
3. Admin activa su cuenta (máx. 24h)
4. Ingresa pronósticos en `/partidos` (hasta 5 min antes de cada partido)
5. Sigue su posición en `/tabla`
6. Comparte su código en `/mis-pronosticos` para referidos

---

## 📡 API Endpoints

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Registro |
| POST | `/api/auth/login` | ❌ | Login |
| GET | `/api/auth/me` | ✅ | Perfil actual |
| GET | `/api/matches` | ❌ | Lista de partidos |
| POST | `/api/matches` | Admin | Crear partido |
| PATCH | `/api/matches/:id/result` | Admin | Cargar resultado |
| GET | `/api/predictions/my` | ✅ | Mis pronósticos |
| POST | `/api/predictions` | ✅ Activo | Guardar pronóstico |
| GET | `/api/leaderboard` | ❌ | Tabla de posiciones |
| GET | `/api/admin/users` | Admin | Lista usuarios |
| PATCH | `/api/admin/users/:id/activate` | Admin | Activar/desactivar cuenta |
| GET | `/api/admin/stats` | Admin | Estadísticas generales |

---

## 🔒 Sistema de Puntuación

| Tipo de acierto | Puntos |
|----------------|--------|
| Resultado correcto (ganador o empate) | 3 pts |
| Resultado + marcador exacto | 5 pts (+2 bonus) |
| Sin acierto | 0 pts |

**Desempate:**
1. Mayor cantidad de referidos activos (pagaron Q50)
2. Mayor cantidad de marcadores exactos (5 pts)
3. División del premio si persiste empate

---

## 💰 Distribución del Pozo

| Destino | Porcentaje |
|---------|-----------|
| Gastos de administración | 30% |
| Primer lugar | 40% |
| Segundo lugar | 20% |
| Tercer lugar | 10% |

---

## 🛠 Desarrollo Local

```bash
# Backend
cd backend
cp .env.example .env
# Edita .env con tu DATABASE_URL
npm install
node src/lib/migrate.js  # crea tablas
npm run dev              # puerto 3000

# Frontend (otra terminal)
cd frontend
cp .env.example .env
# Edita VITE_API_URL=http://localhost:3000
npm install
npm run dev              # puerto 5173
```

---

## ⚠️ Notas Importantes

- El plan gratuito de Render tiene "cold starts" (el servidor se duerme tras inactividad). Considera el plan Starter ($7/mes) para producción.
- Neon Tech Free tier: 0.5GB storage, suficiente para una quiniela.
- Cloudflare Pages: completamente gratuito.
- El link de referido funciona como: `https://tu-dominio.pages.dev/registro?ref=CODIGO`
