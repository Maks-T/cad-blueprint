import { parseEntity } from '../entities/parse';
import type { Entity } from '../entities/types';
import { pointOf } from '../primitives/common';
import { assertBlockName, blockKey, defineBlock, referencedBlocks } from './block';
import { CadBlockError } from './errors';
import type { CadBlock, CadBlockInit } from './types';

export type BlockChange =
  | { readonly type: 'define'; readonly block: CadBlock }
  | { readonly type: 'redefine'; readonly block: CadBlock; readonly previous: CadBlock }
  | { readonly type: 'delete'; readonly block: CadBlock };

export type BlockChangeListener = (change: BlockChange) => void;

/** Сериализуемый вид блока. */
export interface CadBlockJSON {
  readonly name: string;
  readonly basePoint: readonly [number, number];
  readonly entities: readonly unknown[];
  readonly description?: string | null;
}

/**
 * Таблица блоков (секция BLOCKS в DXF): имена регистронезависимы, порядок — порядок определения.
 * Защищает от циклов: блок не может прямо или через другие блоки вставлять сам себя.
 * Ссылки на ещё не определённые блоки допустимы (их список — `missingBlocks()`), но рендерер на них остановится.
 */
export class BlockTable implements Iterable<CadBlock> {
  private readonly blocks = new Map<string, CadBlock>();
  private readonly listeners = new Set<BlockChangeListener>();

  constructor(blocks: Iterable<CadBlock> = []) {
    for (const b of blocks) this.add(b);
  }

  get size(): number {
    return this.blocks.size;
  }

  has(name: string): boolean {
    return this.blocks.has(blockKey(name));
  }

  get(name: string): CadBlock | undefined {
    return this.blocks.get(blockKey(name));
  }

  require(name: string): CadBlock {
    const b = this.get(name);
    if (!b) throw new CadBlockError(name, 'block is not defined');
    return b;
  }

  list(): CadBlock[] {
    return [...this.blocks.values()];
  }

  names(): string[] {
    return this.list().map((b) => b.name);
  }

  [Symbol.iterator](): Iterator<CadBlock> {
    return this.blocks.values();
  }

  /** Определяет новый блок. Бросает, если блок с таким именем уже есть. */
  define(name: string, entities: readonly Entity[], init: CadBlockInit = {}): CadBlock {
    if (this.has(name)) throw new CadBlockError(name, 'block already exists (use redefine)');
    return this.add(defineBlock(name, entities, init));
  }

  /** Добавляет готовое определение (например, из `parseDxfToBlock`). */
  add(block: CadBlock): CadBlock {
    const checked = defineBlock(block.name, block.entities, { basePoint: block.basePoint, description: block.description });
    if (this.has(checked.name)) throw new CadBlockError(checked.name, 'block already exists (use redefine)');
    this.assertNoCycle(checked);
    this.blocks.set(blockKey(checked.name), checked);
    this.emit({ type: 'define', block: checked });
    return checked;
  }

  /** Заменяет содержимое существующего блока; все вставки сразу показывают новое содержимое. */
  redefine(name: string, entities: readonly Entity[], init: CadBlockInit = {}): CadBlock {
    const previous = this.require(name);
    const block = defineBlock(previous.name, entities, {
      basePoint: init.basePoint ?? previous.basePoint,
      description: init.description === undefined ? previous.description : init.description,
    });
    this.assertNoCycle(block);
    this.blocks.set(blockKey(previous.name), block);
    this.emit({ type: 'redefine', block, previous });
    return block;
  }

  /** Удаляет блок. Бросает, если его вставляют другие блоки таблицы (вставки на листах документ проверяет сам). */
  delete(name: string): void {
    const block = this.require(name);
    const users = this.list().filter((b) => b !== block && referencedBlocks(b.entities).some((r) => blockKey(r) === blockKey(name)));
    if (users.length > 0) {
      throw new CadBlockError(block.name, `is used by block(s) ${users.map((b) => `"${b.name}"`).join(', ')}`);
    }
    this.blocks.delete(blockKey(name));
    this.emit({ type: 'delete', block });
  }

