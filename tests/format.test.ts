import { strToU8, zipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import {
  CadDocument,
  CadFormatError,
  COMPACT_VERSION,
  arc,
  circle,
  decodeDocument,
  decodeEntities,
  dimChain,
  dimLinear,
  encodeDocument,
  encodeEntities,
  insert,
  leader,
  mtext,
  packBlockLibrary,
  packVcad,
  polygon,
  rect,
  spline,
  stringifyDocument,
  text,
  unpackBlockLibrary,
  unpackVcad,
  viewport,
} from '../src';

function sample(): CadDocument {
  const doc = new CadDocument({ gost: true, settings: { scale: '1:20', precision: 2 } });
  doc.layers.create('Сталь', { color: '#1d4ed8', hatch: 'steel-45', lineType: [12, 3, 2, 3], locked: true });
  doc.layers.create('Скрытый', { visible: false });
  doc.dimStyles.create('Арх', { textStyle: 'GOST', terminatorType: 'tick', suffix: ' мм' });
  doc.blocks.define('Узел', [polygon([[0, 0], [100, 0, 0.41421356237], [100, 50], [0, 50]], { layer: 'Сталь', fill: 'hatch' }), text([0, 0], 'b')], { basePoint: [50, 25], description: 'тест' });
  doc.addSheet('Фасад', [
    insert('Узел', [10.123456, 20], { rotationDeg: 30, scaleX: -1, id: 'ins-1', color: '#ff0000' }),
    spline([[0, 0], [1, 2], [3, 1], [4, 4]]),
    spline([[0, 0], [1, 2], [3, 1], [4, 4], [6, 0]], { degree: 2, knots: [0, 0, 0, 0.2, 0.7, 1, 1, 1] }),
    dimLinear([0, 0], [1234.5678, 0], { offset: -100, style: 'Арх' }),
    dimChain([[0, 0], [1, 0], [3, 0]], { texts: [null, '<> min'] }),
    leader([[0, 0], [10, 10]], 'A'),
    viewport([circle([0, 0], 10), arc([0, 0], 5, 0, 90)], { scale: '1:2', clip: { minX: -20, minY: -20, maxX: 20, maxY: 20 }, frame: true, title: 'Узел А' }),
    mtext([0, 0], 'a\nb', { anchor: 'top-right', height: 5, layer: 'Нет такого' }),
    rect(0, 0, 10, 5, { lineWeight: 0.7, lineType: 'dashed' }),
  ]);
  doc.addSheet('Разрез', []);
  return doc;
}

describe('compact JSON (Этап 4.1)', () => {
  it('is several times smaller than the verbose JSON and round-trips exactly', () => {
    const doc = sample();
    const compact = stringifyDocument(doc);
    expect(compact.length * 2.5).toBeLessThan(JSON.stringify(doc).length);
    const back = decodeDocument(compact);
    expect(stringifyDocument(back)).toBe(compact);
    expect(back.layers.get('Сталь')!.locked).toBe(true);
    expect(back.layers.get('Скрытый')!.visible).toBe(false);
    expect(back.dimStyles.get('Арх')!.suffix).toBe(' мм');
    expect(back.textStyles.current.name).toBe('GOST');
    expect(back.blocks.get('Узел')!.description).toBe('тест');
    expect(back.sheets.map((s) => s.name)).toEqual(['Фасад', 'Разрез']);
    expect(back.sheets[0]!.find('ins-1')).toMatchObject({ type: 'insert', color: '#ff0000', scaleX: -1 });
  });

  it('entity tuples: code, layer index, fields; defaults trimmed; coordinates rounded, bulges kept', () => {
    const c = encodeDocument(sample());
    const sheet = c.sh[0] as [string, string, unknown[]];
    expect(sheet[2][0]).toEqual(['I', 0, 'Узел', [10.12, 20], -1, 1, 30, { i: 'ins-1', c: '#ff0000' }]);
    expect(sheet[2][1]).toEqual(['S', 0, [[0, 0], [1, 2], [3, 1], [4, 4]]]); // равномерные узлы не пишутся
    const block = c.b[0] as [string, number[], string, unknown[]];
    expect((block[3][0] as unknown[])[2]).toEqual([[0, 0], [100, 0, 0.4142135624], [100, 50], [0, 50]]);
    expect(c.s).toEqual(['mm', 2, '1:20', '1:20', 'c', [10, 10, 10, 10]]);
    expect(c.v).toBe(COMPACT_VERSION);
  });

  it('decoding validates everything', () => {
    const c = JSON.parse(stringifyDocument(sample()));
    expect(() => decodeDocument({ ...c, v: 99 })).toThrow(/unsupported version/);
    expect(() => decodeDocument('{')).toThrow(CadFormatError);
    const bad = JSON.parse(JSON.stringify(c));
    bad.sh[0][2][0] = ['C', 0, [0, 0], -5];
    expect(() => decodeDocument(bad)).toThrow(/radius/);
    bad.sh[0][2][0] = ['ZZ', 0];
    expect(() => decodeDocument(bad)).toThrow(/unknown entity code/);
    bad.sh[0][2][0] = ['L', 99, [0, 0], [1, 1]];
    expect(() => decodeDocument(bad)).toThrow(/unknown layer reference/);
  });

  it('standalone entity lists use layer names', () => {
    const list = [rect(0, 0, 1, 1, { layer: 'A' }), text([0, 0], 'x')];
    const enc = encodeEntities(list);
    expect(enc[0]).toEqual(['R', 'A', 0, 0, 1, 1]);
    expect(decodeEntities(enc)).toEqual(list);
  });
});

describe('.vcad container (Этап 4.2)', () => {
  it('packs document, blocks and assets; unpacks with validation', () => {
    const doc = sample();
    const bytes = packVcad(doc, { assets: { 'fonts/gost.woff2': new Uint8Array([1, 2, 3]) }, meta: { order: 42 } });
    expect(bytes[0]).toBe(0x50); // 'PK'
    const un = unpackVcad(bytes);
    expect(un.manifest.kind).toBe('document');
    expect(un.manifest.blocks).toEqual([{ name: 'Узел', file: 'blocks/0001.json' }]);
    expect(un.manifest.meta).toEqual({ order: 42 });
    expect([...un.assets['fonts/gost.woff2']!]).toEqual([1, 2, 3]);
    expect(stringifyDocument(un.document!)).toBe(stringifyDocument(doc));
  });

  it('block library without sheets', () => {
    const doc = sample();
    const lib = unpackBlockLibrary(packBlockLibrary(doc.blocks));
    expect(lib.map((b) => b.name)).toEqual(['Узел']);
    expect(lib[0]!.entities[0]!.layer).toBe('Сталь');
    expect(unpackVcad(packBlockLibrary(doc.blocks)).document).toBeNull();
  });

  it('rejects bad archives and unsafe asset paths', () => {
    expect(() => packVcad(sample(), { assets: { '../x': new Uint8Array() } })).toThrow(/invalid asset path/);
    expect(() => unpackVcad(new Uint8Array([1, 2, 3]))).toThrow(/not a valid ZIP/);
    const noManifest = zipSync({ 'a.txt': strToU8('x') });
    expect(() => unpackVcad(noManifest)).toThrow(/manifest.json/);
    const wrong = zipSync({ 'manifest.json': strToU8(JSON.stringify({ format: 'zip' })) });
    expect(() => unpackVcad(wrong)).toThrow(/must be "vcad"/);
  });
});
