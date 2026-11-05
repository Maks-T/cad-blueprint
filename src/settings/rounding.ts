import { CadSettingsError } from './errors';

export const MIN_PRECISION = 0;
export const MAX_PRECISION = 10;

export function assertPrecision(value: unknown, field = 'precision'): asserts value is number {
  if (
    typeof value !== 'number' ||
    !Number.isInteger(value) ||
    value < MIN_PRECISION ||
    value > MAX_PRECISION
  ) {
    throw new CadSettingsError(
      field,
      `must be an integer in range ${MIN_PRECISION}…${MAX_PRECISION}, got ${String(value)}`,
    );
  }
}

/**
 * Округляет число до `precision` знаков (половина — от нуля).
 * Использует `toFixed`, поэтому не страдает от ошибок вида `1.005 * 100`.
 * Результат никогда не равен `-0`.
 */
export function roundTo(value: number, precision: number): number {
  if (!Number.isFinite(value)) return value;
  const rounded = Number(value.toFixed(precision));
  return rounded === 0 ? 0 : rounded;
}
