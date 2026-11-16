import { download, toBlob, baseName } from '../util.js';
export default {
  id: 'png2jpg',
  render(el) {
    el.innerHTML = `
      <input type="file" id="f" accept="image/png,image/*" multiple>
      <button class="btn" id="go">تحويل إلى JPG</button>
      <p class="msg" id="out"></p>`;
    const out = el.querySelector('#out');
    el.querySelector('#go').onclick = async () => {
      const files = [...el.querySelector('#f').files];
      if (!files.length) { out.textContent = 'اختر صورة أولاً.'; return; }
      let n = 0;
      for (const f of files) {
        try {
          const bmp = await createImageBitmap(f);
          const c = document.createElement('canvas');
          c.width = bmp.width; c.height = bmp.height;
          const ctx = c.getContext('2d');
          ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
          ctx.drawImage(bmp, 0, 0);
          download(await toBlob(c, 'image/jpeg', 0.92), baseName(f.name) + '.jpg');
          n++;
          await new Promise((r) => setTimeout(r, 350));
        } catch (e) { out.textContent = `تعذّر تحويل ${f.name}`; }
      }
      if (n) out.textContent = `تم تحويل ${n} صورة.`;
    };
  },
};
