import { CadLayerError } from './errors';

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Приводит `#rgb` / `#rrggbb` (любой регистр) к `#rrggbb` в нижнем регистре. */
export function normalizeHexColor(input: unknown, field = 'color'): string {
  if (typeof input !== 'string' || !HEX_RE.test(input)) {
    throw new CadLayerError(field, `must be a hex color like "#rrggbb" or "#rgb", got ${String(input)}`);
  }
  const body = input.slice(1).toLowerCase();
  if (body.length === 3) {
    return `#${body[0]}${body[0]}${body[1]}${body[1]}${body[2]}${body[2]}`;
  }
  return `#${body}`;
}

export function hexToRgb(hex: string): [number, number, number] {
  const n = normalizeHexColor(hex);
  return [parseInt(n.slice(1, 3), 16), parseInt(n.slice(3, 5), 16), parseInt(n.slice(5, 7), 16)];
}

/** ACI для слоя: 1…255 (0 = ByBlock и 256 = ByLayer для слоя недопустимы). */
export function assertDxfColorIndex(value: unknown, field = 'dxfColorIndex'): asserts value is number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 255) {
    throw new CadLayerError(field, `must be an integer in range 1…255, got ${String(value)}`);
  }
}

type Rgb = readonly [number, number, number];

/**
 * Опорные цвета AutoCAD Color Index, по которым подбирается ближайший индекс:
 * 1–6 основные, 7 (белый/чёрный — зависит от фона), 8–9 серые, 252–254 светлые серые.
 * Тёмно-серые (250–251) исключены: тёмные «чернила» должны уходить в 7, а не в серый.
 * Остальные 240+ индексов палитры намеренно не используются: для автоподбора хватает
 * этих, а точный индекс всегда можно задать вручную через `dxfColorIndex`.
 */
const ACI_ANCHORS: ReadonlyArray<readonly [number, Rgb]> = [
  [1, [255, 0, 0]],
  [2, [255, 255, 0]],
  [3, [0, 255, 0]],
  [4, [0, 255, 255]],
  [5, [0, 0, 255]],
  [6, [255, 0, 255]],
  [7, [255, 255, 255]],
  [7, [0, 0, 0]],
  [8, [128, 128, 128]],
  [9, [192, 192, 192]],
  [252, [132, 132, 132]],
  [253, [173, 173, 173]],
  [254, [214, 214, 214]],
];

/** Ближайший индекс ACI к hex-цвету (эвристика по опорным цветам, см. `ACI_ANCHORS`). */
export function nearestDxfColorIndex(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  let best = 7;
  let bestDist = Infinity;
  for (const [index, [ar, ag, ab]] of ACI_ANCHORS) {
    const dist = (r - ar) ** 2 + (g - ag) ** 2 + (b - ab) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = index;
    }
  }
  return best;
}
