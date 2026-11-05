import type { Point2 } from '../settings';
import { CadGeometryError } from './errors';
import { clean0, fromAngleDeg, isFiniteNumber } from './vec';

/**
 * Аффинная матрица 2D в порядке SVG: `[a, b, c, d, e, f]`,
 * `x' = a·x + c·y + e`, `y' = b·x + d·y + f`.
 */
export type Matrix2D = readonly [number, number, number, number, number, number];

export const IDENTITY: Matrix2D = Object.freeze([1, 0, 0, 1, 0, 0]) as unknown as Matrix2D;

export function translation(dx: number, dy: number): Matrix2D {
  return [1, 0, 0, 1, dx, dy];
}

/** Поворот против часовой стрелки (в числовой плоскости) вокруг начала координат. */
export function rotation(angleDeg: number): Matrix2D {
  const [c, s] = fromAngleDeg(angleDeg);
  return [c, s, -s, c, 0, 0];
}

export function scaling(sx: number, sy: number = sx): Matrix2D {
  return [sx, 0, 0, sy, 0, 0];
}

/** `m1 · m2`: сначала применяется `m2`, затем `m1`. */
export function multiply(m1: Matrix2D, m2: Matrix2D): Matrix2D {
  const [a1, b1, c1, d1, e1, f1] = m1;
  const [a2, b2, c2, d2, e2, f2] = m2;
  return [
    a1 * a2 + c1 * b2,
    b1 * a2 + d1 * b2,
    a1 * c2 + c1 * d2,
    b1 * c2 + d1 * d2,
    a1 * e2 + c1 * f2 + e1,
    b1 * e2 + d1 * f2 + f1,
  ];
}

/** Композиция слева направо: `compose(A, B, C)` = A·B·C (сначала C). */
export function compose(...ms: Matrix2D[]): Matrix2D {
  return ms.reduce((acc, m) => multiply(acc, m), IDENTITY);
}

export function applyToPoint(m: Matrix2D, p: Point2): Point2 {
  return [clean0(m[0] * p[0] + m[2] * p[1] + m[4]), clean0(m[1] * p[0] + m[3] * p[1] + m[5])];
}

/** Применяет только линейную часть (для векторов направлений). */
export function applyToVector(m: Matrix2D, v: Point2): Point2 {
  return [m[0] * v[0] + m[2] * v[1], m[1] * v[0] + m[3] * v[1]];
}

export function determinant(m: Matrix2D): number {
  return m[0] * m[3] - m[1] * m[2];
}

export function invert(m: Matrix2D): Matrix2D {
  const det = determinant(m);
  if (Math.abs(det) < 1e-15) throw new CadGeometryError('matrix', 'is singular and cannot be inverted');
  const [a, b, c, d, e, f] = m;
  return [d / det, -b / det, -c / det, a / det, (c * f - d * e) / det, (b * e - a * f) / det];
}

export function isIdentity(m: Matrix2D, eps = 1e-12): boolean {
  return m.every((v, i) => Math.abs(v - (IDENTITY[i] as number)) <= eps);
}

/**
 * Матрица — подобие (поворот + равномерный масштаб + сдвиг, возможно с зеркалом):
 * окружность переходит в окружность, а дуга полилинии (`bulge`) остаётся дугой.
 */
export function isSimilarity(m: Matrix2D, eps = 1e-9): boolean {
  const [a, b, c, d] = m;
  const sx = Math.hypot(a, b);
  const sy = Math.hypot(c, d);
  const orth = a * c + b * d;
  return Math.abs(sx - sy) <= eps * Math.max(1, sx) && Math.abs(orth) <= eps * Math.max(1, sx * sy);
}

/** Коэффициент равномерного масштаба (для подобия) = √|det|. */
export function uniformScale(m: Matrix2D): number {
  return Math.sqrt(Math.abs(determinant(m)));
}

/** Матрица меняет ориентацию (зеркало): обход «против часовой» становится «по часовой». */
export function isMirroring(m: Matrix2D): boolean {
  return determinant(m) < 0;
}

/**
 * Разложение `T · R · S` (сдвиг, поворот, масштаб по осям; зеркало — отрицательный `scaleY`).
 * Точно только для матриц без перекоса (из `insert` и `viewport` перекос не возникает).
 */
export function decompose(m: Matrix2D): { x: number; y: number; rotationDeg: number; scaleX: number; scaleY: number } {
  const [a, b, c, d, e, f] = m;
  const scaleX = Math.hypot(a, b);
  const det = a * d - b * c;
  const scaleY = scaleX === 0 ? Math.hypot(c, d) : det / scaleX;
  const rotationDeg = clean0((Math.atan2(b, a) * 180) / Math.PI);
  return { x: e, y: f, rotationDeg, scaleX, scaleY };
}

export function assertMatrix(m: unknown, field = 'matrix'): Matrix2D {
  if (!Array.isArray(m) || m.length !== 6 || !m.every(isFiniteNumber)) {
    throw new CadGeometryError(field, 'must be an array of 6 finite numbers [a, b, c, d, e, f]');
  }
  return m as unknown as Matrix2D;
}
