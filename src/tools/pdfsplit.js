import { PDFDocument } from 'pdf-lib';
import { download, baseName } from '../util.js';
export default {
  id: 'pdfsplit',
  render(el) {
    el.innerHTML = `
      <input type="file" id="f" accept="application/pdf">
      <p class="msg" id="info"></p>
      <input type="text" id="r" dir="ltr" placeholder="1-3, 5, 8-10">
      <button class="btn" id="go">استخراج وتنزيل</button>
      <p class="msg" id="out"></p>`;
    let file = null, count = 0;
    const info = el.querySelector('#info'), out = el.querySelector('#out');
    el.querySelector('#f').onchange = async (e) => {
      file = e.target.files[0]; out.textContent = '';
      if (!file) return;
      try {
        const doc = await PDFDocument.load(await file.arrayBuffer());
        count = doc.getPageCount();
        info.textContent = `عدد الصفحات: ${count}`;
      } catch (err) { count = 0; info.textContent = 'تعذّر قراءة الملف (محمي أو تالف؟).'; }
    };
    const parse = (s) => {
      s = s.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/،/g, ',');
      const idx = [];
      for (const part of s.split(',').map((x) => x.trim()).filter(Boolean)) {
        const m = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
        if (!m) throw new Error(`صيغة غير صحيحة: ${part}`);
        const a = +m[1], b = m[2] ? +m[2] : a;
        if (a < 1 || b < a || b > count) throw new Error(`النطاق ${part} خارج حدود الملف (1-${count})`);
        for (let i = a; i <= b; i++) if (!idx.includes(i - 1)) idx.push(i - 1);
      }
      if (!idx.length) throw new Error('اكتب الصفحات المطلوبة.');
      return idx;
    };
    el.querySelector('#go').onclick = async () => {
      if (!file || !count) { out.textContent = 'اختر ملف PDF أولاً.'; return; }
      try {
        const idx = parse(el.querySelector('#r').value);
        const src = await PDFDocument.load(await file.arrayBuffer());
        const dst = await PDFDocument.create();
        (await dst.copyPages(src, idx)).forEach((p) => dst.addPage(p));
        download(new Blob([await dst.save()], { type: 'application/pdf' }), baseName(file.name) + '-extract.pdf');
        out.textContent = `تم استخراج ${idx.length} صفحة.`;
      } catch (err) { out.textContent = err.message; }
    };
  },
};
