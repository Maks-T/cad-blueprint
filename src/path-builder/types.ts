import type { CoordinateSystem, Point2 } from '../settings';

/**
 * Вершина контура `[x, y]` или `[x, y, bulge]` — формат вершин `Polyline` из шага 2.1.2 (как в AutoCAD).
 * `bulge` относится к сегменту, который ИДЁТ ИЗ этой вершины к следующей: `tan(sweep / 4)`,
 * знак «+» — дуга против часовой стрелки в числовой плоскости (x вправо, y вверх), «−» — по часовой.
 * Для прямого сегмента третий элемент не пишется.
 */
export type PathVertex = readonly [number, number] | readonly [number, number, number];

/** Прямой сегмент. */
export interface PathLineSegment {
  readonly type: 'line';
  readonly from: Point2;
  readonly to: Point2;
  readonly length: number;
}

/**
 * Дуга окружности. Углы — в градусах в числовой плоскости (`atan2(y, x)`, как в DXF), `counterclockwise` —
 * направление обхода в той же плоскости. В системе `screen` (Y вниз) такая дуга на экране выглядит зеркально.
 */
export interface PathArcSegment {
  readonly type: 'arc';
  readonly from: Point2;
  readonly to: Point2;
  readonly center: Point2;
  readonly radius: number;
  readonly startAngleDeg: number;
  readonly endAngleDeg: number;
  readonly counterclockwise: boolean;
  /** Угол дуги, 0…360°. */
  readonly sweepDeg: number;
  readonly bulge: number;
  readonly length: number;
}

export type PathSegment = PathLineSegment | PathArcSegment;

/** Результат `CadPath.build()`: замороженный снимок контура. */
export interface PathData {
  /** Вершины контура. У замкнутого контура последняя вершина НЕ повторяет первую. */
  readonly vertices: readonly PathVertex[];
  readonly closed: boolean;
  /** Те же сегменты в явном виде (для рендереров и расчёта габаритов). */
  readonly segments: readonly PathSegment[];
  /** Суммарная длина контура (у замкнутого — периметр) в единицах модели. */
  readonly length: number;
}

/** Направление дуги так, как его видит человек на чертеже (не зависит от системы координат). */
export type ArcSweep = 'ccw' | 'cw';

/**
 * Способ задать дугу для `arcTo` / `arcBy` (ровно один из вариантов). Начало дуги — текущая точка.
 * - `{ bulge }` — как в AutoCAD, знак задаёт направление в числовой плоскости; 0 даёт прямой сегмент;
 * - `{ radius, sweep?, large? }` — по радиусу; `sweep` по умолчанию `'ccw'`, `large` — дуга больше полуокружности;
 * - `{ center, sweep? }` — по центру; радиус берётся из расстояния до начала и должен совпасть с расстоянием до конца;
 * - `{ through }` — по трём точкам (начало, промежуточная точка, конец);
 * - `{ tangent: true }` — дуга, касательная к предыдущему сегменту в текущей точке.
 * Для `arcBy` точки `center` и `through` тоже задаются относительно текущей точки.
 */
export type ArcOptions =
  | { readonly bulge: number }
  | { readonly radius: number; readonly sweep?: ArcSweep; readonly large?: boolean }
  | { readonly center: Point2; readonly sweep?: ArcSweep }
  | { readonly through: Point2 }
  | { readonly tangent: true };

export interface CadPathOptions {
  /**
   * Система координат чертежа. Влияет только на смысл `up` / `down`, угла в `polar` и направлений `'ccw'` / `'cw'`
   * («вверх» на экране — это −Y в `screen`). Числа в результате всегда в координатах чертежа. По умолчанию `cartesian`.
   */
  readonly coordinateSystem?: CoordinateSystem;
}

export interface CornerOptions {
  /**
   * Номер вершины, у которой делается сопряжение (0 — начальная точка, i — конец i-го сегмента, с нуля).
   * Номера — по исходным вершинам, они не сдвигаются после других сопряжений. По умолчанию — «последний угол»:
   * стык двух последних сегментов, а у замкнутого контура — начальная вершина.
   */
  readonly vertex?: number;
}
