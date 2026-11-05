import type { DrawingMetrics, Point2 } from '../settings';
import { CadTypographyError } from './errors';
import { getAdvance } from './font-metrics';
import type { FontMetrics } from './font-metrics';
import type { FontManager } from './font-manager';
import type { TextStyle } from './text-style';

/** Опорная точка текста: 9 позиций по вертикали (top / middle / bottom) и горизонтали (left / center / right). */
export type TextAnchor =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export const TEXT_ANCHORS: readonly TextAnchor[] = Object.freeze([
  'top-left', 'top-center', 'top-right',
  'middle-left', 'middle-center', 'middle-right',
  'bottom-left', 'bottom-center', 'bottom-right',
] as const);

export function isTextAnchor(value: unknown): value is TextAnchor {
  return typeof value === 'string' && (TEXT_ANCHORS as readonly string[]).includes(value);
}

export interface TextLayoutOptions {
  /**
   * Высота текста (прописных) в тех же единицах, в которых нужен результат.
   * По умолчанию — `style.height` как есть (мм на бумаге). Для модели используйте `measureTextInModel`.
   */
  height?: number;
  /** Опорная точка, в которую попадает позиция вставки. По умолчанию `bottom-left` (начало базовой линии). */
  anchor?: TextAnchor;
  /**
   * `false` (по умолчанию) — нижняя граница текста — базовая линия последней строки;
   * `true` — ниже неё на глубину подстрочных элементов шрифта (`FontMetrics.descent`).
   */
  includeDescenders?: boolean;
}

/** Прямоугольник `[minX, minY] – [maxX, maxY]`. */
export interface TextBox {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
}

export interface TextLineLayout {
  readonly text: string;
  /** Ширина строки (с учётом `widthFactor` и `letterSpacing`, без учёта наклона). */
  readonly width: number;
  /** X начала строки (левый край до наклона) относительно точки вставки. */
  readonly x: number;
  /** Y базовой линии относительно точки вставки (Y вверх). */
  readonly baselineY: number;
}

/**
 * Раскладка текста в локальных координатах: точка вставки — (0, 0), поворот 0, Y вверх.
 * Числа не округляются — округляйте через `DrawingMetrics.round()`.
 */
export interface TextLayout {
  readonly lines: readonly TextLineLayout[];
  /** Высота текста (прописных), по которой считалась раскладка. */
  readonly fontHeight: number;
  /** Ширина самой длинной строки (без наклона). */
  readonly width: number;
  /** Высота блока: от верха первой строки до нижней границы последней (без наклона). */
  readonly height: number;
  /** Габарит с учётом наклона символов (выступы вправо/влево у верха и низа строк). */
  readonly box: TextBox;
  readonly anchor: TextAnchor;
}

function assertFiniteHeight(height: unknown, field: string): asserts height is number {
  if (typeof height !== 'number' || !Number.isFinite(height) || height <= 0) {
    throw new CadTypographyError(field, `must be a positive finite number, got ${String(height)}`);
  }
}

/** Ширина строки без `\n`, в единицах шрифта (до масштабирования), включая число символов. */
function rawLineAdvance(line: string, metrics: FontMetrics): { advance: number; count: number } {
  let advance = 0;
  let count = 0;
  const space = getAdvance(metrics, ' ');
  for (const ch of line) {
    advance += ch === '\t' ? space * 4 : getAdvance(metrics, ch);
    count += 1;
  }
  return { advance, count };
}

/**
 * Считает габариты и положение строк текста.
 *
 * Модель расчёта:
 * - ширина символа = `advance / capHeight × height`; `widthFactor` растягивает всю строку (включая `letterSpacing`);
 * - `letterSpacing` добавляется между символами (n − 1 раз, после последнего — нет), в долях высоты;
 * - `\n` / `\r\n` — перенос строки; шаг строк = `lineHeight × height`; табуляция = 4 пробела;
 * - верх блока — верхняя граница прописных первой строки, низ — базовая линия последней
 *   (или нижняя граница подстрочных, см. `includeDescenders`);
 * - в многострочном тексте строки выравниваются внутри блока по горизонтальной части `anchor`;
 * - наклон (`obliqueAngle`) сдвигает точки строки по X на `y × tan(angle)` относительно её базовой линии.
 * Боковые поля символов (side bearings), кернинг и лигатуры не учитываются.
 */
