import { CadTypographyError } from './errors';
import {
  DEFAULT_FONT_ID,
  assertFontId,
  buildFont,
  buildFontFaceRule,
  buildGoogleFontsUrl,
  fontKey,
  quoteFamily,
} from './font';
import type { DxfFontMapping, Font, FontDefinition, FontPatch, GoogleFontSource } from './font';
import { getFontMetricsPresetName } from './font-metrics';
import type { FontMetrics, FontMetricsPresetName } from './font-metrics';

export type FontChange =
  | { readonly type: 'create'; readonly font: Font }
  | { readonly type: 'update'; readonly font: Font; readonly previous: Font }
  | { readonly type: 'delete'; readonly font: Font };

export type FontChangeListener = (change: FontChange) => void;

/** Шрифт в сериализуемом виде: готовые метрики заменены именем набора. */
export type FontJSON = Omit<Font, 'metrics'> & { readonly metrics: FontMetricsPresetName | FontMetrics };

export interface FontManagerJSON {
  readonly fonts: readonly FontJSON[];
}

/** Файлы AutoCAD, выбранные для шрифта при записи таблицы STYLE. */
export interface ResolvedDxfFont extends DxfFontMapping {
  /** Какой шрифт реестра дал соответствие (сам шрифт или один из запасных). */
  readonly sourceId: string | null;
}

/** Если ни у шрифта, ни у его запасных нет соответствия — AutoCAD использует `txt.shx`. */
const DXF_LAST_RESORT: ResolvedDxfFont = Object.freeze({ shx: 'txt.shx', ttf: null, bigFont: null, sourceId: null });

/** Шрифты, которые есть всегда (`sans` нельзя удалить; остальные можно изменить или удалить). */
const BUILTIN_FONTS: readonly FontDefinition[] = Object.freeze([
  {
    id: 'sans',
    family: 'Arial',
    generic: 'sans-serif',
    fallbacks: ['Helvetica'],
    dxf: { ttf: 'arial.ttf' },
    metrics: 'sans',
  },
  {
    id: 'serif',
    family: 'Times New Roman',
    generic: 'serif',
    fallbacks: ['Times'],
    dxf: { ttf: 'times.ttf' },
    metrics: 'serif',
  },
  {
    id: 'mono',
    family: 'Courier New',
    generic: 'monospace',
    fallbacks: ['Courier'],
    dxf: { ttf: 'cour.ttf' },
    metrics: 'mono',
  },
]);

/**
 * Реестр шрифтов и таблица замены `fontFallbackMap`.
 *
 * - `sans` существует всегда и не удаляется (на него опирается стиль `Standard`); `serif` и `mono` — встроенные, их можно менять.
 * - Идентификаторы регистронезависимы (`GOST-B` = `gost-b`), регистр сохраняется.
 * - `Font` неизменяем; любое изменение возвращает новый объект.
 * - Запасные шрифты (`fallbacks`) — id из реестра или имена системных семейств (`"Arial Narrow"`).
 *
 * Ядро не зависит от DOM: менеджер только возвращает строки (CSS, URL), загрузкой шрифтов занимается рендерер/браузер.
 * Проверка «шрифт используется стилями» относится к документу (стадии 3–4); пока для этого есть `TextStyleTable.missingFonts()`.
 */
export class FontManager implements Iterable<Font> {
  private readonly fonts = new Map<string, Font>();
  private readonly listeners = new Set<FontChangeListener>();

  constructor(definitions: Iterable<FontDefinition> = []) {
    for (const def of BUILTIN_FONTS) {
      const { id, ...props } = def;
      this.fonts.set(fontKey(id), buildFont(id, props));
    }
    for (const def of definitions) {
      const { id, ...props } = def;
      const existing = this.fonts.get(fontKey(id));
      this.fonts.set(fontKey(id), existing ? buildFont(existing.id, props, existing) : buildFont(id, props));
    }
  }

  get size(): number {
    return this.fonts.size;
  }

  has(id: string): boolean {
    return this.fonts.has(fontKey(id));
  }

  get(id: string): Font | undefined {
    return this.fonts.get(fontKey(id));
  }

  /** Как `get`, но бросает `CadTypographyError`, если шрифта нет. */
  require(id: string): Font {
    const font = this.get(id);
    if (!font) throw new CadTypographyError(id, 'font not found');
    return font;
  }

  list(): Font[] {
    return [...this.fonts.values()];
  }

