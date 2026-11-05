import type { LineType } from '../layers';
import type { PathVertex } from '../path-builder';
import type { Point2 } from '../settings';
import type { TextAnchor } from '../typography';

/**
 * Общие свойства любого объекта чертежа (как у объектов AutoCAD).
 * `null` в оформлении — «по слою» (ByLayer).
 */
export interface EntityProps {
  /** Необязательный идентификатор (для выбора во вьюпорте, связи с изделием). До 128 символов. */
  readonly id: string | null;
  /** Имя слоя. По умолчанию `"0"`; внутри блока объекты на слое `"0"` получают слой вставки. */
  readonly layer: string;
  /** Цвет `#rrggbb` или `null` — цвет слоя. */
  readonly color: string | null;
  /** Толщина линии, мм на бумаге, или `null` — толщина слоя. */
  readonly lineWeight: number | null;
  /** Тип линии или `null` — тип линии слоя. */
  readonly lineType: LineType | null;
}

export interface EntityPropsInit {
  id?: string | null;
  layer?: string;
  color?: string | null;
  lineWeight?: number | null;
  lineType?: LineType | null;
}

/**
 * Заливка замкнутой фигуры:
 * - `'hatch'` — штриховка слоя (`Layer.hatch`; если у слоя её нет — без заливки);
 * - `'solid'` — сплошная заливка цветом объекта (или слоя);
 * - `'#rrggbb'` — сплошная заливка указанным цветом.
 */
export type EntityFill = 'hatch' | 'solid' | string;

export interface PointEntity extends EntityProps {
  readonly type: 'point';
  readonly position: Point2;
}

export interface LineEntity extends EntityProps {
  readonly type: 'line';
  readonly from: Point2;
  readonly to: Point2;
}

export interface CircleEntity extends EntityProps {
  readonly type: 'circle';
  readonly center: Point2;
  readonly radius: number;
  readonly fill: EntityFill | null;
}

/** Дуга окружности. Углы — в числовой плоскости (как в DXF и `PathArcSegment`), в [0, 360). */
export interface ArcEntity extends EntityProps {
  readonly type: 'arc';
  readonly center: Point2;
  readonly radius: number;
  readonly startAngleDeg: number;
  readonly endAngleDeg: number;
  /** Направление от начального угла к конечному. По умолчанию `true` (как у ARC в DXF). */
  readonly counterclockwise: boolean;
}

/**
 * Эллипс или эллиптическая дуга. `radiusX` — полуось вдоль повёрнутой оси X, `radiusY` — вдоль повёрнутой оси Y.
 * Углы `startAngleDeg` / `endAngleDeg` — ПАРАМЕТРИЧЕСКИЕ (как в DXF): точка = центр + R·(rx·cos t, ry·sin t),
 * обход всегда против часовой стрелки; `startAngleDeg` ∈ [0, 360), `endAngleDeg` ∈ (start, start + 360].
 * Полный эллипс: `0 … 360`.
 */
export interface EllipseEntity extends EntityProps {
  readonly type: 'ellipse';
  readonly center: Point2;
  readonly radiusX: number;
  readonly radiusY: number;
  readonly rotationDeg: number;
  readonly startAngleDeg: number;
  readonly endAngleDeg: number;
  readonly fill: EntityFill | null;
}

/** Прямоугольник со сторонами вдоль осей. `x`, `y` — минимальный угол. */
export interface RectEntity extends EntityProps {
  readonly type: 'rect';
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  /** Радиус скругления углов (0 — острые углы), не больше половины меньшей стороны. */
  readonly cornerRadius: number;
  readonly fill: EntityFill | null;
}

/**
 * Полилиния / полигон. Вершины `[x, y, bulge?]` (формат `CadPath.build().vertices`).
 * У замкнутого контура последняя вершина НЕ повторяет первую. `holes` — внутренние вырезы (только у замкнутого),
 * каждый — замкнутый контур в том же формате (сечения профилей, столешницы с отверстиями).
 */
