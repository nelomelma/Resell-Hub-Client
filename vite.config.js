
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  if (command === 'build' && !env.VITE_API_URL) {
    throw new Error(
      'Missing VITE_API_URL. Set the backend API URL before building.'
    );
  }

  return {
    plugins: [react()],
    preview: {
      host: '0.0.0.0',
    },
  };
});
