import { fromAngleDeg, point2 } from '../geometry/vec';
import type { ParametricArc } from '../geometry/curves';
import type { PathSegment, PathVertex } from '../path-builder';
import { CadPath } from '../path-builder';
import { arcFromBulge } from '../path-builder/arc-geometry';
import type { Point2 } from '../settings';
import type { ArcEntity, CircleEntity, EllipseEntity, RectEntity } from './types';

const DEG = Math.PI / 180;

/** Сегменты контура `[x, y, bulge?]` (прямые и дуги) в явном виде. */
export function contourSegments(vertices: readonly PathVertex[], closed: boolean): PathSegment[] {
  const out: PathSegment[] = [];
  const n = vertices.length;
  const count = closed ? n : n - 1;
  for (let i = 0; i < count; i++) {
    const a = vertices[i] as PathVertex;
    const b = vertices[(i + 1) % n] as PathVertex;
    const from = point2(a[0], a[1]);
    const to = point2(b[0], b[1]);
    const bulge = a[2] ?? 0;
    if (bulge !== 0) out.push(arcFromBulge(from, to, bulge));
    else out.push(Object.freeze({ type: 'line' as const, from, to, length: Math.hypot(to[0] - from[0], to[1] - from[1]) }));
  }
  return out;
}

/** Вершины прямоугольника (против часовой стрелки от минимального угла), со скруглениями — с `bulge`. */
export function rectVertices(rect: Pick<RectEntity, 'x' | 'y' | 'width' | 'height' | 'cornerRadius'>): PathVertex[] {
  const { x, y, width: w, height: h, cornerRadius: r } = rect;
  if (r <= 0) {
    return [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
    ];
  }
  return [...CadPath.start(x, y).right(w).up(h).left(w).close().filletAll(r).build().vertices];
}

/** Окружность как параметрическая дуга. */
export function circleParametric(c: Pick<CircleEntity, 'center' | 'radius'>): ParametricArc {
  return { center: c.center, u: [c.radius, 0], v: [0, c.radius], t0: 0, sweep: Math.PI * 2 };
}

/** Длина дуги окружности в градусах (0…360) с учётом направления. */
export function arcSweepDeg(a: Pick<ArcEntity, 'startAngleDeg' | 'endAngleDeg' | 'counterclockwise'>): number {
  const d = a.counterclockwise ? a.endAngleDeg - a.startAngleDeg : a.startAngleDeg - a.endAngleDeg;
  const s = ((d % 360) + 360) % 360;
  return s === 0 ? 360 : s;
}

export function arcParametric(a: ArcEntity): ParametricArc {
  const sweep = arcSweepDeg(a) * DEG;
  return {
    center: a.center,
    u: [a.radius, 0],
    v: [0, a.radius],
    t0: a.startAngleDeg * DEG,
    sweep: a.counterclockwise ? sweep : -sweep,
  };
}

export function arcEndpoints(a: ArcEntity): [Point2, Point2] {
  const s = fromAngleDeg(a.startAngleDeg);
  const e = fromAngleDeg(a.endAngleDeg);
  return [
    [a.center[0] + s[0] * a.radius, a.center[1] + s[1] * a.radius],
    [a.center[0] + e[0] * a.radius, a.center[1] + e[1] * a.radius],
  ];
}

export function ellipseParametric(e: EllipseEntity): ParametricArc {
  const [c, s] = fromAngleDeg(e.rotationDeg);
  return {
    center: e.center,
    u: [c * e.radiusX, s * e.radiusX],
    v: [-s * e.radiusY, c * e.radiusY],
    t0: e.startAngleDeg * DEG,
    sweep: (e.endAngleDeg - e.startAngleDeg) * DEG,
  };
}

/** Сегмент-дуга контура как параметрическая дуга. */
export function segmentParametric(seg: Extract<PathSegment, { type: 'arc' }>): ParametricArc {
  return {
    center: seg.center,
    u: [seg.radius, 0],
    v: [0, seg.radius],
    t0: seg.startAngleDeg * DEG,
    sweep: (seg.counterclockwise ? 1 : -1) * seg.sweepDeg * DEG,
  };
}
