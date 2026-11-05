export { CadTypographyError } from './errors';
export { FontManager } from './font-manager';
export type { FontChange, FontChangeListener, FontJSON, FontManagerJSON, ResolvedDxfFont } from './font-manager';
export {
  DEFAULT_FONT_ID,
  GENERIC_FAMILIES,
  MAX_FONT_FACES,
  MAX_FONT_FALLBACKS,
  MAX_FONT_ID_LENGTH,
  assertFontFamily,
  assertFontId,
  assertFontUrl,
  buildFont,
  buildFontFaceRule,
  buildGoogleFamilyParam,
  buildGoogleFontsUrl,
  fontKey,
  quoteFamily,
} from './font';
export type {
  DxfFontMapping,
  Font,
  FontDefinition,
  FontFace,
  FontFaceInit,
  FontInit,
  FontPatch,
  FontStyleName,
  GenericFamily,
  GoogleFontInit,
  GoogleFontSource,
  WebFontFormat,
} from './font';
export {
  FONT_METRICS_PRESETS,
  FONT_METRICS_PRESET_NAMES,
  createFontMetrics,
  getAdvance,
  getFontMetricsPresetName,
  isFontMetricsPresetName,
} from './font-metrics';
export type { FontMetrics, FontMetricsInit, FontMetricsInput, FontMetricsPresetName } from './font-metrics';
export {
  DEFAULT_TEXT_STYLE_PROPS,
  MAX_LETTER_SPACING,
  MAX_LINE_HEIGHT,
  MAX_OBLIQUE_ANGLE,
  MAX_TEXT_HEIGHT_MM,
  MAX_TEXT_STYLE_NAME_LENGTH,
  MAX_WIDTH_FACTOR,
  MIN_LETTER_SPACING,
  MIN_LINE_HEIGHT,
  MIN_TEXT_HEIGHT_MM,
  MIN_WIDTH_FACTOR,
  STANDARD_TEXT_STYLE_NAME,
  assertTextStyleName,
  baselineSlantFromOblique,
  buildTextStyle,
  obliqueFromBaselineSlant,
  textStyleKey,
} from './text-style';
export type { TextStyle, TextStyleDefinition, TextStyleInit, TextStylePatch } from './text-style';
export { TextStyleTable } from './text-style-table';
export type { TextStyleChange, TextStyleChangeListener, TextStyleTableJSON } from './text-style-table';
export {
  TEXT_ANCHORS,
  isTextAnchor,
  measureText,
  measureTextInModel,
  measureTextWidth,
  placeText,
  projectTextOnAxis,
} from './text-layout';
export type {
  AxisSpan,
  PlaceTextOptions,
  PlacedText,
  TextAnchor,
  TextBox,
  TextLayout,
  TextLayoutOptions,
  TextLineLayout,
} from './text-layout';
export {
  GOST_TEXT_STYLE_NAME,
  GOST_TYPE_B_FONT,
  GOST_TYPE_B_FONT_ID,
  GOST_TYPE_B_STYLE,
  registerGostTypeB,
} from './gost';
