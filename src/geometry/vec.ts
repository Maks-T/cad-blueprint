import type { Point2 } from '../settings';
import { CadGeometryError } from './errors';

/** Допуск сравнения точек и длин (единицы модели). Совпадает с `PATH_EPS` построителя контуров. */
export const GEOM_EPS = 1e-9;

const DEG = Math.PI / 180;

/** Убирает `-0`. */
export function clean0(v: number): number {
  return v === 0 ? 0 : v;
}

/** Замороженная точка без `-0`. */
export function point2(x: number, y: number): Point2 {
  return Object.freeze([clean0(x), clean0(y)]) as unknown as Point2;
}

export function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

export function isPoint2(v: unknown): v is Point2 {
  return Array.isArray(v) && v.length === 2 && isFiniteNumber(v[0]) && isFiniteNumber(v[1]);
}

/** Проверяет точку `[x, y]` и возвращает замороженную копию. */
export function assertPoint(v: unknown, field: string, ErrorClass: new (f: string, m: string) => Error = CadGeometryError): Point2 {
  if (!isPoint2(v)) throw new ErrorClass(field, `must be a finite point [x, y], got ${JSON.stringify(v)}`);
  return point2(v[0], v[1]);
}

export const add = (a: Point2, b: Point2): Point2 => [a[0] + b[0], a[1] + b[1]];
export const sub = (a: Point2, b: Point2): Point2 => [a[0] - b[0], a[1] - b[1]];
export const mul = (a: Point2, k: number): Point2 => [a[0] * k, a[1] * k];
export const dot = (a: Point2, b: Point2): number => a[0] * b[0] + a[1] * b[1];
export const cross = (a: Point2, b: Point2): number => a[0] * b[1] - a[1] * b[0];
export const length = (a: Point2): number => Math.hypot(a[0], a[1]);
export const distance = (a: Point2, b: Point2): number => Math.hypot(b[0] - a[0], b[1] - a[1]);
export const lerp = (a: Point2, b: Point2, t: number): Point2 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
export const midpoint = (a: Point2, b: Point2): Point2 => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
/** Левая нормаль (поворот на +90°). */
export const perp = (a: Point2): Point2 => [-a[1], a[0]];

export function normalize(a: Point2): Point2 {
  const l = length(a);
  if (l <= GEOM_EPS) throw new CadGeometryError('vector', 'cannot normalize a zero-length vector');
  return [a[0] / l, a[1] / l];
}

/** Единичный вектор под углом (градусы); для кратных 90° — точно. */
export function fromAngleDeg(angleDeg: number): Point2 {
  const a = ((angleDeg % 360) + 360) % 360;
  if (a === 0) return [1, 0];
  if (a === 90) return [0, 1];
  if (a === 180) return [-1, 0];
  if (a === 270) return [0, -1];
  return [Math.cos(a * DEG), Math.sin(a * DEG)];
}

/** Угол вектора в градусах, (−180, 180]. */
export function angleDegOf(v: Point2): number {
  return clean0(Math.atan2(v[1], v[0]) / DEG);
}

/** Угол в [0, 360). */
export function normalizeAngleDeg(a: number): number {
  const n = ((a % 360) + 360) % 360;
  return n >= 360 - 1e-10 ? 0 : clean0(n);
}

export function samePoint(a: Point2, b: Point2, eps = GEOM_EPS): boolean {
  return distance(a, b) <= eps;
}
