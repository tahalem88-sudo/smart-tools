import './style.css';
import { tools, SITE } from './tools-meta.js';

const loaders = {
  words: () => import('./tools/words.js'),
  compress: () => import('./tools/compress.js'),
  resize: () => import('./tools/resize.js'),
  png2jpg: () => import('./tools/png2jpg.js'),
  pdfmerge: () => import('./tools/pdfmerge.js'),
  pdfsplit: () => import('./tools/pdfsplit.js'),
  qr: () => import('./tools/qr.js'),
  json: () => import('./tools/json.js'),
  password: () => import('./tools/password.js'),
  crop: () => import('./tools/crop.js'),
  img2pdf: () => import('./tools/img2pdf.js'),
  barcode: () => import('./tools/barcode.js'),
  calc: () => import('./tools/calc.js'),
};

const app = document.getElementById('app');
const root = document.documentElement;
const colorOf = {
  'أدوات النصوص': 'c-blue',
  'أدوات الصور': 'c-pink',
  'أدوات الملفات': 'c-orange',
  'أدوات المطورين': 'c-green',
  'أدوات الحساب': 'c-purple',
};
const cats = ['الكل', ...new Set(tools.map((t) => t.cat))];

let saved = null;
try { saved = localStorage.getItem('theme'); } catch {}
root.dataset.theme = saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

const top = () => `
  <div class="top">
    <a class="logo" href="/"><span class="mark">⚡</span>${SITE}<span class="badge">FREE</span></a>
    <button class="icon-btn" id="theme" aria-label="تبديل الوضع">${root.dataset.theme === 'dark' ? '☀️' : '🌙'}</button>
  </div>`;

const footer = `<footer>
  <p><a href="/about/">من نحن</a> · <a href="/privacy/">سياسة الخصوصية</a></p>
  <p>© ${new Date().getFullYear()} ${SITE} · أدوات مجانية تعمل داخل متصفحك، وملفاتك لا تغادر جهازك 🔒</p>
</footer>`;

function bindTop() {
  const b = app.querySelector('#theme');
  b.onclick = () => {
    const n = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = n;
    try { localStorage.setItem('theme', n); } catch {}
    b.textContent = n === 'dark' ? '☀️' : '🌙';
  };
}

const card = (t, i = 0) => `<a class="card ${colorOf[t.cat] || 'c-blue'}" style="animation-delay:${i * 50}ms" href="/${t.id}/">
  <div class="ic">${t.icon}</div><h3>${t.title}</h3><small>${t.desc}</small><span class="cat">${t.cat}</span></a>`;

function home() {
  document.title = `${SITE} - أدوات مجانية: ضغط الصور، دمج PDF، QR Code وأكثر`;
  let cat = 'الكل', q = '';
  app.innerHTML = `<div class="wrap">${top()}
    <section class="hero">
      <span class="pill">✨ مجاني 100% · بدون تسجيل</span>
      <h1>كل أدواتك في <span class="grad">مكان واحد</span></h1>
      <p>أدوات سريعة وسهلة لإنجاز أعمالك اليومية، تعمل مباشرة في متصفحك وبخصوصية كاملة.</p>
      <div class="searchbox"><span>🔍</span><input class="search" id="s" placeholder="ابحث عن أداة..."></div>
      <div class="chips" id="chips"></div>
    </section>
    <div class="grid" id="g"></div>
    <section class="features">
      <div class="feat"><b>⚡</b><h4>سريعة</h4><p>المعالجة تتم على جهازك فوراً</p></div>
      <div class="feat"><b>🔒</b><h4>خصوصية</h4><p>لا نرفع ملفاتك إلى أي خادم</p></div>
      <div class="feat"><b>🎁</b><h4>مجانية</h4><p>بلا اشتراك ولا حدود للاستخدام</p></div>
    </section>
    ${footer}</div>`;
  const g = app.querySelector('#g'), chips = app.querySelector('#chips');
  const drawChips = () => {
    chips.innerHTML = cats.map((c) => `<button class="chip ${c === cat ? 'on' : ''}" data-c="${c}">${c}</button>`).join('');
    chips.querySelectorAll('.chip').forEach((el) => (el.onclick = () => { cat = el.dataset.c; drawChips(); draw(); }));
  };
  const draw = () => {
    const list = tools.filter((t) => (cat === 'الكل' || t.cat === cat) && (t.title + t.desc + t.cat).includes(q.trim()));
    g.innerHTML = list.length ? list.map(card).join('') : '<p class="msg" style="grid-column:1/-1;text-align:center">لا توجد نتائج مطابقة 🔎</p>';
  };
  drawChips(); draw();
  app.querySelector('#s').addEventListener('input', (e) => { q = e.target.value; draw(); });
  bindTop();
}

