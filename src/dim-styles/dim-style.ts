import { normalizeHexColor } from '../layers/color';
import { MAX_LINEWEIGHT_MM } from '../layers/lineweight';
import { CadError } from '../errors';
import { CadDimStyleError } from './errors';
import { normalizeTerminatorType } from './terminator';
import type { TerminatorType, TerminatorTypeInput } from './terminator';

/** Положение текста размера относительно размерной линии. */
export type DimTextPosition = 'above' | 'centered' | 'outside';
/** Ориентация текста размера. */
export type DimTextOrientation = 'aligned' | 'horizontal';
/** Десятичный разделитель в тексте размера. */
export type DecimalSeparator = '.' | ',';

export const DIM_TEXT_POSITIONS: readonly DimTextPosition[] = Object.freeze(['above', 'centered', 'outside'] as const);
export const DIM_TEXT_ORIENTATIONS: readonly DimTextOrientation[] = Object.freeze(['aligned', 'horizontal'] as const);
export const DECIMAL_SEPARATORS: readonly DecimalSeparator[] = Object.freeze(['.', ','] as const);

/**
 * Размерный стиль (аналог DIMSTYLE в AutoCAD): неизменяемый набор свойств.
 * Изменения идут через `DimStyleTable.update()`.
 *
 * Все длины — **мм на бумаге** (как высота текста и толщины линий): в единицы модели они переводятся
 * через `DrawingMetrics.annotationToModel()` (см. `resolveDimStyleMetrics`).
 */
export interface DimStyle {
  readonly name: string;

  // ── Окончания размерной линии ──────────────────────────────────────────────
  readonly terminatorType: TerminatorType;
  /** Длина стрелки / длина засечки / диаметр точки и кружка, мм. */
  readonly terminatorSize: number;
  /** Полный угол при вершине стрелки, градусы (для `arrow-closed` / `arrow-open`). */
  readonly arrowAngle: number;
  /** Выход размерной линии за выносные линии при окончании `tick`, мм (ГОСТ 2.307: 1…3 мм). */
  readonly dimLineOvershoot: number;
  /** Расстояние между параллельными размерными линиями в цепочках и «этажерке» (`DimStack`), мм. */
  readonly baselineSpacing: number;

  // ── Выносные линии ─────────────────────────────────────────────────────────
  /** Зазор между объектом и началом выносной линии, мм. */
  readonly extensionOffset: number;
  /** Выпуск выносной линии за размерную, мм. */
  readonly extensionOvershoot: number;
  readonly hideFirstExtensionLine: boolean;
  readonly hideSecondExtensionLine: boolean;

  // ── Текст размера ──────────────────────────────────────────────────────────
  /** Имя текстового стиля из `TextStyleTable`. */
  readonly textStyle: string;
  readonly textPosition: DimTextPosition;
  readonly textOrientation: DimTextOrientation;
  /** Зазор между текстом и размерной линией (и «поля» разрыва линии при `centered`), мм. */
  readonly textGap: number;
  /** Префикс линейных размеров (`DimLinear`, `DimAligned`, цепочки). */
  readonly prefix: string;
  /** Суффикс линейных, радиусных и диаметральных размеров (например `мм`). */
  readonly suffix: string;
  /** Префикс радиуса (`R`). */
  readonly radiusPrefix: string;
  /** Префикс диаметра (`Ø`). */
  readonly diameterPrefix: string;
  /** Суффикс углового размера (`°`). */
  readonly angleSuffix: string;
  /** Знаков после запятой в линейных размерах, 0…8. */
  readonly decimals: number;
  /** Знаков после запятой в угловых размерах, 0…8. */
  readonly angleDecimals: number;
  readonly decimalSeparator: DecimalSeparator;
  /** Убирать незначащие нули в дробной части (`12.50` → `12.5`, `45.0` → `45`). */
  readonly trimTrailingZeros: boolean;

  // ── Оформление ─────────────────────────────────────────────────────────────
  /** Цвет размерных и выносных линий, окончаний (`#rrggbb`) или `null` — как у слоя, на котором лежит размер. */
  readonly lineColor: string | null;
  /** Толщина размерных и выносных линий, мм на бумаге, или `null` — как у слоя. */
  readonly lineWeight: number | null;
  /** Цвет текста (`#rrggbb`) или `null` — как у слоя. */
  readonly textColor: string | null;
}

export interface DimStyleInit {
  terminatorType?: TerminatorTypeInput;
  terminatorSize?: number;
  arrowAngle?: number;
  dimLineOvershoot?: number;
  baselineSpacing?: number;
  extensionOffset?: number;
  extensionOvershoot?: number;
  hideFirstExtensionLine?: boolean;
  hideSecondExtensionLine?: boolean;
  textStyle?: string;
  textPosition?: DimTextPosition;
  textOrientation?: DimTextOrientation;
  textGap?: number;
  prefix?: string;
  suffix?: string;
  radiusPrefix?: string;
  diameterPrefix?: string;
  angleSuffix?: string;
  decimals?: number;
  angleDecimals?: number;
  decimalSeparator?: DecimalSeparator;
  trimTrailingZeros?: boolean;
  lineColor?: string | null;
  lineWeight?: number | null;
  textColor?: string | null;
}

