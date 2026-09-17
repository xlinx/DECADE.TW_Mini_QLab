import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Electron 桌面应用：自包含构建（React 内联，无外部依赖），产物 dist-app/index.html
  if (mode === 'electron') {
    return {
      plugins: [react()],
      base: './',
      build: {
        outDir: 'dist-electron',
        emptyOutDir: true,
        rollupOptions: {
          input: 'index.html'
        }
      }
    };
  }else if (mode === 'web') {
    return {
      plugins: [react()],
      base: './',
      build: {
        outDir: 'dist-web',
        emptyOutDir: true,
        rollupOptions: {
          input: 'index.html'
        }
      }
    };
  }

  // 默认：npm library 构建（mini-qlab.js），React 作为 peer external
  return {
    plugins: [react()],
    test: { environment: 'jsdom', setupFiles: './tests/setup.js', globals: true, env: { NODE_ENV: 'test' } },
    build: {
      outDir: 'dist-npm',
      emptyOutDir: true,
      lib: { entry: 'src/PAGEXQ.jsx', formats: ['es'], fileName: 'mini-qlab', cssFileName: 'style' },
      rollupOptions: { external: ['react', 'react-dom', 'react/jsx-runtime'] }
    }
  };
});
