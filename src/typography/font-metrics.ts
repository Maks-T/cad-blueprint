import { CadTypographyError } from './errors';

/**
 * Метрики шрифта для расчёта габаритов текста без DOM и без файлов шрифтов.
 * Все значения — в «единицах шрифта» (`unitsPerEm` на 1 em), как в таблицах AFM / OpenType.
 */
export interface FontMetrics {
  /** Число единиц на 1 em (обычно 1000 или 2048). */
  readonly unitsPerEm: number;
  /** Высота прописных букв. Именно она соответствует «высоте текста» (`TextStyle.height`), как в AutoCAD и ГОСТ. */
  readonly capHeight: number;
  /** Высота строчных букв без выносных элементов. */
  readonly xHeight: number;
  /** Глубина подстрочных элементов ниже базовой линии (положительное число). */
  readonly descent: number;
  /** Ширина (advance) символа, которого нет в `advances`. */
  readonly defaultAdvance: number;
  /** Ширина символов: ключ — один символ (кодовая точка), значение — advance в единицах шрифта. */
  readonly advances: Readonly<Record<string, number>>;
}

export interface FontMetricsInit {
  /** Взять за основу готовый набор метрик; остальные поля его переопределяют. */
  base?: FontMetricsPresetName;
  unitsPerEm?: number;
  capHeight?: number;
  xHeight?: number;
  descent?: number;
  defaultAdvance?: number;
  /** Ширины символов; поверх `base.advances`. */
  advances?: Readonly<Record<string, number>>;
}

export type FontMetricsPresetName = 'sans' | 'serif' | 'mono' | 'gost-b';

/** Метрики можно задать именем готового набора, описанием или готовым объектом. */
export type FontMetricsInput = FontMetricsPresetName | FontMetricsInit | FontMetrics;

/** Верхняя граница чисел в метриках — защита от мусора из БД. */
const MAX_UNITS = 100_000;

function positive(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0 || value > MAX_UNITS) {
    throw new CadTypographyError(field, `must be a positive number up to ${MAX_UNITS}, got ${String(value)}`);
  }
  return value;
}

function nonNegative(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > MAX_UNITS) {
    throw new CadTypographyError(field, `must be a number in range 0…${MAX_UNITS}, got ${String(value)}`);
  }
  return value;
}

/** Собирает таблицу ширин из групп `[символы, ширина]`. */
function table(groups: ReadonlyArray<readonly [string, number]>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [chars, width] of groups) {
    for (const ch of chars) out[ch] = width;
  }
  return out;
}

/** Строка символов + массив ширин в том же порядке. */
function zip(chars: string, widths: readonly number[]): Record<string, number> {
  const list = Array.from(chars);
  if (list.length !== widths.length) {
    throw new Error(`font-metrics: ${list.length} chars vs ${widths.length} widths`);
  }
  const out: Record<string, number> = {};
  list.forEach((ch, i) => {
    out[ch] = widths[i] as number;
  });
  return out;
}

const CYR_UPPER = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
const CYR_LOWER = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';

/**
 * Кириллица для гротеска (Arial-подобные): ПРИБЛИЗИТЕЛЬНЫЕ значения (±5 %), не из AFM.
 * Для точного расчёта передайте метрики реального шрифта.
 */
const SANS_CYRILLIC: Record<string, number> = {
  ...zip(
    CYR_UPPER,
    [667, 667, 667, 556, 700, 667, 667, 900, 611, 722, 722, 667, 690, 833, 722, 778, 722, 667, 722, 611, 667, 800, 667, 725, 667, 960, 990, 790, 900, 650, 667, 1000, 700],
  ),
  ...zip(
    CYR_LOWER,
    [556, 556, 535, 400, 580, 556, 556, 760, 480, 560, 560, 500, 540, 640, 540, 556, 540, 556, 500, 460, 500, 750, 500, 570, 520, 800, 830, 600, 700, 520, 500, 760, 520],
  ),
  ...table([
    ['І', 278], ['і', 222], ['ї', 278], ['Ї', 278], ['Є', 722], ['є', 500],
    ['Ґ', 556], ['ґ', 400], ['Ў', 667], ['ў', 500],
  ]),
};

