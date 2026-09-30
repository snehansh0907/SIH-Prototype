import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, drawPixelFn) {
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawPixelFn(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: RGBA (6)
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace: None

  const ihdrChunk = createChunk('IHDR', ihdrData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);

  const crcTarget = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = crc32(crcTarget);
  buf.writeUInt32BE(crc >>> 0, 8 + len);
  return buf;
}

// Standard CRC32 table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c;
}

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

// Brand Colors:
// Background: Forest Green #174D35 (23, 77, 53)
// Accent/Ring: Gold #F6BD28 (246, 189, 40)
// Inner Dark: Deep Forest #0D3322 (13, 51, 34)
// White: #FFFFFF (255, 255, 255)

function drawPashuSarthakIcon(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxR = w * 0.46;
  const innerR = w * 0.42;
  const ringThickness = w * 0.025;

  // Outer corner rounded rectangle clipping
  const cornerRadius = w * 0.22;
  const qx = Math.max(Math.abs(dx) - (w / 2 - cornerRadius), 0);
  const qy = Math.max(Math.abs(dy) - (h / 2 - cornerRadius), 0);
  const cornerDist = Math.sqrt(qx * qx + qy * qy);

  if (cornerDist > cornerRadius) {
    return [0, 0, 0, 0]; // Transparent outside
  }

  // Base Background: Deep Forest Green #174D35 with subtle gradient
  const grad = 1 - (y / h) * 0.2;
  let r = Math.round(23 * grad);
  let g = Math.round(77 * grad);
  let b = Math.round(53 * grad);
  let a = 255;

  // Outer Golden Ring
  if (dist <= maxR && dist >= maxR - ringThickness) {
    return [246, 189, 40, 255]; // Gold #F6BD28
  }

  // Inner Subtle Golden Ring
  const innerCircleR = w * 0.35;
  if (Math.abs(dist - innerCircleR) < ringThickness * 0.4) {
    return [246, 189, 40, 180];
  }

  // Inner Circle Background: #0D3322
  if (dist < innerCircleR) {
    r = 13;
    g = 51;
    b = 34;
  }

  // Central Emblem: Cow head silhouette + Lion Shield
  // Cow forehead & muzzle representation
  const cowY = cy + h * 0.04;
  const cdx = x - cx;
  const cdy = y - cowY;

  // Cow Ears (left and right)
  const leftEarDist = Math.sqrt(Math.pow(x - (cx - w * 0.18), 2) + Math.pow(y - (cowY - h * 0.12), 2));
  const rightEarDist = Math.sqrt(Math.pow(x - (cx + w * 0.18), 2) + Math.pow(y - (cowY - h * 0.12), 2));
  if (leftEarDist < w * 0.08 || rightEarDist < w * 0.08) {
    return [246, 189, 40, 240];
  }

  // Cow Horns (curved arches)
  const hornRadius = w * 0.14;
  const leftHornX = cx - w * 0.14;
  const rightHornX = cx + w * 0.14;
  const hornY = cowY - h * 0.18;
  const leftHornDist = Math.sqrt(Math.pow(x - leftHornX, 2) + Math.pow(y - hornY, 2));
  const rightHornDist = Math.sqrt(Math.pow(x - rightHornX, 2) + Math.pow(y - hornY, 2));
  if ((leftHornDist < w * 0.045 && y < cowY - h * 0.08) || (rightHornDist < w * 0.045 && y < cowY - h * 0.08)) {
    return [255, 255, 255, 255];
  }

  // Main Head Face
  const faceDist = Math.sqrt(Math.pow(cdx * 1.2, 2) + Math.pow(cdy * 0.9, 2));
  if (faceDist < w * 0.16) {
    // Golden central star on forehead
    const foreheadDist = Math.sqrt(Math.pow(cdx, 2) + Math.pow(y - (cowY - h * 0.06), 2));
    if (foreheadDist < w * 0.045) {
      return [246, 189, 40, 255];
    }
    // Muzzle / Nose area
    if (y > cowY + h * 0.06 && Math.abs(cdx) < w * 0.1) {
      // Nostrils
      if (Math.abs(cdx) > w * 0.03 && Math.abs(cdx) < w * 0.06 && Math.abs(y - (cowY + h * 0.1)) < h * 0.02) {
        return [13, 51, 34, 255];
      }
      return [255, 255, 255, 230];
    }
    // Eyes
    if (Math.abs(y - (cowY - h * 0.01)) < h * 0.02 && Math.abs(cdx) > w * 0.06 && Math.abs(cdx) < w * 0.1) {
      return [13, 51, 34, 255];
    }
    return [255, 255, 255, 255];
  }

  // Cross / Medical Stethoscope indicator at bottom
  const medY = cy + h * 0.26;
  if (Math.abs(x - cx) < w * 0.03 && Math.abs(y - medY) < h * 0.08) {
    return [246, 189, 40, 255];
  }
  if (Math.abs(y - medY) < h * 0.025 && Math.abs(x - cx) < w * 0.08) {
    return [246, 189, 40, 255];
  }

  return [r, g, b, a];
}

