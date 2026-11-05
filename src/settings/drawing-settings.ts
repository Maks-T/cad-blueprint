import { assertCoordinateSystem } from './coordinates';
import { CadSettingsError } from './errors';
import { normalizePadding } from './padding';
import { assertPrecision } from './rounding';
import { parseScale } from './scale';
import type { DrawingSettings, DrawingSettingsInit } from './types';
import { isLengthUnit } from './units';

/** Значения по умолчанию: миллиметры, 1:1, Y вверх, поля 10 мм. */
export const DEFAULT_DRAWING_SETTINGS: DrawingSettings = Object.freeze({
  units: 'mm',
  precision: 3,
  scale: Object.freeze({ numerator: 1, denominator: 1 }),
  annotationScale: Object.freeze({ numerator: 1, denominator: 1 }),
  coordinateSystem: 'cartesian',
  padding: Object.freeze({ top: 10, right: 10, bottom: 10, left: 10 }),
});

/**
 * Собирает полные настройки из частичных. Недостающее берётся из `base`
 * (по умолчанию — `DEFAULT_DRAWING_SETTINGS`). Всё валидируется, при ошибке
 * бросается `CadSettingsError`. Результат заморожен.
 *
 * `annotationScale`: если не задан — берётся из `base`; `'auto'` — совпадает с итоговым `scale`.
 */
export function createDrawingSettings(
  init: DrawingSettingsInit = {},
  base: DrawingSettings = DEFAULT_DRAWING_SETTINGS,
): DrawingSettings {
  const units = init.units ?? base.units;
  if (!isLengthUnit(units)) {
    throw new CadSettingsError('units', `must be one of mm | cm | m | inch, got ${String(units)}`);
  }

  const precision = init.precision ?? base.precision;
  assertPrecision(precision);

  const coordinateSystem = init.coordinateSystem ?? base.coordinateSystem;
  assertCoordinateSystem(coordinateSystem);

  const scale = init.scale === undefined ? base.scale : parseScale(init.scale, 'scale');

  const annotationScale =
    init.annotationScale === undefined
      ? base.annotationScale
      : init.annotationScale === 'auto'
        ? scale
        : parseScale(init.annotationScale, 'annotationScale');

  const padding = init.padding === undefined ? base.padding : normalizePadding(init.padding);

  return Object.freeze({ units, precision, scale, annotationScale, coordinateSystem, padding });
}

/** Возвращает новые настройки с применённым патчем (исходные не меняются). */
export function updateDrawingSettings(
  settings: DrawingSettings,
  patch: DrawingSettingsInit,
): DrawingSettings {
  return createDrawingSettings(patch, settings);
}

/**
 * Валидирует произвольные данные (например, JSON из БД) и превращает их в `DrawingSettings`.
 * Отсутствующие поля заполняются значениями по умолчанию.
 */
export function parseDrawingSettings(raw: unknown): DrawingSettings {
  if (raw === undefined || raw === null) return DEFAULT_DRAWING_SETTINGS;
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    throw new CadSettingsError('settings', 'must be an object');
  }
  return createDrawingSettings(raw as DrawingSettingsInit);
}