/** Типографика, одинаковая для всех гарнитур (ширины приблизительные). */
const COMMON_SYMBOLS: Record<string, number> = table([
  ['°', 400], ['±', 584], ['×', 584], ['÷', 584], ['≈', 584], ['≤', 584], ['≥', 584], ['≠', 584],
  ['–', 556], ['—', 1000], ['…', 1000], ['‘', 222], ['’', 222], ['“', 333], ['”', 333],
  ['«', 556], ['»', 556], ['²', 333], ['³', 333], ['№', 1000], ['€', 556], ['Ø', 778], ['ø', 611],
  ['Ω', 768], ['µ', 576], ['\u00a0', 278],
]);

/** Helvetica / Arial: Latin по таблице AFM, кириллица — оценка. Размеры: capHeight 716, xHeight 519, descent 212 (Arial). */
const SANS_ADVANCES: Record<string, number> = {
  ...COMMON_SYMBOLS,
  ...table([
    [' !,./:;I[\\]ft', 278], ['ijl', 222], ["'", 191], ['()-`r', 333], ['"', 355], ['*', 389], ['^', 469],
    ['Jcksvxyz', 500], ['0123456789#$?_abdeghnopquL', 556], ['+<=>~', 584], ['|', 260], ['{}', 334],
    ['FTZ', 611], ['ABEKPSVXY&', 667], ['CDHNRUw', 722], ['GOQ', 778], ['Mm', 833], ['%', 889],
    ['W', 944], ['@', 1015],
  ]),
  ...SANS_CYRILLIC,
};

/** Times: Latin по таблице AFM, кириллица — оценка (пропорционально гротеску ×0.92). */
const SERIF_CYRILLIC: Record<string, number> = Object.fromEntries(
  Object.entries(SANS_CYRILLIC).map(([ch, w]) => [ch, Math.round(w * 0.92)]),
);

const SERIF_ADVANCES: Record<string, number> = {
  ...COMMON_SYMBOLS,
  ...table([
    [' ,.', 250], ["/:;ijlt\\", 278], ['!()-[]`Ifr', 333], ["'", 180], ['"', 408], ['?acez', 444],
    ['sJ', 389], ['{}', 480], ['0123456789#$*_bdghknopquvxy', 500], ['~', 541], ['FPS', 556],
    ['+<=>', 564], ['ELTZ', 611], ['BCR', 667], ['ADGHKNOQUVXYw', 722], ['&m', 778], ['%', 833],
    ['M', 889], ['@', 921], ['W', 944], ['|', 200], ['^', 469],
  ]),
  ...SERIF_CYRILLIC,
};

/**
 * Чертёжный шрифт ГОСТ 2.304 тип Б по общим правилам стандарта (d = h/10): прописные и цифры ≈ 6d,
 * зазор между буквами 2d, пробел 6d. Ширины отдельных букв — ПРИБЛИЗИТЕЛЬНЫЕ (классы «узкая / обычная / широкая»),
 * а не построчная таблица стандарта. В этом профиле 1 em = высота прописных (capHeight = unitsPerEm).
 */
function buildGostAdvances(): Record<string, number> {
  const GAP = 200;
  const glyph = table([
    // Прописные: обычные 6d задаются значением по умолчанию ниже
    ['I', 200], ['EFLTГЕТЬ', 500], ['MWЖМШЫЮФ', 800], ['ЩЦ', 900],
    // Цифры и знаки
    ['1', 400], ['.,:;\'!|і', 200], ['()', 300], ['-', 400],
    // Строчные
    ['ijl', 200], ['frtг', 400], ['mwмшыю', 700], ['щфж', 800], ['abcdeghknopqsuvxyz', 500],
    ['абвдеёзийклнопрстухцчъьэя', 500],
  ]);
  const out: Record<string, number> = {};
  const all = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' + CYR_UPPER + CYR_LOWER +
    ".,:;'!|()-+=<>/*%#@$&?_[]{}~^`\"\\°±×÷≈–—…«»²³№Ø";
  for (const ch of all) out[ch] = (glyph[ch] ?? 600) + GAP;
  out[' '] = 600;
  out['\u00a0'] = 600;
  return out;
}

function freezeMetrics(m: FontMetrics): FontMetrics {
  return Object.freeze({ ...m, advances: Object.freeze({ ...m.advances }) });
}

