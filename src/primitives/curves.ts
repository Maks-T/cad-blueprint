import { distance } from '../geometry/vec';
import type { Point2 } from '../settings';
import { buildBezier, buildPolyline } from './build';
import { CadPrimitiveError } from './errors';
import type { BezierEntity, EntityPropsInit, PolylineEntity } from './types';

/**
 * Гладкая кривая через точки (Catmull-Rom → цепочка кубических Безье).
 * `tension` 0…1: 0 — классический Catmull-Rom, 1 — ломаная.
 */
export function fitBezier(points: readonly Point2[], options: EntityPropsInit & { tension?: number } = {}): BezierEntity {
  const { tension = 0, ...props } = options;
  if (!Array.isArray(points) || points.length < 2) throw new CadPrimitiveError('points', 'needs at least 2 points');
  if (!Number.isFinite(tension) || tension < 0 || tension > 1) {
    throw new CadPrimitiveError('tension', `must be in range 0…1, got ${String(tension)}`);
  }
  const k = (1 - tension) / 6;
  const out: Point2[] = [points[0] as Point2];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = (points[i - 1] ?? points[i]) as Point2;
    const p1 = points[i] as Point2;
    const p2 = points[i + 1] as Point2;
    const p3 = (points[i + 2] ?? p2) as Point2;
    out.push([p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k]);
    out.push([p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k]);
    out.push(p2);
  }
  return buildBezier({ ...props, points: out });
}

export interface BreakLineOptions extends EntityPropsInit {
  /** Размах волны (от оси до гребня), единицы модели. По умолчанию — 1/20 длины линии. */
  amplitude?: number;
  /** Число полных волн. По умолчанию 2. */
  waves?: number;
}

/**
 * Волнистая линия обрыва (ГОСТ 2.303, сплошная волнистая) от `from` до `to`: синусоида из кубических Безье,
 * каждая полуволна — одна кривая.
 */
export function breakLine(from: Point2, to: Point2, options: BreakLineOptions = {}): BezierEntity {
  const { amplitude, waves = 2, ...props } = options;
  const len = distance(from, to);
  if (len <= 0) throw new CadPrimitiveError('breakLine', 'from and to coincide');
  if (!Number.isInteger(waves) || waves < 1 || waves > 1000) {
    throw new CadPrimitiveError('waves', `must be an integer 1…1000, got ${String(waves)}`);
  }
  const amp = amplitude ?? len / 20;
  if (!Number.isFinite(amp) || amp <= 0) throw new CadPrimitiveError('amplitude', `must be > 0, got ${String(amp)}`);
  const ux = (to[0] - from[0]) / len;
  const uy = (to[1] - from[1]) / len;
  const nx = -uy;
  const ny = ux;
  const halves = waves * 2;
  const h = len / halves;
  // Полуволна синуса ≈ кубическая Безье с управляющими точками на 1/3 и 2/3 хода и сдвигом 4/3·A.
  const c = (4 / 3) * amp;
  const at = (s: number, off: number): Point2 => [from[0] + ux * s + nx * off, from[1] + uy * s + ny * off];
  const out: Point2[] = [at(0, 0)];
  for (let i = 0; i < halves; i++) {
    const sign = i % 2 === 0 ? 1 : -1;
    out.push(at(i * h + h / 3, sign * c), at(i * h + (2 * h) / 3, sign * c), at((i + 1) * h, 0));
  }
  return buildBezier({ ...props, points: out });
}

/**
 * Линия обрыва с изломом (ГОСТ 2.303, сплошная тонкая с изломами) — для длинных деталей:
 * прямая с одним зигзагом посередине.
 */
export function zigzagBreakLine(
  from: Point2,
  to: Point2,
  options: EntityPropsInit & { size?: number } = {},
): PolylineEntity {
  const { size, ...props } = options;
  const len = distance(from, to);
  if (len <= 0) throw new CadPrimitiveError('zigzagBreakLine', 'from and to coincide');
  const s = size ?? Math.min(len / 6, len);
  if (!Number.isFinite(s) || s <= 0 || s * 2 > len) {
    throw new CadPrimitiveError('size', `must be in range (0, ${len / 2}], got ${String(s)}`);
  }
  const ux = (to[0] - from[0]) / len;
  const uy = (to[1] - from[1]) / len;
  const nx = -uy;
  const ny = ux;
  const m = len / 2;
  const at = (t: number, off: number): [number, number] => [from[0] + ux * t + nx * off, from[1] + uy * t + ny * off];
  return buildPolyline({
    ...props,
    vertices: [at(0, 0), at(m - s / 2, 0), at(m - s / 4, s), at(m + s / 4, -s), at(m + s / 2, 0), at(len, 0)],
  });
}
