import { download, fmtSize, toBlob, baseName } from '../util.js';
export default {
  id: 'compress',
  title: 'ضغط الصور',
  icon: '🗜️',
  cat: 'أدوات الصور',
  desc: 'قلّل حجم الصورة مع الحفاظ على جودتها',
  render(el) {
    el.innerHTML = `
      <input type="file" id="f" accept="image/*">
      <div>الجودة: <b id="qv">70</b>%</div>
      <input type="range" id="q" min="10" max="95" value="70">
      <button class="btn" id="go">ضغط وتنزيل</button>
      <p class="msg" id="out"></p>`;
    const q = el.querySelector('#q');
    q.oninput = () => (el.querySelector('#qv').textContent = q.value);
    el.querySelector('#go').onclick = async () => {
      const out = el.querySelector('#out');
      const file = el.querySelector('#f').files[0];
      if (!file) { out.textContent = 'اختر صورة أولاً.'; return; }
      try {
        const bmp = await createImageBitmap(file);
        const c = document.createElement('canvas');
        c.width = bmp.width; c.height = bmp.height;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(bmp, 0, 0);
        const blob = await toBlob(c, 'image/jpeg', q.value / 100);
        out.textContent = `قبل: ${fmtSize(file.size)} ← بعد: ${fmtSize(blob.size)}`;
        download(blob, baseName(file.name) + '-compressed.jpg');
      } catch (e) { out.textContent = 'تعذّر قراءة الصورة: ' + e.message; }
    };
  },
};
