import { CadSettingsError } from './errors';
import type { DrawingScale, ScaleInput } from './types';

/** Масштабы по ГОСТ 2.302-68 (уменьшения и увеличения). Только справочник — не ограничение. */
export const GOST_SCALES: readonly string[] = Object.freeze([
  '1:1',
  '1:2', '1:2.5', '1:4', '1:5', '1:10', '1:15', '1:20', '1:25',
  '1:40', '1:50', '1:75', '1:100', '1:200', '1:400', '1:500', '1:800', '1:1000',
  '2:1', '2.5:1', '4:1', '5:1', '10:1', '20:1', '40:1', '50:1', '100:1',
]);

const SCALE_RE = /^\s*(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)\s*$/;

function assertPositiveFinite(value: unknown, field: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new CadSettingsError(field, `must be a positive finite number, got ${String(value)}`);
  }
}

/** Разбирает `'1:50'`, `'2:1'`, `'1:2.5'` или `{ numerator, denominator }`. */
export function parseScale(input: ScaleInput, field = 'scale'): DrawingScale {
  if (typeof input === 'string') {
    const match = SCALE_RE.exec(input);
    if (!match) {
      throw new CadSettingsError(field, `invalid scale "${input}", expected format "1:50"`);
    }
    const numerator = Number(match[1]);
    const denominator = Number(match[2]);
    assertPositiveFinite(numerator, field);
    assertPositiveFinite(denominator, field);
    return Object.freeze({ numerator, denominator });
  }
  if (typeof input !== 'object' || input === null) {
    throw new CadSettingsError(field, `invalid scale ${String(input)}`);
  }
  assertPositiveFinite(input.numerator, `${field}.numerator`);
  assertPositiveFinite(input.denominator, `${field}.denominator`);
  return Object.freeze({ numerator: input.numerator, denominator: input.denominator });
}

/** Коэффициент «длина на бумаге / длина в модели». Для 1:50 → 0.02, для 2:1 → 2. */
export function scaleFactor(scale: DrawingScale): number {
  return scale.numerator / scale.denominator;
}

/** `{1, 50}` → `'1:50'`. */
export function formatScale(scale: DrawingScale): string {
  return `${scale.numerator}:${scale.denominator}`;
}

export function isSameScale(a: DrawingScale, b: DrawingScale): boolean {
  return a.numerator * b.denominator === b.numerator * a.denominator;
}
