export { CadLayerError } from './errors';
export { LayerManager } from './layer-manager';
export type { LayerChange, LayerChangeListener, LayerManagerJSON } from './layer-manager';
export {
  DEFAULT_LAYER_PROPS,
  MAX_LAYER_NAME_LENGTH,
  ZERO_LAYER_NAME,
  assertLayerName,
  buildLayer,
  layerKey,
} from './layer';
export type { HatchInput, Layer, LayerDefinition, LayerInit, LayerPatch } from './layer';
export { assertDxfColorIndex, hexToRgb, nearestDxfColorIndex, normalizeHexColor } from './color';
export {
  MAX_LINEWEIGHT_MM,
  STANDARD_LINEWEIGHTS_MM,
  assertLineWeight,
  snapLineWeight,
  toDxfLineWeight,
} from './lineweight';
export {
  LINE_PRESETS,
  LINE_PRESET_PATTERNS,
  getLineDashPattern,
  getLineTypeName,
  isLinePreset,
  isSameLineType,
  parseDashPattern,
  parseLineType,
  toDxfLineTypeElements,
} from './linetype';
export type { LinePreset, LineType } from './linetype';
export {
  HATCH_DEFAULTS,
  MAX_HATCH_FAMILIES,
  createHatchStyle,
  hatchKey,
  isSameHatch,
  normalizeHatchAngle,
  resolveHatchColors,
} from './hatch';
export type { HatchFamily, HatchFamilyInit, HatchStyle, HatchStyleInit } from './hatch';
export { HATCH_PRESETS, HATCH_PRESET_NAMES, getHatchPreset, isHatchPresetName } from './hatch-presets';
export type { HatchPresetName } from './hatch-presets';