export interface PolylineEntity extends EntityProps {
  readonly type: 'polyline';
  readonly vertices: readonly PathVertex[];
  readonly closed: boolean;
  readonly holes: readonly (readonly PathVertex[])[];
  readonly fill: EntityFill | null;
}

interface TextBase extends EntityProps {
  readonly position: Point2;
  readonly value: string;
  /** Имя текстового стиля; `null` — текущий стиль таблицы. */
  readonly style: string | null;
  /** Высота текста (прописных), мм на бумаге; `null` — высота стиля. */
  readonly height: number | null;
  /**
   * Поворот, градусы против часовой стрелки так, как это видно на экране (в обеих системах координат):
   * 90° — текст читается снизу вверх.
   */
  readonly rotationDeg: number;
  readonly anchor: TextAnchor;
}

/** Однострочный текст (TEXT). */
export interface TextEntity extends TextBase {
  readonly type: 'text';
}

/** Многострочный текст (MTEXT): строки через `\n`, выравнивание по 9 опорным точкам. */
export interface MTextEntity extends TextBase {
  readonly type: 'mtext';
}

/** B-сплайн степени 1…3 (нерациональный). */
export interface SplineEntity extends EntityProps {
  readonly type: 'spline';
  readonly degree: number;
  readonly controlPoints: readonly Point2[];
  /** Вектор узлов, длина = `controlPoints + degree + 1`. */
  readonly knots: readonly number[];
}

/** Цепочка кубических кривых Безье: `[p0, c1, c2, p1, c1, c2, p2, …]` — `3n + 1` точек. */
export interface BezierEntity extends EntityProps {
  readonly type: 'bezier';
  readonly points: readonly Point2[];
}

export type PrimitiveEntity =
  | PointEntity
  | LineEntity
  | CircleEntity
  | ArcEntity
  | EllipseEntity
  | RectEntity
  | PolylineEntity
  | TextEntity
  | MTextEntity
  | SplineEntity
  | BezierEntity;

export type PrimitiveType = PrimitiveEntity['type'];

export const PRIMITIVE_TYPES: readonly PrimitiveType[] = Object.freeze([
  'point',
  'line',
  'circle',
  'arc',
  'ellipse',
  'rect',
  'polyline',
  'text',
  'mtext',
  'spline',
  'bezier',
] as const);

// ---------------------------------------------------------------------------------------------------------------------
// Входные данные (для фабрик и разбора JSON)

export interface PointInit extends EntityPropsInit {
  position: Point2;
}
export interface LineInit extends EntityPropsInit {
  from: Point2;
  to: Point2;
}
export interface CircleInit extends EntityPropsInit {
  center: Point2;
  radius: number;
  fill?: EntityFill | null;
}
export interface ArcInit extends EntityPropsInit {
  center: Point2;
  radius: number;
  startAngleDeg: number;
  endAngleDeg: number;
  counterclockwise?: boolean;
}
export interface EllipseInit extends EntityPropsInit {
  center: Point2;
  radiusX: number;
  radiusY: number;
  rotationDeg?: number;
  startAngleDeg?: number;
  endAngleDeg?: number;
  fill?: EntityFill | null;
}
export interface RectInit extends EntityPropsInit {
  x: number;
  y: number;
  width: number;
  height: number;
  cornerRadius?: number;
  fill?: EntityFill | null;
}
export interface PolylineInit extends EntityPropsInit {
  vertices: readonly (readonly number[])[];
  closed?: boolean;
  holes?: readonly (readonly (readonly number[])[])[];
  fill?: EntityFill | null;
}
export interface TextInit extends EntityPropsInit {
  position: Point2;
  value: string;
  style?: string | null;
  height?: number | null;
  rotationDeg?: number;
  anchor?: TextAnchor;
}
export interface SplineInit extends EntityPropsInit {
  controlPoints: readonly Point2[];
  degree?: number;
  /** По умолчанию — равномерный зажатый вектор (кривая проходит через первую и последнюю точки). */
  knots?: readonly number[];
}
export interface BezierInit extends EntityPropsInit {
  points: readonly Point2[];
}
