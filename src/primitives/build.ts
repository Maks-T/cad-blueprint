import { clampedUniformKnots, assertKnots } from '../geometry/curves';
import { distance } from '../geometry/vec';
import type { PathData, PathVertex } from '../path-builder';
import { arcFromBulge, bulgeFromThrough } from '../path-builder/arc-geometry';
import type { Point2 } from '../settings';
import { isTextAnchor, TEXT_ANCHORS } from '../typography';
import {
  angle360,
  assertKnownKeys,
  assertObject,
  bool,
  finite,
  freezeEntity,
  nonNegative,
  optionalString,
  parseEntityProps,
  parseFill,
  pointOf,
  pointsOf,
  positive,
  textValue,
} from './common';
import { CadPrimitiveError } from './errors';
import type {
  ArcEntity,
  ArcInit,
  BezierEntity,
  BezierInit,
  CircleEntity,
  CircleInit,
  EllipseEntity,
  EllipseInit,
  EntityFill,
  EntityPropsInit,
  LineEntity,
  LineInit,
  MTextEntity,
  PointEntity,
  PointInit,
  PolylineEntity,
  PolylineInit,
  RectEntity,
  RectInit,
  SplineEntity,
  SplineInit,
  TextEntity,
  TextInit,
} from './types';

const MAX_VERTICES = 100_000;

export function buildPoint(init: PointInit): PointEntity {
  assertObject(init, 'point');
  assertKnownKeys(init, ['position'], 'point');
  return freezeEntity({ type: 'point', ...parseEntityProps(init, 'point'), position: pointOf(init.position, 'point.position') });
}

export function buildLine(init: LineInit): LineEntity {
  assertObject(init, 'line');
  assertKnownKeys(init, ['from', 'to'], 'line');
  return freezeEntity({
    type: 'line',
    ...parseEntityProps(init, 'line'),
    from: pointOf(init.from, 'line.from'),
    to: pointOf(init.to, 'line.to'),
  });
}

export function buildCircle(init: CircleInit): CircleEntity {
  assertObject(init, 'circle');
  assertKnownKeys(init, ['center', 'radius', 'fill'], 'circle');
  return freezeEntity({
    type: 'circle',
    ...parseEntityProps(init, 'circle'),
    center: pointOf(init.center, 'circle.center'),
    radius: positive(init.radius, 'circle.radius'),
    fill: parseFill(init.fill, 'circle.fill'),
  });
}

export function buildArc(init: ArcInit): ArcEntity {
  assertObject(init, 'arc');
  assertKnownKeys(init, ['center', 'radius', 'startAngleDeg', 'endAngleDeg', 'counterclockwise'], 'arc');
  const startAngleDeg = angle360(init.startAngleDeg, 'arc.startAngleDeg');
  const endAngleDeg = angle360(init.endAngleDeg, 'arc.endAngleDeg');
  if (startAngleDeg === endAngleDeg) {
    throw new CadPrimitiveError('arc', 'start and end angles coincide: use circle for a full circle');
  }
  return freezeEntity({
    type: 'arc',
    ...parseEntityProps(init, 'arc'),
    center: pointOf(init.center, 'arc.center'),
    radius: positive(init.radius, 'arc.radius'),
    startAngleDeg,
    endAngleDeg,
    counterclockwise: bool(init.counterclockwise, 'arc.counterclockwise', true),
  });
}

/** Дуга по трём точкам: начало, любая промежуточная точка на дуге, конец. */
export function buildArcThrough(start: Point2, through: Point2, end: Point2, props: EntityPropsInit = {}): ArcEntity {
  const a = pointOf(start, 'arc.start');
  const b = pointOf(through, 'arc.through');
  const c = pointOf(end, 'arc.end');
  const seg = arcFromBulge(a, c, bulgeFromThrough(a, b, c));
  return buildArc({
    ...props,
    center: seg.center,
    radius: seg.radius,
    startAngleDeg: seg.startAngleDeg,
    endAngleDeg: seg.endAngleDeg,
    counterclockwise: seg.counterclockwise,
  });
}

