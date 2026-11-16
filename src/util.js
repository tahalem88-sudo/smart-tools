export function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}
export const fmtSize = (b) =>
  b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';
export const toBlob = (canvas, type, q) => new Promise((r) => canvas.toBlob(r, type, q));
export const baseName = (n) => n.replace(/\.[^.]+$/, '');
