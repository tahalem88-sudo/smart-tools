import { PDFDocument } from 'pdf-lib';
import { download, fmtSize } from '../util.js';
export default {
  id: 'pdfmerge',
  title: 'دمج ملفات PDF',
  icon: '📚',
  cat: 'أدوات الملفات',
  desc: 'ادمج عدة ملفات PDF في ملف واحد',
  render(el) {
    el.innerHTML = `
      <input type="file" id="f" accept="application/pdf" multiple>
      <ul class="files" id="list"></ul>
      <button class="btn" id="go">دمج وتنزيل</button>
      <p class="msg" id="out"></p>`;
    let files = [];
    const list = el.querySelector('#list'), out = el.querySelector('#out');
    const draw = () => {
      list.innerHTML = '';
      files.forEach((f, i) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${i + 1}. ${f.name} (${fmtSize(f.size)})</span><button class="btn alt">✕</button>`;
        li.querySelector('button').onclick = () => { files.splice(i, 1); draw(); };
        list.appendChild(li);
      });
    };
    el.querySelector('#f').onchange = (e) => { files = files.concat([...e.target.files]); e.target.value = ''; draw(); };
    el.querySelector('#go').onclick = async () => {
      if (files.length < 2) { out.textContent = 'اختر ملفين على الأقل.'; return; }
      out.textContent = 'جارٍ الدمج...';
      try {
        const merged = await PDFDocument.create();
        for (const f of files) {
          const src = await PDFDocument.load(await f.arrayBuffer());
          const pages = await merged.copyPages(src, src.getPageIndices());
          pages.forEach((p) => merged.addPage(p));
        }
        const bytes = await merged.save();
        download(new Blob([bytes], { type: 'application/pdf' }), 'merged.pdf');
        out.textContent = 'تم الدمج.';
      } catch (e) { out.textContent = 'فشل الدمج (ملف محمي أو تالف؟): ' + e.message; }
    };
  },
};
