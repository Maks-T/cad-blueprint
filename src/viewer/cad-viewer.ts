import { CadDocument } from '../document/document';
import { exportDxf } from '../dxf/export';
import type { DxfExportOptions } from '../dxf/export';
import { CadError } from '../errors';
import { decodeDocument } from '../format/json-codec';
import type { CompactDocument } from '../format/json-codec';
import { packVcad, unpackVcad } from '../format/zip-codec';
import { LayerManager } from '../layers';
import { renderEntitiesToSvg } from '../svg/render';
import type { SvgRenderResult } from '../svg/render';
import { fitViewBox, panBy, resizeViewBox, screenToSvg, svgToModel, zoomAt } from './view-transform';
import type { ViewBox, ViewportSize } from './view-transform';

/** Источник чертежа: документ, компактный JSON (объект или строка — например, из БД Laravel) или байты `.vcad`. */
export type CadViewerSource = CadDocument | CompactDocument | string | Uint8Array | ArrayBuffer;

export interface CadViewerOptions {
  /** Лист (id или имя); по умолчанию первый. */
  sheet?: string;
  /** Фон области просмотра (CSS-цвет, в т. ч. `transparent`). По умолчанию `#ffffff`. */
  background?: string;
  /**
   * «Лист бумаги» под чертежом: цвет прямоугольника по габариту с полями `settings.padding` (классы `cad-paper` и `<prefix>-paper`
   * для CSS-тени и рамки). По умолчанию нет — чертёж прямо на фоне `background`.
   */
  paper?: string;
  /** Поля при «вписать в окно», пиксели. По умолчанию 16. */
  fitMargin?: number;
  /** Пределы зума относительно «вписать в окно». По умолчанию 0.05 … 200. */
  minZoom?: number;
  maxZoom?: number;
  /** Шаг зума колесом. По умолчанию 1.2. */
  wheelFactor?: number;
  /** Встроенная панель: «вписать», «+», «−», SVG, DXF. По умолчанию `false` (только API). */
  toolbar?: boolean;
  /** Имя файла для скачивания (без расширения). По умолчанию `drawing`. */
  fileName?: string;
  /** Параметры DXF при скачивании. */
  dxf?: DxfExportOptions;
}

export interface CadViewerLayer {
  readonly name: string;
  readonly color: string;
  readonly visible: boolean;
}

export type CadViewerEvent =
  | { readonly type: 'render' }
  | { readonly type: 'view'; readonly viewBox: ViewBox; readonly zoom: number }
  | { readonly type: 'layers'; readonly layers: readonly CadViewerLayer[] }
  /** Клик по объекту с `id` (атрибут `data-id`); `point` — координаты модели. */
  | { readonly type: 'select'; readonly id: string | null; readonly layer: string | null; readonly point: readonly [number, number] };

export type CadViewerListener = (event: CadViewerEvent) => void;

let instanceCounter = 0;

function toDocument(source: CadViewerSource): CadDocument {
  if (source instanceof CadDocument) return source;
  if (source instanceof Uint8Array || source instanceof ArrayBuffer) {
    const unpacked = unpackVcad(source);
    if (!unpacked.document) throw new CadError('viewer', 'the .vcad file is a block library without sheets');
    return unpacked.document;
  }
  return decodeDocument(source);
}

/**
 * Интерактивный просмотр чертежа: панорамирование (левая / средняя кнопка, одним пальцем), зум колесом к курсору
 * и щипком, двойной клик — «вписать в окно», видимость слоёв, скачивание SVG / DXF.
 * Подходит для фронтенд-конфигураторов и панели Filament (см. `mountCadViewer`).
 */