export function buildEllipse(init: EllipseInit): EllipseEntity {
  assertObject(init, 'ellipse');
  assertKnownKeys(init, ['center', 'radiusX', 'radiusY', 'rotationDeg', 'startAngleDeg', 'endAngleDeg', 'fill'], 'ellipse');
  const rawStart = finite(init.startAngleDeg ?? 0, 'ellipse.startAngleDeg');
  const rawEnd = finite(init.endAngleDeg ?? 360, 'ellipse.endAngleDeg');
  const startAngleDeg = angle360(rawStart, 'ellipse.startAngleDeg');
  let sweep = rawEnd - rawStart;
  if (Math.abs(sweep) >= 360 - 1e-10) sweep = 360;
  else sweep = Number((((sweep % 360) + 360) % 360).toFixed(10));
  if (sweep === 0) throw new CadPrimitiveError('ellipse', 'start and end angles coincide (use 0 … 360 for a full ellipse)');
  return freezeEntity({
    type: 'ellipse',
    ...parseEntityProps(init, 'ellipse'),
    center: pointOf(init.center, 'ellipse.center'),
    radiusX: positive(init.radiusX, 'ellipse.radiusX'),
    radiusY: positive(init.radiusY, 'ellipse.radiusY'),
    rotationDeg: finite(init.rotationDeg ?? 0, 'ellipse.rotationDeg'),
    startAngleDeg,
    endAngleDeg: startAngleDeg + sweep,
    fill: parseFill(init.fill, 'ellipse.fill'),
  });
}

/** Эллипс полный? */
export function isFullEllipse(e: EllipseEntity): boolean {
  return e.endAngleDeg - e.startAngleDeg >= 360 - 1e-10;
}

export function buildRect(init: RectInit): RectEntity {
  assertObject(init, 'rect');
  assertKnownKeys(init, ['x', 'y', 'width', 'height', 'cornerRadius', 'fill'], 'rect');
  const width = positive(init.width, 'rect.width');
  const height = positive(init.height, 'rect.height');
  const cornerRadius = nonNegative(init.cornerRadius ?? 0, 'rect.cornerRadius');
  if (cornerRadius > Math.min(width, height) / 2 + 1e-12) {
    throw new CadPrimitiveError('rect.cornerRadius', `${cornerRadius} exceeds half of the shorter side (${Math.min(width, height) / 2})`);
  }
  return freezeEntity({
    type: 'rect',
    ...parseEntityProps(init, 'rect'),
    x: finite(init.x, 'rect.x'),
    y: finite(init.y, 'rect.y'),
    width,
    height,
    cornerRadius: Math.min(cornerRadius, Math.min(width, height) / 2),
    fill: parseFill(init.fill, 'rect.fill'),
  });
}

function vertexOf(v: unknown, field: string): PathVertex {
  if (!Array.isArray(v) || (v.length !== 2 && v.length !== 3)) {
    throw new CadPrimitiveError(field, `must be [x, y] or [x, y, bulge], got ${JSON.stringify(v)}`);
  }
  const x = finite(v[0], `${field}[0]`);
  const y = finite(v[1], `${field}[1]`);
  const bulge = v.length === 3 ? finite(v[2], `${field}[2]`) : 0;
  return (bulge === 0 ? Object.freeze([x, y]) : Object.freeze([x, y, bulge])) as unknown as PathVertex;
}

function contourOf(raw: unknown, field: string, closed: boolean): PathVertex[] {
  if (!Array.isArray(raw)) throw new CadPrimitiveError(field, 'must be an array of vertices');
  if (raw.length < 2) throw new CadPrimitiveError(field, `needs at least 2 vertices, got ${raw.length}`);
  if (raw.length > MAX_VERTICES) throw new CadPrimitiveError(field, `has more than ${MAX_VERTICES} vertices`);
  const out = raw.map((v, i) => vertexOf(v, `${field}[${i}]`));
  const count = closed ? out.length : out.length - 1;
  for (let i = 0; i < count; i++) {
    const a = out[i] as PathVertex;
    const b = out[(i + 1) % out.length] as PathVertex;
    if (a[2] !== undefined && distance([a[0], a[1]], [b[0], b[1]]) <= 1e-12) {
      throw new CadPrimitiveError(`${field}[${i}]`, 'an arc segment (bulge ≠ 0) must not have coincident end points');
    }
  }
  if (!closed) {
    const last = out[out.length - 1] as PathVertex;
    if (last.length === 3) out[out.length - 1] = Object.freeze([last[0], last[1]]) as unknown as PathVertex;
  }
  // У замкнутого контура первая вершина не повторяется в конце.
  if (closed && out.length > 2) {
    const first = out[0] as PathVertex;
    const last = out[out.length - 1] as PathVertex;
    if (last[2] === undefined && distance([first[0], first[1]], [last[0], last[1]]) <= 1e-12) out.pop();
  }
  return out;
}

