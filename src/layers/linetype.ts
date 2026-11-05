import { CadLayerError } from './errors';

export type LinePreset = 'continuous' | 'dashed' | 'dashdot' | 'dotted';

/** Типы линий: пресет или кастомный паттерн `[штрих, пробел, штрих, пробел, …]` (мм на бумаге). */
export type LineType = LinePreset | readonly number[];

export const LINE_PRESETS: readonly LinePreset[] = Object.freeze(['continuous', 'dashed', 'dashdot', 'dotted'] as const);

/** Паттерны пресетов в мм на бумаге (штрих, пробел, …); `continuous` — пустой. */
export const LINE_PRESET_PATTERNS: Readonly<Record<LinePreset, readonly number[]>> = Object.freeze({
  continuous: Object.freeze([] as number[]),
  dashed: Object.freeze([6, 2]),
  dashdot: Object.freeze([12, 3, 2, 3]),
  dotted: Object.freeze([1, 2]),
});

export const MAX_PATTERN_LENGTH = 12;
export const MAX_PATTERN_ELEMENT_MM = 1000;

export function isLinePreset(value: unknown): value is LinePreset {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(LINE_PRESET_PATTERNS, value);
}

/**
 * Проверяет паттерн штрихов: чётное число положительных значений (штрих, пробел, …).
 * Точка задаётся коротким штрихом. `allowEmpty` — пустой паттерн означает сплошную линию.
 */
export function parseDashPattern(input: unknown, field: string, allowEmpty = false): readonly number[] {
  if (!Array.isArray(input)) {
    throw new CadLayerError(field, `must be an array of numbers, got ${String(input)}`);
  }
  const arr = input as readonly unknown[];
  if (arr.length === 0) {
    if (allowEmpty) return Object.freeze([]);
    throw new CadLayerError(field, 'pattern must not be empty');
  }
  if (arr.length % 2 !== 0 || arr.length > MAX_PATTERN_LENGTH) {
    throw new CadLayerError(field, `must have an even number of items (2…${MAX_PATTERN_LENGTH}), got ${arr.length}`);
  }
  const out: number[] = [];
  arr.forEach((v, i) => {
    if (typeof v !== 'number' || !Number.isFinite(v) || v <= 0 || v > MAX_PATTERN_ELEMENT_MM) {
      throw new CadLayerError(`${field}[${i}]`, `must be a positive number (mm), got ${String(v)}`);
    }
    out.push(v);
  });
  return Object.freeze(out);
}

export function parseLineType(input: unknown, field = 'lineType'): LineType {
  if (typeof input === 'string') {
    if (isLinePreset(input)) return input;
    throw new CadLayerError(field, `unknown preset "${input}", expected one of ${LINE_PRESETS.join(' | ')}`);
  }
  return parseDashPattern(input, field);
}

/** Паттерн штрихов в мм на бумаге (для `stroke-dasharray`); пустой — сплошная линия. */
export function getLineDashPattern(lineType: LineType): readonly number[] {
  return typeof lineType === 'string' ? LINE_PRESET_PATTERNS[lineType] : lineType;
}

/** Стабильное имя типа линии: `CONTINUOUS` / `DASHED` / … или `CUSTOM_12_3_2_3` (для таблицы LTYPE и дедупликации). */
export function getLineTypeName(lineType: LineType): string {
  return typeof lineType === 'string'
    ? lineType.toUpperCase()
    : `CUSTOM_${lineType.map((v) => String(v).replace('.', 'P')).join('_')}`;
}

/** Элементы паттерна DXF: штрих — положительное, пробел — отрицательное число. */
export function toDxfLineTypeElements(lineType: LineType): number[] {
  return getLineDashPattern(lineType).map((v, i) => (i % 2 === 0 ? v : -v));
}

export function isSameLineType(a: LineType, b: LineType): boolean {
  const pa = getLineDashPattern(a);
  const pb = getLineDashPattern(b);
  return pa.length === pb.length && pa.every((v, i) => v === pb[i]);
}
