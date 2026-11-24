// The world in one image: Tuesday 24 November 2026.
//
// Polish 2. A newspaper-style front page drawn entirely at run time with
// Node's standard library only: a hand-rolled PNG encoder, a 5x7 bitmap
// font and simple shape drawing. No network, no bundled assets, no
// pre-made image. The output is deterministic: the same bytes every run.
//
// What changed since polish 1: a new panel for the overnight Russian
// drone that briefly entered Polish airspace (reported Tuesday by
// Reuters from the Polish armed forces), replacing the older Geneva
// autonomous-weapons story, which is now three days old. The other
// panels carry tighter, better-dated copy: the Dymer rescue, the
// Saturday dating of the Banten fire and the Thai-Cambodia truce, and
// the fossil-fuels reason COP31 collapsed. The CAS panel still does NOT
// guess the outcome: as of Tuesday morning the ruling was due that
// afternoon and had not been announced, and an unverified leak is not
// treated as the result. The footer swaps the Lisbon march for Sheikh
// Hasina's Tuesday-announced plan to return to Bangladesh.

import { deflateSync } from "node:zlib";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------- canvas

const W = 1024;
const H = 1024;
const pixels = new Uint8Array(W * H * 3);

type RGB = [number, number, number];

const PAPER: RGB = [246, 241, 227];
const INK: RGB = [27, 42, 74];
const WHITE: RGB = [255, 255, 255];
const GOLD: RGB = [233, 180, 76];
const BORDER: RGB = [216, 210, 190];
const GREY: RGB = [90, 96, 110];
const DARK: RGB = [44, 62, 80];
const BLUE: RGB = [36, 113, 163];
const RED: RGB = [192, 57, 43];
const ORANGE: RGB = [211, 84, 0];
const YELLOW: RGB = [241, 196, 15];
const GREEN: RGB = [30, 132, 73];
const PURPLE: RGB = [108, 52, 131];
const TEAL: RGB = [17, 122, 101];

function fillAll(color: RGB): void {
  for (let i = 0; i < pixels.length; i += 3) {
    pixels[i] = color[0];
    pixels[i + 1] = color[1];
    pixels[i + 2] = color[2];
  }
}

function setPixel(x: number, y: number, color: RGB): void {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  pixels[i] = color[0];
  pixels[i + 1] = color[1];
  pixels[i + 2] = color[2];
}

function fillRect(x: number, y: number, w: number, h: number, color: RGB): void {
  for (let yy = Math.max(0, y); yy < Math.min(H, y + h); yy++) {
    for (let xx = Math.max(0, x); xx < Math.min(W, x + w); xx++) {
      setPixel(xx, yy, color);
    }
  }
}

function strokeRect(x: number, y: number, w: number, h: number, t: number, color: RGB): void {
  fillRect(x, y, w, t, color);
  fillRect(x, y + h - t, w, t, color);
  fillRect(x, y, t, h, color);
  fillRect(x + w - t, y, t, h, color);
}

function fillCircle(cx: number, cy: number, r: number, color: RGB): void {
  for (let yy = cy - r; yy <= cy + r; yy++) {
    const dy = yy - cy;
    const dx = Math.floor(Math.sqrt(Math.max(0, r * r - dy * dy)));
    for (let xx = cx - dx; xx <= cx + dx; xx++) setPixel(xx, yy, color);
  }
}

function circleOutline(cx: number, cy: number, r: number, t: number, color: RGB): void {
  for (let a = 0; a < 360; a += 1) {
    const rad = (a * Math.PI) / 180;
    for (let k = 0; k < t; k++) {
      setPixel(Math.round(cx + (r - k) * Math.cos(rad)), Math.round(cy + (r - k) * Math.sin(rad)), color);
    }
  }
}

function drawLine(x0: number, y0: number, x1: number, y1: number, t: number, color: RGB): void {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  const rad = Math.max(1, Math.floor(t / 2));
  for (let i = 0; i <= steps; i++) {
    const x = Math.round(x0 + ((x1 - x0) * i) / steps);
    const y = Math.round(y0 + ((y1 - y0) * i) / steps);
    fillCircle(x, y, rad, color);
  }
}

