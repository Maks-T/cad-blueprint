import type { Point2 } from '../settings';
import { PATH_EPS, bulgeFromSweep, dist, pt } from './arc-geometry';
import { CadPathError } from './errors';

/** Что сделать с углом между двумя прямыми сегментами. */
export type CornerSpec =
  | { readonly kind: 'fillet'; readonly radius: number }
  | { readonly kind: 'chamfer'; readonly d1: number; readonly d2: number };

/** Результат расчёта угла: на сколько укоротить соседние сегменты и чем соединить их концы. */
export interface CornerResult {
  /** Отступ от вершины назад по предыдущему сегменту. */
  readonly trimPrev: number;
  /** Отступ от вершины вперёд по следующему сегменту. */
  readonly trimNext: number;
  readonly from: Point2;
  readonly to: Point2;
  /** 0 — фаска (прямая), иначе дуга сопряжения. */
  readonly bulge: number;
}

/**
 * Считает сопряжение в вершине `v` между отрезками `prev → v` и `v → next`.
 * Ошибки: нулевая длина, сегменты на одной прямой, разворот на 180°, отступ длиннее сегмента.
 */
export function computeCorner(prev: Point2, v: Point2, next: Point2, spec: CornerSpec, field: string): CornerResult {
  const l1 = dist(v, prev);
  const l2 = dist(v, next);
  if (l1 <= PATH_EPS || l2 <= PATH_EPS) {
    throw new CadPathError(field, 'a segment next to the corner has zero length');
  }
  const u1: Point2 = [(prev[0] - v[0]) / l1, (prev[1] - v[1]) / l1]; // от вершины к предыдущей точке
  const u2: Point2 = [(next[0] - v[0]) / l2, (next[1] - v[1]) / l2]; // от вершины к следующей точке
  const cos = u1[0] * u2[0] + u1[1] * u2[1];
  const crossU = u1[0] * u2[1] - u1[1] * u2[0];
  const sin = Math.abs(crossU);
  if (sin <= PATH_EPS) {
    throw new CadPathError(
      field,
      cos > 0 ? 'the segments fold back onto each other (180° turn): there is no corner to round' : 'the segments are collinear: there is no corner to round',
    );
  }

  let trimPrev: number;
  let trimNext: number;
  let bulge = 0;
  if (spec.kind === 'fillet') {
    const r = spec.radius;
    if (!Number.isFinite(r) || r <= 0) throw new CadPathError(`${field}.radius`, `must be a positive number, got ${String(r)}`);
    const t = (r * (1 + cos)) / sin; // r / tan(θ / 2), θ — угол между сегментами
    trimPrev = t;
    trimNext = t;
    // Дуга сопряжения: угол θ между сегментами → угол дуги π − θ; поворот влево = против часовой.
    const theta = Math.acos(Math.max(-1, Math.min(1, cos)));
    bulge = bulgeFromSweep(Math.PI - theta, -crossU > 0);
  } else {
    const { d1, d2 } = spec;
    for (const [name, d] of [['d1', d1], ['d2', d2]] as const) {
      if (!Number.isFinite(d) || d <= 0) throw new CadPathError(`${field}.${name}`, `must be a positive number, got ${String(d)}`);
    }
    trimPrev = d1;
    trimNext = d2;
  }

  const tol = (len: number): number => 1e-9 * Math.max(1, len);
  if (trimPrev > l1 + tol(l1) || trimNext > l2 + tol(l2)) {
    const what = spec.kind === 'fillet' ? `radius ${spec.radius}` : `distances ${spec.d1} / ${spec.d2}`;
    throw new CadPathError(
      field,
      `${what} does not fit: it needs ${trimPrev} on the previous and ${trimNext} on the next segment, but they are ${l1} and ${l2} long`,
    );
  }
  return {
    trimPrev,
    trimNext,
    from: pt(v[0] + u1[0] * trimPrev, v[1] + u1[1] * trimPrev),
    to: pt(v[0] + u2[0] * trimNext, v[1] + u2[1] * trimNext),
    bulge,
  };
}
