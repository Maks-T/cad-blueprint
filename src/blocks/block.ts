import { isEntity } from '../entities/kinds';
import type { Entity } from '../entities/types';
import { assertLayerName } from '../layers';
import { optionalString, pointOf } from '../primitives/common';
import { CadBlockError } from './errors';
import type { CadBlock, CadBlockInit } from './types';

export const MAX_BLOCK_ENTITIES = 1_000_000;

/** Имя блока: как имя слоя (1…255 символов, без `< > / \ " : ; ? * | = , \``) и не начинается с `*` (служебные блоки DXF). */
export function assertBlockName(name: unknown, field = 'name'): asserts name is string {
  try {
    assertLayerName(name, field);
  } catch (err) {
    throw new CadBlockError(field, (err as Error).message.replace(/^\[cad-blueprint\] [^:]+: /, ''));
  }
  if ((name as string).startsWith('*')) throw new CadBlockError(field, 'must not start with "*" (reserved for DXF service blocks)');
}

export function blockKey(name: string): string {
  return name.toLowerCase();
}

/** Определение блока. Объекты должны быть созданы фабриками (`line`, `buildPolyline`, `parseEntity`, …). */
export function defineBlock(name: string, entities: readonly Entity[], init: CadBlockInit = {}): CadBlock {
  assertBlockName(name);
  if (!Array.isArray(entities)) throw new CadBlockError(`${name}.entities`, 'must be an array of entities');
  if (entities.length > MAX_BLOCK_ENTITIES) throw new CadBlockError(`${name}.entities`, `at most ${MAX_BLOCK_ENTITIES} entities`);
  entities.forEach((e, i) => {
    if (!isEntity(e)) throw new CadBlockError(`${name}.entities[${i}]`, 'must be an entity created by a factory (or parseEntity)');
  });
  return Object.freeze({
    name,
    basePoint: pointOf(init.basePoint ?? [0, 0], `${name}.basePoint`),
    entities: Object.freeze([...entities]),
    description: optionalString(init.description, `${name}.description`, 1000),
  });
}

/** Имена блоков, которые вставляют объекты (включая вложенные видовые экраны), без повторов. */
export function referencedBlocks(entities: readonly Entity[]): string[] {
  const out = new Map<string, string>();
  const visit = (list: readonly Entity[]): void => {
    for (const e of list) {
      if (e.type === 'insert') {
        if (!out.has(blockKey(e.block))) out.set(blockKey(e.block), e.block);
      } else if (e.type === 'viewport') {
        visit(e.entities);
      }
    }
  };
  visit(entities);
  return [...out.values()];
}
