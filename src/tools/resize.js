import { download, toBlob, baseName } from '../util.js';
export default {
  id: 'resize',
  title: 'تغيير حجم الصورة',
  icon: '📐',
  cat: 'أدوات الصور',
  desc: 'غيّر أبعاد الصورة بالبكسل',
  render(el) {
    el.innerHTML = `
      <input type="file" id="f" accept="image/*">
      <div class="row">
        <div>العرض<input type="number" id="w" min="1"></div>
        <div>الارتفاع<input type="number" id="h" min="1"></div>
      </div>
      <label><input type="checkbox" id="lock" checked> الحفاظ على النسبة</label><br>
      <button class="btn" id="go">تغيير وتنزيل PNG</button>
      <p class="msg" id="out"></p>`;
    let ratio = 1, bmp = null, file = null;
    const w = el.querySelector('#w'), h = el.querySelector('#h'), lock = el.querySelector('#lock');
    el.querySelector('#f').onchange = async (e) => {
      file = e.target.files[0]; if (!file) return;
      bmp = await createImageBitmap(file);
      w.value = bmp.width; h.value = bmp.height; ratio = bmp.width / bmp.height;
    };
    w.oninput = () => { if (lock.checked && w.value) h.value = Math.round(w.value / ratio); };
    h.oninput = () => { if (lock.checked && h.value) w.value = Math.round(h.value * ratio); };
    el.querySelector('#go').onclick = async () => {
      const out = el.querySelector('#out');
      if (!bmp) { out.textContent = 'اختر صورة أولاً.'; return; }
      const c = document.createElement('canvas');
      c.width = +w.value; c.height = +h.value;
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      download(await toBlob(c, 'image/png'), baseName(file.name) + `-${c.width}x${c.height}.png`);
      out.textContent = 'تم التنزيل.';
    };
  },
};
