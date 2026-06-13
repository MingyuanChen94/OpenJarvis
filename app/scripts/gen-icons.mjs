// Dependency-free PWA icon generator.
// Rasterizes the OpenJarvis "J" mark to PNG (RGBA) using only Node built-ins.
// Run: node scripts/gen-icons.mjs
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'public');
mkdirSync(outDir, { recursive: true });

// ---- tiny PNG encoder ----
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function encodePng(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  // raw scanlines with filter byte 0
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---- mark rasterizer (64-unit design space, supersampled 2x) ----
const lerp = (a, b, t) => a + (b - a) * t;
function mix(c1, c2, t) {
  return [Math.round(lerp(c1[0], c2[0], t)), Math.round(lerp(c1[1], c2[1], t)), Math.round(lerp(c1[2], c2[2], t))];
}
const CYAN = [34, 211, 238];
const INDIGO = [99, 102, 241];
const BG = [11, 11, 15];

function glyphCoverage(u, v) {
  // stem rect
  const inStem = u >= 38 && u <= 44 && v >= 16 && v <= 38;
  // lower-half annulus (the J hook)
  const d = Math.hypot(u - 32, v - 38);
  const inHook = v >= 38 && d >= 6 && d <= 12;
  // top dot
  const inDot = Math.hypot(u - 41, v - 14) <= 4;
  return inStem || inHook || inDot;
}

function render(size) {
  const rgba = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const maxR = Math.hypot(cx, cy);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // background: deep base + faint radial accent glow
      const rr = Math.hypot(x - cx, y - cy) / maxR;
      const glow = Math.max(0, 1 - rr) * 0.16;
      let r = Math.round(lerp(BG[0], 40, glow));
      let g = Math.round(lerp(BG[1], 55, glow));
      let b = Math.round(lerp(BG[2], 90, glow));

      // supersample the glyph for anti-aliasing
      let cov = 0;
      const samples = [0.25, 0.75];
      for (const sy of samples)
        for (const sx of samples) {
          const u = ((x + sx) / size) * 64;
          const vv = ((y + sy) / size) * 64;
          if (glyphCoverage(u, vv)) cov += 0.25;
        }

      if (cov > 0) {
        const u = (x / size) * 64;
        const vv = (y / size) * 64;
        const t = Math.min(1, Math.max(0, (u + vv - 16) / 64));
        const gc = mix(CYAN, INDIGO, t);
        r = Math.round(lerp(r, gc[0], cov));
        g = Math.round(lerp(g, gc[1], cov));
        b = Math.round(lerp(b, gc[2], cov));
      }

      const i = (y * size + x) * 4;
      rgba[i] = r;
      rgba[i + 1] = g;
      rgba[i + 2] = b;
      rgba[i + 3] = 255;
    }
  }
  return encodePng(size, size, rgba);
}

for (const [name, size] of [
  ['pwa-192x192.png', 192],
  ['pwa-512x512.png', 512],
  ['apple-touch-icon.png', 180],
]) {
  writeFileSync(join(outDir, name), render(size));
  console.log('wrote', name, size + 'x' + size);
}
