import { CadTypographyError } from './errors';
import { createFontMetrics } from './font-metrics';
import type { FontMetrics, FontMetricsInput } from './font-metrics';

/** Универсальное семейство CSS — последний элемент цепочки `font-family`. */
export type GenericFamily = 'sans-serif' | 'serif' | 'monospace';
export const GENERIC_FAMILIES: readonly GenericFamily[] = Object.freeze(['sans-serif', 'serif', 'monospace'] as const);

export type WebFontFormat = 'woff2' | 'woff' | 'truetype' | 'opentype';
export type FontStyleName = 'normal' | 'italic' | 'oblique';

/** Одно начертание шрифта для `@font-face` (SVG). */
export interface FontFace {
  /** `https://…`, `http://…`, относительный путь или `data:font/…`. */
  readonly url: string;
  /** Значение `format()`; `null` — не указывать. */
  readonly format: WebFontFormat | null;
  /** Насыщенность 100…900. */
  readonly weight: number;
  readonly style: FontStyleName;
}

export interface FontFaceInit {
  url: string;
  format?: WebFontFormat | null;
  weight?: number;
  style?: FontStyleName;
}

/** Подключение с Google Fonts (CSS API v2). */
export interface GoogleFontSource {
  /** Имя семейства в Google Fonts. */
  readonly family: string;
  /** Насыщенности (по возрастанию, без повторов). */
  readonly weights: readonly number[];
  /** Подключать ли курсивные начертания к каждой насыщенности. */
  readonly italic: boolean;
}

export interface GoogleFontInit {
  family?: string;
  weights?: readonly number[];
  italic?: boolean;
}

/** Соответствие шрифта файлам AutoCAD для записи таблицы STYLE в DXF. */
export interface DxfFontMapping {
  /** Файл SHX, например `gost.shx`. */
  readonly shx: string | null;
  /** Файл TrueType, например `arial.ttf`. */
  readonly ttf: string | null;
  /** Файл BigFont (`.shx`) для иероглифов. */
  readonly bigFont: string | null;
}

/** Шрифт реестра: неизменяемый набор свойств. */
export interface Font {
  /** Идентификатор в реестре (на него ссылаются текстовые стили). */
  readonly id: string;
  /** Имя семейства для CSS (`font-family`) и для TrueType-записи в DXF. */
  readonly family: string;
  readonly generic: GenericFamily;
  readonly faces: readonly FontFace[];
  readonly google: GoogleFontSource | null;
  readonly dxf: DxfFontMapping | null;
  /** Таблица замены (`fontFallbackMap`): запасные шрифты по порядку — id из реестра или имя системного семейства. */
  readonly fallbacks: readonly string[];
  /** Метрики для расчёта габаритов текста. */
  readonly metrics: FontMetrics;
}

export interface FontInit {
  /** По умолчанию совпадает с `id`. */
  family?: string;
  generic?: GenericFamily;
  faces?: readonly FontFaceInit[];
  /** `true` — Google Fonts с семейством `family` и насыщенностью 400. */
  google?: boolean | GoogleFontInit | null;
  dxf?: Partial<DxfFontMapping> | null;
  fallbacks?: readonly string[];
  metrics?: FontMetricsInput;
}

export type FontPatch = FontInit;
export type FontDefinition = FontInit & { id: string };

export const MAX_FONT_ID_LENGTH = 100;
export const MAX_FONT_FACES = 16;
export const MAX_FONT_FALLBACKS = 16;
const MAX_URL_LENGTH = 4000;

/** Идентификатор шрифта по умолчанию: существует всегда, нельзя удалить. */
export const DEFAULT_FONT_ID = 'sans';

/** Ключ для регистронезависимого сравнения идентификаторов. */
export function fontKey(id: string): string {
  return id.toLowerCase();
}