export function buildPolyline(init: PolylineInit): PolylineEntity {
  assertObject(init, 'polyline');
  assertKnownKeys(init, ['vertices', 'closed', 'holes', 'fill'], 'polyline');
  const closed = bool(init.closed, 'polyline.closed', false);
  const vertices = contourOf(init.vertices, 'polyline.vertices', closed);
  const rawHoles = init.holes ?? [];
  if (!Array.isArray(rawHoles)) throw new CadPrimitiveError('polyline.holes', 'must be an array of contours');
  if (rawHoles.length > 0 && !closed) throw new CadPrimitiveError('polyline.holes', 'are allowed only for a closed polyline');
  const holes = rawHoles.map((h, i) => Object.freeze(contourOf(h, `polyline.holes[${i}]`, true)));
  return freezeEntity({
    type: 'polyline',
    ...parseEntityProps(init, 'polyline'),
    vertices: Object.freeze(vertices),
    closed,
    holes: Object.freeze(holes),
    fill: parseFill(init.fill, 'polyline.fill'),
  });
}

/** Полилиния из результата `CadPath.build()` (и, при необходимости, вырезов из других `CadPath`). */
export function polylineFromPath(
  path: PathData,
  options: EntityPropsInit & { holes?: readonly PathData[]; fill?: EntityFill | null } = {},
): PolylineEntity {
  const { holes = [], ...rest } = options;
  holes.forEach((h, i) => {
    if (!h.closed) throw new CadPrimitiveError(`holes[${i}]`, 'a hole must be a closed CadPath');
  });
  return buildPolyline({ ...rest, vertices: path.vertices, closed: path.closed, holes: holes.map((h) => h.vertices) });
}

function buildTextBase(init: TextInit, kind: 'text' | 'mtext'): Omit<TextEntity, 'type'> {
  assertObject(init, kind);
  assertKnownKeys(init, ['position', 'value', 'style', 'height', 'rotationDeg', 'anchor'], kind);
  const anchor = init.anchor ?? 'bottom-left';
  if (!isTextAnchor(anchor)) {
    throw new CadPrimitiveError(`${kind}.anchor`, `must be one of ${TEXT_ANCHORS.join(' | ')}, got ${String(anchor)}`);
  }
  const height = init.height === undefined || init.height === null ? null : positive(init.height, `${kind}.height`);
  return {
    ...parseEntityProps(init, kind),
    position: pointOf(init.position, `${kind}.position`),
    value: textValue(init.value, `${kind}.value`, kind === 'mtext'),
    style: optionalString(init.style, `${kind}.style`, 255),
    height,
    rotationDeg: finite(init.rotationDeg ?? 0, `${kind}.rotationDeg`),
    anchor,
  };
}

export function buildText(init: TextInit): TextEntity {
  return freezeEntity({ type: 'text', ...buildTextBase(init, 'text') });
}

export function buildMText(init: TextInit): MTextEntity {
  return freezeEntity({ type: 'mtext', ...buildTextBase(init, 'mtext') });
}

export function buildSpline(init: SplineInit): SplineEntity {
  assertObject(init, 'spline');
  assertKnownKeys(init, ['controlPoints', 'degree', 'knots'], 'spline');
  const degree = init.degree ?? 3;
  if (!Number.isInteger(degree) || degree < 1 || degree > 3) {
    throw new CadPrimitiveError('spline.degree', `must be 1, 2 or 3, got ${String(degree)}`);
  }
  const controlPoints = pointsOf(init.controlPoints, 'spline.controlPoints', degree + 1);
  let knots: number[];
  if (init.knots === undefined) {
    knots = clampedUniformKnots(controlPoints.length, degree);
  } else {
    if (!Array.isArray(init.knots)) throw new CadPrimitiveError('spline.knots', 'must be an array of numbers');
    knots = init.knots.map((k, i) => finite(k, `spline.knots[${i}]`));
    assertKnots(knots, controlPoints.length, degree, 'spline.knots');
  }
  return freezeEntity({
    type: 'spline',
    ...parseEntityProps(init, 'spline'),
    degree,
    controlPoints: Object.freeze(controlPoints),
    knots: Object.freeze(knots),
  });
}

export function buildBezier(init: BezierInit): BezierEntity {
  assertObject(init, 'bezier');
  assertKnownKeys(init, ['points'], 'bezier');
  const points = pointsOf(init.points, 'bezier.points', 4);
  if ((points.length - 1) % 3 !== 0) {
    throw new CadPrimitiveError('bezier.points', `must contain 3n + 1 points (p0, c1, c2, p1, …), got ${points.length}`);
  }
  return freezeEntity({ type: 'bezier', ...parseEntityProps(init, 'bezier'), points: Object.freeze(points) });
}