/** Готовые наборы метрик (заморожены). */
export const FONT_METRICS_PRESETS: Readonly<Record<FontMetricsPresetName, FontMetrics>> = Object.freeze({
  sans: freezeMetrics({ unitsPerEm: 1000, capHeight: 716, xHeight: 519, descent: 212, defaultAdvance: 556, advances: SANS_ADVANCES }),
  serif: freezeMetrics({ unitsPerEm: 1000, capHeight: 662, xHeight: 450, descent: 217, defaultAdvance: 500, advances: SERIF_ADVANCES }),
  mono: freezeMetrics({ unitsPerEm: 1000, capHeight: 562, xHeight: 426, descent: 157, defaultAdvance: 600, advances: {} }),
  'gost-b': freezeMetrics({ unitsPerEm: 1000, capHeight: 1000, xHeight: 700, descent: 300, defaultAdvance: 800, advances: buildGostAdvances() }),
});

export const FONT_METRICS_PRESET_NAMES: readonly FontMetricsPresetName[] = Object.freeze(
  Object.keys(FONT_METRICS_PRESETS) as FontMetricsPresetName[],
);

export function isFontMetricsPresetName(value: unknown): value is FontMetricsPresetName {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(FONT_METRICS_PRESETS, value);
}

/** Имя набора, если `metrics` — именно он (по ссылке); иначе `null`. Нужно для компактной сериализации. */
export function getFontMetricsPresetName(metrics: FontMetrics): FontMetricsPresetName | null {
  for (const name of FONT_METRICS_PRESET_NAMES) {
    if (FONT_METRICS_PRESETS[name] === metrics) return name;
  }
  return null;
}

function validateAdvances(raw: unknown, field: string): Record<string, number> {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new CadTypographyError(field, 'must be an object { "char": advance }');
  }
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (Array.from(key).length !== 1) {
      throw new CadTypographyError(`${field}["${key}"]`, 'key must be exactly one character');
    }
    out[key] = nonNegative(value, `${field}["${key}"]`);
  }
  return out;
}

/** Создаёт и валидирует метрики. Результат заморожен. */
export function createFontMetrics(input: FontMetricsInput = 'sans', field = 'metrics'): FontMetrics {
  if (typeof input === 'string') {
    if (!isFontMetricsPresetName(input)) {
      throw new CadTypographyError(field, `unknown metrics preset "${input}", expected one of ${FONT_METRICS_PRESET_NAMES.join(' | ')}`);
    }
    return FONT_METRICS_PRESETS[input];
  }
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new CadTypographyError(field, `must be a preset name or an object, got ${String(input)}`);
  }
  if (getFontMetricsPresetName(input as FontMetrics) !== null) return input as FontMetrics;

  const init = input as FontMetricsInit;
  if (init.base !== undefined && !isFontMetricsPresetName(init.base)) {
    throw new CadTypographyError(`${field}.base`, `unknown metrics preset "${String(init.base)}"`);
  }
  const base = init.base === undefined ? undefined : FONT_METRICS_PRESETS[init.base];
  const pick = <K extends 'unitsPerEm' | 'capHeight' | 'xHeight' | 'defaultAdvance'>(key: K): number => {
    const value = init[key] ?? base?.[key];
    if (value === undefined) throw new CadTypographyError(`${field}.${key}`, 'is required (or set "base")');
    return positive(value, `${field}.${key}`);
  };
  const descentRaw = init.descent ?? base?.descent;
  if (descentRaw === undefined) throw new CadTypographyError(`${field}.descent`, 'is required (or set "base")');

  const advances = {
    ...(base?.advances ?? {}),
    ...(init.advances === undefined ? {} : validateAdvances(init.advances, `${field}.advances`)),
  };
  return freezeMetrics({
    unitsPerEm: pick('unitsPerEm'),
    capHeight: pick('capHeight'),
    xHeight: pick('xHeight'),
    descent: nonNegative(descentRaw, `${field}.descent`),
    defaultAdvance: pick('defaultAdvance'),
    advances,
  });
}

/** Ширина символа в единицах шрифта. Управляющие символы (кроме табуляции) имеют нулевую ширину. */
export function getAdvance(metrics: FontMetrics, char: string): number {
  const known = metrics.advances[char];
  if (known !== undefined) return known;
  const code = char.codePointAt(0) ?? 0;
  if (code < 0x20 && char !== '\t') return 0;
  if (code >= 0x300 && code <= 0x36f) return 0; // комбинируемые диакритики
  if (code === 0x200b || code === 0x200c || code === 0x200d || code === 0xfeff) return 0;
  return metrics.defaultAdvance;
}
