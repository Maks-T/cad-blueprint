export { CadDimStyleError } from './errors';
export {
  TERMINATOR_TYPES,
  getTerminatorGeometry,
  isTerminatorType,
  normalizeTerminatorType,
} from './terminator';
export type {
  TerminatorGeometry,
  TerminatorGeometryOptions,
  TerminatorShape,
  TerminatorType,
  TerminatorTypeInput,
} from './terminator';
export {
  DECIMAL_SEPARATORS,
  DEFAULT_DIM_STYLE_PROPS,
  DIM_TEXT_ORIENTATIONS,
  DIM_TEXT_POSITIONS,
  MAX_ARROW_ANGLE,
  MAX_BASELINE_SPACING_MM,
  MAX_DIM_AFFIX_LENGTH,
  MAX_DIM_DECIMALS,
  MAX_DIM_LINE_OVERSHOOT_MM,
  MAX_DIM_STYLE_NAME_LENGTH,
  MAX_EXTENSION_OFFSET_MM,
  MAX_EXTENSION_OVERSHOOT_MM,
  MAX_TERMINATOR_SIZE_MM,
  MAX_TEXT_GAP_MM,
  MIN_ARROW_ANGLE,
  MIN_BASELINE_SPACING_MM,
  MIN_TERMINATOR_SIZE_MM,
  STANDARD_DIM_STYLE_NAME,
  assertDimStyleName,
  buildDimStyle,
  dimStyleKey,
} from './dim-style';
export type {
  DecimalSeparator,
  DimStyle,
  DimStyleDefinition,
  DimStyleInit,
  DimStylePatch,
  DimTextOrientation,
  DimTextPosition,
} from './dim-style';
export { DimStyleTable } from './dim-style-table';
export type { DimStyleChange, DimStyleChangeListener, DimStyleTableJSON } from './dim-style-table';
export { formatDimensionNumber, formatDimensionText } from './dim-format';
export type { DimKind, DimNumberFormat } from './dim-format';
export { resolveDimStyleMetrics } from './dim-metrics';
export type { DimStyleMetrics } from './dim-metrics';
export { layoutDimText } from './dim-text';
export type { DimTextAlong, DimTextPlacement, LayoutDimTextOptions } from './dim-text';
export { GOST_DIM_STYLE, GOST_DIM_STYLE_NAME, registerGostDimStyle } from './gost';