async function tool(t) {
  document.title = `${t.seoTitle} | ${SITE}`;
  const related = tools.filter((x) => x.id !== t.id).sort((a, b) => (b.cat === t.cat) - (a.cat === t.cat)).slice(0, 3);
  app.innerHTML = `<div class="wrap">${top()}
    <a class="back" href="/">→ كل الأدوات</a>
    <div class="panel"><h2>${t.icon} ${t.title}</h2><p class="msg">${t.desc}</p><div id="box"><p class="msg">جارٍ التحميل...</p></div></div>
    <section class="how"><h3>طريقة الاستخدام</h3><ol>${t.how.map((s) => `<li>${s}</li>`).join('')}</ol>
      <p class="msg">${t.seoDesc}</p></section>
    <section class="related"><h3>أدوات أخرى قد تفيدك</h3><div class="grid">${related.map(card).join('')}</div></section>
    ${footer}</div>`;
  bindTop();
  const box = app.querySelector('#box');
  try {
    const m = await loaders[t.id]();
    box.innerHTML = '';
    m.default.render(box);
  } catch (e) {
    box.innerHTML = `<p class="msg">تعذّر تحميل الأداة: ${e.message}</p>`;
  }
}

const pages = {
  about: {
    title: 'من نحن',
    html: `<p>Smart Tools مجموعة أدوات رقمية مجانية يحتاجها الناس يومياً: ضغط الصور، دمج وتقسيم PDF، إنشاء QR Code، تنسيق JSON وتوليد كلمات المرور.</p>
      <p>هدفنا أن تكون الأدوات سريعة وسهلة وبواجهة عربية، وأن تحافظ على خصوصيتك: معظم الأدوات تعمل بالكامل داخل متصفحك، فلا تُرفع ملفاتك إلى أي خادم.</p>
      <p>نعمل باستمرار على إضافة أدوات جديدة. إن كان لديك اقتراح لأداة تحتاجها فنسعد بسماعه.</p>`,
  },
  privacy: {
    title: 'سياسة الخصوصية',
    html: `<p><b>ملفاتك:</b> الأدوات تعالج الملفات والنصوص داخل متصفحك على جهازك، ولا نرفعها ولا نخزّنها على خوادمنا.</p>
      <p><b>التخزين المحلي:</b> نحفظ في متصفحك اختيار الوضع الليلي أو النهاري فقط.</p>
      <p><b>خدمات خارجية:</b> نحمّل خط Cairo من Google Fonts، وقد تجمع Google بيانات تقنية بسيطة عند ذلك.</p>
      <p><b>الإعلانات:</b> قد نعرض مستقبلاً إعلانات من أطراف ثالثة مثل Google AdSense، وقد تستخدم ملفات تعريف الارتباط لعرض إعلانات مناسبة. سنحدّث هذه الصفحة عند حدوث ذلك.</p>
      <p>باستخدامك الموقع فإنك توافق على هذه السياسة، وقد نحدّثها من وقت لآخر.</p>`,
  },
};

function page(key) {
  const p = pages[key];
  document.title = `${p.title} | ${SITE}`;
  app.innerHTML = `<div class="wrap">${top()}
    <a class="back" href="/">→ الرئيسية</a>
    <div class="panel prose"><h2>${p.title}</h2>${p.html}</div>${footer}</div>`;
  bindTop();
}

function route() {
  const seg = location.pathname.split('/').filter(Boolean)[0] || '';
  const t = tools.find((x) => x.id === seg);
  if (t) tool(t);
  else if (pages[seg]) page(seg);
  else home();
  window.scrollTo(0, 0);
}
route();
