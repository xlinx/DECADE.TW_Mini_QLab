import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', setupFiles: './tests/setup.js', globals: true },
  build: {
    lib: { entry: 'src/PAGEXQ.jsx', formats: ['es'], fileName: 'mini-qlab', cssFileName: 'mini-qlab' },
    rollupOptions: { external: ['react', 'react-dom', 'react/jsx-runtime'] }
  }
});
