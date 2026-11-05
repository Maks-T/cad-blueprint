/**
 * Палитра AutoCAD Color Index (ACI) → `#rrggbb`. 1…9 — опорные цвета, 10…249 — 24 тона × 10 оттенков
 * (насыщенность 100 % / 50 %, яркость 100 … 30 %), 250…255 — серые. Значения совпадают со стандартной палитрой
 * с точностью до ±1 в канале. 7 — «белый/чёрный»: возвращается чёрный (чертёж на белом фоне).
 */
const BASE: Record<number, string> = {
  1: '#ff0000',
  2: '#ffff00',
  3: '#00ff00',
  4: '#00ffff',
  5: '#0000ff',
  6: '#ff00ff',
  7: '#000000',
  8: '#808080',
  9: '#c0c0c0',
};

const GRAYS = ['#333333', '#5b5b5b', '#848484', '#adadad', '#d6d6d6', '#ffffff'];
const VALUES = [1, 1, 0.8, 0.8, 0.6, 0.6, 0.5, 0.5, 0.3, 0.3];

function hex2(v: number): string {
  return Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
}

function hsv(h: number, s: number, v: number): string {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return `#${hex2((r + m) * 255)}${hex2((g + m) * 255)}${hex2((b + m) * 255)}`;
}

/** Цвет ACI (1…255). 0 (ByBlock) и 256 (ByLayer) — `null`. */
export function aciToHex(index: number): string | null {
  const i = Math.abs(Math.trunc(index));
  if (i === 0 || i >= 256) return null;
  if (BASE[i]) return BASE[i] as string;
  if (i >= 250) return GRAYS[i - 250] as string;
  const hue = Math.floor((i - 10) / 10) * 15;
  const shade = (i - 10) % 10;
  return hsv(hue, shade % 2 === 0 ? 1 : 0.5, VALUES[shade] as number);
}

/** True color DXF (код 420, 0x00RRGGBB) → `#rrggbb`. */
export function trueColorToHex(value: number): string {
  const v = value & 0xffffff;
  return `#${v.toString(16).padStart(6, '0')}`;
}