export type DimStylePatch = DimStyleInit;
export type DimStyleDefinition = DimStyleInit & { name: string };

/** Имя стиля, который есть всегда; нельзя удалить или переименовать (как `Standard` в AutoCAD). */
export const STANDARD_DIM_STYLE_NAME = 'Standard';
export const MAX_DIM_STYLE_NAME_LENGTH = 255;
export const MAX_DIM_AFFIX_LENGTH = 32;

export const MIN_TERMINATOR_SIZE_MM = 0.1;
export const MAX_TERMINATOR_SIZE_MM = 50;
export const MIN_ARROW_ANGLE = 5;
export const MAX_ARROW_ANGLE = 90;
export const MAX_DIM_LINE_OVERSHOOT_MM = 20;
export const MIN_BASELINE_SPACING_MM = 0.1;
export const MAX_BASELINE_SPACING_MM = 200;
export const MAX_EXTENSION_OFFSET_MM = 50;
export const MAX_EXTENSION_OVERSHOOT_MM = 50;
export const MAX_TEXT_GAP_MM = 20;
export const MAX_DIM_DECIMALS = 8;

/**
 * Свойства по умолчанию (универсальный стиль «как в AutoCAD, но в миллиметрах»): закрытая стрелка 3 мм / 20°,
 * текст над линией вдоль неё, целые числа без префиксов и суффиксов.
 */
export const DEFAULT_DIM_STYLE_PROPS: Omit<DimStyle, 'name'> = Object.freeze({
  terminatorType: 'arrow-closed',
  terminatorSize: 3,
  arrowAngle: 20,
  dimLineOvershoot: 0,
  baselineSpacing: 7,
  extensionOffset: 0,
  extensionOvershoot: 2,
  hideFirstExtensionLine: false,
  hideSecondExtensionLine: false,
  textStyle: 'Standard',
  textPosition: 'above',
  textOrientation: 'aligned',
  textGap: 1,
  prefix: '',
  suffix: '',
  radiusPrefix: 'R',
  diameterPrefix: 'Ø',
  angleSuffix: '°',
  decimals: 0,
  angleDecimals: 1,
  decimalSeparator: '.',
  trimTrailingZeros: true,
  lineColor: null,
  lineWeight: null,
  textColor: null,
});

const KNOWN_KEYS: ReadonlySet<string> = new Set(Object.keys(DEFAULT_DIM_STYLE_PROPS));

// eslint-disable-next-line no-control-regex
const FORBIDDEN_NAME_CHARS = /[\u0000-\u001f\u007f<>/\\":;?*|=,`]/;
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

/** Имя стиля: 1…255 символов, без пробелов по краям и без символов `< > / \ " : ; ? * | = , \``. */
export function assertDimStyleName(name: unknown, field = 'name'): asserts name is string {
  if (typeof name !== 'string' || name.length === 0) {
    throw new CadDimStyleError(field, 'must be a non-empty string');
  }
  if (name.length > MAX_DIM_STYLE_NAME_LENGTH) {
    throw new CadDimStyleError(field, `must be at most ${MAX_DIM_STYLE_NAME_LENGTH} characters`);
  }
  if (name !== name.trim()) {
    throw new CadDimStyleError(field, `must not start or end with whitespace, got "${name}"`);
  }
  if (FORBIDDEN_NAME_CHARS.test(name)) {
    throw new CadDimStyleError(field, `contains forbidden characters (control, < > / \\ " : ; ? * | = , \`): "${name}"`);
  }
}

/** Ключ для регистронезависимого сравнения имён стилей. */
export function dimStyleKey(name: string): string {
  return name.toLowerCase();
}

function inRange(value: unknown, field: string, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    throw new CadDimStyleError(field, `must be a number in range ${min}…${max}, got ${String(value)}`);
  }
  return value;
}

function intInRange(value: unknown, field: string, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
    throw new CadDimStyleError(field, `must be an integer in range ${min}…${max}, got ${String(value)}`);
  }
  return value;
}

function oneOf<T extends string>(value: unknown, field: string, allowed: readonly T[]): T {
  if (typeof value !== 'string' || !(allowed as readonly string[]).includes(value)) {
    throw new CadDimStyleError(field, `must be one of ${allowed.join(' | ')}, got ${String(value)}`);
  }
  return value as T;
}

function bool(value: unknown, field: string): boolean {
  if (typeof value !== 'boolean') throw new CadDimStyleError(field, `must be a boolean, got ${String(value)}`);
  return value;
}

