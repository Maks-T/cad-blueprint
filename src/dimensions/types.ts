import type { EntityProps, EntityPropsInit } from '../primitives';
import type { Point2 } from '../settings';

/**
 * Общие свойства размеров. Оформление (цвет, толщина) по умолчанию берётся из размерного стиля,
 * а если и там `null` — из слоя. `style: null` — текущий стиль таблицы `DimStyleTable`.
 */
interface DimBase extends EntityProps {
  readonly style: string | null;
  /**
   * Текст вместо измеренного значения: `null` — значение по стилю; `'<>'` внутри строки заменяется значением
   * (как в AutoCAD): `'<> (min)'` → `'1250 (min)'`.
   */
  readonly text: string | null;
}

/**
 * Линейный размер вдоль заданного направления (`angleDeg`: 0 — горизонтальный, 90 — вертикальный, любой другой —
 * повёрнутый). Размерная линия проходит на расстоянии `offset` от точки `p1` по нормали `angleDeg + 90°`
 * (для горизонтального положительный `offset` — выше, для вертикального — левее, в числовой плоскости).
 */
export interface DimLinearEntity extends DimBase {
  readonly type: 'dim-linear';
  readonly p1: Point2;
  readonly p2: Point2;
  readonly angleDeg: number;
  readonly offset: number;
}

/** Выровненный размер: размерная линия параллельна отрезку `p1 → p2`, `offset` — по его левой нормали. */
export interface DimAlignedEntity extends DimBase {
  readonly type: 'dim-aligned';
  readonly p1: Point2;
  readonly p2: Point2;
  readonly offset: number;
}

/** Цепочка размеров на одной линии: соседние точки `points[i] → points[i + 1]`. */
export interface DimChainEntity extends DimBase {
  readonly type: 'dim-chain';
  readonly points: readonly Point2[];
  readonly angleDeg: number;
  /** Расстояние размерной линии от `points[0]` по нормали `angleDeg + 90°`. */
  readonly offset: number;
  /** Тексты отдельных звеньев (длина = `points.length − 1`), `null` — по значению. */
  readonly texts: readonly (string | null)[] | null;
}

/**
 * Размеры от общей базы («этажерка»): `base → points[i]`, каждая следующая линия дальше от объекта на шаг
 * `baselineSpacing` стиля (или `spacing`, мм на бумаге). Ближе всех — самый короткий размер.
 */
export interface DimBaselineEntity extends DimBase {
  readonly type: 'dim-baseline';
  readonly base: Point2;
  readonly points: readonly Point2[];
  readonly angleDeg: number;
  /** Расстояние первой (ближней) размерной линии от `base`; знак задаёт сторону. */
  readonly offset: number;
  /** Шаг между линиями, мм на бумаге; `null` — `baselineSpacing` стиля. */
  readonly spacing: number | null;
}

/**
 * Угловой размер: дуга радиуса `radius` с центром `center` между лучами `center → start` и `center → end`,
 * от первого луча ко второму против часовой стрелки (или по часовой при `counterclockwise: false`).
 */
export interface DimAngularEntity extends DimBase {
  readonly type: 'dim-angular';
  readonly center: Point2;
  readonly start: Point2;
  readonly end: Point2;
  readonly radius: number;
  readonly counterclockwise: boolean;
}

/** Радиус: линия из центра к дуге под углом `angleDeg`, стрелка на дуге, текст `R…`. */
export interface DimRadiusEntity extends DimBase {
  readonly type: 'dim-radius';
  readonly center: Point2;
  readonly radius: number;
  readonly angleDeg: number;
}

/** Диаметр: линия через центр под углом `angleDeg`, стрелки на обеих сторонах окружности, текст `Ø…`. */
export interface DimDiameterEntity extends DimBase {
  readonly type: 'dim-diameter';
  readonly center: Point2;
  readonly radius: number;
  readonly angleDeg: number;
}

/**
 * Выноска с полкой: ломаная `points` (первая точка — остриё стрелки на узле), горизонтальная полка от последней
 * точки и текст над полкой. Полка идёт в ту сторону, куда направлен последний участок ломаной.
 */
export interface LeaderEntity extends EntityProps {
  readonly type: 'leader';
  readonly points: readonly Point2[];
  readonly text: string;
  readonly style: string | null;
  /** Рисовать полку. */
  readonly shelf: boolean;
  /** Длина полки, мм на бумаге; `null` — по ширине текста. */
  readonly shelfLength: number | null;
}

export type DimensionEntity =
  | DimLinearEntity
  | DimAlignedEntity
  | DimChainEntity
  | DimBaselineEntity
  | DimAngularEntity
  | DimRadiusEntity
  | DimDiameterEntity
  | LeaderEntity;

export type DimensionType = DimensionEntity['type'];

export const DIMENSION_TYPES: readonly DimensionType[] = Object.freeze([
  'dim-linear',
  'dim-aligned',
  'dim-chain',
  'dim-baseline',
  'dim-angular',
  'dim-radius',
  'dim-diameter',
  'leader',
] as const);

// ---------------------------------------------------------------------------------------------------------------------

interface DimInitBase extends EntityPropsInit {
  style?: string | null;
  text?: string | null;
}

/** Положение размерной линии: `offset` (по нормали от первой точки) или точка `at`, через которую она проходит. */
export interface DimPlacementInit {
  offset?: number;
  at?: Point2;
}

export interface DimLinearInit extends DimInitBase, DimPlacementInit {
  p1: Point2;
  p2: Point2;
  /** `'horizontal'` (0°), `'vertical'` (90°) или угол в градусах. По умолчанию — по большей проекции. */
  direction?: 'horizontal' | 'vertical' | number;
}

export interface DimAlignedInit extends DimInitBase, DimPlacementInit {
  p1: Point2;
  p2: Point2;
}

export interface DimChainInit extends EntityPropsInit, DimPlacementInit {
  points: readonly Point2[];
  direction?: 'horizontal' | 'vertical' | number;
  style?: string | null;
  texts?: readonly (string | null)[] | null;
}

export interface DimBaselineInit extends EntityPropsInit, DimPlacementInit {
  base: Point2;
  points: readonly Point2[];
  direction?: 'horizontal' | 'vertical' | number;
  style?: string | null;
  spacing?: number | null;
}

export interface DimAngularInit extends DimInitBase {
  center: Point2;
  start: Point2;
  end: Point2;
  /** Радиус дуги размера; по умолчанию — расстояние до ближней из точек `start` / `end`. */
  radius?: number;
  counterclockwise?: boolean;
}

export interface DimRadiusInit extends DimInitBase {
  center: Point2;
  radius: number;
  angleDeg?: number;
}

export type DimDiameterInit = DimRadiusInit;

export interface LeaderInit extends EntityPropsInit {
  points: readonly Point2[];
  text: string;
  style?: string | null;
  shelf?: boolean;
  shelfLength?: number | null;
}
