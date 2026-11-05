import { BlockTable } from '../blocks/block-table';
import { referencedBlocks } from '../blocks/block';
import { DimStyleTable, registerGostDimStyle } from '../dim-styles';
import type { DimStyleTableJSON } from '../dim-styles';
import { CadError } from '../errors';
import { isEntity } from '../entities/kinds';
import { parseEntities } from '../entities/parse';
import type { Entity } from '../entities/types';
import { LayerManager } from '../layers';
import type { LayerManagerJSON } from '../layers';
import { createDrawingMetrics, createDrawingSettings, parseDrawingSettings, updateDrawingSettings } from '../settings';
import type { DrawingMetrics, DrawingSettings, DrawingSettingsInit } from '../settings';
import { FontManager, TextStyleTable } from '../typography';
import type { FontManagerJSON, TextStyleTableJSON } from '../typography';
import type { RenderContext } from './context';

/** Ошибка документа: листы, ссылки, формат. */
export class CadDocumentError extends CadError {
  constructor(field: string, message: string) {
    super(field, message);
    this.name = 'CadDocumentError';
  }
}

const SHEET_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

/** Лист: именованный набор объектов (модель чертежа). Объекты неизменяемы, список — изменяемый. */
export class CadSheet {
  private items: Entity[] = [];
  private nameValue: string;

  constructor(
    public readonly id: string,
    name: string,
    entities: readonly Entity[] = [],
  ) {
    if (!SHEET_ID_RE.test(id)) throw new CadDocumentError('sheet.id', `must match ${String(SHEET_ID_RE)}, got "${id}"`);
    this.nameValue = CadSheet.checkName(name);
    this.add(...entities);
  }

  get name(): string {
    return this.nameValue;
  }

  set name(value: string) {
    this.nameValue = CadSheet.checkName(value);
  }

  get entities(): readonly Entity[] {
    return this.items;
  }

  get size(): number {
    return this.items.length;
  }

  add(...entities: Entity[]): this {
    entities.forEach((e, i) => {
      if (!isEntity(e)) throw new CadDocumentError(`sheet "${this.id}".entities[${this.items.length + i}]`, 'must be an entity created by a factory');
    });
    this.items.push(...entities);
    return this;
  }

  /** Удаляет объекты по `id` или по ссылке; возвращает число удалённых. */
  remove(target: string | Entity): number {
    const before = this.items.length;
    this.items = this.items.filter((e) => (typeof target === 'string' ? e.id !== target : e !== target));
    return before - this.items.length;
  }

  /** Заменяет объект (по ссылке или `id`) на новый. */
  replace(target: string | Entity, next: Entity): boolean {
    if (!isEntity(next)) throw new CadDocumentError('replace', 'must be an entity created by a factory');
    const i = this.items.findIndex((e) => (typeof target === 'string' ? e.id === target : e === target));
    if (i < 0) return false;
    this.items[i] = next;
    return true;
  }

  find(id: string): Entity | undefined {
    return this.items.find((e) => e.id === id);
  }

  clear(): this {
    this.items = [];
    return this;
  }

  /** Полностью заменяет содержимое листа. */
  set(entities: readonly Entity[]): this {
    this.items = [];
    return this.add(...entities);
  }

  toJSON(): CadSheetJSON {
    return { id: this.id, name: this.name, entities: this.items };
  }

  private static checkName(name: unknown): string {
    if (typeof name !== 'string' || name.length === 0 || name.length > 255) {
      throw new CadDocumentError('sheet.name', 'must be a string of 1…255 characters');
    }
    return name;
  }
}

export interface CadSheetJSON {
  readonly id: string;
  readonly name: string;
  readonly entities: readonly unknown[];
}

/** Подробный (не компактный) JSON документа — для отладки. Компактный формат — `encodeDocument` (Стадия 4). */
export interface CadDocumentJSON {
  readonly format: 'cad-blueprint';
  readonly version: 1;
  readonly settings: DrawingSettings;
  readonly fonts: FontManagerJSON;
  readonly textStyles: TextStyleTableJSON;
  readonly dimStyles: DimStyleTableJSON;
  readonly layers: LayerManagerJSON;
  readonly blocks: unknown;
  readonly sheets: readonly CadSheetJSON[];
}

export interface CadDocumentInit {
  settings?: DrawingSettingsInit;
  /** Подключить шрифт и стили ГОСТ (`gost-b`, текстовый и размерный стиль `GOST`) и сделать их текущими. */
  gost?: boolean;
}