  ids(): string[] {
    return this.list().map((f) => f.id);
  }

  [Symbol.iterator](): Iterator<Font> {
    return this.fonts.values();
  }

  /** Регистрирует шрифт. Бросает, если id (без учёта регистра) уже занят. */
  create(id: string, props: FontPatch = {}): Font {
    assertFontId(id);
    if (this.has(id)) throw new CadTypographyError(id, 'font already exists');
    const font = buildFont(id, props);
    this.fonts.set(fontKey(id), font);
    this.emit({ type: 'create', font });
    return font;
  }

  /** Изменяет свойства шрифта; возвращает новый объект. */
  update(id: string, patch: FontPatch): Font {
    const previous = this.require(id);
    const font = buildFont(previous.id, patch, previous);
    this.fonts.set(fontKey(previous.id), font);
    this.emit({ type: 'update', font, previous });
    return font;
  }

  /** Копия шрифта под новым id; `patch` переопределяет свойства копии. */
  clone(id: string, newId: string, patch: FontPatch = {}): Font {
    const source = this.require(id);
    assertFontId(newId, 'newId');
    if (this.has(newId)) throw new CadTypographyError('newId', `font "${newId}" already exists`);
    const font = buildFont(newId, patch, source);
    this.fonts.set(fontKey(newId), font);
    this.emit({ type: 'create', font });
    return font;
  }

  /**
   * Удаляет шрифт (кроме `sans`). Ссылки на него в `fallbacks` других шрифтов убираются,
   * иначе id превратился бы в «имя системного семейства».
   */
  delete(id: string): void {
    const font = this.require(id);
    const key = fontKey(font.id);
    if (key === fontKey(DEFAULT_FONT_ID)) {
      throw new CadTypographyError(font.id, `font "${DEFAULT_FONT_ID}" is the default font and cannot be deleted`);
    }
    this.fonts.delete(key);
    this.emit({ type: 'delete', font });
    for (const other of this.list()) {
      if (other.fallbacks.some((f) => fontKey(f) === key)) {
        this.update(other.id, { fallbacks: other.fallbacks.filter((f) => fontKey(f) !== key) });
      }
    }
  }

  // ---- fontFallbackMap ----------------------------------------------------

  /** Таблица замены целиком: `id → запасные шрифты`. Только шрифты с непустым списком. */
  get fallbackMap(): Readonly<Record<string, readonly string[]>> {
    const out: Record<string, readonly string[]> = {};
    for (const font of this.fonts.values()) {
      if (font.fallbacks.length > 0) out[font.id] = font.fallbacks;
    }
    return Object.freeze(out);
  }

  /** Задаёт запасные шрифты одному шрифту. */
  setFallbacks(id: string, fallbacks: readonly string[]): Font {
    return this.update(id, { fallbacks });
  }

  /**
   * Задаёт таблицу замены пачкой. Шрифты, которых нет в `map`, не меняются.
   * Все ключи проверяются до применения — при ошибке ничего не меняется.
   */
  setFallbackMap(map: Readonly<Record<string, readonly string[]>>): void {
    if (typeof map !== 'object' || map === null || Array.isArray(map)) {
      throw new CadTypographyError('fallbackMap', 'must be an object { fontId: [fallbacks] }');
    }
    const entries = Object.entries(map).map(([id, fallbacks]) => {
      const previous = this.require(id);
      buildFont(previous.id, { fallbacks }, previous); // валидация до применения
      return [previous.id, fallbacks] as const;
    });
    for (const [id, fallbacks] of entries) this.update(id, { fallbacks });
  }

  /**
   * Цепочка шрифтов реестра в порядке приоритета: сам шрифт, затем его запасные (рекурсивно, без повторов).
   * Имена системных семейств, которых нет в реестре, в цепочку не входят — см. `getCssFontFamily`.
   */
  getFontChain(id: string): Font[] {
    const out: Font[] = [];
    const seen = new Set<string>();
    const walk = (font: Font): void => {
      const key = fontKey(font.id);
      if (seen.has(key)) return;
      seen.add(key);
      out.push(font);
      for (const name of font.fallbacks) {
        const next = this.get(name);
        if (next) walk(next);
      }
    };
    walk(this.require(id));
    return out;
  }

