import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const isProd = mode === 'production';

  return {
    plugins: [react()],
    envPrefix: 'VITE_',
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(
        env.VITE_API_URL || (isProd ? 'https://quiniela-mundial-api.onrender.com' : 'http://localhost:3000')
      ),
    },
  };
});