const publicDir = path.resolve(process.cwd(), 'public');

console.log('Generating PWA icons in:', publicDir);

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-maskable-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

for (const { name, size } of sizes) {
  const pngBuf = createPNG(size, size, drawPashuSarthakIcon);
  fs.writeFileSync(path.join(publicDir, name), pngBuf);
  console.log(`✓ Generated ${name} (${size}x${size}, ${pngBuf.length} bytes)`);
}

// Generate SVG favicon as well
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <rect width="512" height="512" rx="110" fill="#174D35"/>
  <circle cx="256" cy="256" r="230" fill="none" stroke="#F6BD28" stroke-width="14"/>
  <circle cx="256" cy="256" r="175" fill="#0D3322" stroke="#F6BD28" stroke-width="4" stroke-opacity="0.7"/>
  <!-- Cow Horns -->
  <path d="M 180 180 C 170 120, 140 100, 120 90 C 140 130, 160 160, 190 190 Z" fill="#FFFFFF"/>
  <path d="M 332 180 C 342 120, 372 100, 392 90 C 372 130, 352 160, 322 190 Z" fill="#FFFFFF"/>
  <!-- Ears -->
  <ellipse cx="160" cy="200" rx="45" ry="22" transform="rotate(-25 160 200)" fill="#F6BD28"/>
  <ellipse cx="352" cy="200" rx="45" ry="22" transform="rotate(25 352 200)" fill="#F6BD28"/>
  <!-- Face -->
  <path d="M 190 190 C 190 160, 322 160, 322 190 C 322 250, 340 280, 330 330 C 320 370, 192 370, 182 330 C 172 280, 190 250, 190 190 Z" fill="#FFFFFF"/>
  <!-- Golden Forehead Star -->
  <polygon points="256,200 262,216 278,216 265,226 270,242 256,232 242,242 247,226 234,216 250,216" fill="#F6BD28"/>
  <!-- Eyes -->
  <ellipse cx="215" cy="250" rx="12" ry="7" fill="#0D3322"/>
  <ellipse cx="297" cy="250" rx="12" ry="7" fill="#0D3322"/>
  <!-- Muzzle -->
  <path d="M 205 300 C 205 285, 307 285, 307 300 C 307 350, 205 350, 205 300 Z" fill="#F4EFE6" stroke="#D1D5DB" stroke-width="2"/>
  <ellipse cx="235" cy="318" rx="8" ry="12" fill="#0D3322"/>
  <ellipse cx="277" cy="318" rx="8" ry="12" fill="#0D3322"/>
  <!-- Veterinary Cross -->
  <rect x="246" y="390" width="20" height="55" rx="6" fill="#F6BD28"/>
  <rect x="228" y="407" width="56" height="20" rx="6" fill="#F6BD28"/>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgIcon);
console.log('✓ Generated favicon.svg');
