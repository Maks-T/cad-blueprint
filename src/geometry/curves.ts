import type { Point2 } from '../settings';
import { BoundsBuilder } from './bounds';
import { CadGeometryError } from './errors';

const TWO_PI = Math.PI * 2;

/**
 * Эллиптическая дуга в параметрической форме: `P(t) = C + U·cos t + V·sin t`,
 * `t` от `t0` до `t0 + sweep` (радианы, `sweep` со знаком). Окружность: `U = (r, 0)`, `V = (0, r)`.
 * Любое аффинное преобразование окружности / эллипса / дуги остаётся в этой форме (U, V — сопряжённые полудиаметры).
 */
export interface ParametricArc {
  readonly center: Point2;
  readonly u: Point2;
  readonly v: Point2;
  readonly t0: number;
  readonly sweep: number;
}

export function evalParametricArc(arc: ParametricArc, t: number): Point2 {
  const c = Math.cos(t);
  const s = Math.sin(t);
  return [arc.center[0] + arc.u[0] * c + arc.v[0] * s, arc.center[1] + arc.u[1] * c + arc.v[1] * s];
}

/** Лежит ли параметр `t` на дуге (с учётом направления и периодичности). */
function onArc(t: number, t0: number, sweep: number): boolean {
  if (Math.abs(sweep) >= TWO_PI - 1e-12) return true;
  let d = sweep >= 0 ? t - t0 : t0 - t;
  d = ((d % TWO_PI) + TWO_PI) % TWO_PI;
  return d <= Math.abs(sweep) + 1e-12;
}

/** Точный габарит эллиптической дуги: концы + точки, где касательная параллельна осям. */
export function parametricArcBounds(arc: ParametricArc, into: BoundsBuilder = new BoundsBuilder()): BoundsBuilder {
  const full = Math.abs(arc.sweep) >= TWO_PI - 1e-12;
  if (!full) {
    into.addPoint(evalParametricArc(arc, arc.t0));
    into.addPoint(evalParametricArc(arc, arc.t0 + arc.sweep));
  }
  const candidates = [Math.atan2(arc.v[0], arc.u[0]), Math.atan2(arc.v[1], arc.u[1])];
  for (const base of candidates) {
    for (const t of [base, base + Math.PI]) {
      if (onArc(t, arc.t0, arc.sweep)) into.addPoint(evalParametricArc(arc, t));
    }
  }
  return into;
}

/** Точка кривой Безье степени 1…3 (алгоритм де Кастельжо). */
export function evalBezier(points: readonly Point2[], t: number): Point2 {
  let pts = points.map((p) => [p[0], p[1]] as [number, number]);
  while (pts.length > 1) {
    const next: [number, number][] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i] as [number, number];
      const b = pts[i + 1] as [number, number];
      next.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
    pts = next;
  }
  const p = pts[0] as [number, number];
  return [p[0], p[1]];
}

/** Корни производной одной координаты кривой Безье степени 1…3 на (0, 1). */
function bezierExtremaParams(c: readonly number[]): number[] {
  const out: number[] = [];
  const push = (t: number): void => {
    if (t > 1e-12 && t < 1 - 1e-12) out.push(t);
  };
  if (c.length === 3) {
    const [p0, p1, p2] = c as [number, number, number];
    const den = p0 - 2 * p1 + p2;
    if (Math.abs(den) > 1e-15) push((p0 - p1) / den);
  } else if (c.length === 4) {
    const [p0, p1, p2, p3] = c as [number, number, number, number];
    // B'(t)/3 = a t² + b t + c
    const a = -p0 + 3 * p1 - 3 * p2 + p3;
    const b = 2 * (p0 - 2 * p1 + p2);
    const k = p1 - p0;
    if (Math.abs(a) < 1e-15) {
      if (Math.abs(b) > 1e-15) push(-k / b);
    } else {
      const disc = b * b - 4 * a * k;
      if (disc >= 0) {
        const sq = Math.sqrt(disc);
        push((-b + sq) / (2 * a));
        push((-b - sq) / (2 * a));
      }
    }
  }
  return out;
}

/** Точный габарит кривой Безье степени 1…3. */
export function bezierBounds(points: readonly Point2[], into: BoundsBuilder = new BoundsBuilder()): BoundsBuilder {
  if (points.length < 2 || points.length > 4) {
    throw new CadGeometryError('bezier', `supports degree 1…3 (2…4 points), got ${points.length} points`);
  }
  into.addPoint(points[0] as Point2);
  into.addPoint(points[points.length - 1] as Point2);
  for (const axis of [0, 1] as const) {
    for (const t of bezierExtremaParams(points.map((p) => p[axis]))) into.addPoint(evalBezier(points, t));
  }
  return into;
}

// ---------------------------------------------------------------------------------------------------------------------
// B-сплайны (нерациональные)

