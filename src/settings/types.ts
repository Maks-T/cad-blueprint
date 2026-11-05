/** Единицы измерения модельных координат. */
export type LengthUnit = 'mm' | 'cm' | 'm' | 'inch';

/**
 * Система координат чертежа.
 * - `cartesian` — ось Y направлена вверх (как в AutoCAD / DXF);
 * - `screen` — ось Y направлена вниз (как в SVG / Canvas).
 */
export type CoordinateSystem = 'cartesian' | 'screen';

/** Масштаб «бумага : модель», например 1:50 → `{ numerator: 1, denominator: 50 }`. */
export interface DrawingScale {
  readonly numerator: number;
  readonly denominator: number;
}

/** Допустимые способы задать масштаб: строка `'1:50'` или объект. */
export type ScaleInput = string | DrawingScale;

/** Поля листа в миллиметрах на бумаге. */
export interface SheetPadding {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
}

/**
 * Допустимые способы задать поля:
 * - `10` — одинаковые со всех сторон;
 * - `[10, 20]` — `[вертикаль, горизонталь]`;
 * - `[top, right, bottom, left]` — как в CSS;
 * - объект с любым набором сторон (остальные = 0).
 */
export type PaddingInput =
  | number
  | readonly [number, number]
  | readonly [number, number, number, number]
  | Partial<SheetPadding>;

/** Полностью определённые настройки чертежа (то, что хранится в документе). */
export interface DrawingSettings {
  /** Единицы измерения модельных координат. */
  readonly units: LengthUnit;
  /** Число знаков после запятой при округлении координат (0…10). */
  readonly precision: number;
  /** Глобальный масштаб чертежа. */
  readonly scale: DrawingScale;
  /** Масштаб аннотаций (высота текста, стрелки и т.п.). */
  readonly annotationScale: DrawingScale;
  /** Система координат. */
  readonly coordinateSystem: CoordinateSystem;
  /** Поля листа, мм на бумаге. */
  readonly padding: SheetPadding;
}

/** Входные (частичные) настройки: всё необязательно, допускаются сокращённые формы. */
export interface DrawingSettingsInit {
  units?: LengthUnit;
  precision?: number;
  scale?: ScaleInput;
  /**
   * `'auto'` — совпадает с `scale`. Если не задан: в `createDrawingSettings` / `updateDrawingSettings` берётся из `base`
   * (по умолчанию 1:1), а `new CadDocument({ settings })` и `createRenderContext` подставляют `'auto'`.
   */
  annotationScale?: ScaleInput | 'auto';
  coordinateSystem?: CoordinateSystem;
  padding?: PaddingInput;
}

/** Точка `[x, y]`. */
export type Point2 = readonly [number, number];
