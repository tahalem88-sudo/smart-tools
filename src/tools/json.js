export default {
  id: 'json',
  render(el) {
    el.innerHTML = `
      <textarea id="t" dir="ltr" placeholder='{"name":"Ali","tags":["a","b"]}'></textarea>
      <button class="btn" id="f">تنسيق</button>
      <button class="btn" id="m">تصغير</button>
      <button class="btn alt" id="c">نسخ</button>
      <p class="msg" id="o"></p>`;
    const t = el.querySelector('#t'), o = el.querySelector('#o');
    const run = (fn, ok) => {
      try { t.value = fn(JSON.parse(t.value)); o.textContent = ok; }
      catch (e) { o.textContent = 'JSON غير صالح: ' + e.message; }
    };
    el.querySelector('#f').onclick = () => run((v) => JSON.stringify(v, null, 2), '✅ JSON صالح وتم تنسيقه.');
    el.querySelector('#m').onclick = () => run((v) => JSON.stringify(v), '✅ تم التصغير.');
    el.querySelector('#c').onclick = () => navigator.clipboard.writeText(t.value).then(() => (o.textContent = 'تم النسخ.'));
  },
};
