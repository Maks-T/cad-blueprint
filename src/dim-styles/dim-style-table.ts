import type { TextStyle, TextStyleTable } from '../typography';
import { CadDimStyleError } from './errors';
import { STANDARD_DIM_STYLE_NAME, assertDimStyleName, buildDimStyle, dimStyleKey } from './dim-style';
import type { DimStyle, DimStyleDefinition, DimStyleInit, DimStylePatch } from './dim-style';

export type DimStyleChange =
  | { readonly type: 'create'; readonly style: DimStyle }
  | { readonly type: 'update'; readonly style: DimStyle; readonly previous: DimStyle }
  | { readonly type: 'rename'; readonly style: DimStyle; readonly previous: DimStyle }
  | { readonly type: 'delete'; readonly style: DimStyle }
  | { readonly type: 'current'; readonly style: DimStyle };

export type DimStyleChangeListener = (change: DimStyleChange) => void;

/** Сериализуемое состояние таблицы. Текстовые стили и шрифты хранятся отдельно. */
export interface DimStyleTableJSON {
  readonly current: string;
  readonly styles: readonly DimStyle[];
}

/**
 * Таблица размерных стилей (аналог таблицы DIMSTYLE в AutoCAD).
 *
 * - Стиль `Standard` существует всегда; его нельзя удалить или переименовать (но можно изменить).
 * - Имена регистронезависимы, регистр сохраняется; порядок — порядок создания (`rename` его не меняет).
 * - Нельзя удалить текущий стиль.
 * - Стиль может ссылаться только на текстовый стиль, существующий в `TextStyleTable` этой таблицы;
 *   ссылка хранится под именем, как оно записано в `TextStyleTable`.
 *
 * Если текстовый стиль потом удалили или переименовали, ссылка в размерном стиле «повисает» — их список
 * даёт `missingTextStyles()` (так же, как `TextStyleTable.missingFonts()` для шрифтов). Проверка «стиль
 * используется размерами» относится к документу (стадии 3–4), а не к таблице.
 */
export class DimStyleTable implements Iterable<DimStyle> {
  private readonly styles = new Map<string, DimStyle>();
  private readonly listeners = new Set<DimStyleChangeListener>();
  private currentKey = dimStyleKey(STANDARD_DIM_STYLE_NAME);

  constructor(
    public readonly textStyles: TextStyleTable,
    definitions: Iterable<DimStyleDefinition> = [],
  ) {
    const standardKey = dimStyleKey(STANDARD_DIM_STYLE_NAME);
    this.styles.set(standardKey, this.finalize(buildDimStyle(STANDARD_DIM_STYLE_NAME)));
    for (const def of definitions) {
      if (typeof def !== 'object' || def === null || Array.isArray(def)) {
        throw new CadDimStyleError('styles', `each style must be an object with a name, got ${String(def)}`);
      }
      const { name, ...props } = def;
      if (dimStyleKey(name) === standardKey) {
        const standard = this.requireKey(standardKey);
        this.styles.set(standardKey, this.finalize(buildDimStyle(STANDARD_DIM_STYLE_NAME, props, standard)));
      } else {
        this.styles.set(dimStyleKey(name), this.assertNew(name, props));
      }
    }
  }

  get size(): number {
    return this.styles.size;
  }

  /** Текущий стиль — для новых размеров, если стиль не указан явно. */
  get current(): DimStyle {
    return this.requireKey(this.currentKey);
  }

  has(name: string): boolean {
    return this.styles.has(dimStyleKey(name));
  }

  get(name: string): DimStyle | undefined {
    return this.styles.get(dimStyleKey(name));
  }

  /** Как `get`, но бросает `CadDimStyleError`, если стиля нет. */
  require(name: string): DimStyle {
    return this.requireKey(dimStyleKey(name), name);
  }

  list(): DimStyle[] {
    return [...this.styles.values()];
  }

  names(): string[] {
    return this.list().map((s) => s.name);
  }

  [Symbol.iterator](): Iterator<DimStyle> {
    return this.styles.values();
  }

  /** Текстовый стиль, на который ссылается размерный стиль. Бросает, если его уже нет в `TextStyleTable`. */
  resolveTextStyle(style: DimStyle | string): TextStyle {
    const dim = typeof style === 'string' ? this.require(style) : style;
    const textStyle = this.textStyles.get(dim.textStyle);
    if (!textStyle) {
      throw new CadDimStyleError(dim.name, `text style "${dim.textStyle}" is not registered in TextStyleTable`);
    }
    return textStyle;
  }

  /** Создаёт стиль. Бросает, если стиль с таким именем (без учёта регистра) уже есть. */
  create(name: string, props: DimStylePatch = {}): DimStyle {
    const style = this.assertNew(name, props);
    this.styles.set(dimStyleKey(name), style);
    this.emit({ type: 'create', style });
    return style;
  }

  /** Изменяет свойства стиля; возвращает новый объект. */
  update(name: string, patch: DimStylePatch): DimStyle {
    const previous = this.require(name);
    const style = this.finalize(buildDimStyle(previous.name, patch, previous));
    this.styles.set(dimStyleKey(previous.name), style);
    this.emit({ type: 'update', style, previous });
    return style;
  }