  /** Все блоки, которые вставляет блок `name` (рекурсивно), без него самого. */
  dependencies(name: string): string[] {
    const seen = new Map<string, string>();
    const visit = (n: string): void => {
      const b = this.get(n);
      if (!b) return;
      for (const r of referencedBlocks(b.entities)) {
        if (seen.has(blockKey(r))) continue;
        seen.set(blockKey(r), this.get(r)?.name ?? r);
        visit(r);
      }
    };
    visit(name);
    seen.delete(blockKey(name));
    return [...seen.values()];
  }

  /** Блоки, на которые есть ссылки, но которые не определены. */
  missingBlocks(): string[] {
    const out = new Map<string, string>();
    for (const b of this.blocks.values()) {
      for (const r of referencedBlocks(b.entities)) if (!this.has(r)) out.set(blockKey(r), r);
    }
    return [...out.values()];
  }

  /** Порядок «сначала зависимости» — для DXF (секция BLOCKS) и для `<defs>` в SVG. */
  topologicalOrder(): CadBlock[] {
    const out: CadBlock[] = [];
    const done = new Set<string>();
    const visit = (b: CadBlock): void => {
      if (done.has(blockKey(b.name))) return;
      done.add(blockKey(b.name));
      for (const r of referencedBlocks(b.entities)) {
        const dep = this.get(r);
        if (dep) visit(dep);
      }
      out.push(b);
    };
    for (const b of this.blocks.values()) visit(b);
    return out;
  }

  onChange(listener: BlockChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  toJSON(): CadBlockJSON[] {
    return this.list().map((b) => ({
      name: b.name,
      basePoint: [b.basePoint[0], b.basePoint[1]],
      entities: b.entities,
      ...(b.description === null ? {} : { description: b.description }),
    }));
  }

  /** Восстанавливает таблицу из `toJSON()` с полной проверкой объектов. */
  static fromJSON(raw: unknown): BlockTable {
    if (!Array.isArray(raw)) throw new CadBlockError('blocks', 'must be an array of block definitions');
    const table = new BlockTable();
    // Сначала проверяем все определения, затем добавляем в порядке зависимостей (ссылки вперёд допустимы).
    const parsed = raw.map((item, i) => parseBlockJSON(item, `blocks[${i}]`));
    for (const b of parsed) table.add(b);
    return table;
  }

  private assertNoCycle(block: CadBlock): void {
    const key = blockKey(block.name);
    const stack = new Set<string>();
    const visit = (names: string[], path: string[]): void => {
      for (const n of names) {
        const k = blockKey(n);
        if (k === key) throw new CadBlockError(block.name, `circular block reference: ${[...path, n].join(' → ')}`);
        if (stack.has(k)) continue;
        stack.add(k);
        const b = this.get(n);
        if (b) visit(referencedBlocks(b.entities), [...path, n]);
      }
    };
    visit(referencedBlocks(block.entities), [block.name]);
  }

  private emit(change: BlockChange): void {
    for (const l of [...this.listeners]) l(change);
  }
}

export function parseBlockJSON(raw: unknown, field = 'block'): CadBlock {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) throw new CadBlockError(field, 'must be an object');
  const r = raw as Record<string, unknown>;
  assertBlockName(r['name'], `${field}.name`);
  if (!Array.isArray(r['entities'])) throw new CadBlockError(`${field}.entities`, 'must be an array');
  const entities = (r['entities'] as unknown[]).map((e, i) => parseEntity(e, `${field}.entities[${i}]`));
  return defineBlock(r['name'] as string, entities, {
    basePoint: pointOf(r['basePoint'] ?? [0, 0], `${field}.basePoint`),
    description: (r['description'] as string | null | undefined) ?? null,
  });
}
