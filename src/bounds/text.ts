import type { RenderContext } from '../document/context';
import type { MTextEntity, TextEntity } from '../primitives/types';
import type { Point2 } from '../settings';
import { measureTextInModel, placeText, STANDARD_TEXT_STYLE_NAME } from '../typography';
import type { TextLayout, TextStyle } from '../typography';

/** Текстовый стиль объекта: по имени, `null` — текущий; неизвестное имя — `Standard` (проблему покажет `audit()`). */
export function resolveTextStyle(ctx: RenderContext, name: string | null): TextStyle {
  if (name === null) return ctx.textStyles.current;
  return ctx.textStyles.get(name) ?? ctx.textStyles.require(STANDARD_TEXT_STYLE_NAME);
}

export interface ResolvedText {
  readonly style: TextStyle;
  readonly layout: TextLayout;
  /** Высота, мм на бумаге. */
  readonly paperHeight: number;
  /** Углы габарита в координатах чертежа (без внешней матрицы). */
  readonly corners: readonly Point2[];
}

/**
 * Раскладка и габарит текста в координатах чертежа. Поворот — визуальный; в системе `screen` локальная ось «вверх»
 * текста идёт к −Y, поэтому углы отражаются по Y относительно точки вставки.
 */
export function resolveText(entity: TextEntity | MTextEntity, ctx: RenderContext): ResolvedText {
  const style = resolveTextStyle(ctx, entity.style);
  const paperHeight = entity.height ?? style.height;
  const layout = measureTextInModel(entity.value, style, ctx.fonts, ctx.drawing, { anchor: entity.anchor, paperHeight });
  const placed = placeText(layout, { rotationDeg: entity.rotationDeg });
  const sy = ctx.drawing.settings.coordinateSystem === 'screen' ? -1 : 1;
  const [x, y] = entity.position;
  const corners = placed.corners.map((c): Point2 => [x + c[0], y + sy * c[1]]);
  return { style, layout, paperHeight, corners };
}