function fillTriangle(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, color: RGB): void {
  const minX = Math.max(0, Math.min(x0, x1, x2));
  const maxX = Math.min(W - 1, Math.max(x0, x1, x2));
  const minY = Math.max(0, Math.min(y0, y1, y2));
  const maxY = Math.min(H - 1, Math.max(y0, y1, y2));
  const sign = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number): number =>
    (ax - cx) * (by - cy) - (bx - cx) * (ay - cy);
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const d1 = sign(x, y, x0, y0, x1, y1);
      const d2 = sign(x, y, x1, y1, x2, y2);
      const d3 = sign(x, y, x2, y2, x0, y0);
      const neg = d1 < 0 || d2 < 0 || d3 < 0;
      const pos = d1 > 0 || d2 > 0 || d3 > 0;
      if (!(neg && pos)) setPixel(x, y, color);
    }
  }
}

// ------------------------------------------------------------------- font

// 5x7 bitmap glyphs, one row per string, "#" = on. Only the characters
// the copy below uses: capitals, digits and a little punctuation.
const GLYPHS: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  X: ["10001", "01010", "00100", "00100", "00100", "01010", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  ",": ["00000", "00000", "00000", "00000", "01100", "00100", "01000"],
  ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
  ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
  "?": ["01110", "10001", "00001", "00110", "00100", "00000", "00100"],
  "%": ["11001", "11010", "00010", "00100", "01000", "01011", "10011"],
  "'": ["00100", "00100", "01000", "00000", "00000", "00000", "00000"],
  "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
};

function charWidth(scale: number): number {
  return 6 * scale;
}

function textWidth(text: string, scale: number): number {
  if (text.length === 0) return 0;
  return text.length * charWidth(scale) - scale;
}

function drawChar(ch: string, x: number, y: number, scale: number, color: RGB): void {
  const glyph = GLYPHS[ch] ?? GLYPHS[" "];
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 5; col++) {
      if (glyph[row][col] === "1") {
        fillRect(x + col * scale, y + row * scale, scale, scale, color);
      }
    }
  }
}

function drawText(text: string, x: number, y: number, scale: number, color: RGB): void {
  for (let i = 0; i < text.length; i++) {
    drawChar(text[i], x + i * charWidth(scale), y, scale, color);
  }
}

function drawTextCentered(text: string, cx: number, y: number, scale: number, color: RGB): void {
  drawText(text, cx - Math.floor(textWidth(text, scale) / 2), y, scale, color);
}

function wrapText(text: string, maxWidth: number, scale: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const trial = current === "" ? word : current + " " + word;
    if (textWidth(trial, scale) <= maxWidth || current === "") {
      current = trial;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current !== "") lines.push(current);
  return lines;
}

// -------------------------------------------------------------------- png

