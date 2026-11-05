import { CadSettingsError } from './errors';
import type { LengthUnit } from './types';

export interface UnitDefinition {
  readonly id: LengthUnit;
  /** Короткая подпись для UI / размерных надписей. */
  readonly suffix: string;
  /** Сколько миллиметров в одной единице. */
  readonly mmPerUnit: number;
  /** Код `$INSUNITS` в заголовке DXF. */
  readonly dxfInsUnits: number;
}

export const UNIT_DEFINITIONS: Readonly<Record<LengthUnit, UnitDefinition>> = Object.freeze({
  mm: { id: 'mm', suffix: 'mm', mmPerUnit: 1, dxfInsUnits: 4 },
  cm: { id: 'cm', suffix: 'cm', mmPerUnit: 10, dxfInsUnits: 5 },
  m: { id: 'm', suffix: 'm', mmPerUnit: 1000, dxfInsUnits: 6 },
  inch: { id: 'inch', suffix: 'in', mmPerUnit: 25.4, dxfInsUnits: 1 },
});

export const LENGTH_UNITS: readonly LengthUnit[] = Object.freeze(['mm', 'cm', 'm', 'inch'] as const);

export function isLengthUnit(value: unknown): value is LengthUnit {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(UNIT_DEFINITIONS, value);
}

export function getUnitDefinition(unit: LengthUnit): UnitDefinition {
  const def = UNIT_DEFINITIONS[unit];
  if (!def) throw new CadSettingsError('units', `unknown unit "${String(unit)}"`);
  return def;
}

/** Переводит длину из одних единиц в другие. */
export function convertLength(value: number, from: LengthUnit, to: LengthUnit): number {
  if (from === to) return value;
  return (value * getUnitDefinition(from).mmPerUnit) / getUnitDefinition(to).mmPerUnit;
}
