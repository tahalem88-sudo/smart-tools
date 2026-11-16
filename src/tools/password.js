const SETS = {
  lo: 'abcdefghijklmnopqrstuvwxyz',
  up: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  di: '0123456789',
  sy: '!@#$%^&*()-_=+[]{};:,.?',
};
function rand(n) {
  const max = Math.floor(0x100000000 / n) * n;
  const a = new Uint32Array(1);
  do { crypto.getRandomValues(a); } while (a[0] >= max);
  return a[0] % n;
}
export default {
  id: 'password',
  render(el) {
    el.innerHTML = `
      <input type="text" id="p" dir="ltr" readonly>
      <p class="msg" id="s"></p>
      <div>الطول: <b id="lv">16</b></div>
      <input type="range" id="len" min="8" max="64" value="16">
      <div class="row">
        <label><input type="checkbox" id="up" checked> A-Z</label>
        <label><input type="checkbox" id="lo" checked> a-z</label>
        <label><input type="checkbox" id="di" checked> 0-9</label>
        <label><input type="checkbox" id="sy" checked> !@#</label>
      </div>
      <button class="btn" id="gen">توليد جديد</button>
      <button class="btn alt" id="cp">نسخ</button>`;
    const q = (id) => el.querySelector('#' + id);
    const gen = () => {
      const len = +q('len').value;
      q('lv').textContent = len;
      let keys = ['up', 'lo', 'di', 'sy'].filter((k) => q(k).checked);
      if (!keys.length) { q('lo').checked = true; keys = ['lo']; }
      const pool = keys.map((k) => SETS[k]).join('');
      const chars = keys.map((k) => SETS[k][rand(SETS[k].length)]);
      while (chars.length < len) chars.push(pool[rand(pool.length)]);
      for (let i = chars.length - 1; i > 0; i--) { const j = rand(i + 1); [chars[i], chars[j]] = [chars[j], chars[i]]; }
      q('p').value = chars.join('');
      const bits = len * Math.log2(pool.length);
      q('s').textContent = 'القوة: ' + (bits < 40 ? 'ضعيفة' : bits < 60 ? 'متوسطة' : bits < 80 ? 'قوية' : 'قوية جداً');
    };
    ['len', 'up', 'lo', 'di', 'sy'].forEach((id) => q(id).addEventListener('input', gen));
    q('gen').onclick = gen;
    q('cp').onclick = () => navigator.clipboard.writeText(q('p').value).then(() => (q('s').textContent = 'تم النسخ ✅'));
    gen();
  },
};
