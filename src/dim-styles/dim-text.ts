import type { DrawingMetrics } from '../settings';
import { measureTextInModel, placeText, projectTextOnAxis } from '../typography';
import type { AxisSpan, PlacedText, TextAnchor, TextLayout, TextStyleTable } from '../typography';
import { CadDimStyleError } from './errors';
import type { DimStyle, DimTextOrientation, DimTextPosition } from './dim-style';

/** Откуда отсчитывается смещение текста вдоль размерной линии. */
export interface DimTextAlong {
  /** `middle` — середина размерной линии; `end` — её конец (второе окончание). */
  readonly from: 'middle' | 'end';
  /** Смещение вдоль направления линии, единицы модели (для `end` — за конец линии). */
  readonly offset: number;
}

/**
 * Где и как поставить текст размера. Все величины — в системе размерной линии:
 * ось «вдоль» — направление линии (угол `lineAngleDeg`), ось «поперёк» — левая нормаль (`lineAngleDeg + 90°`).
 * Точка привязки текста (`anchor`) лежит на `along` / `across`; поворот текста — `rotationDeg` (в системе чертежа).
 */
export interface DimTextPlacement {
  readonly text: string;
  readonly position: DimTextPosition;
  readonly orientation: DimTextOrientation;
  /** Поворот текста, градусы против часовой (система `cartesian`). Для `aligned` всегда в (−90°, 90°] — текст не «вверх ногами». */
  readonly rotationDeg: number;
  /** `true` — текст повёрнут на 180° относительно направления линии, чтобы читаться слева направо. */
  readonly flipped: boolean;
  readonly anchor: TextAnchor;
  /** Смещение точки привязки от размерной линии по левой нормали (со знаком), единицы модели. */
  readonly across: number;
  readonly along: DimTextAlong;
  /** Зазор `textGap` в единицах модели. */
  readonly gap: number;
  /** Раскладка текста (локальные координаты, точка привязки — (0, 0), без поворота). */
  readonly layout: TextLayout;
  /** Текст с поворотом, точка привязки — (0, 0), без запаса: `bounds` и `corners` относительно точки привязки. */
  readonly placed: PlacedText;
  /**
   * Разрыв размерной линии под текстом (только `centered`): отрезок вдоль линии относительно точки привязки
   * (середины линии) с запасом `textGap` с каждой стороны. Для остальных положений — `null`.
   */
  readonly lineBreak: AxisSpan | null;
}

export interface LayoutDimTextOptions {
  /** Направление размерной линии, градусы против часовой стрелки в системе `cartesian`. */
  lineAngleDeg: number;
  /** Высота текста, мм на бумаге (по умолчанию — высота текстового стиля). */
  paperHeight?: number;
}

const EPS = 1e-9;

function normalizeDeg(angle: number): number {
  const n = ((angle % 360) + 360) % 360;
  return n >= 360 - EPS ? 0 : n;
}

/**
 * Считает размещение текста размера по стилю (`textPosition`, `textOrientation`, `textGap`, текстовый стиль).
 * `text` — уже готовая строка (см. `formatDimensionText`).
 *
 * Правила:
 * - `aligned` — текст вдоль линии; если линия идёт «влево» (угол в (90°, 270°]), текст разворачивается на 180°;
 * - `horizontal` — текст всегда горизонтален;
 * - `above` — текст над линией: его база на расстоянии `textGap` от линии, «верх» текста — сторона «над» (для горизонтального
 *   текста — сторона, обращённая вверх, а у вертикальной линии — влево; текст целиком не заходит на линию);
 * - `centered` — центр текста на середине линии, линия разрывается на длину проекции текста + `textGap` с каждой стороны;
 * - `outside` — текст на продолжении линии за её концом, на расстоянии `textGap` от него.
 */
export function layoutDimText(
  text: string,
  style: DimStyle,
  textStyles: TextStyleTable,
  drawing: DrawingMetrics,
  options: LayoutDimTextOptions,
): DimTextPlacement {
  if (typeof text !== 'string') throw new CadDimStyleError('text', `must be a string, got ${String(text)}`);
  const angle = options.lineAngleDeg;
  if (typeof angle !== 'number' || !Number.isFinite(angle)) {
    throw new CadDimStyleError('lineAngleDeg', `must be a finite number, got ${String(angle)}`);
  }
  const textStyle = textStyles.get(style.textStyle);
  if (!textStyle) {
    throw new CadDimStyleError(style.name, `text style "${style.textStyle}" is not registered in TextStyleTable`);
  }

  const gap = drawing.annotationToModel(style.textGap);
  const paper = options.paperHeight === undefined ? {} : { paperHeight: options.paperHeight };
  const measure = (anchor: TextAnchor): TextLayout =>
    measureTextInModel(text, textStyle, textStyles.fonts, drawing, { anchor, ...paper });

  const n = normalizeDeg(angle);
  const aligned = style.textOrientation === 'aligned';
  const flipped = aligned && n > 90 + EPS && n <= 270 + EPS;
  const rotationDeg = aligned ? (flipped ? n - 180 : n > 270 + EPS ? n - 360 : n) : 0;
  const rad = (angle * Math.PI) / 180;
  const direction = { x: Math.cos(rad), y: Math.sin(rad) };
  const leftNormal = { x: -direction.y, y: direction.x };

  let anchor: TextAnchor;
  let across = 0;
  let along: DimTextAlong = { from: 'middle', offset: 0 };
  let layout: TextLayout;
  let placed: PlacedText;
  let lineBreak: AxisSpan | null = null;

  switch (style.textPosition) {
    case 'above': {
      if (aligned) {
        anchor = 'bottom-center';
        layout = measure(anchor);
        placed = placeText(layout, { rotationDeg });
        across = flipped ? -gap : gap;
      } else {
        // Горизонтальный текст: сторона «вверх» (у вертикальной линии — влево); текст целиком по эту сторону.
        const side = leftNormal.y > EPS || (Math.abs(leftNormal.y) <= EPS && leftNormal.x < 0) ? 1 : -1;
        anchor = 'middle-center';
        layout = measure(anchor);
        placed = placeText(layout, { rotationDeg: 0 });
        const span = projectTextOnAxis(placed, angle + 90, [0, 0]);
        across = side === 1 ? gap - span.start : -gap - span.end;
      }
      break;
    }
    case 'centered': {
      anchor = 'middle-center';
      layout = measure(anchor);
      placed = placeText(layout, { rotationDeg });
      lineBreak = projectTextOnAxis(placeText(layout, { rotationDeg, padding: gap }), angle, [0, 0]);
      break;
    }
    case 'outside': {
      along = { from: 'end', offset: gap };
      if (aligned) {
        anchor = flipped ? 'middle-right' : 'middle-left';
      } else if (direction.x > EPS) {
        anchor = 'middle-left';
      } else if (direction.x < -EPS) {
        anchor = 'middle-right';
      } else {
        anchor = direction.y > 0 ? 'bottom-center' : 'top-center';
      }
      layout = measure(anchor);
      placed = placeText(layout, { rotationDeg });
      break;
    }
    default:
      throw new CadDimStyleError('textPosition', `must be one of above | centered | outside, got ${String(style.textPosition)}`);
  }

  return Object.freeze({
    text,
    position: style.textPosition,
    orientation: style.textOrientation,
    rotationDeg,
    flipped,
    anchor,
    across,
    along: Object.freeze(along),
    gap,
    layout,
    placed,
    lineBreak: lineBreak === null ? null : Object.freeze(lineBreak),
  });
}
