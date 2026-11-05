import { assertDxfColorIndex, nearestDxfColorIndex, normalizeHexColor } from './color';
import { CadLayerError } from './errors';
import { createHatchStyle } from './hatch';
import type { HatchStyle, HatchStyleInit } from './hatch';
import { getHatchPreset } from './hatch-presets';
import type { HatchPresetName } from './hatch-presets';
import { assertLineWeight } from './lineweight';
import { parseLineType } from './linetype';
import type { LineType } from './linetype';

/** Слой: неизменяемый набор свойств. Изменения идут через `LayerManager.update()`. */
export interface Layer {
  readonly name: string;
  /** Цвет линий `#rrggbb`. */
  readonly color: string;
  /** Индекс цвета AutoCAD (1…255) для DXF. */
  readonly dxfColorIndex: number;
  /** Толщина линии, мм на бумаге. */
  readonly lineWeight: number;
  readonly lineType: LineType;
  /** Прозрачность 0…1 (1 — непрозрачно). */
  readonly opacity: number;
  readonly visible: boolean;
  readonly locked: boolean;
  /** Штриховка / заливка слоя или `null`. */
  readonly hatch: HatchStyle | null;
}

/** Штриховка слоя: имя пресета, описание или готовый `HatchStyle`. */
export type HatchInput = HatchPresetName | HatchStyleInit | HatchStyle;

export interface LayerInit {
  color?: string;
  /** `'auto'` — подобрать ближайший ACI по `color`. */
  dxfColorIndex?: number | 'auto';
  lineWeight?: number;
  lineType?: LineType;
  opacity?: number;
  visible?: boolean;
  locked?: boolean;
  hatch?: HatchInput | null;
}

export type LayerPatch = LayerInit;
export type LayerDefinition = LayerInit & { name: string };

/** Имя «нулевого» слоя: существует всегда, нельзя удалить или переименовать (как в AutoCAD). */
export const ZERO_LAYER_NAME = '0';
export const MAX_LAYER_NAME_LENGTH = 255;

/** Свойства слоя по умолчанию. */
export const DEFAULT_LAYER_PROPS: Omit<Layer, 'name'> = Object.freeze({
  color: '#000000',
  dxfColorIndex: 7,
  lineWeight: 0.25,
  lineType: 'continuous',
  opacity: 1,
  visible: true,
  locked: false,
  hatch: null,
});

const FORBIDDEN_NAME_CHARS = /[<>/\\":;?*|=,`]/;

/** Имя слоя: 1…255 символов, без пробелов по краям и без символов `< > / \ " : ; ? * | = , \``. */
export function assertLayerName(name: unknown, field = 'name'): asserts name is string {
  if (typeof name !== 'string' || name.length === 0) {
    throw new CadLayerError(field, 'must be a non-empty string');
  }
  if (name.length > MAX_LAYER_NAME_LENGTH) {
    throw new CadLayerError(field, `must be at most ${MAX_LAYER_NAME_LENGTH} characters`);
  }
  if (name !== name.trim()) {
    throw new CadLayerError(field, `must not start or end with whitespace, got "${name}"`);
  }
  if (FORBIDDEN_NAME_CHARS.test(name)) {
    throw new CadLayerError(field, `contains forbidden characters (< > / \\ " : ; ? * | = , \`): "${name}"`);
  }
}

/** Ключ для регистронезависимого сравнения имён слоёв. */
export function layerKey(name: string): string {
  return name.toLowerCase();
}

function resolveHatch(input: HatchInput): HatchStyle {
  return typeof input === 'string' ? getHatchPreset(input) : createHatchStyle(input);
}

/**
 * Собирает и валидирует слой: поля из `init` поверх `base`.
 * Если меняется `color`, а `dxfColorIndex` не задан — индекс подбирается заново.
 */
export function buildLayer(
  name: string,
  init: LayerInit = {},
  base: Omit<Layer, 'name'> = DEFAULT_LAYER_PROPS,
): Layer {
  assertLayerName(name);
  if (typeof init !== 'object' || init === null) {
    throw new CadLayerError(name, `layer properties must be an object, got ${String(init)}`);
  }

  const color = init.color === undefined ? base.color : normalizeHexColor(init.color);

  let dxfColorIndex: number;
  if (init.dxfColorIndex === 'auto') {
    dxfColorIndex = nearestDxfColorIndex(color);
  } else if (init.dxfColorIndex !== undefined) {
    assertDxfColorIndex(init.dxfColorIndex);
    dxfColorIndex = init.dxfColorIndex;
  } else if (init.color !== undefined) {
    dxfColorIndex = nearestDxfColorIndex(color);
  } else {
    dxfColorIndex = base.dxfColorIndex;
  }

  const lineWeight = init.lineWeight ?? base.lineWeight;
  assertLineWeight(lineWeight);

  const opacity = init.opacity ?? base.opacity;
  if (typeof opacity !== 'number' || !Number.isFinite(opacity) || opacity < 0 || opacity > 1) {
    throw new CadLayerError('opacity', `must be a number in range 0…1, got ${String(opacity)}`);
  }

  const visible = init.visible ?? base.visible;
  const locked = init.locked ?? base.locked;
  if (typeof visible !== 'boolean') throw new CadLayerError('visible', `must be boolean, got ${String(visible)}`);
  if (typeof locked !== 'boolean') throw new CadLayerError('locked', `must be boolean, got ${String(locked)}`);

  const hatch = init.hatch === undefined ? base.hatch : init.hatch === null ? null : resolveHatch(init.hatch);

  return Object.freeze({
    name,
    color,
    dxfColorIndex,
    lineWeight,
    lineType: init.lineType === undefined ? base.lineType : parseLineType(init.lineType),
    opacity,
    visible,
    locked,
    hatch,
  });
}
