import type { Matrix2D } from '../geometry/matrix';

/** Число для SVG: округление до `precision` знаков, без хвостовых нулей и `-0`. */
export function num(v: number, precision: number): string {
  if (!Number.isFinite(v)) return '0';
  const s = v.toFixed(precision);
  const t = s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
  return t === '-0' ? '0' : t;
}

export function escapeXml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function escapeAttr(text: string): string {
  return escapeXml(text).replace(/"/g, '&quot;');
}

export function matrixAttr(m: Matrix2D, precision: number): string {
  // Коэффициенты поворота/масштаба — с запасом точности, сдвиг — по precision.
  const p = Math.max(precision, 6);
  return `matrix(${num(m[0], p)} ${num(m[1], p)} ${num(m[2], p)} ${num(m[3], p)} ${num(m[4], precision)} ${num(m[5], precision)})`;
}

/** Атрибуты элемента: `undefined` / `null` пропускаются. */
export function attrs(map: Record<string, string | number | null | undefined>): string {
  let out = '';
  for (const [k, v] of Object.entries(map)) {
    if (v === undefined || v === null || v === '') continue;
    out += ` ${k}="${escapeAttr(String(v))}"`;
  }
  return out;
}
