import { fromScreenPoint, toScreenPoint } from './coordinates';
import { roundTo } from './rounding';
import { scaleFactor } from './scale';
import type { DrawingSettings, Point2, SheetPadding } from './types';
import { getUnitDefinition } from './units';

/**
 * Набор готовых преобразований, привязанных к конкретным настройкам.
 * Нужен рендерерам и построителям, чтобы не пересчитывать масштаб вручную.
 *
 * Связь величин: `мм на бумаге = длина в модели × mmPerUnit × scaleFactor`.
 */
export interface DrawingMetrics {
  readonly settings: DrawingSettings;
  /** Миллиметров в одной единице модели. */
  readonly mmPerUnit: number;
  /** Коэффициент масштаба чертежа (бумага / модель). */
  readonly scaleFactor: number;
  /** Коэффициент масштаба аннотаций. */
  readonly annotationFactor: number;
  /** Округление координаты по `precision`. */
  round(value: number): number;
  roundPoint(p: Point2): [number, number];
  /** Длина в модели → мм на бумаге (с учётом `scale`). */
  modelToPaperMm(length: number): number;
  /** Мм на бумаге → длина в модели (с учётом `scale`). */
  paperMmToModel(mm: number): number;
  /**
   * Размер аннотации, заданный в мм на бумаге (например, высота текста 3.5 мм),
   * → длина в единицах модели (с учётом `annotationScale`).
   */
  annotationToModel(paperMm: number): number;
  /** Поля листа, пересчитанные в единицы модели (с учётом `scale`). */
  paddingInModelUnits(): SheetPadding;
  /** Точка чертежа → экранная (Y вниз). */
  toScreen(p: Point2): [number, number];
  /** Экранная точка → система чертежа. */
  fromScreen(p: Point2): [number, number];
}

export function createDrawingMetrics(settings: DrawingSettings): DrawingMetrics {
  const mmPerUnit = getUnitDefinition(settings.units).mmPerUnit;
  const factor = scaleFactor(settings.scale);
  const annotationFactor = scaleFactor(settings.annotationScale);

  const round = (value: number): number => roundTo(value, settings.precision);
  const paperMmToModel = (mm: number): number => mm / (mmPerUnit * factor);

  return Object.freeze({
    settings,
    mmPerUnit,
    scaleFactor: factor,
    annotationFactor,
    round,
    roundPoint: (p: Point2): [number, number] => [round(p[0]), round(p[1])],
    modelToPaperMm: (length: number): number => length * mmPerUnit * factor,
    paperMmToModel,
    annotationToModel: (paperMm: number): number => paperMm / (mmPerUnit * annotationFactor),
    paddingInModelUnits: (): SheetPadding => {
      const p = settings.padding;
      return {
        top: paperMmToModel(p.top),
        right: paperMmToModel(p.right),
        bottom: paperMmToModel(p.bottom),
        left: paperMmToModel(p.left),
      };
    },
    toScreen: (p: Point2): [number, number] => toScreenPoint(settings.coordinateSystem, p),
    fromScreen: (p: Point2): [number, number] => fromScreenPoint(settings.coordinateSystem, p),
  });
}
