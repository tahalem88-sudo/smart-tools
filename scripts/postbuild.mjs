import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL } from '../site.config.mjs';
import { tools } from '../src/tools-meta.js';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
if (!SITE_URL) {
  console.log('⚠️  SITE_URL فارغ في site.config.mjs: لم يُنشأ sitemap.xml. ضع رابط موقعك بعد النشر ثم أعد البناء.');
  fs.writeFileSync(path.join(dist, 'robots.txt'), 'User-agent: *\nAllow: /\n');
  process.exit(0);
}
const paths = ['/', ...tools.map((t) => `/${t.id}/`), '/about/', '/privacy/'];
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${SITE_URL}${p}</loc></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(dist, 'sitemap.xml'), xml);
fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
console.log('✅ sitemap.xml و robots.txt جاهزان');
