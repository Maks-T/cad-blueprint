import { compose, rotation, scaling, translation } from '../geometry/matrix';
import type { Matrix2D } from '../geometry/matrix';
import { assertLayerName } from '../layers';
import { assertKnownKeys, assertObject, finite, freezeEntity, parseEntityProps, pointOf } from '../primitives/common';
import type { Point2 } from '../settings';
import { CadBlockError } from './errors';
import type { BlockInsertEntity, BlockInsertInit, CadBlock } from './types';

function scaleValue(v: unknown, field: string): number {
  const n = finite(v, field);
  if (n === 0) throw new CadBlockError(field, 'must not be 0');
  return n;
}

export function buildInsert(init: BlockInsertInit): BlockInsertEntity {
  assertObject(init, 'insert');
  assertKnownKeys(init, ['block', 'position', 'scale', 'scaleX', 'scaleY', 'rotationDeg'], 'insert');
  assertLayerName(init.block, 'insert.block');
  if (init.scale !== undefined && (init.scaleX !== undefined || init.scaleY !== undefined)) {
    throw new CadBlockError('insert', 'set either "scale" or "scaleX" / "scaleY", not both');
  }
  const uniform = init.scale === undefined ? null : scaleValue(init.scale, 'insert.scale');
  return freezeEntity({
    type: 'insert',
    ...parseEntityProps(init, 'insert'),
    block: init.block,
    position: pointOf(init.position ?? [0, 0], 'insert.position'),
    scaleX: uniform ?? scaleValue(init.scaleX ?? 1, 'insert.scaleX'),
    scaleY: uniform ?? scaleValue(init.scaleY ?? 1, 'insert.scaleY'),
    rotationDeg: finite(init.rotationDeg ?? 0, 'insert.rotationDeg'),
  });
}

/** Короткая фабрика: `insert('Ступень', [0, 170], { rotationDeg: 90, scaleX: -1 })`. */
export function insert(block: string, position: Point2 = [0, 0], options: Omit<BlockInsertInit, 'block' | 'position'> = {}): BlockInsertEntity {
  return buildInsert({ ...options, block, position });
}

/** Матрица «координаты блока → координаты родителя». Поворот — в числовой плоскости (как INSERT в DXF). */
export function insertMatrix(entity: BlockInsertEntity, block: Pick<CadBlock, 'basePoint'>): Matrix2D {
  return compose(
    translation(entity.position[0], entity.position[1]),
    rotation(entity.rotationDeg),
    scaling(entity.scaleX, entity.scaleY),
    translation(-block.basePoint[0], -block.basePoint[1]),
  );
}
