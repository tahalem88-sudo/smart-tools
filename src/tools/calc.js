const K = { pi: Math.PI, e: Math.E };
const F = {
  sqrt: Math.sqrt, sin: Math.sin, cos: Math.cos, tan: Math.tan, log: Math.log10, ln: Math.log,
  abs: Math.abs, round: Math.round, floor: Math.floor, ceil: Math.ceil, min: Math.min, max: Math.max, pow: Math.pow,
};
const fmt = (n) => (Number.isFinite(n) ? String(+n.toPrecision(12)) : '—');

function evaluate(src) {
  const s = src
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/×/g, '*').replace(/÷/g, '/').replace(/،/g, ',').replace(/π/g, 'pi').replace(/√/g, 'sqrt')
    .toLowerCase();
  const toks = [];
  let i = 0;
  while (i < s.length) {
    if (/\s/.test(s[i])) { i++; continue; }
    let m = /^(\d*\.?\d+)/.exec(s.slice(i));
    if (m) { toks.push({ n: parseFloat(m[1]) }); i += m[1].length; continue; }
    m = /^[a-z]+/.exec(s.slice(i));
    if (m) { toks.push({ id: m[0] }); i += m[0].length; continue; }
    if ('+-*/^%(),'.includes(s[i])) { toks.push({ op: s[i] }); i++; continue; }
    throw new Error('رمز غير مفهوم: ' + s[i]);
  }
  let p = 0;
  const peek = () => toks[p], next = () => toks[p++];
  const isOp = (o) => peek() && peek().op === o;
  function expr() {
    let v = term();
    while (isOp('+') || isOp('-')) { const o = next().op; const r = term(); v = o === '+' ? v + r : v - r; }
    return v;
  }
  function term() {
    let v = unary();
    while (isOp('*') || isOp('/')) { const o = next().op; const r = unary(); v = o === '*' ? v * r : v / r; }
    return v;
  }
  function unary() {
    if (isOp('-')) { next(); return -unary(); }
    if (isOp('+')) { next(); return unary(); }
    return power();
  }
  function power() {
    const b = postfix();
    if (isOp('^')) { next(); return Math.pow(b, unary()); }
    return b;
  }
  function postfix() {
    let v = primary();
    while (isOp('%')) { next(); v /= 100; }
    return v;
  }
  function primary() {
    const t = next();
    if (!t) throw new Error('التعبير ناقص');
    if (t.n !== undefined) return t.n;
    if (t.op === '(') {
      const v = expr();
      if (!isOp(')')) throw new Error('قوس ناقص');
      next(); return v;
    }
    if (t.id) {
      if (t.id in K) return K[t.id];
      const f = F[t.id];
      if (!f) throw new Error('دالة غير معروفة: ' + t.id);
      if (!isOp('(')) throw new Error('أضف أقواساً بعد ' + t.id);
      next();
      const a = [];
      if (!isOp(')')) { a.push(expr()); while (isOp(',')) { next(); a.push(expr()); } }
      if (!isOp(')')) throw new Error('قوس ناقص');
      next();
      return f(...a);
    }
    throw new Error('تعبير غير صحيح');
  }
  const v = expr();
  if (p < toks.length) throw new Error('تعبير غير صحيح');
  return v;
}

const blocks = [
  { t: 'كم يساوي X% من Y؟', a: 'النسبة X %', b: 'العدد Y', f: (a, b) => `النتيجة: ${fmt((a * b) / 100)}` },
  { t: 'X هو كم % من Y؟', a: 'الجزء X', b: 'الكل Y', f: (a, b) => (b === 0 ? '—' : `النتيجة: ${fmt((a / b) * 100)}%`) },
  { t: 'نسبة التغيير من X إلى Y', a: 'من X', b: 'إلى Y', f: (a, b) => (a === 0 ? '—' : `التغيير: ${fmt(((b - a) / a) * 100)}%`) },
  { t: 'إضافة وخصم نسبة من مبلغ', a: 'النسبة %', b: 'المبلغ', f: (a, b) => `بعد الإضافة: ${fmt(b * (1 + a / 100))} · بعد الخصم: ${fmt(b * (1 - a / 100))}` },
];

export default {
  id: 'calc',
  render(el) {
    el.innerHTML = `
      <h3 style="margin:0 0 6px">حاسبة العمليات</h3>
      <input type="text" id="ex" dir="ltr" placeholder="(12+8)*3/4 + sqrt(16)" autocomplete="off">
      <div style="margin:8px 0">
        ${['(', ')', '^', '%', 'sqrt(', 'pi'].map((k) => `<button class="btn alt" data-k="${k}">${k}</button>`).join('')}
        <button class="btn alt" id="clr">مسح</button>
      </div>
      <div class="stat"><b id="res" dir="ltr">—</b>النتيجة</div>
      <p class="msg" id="err"></p>
      <p class="msg">الدوال: sqrt ، sin ، cos ، tan (بالراديان) ، log ، ln ، abs ، round ، floor ، ceil ، min ، max ، pow</p>
      <div class="calc-sec"><h3>حاسبة النسب المئوية</h3><div id="pc"></div></div>`;
    const ex = el.querySelector('#ex'), res = el.querySelector('#res'), err = el.querySelector('#err');
    const run = () => {
      err.textContent = '';
      if (!ex.value.trim()) { res.textContent = '—'; return; }
      try { res.textContent = fmt(evaluate(ex.value)); }
      catch (e) { res.textContent = '—'; err.textContent = e.message; }
    };
    ex.addEventListener('input', run);
    el.querySelectorAll('[data-k]').forEach((b) => (b.onclick = () => { ex.value += b.dataset.k; ex.focus(); run(); }));
    el.querySelector('#clr').onclick = () => { ex.value = ''; run(); };

    const pc = el.querySelector('#pc');
    blocks.forEach((bl) => {
      const d = document.createElement('div');
      d.style.margin = '14px 0';
      d.innerHTML = `<b>${bl.t}</b>
        <div class="row"><div>${bl.a}<input type="number" step="any" inputmode="decimal"></div>
        <div>${bl.b}<input type="number" step="any" inputmode="decimal"></div></div>
        <p class="res">—</p>`;
      const [i1, i2] = d.querySelectorAll('input'), r = d.querySelector('.res');
      const up = () => { r.textContent = i1.value === '' || i2.value === '' ? '—' : bl.f(+i1.value, +i2.value); };
      i1.oninput = i2.oninput = up;
      pc.appendChild(d);
    });
  },
};
