import { CadLayerError } from './errors';
import { ZERO_LAYER_NAME, assertLayerName, buildLayer, layerKey } from './layer';
import type { Layer, LayerDefinition, LayerPatch } from './layer';

export type LayerChange =
  | { readonly type: 'create'; readonly layer: Layer }
  | { readonly type: 'update'; readonly layer: Layer; readonly previous: Layer }
  | { readonly type: 'rename'; readonly layer: Layer; readonly previous: Layer }
  | { readonly type: 'delete'; readonly layer: Layer }
  | { readonly type: 'current'; readonly layer: Layer };

export type LayerChangeListener = (change: LayerChange) => void;

/** Сериализуемое состояние реестра. */
export interface LayerManagerJSON {
  readonly current: string;
  readonly layers: readonly Layer[];
}

/**
 * Реестр слоёв (аналог таблицы LAYER в AutoCAD).
 *
 * - Слой `"0"` существует всегда; его нельзя удалить или переименовать.
 * - Имена регистронезависимы (`Walls` и `walls` — один слой), регистр сохраняется как при создании.
 * - Порядок слоёв — порядок создания (переименование его не меняет).
 * - Объекты `Layer` неизменяемы; любое изменение возвращает новый объект.
 *
 * Проверка «слой используется объектами» относится к документу (стадии 3–4), а не к реестру.
 */
export class LayerManager implements Iterable<Layer> {
  private readonly layers = new Map<string, Layer>();
  private readonly listeners = new Set<LayerChangeListener>();
  private currentKey = layerKey(ZERO_LAYER_NAME);

  constructor(definitions: Iterable<LayerDefinition> = []) {
    this.layers.set(layerKey(ZERO_LAYER_NAME), buildLayer(ZERO_LAYER_NAME));
    for (const def of definitions) {
      const { name, ...props } = def;
      if (layerKey(name) === layerKey(ZERO_LAYER_NAME)) {
        this.layers.set(layerKey(name), buildLayer(ZERO_LAYER_NAME, props, this.requireKey(layerKey(name))));
      } else {
        this.layers.set(layerKey(name), this.assertNew(name, props));
      }
    }
  }

  get size(): number {
    return this.layers.size;
  }

  /** Текущий слой — на нём строятся новые объекты, если слой не указан явно. */
  get current(): Layer {
    return this.requireKey(this.currentKey);
  }

  has(name: string): boolean {
    return this.layers.has(layerKey(name));
  }

  get(name: string): Layer | undefined {
    return this.layers.get(layerKey(name));
  }

  /** Как `get`, но бросает `CadLayerError`, если слоя нет. */
  require(name: string): Layer {
    return this.requireKey(layerKey(name), name);
  }

  list(): Layer[] {
    return [...this.layers.values()];
  }

  names(): string[] {
    return this.list().map((l) => l.name);
  }

  [Symbol.iterator](): Iterator<Layer> {
    return this.layers.values();
  }

  /** Создаёт слой. Бросает, если слой с таким именем (без учёта регистра) уже есть. */
  create(name: string, props: LayerPatch = {}): Layer {
    const layer = this.assertNew(name, props);
    this.layers.set(layerKey(name), layer);
    this.emit({ type: 'create', layer });
    return layer;
  }

  /** Изменяет свойства слоя; возвращает новый объект слоя. */
  update(name: string, patch: LayerPatch): Layer {
    const previous = this.require(name);
    const layer = buildLayer(previous.name, patch, previous);
    this.layers.set(layerKey(previous.name), layer);
    this.emit({ type: 'update', layer, previous });
    return layer;
  }

