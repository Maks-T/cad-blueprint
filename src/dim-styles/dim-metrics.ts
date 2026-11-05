import type { DrawingMetrics } from '../settings';
import type { DimStyle } from './dim-style';
import { getTerminatorGeometry } from './terminator';
import type { TerminatorGeometry } from './terminator';

/**
 * Длины размерного стиля в единицах модели (после пересчёта из мм на бумаге по масштабу аннотаций).
 * Всё, что нужно построителям размеров Стадии 3, чтобы не пересчитывать масштаб вручную.
 */
export interface DimStyleMetrics {
  readonly terminatorSize: number;
  readonly dimLineOvershoot: number;
  readonly baselineSpacing: number;
  readonly extensionOffset: number;
  readonly extensionOvershoot: number;
  readonly textGap: number;
  /**
   * Выход размерной линии за выносную: `dimLineOvershoot` при засечках (`tick`), иначе 0 —
   * со стрелками, точками и кружками линия заканчивается на выносной.
   */
  readonly effectiveDimLineOvershoot: number;
  /** Рисунок окончания в единицах модели (остриё в (0, 0), см. `TerminatorGeometry`). */
  readonly terminator: TerminatorGeometry;
}

export function resolveDimStyleMetrics(style: DimStyle, drawing: DrawingMetrics): DimStyleMetrics {
  const toModel = (paperMm: number): number => drawing.annotationToModel(paperMm);
  const terminatorSize = toModel(style.terminatorSize);
  const dimLineOvershoot = toModel(style.dimLineOvershoot);
  return Object.freeze({
    terminatorSize,
    dimLineOvershoot,
    baselineSpacing: toModel(style.baselineSpacing),
    extensionOffset: toModel(style.extensionOffset),
    extensionOvershoot: toModel(style.extensionOvershoot),
    textGap: toModel(style.textGap),
    effectiveDimLineOvershoot: style.terminatorType === 'tick' ? dimLineOvershoot : 0,
    terminator: getTerminatorGeometry(style.terminatorType, terminatorSize, { arrowAngle: style.arrowAngle }),
  });
}
