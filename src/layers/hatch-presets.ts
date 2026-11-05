import { CadLayerError } from './errors';
import { createHatchStyle } from './hatch';
import type { HatchStyle } from './hatch';

/** Готовые штриховки. Цвет линий — цвет слоя; размеры в мм на бумаге. */
export const HATCH_PRESETS = Object.freeze({
  /** Металл: 45°, частая тонкая. */
  'steel-45': createHatchStyle({ name: 'steel-45', angle: 45, spacing: 2, lineWidth: 0.18 }),
  /** Дерево / плитные материалы: 135°. */
  'board-45': createHatchStyle({ name: 'board-45', angle: 135, spacing: 3, lineWidth: 0.18 }),
  /** Обшивка: 45°, редкая. */
  'cladding-45': createHatchStyle({ name: 'cladding-45', angle: 45, spacing: 4, lineWidth: 0.13 }),
  /** Стена / кладка: 135°, средняя. */
  'wall-45': createHatchStyle({ name: 'wall-45', angle: 135, spacing: 3, lineWidth: 0.25 }),
  /** Бетон: точки в шахматном порядке вдоль линий 45° (упрощённое обозначение). */
  concrete: createHatchStyle({
    name: 'concrete',
    angle: 45,
    spacing: 2.5,
    lineWidth: 0.3,
    dash: [0.3, 2.2],
    offset: 1.25,
  }),
} satisfies Record<string, HatchStyle>);

export type HatchPresetName = keyof typeof HATCH_PRESETS;

export const HATCH_PRESET_NAMES: readonly HatchPresetName[] = Object.freeze(
  Object.keys(HATCH_PRESETS) as HatchPresetName[],
);

export function isHatchPresetName(value: unknown): value is HatchPresetName {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(HATCH_PRESETS, value);
}

export function getHatchPreset(name: string): HatchStyle {
  if (!isHatchPresetName(name)) {
    throw new CadLayerError('hatch', `unknown preset "${name}", expected one of ${HATCH_PRESET_NAMES.join(' | ')}`);
  }
  return HATCH_PRESETS[name];
}
