import { describe, expect, it } from 'vitest';
import {
  BlockTable,
  CadBlockError,
  CadDocument,
  applyToPoint,
  arc,
  blockBounds,
  circle,
  createRenderContext,
  defineBlock,
  dimLinear,
  entitiesBounds,
  insert,
  insertMatrix,
  line,
  rect,
  referencedBlocks,
  text,
  viewport,
  viewportContext,
  viewportMatrix,
  walkEntities,
} from '../src';
import type { Bounds } from '../src';

const closeBounds = (b: Bounds, e: [number, number, number, number], digits = 6): void => {
  expect(Number.isFinite(b.minX)).toBe(true);
  [b.minX, b.minY, b.maxX, b.maxY].forEach((v, i) => expect(v).toBeCloseTo(e[i] as number, digits));
};

describe('blocks: definition and table (шаг 3.2.1)', () => {
  it('defines a block with a base point; names are case-insensitive', () => {
    const t = new BlockTable();
    const b = t.define('Ступень', [rect(0, 0, 300, 40)], { basePoint: [150, 0], description: 'проступь' });
    expect(t.get('ступень')).toBe(b);
    expect(b.basePoint).toEqual([150, 0]);
    expect(() => t.define('СТУПЕНЬ', [])).toThrow(/already exists/);
    expect(() => defineBlock('*Model_Space', [])).toThrow(/forbidden/);
    expect(() => defineBlock('B', [{ type: 'line' } as never])).toThrow(/factory/);
  });

  it('rejects direct and indirect cycles; reports dependencies and missing blocks', () => {
    const t = new BlockTable();
    t.define('A', [insert('B')]);
    t.define('B', [insert('C'), line([0, 0], [1, 1])]);
    expect(t.missingBlocks()).toEqual(['C']);
    expect(() => t.define('C', [insert('A')])).toThrow(/circular/);
    t.define('C', [circle([0, 0], 1)]);
    expect(t.dependencies('A')).toEqual(['B', 'C']);
    expect(t.topologicalOrder().map((b) => b.name)).toEqual(['C', 'B', 'A']);
    expect(() => t.delete('C')).toThrow(/used by/);
    expect(() => t.redefine('C', [insert('A')])).toThrow(/circular/);
  });

  it('JSON round trip validates entities', () => {
    const t = new BlockTable();
    t.define('A', [line([0, 0], [10, 0], { layer: 'X' }), insert('A2', [5, 5], { rotationDeg: 90 })]);
    t.define('A2', [arc([0, 0], 5, 0, 90)]);
    const back = BlockTable.fromJSON(JSON.parse(JSON.stringify(t)));
    expect(back.names()).toEqual(['A', 'A2']);
    expect(back.get('A')!.entities).toEqual(t.get('A')!.entities);
    expect(() => BlockTable.fromJSON([{ name: 'X', entities: [{ type: 'circle', center: [0, 0], radius: -1 }] }])).toThrow(/radius/);
  });
});

describe('blocks: inserts (шаг 3.2.2)', () => {
  it('matrix = T(position) · R · S · T(−basePoint), mirror via negative scale', () => {
    const m = insertMatrix(insert('B', [100, 50], { rotationDeg: 90, scaleX: -2, scaleY: 2 }), { basePoint: [10, 0] });
    const p = applyToPoint(m, [20, 0]); // (20 − 10) · (−2) = −20 по X, затем поворот на 90° → (0, −20)
    expect(p[0]).toBeCloseTo(100);
    expect(p[1]).toBeCloseTo(30);
    expect(() => insert('B', [0, 0], { scale: 0 })).toThrow(/must not be 0/);
    expect(() => insert('B', [0, 0], { scale: 2, scaleX: 1 })).toThrow(/not both/);
  });

  it('entities on layer "0" inside a block take the insert layer', () => {
    const blocks = new BlockTable();
    blocks.define('B', [line([0, 0], [1, 0]), line([0, 0], [0, 1], { layer: 'Оси' })]);
    const ctx = createRenderContext({ blocks });
    ctx.layers.create('Контур');
    ctx.layers.create('Оси');
    const seen: string[] = [];
    walkEntities([insert('B', [0, 0], { layer: 'Контур' })], ctx, { primitive: (_e, layer) => seen.push(layer.name) });
    expect(seen).toEqual(['Контур', 'Оси']);
    expect(referencedBlocks([insert('B'), viewport([insert('C')])])).toEqual(['B', 'C']);
  });

  it('bounds of rotated / mirrored inserts', () => {
    const blocks = new BlockTable();
    blocks.define('R', [rect(0, 0, 100, 50)]);
    const ctx = createRenderContext({ blocks });
    closeBounds(entitiesBounds([insert('R', [1000, 0], { rotationDeg: 90 })], ctx), [950, 0, 1000, 100]);
    closeBounds(entitiesBounds([insert('R', [0, 0], { scaleX: -1 })], ctx), [-100, 0, 0, 50]);
    closeBounds(blockBounds('R', ctx), [0, 0, 100, 50]);
  });

  it('missing blocks stop the walker with a clear error', () => {
    expect(() => entitiesBounds([insert('Нет')], createRenderContext())).toThrow(CadBlockError);
  });
});

