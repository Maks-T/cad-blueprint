import type { Point2 } from '../settings';
import { CadPathError } from './errors';
import type { PathArcSegment } from './types';

/** Допуск совпадения точек и нулевой длины (единицы модели). */
export const PATH_EPS = 1e-9;

const TWO_PI = Math.PI * 2;
const DEG = 180 / Math.PI;

export function dist(a: Point2, b: Point2): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

export function samePoint(a: Point2, b: Point2): boolean {
  return dist(a, b) <= PATH_EPS;
}

/** Убирает `-0`, чтобы в данных не появлялось отрицательных нулей. */
export function clean(v: number): number {
  return v === 0 ? 0 : v;
}

/** Обнуляет шум вычислений (например, 3e-16 вместо 0). */
function snap(v: number, scale: number): number {
  return Math.abs(v) < 1e-12 * Math.max(1, scale) ? 0 : v;
}

/** Угол в градусах, приведённый к [0, 360) и округлённый до 10 знаков (убирает шум вида 359.99999999999994). */
function angleDeg(rad: number): number {
  const d = Number((((rad * DEG) % 360) + 360).toFixed(10)) % 360;
  return clean(d);
}

export function pt(x: number, y: number): Point2 {
  return Object.freeze([clean(x), clean(y)]) as unknown as Point2;
}

/** Косинус и синус угла в градусах; для углов, кратных 90°, результат точный (без 6e-17). */
export function cosSinDeg(angleDeg: number): [number, number] {
  const a = ((angleDeg % 360) + 360) % 360;
  if (a === 0) return [1, 0];
  if (a === 90) return [0, 1];
  if (a === 180) return [-1, 0];
  if (a === 270) return [0, -1];
  const r = (a * Math.PI) / 180;
  return [Math.cos(r), Math.sin(r)];
}

/** Приводит угол к диапазону [0, 2π). */
function norm2pi(a: number): number {
  const r = a % TWO_PI;
  return r < 0 ? r + TWO_PI : r;
}

/** Полная геометрия дуги из начала, конца и bulge (bulge ≠ 0). */
export function arcFromBulge(from: Point2, to: Point2, bulge: number): PathArcSegment {
  const chord = dist(from, to);
  if (chord <= PATH_EPS) {
    throw new CadPathError('arc', 'start and end points coincide: an arc needs a non-zero chord');
  }
  const ccw = bulge > 0;
  const sweep = 4 * Math.atan(Math.abs(bulge)); // 0 < sweep < 2π
  const radius = chord / (2 * Math.sin(sweep / 2));
  // Расстояние от середины хорды до центра (со знаком: > 0 для дуг меньше полуокружности).
  const apothem = snap(radius * Math.cos(sweep / 2), radius);
  const mx = (from[0] + to[0]) / 2;
  const my = (from[1] + to[1]) / 2;
  const nx = -(to[1] - from[1]) / chord; // левая нормаль к хорде
  const ny = (to[0] - from[0]) / chord;
  const k = ccw ? apothem : -apothem;
  const center = pt(snap(mx + nx * k, radius + Math.abs(mx)), snap(my + ny * k, radius + Math.abs(my)));
  const startAngle = Math.atan2(from[1] - center[1], from[0] - center[0]);
  const endAngle = Math.atan2(to[1] - center[1], to[0] - center[0]);
  return Object.freeze({
    type: 'arc' as const,
    from,
    to,
    center,
    radius,
    startAngleDeg: angleDeg(startAngle),
    endAngleDeg: angleDeg(endAngle),
    counterclockwise: ccw,
    sweepDeg: sweep * DEG,
    bulge,
    length: radius * sweep,
  });
}

/** bulge по углу дуги (рад., > 0) и направлению. */
export function bulgeFromSweep(sweepRad: number, ccw: boolean): number {
  let b = Math.tan(sweepRad / 4);
  if (Math.abs(b - 1) < 1e-14) b = 1; // полуокружность: tan(π/4) без хвоста 0.9999999999999999
  return ccw ? b : -b;
}

