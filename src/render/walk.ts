import { insertMatrix } from '../blocks/insert';
import { viewportMatrix } from '../blocks/viewport';
import type { BlockInsertEntity, CadBlock, ViewportEntity } from '../blocks/types';
import { CadBlockError } from '../blocks/errors';
import type { DimensionEntity } from '../dimensions/types';
import { viewportContext } from '../document/context';
import type { RenderContext } from '../document/context';
import { isDimension } from '../entities/kinds';
import type { Entity } from '../entities/types';
import { IDENTITY, multiply } from '../geometry/matrix';
import type { Matrix2D } from '../geometry/matrix';
import { ZERO_LAYER_NAME } from '../layers';
import type { Layer } from '../layers';
import type { PrimitiveEntity } from '../primitives/types';

export const MAX_NESTING = 32;

/** Состояние обхода: накопленная матрица, контекст (масштаб меняется внутри экранов), слой вставки для объектов на «0». */
export interface WalkState {
  readonly matrix: Matrix2D;
  readonly ctx: RenderContext;
  /** Слой ближайшей вставки блока (для объектов блока на слое «0»); `null` — вне блоков. */
  readonly inheritedLayer: string | null;
  readonly depth: number;
}

export interface WalkVisitor {
  primitive?(entity: PrimitiveEntity, layer: Layer, state: WalkState): void;
  dimension?(entity: DimensionEntity, layer: Layer, state: WalkState): void;
  /** Перед входом во вставку; `false` — не заходить. */
  insert?(entity: BlockInsertEntity, block: CadBlock, layer: Layer, state: WalkState): boolean | void;
  /** Перед входом в видовой экран; `false` — не заходить. */
  viewport?(entity: ViewportEntity, layer: Layer, state: WalkState): boolean | void;
}

export interface WalkOptions {
  /** Пропускать объекты на скрытых слоях (по умолчанию `false`). */
  visibleOnly?: boolean;
  matrix?: Matrix2D;
  inheritedLayer?: string | null;
}

/** Имя слоя, на котором фактически рисуется объект (правило «0» внутри блока). */
export function effectiveLayerName(entityLayer: string, inherited: string | null): string {
  return inherited !== null && entityLayer.toLowerCase() === ZERO_LAYER_NAME ? inherited : entityLayer;
}

/** Слой по имени; неизвестный слой рисуется свойствами слоя «0» (как AutoCAD при отсутствии слоя). */
export function resolveLayer(ctx: RenderContext, name: string): Layer {
  return ctx.layers.get(name) ?? ctx.layers.require(ZERO_LAYER_NAME);
}

/** Обходит объекты с раскрытием вставок блоков и видовых экранов. */
export function walkEntities(entities: readonly Entity[], ctx: RenderContext, visitor: WalkVisitor, options: WalkOptions = {}): void {
  const visibleOnly = options.visibleOnly ?? false;
  const visit = (list: readonly Entity[], state: WalkState, stack: string[]): void => {
    for (const e of list) {
      const layerName = effectiveLayerName(e.layer, state.inheritedLayer);
      const layer = resolveLayer(state.ctx, layerName);
      if (visibleOnly && !layer.visible) continue;
      if (e.type === 'insert') {
        const block = state.ctx.blocks.get(e.block);
        if (!block) throw new CadBlockError(e.block, 'block is not defined (inserted at ' + JSON.stringify(e.position) + ')');
        if (stack.length >= MAX_NESTING || stack.includes(block.name.toLowerCase())) {
          throw new CadBlockError(block.name, 'circular or too deep block nesting');
        }
        if (visitor.insert?.(e, block, layer, state) === false) continue;
        const m = multiply(state.matrix, insertMatrix(e, block));
        visit(block.entities, { matrix: m, ctx: state.ctx, inheritedLayer: layerName, depth: state.depth + 1 }, [...stack, block.name.toLowerCase()]);
      } else if (e.type === 'viewport') {
        if (visitor.viewport?.(e, layer, state) === false) continue;
        if (state.depth >= MAX_NESTING) throw new CadBlockError('viewport', 'too deep nesting');
        const m = multiply(state.matrix, viewportMatrix(e, state.ctx.drawing));
        visit(e.entities, { matrix: m, ctx: viewportContext(state.ctx, e), inheritedLayer: state.inheritedLayer, depth: state.depth + 1 }, stack);
      } else if (isDimension(e)) {
        visitor.dimension?.(e, layer, state);
      } else {
        visitor.primitive?.(e as PrimitiveEntity, layer, state);
      }
    }
  };
  visit(entities, { matrix: options.matrix ?? IDENTITY, ctx, inheritedLayer: options.inheritedLayer ?? null, depth: 0 }, []);
}
