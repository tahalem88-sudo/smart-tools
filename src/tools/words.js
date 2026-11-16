export default {
  id: 'words',
  title: 'عدّاد الكلمات',
  icon: '📝',
  cat: 'أدوات النصوص',
  desc: 'عدّ الكلمات والحروف وتنظيف النص',
  render(el) {
    el.innerHTML = `
      <textarea id="t" placeholder="اكتب أو الصق نصك هنا..."></textarea>
      <div class="stats">
        <div class="stat"><b id="w">0</b>كلمة</div>
        <div class="stat"><b id="c">0</b>حرف</div>
        <div class="stat"><b id="cs">0</b>بدون مسافات</div>
        <div class="stat"><b id="l">0</b>سطر</div>
      </div>
      <button class="btn" id="up">أحرف كبيرة</button>
      <button class="btn" id="lo">أحرف صغيرة</button>
      <button class="btn" id="tr">إزالة المسافات الزائدة</button>
      <button class="btn alt" id="cp">نسخ</button>`;
    const t = el.querySelector('#t');
    const upd = () => {
      const v = t.value;
      el.querySelector('#w').textContent = (v.trim().match(/\S+/g) || []).length;
      el.querySelector('#c').textContent = v.length;
      el.querySelector('#cs').textContent = v.replace(/\s/g, '').length;
      el.querySelector('#l').textContent = v ? v.split('\n').length : 0;
    };
    t.addEventListener('input', upd);
    el.querySelector('#up').onclick = () => { t.value = t.value.toUpperCase(); upd(); };
    el.querySelector('#lo').onclick = () => { t.value = t.value.toLowerCase(); upd(); };
    el.querySelector('#tr').onclick = () => {
      t.value = t.value.replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
      upd();
    };
    el.querySelector('#cp').onclick = () => navigator.clipboard.writeText(t.value);
  },
};