/** Дуга по радиусу. `ccw` — направление в числовой плоскости. */
export function bulgeFromRadius(from: Point2, to: Point2, radius: number, ccw: boolean, large: boolean): number {
  if (!Number.isFinite(radius) || radius <= 0) {
    throw new CadPathError('arc.radius', `must be a positive number, got ${String(radius)}`);
  }
  const chord = dist(from, to);
  if (chord <= PATH_EPS) {
    throw new CadPathError('arc', 'start and end points coincide: an arc needs a non-zero chord');
  }
  const ratio = chord / (2 * radius);
  if (ratio > 1 + 1e-9) {
    throw new CadPathError('arc.radius', `${radius} is too small for a chord of ${chord} (needs at least ${chord / 2})`);
  }
  const half = Math.asin(Math.min(1, ratio)); // половина меньшего угла дуги
  const sweep = large ? TWO_PI - 2 * half : 2 * half;
  return bulgeFromSweep(sweep, ccw);
}

/** Дуга по центру: радиус — расстояние до начала, до конца оно должно быть таким же. */
export function bulgeFromCenter(from: Point2, to: Point2, center: Point2, ccw: boolean): number {
  const r1 = dist(center, from);
  const r2 = dist(center, to);
  if (r1 <= PATH_EPS) throw new CadPathError('arc.center', 'coincides with the start point');
  if (Math.abs(r1 - r2) > 1e-6 * Math.max(1, r1)) {
    throw new CadPathError('arc.center', `is not equidistant from the start (${r1}) and the end (${r2})`);
  }
  if (dist(from, to) <= PATH_EPS) {
    throw new CadPathError('arc', 'start and end points coincide: a full circle cannot be built with arcTo');
  }
  const a1 = Math.atan2(from[1] - center[1], from[0] - center[0]);
  const a2 = Math.atan2(to[1] - center[1], to[0] - center[0]);
  const sweep = ccw ? norm2pi(a2 - a1) : norm2pi(a1 - a2);
  return bulgeFromSweep(sweep, ccw);
}

/** Дуга по трём точкам (`through` лежит на дуге между `from` и `to`). */
export function bulgeFromThrough(from: Point2, through: Point2, to: Point2): number {
  const cross = (through[0] - from[0]) * (to[1] - through[1]) - (through[1] - from[1]) * (to[0] - through[0]);
  const scale = Math.max(1, dist(from, through), dist(through, to));
  if (Math.abs(cross) <= 1e-12 * scale * scale) {
    throw new CadPathError('arc.through', 'the three points are collinear: no circle passes through them');
  }
  if (samePoint(from, to)) {
    throw new CadPathError('arc', 'start and end points coincide: a full circle cannot be built with arcTo');
  }
  const ccw = cross > 0; // обход from → through → to против часовой стрелки
  const [ax, ay] = from;
  const [bx, by] = through;
  const [cx, cy] = to;
  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
  const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d;
  const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d;
  const a1 = Math.atan2(ay - uy, ax - ux);
  const a2 = Math.atan2(cy - uy, cx - ux);
  const sweep = ccw ? norm2pi(a2 - a1) : norm2pi(a1 - a2);
  return bulgeFromSweep(sweep, ccw);
}

/**
 * Дуга, касательная к направлению `dir` (единичный вектор) в точке `from`, до точки `to`.
 * Угол между касательной и хордой α даёт угол дуги 2α, поэтому bulge = tan(α / 2).
 */
export function bulgeFromTangent(from: Point2, to: Point2, dir: Point2): number {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  if (Math.hypot(dx, dy) <= PATH_EPS) {
    throw new CadPathError('arc', 'start and end points coincide: an arc needs a non-zero chord');
  }
  const cross = dir[0] * dy - dir[1] * dx;
  const dot = dir[0] * dx + dir[1] * dy;
  if (Math.abs(cross) <= PATH_EPS * Math.hypot(dx, dy)) {
    throw new CadPathError(
      'arc.tangent',
      dot > 0 ? 'the end point lies on the tangent line: use lineTo' : 'the end point lies behind the tangent line: no tangent arc exists',
    );
  }
  return Math.tan(Math.atan2(cross, dot) / 2);
}

/** Единичное направление движения в конце дуги. */
export function arcEndDirection(arc: PathArcSegment): Point2 {
  const a = Math.atan2(arc.to[1] - arc.center[1], arc.to[0] - arc.center[0]);
  return arc.counterclockwise ? pt(-Math.sin(a), Math.cos(a)) : pt(Math.sin(a), -Math.cos(a));
}
