import type { PathData } from '../path-builder';
import type { Point2 } from '../settings';
import {
  buildArc,
  buildArcThrough,
  buildBezier,
  buildCircle,
  buildEllipse,
  buildLine,
  buildMText,
  buildPoint,
  buildPolyline,
  buildRect,
  buildSpline,
  buildText,
} from './build';
import type {
  ArcEntity,
  ArcInit,
  BezierEntity,
  CircleEntity,
  CircleInit,
  EllipseEntity,
  EllipseInit,
  EntityPropsInit,
  LineEntity,
  MTextEntity,
  PointEntity,
  PolylineEntity,
  PolylineInit,
  RectEntity,
  RectInit,
  SplineEntity,
  SplineInit,
  TextEntity,
  TextInit,
} from './types';

// Короткие фабрики с позиционными аргументами. Полная форма — `buildX({ ... })` (её же использует разбор JSON).

export function point(position: Point2, props: EntityPropsInit = {}): PointEntity {
  return buildPoint({ ...props, position });
}

export function line(from: Point2, to: Point2, props: EntityPropsInit = {}): LineEntity {
  return buildLine({ ...props, from, to });
}

export function circle(center: Point2, radius: number, props: Omit<CircleInit, 'center' | 'radius'> = {}): CircleEntity {
  return buildCircle({ ...props, center, radius });
}

/** Дуга по центру и углам (градусы, против часовой стрелки по умолчанию). */
export function arc(
  center: Point2,
  radius: number,
  startAngleDeg: number,
  endAngleDeg: number,
  props: Omit<ArcInit, 'center' | 'radius' | 'startAngleDeg' | 'endAngleDeg'> = {},
): ArcEntity {
  return buildArc({ ...props, center, radius, startAngleDeg, endAngleDeg });
}

/** Дуга по трём точкам. */
export function arcThrough(start: Point2, through: Point2, end: Point2, props: EntityPropsInit = {}): ArcEntity {
  return buildArcThrough(start, through, end, props);
}

export function ellipse(
  center: Point2,
  radiusX: number,
  radiusY: number,
  props: Omit<EllipseInit, 'center' | 'radiusX' | 'radiusY'> = {},
): EllipseEntity {
  return buildEllipse({ ...props, center, radiusX, radiusY });
}

export function rect(
  x: number,
  y: number,
  width: number,
  height: number,
  props: Omit<RectInit, 'x' | 'y' | 'width' | 'height'> = {},
): RectEntity {
  return buildRect({ ...props, x, y, width, height });
}

type PolylineOptions = Omit<PolylineInit, 'vertices' | 'holes'> & {
  holes?: readonly (readonly (readonly number[])[] | PathData)[];
};

function isPathData(v: unknown): v is PathData {
  return typeof v === 'object' && v !== null && !Array.isArray(v) && 'vertices' in v && 'segments' in v;
}

/**
 * Полилиния из вершин `[x, y, bulge?]` или из `CadPath.build()`. Вырезы — вершины или `CadPath.build()`.
 * Для `PathData` замкнутость берётся из контура, если `closed` не задан явно.
 */
export function polyline(source: readonly (readonly number[])[] | PathData, props: PolylineOptions = {}): PolylineEntity {
  const { holes, ...rest } = props;
  const vertices = isPathData(source) ? source.vertices : source;
  const closed = rest.closed ?? (isPathData(source) ? source.closed : false);
  const init: PolylineInit = { ...rest, vertices, closed };
  if (holes !== undefined) init.holes = holes.map((h) => (isPathData(h) ? h.vertices : h));
  return buildPolyline(init);
}

/** Замкнутая полилиния (полигон), можно с вырезами. */
export function polygon(source: readonly (readonly number[])[] | PathData, props: Omit<PolylineOptions, 'closed'> = {}): PolylineEntity {
  return polyline(source, { ...props, closed: true });
}

export function text(position: Point2, value: string, props: Omit<TextInit, 'position' | 'value'> = {}): TextEntity {
  return buildText({ ...props, position, value });
}

export function mtext(position: Point2, value: string, props: Omit<TextInit, 'position' | 'value'> = {}): MTextEntity {
  return buildMText({ ...props, position, value });
}

export function spline(controlPoints: readonly Point2[], props: Omit<SplineInit, 'controlPoints'> = {}): SplineEntity {
  return buildSpline({ ...props, controlPoints });
}

export function bezier(points: readonly Point2[], props: EntityPropsInit = {}): BezierEntity {
  return buildBezier({ ...props, points });
}