export class CadViewer {
  readonly element: HTMLDivElement;
  private readonly stage: HTMLDivElement;
  private readonly layerStyle: HTMLStyleElement;
  private svg: SVGSVGElement | null = null;
  private doc: CadDocument;
  private sheetId: string | undefined;
  private result: SvgRenderResult | null = null;
  private view: ViewBox = { x: 0, y: 0, width: 1, height: 1 };
  private fitView: ViewBox = { x: 0, y: 0, width: 1, height: 1 };
  private size: ViewportSize = { width: 1, height: 1 };
  private readonly visibility = new Map<string, boolean>();
  private readonly listeners = new Set<CadViewerListener>();
  private readonly pointers = new Map<number, { x: number; y: number }>();
  private pinchDistance = 0;
  private dragMoved = false;
  private readonly prefix: string;
  private resizeObserver: { disconnect(): void } | null = null;
  private readonly cleanup: (() => void)[] = [];

  constructor(
    readonly container: HTMLElement,
    source: CadViewerSource,
    private readonly options: CadViewerOptions = {},
  ) {
    instanceCounter += 1;
    this.prefix = `cbv${instanceCounter}`;
    this.doc = toDocument(source);
    this.sheetId = options.sheet;
    const d = container.ownerDocument;
    this.element = d.createElement('div');
    this.element.className = 'cad-viewer';
    this.element.style.cssText = `position:relative;width:100%;height:100%;overflow:hidden;touch-action:none;user-select:none;background:${options.background ?? '#ffffff'}`;
    this.stage = d.createElement('div');
    this.stage.style.cssText = 'position:absolute;inset:0;cursor:grab';
    this.layerStyle = d.createElement('style');
    this.element.append(this.layerStyle, this.stage);
    if (options.toolbar) this.element.append(this.buildToolbar());
    container.append(this.element);
    this.bindEvents();
    this.render();
  }

  /** Текущий документ. После его изменения вызовите `render()`. */
  get document(): CadDocument {
    return this.doc;
  }

  /** Текущий лист (id). */
  get sheet(): string {
    return this.doc.requireSheet(this.sheetId).id;
  }

  get viewBox(): ViewBox {
    return this.view;
  }

  /** Зум относительно «вписать в окно» (1 — весь чертёж). */
  get zoom(): number {
    return this.fitView.width / this.view.width;
  }

  setDocument(source: CadViewerSource, options: { keepView?: boolean } = {}): void {
    this.doc = toDocument(source);
    this.visibility.clear();
    this.render(options);
  }

  setSheet(sheet: string): void {
    this.doc.requireSheet(sheet);
    this.sheetId = sheet;
    this.render();
  }

  /** Перерисовывает чертёж (например, после изменения параметров изделия). `keepView` — не сбрасывать зум. */
  render(options: { keepView?: boolean } = {}): void {
    const sheet = this.doc.requireSheet(this.sheetId);
    this.result = renderEntitiesToSvg(sheet.entities, this.doc.context(), {
      size: 'none',
      hiddenLayers: 'hide',
      idPrefix: this.prefix,
      padding: this.options.paper !== undefined,
      background: this.options.paper ?? null,
    });
    this.svg = this.mountSvg(this.result.svg);
    if (this.svg) {
      this.svg.setAttribute('width', '100%');
      this.svg.setAttribute('height', '100%');
      this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      this.svg.style.display = 'block';
    }
    this.measure();
    const keep = options.keepView === true && this.view.width > 0;
    this.fitView = fitViewBox(this.result.viewBox, this.size, this.options.fitMargin ?? 16);
    if (!keep) this.view = this.fitView;
    this.applyLayerStyle();
    this.applyView();
    this.emit({ type: 'render' });
  }

  fitToView(): void {
    this.measure();
    if (this.result) this.fitView = fitViewBox(this.result.viewBox, this.size, this.options.fitMargin ?? 16);
    this.view = this.fitView;
    this.applyView();
  }

  /** Зум в `factor` раз относительно центра окна (или точки экрана `at`). */
  zoomBy(factor: number, at?: { x: number; y: number }): void {
    const target = this.clampZoom(this.zoom * factor) / this.zoom;
    if (!Number.isFinite(target) || target === 1) return;
    this.view = zoomAt(this.view, this.size, target, at?.x ?? this.size.width / 2, at?.y ?? this.size.height / 2);
    this.applyView();
  }

