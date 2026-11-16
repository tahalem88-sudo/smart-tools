import './style.css';
import { tools, SITE } from './tools-meta.js';

const REPO = 'https://github.com/tahalem88-sudo/smart-tools';

const loaders = {
  words: () => import('./tools/words.js'),
  compress: () => import('./tools/compress.js'),
  resize: () => import('./tools/resize.js'),
  png2jpg: () => import('./tools/png2jpg.js'),
  crop: () => import('./tools/crop.js'),
  pdfmerge: () => import('./tools/pdfmerge.js'),
  pdfsplit: () => import('./tools/pdfsplit.js'),
  img2pdf: () => import('./tools/img2pdf.js'),
  qr: () => import('./tools/qr.js'),
  barcode: () => import('./tools/barcode.js'),
  json: () => import('./tools/json.js'),
  password: () => import('./tools/password.js'),
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
const byId = (id) => tools.find((t) => t.id === id);
const norm = (s) => s.toLowerCase().replace(/[\u064B-\u0652\u0640]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');

const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
function toggleFav(id) {
  const f = store.get('favs', []);
  const i = f.indexOf(id);
  if (i >= 0) f.splice(i, 1); else f.unshift(id);
  store.set('favs', f);
  return i < 0;
}

let saved = null;
try { saved = localStorage.getItem('theme'); } catch {}
root.dataset.theme = saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

/* تثبيت التطبيق */
let deferred = null;
addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); deferred = e;
  const b = document.getElementById('install'); if (b) b.hidden = false;
});
addEventListener('appinstalled', () => {
  deferred = null;
  const b = document.getElementById('install'); if (b) b.hidden = true;
});

const top = () => `
  <div class="top">
    <a class="logo" href="/"><span class="mark">⚡</span>${SITE}<span class="badge">FREE</span></a>
    <div class="top-actions">
      <button class="icon-btn" id="install" hidden aria-label="تثبيت التطبيق" title="تثبيت التطبيق">📲</button>
      <button class="icon-btn" id="theme" aria-label="تبديل الوضع">${root.dataset.theme === 'dark' ? '☀️' : '🌙'}</button>
    </div>
  </div>`;