export interface AuditIssue {
  readonly severity: 'error' | 'warning';
  /** Где найдено: `sheet "main" / entities[3]`, `block "Ступень" / entities[0]`, `textStyles`, … */
  readonly path: string;
  readonly message: string;
}

/**
 * Документ чертежа: настройки, таблицы (шрифты → текстовые стили → размерные стили, слои, блоки) и листы.
 * Это то, что сохраняется в БД (Стадия 4) и рисуется рендерерами (Стадия 5).
 */
export class CadDocument {
  readonly fonts: FontManager;
  readonly textStyles: TextStyleTable;
  readonly dimStyles: DimStyleTable;
  readonly layers: LayerManager;
  readonly blocks: BlockTable;
  private settingsValue: DrawingSettings;
  private metricsCache: DrawingMetrics | null = null;
  private readonly sheetList: CadSheet[] = [];

  constructor(init: CadDocumentInit = {}) {
    this.settingsValue = createDrawingSettings({ annotationScale: 'auto', ...init.settings });
    this.fonts = new FontManager();
    this.textStyles = new TextStyleTable(this.fonts);
    this.dimStyles = new DimStyleTable(this.textStyles);
    this.layers = new LayerManager();
    this.blocks = new BlockTable();
    if (init.gost) {
      registerGostDimStyle(this.dimStyles);
      this.textStyles.setCurrent('GOST');
      this.dimStyles.setCurrent('GOST');
    }
  }

  /** Документ из готовых таблиц (их связь должна быть согласована: `dimStyles.textStyles.fonts`). */
  static fromParts(parts: {
    settings?: DrawingSettings;
    dimStyles?: DimStyleTable;
    layers?: LayerManager;
    blocks?: BlockTable;
    sheets?: readonly CadSheet[];
  }): CadDocument {
    const doc = Object.create(CadDocument.prototype) as CadDocument;
    const dimStyles = parts.dimStyles ?? new DimStyleTable(new TextStyleTable(new FontManager()));
    Object.assign(doc, {
      settingsValue: parts.settings ?? createDrawingSettings(),
      metricsCache: null,
      sheetList: [...(parts.sheets ?? [])],
      fonts: dimStyles.textStyles.fonts,
      textStyles: dimStyles.textStyles,
      dimStyles,
      layers: parts.layers ?? new LayerManager(),
      blocks: parts.blocks ?? new BlockTable(),
    });
    return doc;
  }

  get settings(): DrawingSettings {
    return this.settingsValue;
  }

  /** Меняет настройки (масштаб, единицы, …). */
  updateSettings(patch: DrawingSettingsInit): DrawingSettings {
    this.settingsValue = updateDrawingSettings(this.settingsValue, patch);
    this.metricsCache = null;
    return this.settingsValue;
  }

  get drawing(): DrawingMetrics {
    this.metricsCache ??= createDrawingMetrics(this.settingsValue);
    return this.metricsCache;
  }

  get sheets(): readonly CadSheet[] {
    return this.sheetList;
  }

  /** Добавляет лист. `id` по умолчанию — `sheet-1`, `sheet-2`, … */
  addSheet(name = 'Лист', entities: readonly Entity[] = [], id?: string): CadSheet {
    let sheetId = id;
    if (sheetId === undefined) {
      let n = this.sheetList.length + 1;
      while (this.sheetList.some((s) => s.id === `sheet-${n}`)) n++;
      sheetId = `sheet-${n}`;
    }
    if (this.sheetList.some((s) => s.id === sheetId)) throw new CadDocumentError('sheet.id', `sheet "${sheetId}" already exists`);
    const sheet = new CadSheet(sheetId, name, entities);
    this.sheetList.push(sheet);
    return sheet;
  }

  /** Лист по `id` или имени. */
  getSheet(idOrName: string): CadSheet | undefined {
    return this.sheetList.find((s) => s.id === idOrName) ?? this.sheetList.find((s) => s.name === idOrName);
  }

  requireSheet(idOrName?: string): CadSheet {
    const sheet = idOrName === undefined ? this.sheetList[0] : this.getSheet(idOrName);
    if (!sheet) throw new CadDocumentError('sheet', idOrName === undefined ? 'the document has no sheets' : `sheet "${idOrName}" not found`);
    return sheet;
  }

  removeSheet(id: string): boolean {
    const i = this.sheetList.findIndex((s) => s.id === id);
    if (i < 0) return false;
    this.sheetList.splice(i, 1);
    return true;
  }

