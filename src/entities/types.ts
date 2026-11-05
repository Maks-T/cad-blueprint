import type { BlockInsertEntity, ViewportEntity } from '../blocks/types';
import type { DimensionEntity } from '../dimensions/types';
import type { PrimitiveEntity } from '../primitives/types';

/** Любой объект чертежа: примитив, размер / выноска, вставка блока или видовой экран. */
export type Entity = PrimitiveEntity | DimensionEntity | BlockInsertEntity | ViewportEntity;

export type EntityType = Entity['type'];