describe('blocks: viewports (шаг 3.2.3)', () => {
  it('own scale: geometry scaled by k = scale(vp) / scale(doc), annotations keep their paper size', () => {
    const doc = new CadDocument({ gost: true, settings: { scale: '1:10' } });
    const ctx = doc.context();
    const vp = viewport([rect(0, 0, 100, 40), text([0, 0], 'X', { height: 5 })], { position: [0, -1000], scale: '1:2' });
    const m = viewportMatrix(vp, ctx.drawing);
    expect(applyToPoint(m, [100, 0])).toEqual([500, -1000]);
    const inner = viewportContext(ctx, vp);
    expect(inner.drawing.annotationToModel(5)).toBeCloseTo(10); // 5 мм при 1:2 = 10 ед. экрана
    expect(ctx.drawing.annotationToModel(5)).toBeCloseTo(50); //  …и 50 ед. листа = те же 5 мм
    // Текст высотой 5 мм внутри экрана после масштаба k = 5 даёт 50 ед. листа.
    const b = entitiesBounds([viewport([text([0, 0], 'X', { height: 5 })], { scale: '1:2' })], ctx);
    expect(b.maxY - b.minY).toBeCloseTo(50, 6);
  });

  it('clip limits the bounds; title is placed above the content', () => {
    const ctx = createRenderContext({ settings: { scale: '1:1' } });
    const vp = viewport([rect(-500, -500, 1000, 1000)], { clip: { minX: 0, minY: 0, maxX: 10, maxY: 10 }, frame: true });
    closeBounds(entitiesBounds([vp], ctx), [0, 0, 10, 10]);
    const titled = viewport([rect(0, 0, 10, 10)], { title: 'А–А' });
    const b = entitiesBounds([titled], ctx);
    expect(b.maxY).toBeGreaterThan(10 + 3);
    expect(() => viewport([], { frame: true })).toThrow(/needs "clip"/);
  });

  it('dimensions inside a viewport use the viewport scale', () => {
    const doc = new CadDocument({ gost: true, settings: { scale: '1:10' } });
    const vp = viewport([dimLinear([0, 0], [100, 0], { offset: -10 })], { scale: '1:1' });
    const b = entitiesBounds([vp], doc.context());
    // Внутри 1:1 выпуск выносной 2 мм = 2 ед., после k = 10 → 20 ед. листа ниже линии (−10·10 − 20 = −120).
    expect(b.minY).toBeCloseTo(-120, 6);
  });
});

describe('document', () => {
  it('sheets, audit and verbose JSON round trip', () => {
    const doc = new CadDocument({ gost: true });
    doc.layers.create('Контур');
    doc.blocks.define('B', [line([0, 0], [1, 1], { layer: 'Нет' })]);
    const s = doc.addSheet('Фасад', [rect(0, 0, 10, 10, { layer: 'Контур', id: 'r1' }), insert('B'), insert('Нет такого'), text([0, 0], 'x', { style: 'Missing' })]);
    expect(s.id).toBe('sheet-1');
    expect(doc.addSheet('Разрез').id).toBe('sheet-2');
    const issues = doc.audit();
    expect(issues.map((i) => i.severity)).toEqual(['error', 'warning', 'warning']);
    expect(s.find('r1')?.type).toBe('rect');
    expect(s.remove('r1')).toBe(1);
    const back = CadDocument.fromJSON(JSON.parse(JSON.stringify(doc)));
    expect(JSON.stringify(back)).toBe(JSON.stringify(doc));
    expect(back.textStyles.current.name).toBe('GOST');
    expect(doc.usedBlocks()).toEqual(['B', 'Нет такого']);
  });

  it('document scale drives annotation scale unless set explicitly', () => {
    expect(new CadDocument({ settings: { scale: '1:50' } }).drawing.annotationFactor).toBeCloseTo(0.02);
    expect(new CadDocument({ settings: { scale: '1:50', annotationScale: '1:1' } }).drawing.annotationFactor).toBe(1);
  });
});
