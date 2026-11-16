import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { tools } from './src/tools-meta.js';

const root = fileURLToPath(new URL('.', import.meta.url));
const pages = ['', ...tools.map((t) => t.id), 'about', 'privacy'];
const input = Object.fromEntries(
  pages.map((p) => [p || 'main', resolve(root, p ? `${p}/index.html` : 'index.html')])
);

export default defineConfig({
  build: { rollupOptions: { input } },
});
