import fs from 'node:fs';
import zlib from 'node:zlib';

const crcT = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (t, d) => {
  const l = Buffer.alloc(4); l.writeUInt32BE(d.length);
  const td = Buffer.concat([Buffer.from(t), d]);
  const c = Buffer.alloc(4); c.writeUInt32BE(crc(td));
  return Buffer.concat([l, td, c]);
};
const poly = [[36, 8], [16, 36], [30, 36], [26, 56], [48, 26], [34, 26]];
const inPoly = (x, y) => {
  let r = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) r = !r;
  }
  return r;
};
const stops = [[0x63, 0x66, 0xf1], [0x8b, 0x5c, 0xf6], [0xec, 0x48, 0x99]];
function icon(size) {
  const stride = size * 4 + 1;
  const raw = Buffer.alloc(stride * size);
  const sc = (0.56 * size) / 48;
  const o = size / 2 - 32 * sc;
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0;
    for (let x = 0; x < size; x++) {
      const t = (x + y) / (2 * size);
      const [a, b, u] = t < 0.5 ? [stops[0], stops[1], t / 0.5] : [stops[1], stops[2], (t - 0.5) / 0.5];
      const c = a.map((v, i) => v + (b[i] - v) * u);
      let cov = 0;
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (inPoly((x + (i + 0.5) / 3 - o) / sc, (y + (j + 0.5) / 3 - o) / sc)) cov++;
      cov /= 9;
      const p = y * stride + 1 + x * 4;
      for (let k = 0; k < 3; k++) raw[p + k] = Math.round(c[k] * (1 - cov) + 255 * cov);
      raw[p + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
for (const s of [192, 512]) fs.writeFileSync(`public/icon-${s}.png`, icon(s));
console.log('icons ok');
