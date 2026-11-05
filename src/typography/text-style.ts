import { CadTypographyError } from './errors';
import { assertFontId, DEFAULT_FONT_ID } from './font';
import type { FontManager } from './font-manager';

/**
 * Текстовый стиль (аналог STYLE в AutoCAD): неизменяемый набор свойств.
 * Изменения идут через `TextStyleTable.update()`.
 */
export interface TextStyle {
  readonly name: string;
  /** Идентификатор шрифта в `FontManager` (то есть имя семейства, как его видит пользователь библиотеки). */
  readonly fontFamily: string;
  /**
   * Высота текста по умолчанию, мм на бумаге. Это высота ПРОПИСНЫХ букв (как в AutoCAD и ГОСТ: h = 3.5; 5; 7 …).
   * В единицы модели переводится через `DrawingMetrics.annotationToModel()`.
   */
  readonly height: number;
  /** Дополнительный межсимвольный интервал в долях высоты текста (0 — как в шрифте). */
  readonly letterSpacing: number;
  /** Шаг строк в долях высоты текста (расстояние между базовыми линиями соседних строк). */
  readonly lineHeight: number;
  /**
   * Наклон символов в градусах ОТ ВЕРТИКАЛИ, положительный — вправо (как `obliqueAngle` в AutoCAD и код 51 в DXF).
   * 0 — прямой текст. Чертёжный шрифт ГОСТ тип Б наклонён на 75° к основанию строки, то есть `obliqueAngle = 15`
   * (см. `obliqueFromBaselineSlant`).
   */
  readonly obliqueAngle: number;
  /** Коэффициент ширины: растягивает текст по горизонтали (1 — как в шрифте). Применяется и к межсимвольному интервалу. */
  readonly widthFactor: number;
}

export interface TextStyleInit {
  fontFamily?: string;
  height?: number;
  letterSpacing?: number;
  lineHeight?: number;
  obliqueAngle?: number;
  widthFactor?: number;
}

export type TextStylePatch = TextStyleInit;
export type TextStyleDefinition = TextStyleInit & { name: string };

/** Имя стиля, который есть всегда; нельзя удалить или переименовать (как `Standard` в AutoCAD). */
export const STANDARD_TEXT_STYLE_NAME = 'Standard';
export const MAX_TEXT_STYLE_NAME_LENGTH = 255;

export const MIN_TEXT_HEIGHT_MM = 0.1;
export const MAX_TEXT_HEIGHT_MM = 1000;
export const MAX_OBLIQUE_ANGLE = 85;
export const MIN_WIDTH_FACTOR = 0.01;
export const MAX_WIDTH_FACTOR = 100;
export const MIN_LETTER_SPACING = -0.5;
export const MAX_LETTER_SPACING = 5;
export const MIN_LINE_HEIGHT = 0.5;
export const MAX_LINE_HEIGHT = 10;

/** Свойства стиля по умолчанию: гротеск `sans`, 3.5 мм, прямой, шаг строк 1.5. */
export const DEFAULT_TEXT_STYLE_PROPS: Omit<TextStyle, 'name'> = Object.freeze({
  fontFamily: DEFAULT_FONT_ID,
  height: 3.5,
  letterSpacing: 0,
  lineHeight: 1.5,
  obliqueAngle: 0,
  widthFactor: 1,
});

// eslint-disable-next-line no-control-regex
const FORBIDDEN_NAME_CHARS = /[\u0000-\u001f\u007f<>/\\":;?*|=,`]/;

/** Имя стиля: 1…255 символов, без пробелов по краям и без символов `< > / \ " : ; ? * | = , \``. */
export function assertTextStyleName(name: unknown, field = 'name'): asserts name is string {
  if (typeof name !== 'string' || name.length === 0) {
    throw new CadTypographyError(field, 'must be a non-empty string');
  }
  if (name.length > MAX_TEXT_STYLE_NAME_LENGTH) {
    throw new CadTypographyError(field, `must be at most ${MAX_TEXT_STYLE_NAME_LENGTH} characters`);
  }
  if (name !== name.trim()) {
    throw new CadTypographyError(field, `must not start or end with whitespace, got "${name}"`);
  }
  if (FORBIDDEN_NAME_CHARS.test(name)) {
    throw new CadTypographyError(field, `contains forbidden characters (control, < > / \\ " : ; ? * | = , \`): "${name}"`);
  }
}

/** Ключ для регистронезависимого сравнения имён стилей. */
export function textStyleKey(name: string): string {
  return name.toLowerCase();
}

function inRange(value: unknown, field: string, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    throw new CadTypographyError(field, `must be a number in range ${min}…${max}, got ${String(value)}`);
  }
  return value;
}

/** Наклон «от основания строки» (как пишет ГОСТ: 75°) → `obliqueAngle` «от вертикали» (15°). */
export function obliqueFromBaselineSlant(slantFromBaselineDeg: number): number {
  inRange(slantFromBaselineDeg, 'slantFromBaselineDeg', 90 - MAX_OBLIQUE_ANGLE, 90 + MAX_OBLIQUE_ANGLE);
  return 90 - slantFromBaselineDeg;
}

/** `obliqueAngle` (от вертикали) → наклон к основанию строки: 15° → 75°. */
export function baselineSlantFromOblique(obliqueAngle: number): number {
  inRange(obliqueAngle, 'obliqueAngle', -MAX_OBLIQUE_ANGLE, MAX_OBLIQUE_ANGLE);
  return 90 - obliqueAngle;
}

/**
 * Собирает и валидирует стиль: поля из `init` поверх `base`.
 * Если передан `fonts`, шрифт `fontFamily` должен существовать в реестре.
 */
export function buildTextStyle(
  name: string,
  init: TextStyleInit = {},
  base: Omit<TextStyle, 'name'> = DEFAULT_TEXT_STYLE_PROPS,
  fonts?: FontManager,
): TextStyle {
  assertTextStyleName(name);
  if (typeof init !== 'object' || init === null || Array.isArray(init)) {
    throw new CadTypographyError(name, `style properties must be an object, got ${String(init)}`);
  }

  const fontFamily = init.fontFamily ?? base.fontFamily;
  assertFontId(fontFamily, 'fontFamily');
  if (fonts && !fonts.has(fontFamily)) {
    throw new CadTypographyError('fontFamily', `font "${fontFamily}" is not registered in FontManager`);
  }

  return Object.freeze({
    name,
    fontFamily,
    height: inRange(init.height ?? base.height, 'height', MIN_TEXT_HEIGHT_MM, MAX_TEXT_HEIGHT_MM),
    letterSpacing: inRange(init.letterSpacing ?? base.letterSpacing, 'letterSpacing', MIN_LETTER_SPACING, MAX_LETTER_SPACING),
    lineHeight: inRange(init.lineHeight ?? base.lineHeight, 'lineHeight', MIN_LINE_HEIGHT, MAX_LINE_HEIGHT),
    obliqueAngle: inRange(init.obliqueAngle ?? base.obliqueAngle, 'obliqueAngle', -MAX_OBLIQUE_ANGLE, MAX_OBLIQUE_ANGLE),
    widthFactor: inRange(init.widthFactor ?? base.widthFactor, 'widthFactor', MIN_WIDTH_FACTOR, MAX_WIDTH_FACTOR),
  });
}