export function measureText(
  text: string,
  style: TextStyle,
  fonts: FontManager,
  options: TextLayoutOptions = {},
): TextLayout {
  if (typeof text !== 'string') {
    throw new CadTypographyError('text', `must be a string, got ${String(text)}`);
  }
  const fontHeight = options.height ?? style.height;
  assertFiniteHeight(fontHeight, 'height');
  const anchor = options.anchor ?? 'bottom-left';
  if (!isTextAnchor(anchor)) {
    throw new CadTypographyError('anchor', `must be one of ${TEXT_ANCHORS.join(' | ')}, got ${String(anchor)}`);
  }

  const metrics = fonts.require(style.fontFamily).metrics;
  const unit = fontHeight / metrics.capHeight; // единицы шрифта → единицы чертежа
  const descent = options.includeDescenders === true ? metrics.descent * unit : 0;
  const pitch = style.lineHeight * fontHeight;

  const rawLines = text.split(/\r\n|\r|\n/);
  const widths = rawLines.map((line) => {
    const { advance, count } = rawLineAdvance(line, metrics);
    const natural = advance * unit + Math.max(0, count - 1) * style.letterSpacing * fontHeight;
    return natural * style.widthFactor;
  });
  const width = Math.max(0, ...widths);
  const height = (rawLines.length - 1) * pitch + fontHeight + descent;

  const [vertical, horizontal] = anchor.split('-') as ['top' | 'middle' | 'bottom', 'left' | 'center' | 'right'];
  const hFactor = horizontal === 'left' ? 0 : horizontal === 'center' ? 0.5 : 1;
  const blockLeft = -width * hFactor;
  const blockTop = vertical === 'top' ? 0 : vertical === 'middle' ? height / 2 : height;

  const tilt = Math.tan((style.obliqueAngle * Math.PI) / 180);
  const shiftBottom = -descent * tilt; // сдвиг по X нижней границы строки
  const shiftTop = fontHeight * tilt; // сдвиг по X верхней границы строки
  const minShift = Math.min(shiftBottom, shiftTop);
  const maxShift = Math.max(shiftBottom, shiftTop);

  let minX = Infinity;
  let maxX = -Infinity;
  const lines: TextLineLayout[] = rawLines.map((line, i) => {
    const w = widths[i] as number;
    const x = blockLeft + (width - w) * hFactor;
    minX = Math.min(minX, x + minShift);
    maxX = Math.max(maxX, x + w + maxShift);
    return Object.freeze({ text: line, width: w, x, baselineY: blockTop - fontHeight - i * pitch });
  });

  return Object.freeze({
    lines: Object.freeze(lines),
    fontHeight,
    width,
    height,
    box: Object.freeze({ minX, minY: blockTop - height, maxX, maxY: blockTop }),
    anchor,
  });
}

/** Ширина одной строки текста (то же, что `measureText(...).width`). */
export function measureTextWidth(text: string, style: TextStyle, fonts: FontManager, height?: number): number {
  return measureText(text, style, fonts, height === undefined ? {} : { height }).width;
}

/**
 * Как `measureText`, но высота пересчитывается из мм на бумаге в единицы модели по масштабу аннотаций
 * (`DrawingMetrics.annotationToModel`). `paperHeight` — высота текста, мм на бумаге (по умолчанию `style.height`).
 */
export function measureTextInModel(
  text: string,
  style: TextStyle,
  fonts: FontManager,
  drawing: DrawingMetrics,
  options: Omit<TextLayoutOptions, 'height'> & { paperHeight?: number } = {},
): TextLayout {
  const { paperHeight, ...rest } = options;
  const paper = paperHeight ?? style.height;
  assertFiniteHeight(paper, 'paperHeight');
  return measureText(text, style, fonts, { ...rest, height: drawing.annotationToModel(paper) });
}

