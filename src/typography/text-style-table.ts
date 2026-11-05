import { CadTypographyError } from './errors';
import { fontKey } from './font';
import type { FontManager } from './font-manager';
import {
  STANDARD_TEXT_STYLE_NAME,
  assertTextStyleName,
  buildTextStyle,
  textStyleKey,
} from './text-style';
import type { TextStyle, TextStyleDefinition, TextStylePatch } from './text-style';

export type TextStyleChange =
  | { readonly type: 'create'; readonly style: TextStyle }
  | { readonly type: 'update'; readonly style: TextStyle; readonly previous: TextStyle }
  | { readonly type: 'rename'; readonly style: TextStyle; readonly previous: TextStyle }
  | { readonly type: 'delete'; readonly style: TextStyle }
  | { readonly type: 'current'; readonly style: TextStyle };

export type TextStyleChangeListener = (change: TextStyleChange) => void;

/** Сериализуемое состояние таблицы. Шрифты хранятся отдельно (`FontManager`). */
export interface TextStyleTableJSON {
  readonly current: string;
  readonly styles: readonly TextStyle[];
}

/**
 * Таблица текстовых стилей (аналог таблицы STYLE в AutoCAD).
 *
 * - Стиль `Standard` существует всегда; его нельзя удалить или переименовать (но можно изменить).
 * - Имена регистронезависимы, регистр сохраняется; порядок — порядок создания (`rename` его не меняет).
 * - Нельзя удалить текущий стиль.
 * - Стиль может ссылаться только на шрифт, зарегистрированный в `FontManager` таблицы.
 *
 * Проверка «стиль используется объектами» относится к документу (стадии 3–4), а не к таблице.
 */
export class TextStyleTable implements Iterable<TextStyle> {
  private readonly styles = new Map<string, TextStyle>();
  private readonly listeners = new Set<TextStyleChangeListener>();
  private currentKey = textStyleKey(STANDARD_TEXT_STYLE_NAME);

  constructor(
    public readonly fonts: FontManager,
    definitions: Iterable<TextStyleDefinition> = [],
  ) {
    const standardKey = textStyleKey(STANDARD_TEXT_STYLE_NAME);
    this.styles.set(standardKey, buildTextStyle(STANDARD_TEXT_STYLE_NAME, {}, undefined, fonts));
    for (const def of definitions) {
      const { name, ...props } = def;
      if (textStyleKey(name) === standardKey) {
        const standard = this.requireKey(standardKey);
        this.styles.set(standardKey, buildTextStyle(STANDARD_TEXT_STYLE_NAME, props, standard, fonts));
      } else {
        this.styles.set(textStyleKey(name), this.assertNew(name, props));
      }
    }
  }

  get size(): number {
    return this.styles.size;
  }

  /** Текущий стиль — для новых текстовых объектов, если стиль не указан явно. */
  get current(): TextStyle {
    return this.requireKey(this.currentKey);
  }

  has(name: string): boolean {
    return this.styles.has(textStyleKey(name));
  }

  get(name: string): TextStyle | undefined {
    return this.styles.get(textStyleKey(name));
  }

  /** Как `get`, но бросает `CadTypographyError`, если стиля нет. */
  require(name: string): TextStyle {
    return this.requireKey(textStyleKey(name), name);
  }

  list(): TextStyle[] {
    return [...this.styles.values()];
  }

  names(): string[] {
    return this.list().map((s) => s.name);
  }

  [Symbol.iterator](): Iterator<TextStyle> {
    return this.styles.values();
  }

  /** Создаёт стиль. Бросает, если стиль с таким именем (без учёта регистра) уже есть. */
  create(name: string, props: TextStylePatch = {}): TextStyle {
    const style = this.assertNew(name, props);
    this.styles.set(textStyleKey(name), style);
    this.emit({ type: 'create', style });
    return style;
  }

  /** Изменяет свойства стиля; возвращает новый объект. */
  update(name: string, patch: TextStylePatch): TextStyle {
    const previous = this.require(name);
    const style = buildTextStyle(previous.name, patch, previous, this.fonts);
    this.styles.set(textStyleKey(previous.name), style);
    this.emit({ type: 'update', style, previous });
    return style;
  }