/** Равномерный «зажатый» вектор узлов (кратность `degree + 1` на концах), область [0, 1]. */
export function clampedUniformKnots(controlPointCount: number, degree: number): number[] {
  const n = controlPointCount;
  if (n < degree + 1) {
    throw new CadGeometryError('spline', `needs at least ${degree + 1} control points for degree ${degree}, got ${n}`);
  }
  const spans = n - degree;
  const knots: number[] = [];
  for (let i = 0; i <= degree; i++) knots.push(0);
  for (let i = 1; i < spans; i++) knots.push(i / spans);
  for (let i = 0; i <= degree; i++) knots.push(1);
  return knots;
}

/** Проверяет вектор узлов: длина `n + degree + 1`, неубывающий, конечные числа, невырожденная область. */
export function assertKnots(knots: readonly number[], controlPointCount: number, degree: number, field = 'knots'): void {
  if (knots.length !== controlPointCount + degree + 1) {
    throw new CadGeometryError(
      field,
      `must have controlPoints + degree + 1 = ${controlPointCount + degree + 1} values, got ${knots.length}`,
    );
  }
  for (let i = 0; i < knots.length; i++) {
    const k = knots[i] as number;
    if (!Number.isFinite(k)) throw new CadGeometryError(`${field}[${i}]`, 'must be a finite number');
    if (i > 0 && k < (knots[i - 1] as number)) throw new CadGeometryError(field, 'must be non-decreasing');
  }
  if ((knots[controlPointCount] as number) <= (knots[degree] as number)) {
    throw new CadGeometryError(field, 'the curve domain [knots[degree], knots[n]] is empty');
  }
}

/** Вставка узла `u` (алгоритм Бёма). Возвращает новые узлы и управляющие точки. */
function insertKnot(degree: number, knots: number[], pts: Point2[], u: number): { knots: number[]; pts: Point2[] } {
  let k = degree;
  while (k < knots.length - degree - 2 && (knots[k + 1] as number) <= u) k++;
  const out: Point2[] = [];
  for (let i = 0; i <= k - degree; i++) out.push(pts[i] as Point2);
  for (let i = k - degree + 1; i <= k; i++) {
    const ki = knots[i] as number;
    const den = (knots[i + degree] as number) - ki;
    const a = den === 0 ? 0 : (u - ki) / den;
    const p0 = pts[i - 1] as Point2;
    const p1 = pts[i] as Point2;
    out.push([(1 - a) * p0[0] + a * p1[0], (1 - a) * p0[1] + a * p1[1]]);
  }
  for (let i = k; i < pts.length; i++) out.push(pts[i] as Point2);
  const newKnots = [...knots.slice(0, k + 1), u, ...knots.slice(k + 1)];
  return { knots: newKnots, pts: out };
}

/**
 * Раскладывает B-сплайн степени 1…3 на кривые Безье той же степени (вставкой узлов до кратности `degree`).
 * Каждая кривая — `degree + 1` точек. Вектор узлов может быть и незажатым.
 */
export function splineToBeziers(degree: number, controlPoints: readonly Point2[], knots: readonly number[]): Point2[][] {
  if (!Number.isInteger(degree) || degree < 1 || degree > 3) {
    throw new CadGeometryError('spline.degree', `must be 1, 2 or 3, got ${String(degree)}`);
  }
  assertKnots(knots, controlPoints.length, degree);
  let U = [...knots];
  let P = controlPoints.map((p) => [p[0], p[1]] as Point2);
  const lo = U[degree] as number;
  const hi = U[controlPoints.length] as number;
  const distinct = [...new Set(U.filter((u) => u >= lo && u <= hi))].sort((a, b) => a - b);
  for (const u of distinct) {
    let mult = U.filter((x) => x === u).length;
    while (mult < degree) {
      ({ knots: U, pts: P } = insertKnot(degree, U, P, u));
      mult++;
    }
  }
  const out: Point2[][] = [];
  for (let k = degree; k < U.length - degree - 1; k++) {
    const a = U[k] as number;
    const b = U[k + 1] as number;
    if (b <= a || a < lo || b > hi) continue;
    out.push(P.slice(k - degree, k + 1));
  }
  return out;
}

/** Точка B-сплайна (де Бур). `t` — в области [knots[degree], knots[n]]. */
export function evalSpline(degree: number, controlPoints: readonly Point2[], knots: readonly number[], t: number): Point2 {
  const n = controlPoints.length;
  const lo = knots[degree] as number;
  const hi = knots[n] as number;
  const u = Math.min(Math.max(t, lo), hi);
  let k = degree;
  while (k < n - 1 && (knots[k + 1] as number) <= u) k++;
  const d: [number, number][] = [];
  for (let j = 0; j <= degree; j++) {
    const p = controlPoints[j + k - degree] as Point2;
    d.push([p[0], p[1]]);
  }
  for (let r = 1; r <= degree; r++) {
    for (let j = degree; j >= r; j--) {
      const i = j + k - degree;
      const ki = knots[i] as number;
      const den = (knots[i + degree - r + 1] as number) - ki;
      const a = den === 0 ? 0 : (u - ki) / den;
      const dj = d[j] as [number, number];
      const dj1 = d[j - 1] as [number, number];
      d[j] = [(1 - a) * dj1[0] + a * dj[0], (1 - a) * dj1[1] + a * dj[1]];
    }
  }
  const p = d[degree] as [number, number];
  return [p[0], p[1]];
}