export interface PlaceTextOptions {
  /** Точка вставки в координатах чертежа (по умолчанию 0, 0). */
  position?: Point2;
  /** Поворот, градусы против часовой стрелки в системе `cartesian` (при `screen` рендерер учитывает отражение Y). */
  rotationDeg?: number;
  /** Запас вокруг габарита со всех сторон (в единицах чертежа) — например, зазор разрыва размерной линии. */
  padding?: number;
}

/** Текст, размещённый на чертеже. */
export interface PlacedText {
  /** Углы габарита с запасом и поворотом: нижний левый, нижний правый, верхний правый, верхний левый (до поворота). */
  readonly corners: readonly [Point2, Point2, Point2, Point2];
  /** Прямоугольник, охватывающий `corners` (для `BoundingBox`). */
  readonly bounds: TextBox;
  /** Центр габарита. */
  readonly center: Point2;
  readonly position: Point2;
  readonly rotationDeg: number;
}

/** Помещает раскладку на чертёж: добавляет запас, поворачивает вокруг точки вставки и сдвигает в `position`. */
export function placeText(layout: TextLayout, options: PlaceTextOptions = {}): PlacedText {
  const position = options.position ?? [0, 0];
  const rotationDeg = options.rotationDeg ?? 0;
  const padding = options.padding ?? 0;
  if (position.length !== 2 || !position.every((v) => Number.isFinite(v))) {
    throw new CadTypographyError('position', 'must be a finite [x, y] point');
  }
  if (!Number.isFinite(rotationDeg)) throw new CadTypographyError('rotationDeg', `must be a finite number, got ${String(rotationDeg)}`);
  if (!Number.isFinite(padding) || padding < 0) throw new CadTypographyError('padding', `must be a number >= 0, got ${String(padding)}`);

  const { minX, minY, maxX, maxY } = layout.box;
  const local: Point2[] = [
    [minX - padding, minY - padding],
    [maxX + padding, minY - padding],
    [maxX + padding, maxY + padding],
    [minX - padding, maxY + padding],
  ];
  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const corners = local.map(([x, y]): Point2 => [position[0] + x * cos - y * sin, position[1] + x * sin + y * cos]) as unknown as [Point2, Point2, Point2, Point2];

  const xs = corners.map((c) => c[0]);
  const ys = corners.map((c) => c[1]);
  const bounds: TextBox = { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
  return Object.freeze({
    corners: Object.freeze(corners.map((c) => Object.freeze(c))) as unknown as PlacedText['corners'],
    bounds: Object.freeze(bounds),
    center: Object.freeze([(bounds.minX + bounds.maxX) / 2, (bounds.minY + bounds.maxY) / 2]) as unknown as Point2,
    position: Object.freeze([position[0], position[1]]) as unknown as Point2,
    rotationDeg,
  });
}

/** Отрезок на оси: расстояния вдоль направления, отсчитанные от `origin`. */
export interface AxisSpan {
  readonly start: number;
  readonly end: number;
  readonly length: number;
}

/**
 * Проекция габарита текста на прямую с углом `axisAngleDeg` — длина «разрыва» размерной линии под текстом.
 * `origin` — точка на оси, от которой отсчитываются `start` / `end` (по умолчанию — точка вставки текста).
 */
export function projectTextOnAxis(placed: PlacedText, axisAngleDeg: number, origin: Point2 = placed.position): AxisSpan {
  if (!Number.isFinite(axisAngleDeg)) {
    throw new CadTypographyError('axisAngleDeg', `must be a finite number, got ${String(axisAngleDeg)}`);
  }
  const rad = (axisAngleDeg * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  const values = placed.corners.map((c) => (c[0] - origin[0]) * dx + (c[1] - origin[1]) * dy);
  const start = Math.min(...values);
  const end = Math.max(...values);
  return Object.freeze({ start, end, length: end - start });
}