  zoomIn(): void {
    this.zoomBy(this.options.wheelFactor ?? 1.2);
  }

  zoomOut(): void {
    this.zoomBy(1 / (this.options.wheelFactor ?? 1.2));
  }

  /** Слои документа с видимостью в этом окне просмотра. */
  layers(): CadViewerLayer[] {
    return this.doc.layers.list().map((l) => ({ name: l.name, color: l.color, visible: this.visibility.get(l.name.toLowerCase()) ?? l.visible }));
  }

  /** Показать / скрыть слой только в этом окне (документ не меняется). */
  setLayerVisible(name: string, visible: boolean): void {
    const layer = this.doc.layers.require(name);
    this.visibility.set(layer.name.toLowerCase(), visible);
    this.applyLayerStyle();
    this.emit({ type: 'layers', layers: this.layers() });
  }

  toggleLayer(name: string): boolean {
    const current = this.layers().find((l) => l.name.toLowerCase() === name.toLowerCase());
    const next = !(current?.visible ?? true);
    this.setLayerVisible(name, next);
    return next;
  }

  isolateLayer(name: string): void {
    const target = this.doc.layers.require(name).name.toLowerCase();
    for (const l of this.doc.layers) this.visibility.set(l.name.toLowerCase(), l.name.toLowerCase() === target);
    this.applyLayerStyle();
    this.emit({ type: 'layers', layers: this.layers() });
  }

  showAllLayers(): void {
    for (const l of this.doc.layers) this.visibility.set(l.name.toLowerCase(), true);
    this.applyLayerStyle();
    this.emit({ type: 'layers', layers: this.layers() });
  }

  /** Таблица слоёв с видимостью окна (для экспорта «как на экране»). */
  private exportLayers(): LayerManager {
    const copy = LayerManager.fromJSON(JSON.parse(JSON.stringify(this.doc.layers)));
    for (const l of copy.list()) {
      const v = this.visibility.get(l.name.toLowerCase());
      if (v !== undefined && v !== l.visible) copy.update(l.name, { visible: v });
    }
    return copy;
  }

  /** SVG для печати / сохранения: размеры в мм бумаги, скрытые в окне слои не выводятся. */
  toSvgString(): string {
    const sheet = this.doc.requireSheet(this.sheetId);
    return renderEntitiesToSvg(sheet.entities, { ...this.doc.context(), layers: this.exportLayers() }, { background: '#ffffff' }).svg;
  }

  /** DXF; скрытые в окне слои записываются выключенными. */
  toDxfString(): string {
    const sheet = this.doc.requireSheet(this.sheetId);
    const doc = CadDocument.fromParts({ settings: this.doc.settings, dimStyles: this.doc.dimStyles, layers: this.exportLayers(), blocks: this.doc.blocks, sheets: [sheet] });
    return exportDxf(doc, this.options.dxf);
  }

  /** Весь документ (все листы и блоки) в `.vcad`; видимость слоёв окна в файл не попадает. */
  toVcadBytes(): Uint8Array {
    return packVcad(this.doc);
  }

  downloadVcad(fileName = this.options.fileName ?? 'drawing'): void {
    this.download(`${fileName}.vcad`, this.toVcadBytes(), 'application/zip');
  }

  downloadSvg(fileName = this.options.fileName ?? 'drawing'): void {
    this.download(`${fileName}.svg`, this.toSvgString(), 'image/svg+xml');
  }

  downloadDxf(fileName = this.options.fileName ?? 'drawing'): void {
    this.download(`${fileName}.dxf`, this.toDxfString(), 'application/dxf');
  }

