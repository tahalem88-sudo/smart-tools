import { PDFDocument } from 'pdf-lib';
import { download, fmtSize } from '../util.js';
const A4 = [595.28, 841.89];
async function jpegBytes(f) {
  const bmp = await createImageBitmap(f);
  const c = document.createElement('canvas');
  c.width = bmp.width; c.height = bmp.height;
  const x = c.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(bmp, 0, 0);
  const b = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.92));
  return new Uint8Array(await b.arrayBuffer());
}
async function embed(doc, f) {
  if (f.type === 'image/jpeg') return doc.embedJpg(await f.arrayBuffer());
  if (f.type === 'image/png') {
    try { return await doc.embedPng(await f.arrayBuffer()); } catch {}
  }
  return doc.embedJpg(await jpegBytes(f));
}
export default {
  id: 'img2pdf',
  render(el) {
    el.innerHTML = `
      <input type="file" id="f" accept="image/*" multiple>
      <ul class="files" id="list"></ul>
      <select id="mode">
        <option value="fit">حجم الصفحة مطابق للصورة</option>
        <option value="a4">صفحات A4</option>
      </select>
      <button class="btn" id="go">إنشاء PDF</button>
      <p class="msg" id="out"></p>`;
    let files = [];
    const list = el.querySelector('#list'), out = el.querySelector('#out');
    const draw = () => {
      list.innerHTML = '';
      files.forEach((f, i) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${i + 1}. ${f.name} (${fmtSize(f.size)})</span>
          <span><button class="btn alt" data-a="up">↑</button><button class="btn alt" data-a="dn">↓</button><button class="btn alt" data-a="rm">✕</button></span>`;
        li.querySelector('[data-a=up]').onclick = () => { if (i > 0) { [files[i - 1], files[i]] = [files[i], files[i - 1]]; draw(); } };
        li.querySelector('[data-a=dn]').onclick = () => { if (i < files.length - 1) { [files[i + 1], files[i]] = [files[i], files[i + 1]]; draw(); } };
        li.querySelector('[data-a=rm]').onclick = () => { files.splice(i, 1); draw(); };
        list.appendChild(li);
      });
    };
    el.querySelector('#f').onchange = (e) => { files = files.concat([...e.target.files]); e.target.value = ''; draw(); };
    el.querySelector('#go').onclick = async () => {
      if (!files.length) { out.textContent = 'اختر صورة واحدة على الأقل.'; return; }
      out.textContent = 'جارٍ الإنشاء...';
      try {
        const doc = await PDFDocument.create();
        const mode = el.querySelector('#mode').value;
        for (const f of files) {
          const img = await embed(doc, f);
          const { width: w, height: h } = img;
          if (mode === 'fit') {
            doc.addPage([w, h]).drawImage(img, { x: 0, y: 0, width: w, height: h });
          } else {
            const [W, H] = w > h ? [A4[1], A4[0]] : A4;
            const s = Math.min((W - 40) / w, (H - 40) / h);
            const dw = w * s, dh = h * s;
            doc.addPage([W, H]).drawImage(img, { x: (W - dw) / 2, y: (H - dh) / 2, width: dw, height: dh });
          }
        }
        download(new Blob([await doc.save()], { type: 'application/pdf' }), 'images.pdf');
        out.textContent = `تم إنشاء PDF من ${files.length} صورة.`;
      } catch (e) { out.textContent = 'فشل الإنشاء: ' + e.message; }
    };
  },
};
