import { BlockTable } from '../blocks/block-table';
import { viewportDrawing } from '../blocks/viewport';
import type { ViewportEntity } from '../blocks/types';
import { DimStyleTable } from '../dim-styles';
import { LayerManager } from '../layers';
import { createDrawingMetrics, createDrawingSettings } from '../settings';
import type { DrawingMetrics, DrawingSettings, DrawingSettingsInit } from '../settings';
import { FontManager, TextStyleTable } from '../typography';

/**
 * Всё, что нужно рендерерам, расчёту габаритов и построению размеров: масштаб чертежа и таблицы документа.
 * Обычно берётся из `CadDocument.context()`.
 */
export interface RenderContext {
  readonly drawing: DrawingMetrics;
  readonly layers: LayerManager;
  readonly fonts: FontManager;
  readonly textStyles: TextStyleTable;
  readonly dimStyles: DimStyleTable;
  readonly blocks: BlockTable;
}

export interface RenderContextInit {
  settings?: DrawingSettings | DrawingSettingsInit;
  layers?: LayerManager;
  /** Если задан `dimStyles`, текстовые стили и шрифты берутся из него (`dimStyles.textStyles`). */
  dimStyles?: DimStyleTable;
  textStyles?: TextStyleTable;
  fonts?: FontManager;
  blocks?: BlockTable;
}

/** Контекст без документа: недостающие таблицы создаются пустыми (со встроенными `0`, `Standard`, `sans`). */
export function createRenderContext(init: RenderContextInit = {}): RenderContext {
  const settings = createDrawingSettings({ annotationScale: 'auto', ...init.settings });
  const dimStyles = init.dimStyles ?? new DimStyleTable(init.textStyles ?? new TextStyleTable(init.fonts ?? new FontManager()));
  return Object.freeze({
    drawing: createDrawingMetrics(settings),
    layers: init.layers ?? new LayerManager(),
    fonts: dimStyles.textStyles.fonts,
    textStyles: dimStyles.textStyles,
    dimStyles,
    blocks: init.blocks ?? new BlockTable(),
  });
}

/** Контекст внутри видового экрана: метрики по масштабу экрана, таблицы — те же. */
export function viewportContext(ctx: RenderContext, vp: ViewportEntity): RenderContext {
  const drawing = viewportDrawing(vp, ctx.drawing);
  return drawing === ctx.drawing ? ctx : Object.freeze({ ...ctx, drawing });
}
