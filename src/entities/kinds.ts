import { DIMENSION_TYPES } from '../dimensions/types';
import { PRIMITIVE_TYPES } from '../primitives/types';
import type { Entity, EntityType } from './types';

export const ENTITY_TYPES: readonly EntityType[] = Object.freeze([
  ...PRIMITIVE_TYPES,
  ...DIMENSION_TYPES,
  'insert',
  'viewport',
] as EntityType[]);

const PRIMITIVES = new Set<string>(PRIMITIVE_TYPES);
const DIMENSIONS = new Set<string>(DIMENSION_TYPES);
const ALL = new Set<string>(ENTITY_TYPES);

export function isEntityType(v: unknown): v is EntityType {
  return typeof v === 'string' && ALL.has(v);
}

/** Объект похож на готовый объект чертежа (создан фабрикой `buildX` / `parseEntity`). */
export function isEntity(v: unknown): v is Entity {
  return typeof v === 'object' && v !== null && isEntityType((v as { type?: unknown }).type) && Object.isFrozen(v);
}

export function isPrimitive(e: Entity): e is Extract<Entity, { type: (typeof PRIMITIVE_TYPES)[number] }> {
  return PRIMITIVES.has(e.type);
}

export function isDimension(e: Entity): e is Extract<Entity, { type: (typeof DIMENSION_TYPES)[number] }> {
  return DIMENSIONS.has(e.type);
}
