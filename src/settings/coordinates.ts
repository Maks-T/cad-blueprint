import { CadSettingsError } from './errors';
import type { CoordinateSystem, Point2 } from './types';

export const COORDINATE_SYSTEMS: readonly CoordinateSystem[] = Object.freeze(['cartesian', 'screen'] as const);

export function isCoordinateSystem(value: unknown): value is CoordinateSystem {
  return value === 'cartesian' || value === 'screen';
}

export function assertCoordinateSystem(value: unknown, field = 'coordinateSystem'): asserts value is CoordinateSystem {
  if (!isCoordinateSystem(value)) {
    throw new CadSettingsError(field, `must be "cartesian" or "screen", got ${String(value)}`);
  }
}

/**
 * Переводит точку из системы чертежа в экранную (Y вниз, как в SVG).
 * Для `screen` — тождественно; для `cartesian` ось Y отражается относительно нуля
 * (сдвиг под viewBox делает рендерер по BoundingBox).
 */
export function toScreenPoint(system: CoordinateSystem, p: Point2): [number, number] {
  return system === 'cartesian' ? [p[0], p[1] === 0 ? 0 : -p[1]] : [p[0], p[1]];
}

/** Обратное преобразование: экранная точка → система чертежа. */
export function fromScreenPoint(system: CoordinateSystem, p: Point2): [number, number] {
  return toScreenPoint(system, p); // отражение оси Y — инволюция
}