  /** Переименовывает стиль (кроме `Standard`). Допускается смена только регистра. Порядок и текущий стиль сохраняются. */
  rename(name: string, newName: string): DimStyle {
    const previous = this.require(name);
    assertDimStyleName(newName, 'newName');
    const oldKey = dimStyleKey(previous.name);
    if (oldKey === dimStyleKey(STANDARD_DIM_STYLE_NAME)) {
      throw new CadDimStyleError(previous.name, `style "${STANDARD_DIM_STYLE_NAME}" cannot be renamed`);
    }
    const newKey = dimStyleKey(newName);
    if (newKey !== oldKey && this.styles.has(newKey)) {
      throw new CadDimStyleError('newName', `style "${newName}" already exists`);
    }
    const style = buildDimStyle(newName, {}, previous);

    const rebuilt = new Map<string, DimStyle>();
    for (const [key, value] of this.styles) rebuilt.set(key === oldKey ? newKey : key, key === oldKey ? style : value);
    this.styles.clear();
    for (const [key, value] of rebuilt) this.styles.set(key, value);
    if (this.currentKey === oldKey) this.currentKey = newKey;

    this.emit({ type: 'rename', style, previous });
    return style;
  }

  /** Копия стиля под новым именем; `patch` переопределяет свойства копии. */
  clone(name: string, newName: string, patch: DimStylePatch = {}): DimStyle {
    const source = this.require(name);
    assertDimStyleName(newName, 'newName');
    if (this.has(newName)) throw new CadDimStyleError('newName', `style "${newName}" already exists`);
    const style = this.finalize(buildDimStyle(newName, patch, source));
    this.styles.set(dimStyleKey(newName), style);
    this.emit({ type: 'create', style });
    return style;
  }

  /** Удаляет стиль. Нельзя удалить `Standard` и текущий стиль. */
  delete(name: string): void {
    const style = this.require(name);
    const key = dimStyleKey(style.name);
    if (key === dimStyleKey(STANDARD_DIM_STYLE_NAME)) {
      throw new CadDimStyleError(style.name, `style "${STANDARD_DIM_STYLE_NAME}" cannot be deleted`);
    }
    if (key === this.currentKey) {
      throw new CadDimStyleError(style.name, 'the current style cannot be deleted; switch to another style first');
    }
    this.styles.delete(key);
    this.emit({ type: 'delete', style });
  }

  setCurrent(name: string): DimStyle {
    const style = this.require(name);
    this.currentKey = dimStyleKey(style.name);
    this.emit({ type: 'current', style });
    return style;
  }

  /** Имена текстовых стилей, на которые ссылаются размерные стили (без повторов, как они записаны). */
  textStylesInUse(): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const style of this.styles.values()) {
      const key = style.textStyle.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        out.push(style.textStyle);
      }
    }
    return out;
  }

  /** Текстовые стили, на которые ссылаются размерные стили, но которых уже нет (удалены или переименованы). */
  missingTextStyles(): string[] {
    return this.textStylesInUse().filter((name) => !this.textStyles.has(name));
  }

  /** Подписка на изменения; возвращает функцию отписки. */
  onChange(listener: DimStyleChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  toJSON(): DimStyleTableJSON {
    return { current: this.current.name, styles: this.list() };
  }

  /** Восстанавливает таблицу из `toJSON()` (или из БД) с полной валидацией; текстовые стили берутся из `textStyles`. */
  static fromJSON(textStyles: TextStyleTable, raw: unknown): DimStyleTable {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
      throw new CadDimStyleError('dimStyles', 'must be an object { current, styles }');
    }
    const { current, styles } = raw as { current?: unknown; styles?: unknown };
    if (!Array.isArray(styles)) {
      throw new CadDimStyleError('styles', 'must be an array of dimension style definitions');
    }
    const table = new DimStyleTable(textStyles, styles as DimStyleDefinition[]);
    if (current !== undefined) {
      if (typeof current !== 'string') throw new CadDimStyleError('current', 'must be a string');
      table.setCurrent(current);
    }
    return table;
  }

  private requireKey(key: string, display = key): DimStyle {
    const style = this.styles.get(key);
    if (!style) throw new CadDimStyleError(display, 'dimension style not found');
    return style;
  }

  private assertNew(name: string, props: DimStyleInit): DimStyle {
    assertDimStyleName(name);
    if (this.styles.has(dimStyleKey(name))) {
      throw new CadDimStyleError(name, 'dimension style already exists');
    }
    return this.finalize(buildDimStyle(name, props));
  }

  /** Проверяет ссылку на текстовый стиль и приводит её к имени, записанному в `TextStyleTable`. */
  private finalize(style: DimStyle): DimStyle {
    const textStyle = this.textStyles.get(style.textStyle);
    if (!textStyle) {
      throw new CadDimStyleError('textStyle', `text style "${style.textStyle}" is not registered in TextStyleTable`);
    }
    return textStyle.name === style.textStyle ? style : buildDimStyle(style.name, { textStyle: textStyle.name }, style);
  }

  private emit(change: DimStyleChange): void {
    for (const listener of [...this.listeners]) listener(change);
  }
}
