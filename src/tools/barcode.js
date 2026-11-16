import JsBarcode from 'jsbarcode';
import { download, toBlob } from '../util.js';
const HINTS = {
  CODE128: 'أي نص أو أرقام (إنجليزي).',
  EAN13: '12 أو 13 رقماً.',
  EAN8: '7 أو 8 أرقام.',
  UPC: '11 أو 12 رقماً.',
  CODE39: 'أحرف إنجليزية كبيرة وأرقام و - . $ / + %',
  ITF14: '13 أو 14 رقماً.',
};
export default {
  id: 'barcode',
  render(el) {
    el.innerHTML = `
      <select id="fmt">${Object.keys(HINTS).map((k) => `<option value="${k}">${k}</option>`).join('')}</select>
      <p class="msg" id="hint"></p>
      <input type="text" id="v" dir="ltr" value="123456789012" placeholder="القيمة">
      <p><canvas id="c"></canvas></p>
      <p class="msg" id="err"></p>
      <button class="btn" id="dl">تنزيل PNG</button>`;
    const q = (id) => el.querySelector('#' + id);
    const c = q('c');
    const draw = () => {
      q('hint').textContent = 'المطلوب: ' + HINTS[q('fmt').value];
      q('err').textContent = '';
      try {
        JsBarcode(c, q('v').value || ' ', { format: q('fmt').value, displayValue: true, margin: 12, width: 2, height: 90, background: '#ffffff' });
      } catch {
        q('err').textContent = 'القيمة لا تناسب هذا النوع من الباركود.';
      }
    };
    q('fmt').onchange = q('v').oninput = draw;
    q('dl').onclick = async () => download(await toBlob(c, 'image/png'), 'barcode.png');
    draw();
  },
};