const footer = `<footer>
  <p><a href="/about/">من نحن</a> · <a href="/privacy/">سياسة الخصوصية</a> · <a href="${REPO}/issues/new" target="_blank" rel="noopener">اقترح أداة</a></p>
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
  const ib = app.querySelector('#install');
  ib.hidden = !deferred;
  ib.onclick = async () => {
    if (!deferred) return;
    deferred.prompt();
    try { await deferred.userChoice; } catch {}
    deferred = null; ib.hidden = true;
  };
}

const card = (t, i = 0, star = true) => {
  const on = store.get('favs', []).includes(t.id);
  return `<div class="cw"><a class="card ${colorOf[t.cat] || 'c-blue'}" style="animation-delay:${i * 50}ms" href="/${t.id}/">
    <div class="ic">${t.icon}</div><h3>${t.title}</h3><small>${t.desc}</small><span class="cat">${t.cat}</span></a>
    ${star ? `<button class="star ${on ? 'on' : ''}" data-id="${t.id}" aria-label="المفضلة">${on ? '★' : '☆'}</button>` : ''}</div>`;
};

function home() {
  document.title = `${SITE} - أدوات مجانية: ضغط الصور، دمج PDF، QR Code وأكثر`;
  let cat = 'الكل', q = '';
  app.innerHTML = `<div class="wrap">${top()}
    <section class="hero">
      <span class="pill">✨ ${tools.length} أداة مجانية · بدون تسجيل</span>
      <h1>كل أدواتك في <span class="grad">مكان واحد</span></h1>
      <p>أدوات سريعة وسهلة لإنجاز أعمالك اليومية، تعمل مباشرة في متصفحك وبخصوصية كاملة.</p>
      <div class="searchbox"><span>🔍</span><input class="search" id="s" placeholder="ابحث عن أداة..." autocomplete="off"></div>
      <div class="chips" id="chips"></div>
    </section>
    <div id="mine"></div>
    <div class="grid" id="g"></div>
    <section class="features">
      <div class="feat"><b>⚡</b><h4>سريعة</h4><p>المعالجة تتم على جهازك فوراً</p></div>
      <div class="feat"><b>🔒</b><h4>خصوصية</h4><p>لا نرفع ملفاتك إلى أي خادم</p></div>
      <div class="feat"><b>📲</b><h4>تعمل كتطبيق</h4><p>ثبّتها على هاتفك واستخدمها بلا اتصال</p></div>
    </section>
    ${footer}</div>`;

  const g = app.querySelector('#g'), chips = app.querySelector('#chips'), mine = app.querySelector('#mine');
  const drawChips = () => {
    chips.innerHTML = cats.map((c) => `<button class="chip ${c === cat ? 'on' : ''}" data-c="${c}">${c}</button>`).join('');
    chips.querySelectorAll('.chip').forEach((el) => (el.onclick = () => { cat = el.dataset.c; redraw(); }));
  };
  const drawMine = () => {
    if (q.trim() || cat !== 'الكل') { mine.innerHTML = ''; return; }
    const favIds = store.get('favs', []);
    const favs = favIds.map(byId).filter(Boolean);
    const rec = store.get('recent', []).filter((id) => !favIds.includes(id)).map(byId).filter(Boolean).slice(0, 3);
    mine.innerHTML =
      (favs.length ? `<h3 class="list-title">⭐ المفضلة</h3><div class="grid">${favs.map((t, i) => card(t, i)).join('')}</div>` : '') +
      (rec.length ? `<h3 class="list-title">🕘 استخدمتها مؤخراً</h3><div class="grid">${rec.map((t, i) => card(t, i)).join('')}</div>` : '') +
      (favs.length || rec.length ? '<h3 class="list-title">كل الأدوات</h3>' : '');
  };
  const draw = () => {
    const nq = norm(q.trim());
    const list = tools.filter((t) => (cat === 'الكل' || t.cat === cat) && norm(t.title + t.desc + t.cat + t.seoTitle).includes(nq));
    g.innerHTML = list.length ? list.map((t, i) => card(t, i)).join('') : '<p class="msg" style="grid-column:1/-1;text-align:center">لا توجد نتائج مطابقة 🔎</p>';
  };
  const redraw = () => { drawChips(); drawMine(); draw(); };
  redraw();
  app.querySelector('#s').addEventListener('input', (e) => { q = e.target.value; drawMine(); draw(); });
  app.querySelector('.wrap').addEventListener('click', (e) => {
    const b = e.target.closest('.star');
    if (!b) return;
    toggleFav(b.dataset.id);
    redraw();
  });
  bindTop();
}

async function tool(t) {
  document.title = `${t.seoTitle} | ${SITE}`;
  store.set('recent', [t.id, ...store.get('recent', []).filter((x) => x !== t.id)].slice(0, 6));
  const related = tools.filter((x) => x.id !== t.id).sort((a, b) => (b.cat === t.cat) - (a.cat === t.cat)).slice(0, 3);
  app.innerHTML = `<div class="wrap">${top()}
    <a class="back" href="/">→ كل الأدوات</a>
    <div class="panel">
      <h2>${t.icon} ${t.title}</h2>
      <p class="msg">${t.desc}</p>
      <div class="tool-actions">
        <button class="btn alt" id="share">🔗 مشاركة</button>
        <button class="btn alt" id="fav"></button>
      </div>
      <div id="box"><p class="msg">جارٍ التحميل...</p></div>
    </div>
    <section class="how"><h3>طريقة الاستخدام</h3><ol>${t.how.map((s) => `<li>${s}</li>`).join('')}</ol>
      <p class="msg">${t.seoDesc}</p></section>
    <section class="related"><h3>أدوات أخرى قد تفيدك</h3><div class="grid">${related.map((x, i) => card(x, i, false)).join('')}</div></section>
    ${footer}</div>`;
  bindTop();

  const fav = app.querySelector('#fav');
  const paintFav = () => { fav.textContent = store.get('favs', []).includes(t.id) ? '★ في المفضلة' : '☆ أضف للمفضلة'; };
  paintFav();
  fav.onclick = () => { toggleFav(t.id); paintFav(); };
  const share = app.querySelector('#share');
  share.onclick = async () => {
    try {
      if (navigator.share) await navigator.share({ title: t.seoTitle, url: location.href });
      else { await navigator.clipboard.writeText(location.href); share.textContent = '✅ تم نسخ الرابط'; }
    } catch {}
  };

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
    html: `<p>Smart Tools مجموعة أدوات رقمية مجانية يحتاجها الناس يومياً: ضغط الصور وقصها وتحويلها، دمج وتقسيم PDF، إنشاء QR Code والباركود، تنسيق JSON، توليد كلمات المرور، والحاسبة.</p>
      <p>هدفنا أن تكون الأدوات سريعة وسهلة وبواجهة عربية، وأن تحافظ على خصوصيتك: معظم الأدوات تعمل بالكامل داخل متصفحك، فلا تُرفع ملفاتك إلى أي خادم.</p>
      <p>يمكنك تثبيت الموقع على هاتفك كتطبيق واستخدامه حتى دون اتصال بالإنترنت.</p>
      <p>نعمل باستمرار على إضافة أدوات جديدة، وإن كان لديك اقتراح أو واجهتك مشكلة فيمكنك <a href="${REPO}/issues/new" target="_blank" rel="noopener">إرسال اقتراح أو بلاغ من هنا</a>.</p>`,
  },
  privacy: {
    title: 'سياسة الخصوصية',
    html: `<p><b>ملفاتك:</b> الأدوات تعالج الملفات والنصوص داخل متصفحك على جهازك، ولا نرفعها ولا نخزّنها على خوادمنا.</p>
      <p><b>التخزين المحلي:</b> نحفظ في متصفحك اختيار الوضع الليلي أو النهاري، وقائمة أدواتك المفضلة والأخيرة، وهي لا تغادر جهازك.</p>
      <p><b>العمل دون اتصال:</b> نخزّن ملفات الموقع في متصفحك (Service Worker) ليعمل أسرع وبدون إنترنت.</p>
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
  const t = byId(seg);
  if (t) tool(t);
  else if (pages[seg]) page(seg);
  else home();
  window.scrollTo(0, 0);
}

document.addEventListener('keydown', (e) => {
  const s = document.getElementById('s');
  if (e.key === '/' && s && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
    e.preventDefault(); s.focus();
  }
});

route();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