  /** Значение CSS `font-family`: семейство шрифта, его запасные, универсальное семейство первого шрифта. */
  getCssFontFamily(id: string): string {
    const first = this.require(id);
    const families: string[] = [];
    const seen = new Set<string>();
    const push = (family: string): void => {
      const key = family.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        families.push(quoteFamily(family));
      }
    };
    const walk = (font: Font, visited: Set<string>): void => {
      if (visited.has(fontKey(font.id))) return;
      visited.add(fontKey(font.id));
      push(font.family);
      for (const name of font.fallbacks) {
        const next = this.get(name);
        if (next) walk(next, visited);
        else push(name);
      }
    };
    walk(first, new Set());
    return `${families.join(', ')}, ${first.generic}`;
  }

  /**
   * Файлы AutoCAD для записи шрифта в таблицу STYLE: берётся первое соответствие `dxf` в цепочке
   * (шрифт → запасные); если нигде нет — `txt.shx`.
   */
  resolveDxfFont(id: string): ResolvedDxfFont {
    for (const font of this.getFontChain(id)) {
      if (font.dxf) return Object.freeze({ ...font.dxf, sourceId: font.id });
    }
    return DXF_LAST_RESORT;
  }

  // ---- Веб-шрифты для SVG -------------------------------------------------

  /** Google-источники для указанных шрифтов (или для всех, если `ids` не задан); одинаковые семейства объединяются. */
  getGoogleSources(ids?: Iterable<string>): GoogleFontSource[] {
    const merged = new Map<string, GoogleFontSource>();
    for (const font of this.select(ids)) {
      if (!font.google) continue;
      const key = font.google.family.toLowerCase();
      const prev = merged.get(key);
      merged.set(
        key,
        prev
          ? Object.freeze({
              family: prev.family,
              weights: Object.freeze([...new Set([...prev.weights, ...font.google.weights])].sort((a, b) => a - b)),
              italic: prev.italic || font.google.italic,
            })
          : font.google,
      );
    }
    return [...merged.values()];
  }

  /** Один URL Google Fonts на все указанные шрифты или `null`, если Google-шрифтов нет. */
  getGoogleFontsUrl(ids?: Iterable<string>): string | null {
    return buildGoogleFontsUrl(this.getGoogleSources(ids));
  }

  /**
   * CSS для `<style>` внутри SVG: `@import` Google Fonts (должен стоять первым) и `@font-face` собственных начертаний.
   * `ids` — только эти шрифты (например, реально использованные стилями); по умолчанию — все.
   * Пустая строка, если подключать нечего.
   */
  buildFontFaceCss(ids?: Iterable<string>): string {
    const fonts = this.select(ids);
    const parts: string[] = [];
    const googleUrl = buildGoogleFontsUrl(this.getGoogleSources(fonts.map((f) => f.id)));
    if (googleUrl !== null) parts.push(`@import url("${googleUrl}");`);
    for (const font of fonts) {
      for (const face of font.faces) parts.push(buildFontFaceRule(font.family, face));
    }
    return parts.join('\n');
  }

  // ---- События и JSON -----------------------------------------------------

  /** Подписка на изменения; возвращает функцию отписки. */
  onChange(listener: FontChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  toJSON(): FontManagerJSON {
    return {
      fonts: this.list().map((font) => ({ ...font, metrics: getFontMetricsPresetName(font.metrics) ?? font.metrics })),
    };
  }

  /** Восстанавливает реестр из `toJSON()` (или из БД) с полной валидацией. */
  static fromJSON(raw: unknown): FontManager {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
      throw new CadTypographyError('fonts', 'must be an object { fonts }');
    }
    const { fonts } = raw as { fonts?: unknown };
    if (!Array.isArray(fonts)) {
      throw new CadTypographyError('fonts', 'must be an array of font definitions');
    }
    fonts.forEach((item, i) => {
      if (typeof item !== 'object' || item === null || Array.isArray(item)) {
        throw new CadTypographyError(`fonts[${i}]`, 'must be an object');
      }
    });
    return new FontManager(fonts as FontDefinition[]);
  }

  private select(ids?: Iterable<string>): Font[] {
    if (ids === undefined) return this.list();
    const seen = new Set<string>();
    const out: Font[] = [];
    for (const id of ids) {
      const font = this.require(id);
      if (!seen.has(fontKey(font.id))) {
        seen.add(fontKey(font.id));
        out.push(font);
      }
    }
    return out;
  }

  private emit(change: FontChange): void {
    for (const listener of [...this.listeners]) listener(change);
  }
}