/** Префикс / суффикс: строка до 32 символов без управляющих символов (может быть пустой). */
function affix(value: unknown, field: string): string {
  if (typeof value !== 'string') throw new CadDimStyleError(field, `must be a string, got ${String(value)}`);
  if (value.length > MAX_DIM_AFFIX_LENGTH) {
    throw new CadDimStyleError(field, `must be at most ${MAX_DIM_AFFIX_LENGTH} characters`);
  }
  if (CONTROL_CHARS.test(value)) throw new CadDimStyleError(field, 'must not contain control characters');
  return value;
}

function hexOrNull(value: unknown, field: string): string | null {
  if (value === null) return null;
  try {
    return normalizeHexColor(value, field);
  } catch (error) {
    if (error instanceof CadError) throw new CadDimStyleError(field, `must be null or a hex color like "#rrggbb", got ${String(value)}`);
    throw error;
  }
}

/** Имя текстового стиля: те же правила, что и у имён размерных стилей. */
function textStyleRef(value: unknown): string {
  assertDimStyleName(value, 'textStyle');
  return value;
}

/**
 * Собирает и валидирует стиль: поля из `init` поверх `base`.
 * Неизвестные поля — ошибка (так ловятся опечатки вроде `terminatorTyp`).
 * Существование текстового стиля `textStyle` проверяет `DimStyleTable`, а не эта функция.
 */
export function buildDimStyle(
  name: string,
  init: DimStyleInit = {},
  base: Omit<DimStyle, 'name'> = DEFAULT_DIM_STYLE_PROPS,
): DimStyle {
  assertDimStyleName(name);
  if (typeof init !== 'object' || init === null || Array.isArray(init)) {
    throw new CadDimStyleError(name, `style properties must be an object, got ${String(init)}`);
  }
  for (const key of Object.keys(init)) {
    if (!KNOWN_KEYS.has(key)) throw new CadDimStyleError(key, 'unknown dimension style property');
  }
  // `undefined` в patch означает «не менять» (удобно для необязательных полей).
  const pick = <K extends keyof Omit<DimStyle, 'name'>>(key: K): unknown =>
    (init as Record<string, unknown>)[key] === undefined ? base[key] : (init as Record<string, unknown>)[key];

  const lineWeightRaw = pick('lineWeight');

  return Object.freeze({
    name,
    terminatorType: normalizeTerminatorType(pick('terminatorType')),
    terminatorSize: inRange(pick('terminatorSize'), 'terminatorSize', MIN_TERMINATOR_SIZE_MM, MAX_TERMINATOR_SIZE_MM),
    arrowAngle: inRange(pick('arrowAngle'), 'arrowAngle', MIN_ARROW_ANGLE, MAX_ARROW_ANGLE),
    dimLineOvershoot: inRange(pick('dimLineOvershoot'), 'dimLineOvershoot', 0, MAX_DIM_LINE_OVERSHOOT_MM),
    baselineSpacing: inRange(pick('baselineSpacing'), 'baselineSpacing', MIN_BASELINE_SPACING_MM, MAX_BASELINE_SPACING_MM),
    extensionOffset: inRange(pick('extensionOffset'), 'extensionOffset', 0, MAX_EXTENSION_OFFSET_MM),
    extensionOvershoot: inRange(pick('extensionOvershoot'), 'extensionOvershoot', 0, MAX_EXTENSION_OVERSHOOT_MM),
    hideFirstExtensionLine: bool(pick('hideFirstExtensionLine'), 'hideFirstExtensionLine'),
    hideSecondExtensionLine: bool(pick('hideSecondExtensionLine'), 'hideSecondExtensionLine'),
    textStyle: textStyleRef(pick('textStyle')),
    textPosition: oneOf(pick('textPosition'), 'textPosition', DIM_TEXT_POSITIONS),
    textOrientation: oneOf(pick('textOrientation'), 'textOrientation', DIM_TEXT_ORIENTATIONS),
    textGap: inRange(pick('textGap'), 'textGap', 0, MAX_TEXT_GAP_MM),
    prefix: affix(pick('prefix'), 'prefix'),
    suffix: affix(pick('suffix'), 'suffix'),
    radiusPrefix: affix(pick('radiusPrefix'), 'radiusPrefix'),
    diameterPrefix: affix(pick('diameterPrefix'), 'diameterPrefix'),
    angleSuffix: affix(pick('angleSuffix'), 'angleSuffix'),
    decimals: intInRange(pick('decimals'), 'decimals', 0, MAX_DIM_DECIMALS),
    angleDecimals: intInRange(pick('angleDecimals'), 'angleDecimals', 0, MAX_DIM_DECIMALS),
    decimalSeparator: oneOf(pick('decimalSeparator'), 'decimalSeparator', DECIMAL_SEPARATORS),
    trimTrailingZeros: bool(pick('trimTrailingZeros'), 'trimTrailingZeros'),
    lineColor: hexOrNull(pick('lineColor'), 'lineColor'),
    lineWeight: lineWeightRaw === null ? null : inRange(lineWeightRaw, 'lineWeight', 0, MAX_LINEWEIGHT_MM),
    textColor: hexOrNull(pick('textColor'), 'textColor'),
  });
}
