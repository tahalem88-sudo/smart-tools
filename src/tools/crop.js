import { download, toBlob, baseName } from '../util.js';
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
export default {
  id: 'crop',
  render(el) {
    el.innerHTML = `
      <input type="file" id="f" accept="image/*">
      <p class="msg">اختر صورة، ثم اسحب على المعاينة لتحديد منطقة القص أو اختر نسبة جاهزة.</p>
      <canvas id="cv" style="display:none;width:100%;height:auto;padding:0;border:0;touch-action:none;cursor:crosshair"></canvas>
      <div id="ctl" style="display:none">
        <div class="row" id="ratios">
          <button class="btn alt" data-r="0">الكل</button>
          <button class="btn alt" data-r="1">1:1</button>
          <button class="btn alt" data-r="1.7778">16:9</button>
          <button class="btn alt" data-r="1.3333">4:3</button>
          <button class="btn alt" data-r="0.75">3:4</button>
          <button class="btn alt" data-r="0.5625">9:16</button>
        </div>
        <div class="row">
          <div>X<input type="number" id="x"></div>
          <div>Y<input type="number" id="y"></div>
          <div>العرض<input type="number" id="w"></div>
          <div>الارتفاع<input type="number" id="h"></div>
        </div>
        <button class="btn" id="go">قص وتنزيل PNG</button>
      </div>
      <p class="msg" id="out"></p>`;
    const q = (id) => el.querySelector('#' + id);
    const cv = q('cv'), ctx = cv.getContext('2d'), out = q('out');
    let bmp = null, file = null, ratio = 0, start = null, drag = false;
    const rect = { x: 0, y: 0, w: 0, h: 0 };

    const draw = () => {
      const W = cv.width, H = cv.height, s = W / bmp.width;
      ctx.drawImage(bmp, 0, 0, W, H);
      const x = rect.x * s, y = rect.y * s, w = rect.w * s, h = rect.h * s;
      ctx.fillStyle = 'rgba(0,0,0,.55)';
      ctx.fillRect(0, 0, W, y);
      ctx.fillRect(0, y + h, W, H - y - h);
      ctx.fillRect(0, y, x, h);
      ctx.fillRect(x + w, y, W - x - w, h);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);
    };
    const sync = () => {
      q('x').value = Math.round(rect.x); q('y').value = Math.round(rect.y);
      q('w').value = Math.round(rect.w); q('h').value = Math.round(rect.h);
      draw();
    };
    const setRatio = (r) => {
      ratio = r;
      if (!r) { Object.assign(rect, { x: 0, y: 0, w: bmp.width, h: bmp.height }); }
      else {
        const w = Math.min(bmp.width, bmp.height * r), h = w / r;
        Object.assign(rect, { x: (bmp.width - w) / 2, y: (bmp.height - h) / 2, w, h });
      }
      sync();
    };
    const pt = (e) => {
      const r = cv.getBoundingClientRect();
      return {
        x: clamp((e.clientX - r.left) / r.width * bmp.width, 0, bmp.width),
        y: clamp((e.clientY - r.top) / r.height * bmp.height, 0, bmp.height),
      };
    };

    q('f').onchange = async (e) => {
      file = e.target.files[0]; out.textContent = '';
      if (!file) return;
      try { bmp = await createImageBitmap(file); } catch { out.textContent = 'تعذّر قراءة الصورة.'; return; }
      const s = Math.min(1, 1000 / bmp.width);
      cv.width = Math.round(bmp.width * s); cv.height = Math.round(bmp.height * s);
      cv.style.display = 'block'; q('ctl').style.display = 'block';
      setRatio(0);
    };
    q('ratios').querySelectorAll('button').forEach((b) => (b.onclick = () => bmp && setRatio(+b.dataset.r)));

    cv.onpointerdown = (e) => { if (!bmp) return; cv.setPointerCapture(e.pointerId); start = pt(e); drag = true; };
    cv.onpointermove = (e) => {
      if (!drag) return;
      const c = pt(e), dx = c.x - start.x, dy = c.y - start.y;
      const maxW = dx < 0 ? start.x : bmp.width - start.x;
      const maxH = dy < 0 ? start.y : bmp.height - start.y;
      let w = Math.min(Math.abs(dx), maxW), h = Math.min(Math.abs(dy), maxH);
      if (ratio) { w = Math.min(w, maxH * ratio); h = w / ratio; }
      rect.x = dx < 0 ? start.x - w : start.x;
      rect.y = dy < 0 ? start.y - h : start.y;
      rect.w = w; rect.h = h;
      sync();
    };
    cv.onpointerup = cv.onpointercancel = () => { drag = false; };

    ['x', 'y', 'w', 'h'].forEach((id) => q(id).addEventListener('input', () => {
      if (!bmp) return;
      rect.x = clamp(+q('x').value || 0, 0, bmp.width - 1);
      rect.y = clamp(+q('y').value || 0, 0, bmp.height - 1);
      rect.w = clamp(+q('w').value || 1, 1, bmp.width - rect.x);
      rect.h = clamp(+q('h').value || 1, 1, bmp.height - rect.y);
      draw();
    }));

    q('go').onclick = async () => {
      if (!bmp) { out.textContent = 'اختر صورة أولاً.'; return; }
      const x = Math.round(rect.x), y = Math.round(rect.y);
      const w = Math.round(rect.w), h = Math.round(rect.h);
      if (w < 1 || h < 1) { out.textContent = 'حدّد منطقة القص أولاً.'; return; }
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(bmp, x, y, w, h, 0, 0, w, h);
      download(await toBlob(c, 'image/png'), baseName(file.name) + `-crop-${w}x${h}.png`);
      out.textContent = `تم القص: ${w}×${h}`;
    };
  },
};