// Запрещены управляющие символы и всё, что позволяет «вылезти» из CSS-строки или SVG-тега.
// eslint-disable-next-line no-control-regex
const FORBIDDEN_FAMILY_CHARS = /[\u0000-\u001f\u007f"'\\<>{};`]/;
// eslint-disable-next-line no-control-regex
const FORBIDDEN_URL_CHARS = /[\s\u0000-\u001f\u007f"'()\\<>`]/;
// eslint-disable-next-line no-control-regex
const FORBIDDEN_FILE_CHARS = /[\u0000-\u001f\u007f"'\\/<>:|?*]/;

/** Идентификатор: 1…100 символов, без пробелов по краям, без управляющих символов и кавычек. */
export function assertFontId(id: unknown, field = 'id'): asserts id is string {
  if (typeof id !== 'string' || id.length === 0) {
    throw new CadTypographyError(field, 'must be a non-empty string');
  }
  if (id.length > MAX_FONT_ID_LENGTH) {
    throw new CadTypographyError(field, `must be at most ${MAX_FONT_ID_LENGTH} characters`);
  }
  if (id !== id.trim()) {
    throw new CadTypographyError(field, `must not start or end with whitespace, got "${id}"`);
  }
  if (FORBIDDEN_FAMILY_CHARS.test(id)) {
    throw new CadTypographyError(field, `contains forbidden characters (control, quotes, \\ < > { } ; \`): "${id}"`);
  }
}

/** Имя семейства CSS: те же ограничения, что и для id; нужно, чтобы значение безопасно попадало в `<style>`. */
export function assertFontFamily(family: unknown, field = 'family'): asserts family is string {
  assertFontId(family, field);
}

function assertWeight(weight: unknown, field: string): asserts weight is number {
  if (typeof weight !== 'number' || !Number.isInteger(weight) || weight < 100 || weight > 900 || weight % 100 !== 0) {
    throw new CadTypographyError(field, `must be one of 100, 200, … 900, got ${String(weight)}`);
  }
}

/** Допустимый адрес шрифта: http(s), относительный путь или `data:font/…` / `data:application/…`. */
export function assertFontUrl(url: unknown, field = 'url'): asserts url is string {
  if (typeof url !== 'string' || url.length === 0 || url.length > MAX_URL_LENGTH) {
    throw new CadTypographyError(field, `must be a non-empty string up to ${MAX_URL_LENGTH} characters`);
  }
  if (FORBIDDEN_URL_CHARS.test(url)) {
    throw new CadTypographyError(field, 'must not contain whitespace, quotes, parentheses, backslashes or < > (encode them in the URL)');
  }
  const lower = url.toLowerCase();
  const hasScheme = /^[a-z][a-z0-9+.-]*:/.test(lower);
  if (hasScheme && !/^(https?:\/\/|data:(font|application)\/)/.test(lower)) {
    throw new CadTypographyError(field, 'only http(s), relative and data:font/… URLs are allowed');
  }
}

const FORMAT_BY_EXT: Readonly<Record<string, WebFontFormat>> = Object.freeze({
  woff2: 'woff2',
  woff: 'woff',
  ttf: 'truetype',
  otf: 'opentype',
});

const WEB_FORMATS: readonly WebFontFormat[] = Object.freeze(['woff2', 'woff', 'truetype', 'opentype'] as const);
const FONT_STYLES: readonly FontStyleName[] = Object.freeze(['normal', 'italic', 'oblique'] as const);

function inferFormat(url: string): WebFontFormat | null {
  const data = /^data:[a-z-]+\/(?:x-)?(?:font-)?(woff2|woff|ttf|otf)/i.exec(url);
  if (data) return FORMAT_BY_EXT[(data[1] ?? '').toLowerCase()] ?? null;
  const path = url.split(/[?#]/)[0] ?? '';
  const ext = /\.([a-z0-9]+)$/i.exec(path)?.[1]?.toLowerCase();
  return ext === undefined ? null : (FORMAT_BY_EXT[ext] ?? null);
}

function buildFace(init: FontFaceInit, field: string): FontFace {
  if (typeof init !== 'object' || init === null) {
    throw new CadTypographyError(field, `must be an object, got ${String(init)}`);
  }
  assertFontUrl(init.url, `${field}.url`);
  const weight = init.weight ?? 400;
  assertWeight(weight, `${field}.weight`);
  const style = init.style ?? 'normal';
  if (!FONT_STYLES.includes(style)) {
    throw new CadTypographyError(`${field}.style`, `must be one of ${FONT_STYLES.join(' | ')}, got ${String(style)}`);
  }
  let format: WebFontFormat | null;
  if (init.format === undefined) format = inferFormat(init.url);
  else if (init.format === null) format = null;
  else if (WEB_FORMATS.includes(init.format)) format = init.format;
  else throw new CadTypographyError(`${field}.format`, `must be one of ${WEB_FORMATS.join(' | ')}, got ${String(init.format)}`);
  return Object.freeze({ url: init.url, format, weight, style });
}

function buildGoogle(input: boolean | GoogleFontInit | null, family: string, field: string): GoogleFontSource | null {
  if (input === null || input === false) return null;
  const init: GoogleFontInit = input === true ? {} : input;
  if (typeof init !== 'object') {
    throw new CadTypographyError(field, `must be boolean, an object or null, got ${String(input)}`);
  }
  const gFamily = init.family ?? family;
  assertFontFamily(gFamily, `${field}.family`);
  const weightsRaw = init.weights ?? [400];
  if (!Array.isArray(weightsRaw) || weightsRaw.length === 0 || weightsRaw.length > 9) {
    throw new CadTypographyError(`${field}.weights`, 'must be a non-empty array of up to 9 weights');
  }
  weightsRaw.forEach((w, i) => assertWeight(w, `${field}.weights[${i}]`));
  const weights = [...new Set(weightsRaw as readonly number[])].sort((a, b) => a - b);
  const italic = init.italic ?? false;
  if (typeof italic !== 'boolean') throw new CadTypographyError(`${field}.italic`, `must be boolean, got ${String(italic)}`);
  return Object.freeze({ family: gFamily, weights: Object.freeze(weights), italic });
}

function assertDxfFile(value: unknown, field: string, extensions: readonly string[]): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string' || value.length === 0 || value.length > 255 || FORBIDDEN_FILE_CHARS.test(value)) {
    throw new CadTypographyError(field, `must be a file name without path, got ${String(value)}`);
  }
  const lower = value.toLowerCase();
  if (!extensions.some((ext) => lower.endsWith(ext))) {
    throw new CadTypographyError(field, `must end with ${extensions.join(' | ')}, got "${value}"`);
  }
  return value;
}

function buildDxf(input: Partial<DxfFontMapping> | null, field: string): DxfFontMapping | null {
  if (input === null) return null;
  if (typeof input !== 'object') {
    throw new CadTypographyError(field, `must be an object or null, got ${String(input)}`);
  }
  const shx = assertDxfFile(input.shx, `${field}.shx`, ['.shx']);
  const ttf = assertDxfFile(input.ttf, `${field}.ttf`, ['.ttf', '.ttc', '.otf']);
  const bigFont = assertDxfFile(input.bigFont, `${field}.bigFont`, ['.shx']);
  if (shx === null && ttf === null) {
    throw new CadTypographyError(field, 'set "shx" or "ttf" (or use null for no mapping)');
  }
  return Object.freeze({ shx, ttf, bigFont });
}

function buildFallbacks(input: readonly string[], field: string): readonly string[] {
  if (!Array.isArray(input) || input.length > MAX_FONT_FALLBACKS) {
    throw new CadTypographyError(field, `must be an array of up to ${MAX_FONT_FALLBACKS} font ids or family names`);
  }
  const seen = new Set<string>();
  const out: string[] = [];
  input.forEach((item, i) => {
    assertFontId(item, `${field}[${i}]`);
    const key = fontKey(item);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(item);
    }
  });
  return Object.freeze(out);
}

/**
 * Собирает и валидирует шрифт: поля из `init` поверх `base`.
 * Если меняется `family`, а `google` не задан и в базе он был — Google-семейство не меняется (задавайте явно).
 */
export function buildFont(id: string, init: FontInit = {}, base?: Omit<Font, 'id'>): Font {
  assertFontId(id);
  if (typeof init !== 'object' || init === null || Array.isArray(init)) {
    throw new CadTypographyError(id, `font properties must be an object, got ${String(init)}`);
  }

  const family = init.family ?? base?.family ?? id;
  assertFontFamily(family, 'family');

  const generic = init.generic ?? base?.generic ?? 'sans-serif';
  if (!GENERIC_FAMILIES.includes(generic)) {
    throw new CadTypographyError('generic', `must be one of ${GENERIC_FAMILIES.join(' | ')}, got ${String(generic)}`);
  }

  let faces: readonly FontFace[];
  if (init.faces === undefined) faces = base?.faces ?? Object.freeze([]);
  else {
    if (!Array.isArray(init.faces) || init.faces.length > MAX_FONT_FACES) {
      throw new CadTypographyError('faces', `must be an array of up to ${MAX_FONT_FACES} items`);
    }
    faces = Object.freeze(init.faces.map((f, i) => buildFace(f, `faces[${i}]`)));
  }

  const google = init.google === undefined ? (base?.google ?? null) : buildGoogle(init.google, family, 'google');
  const dxf = init.dxf === undefined ? (base?.dxf ?? null) : buildDxf(init.dxf, 'dxf');
  const fallbacks = init.fallbacks === undefined ? (base?.fallbacks ?? Object.freeze([])) : buildFallbacks(init.fallbacks, 'fallbacks');
  const metrics = init.metrics === undefined ? (base?.metrics ?? createFontMetrics('sans')) : createFontMetrics(init.metrics);

  return Object.freeze({ id, family, generic, faces, google, dxf, fallbacks, metrics });
}

// ---------------------------------------------------------------------------
// CSS для SVG
// ---------------------------------------------------------------------------

/** Имя семейства в `font-family`: всегда в двойных кавычках (в имени кавычек быть не может — см. `assertFontFamily`). */
export function quoteFamily(family: string): string {
  return `"${family}"`;
}

/** Правило `@font-face` для одного начертания. */
export function buildFontFaceRule(family: string, face: FontFace): string {
  const format = face.format === null ? '' : ` format("${face.format}")`;
  return (
    `@font-face{font-family:${quoteFamily(family)};src:url("${face.url}")${format};` +
    `font-weight:${face.weight};font-style:${face.style};font-display:swap}`
  );
}

/** Кодирует имя семейства для Google Fonts: пробелы → `+`. */
function encodeGoogleFamily(family: string): string {
  return encodeURIComponent(family).replace(/%20/g, '+');
}

/** Фрагмент `family=…` для CSS API v2. */
export function buildGoogleFamilyParam(source: GoogleFontSource): string {
  const name = encodeGoogleFamily(source.family);
  if (source.italic) {
    const tuples = [0, 1].flatMap((ital) => source.weights.map((w) => `${ital},${w}`));
    return `family=${name}:ital,wght@${tuples.join(';')}`;
  }
  return `family=${name}:wght@${source.weights.join(';')}`;
}

/** URL CSS для одного или нескольких Google-шрифтов (или `null`, если список пуст). */
export function buildGoogleFontsUrl(sources: readonly GoogleFontSource[]): string | null {
  if (sources.length === 0) return null;
  return `https://fonts.googleapis.com/css2?${sources.map(buildGoogleFamilyParam).join('&')}&display=swap`;
}