  /** Переименовывает стиль (кроме `Standard`). Допускается смена только регистра. Порядок и текущий стиль сохраняются. */
  rename(name: string, newName: string): TextStyle {
    const previous = this.require(name);
    assertTextStyleName(newName, 'newName');
    const oldKey = textStyleKey(previous.name);
    if (oldKey === textStyleKey(STANDARD_TEXT_STYLE_NAME)) {
      throw new CadTypographyError(previous.name, `style "${STANDARD_TEXT_STYLE_NAME}" cannot be renamed`);
    }
    const newKey = textStyleKey(newName);
    if (newKey !== oldKey && this.styles.has(newKey)) {
      throw new CadTypographyError('newName', `style "${newName}" already exists`);
    }
    const style = buildTextStyle(newName, {}, previous, this.fonts);

    const rebuilt = new Map<string, TextStyle>();
    for (const [key, value] of this.styles) rebuilt.set(key === oldKey ? newKey : key, key === oldKey ? style : value);
    this.styles.clear();
    for (const [key, value] of rebuilt) this.styles.set(key, value);
    if (this.currentKey === oldKey) this.currentKey = newKey;

    this.emit({ type: 'rename', style, previous });
    return style;
  }

  /** Копия стиля под новым именем; `patch` переопределяет свойства копии. */
  clone(name: string, newName: string, patch: TextStylePatch = {}): TextStyle {
    const source = this.require(name);
    assertTextStyleName(newName, 'newName');
    if (this.has(newName)) throw new CadTypographyError('newName', `style "${newName}" already exists`);
    const style = buildTextStyle(newName, patch, source, this.fonts);
    this.styles.set(textStyleKey(newName), style);
    this.emit({ type: 'create', style });
    return style;
  }

  /** Удаляет стиль. Нельзя удалить `Standard` и текущий стиль. */
  delete(name: string): void {
    const style = this.require(name);
    const key = textStyleKey(style.name);
    if (key === textStyleKey(STANDARD_TEXT_STYLE_NAME)) {
      throw new CadTypographyError(style.name, `style "${STANDARD_TEXT_STYLE_NAME}" cannot be deleted`);
    }
    if (key === this.currentKey) {
      throw new CadTypographyError(style.name, 'the current style cannot be deleted; switch to another style first');
    }
    this.styles.delete(key);
    this.emit({ type: 'delete', style });
  }

  setCurrent(name: string): TextStyle {
    const style = this.require(name);
    this.currentKey = textStyleKey(style.name);
    this.emit({ type: 'current', style });
    return style;
  }

  /** Идентификаторы шрифтов, которые используют стили (без повторов, как они записаны в реестре). */
  fontsInUse(): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const style of this.styles.values()) {
      const key = fontKey(style.fontFamily);
      if (!seen.has(key)) {
        seen.add(key);
        out.push(this.fonts.get(style.fontFamily)?.id ?? style.fontFamily);
      }
    }
    return out;
  }

  /** Шрифты, на которые ссылаются стили, но которых уже нет в реестре (например, после `FontManager.delete`). */
  missingFonts(): string[] {
    return this.fontsInUse().filter((id) => !this.fonts.has(id));
  }

  /** Подписка на изменения; возвращает функцию отписки. */
  onChange(listener: TextStyleChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  toJSON(): TextStyleTableJSON {
    return { current: this.current.name, styles: this.list() };
  }

  /** Восстанавливает таблицу из `toJSON()` (или из БД) с полной валидацией; шрифты берутся из `fonts`. */
  static fromJSON(fonts: FontManager, raw: unknown): TextStyleTable {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
      throw new CadTypographyError('styles', 'must be an object { current, styles }');
    }
    const { current, styles } = raw as { current?: unknown; styles?: unknown };
    if (!Array.isArray(styles)) {
      throw new CadTypographyError('styles', 'must be an array of text style definitions');
    }
    const table = new TextStyleTable(fonts, styles as TextStyleDefinition[]);
    if (current !== undefined) {
      if (typeof current !== 'string') throw new CadTypographyError('current', 'must be a string');
      table.setCurrent(current);
    }
    return table;
  }

  private requireKey(key: string, display = key): TextStyle {
    const style = this.styles.get(key);
    if (!style) throw new CadTypographyError(display, 'text style not found');
    return style;
  }

  private assertNew(name: string, props: TextStylePatch): TextStyle {
    assertTextStyleName(name);
    if (this.styles.has(textStyleKey(name))) {
      throw new CadTypographyError(name, 'text style already exists');
    }
    return buildTextStyle(name, props, undefined, this.fonts);
  }

  private emit(change: TextStyleChange): void {
    for (const listener of [...this.listeners]) listener(change);
  }
}
