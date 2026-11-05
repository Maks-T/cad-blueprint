import { isEntity } from '../entities/kinds';
import type { Entity } from '../entities/types';
import { compose, rotation, scaling, translation } from '../geometry/matrix';
import type { Matrix2D } from '../geometry/matrix';
import { assertKnownKeys, assertObject, bool, finite, freezeEntity, optionalString, parseEntityProps, pointOf } from '../primitives/common';
import { createDrawingMetrics, parseScale, scaleFactor, updateDrawingSettings } from '../settings';
import type { DrawingMetrics, DrawingScale } from '../settings';
import { CadBlockError } from './errors';
import type { ViewportEntity, ViewportInit } from './types';

const MAX_TITLE = 255;

export function buildViewport(init: ViewportInit): ViewportEntity {
  assertObject(init, 'viewport');
  assertKnownKeys(init, ['entities', 'position', 'target', 'scale', 'rotationDeg', 'title', 'clip', 'frame'], 'viewport');
  if (!Array.isArray(init.entities)) throw new CadBlockError('viewport.entities', 'must be an array of entities');
  init.entities.forEach((e, i) => {
    if (!isEntity(e)) {
      throw new CadBlockError(`viewport.entities[${i}]`, 'must be an entity created by a factory (or parseEntity)');
    }
  });
  let scale: DrawingScale | null = null;
  if (init.scale !== undefined && init.scale !== null) {
    try {
      scale = parseScale(init.scale);
    } catch (err) {
      throw new CadBlockError('viewport.scale', (err as Error).message);
    }
  }
  let clip: ViewportEntity['clip'] = null;
  if (init.clip !== undefined && init.clip !== null) {
    const c = init.clip;
    assertObject(c, 'viewport.clip');
    const minX = finite(c.minX, 'viewport.clip.minX');
    const minY = finite(c.minY, 'viewport.clip.minY');
    const maxX = finite(c.maxX, 'viewport.clip.maxX');
    const maxY = finite(c.maxY, 'viewport.clip.maxY');
    if (maxX <= minX || maxY <= minY) throw new CadBlockError('viewport.clip', 'must have maxX > minX and maxY > minY');
    clip = Object.freeze({ minX, minY, maxX, maxY });
  }
  const frame = bool(init.frame, 'viewport.frame', false);
  if (frame && clip === null) throw new CadBlockError('viewport.frame', 'needs "clip" (the frame is drawn along the clip boundary)');
  return freezeEntity({
    type: 'viewport',
    ...parseEntityProps(init, 'viewport'),
    position: pointOf(init.position ?? [0, 0], 'viewport.position'),
    target: pointOf(init.target ?? [0, 0], 'viewport.target'),
    scale,
    rotationDeg: finite(init.rotationDeg ?? 0, 'viewport.rotationDeg'),
    entities: Object.freeze([...init.entities]) as readonly Entity[],
    title: optionalString(init.title, 'viewport.title', MAX_TITLE),
    clip,
    frame,
  });
}

/** Короткая фабрика: `viewport(entities, { position: [0, -500], scale: '1:10', title: 'Узел А' })`. */
export function viewport(entities: readonly Entity[], options: Omit<ViewportInit, 'entities'> = {}): ViewportEntity {
  return buildViewport({ ...options, entities });
}

/** Коэффициент `k`: во сколько раз экран увеличивает свои единицы модели относительно родителя. */
export function viewportFactor(vp: ViewportEntity, parent: DrawingMetrics): number {
  return vp.scale === null ? 1 : scaleFactor(vp.scale) / parent.scaleFactor;
}

/** Матрица «координаты экрана → координаты родителя». */
export function viewportMatrix(vp: ViewportEntity, parent: DrawingMetrics): Matrix2D {
  const k = viewportFactor(vp, parent);
  return compose(
    translation(vp.position[0], vp.position[1]),
    rotation(vp.rotationDeg),
    scaling(k, k),
    translation(-vp.target[0], -vp.target[1]),
  );
}

/** Метрики чертежа внутри экрана: масштаб и масштаб аннотаций = масштаб экрана. */
export function viewportDrawing(vp: ViewportEntity, parent: DrawingMetrics): DrawingMetrics {
  if (vp.scale === null) return parent;
  return createDrawingMetrics(updateDrawingSettings(parent.settings, { scale: vp.scale, annotationScale: vp.scale }));
}