const CRC_TABLE: number[] = (() => {
  const table: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) c = CRC_TABLE[(c ^ data[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  const crcData = new Uint8Array(4 + data.length);
  crcData.set(out.subarray(4, 8 + data.length));
  view.setUint32(8 + data.length, crc32(crcData));
  return out;
}

function encodePng(): Uint8Array {
  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = new Uint8Array(13);
  const ihdrView = new DataView(ihdr.buffer);
  ihdrView.setUint32(0, W);
  ihdrView.setUint32(4, H);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const raw = new Uint8Array((W * 3 + 1) * H);
  for (let y = 0; y < H; y++) {
    raw[y * (W * 3 + 1)] = 0; // filter: none
    raw.set(pixels.subarray(y * W * 3, (y + 1) * W * 3), y * (W * 3 + 1) + 1);
  }
  const idat = deflateSync(raw, { level: 9 });
  const parts = [signature, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", new Uint8Array(0))];
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

// ------------------------------------------------------------------ icons
// Each icon is drawn around (cx, cy) and stays within about 40 px of it,
// so it sits in the panel's left icon column without touching the divider.

function iconGlobe(cx: number, cy: number): void {
  // A plain globe: outline, meridians and two land blobs. Polish 1's
  // thermometer cluttered this icon, so it is gone.
  circleOutline(cx, cy, 30, 4, BLUE);
  drawLine(cx - 30, cy, cx + 30, cy, 3, BLUE);
  drawLine(cx, cy - 30, cx, cy + 30, 3, BLUE);
  fillRect(cx - 18, cy - 20, 12, 9, GREEN);
  fillRect(cx + 4, cy + 8, 14, 10, GREEN);
  fillRect(cx - 6, cy - 4, 9, 7, GREEN);
}

function iconFlame(cx: number, cy: number): void {
  fillTriangle(cx, cy - 34, cx - 26, cy + 22, cx + 26, cy + 22, ORANGE);
  fillTriangle(cx, cy - 16, cx - 16, cy + 22, cx + 16, cy + 22, RED);
  fillTriangle(cx, cy + 2, cx - 7, cy + 22, cx + 7, cy + 22, YELLOW);
  fillRect(cx - 26, cy + 22, 52, 6, DARK);
}

function iconStrike(cx: number, cy: number): void {
  // Blast star above a damaged block of flats.
  for (let a = 0; a < 8; a++) {
    const rad = (a * Math.PI) / 4;
    drawLine(cx, cy - 18, Math.round(cx + 28 * Math.cos(rad)), Math.round(cy - 18 + 28 * Math.sin(rad)), 5, ORANGE);
  }
  fillCircle(cx, cy - 18, 11, YELLOW);
  fillCircle(cx, cy - 18, 5, RED);
  fillRect(cx - 24, cy + 10, 48, 26, DARK);
  fillRect(cx - 24, cy + 10, 48, 4, RED);
  fillRect(cx - 16, cy + 18, 8, 7, PAPER);
  fillRect(cx + 2, cy + 18, 8, 7, PAPER);
  fillRect(cx - 16, cy + 28, 8, 7, GREY);
  fillRect(cx + 2, cy + 28, 8, 7, PAPER);
  drawLine(cx - 32, cy + 38, cx + 32, cy + 38, 3, GREY);
}

function iconRadar(cx: number, cy: number): void {
  // NEW in polish 2: radar rings and sweep picking up a small drone
  // crossing the border line at the bottom. The drone turned back, so
  // the sweep stops short of the centre: no shoot-down is shown.
  circleOutline(cx, cy, 30, 3, BLUE);
  circleOutline(cx, cy, 19, 2, BLUE);
  fillCircle(cx, cy, 4, BLUE);
  drawLine(cx, cy, cx + 22, cy - 22, 3, BLUE);
  drawLine(cx - 32, cy + 34, cx + 32, cy + 34, 3, GREY);
  // Drone: dark body, red light, four grey rotors, upper right.
  fillRect(cx + 10, cy - 26, 22, 10, DARK);
  fillRect(cx + 18, cy - 23, 6, 4, RED);
  fillCircle(cx + 8, cy - 30, 6, GREY);
  fillCircle(cx + 34, cy - 30, 6, GREY);
  fillCircle(cx + 8, cy - 12, 6, GREY);
  fillCircle(cx + 34, cy - 12, 6, GREY);
  drawLine(cx + 8, cy - 30, cx + 12, cy - 24, 2, DARK);
  drawLine(cx + 34, cy - 30, cx + 30, cy - 24, 2, DARK);
  drawLine(cx + 8, cy - 12, cx + 12, cy - 18, 2, DARK);
  drawLine(cx + 34, cy - 12, cx + 30, cy - 18, 2, DARK);
}

function iconTruce(cx: number, cy: number): void {
  // A flag on a pole over calm ground: the border truce.
  fillRect(cx - 28, cy - 34, 4, 70, DARK);
  fillTriangle(cx - 24, cy - 34, cx + 20, cy - 25, cx - 24, cy - 16, WHITE);
  strokeRect(cx - 24, cy - 34, 44, 18, 2, DARK);
  drawLine(cx - 30, cy + 36, cx + 30, cy + 36, 3, GREEN);
  fillTriangle(cx - 20, cy + 36, cx - 8, cy + 24, cx + 4, cy + 36, GREEN);
  fillTriangle(cx + 6, cy + 36, cx + 18, cy + 26, cx + 28, cy + 36, GREEN);
}

function iconTrophy(cx: number, cy: number): void {
  // Cup, stem and base; the "1" marks the title at stake, not a winner.
  fillRect(cx - 18, cy - 32, 36, 26, GOLD);
  fillRect(cx - 18, cy - 32, 36, 5, YELLOW);
  circleOutline(cx - 20, cy - 20, 9, 3, GOLD);
  circleOutline(cx + 20, cy - 20, 9, 3, GOLD);
  fillRect(cx - 4, cy - 6, 8, 16, GOLD);
  fillRect(cx - 14, cy + 10, 28, 6, GOLD);
  fillRect(cx - 20, cy + 16, 40, 6, DARK);
  drawText("1", cx - 8, cy - 28, 2, INK);
}

// ---------------------------------------------------------------- content

interface Panel {
  kicker: string;
  heading: string[];
  body: string;
  accent: RGB;
  icon: (cx: number, cy: number) => void;
}

const PANELS: Panel[] = [
  {
    kicker: "UKRAINE - KYIV REGION",
    heading: ["11 KILLED IN", "DYMER FLAT HIT"],
    body: "SUNDAY DRONE HIT A FIVE-STOREY FLAT. BOY, 7, AND WOMAN, 79, PULLED ALIVE.",
    accent: RED,
    icon: iconStrike,
  },
  {
    kicker: "INDONESIA - BANTEN",
    heading: ["24 DEAD IN", "FACTORY FIRE"],
    body: "SATURDAY FIRE AT CANDY FACTORY. ABOUT 30 STILL MISSING, SEARCH GOES ON.",
    accent: ORANGE,
    icon: iconFlame,
  },
  {
    kicker: "POLAND - NATO BORDER",
    heading: ["RUSSIAN DRONE", "IN POLISH SKY"],
    body: "BRIEFLY IN POLISH AIRSPACE OVERNIGHT. WARSAW HELD FIRE AS IT TURNED BACK.",
    accent: BLUE,
    icon: iconRadar,
  },
  {
    kicker: "COP31 - ANTALYA, TURKIYE",
    heading: ["CLIMATE TALKS", "END IN NO DEAL"],
    body: "SUNDAY: PACT REJECTED AS FOSSIL FUELS WERE LEFT OUT. LONGEST COP EVER.",
    accent: TEAL,
    icon: iconGlobe,
  },
  {
    kicker: "THAILAND - CAMBODIA",
    heading: ["CEASEFIRE", "HOLDS ON BORDER"],
    body: "SATURDAY TRUCE HOLDS. BORDER CALM, DISPLACED FAMILIES MAY RETURN.",
    accent: GREEN,
    icon: iconTruce,
  },
  {
    kicker: "FOOTBALL - CAS, LAUSANNE",
    heading: ["TITLE VERDICT", "DUE TODAY"],
    body: "SENEGAL APPEAL OVER STRIPPED TITLE. DECISION DUE THIS AFTERNOON.",
    accent: PURPLE,
    icon: iconTrophy,
  },
];

// ------------------------------------------------------------------ draw

function drawHeader(): void {
  fillRect(0, 0, W, 132, INK);
  fillRect(0, 132, W, 4, GOLD);
  drawTextCentered("THE WORLD IN ONE PICTURE", W / 2, 14, 2, GOLD);
  drawTextCentered("24 NOVEMBER 2026", W / 2, 40, 7, WHITE);
  drawTextCentered("SIX STORIES AS REPORTED ON TUESDAY 24 NOVEMBER", W / 2, 100, 3, PAPER);
}

function drawPanel(panel: Panel, x: number, y: number, w: number, h: number): void {
  fillRect(x, y, w, h, WHITE);
  strokeRect(x, y, w, h, 2, BORDER);
  fillRect(x, y, w, 10, panel.accent);
  panel.icon(x + 46, y + 128);
  drawLine(x + 92, y + 18, x + 92, y + h - 18, 2, BORDER);
  const tx = x + 106;
  const textW = w - 120;
  drawText(panel.kicker, tx, y + 20, 2, panel.accent);
  let hy = y + 46;
  for (const line of panel.heading) {
    drawText(line, tx, hy, 4, INK);
    hy += 36;
  }
  const bodyLines = wrapText(panel.body, textW, 3);
  let by = y + 126;
  for (const line of bodyLines.slice(0, 4)) {
    drawText(line, tx, by, 3, DARK);
    by += 27;
  }
}

function drawFooter(): void {
  fillRect(0, 916, W, 108, INK);
  fillRect(0, 916, W, 4, GOLD);
  const lines = [
    "ALSO: DRONE-HIT SPARTA II REACHED ST PETERSBURG MONDAY.",
    "FIJI TO CLOSE SCHOOLS 30 NOV-4 DEC AS DROUGHT DEEPENS.",
    "HASINA PLANS RETURN TO BANGLADESH ON 16 DEC.",
  ];
  let y = 932;
  for (const line of lines) {
    drawTextCentered(line, W / 2, y, 3, PAPER);
    y += 28;
  }
}

function main(): void {
  fillAll(PAPER);
  drawHeader();
  const margin = 24;
  const gap = 16;
  const colW = Math.floor((W - margin * 2 - gap) / 2);
  const rowH = 246;
  const top = 148;
  for (let i = 0; i < PANELS.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    drawPanel(PANELS[i], margin + col * (colW + gap), top + row * (rowH + 12), colW, rowH);
  }
  drawFooter();
  const png = encodePng();
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? (existsSync("/output") ? "/output" : "out");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.png");
  writeFileSync(outPath, png);
  console.log(`wrote ${outPath} ${png.length} bytes ${W}x${H}`);
}

main();