  on(listener: CadViewerListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  destroy(): void {
    for (const fn of this.cleanup.splice(0)) fn();
    this.resizeObserver?.disconnect();
    this.listeners.clear();
    this.element.remove();
  }

  // -------------------------------------------------------------------------------------------------------------------

  private emit(event: CadViewerEvent): void {
    for (const l of [...this.listeners]) l(event);
  }

  /** Разбор как XML (`image/svg+xml`) — надёжнее `innerHTML` для `<style>` и `<symbol>` внутри SVG. */
  private mountSvg(markup: string): SVGSVGElement | null {
    const d = this.container.ownerDocument;
    const Parser = (d.defaultView as unknown as { DOMParser?: new () => { parseFromString(s: string, t: string): Document } } | null)?.DOMParser;
    if (Parser) {
      const parsed = new Parser().parseFromString(markup, 'image/svg+xml');
      const root = parsed.documentElement;
      if (root && root.nodeName.toLowerCase() === 'svg' && !parsed.getElementsByTagName('parsererror').length) {
        const node = d.importNode(root, true) as unknown as SVGSVGElement;
        this.stage.replaceChildren(node);
        return node;
      }
    }
    this.stage.innerHTML = markup;
    return this.stage.querySelector('svg');
  }

  private measure(): void {
    const r = this.stage.getBoundingClientRect();
    this.size = { width: r.width || this.container.clientWidth || 800, height: r.height || this.container.clientHeight || 600 };
  }

  private clampZoom(z: number): number {
    return Math.min(this.options.maxZoom ?? 200, Math.max(this.options.minZoom ?? 0.05, z));
  }

  private applyView(): void {
    if (!this.svg) return;
    const v = this.view;
    this.svg.setAttribute('viewBox', `${v.x} ${v.y} ${v.width} ${v.height}`);
    this.emit({ type: 'view', viewBox: v, zoom: this.zoom });
  }

  private applyLayerStyle(): void {
    if (!this.result) return;
    const rules: string[] = [];
    for (const [name, cls] of this.result.layerClasses) {
      const layer = this.doc.layers.get(name);
      const visible = this.visibility.get(name.toLowerCase()) ?? layer?.visible ?? true;
      rules.push(`.${this.prefix} .${cls}{display:${visible ? 'inline' : 'none'} !important}`);
    }
    this.layerStyle.textContent = rules.join('\n');
  }

  private download(name: string, content: string | Uint8Array, type: string): void {
    const d = this.container.ownerDocument;
    const view = d.defaultView as (Window & typeof globalThis) | null;
    if (!view) return;
    const url = view.URL.createObjectURL(new view.Blob([content as BlobPart], { type }));
    const a = d.createElement('a');
    a.href = url;
    a.download = name;
    a.style.display = 'none';
    d.body.append(a);
    a.click();
    a.remove();
    view.setTimeout(() => view.URL.revokeObjectURL(url), 1000);
  }

  private local(e: { clientX: number; clientY: number }): { x: number; y: number } {
    const r = this.stage.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  private listen<K extends keyof HTMLElementEventMap>(target: HTMLElement, type: K, fn: (e: HTMLElementEventMap[K]) => void, opts?: AddEventListenerOptions): void {
    target.addEventListener(type, fn as EventListener, opts);
    this.cleanup.push(() => target.removeEventListener(type, fn as EventListener, opts));
  }

  private bindEvents(): void {
    const stage = this.stage;
    this.listen(
      stage,
      'wheel',
      (e) => {
        e.preventDefault();
        const f = this.options.wheelFactor ?? 1.2;
        this.zoomBy(e.deltaY < 0 ? f : 1 / f, this.local(e));
      },
      { passive: false },
    );
    this.listen(stage, 'pointerdown', (e) => {
      if (e.button !== 0 && e.button !== 1) return;
      stage.setPointerCapture?.(e.pointerId);
      this.pointers.set(e.pointerId, this.local(e));
      this.dragMoved = false;
      if (this.pointers.size === 2) this.pinchDistance = this.currentPinch();
      stage.style.cursor = 'grabbing';
    });
    this.listen(stage, 'pointermove', (e) => {
      const prev = this.pointers.get(e.pointerId);
      if (!prev) return;
      const next = this.local(e);
      if (this.pointers.size === 1) {
        if (Math.abs(next.x - prev.x) + Math.abs(next.y - prev.y) > 0) this.dragMoved = true;
        this.view = panBy(this.view, this.size, next.x - prev.x, next.y - prev.y);
        this.pointers.set(e.pointerId, next);
        this.applyView();
      } else if (this.pointers.size === 2) {
        this.pointers.set(e.pointerId, next);
        const dist = this.currentPinch();
        const pts = [...this.pointers.values()];
        const center = { x: ((pts[0]?.x ?? 0) + (pts[1]?.x ?? 0)) / 2, y: ((pts[0]?.y ?? 0) + (pts[1]?.y ?? 0)) / 2 };
        if (this.pinchDistance > 0 && dist > 0) this.zoomBy(dist / this.pinchDistance, center);
        this.pinchDistance = dist;
        this.dragMoved = true;
      }
    });
    const end = (e: PointerEvent): void => {
      const wasDrag = this.dragMoved;
      this.pointers.delete(e.pointerId);
      if (this.pointers.size < 2) this.pinchDistance = 0;
      stage.style.cursor = 'grab';
      if (e.type === 'pointerup' && !wasDrag && this.pointers.size === 0) this.select(e);
    };
    this.listen(stage, 'pointerup', end);
    this.listen(stage, 'pointercancel', end);
    this.listen(stage, 'dblclick', () => this.fitToView());
    const RO = (this.container.ownerDocument.defaultView as unknown as { ResizeObserver?: new (cb: () => void) => { observe(el: Element): void; disconnect(): void } } | null)?.ResizeObserver;
    if (RO) {
      const ro = new RO(() => {
        const before = this.size;
        this.measure();
        if (before.width !== this.size.width || before.height !== this.size.height) {
          this.view = resizeViewBox(this.view, before, this.size);
          if (this.result) this.fitView = fitViewBox(this.result.viewBox, this.size, this.options.fitMargin ?? 16);
          this.applyView();
        }
      });
      ro.observe(this.stage);
      this.resizeObserver = ro;
    }
  }

  private currentPinch(): number {
    const [a, b] = [...this.pointers.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  }

  private select(e: PointerEvent): void {
    const target = e.target as Element | null;
    const hit = target?.closest?.('[data-id]') ?? null;
    const layerEl = target?.closest?.('[data-layer]') ?? null;
    const p = this.local(e);
    const [sx, sy] = screenToSvg(this.view, this.size, p.x, p.y);
    const flip = this.doc.settings.coordinateSystem === 'cartesian';
    this.emit({
      type: 'select',
      id: hit?.getAttribute('data-id') ?? null,
      layer: layerEl?.getAttribute('data-layer') ?? null,
      point: svgToModel(sx, sy, flip),
    });
  }

  private buildToolbar(): HTMLElement {
    const d = this.container.ownerDocument;
    const bar = d.createElement('div');
    bar.style.cssText =
      'position:absolute;top:8px;right:8px;display:flex;gap:4px;font:12px/1 system-ui,sans-serif;z-index:1';
    const button = (label: string, title: string, fn: () => void): HTMLButtonElement => {
      const b = d.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.title = title;
      b.style.cssText = 'padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;cursor:pointer';
      b.addEventListener('click', fn);
      return b;
    };
    bar.append(
      button('⤢', 'Вписать в окно', () => this.fitToView()),
      button('+', 'Приблизить', () => this.zoomIn()),
      button('−', 'Отдалить', () => this.zoomOut()),
      button('SVG', 'Скачать SVG', () => this.downloadSvg()),
      button('DXF', 'Скачать DXF', () => this.downloadDxf()),
    );
    for (const type of ['pointerdown', 'dblclick', 'wheel'] as const) bar.addEventListener(type, (e) => e.stopPropagation());
    return bar;
  }
}

/**
 * Быстрое подключение без сборщика (Filament / Blade + Alpine.js): `CadBlueprint.mountCadViewer(el, json, { toolbar: true })`.
 * `source` — компактный JSON из БД (строка или объект), документ или байты `.vcad`.
 */
export function mountCadViewer(element: HTMLElement, source: CadViewerSource, options: CadViewerOptions = {}): CadViewer {
  return new CadViewer(element, source, options);
}