  /** Переименовывает слой (кроме `"0"`). Допускается смена только регистра. Порядок и текущий слой сохраняются. */
  rename(name: string, newName: string): Layer {
    const previous = this.require(name);
    assertLayerName(newName, 'newName');
    if (layerKey(previous.name) === layerKey(ZERO_LAYER_NAME)) {
      throw new CadLayerError(previous.name, 'layer "0" cannot be renamed');
    }
    const oldKey = layerKey(previous.name);
    const newKey = layerKey(newName);
    if (newKey !== oldKey && this.layers.has(newKey)) {
      throw new CadLayerError('newName', `layer "${newName}" already exists`);
    }
    const layer = buildLayer(newName, {}, previous);

    const rebuilt = new Map<string, Layer>();
    for (const [key, value] of this.layers) {
      if (key === oldKey) rebuilt.set(newKey, layer);
      else rebuilt.set(key, value);
    }
    this.layers.clear();
    for (const [key, value] of rebuilt) this.layers.set(key, value);
    if (this.currentKey === oldKey) this.currentKey = newKey;

    this.emit({ type: 'rename', layer, previous });
    return layer;
  }

  /** Копия слоя под новым именем; `patch` переопределяет свойства копии. */
  clone(name: string, newName: string, patch: LayerPatch = {}): Layer {
    const source = this.require(name);
    assertLayerName(newName, 'newName');
    if (this.has(newName)) {
      throw new CadLayerError('newName', `layer "${newName}" already exists`);
    }
    const layer = buildLayer(newName, patch, source);
    this.layers.set(layerKey(newName), layer);
    this.emit({ type: 'create', layer });
    return layer;
  }

  /** Удаляет слой. Нельзя удалить `"0"` и текущий слой. */
  delete(name: string): void {
    const layer = this.require(name);
    const key = layerKey(layer.name);
    if (key === layerKey(ZERO_LAYER_NAME)) {
      throw new CadLayerError(layer.name, 'layer "0" cannot be deleted');
    }
    if (key === this.currentKey) {
      throw new CadLayerError(layer.name, 'the current layer cannot be deleted; switch to another layer first');
    }
    this.layers.delete(key);
    this.emit({ type: 'delete', layer });
  }

  setCurrent(name: string): Layer {
    const layer = this.require(name);
    this.currentKey = layerKey(layer.name);
    this.emit({ type: 'current', layer });
    return layer;
  }

  setVisible(name: string, visible: boolean): Layer {
    return this.update(name, { visible });
  }

  setLocked(name: string, locked: boolean): Layer {
    return this.update(name, { locked });
  }

  /** Оставляет видимым только указанный слой (остальные скрываются). */
  isolate(name: string): void {
    const target = this.require(name);
    for (const layer of this.list()) {
      const visible = layer.name === target.name;
      if (layer.visible !== visible) this.update(layer.name, { visible });
    }
  }

  /** Включает видимость всех слоёв. */
  showAll(): void {
    for (const layer of this.list()) {
      if (!layer.visible) this.update(layer.name, { visible: true });
    }
  }

  /** Подписка на изменения; возвращает функцию отписки. */
  onChange(listener: LayerChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  toJSON(): LayerManagerJSON {
    return { current: this.current.name, layers: this.list() };
  }

  /** Восстанавливает реестр из `toJSON()` (или из БД) с полной валидацией. */
  static fromJSON(raw: unknown): LayerManager {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
      throw new CadLayerError('layers', 'must be an object { current, layers }');
    }
    const { current, layers } = raw as { current?: unknown; layers?: unknown };
    if (!Array.isArray(layers)) {
      throw new CadLayerError('layers', 'must be an array of layer definitions');
    }
    const manager = new LayerManager(layers as LayerDefinition[]);
    if (current !== undefined) {
      if (typeof current !== 'string') throw new CadLayerError('current', 'must be a string');
      manager.setCurrent(current);
    }
    return manager;
  }

  private requireKey(key: string, display = key): Layer {
    const layer = this.layers.get(key);
    if (!layer) throw new CadLayerError(display, 'layer not found');
    return layer;
  }

  private assertNew(name: string, props: LayerPatch): Layer {
    assertLayerName(name);
    if (this.layers.has(layerKey(name))) {
      throw new CadLayerError(name, 'layer already exists');
    }
    return buildLayer(name, props);
  }

  private emit(change: LayerChange): void {
    for (const listener of [...this.listeners]) listener(change);
  }
}
