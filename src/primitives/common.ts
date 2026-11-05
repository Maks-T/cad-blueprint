import { assertLayerName, assertLineWeight, normalizeHexColor, parseLineType, ZERO_LAYER_NAME } from '../layers';
import type { Point2 } from '../settings';
import { isPoint2, point2 } from '../geometry/vec';
import { CadPrimitiveError } from './errors';
import type { EntityFill, EntityProps, EntityPropsInit } from './types';

export const MAX_ENTITY_ID_LENGTH = 128;
export const MAX_TEXT_LENGTH = 10_000;

// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

export function assertObject(init: unknown, field: string): asserts init is Record<string, unknown> {
  if (typeof init !== 'object' || init === null || Array.isArray(init)) {
    throw new CadPrimitiveError(field, `must be an object, got ${init === null ? 'null' : typeof init}`);
  }
}

export function finite(v: unknown, field: string): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) {
    throw new CadPrimitiveError(field, `must be a finite number, got ${String(v)}`);
  }
  return v === 0 ? 0 : v;
}

export function positive(v: unknown, field: string): number {
  const n = finite(v, field);
  if (n <= 0) throw new CadPrimitiveError(field, `must be > 0, got ${n}`);
  return n;
}

export function nonNegative(v: unknown, field: string): number {
  const n = finite(v, field);
  if (n < 0) throw new CadPrimitiveError(field, `must be >= 0, got ${n}`);
  return n;
}

export function bool(v: unknown, field: string, fallback: boolean): boolean {
  if (v === undefined) return fallback;
  if (typeof v !== 'boolean') throw new CadPrimitiveError(field, `must be boolean, got ${String(v)}`);
  return v;
}

export function pointOf(v: unknown, field: string): Point2 {
  if (!isPoint2(v)) throw new CadPrimitiveError(field, `must be a finite point [x, y], got ${JSON.stringify(v)}`);
  return point2(v[0], v[1]);
}

export function pointsOf(v: unknown, field: string, min: number): Point2[] {
  if (!Array.isArray(v)) throw new CadPrimitiveError(field, 'must be an array of points [x, y]');
  if (v.length < min) throw new CadPrimitiveError(field, `needs at least ${min} points, got ${v.length}`);
  return v.map((p, i) => pointOf(p, `${field}[${i}]`));
}

/** Угол в [0, 360) без шума `359.99999999999994`. */
export function angle360(v: unknown, field: string): number {
  const a = finite(v, field);
  const n = Number((((a % 360) + 360) % 360).toFixed(10)) % 360;
  return n === 0 ? 0 : n;
}

export function optionalString(v: unknown, field: string, max: number): string | null {
  if (v === undefined || v === null) return null;
  if (typeof v !== 'string') throw new CadPrimitiveError(field, `must be a string or null, got ${typeof v}`);
  if (v.length === 0 || v.length > max) throw new CadPrimitiveError(field, `must be 1…${max} characters`);
  if (CONTROL_CHARS.test(v)) throw new CadPrimitiveError(field, 'must not contain control characters');
  return v;
}

/** Текст объекта: строка до 10 000 символов; переводы строк — только если `multiline`. */
export function textValue(v: unknown, field: string, multiline: boolean): string {
  if (typeof v !== 'string') throw new CadPrimitiveError(field, `must be a string, got ${typeof v}`);
  if (v.length > MAX_TEXT_LENGTH) throw new CadPrimitiveError(field, `must be at most ${MAX_TEXT_LENGTH} characters`);
  const normalized = v.replace(/\r\n?/g, '\n');
  if (!multiline && normalized.includes('\n')) {
    throw new CadPrimitiveError(field, 'single-line text must not contain line breaks: use mtext');
  }
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u0008\u000b-\u001f\u007f]/.test(normalized)) {
    throw new CadPrimitiveError(field, 'must not contain control characters (except \\n and \\t)');
  }
  return normalized;
}

export function parseFill(v: unknown, field = 'fill'): EntityFill | null {
  if (v === undefined || v === null) return null;
  if (v === 'hatch' || v === 'solid') return v;
  if (typeof v === 'string') return normalizeHexColor(v, field);
  throw new CadPrimitiveError(field, `must be 'hatch' | 'solid' | '#rrggbb' | null, got ${String(v)}`);
}

/** Проверяет общие свойства объекта и возвращает их в нормализованном виде. */
export function parseEntityProps(init: EntityPropsInit, field = 'entity'): EntityProps {
  const layer = init.layer ?? ZERO_LAYER_NAME;
  assertLayerName(layer, `${field}.layer`);
  const lineWeight = init.lineWeight ?? null;
  if (lineWeight !== null) assertLineWeight(lineWeight, `${field}.lineWeight`);
  return {
    id: optionalString(init.id, `${field}.id`, MAX_ENTITY_ID_LENGTH),
    layer,
    color: init.color === undefined || init.color === null ? null : normalizeHexColor(init.color, `${field}.color`),
    lineWeight,
    lineType: init.lineType === undefined || init.lineType === null ? null : parseLineType(init.lineType, `${field}.lineType`),
  };
}

/** Разрешённые ключи общих свойств (для проверки неизвестных полей). */
export const ENTITY_PROP_KEYS = ['id', 'layer', 'color', 'lineWeight', 'lineType'] as const;

/** Неизвестное поле — ошибка (опечатка `raduis` не должна молча пропадать). */
export function assertKnownKeys(init: object, keys: readonly string[], field: string): void {
  for (const key of Object.keys(init)) {
    if (key === 'type') continue;
    if (!keys.includes(key) && !(ENTITY_PROP_KEYS as readonly string[]).includes(key)) {
      throw new CadPrimitiveError(`${field}.${key}`, 'unknown property');
    }
  }
}

export function freezeEntity<T extends object>(entity: T): T {
  return Object.freeze(entity);
}
