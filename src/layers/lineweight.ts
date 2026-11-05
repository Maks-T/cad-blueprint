import { CadLayerError } from './errors';

/** Стандартные толщины линий AutoCAD, мм. */
export const STANDARD_LINEWEIGHTS_MM: readonly number[] = Object.freeze([
  0, 0.05, 0.09, 0.13, 0.15, 0.18, 0.2, 0.25, 0.3, 0.35, 0.4, 0.5, 0.53, 0.6, 0.7, 0.8, 0.9, 1,
  1.06, 1.2, 1.4, 1.58, 2, 2.11,
]);

export const MAX_LINEWEIGHT_MM = 10;

/** Толщина линии — мм на бумаге (не зависит от масштаба чертежа). `0` — самая тонкая линия устройства. */
export function assertLineWeight(value: unknown, field = 'lineWeight'): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > MAX_LINEWEIGHT_MM) {
    throw new CadLayerError(field, `must be a number in range 0…${MAX_LINEWEIGHT_MM} (mm), got ${String(value)}`);
  }
}

/** Ближайшая стандартная толщина AutoCAD (при равенстве — меньшая). */
export function snapLineWeight(mm: number): number {
  let best = 0;
  let bestDist = Infinity;
  for (const w of STANDARD_LINEWEIGHTS_MM) {
    const dist = Math.abs(w - mm);
    if (dist < bestDist) {
      bestDist = dist;
      best = w;
    }
  }
  return best;
}

/** Значение для DXF (код 370): сотые доли мм, ближайшая стандартная толщина. */
export function toDxfLineWeight(mm: number): number {
  return Math.round(snapLineWeight(mm) * 100);
}
