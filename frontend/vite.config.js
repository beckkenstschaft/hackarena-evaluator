import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

const certPath = path.resolve(__dirname, 'certificates');

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    https: fs.existsSync(certPath) ? {
      pfx: path.join(certPath, 'server.pfx'),
      passphrase: 'changeit'
    } : false,
    proxy: {
      '/api': {
        target: 'https://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
