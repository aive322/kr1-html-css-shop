import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Две сборки:
//  npm run build        -> dist/, сайт отдаёт Go-сервер (http://localhost:8080/)
//  npm run build:pages  -> ../docs/, сайт на GitHub Pages (https://aive322.github.io/kr1-html-css-shop/)
export default defineConfig(({ mode }) => {
  const pages = mode === 'pages';
  return {
    plugins: [react()],
    base: pages ? '/kr1-html-css-shop/' : '/',
    build: {
      outDir: pages ? '../docs' : 'dist',
      emptyOutDir: true,
      // Для GitHub Pages имена файлов без хеша: при пересборке файлы в docs/
      // заменяются, а не копятся в репозитории.
      rollupOptions: pages
        ? {
            output: {
              entryFileNames: 'assets/app.js',
              chunkFileNames: 'assets/[name].js',
              assetFileNames: 'assets/[name][extname]'
            }
          }
        : undefined
    },
    server: {
      port: 5173,
      // В режиме разработки запросы /api уходят на Go-сервер.
      proxy: { '/api': 'http://localhost:8080' }
    }
  };
});
