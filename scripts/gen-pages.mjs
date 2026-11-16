import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL } from '../site.config.mjs';
import { tools, SITE } from '../src/tools-meta.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function shell({ p, title, desc, h1, jsonld }) {
  const url = SITE_URL ? SITE_URL + p : '';
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="google-site-verification" content="ERZzSrlvSgo_T9ml-d8hRlUU628NSodwmMHeeuLO2w4" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#6366f1" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}" />
  ${url ? `<link rel="canonical" href="${url}" />` : ''}
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="ar_AR" />
  <meta property="og:site_name" content="${SITE}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  ${url ? `<meta property="og:url" content="${url}" />` : ''}
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet" />
  ${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>` : ''}
</head>
<body>
  <div class="bg"><i></i><i></i><i></i></div>
  <div id="app"><main style="max-width:700px;margin:40px auto;padding:16px;font-family:sans-serif"><h1>${esc(h1)}</h1><p>${esc(desc)}</p></main></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
`;
}

function write(rel, html) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

write('index.html', shell({
  p: '/',
  title: `${SITE} - أدوات مجانية: ضغط الصور، دمج PDF، QR Code وأكثر`,
  desc: 'أدوات رقمية مجانية تعمل داخل متصفحك: ضغط الصور، دمج وتقسيم PDF، QR Code، تنسيق JSON ومولّد كلمات المرور. بدون تسجيل وبخصوصية كاملة.',
  h1: 'كل أدواتك في مكان واحد',
}));

for (const t of tools) {
  write(`${t.id}/index.html`, shell({
    p: `/${t.id}/`,
    title: `${t.seoTitle} | ${SITE}`,
    desc: t.seoDesc,
    h1: t.title,
    jsonld: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: t.title,
      description: t.seoDesc,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      inLanguage: 'ar',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      ...(SITE_URL ? { url: `${SITE_URL}/${t.id}/` } : {}),
    },
  }));
}

write('about/index.html', shell({
  p: '/about/',
  title: `من نحن | ${SITE}`,
  desc: 'تعرّف على Smart Tools: مجموعة أدوات رقمية مجانية تعمل داخل متصفحك وتحافظ على خصوصية ملفاتك.',
  h1: 'من نحن',
}));
write('privacy/index.html', shell({
  p: '/privacy/',
  title: `سياسة الخصوصية | ${SITE}`,
  desc: 'سياسة الخصوصية لموقع Smart Tools: كيف نتعامل مع ملفاتك وبياناتك.',
  h1: 'سياسة الخصوصية',
}));

console.log('pages generated:', tools.length + 3);
