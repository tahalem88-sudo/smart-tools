import QRCode from 'qrcode';
import { download, toBlob } from '../util.js';
export default {
  id: 'qr',
  title: 'منشئ QR Code',
  icon: '🔳',
  cat: 'أدوات المطورين',
  desc: 'حوّل أي رابط أو نص إلى رمز QR',
  render(el) {
    el.innerHTML = `
      <input type="text" id="t" placeholder="https://example.com">
      <p><canvas id="c" width="280" height="280"></canvas></p>
      <button class="btn" id="dl">تنزيل PNG</button>`;
    const t = el.querySelector('#t'), c = el.querySelector('#c');
    const draw = () => QRCode.toCanvas(c, t.value || ' ', { width: 280, margin: 2 });
    t.addEventListener('input', draw);
    draw();
    el.querySelector('#dl').onclick = async () => download(await toBlob(c, 'image/png'), 'qrcode.png');
  },
};
