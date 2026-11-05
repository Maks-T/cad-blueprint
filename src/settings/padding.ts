import { CadSettingsError } from './errors';
import type { PaddingInput, SheetPadding } from './types';

function side(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new CadSettingsError(field, `must be a non-negative finite number, got ${String(value)}`);
  }
  return value;
}

/** Приводит любую допустимую форму полей к `{ top, right, bottom, left }` (мм на бумаге). */
export function normalizePadding(input: PaddingInput, field = 'padding'): SheetPadding {
  if (typeof input === 'number') {
    const v = side(input, field);
    return Object.freeze({ top: v, right: v, bottom: v, left: v });
  }
  if (Array.isArray(input)) {
    const arr = input as readonly unknown[];
    if (arr.length === 2) {
      const vertical = side(arr[0], `${field}[0]`);
      const horizontal = side(arr[1], `${field}[1]`);
      return Object.freeze({ top: vertical, right: horizontal, bottom: vertical, left: horizontal });
    }
    if (arr.length === 4) {
      return Object.freeze({
        top: side(arr[0], `${field}[0]`),
        right: side(arr[1], `${field}[1]`),
        bottom: side(arr[2], `${field}[2]`),
        left: side(arr[3], `${field}[3]`),
      });
    }
    throw new CadSettingsError(field, `array form must have 2 or 4 items, got ${arr.length}`);
  }
  if (typeof input !== 'object' || input === null) {
    throw new CadSettingsError(field, `invalid value ${String(input)}`);
  }
  const obj = input as Partial<SheetPadding>;
  return Object.freeze({
    top: side(obj.top ?? 0, `${field}.top`),
    right: side(obj.right ?? 0, `${field}.right`),
    bottom: side(obj.bottom ?? 0, `${field}.bottom`),
    left: side(obj.left ?? 0, `${field}.left`),
  });
}
