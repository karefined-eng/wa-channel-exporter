const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

// Minimal PNG generator without external dependencies
function createPng(width, height, r, g, b) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // Color type: RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  // Raw image data with scanline filter bytes
  const rowBytes = width * 4 + 1;
  const raw = Buffer.alloc(rowBytes * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    raw[rowOffset] = 0; // Filter: none
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      // Border / rounded icon effect
      const cx = width / 2;
      const cy = height / 2;
      const dist = Math.hypot(x - cx, y - cy);
      const radius = width * 0.45;
      
      if (dist <= radius) {
        // Emerald green / WhatsApp palette with subtle inner gradient
        const factor = 1 - (dist / radius) * 0.25;
        raw[pxOffset] = Math.round(r * factor);
        raw[pxOffset + 1] = Math.round(g * factor);
        raw[pxOffset + 2] = Math.round(b * factor);
        raw[pxOffset + 3] = 255; // Alpha
      } else {
        raw[pxOffset] = 0;
        raw[pxOffset + 1] = 0;
        raw[pxOffset + 2] = 0;
        raw[pxOffset + 3] = 0; // Transparent
      }
    }
  }

  const idatData = zlib.deflateSync(raw);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, "ascii");
    const crcVal = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crcVal, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // Precomputed CRC table
  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (-(crc & 1) & 0xedb88320);
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  const ihdrChunk = chunk("IHDR", ihdr);
  const idatChunk = chunk("IDAT", idatData);
  const iendChunk = chunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function generateExtensionIcons() {
  const dir = path.join(__dirname, "..", "src", "assets", "icons");
  fs.mkdirSync(dir, { recursive: true });

  // WhatsApp teal: R=15, G=140, B=91 (#0f8c5b)
  [16, 48, 128].forEach((size) => {
    const png = createPng(size, size, 15, 140, 91);
    const file = path.join(dir, `icon${size}.png`);
    fs.writeFileSync(file, png);
    console.log(`Generated ${file}`);
  });
}

if (require.main === module) {
  generateExtensionIcons();
}

module.exports = { createPng, generateExtensionIcons };