  /** Контекст для рендереров и расчёта габаритов. */
  context(): RenderContext {
    return Object.freeze({
      drawing: this.drawing,
      layers: this.layers,
      fonts: this.fonts,
      textStyles: this.textStyles,
      dimStyles: this.dimStyles,
      blocks: this.blocks,
    });
  }

  /**
   * Проверка ссылок: несуществующие слои, текстовые и размерные стили, блоки, шрифты.
   * Рендереры такие ссылки переживают (слой «0», стиль `Standard`), кроме неопределённых блоков — на них они останавливаются.
   */
  audit(): AuditIssue[] {
    const issues: AuditIssue[] = [];
    const visit = (list: readonly Entity[], path: string): void => {
      list.forEach((e, i) => {
        const at = `${path} / entities[${i}]`;
        if (!this.layers.has(e.layer)) issues.push({ severity: 'warning', path: at, message: `layer "${e.layer}" is not defined (drawn as layer "0")` });
        if ((e.type === 'text' || e.type === 'mtext') && e.style !== null && !this.textStyles.has(e.style)) {
          issues.push({ severity: 'warning', path: at, message: `text style "${e.style}" is not defined (drawn as "Standard")` });
        }
        if ('style' in e && e.type !== 'text' && e.type !== 'mtext' && e.style !== null && !this.dimStyles.has(e.style)) {
          issues.push({ severity: 'error', path: at, message: `dimension style "${e.style}" is not defined` });
        }
        if (e.type === 'insert' && !this.blocks.has(e.block)) issues.push({ severity: 'error', path: at, message: `block "${e.block}" is not defined` });
        if (e.type === 'viewport') visit(e.entities, at);
      });
    };
    for (const s of this.sheetList) visit(s.entities, `sheet "${s.id}"`);
    for (const b of this.blocks) visit(b.entities, `block "${b.name}"`);
    for (const name of this.textStyles.missingFonts()) issues.push({ severity: 'error', path: 'textStyles', message: `text style "${name}" uses a font that is not registered` });
    for (const name of this.dimStyles.missingTextStyles()) issues.push({ severity: 'error', path: 'dimStyles', message: `dimension style "${name}" uses a text style that is not registered` });
    return issues;
  }

  /** Блоки, которые реально используются листами (рекурсивно). */
  usedBlocks(): string[] {
    const out = new Map<string, string>();
    const add = (names: string[]): void => {
      for (const n of names) {
        if (out.has(n.toLowerCase())) continue;
        out.set(n.toLowerCase(), this.blocks.get(n)?.name ?? n);
        add(this.blocks.dependencies(n).concat());
      }
    };
    for (const s of this.sheetList) add(referencedBlocks(s.entities));
    return [...out.values()];
  }

  toJSON(): CadDocumentJSON {
    return {
      format: 'cad-blueprint',
      version: 1,
      settings: this.settingsValue,
      fonts: this.fonts.toJSON(),
      textStyles: this.textStyles.toJSON(),
      dimStyles: this.dimStyles.toJSON(),
      layers: this.layers.toJSON(),
      blocks: this.blocks.toJSON(),
      sheets: this.sheetList.map((s) => s.toJSON()),
    };
  }

  /** Восстанавливает документ из `toJSON()` с полной проверкой. */
  static fromJSON(raw: unknown): CadDocument {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) throw new CadDocumentError('document', 'must be an object');
    const r = raw as Record<string, unknown>;
    if (r['format'] !== 'cad-blueprint') throw new CadDocumentError('format', `must be "cad-blueprint", got ${String(r['format'])}`);
    if (r['version'] !== 1) throw new CadDocumentError('version', `unsupported version ${String(r['version'])}`);
    const fonts = FontManager.fromJSON(r['fonts']);
    const textStyles = TextStyleTable.fromJSON(fonts, r['textStyles']);
    const dimStyles = DimStyleTable.fromJSON(textStyles, r['dimStyles']);
    const sheetsRaw = r['sheets'];
    if (!Array.isArray(sheetsRaw)) throw new CadDocumentError('sheets', 'must be an array');
    const sheets = sheetsRaw.map((s, i) => {
      if (typeof s !== 'object' || s === null) throw new CadDocumentError(`sheets[${i}]`, 'must be an object');
      const sr = s as Record<string, unknown>;
      return new CadSheet(String(sr['id']), String(sr['name']), parseEntities(sr['entities'], `sheets[${i}].entities`));
    });
    return CadDocument.fromParts({
      settings: parseDrawingSettings(r['settings']),
      dimStyles,
      layers: LayerManager.fromJSON(r['layers']),
      blocks: BlockTable.fromJSON(r['blocks']),
      sheets,
    });
  }
}
