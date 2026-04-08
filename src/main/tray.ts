import { app, Menu, Tray, nativeImage } from 'electron';
import zlib from 'zlib';
import { getMainWindow } from './window';

let tray: Tray | null = null;

// ── PNG helpers — generate a 16×16 circle icon with no external deps ──────────

function crc32(data: Buffer): number {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) crc = t[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const lb = Buffer.alloc(4); lb.writeUInt32BE(data.length);
  const tb = Buffer.from(type, 'ascii');
  const cb = Buffer.alloc(4); cb.writeUInt32BE(crc32(Buffer.concat([tb, data])));
  return Buffer.concat([lb, tb, data, cb]);
}

function buildTrayIcon(): Electron.NativeImage {
  const W = 16, H = 16, R = 79, G = 156, B = 249; // accent blue #4f9cf9
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 6; // bit-depth=8, colour-type=RGBA
  const rowStride = 1 + W * 4;
  const raw = Buffer.alloc(rowStride * H);
  for (let y = 0; y < H; y++) {
    raw[y * rowStride] = 0; // filter byte: None
    for (let x = 0; x < W; x++) {
      const cx = (W - 1) / 2, cy = (H - 1) / 2;
      const alpha = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) < W / 2 - 0.5 ? 255 : 0;
      const i = y * rowStride + 1 + x * 4;
      raw[i] = R; raw[i + 1] = G; raw[i + 2] = B; raw[i + 3] = alpha;
    }
  }
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
  return nativeImage.createFromBuffer(png);
}

// ── Public ────────────────────────────────────────────────────────────────────

export function setupTray(): void {
  if (tray) return;
  try {
    tray = new Tray(buildTrayIcon());
    tray.setToolTip('SecVault');
    const ctxMenu = Menu.buildFromTemplate([
      {
        label: 'Show SecVault',
        click: () => { getMainWindow()?.show(); getMainWindow()?.focus(); },
      },
      { type: 'separator' },
      { label: 'Quit', click: () => app.quit() },
    ]);
    tray.setContextMenu(ctxMenu);
    tray.on('click', () => { getMainWindow()?.show(); getMainWindow()?.focus(); });
  } catch (e) {
    console.error('Failed to create system tray icon:', e);
  }
}
