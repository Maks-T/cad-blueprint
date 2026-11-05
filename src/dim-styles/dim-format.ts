import { roundTo } from '../settings';
import { CadDimStyleError } from './errors';
import type { DimStyle } from './dim-style';

/** Тип размера — от него зависят префикс, суффикс и число знаков. */
export type DimKind = 'linear' | 'radius' | 'diameter' | 'angular';

export interface DimNumberFormat {
  decimals: number;
  separator?: '.' | ',';
  trimTrailingZeros?: boolean;
}

/**
 * Число → строка: округление до `decimals` знаков (половина — от нуля), разделитель, срез нулей.
 * Результат никогда не `-0` и не `-0.0`: отрицательное число, округлённое до нуля, печатается без знака.
 */
export function formatDimensionNumber(value: number, format: DimNumberFormat): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new CadDimStyleError('value', `must be a finite number, got ${String(value)}`);
  }
  const { decimals, separator = '.', trimTrailingZeros = false } = format;
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 8) {
    throw new CadDimStyleError('decimals', `must be an integer in range 0…8, got ${String(decimals)}`);
  }
  const rounded = roundTo(value, decimals); // никогда не -0
  let text = rounded.toFixed(decimals);
  if (trimTrailingZeros && text.includes('.')) text = text.replace(/\.?0+$/, '');
  return separator === ',' ? text.replace('.', ',') : text;
}

/**
 * Текст размера по стилю:
 * - `linear`:   `prefix` + число + `suffix`   (`decimals` знаков);
 * - `radius`:   `radiusPrefix` + число + `suffix`   → `R50`;
 * - `diameter`: `diameterPrefix` + число + `suffix` → `Ø12`;
 * - `angular`:  число + `angleSuffix`  (`angleDecimals` знаков) → `45°`.
 * `value` — измеренная величина в единицах модели (для угла — градусы).
 */
export function formatDimensionText(value: number, style: DimStyle, kind: DimKind = 'linear'): string {
  const angular = kind === 'angular';
  const number = formatDimensionNumber(value, {
    decimals: angular ? style.angleDecimals : style.decimals,
    separator: style.decimalSeparator,
    trimTrailingZeros: style.trimTrailingZeros,
  });
  switch (kind) {
    case 'linear':
      return `${style.prefix}${number}${style.suffix}`;
    case 'radius':
      return `${style.radiusPrefix}${number}${style.suffix}`;
    case 'diameter':
      return `${style.diameterPrefix}${number}${style.suffix}`;
    case 'angular':
      return `${number}${style.angleSuffix}`;
    default:
      throw new CadDimStyleError('kind', `must be one of linear | radius | diameter | angular, got ${String(kind)}`);
  }
}
