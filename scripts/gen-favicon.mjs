import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

// 最小合法的 1×1 透明 ICO（BITMAPINFOHEADER 格式）
const ico = Buffer.from([
  // ICONDIR
  0x00, 0x00,             // reserved
  0x01, 0x00,             // type: 1 = ICO
  0x01, 0x00,             // count: 1 image
  // ICONDIRENTRY
  0x01,                   // width  = 1
  0x01,                   // height = 1
  0x00,                   // colorCount = 0 (no palette)
  0x00,                   // reserved
  0x01, 0x00,             // planes = 1
  0x20, 0x00,             // bitCount = 32
  0x28, 0x00, 0x00, 0x00, // sizeInBytes = 40 (header) + 4 (pixel)
  0x16, 0x00, 0x00, 0x00, // imageOffset = 22 (bytes from start)
  // BITMAPINFOHEADER (40 bytes)
  0x28, 0x00, 0x00, 0x00, // biSize = 40
  0x01, 0x00, 0x00, 0x00, // biWidth = 1
  0x02, 0x00, 0x00, 0x00, // biHeight = 2 (×2 for ICO)
  0x01, 0x00,             // biPlanes = 1
  0x20, 0x00,             // biBitCount = 32
  0x00, 0x00, 0x00, 0x00, // biCompression = 0 (none)
  0x04, 0x00, 0x00, 0x00, // biSizeImage = 4
  0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00,
  // BGRA pixel (1×1, fully transparent)
  0x00, 0x00, 0x00, 0x00,
]);

const dir = path.join(root, 'public', 'images');
fs.mkdirSync(dir, { recursive: true });
const dest = path.join(dir, 'favicon.ico');
fs.writeFileSync(dest, ico);
console.log(`Written ${ico.length} bytes → ${dest}`);
