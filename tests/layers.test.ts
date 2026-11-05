import { describe, expect, it } from 'vitest';
import {
  CadError,
  CadLayerError,
  HATCH_PRESETS,
  LayerManager,
  assertLayerName,
  buildLayer,
  createHatchStyle,
  getLineDashPattern,
  getLineTypeName,
  hatchKey,
  isSameHatch,
  isSameLineType,
  nearestDxfColorIndex,
  normalizeHexColor,
  parseLineType,
  resolveHatchColors,
  snapLineWeight,
  toDxfLineTypeElements,
  toDxfLineWeight,
} from '../src';
import type { LayerChange } from '../src';

describe('color', () => {
  it('normalizes hex', () => {
    expect(normalizeHexColor('#ABC')).toBe('#aabbcc');
    expect(normalizeHexColor('#0F172A')).toBe('#0f172a');
  });
  it('rejects invalid colors', () => {
    expect(() => normalizeHexColor('red')).toThrow(CadLayerError);
    expect(() => normalizeHexColor('#12345')).toThrow(CadLayerError);
    expect(() => normalizeHexColor(123)).toThrow(CadLayerError);
  });
  it('maps colors to the nearest ACI', () => {
    expect(nearestDxfColorIndex('#ff0000')).toBe(1);
    expect(nearestDxfColorIndex('#0000ff')).toBe(5);
    expect(nearestDxfColorIndex('#000000')).toBe(7);
    expect(nearestDxfColorIndex('#ffffff')).toBe(7);
    expect(nearestDxfColorIndex('#0f172a')).toBe(7);
    expect(nearestDxfColorIndex('#808080')).toBe(8);
  });
});

describe('lineweight', () => {
  it('snaps to standard weights', () => {
    expect(snapLineWeight(0.26)).toBe(0.25);
    expect(snapLineWeight(0.9)).toBe(0.9);
    expect(snapLineWeight(5)).toBe(2.11);
    expect(toDxfLineWeight(0.5)).toBe(50);
    expect(toDxfLineWeight(1.4)).toBe(140);
  });
});

describe('linetype', () => {
  it('accepts presets and custom patterns', () => {
    expect(parseLineType('dashed')).toBe('dashed');
    expect(parseLineType([12, 3, 2, 3])).toEqual([12, 3, 2, 3]);
  });
  it('rejects invalid ones', () => {
    expect(() => parseLineType('wavy')).toThrow(CadLayerError);
    expect(() => parseLineType('toString')).toThrow(CadLayerError);
    expect(() => parseLineType([])).toThrow(CadLayerError);
    expect(() => parseLineType([5])).toThrow(CadLayerError);
    expect(() => parseLineType([5, 0])).toThrow(CadLayerError);
    expect(() => parseLineType([5, -1])).toThrow(CadLayerError);
    expect(() => parseLineType([5, NaN])).toThrow(CadLayerError);
  });
  it('gives dash arrays, names and DXF elements', () => {
    expect(getLineDashPattern('continuous')).toEqual([]);
    expect(getLineDashPattern('dashdot')).toEqual([12, 3, 2, 3]);
    expect(getLineTypeName('dashed')).toBe('DASHED');
    expect(getLineTypeName([12, 3, 2.5, 3])).toBe('CUSTOM_12_3_2P5_3');
    expect(toDxfLineTypeElements([12, 3, 2, 3])).toEqual([12, -3, 2, -3]);
    expect(isSameLineType('dashed', [6, 2])).toBe(true);
    expect(isSameLineType('dashed', 'dotted')).toBe(false);
  });
});

describe('hatch', () => {
  it('builds a simple single-family hatch with defaults', () => {
    const h = createHatchStyle({ angle: 45 });
    expect(h.families.length).toBe(1);
    expect(h.families[0]).toEqual({ angle: 45, spacing: 3, lineWidth: 0.18, color: null, dash: [], offset: 0 });
    expect(h.background).toBe(null);
  });
  it('normalizes angle into [0, 180)', () => {
    expect(createHatchStyle({ angle: 225 }).families[0]?.angle).toBe(45);
    expect(createHatchStyle({ angle: -45 }).families[0]?.angle).toBe(135);
    expect(createHatchStyle({ angle: 180 }).families[0]?.angle).toBe(0);
  });
  it('supports solid fill and custom multi-family patterns', () => {
    const solid = createHatchStyle({ background: '#CCC' });
    expect(solid.families.length).toBe(0);
    expect(solid.background).toBe('#cccccc');

    const cross = createHatchStyle({
      families: [{ angle: 45 }, { angle: 135, spacing: 5, dash: [2, 1] }],
      background: '#ffffff',
    });
    expect(cross.families.length).toBe(2);
    expect(cross.families[1]?.dash).toEqual([2, 1]);
  });
  it('rejects bad input', () => {
    expect(() => createHatchStyle({})).toThrow(CadLayerError);
    expect(() => createHatchStyle({ spacing: 0 })).toThrow(CadLayerError);
    expect(() => createHatchStyle({ lineWidth: -1 })).toThrow(CadLayerError);
    expect(() => createHatchStyle({ angle: NaN })).toThrow(CadLayerError);
    expect(() => createHatchStyle({ color: 'blue' })).toThrow(CadLayerError);
    expect(() => createHatchStyle({ dash: [1] })).toThrow(CadLayerError);
    expect(() => createHatchStyle({ angle: 45, families: [{ angle: 90 }] })).toThrow(CadLayerError);
  });
  it('compares by structure, not by name', () => {
    const a = createHatchStyle({ name: 'a', angle: 45, spacing: 2 });
    const b = createHatchStyle({ name: 'b', angle: 45, spacing: 2 });
    const c = createHatchStyle({ name: 'a', angle: 45, spacing: 3 });
    expect(hatchKey(a)).toBe(hatchKey(b));
    expect(isSameHatch(a, b)).toBe(true);
    expect(isSameHatch(a, c)).toBe(false);
  });
  it('resolves ByLayer colors', () => {
    const h = resolveHatchColors(createHatchStyle({ angle: 45 }), '#FF0000');
    expect(h.families[0]?.color).toBe('#ff0000');
    const explicit = createHatchStyle({ angle: 45, color: '#00ff00' });
    expect(resolveHatchColors(explicit, '#ff0000')).toBe(explicit);
  });
  it('ships valid, frozen presets', () => {
    expect(Object.keys(HATCH_PRESETS).length).toBe(5);
    expect(HATCH_PRESETS['steel-45'].families[0]?.angle).toBe(45);
    expect(Object.isFrozen(HATCH_PRESETS.concrete)).toBe(true);
  });
});

describe('layer name', () => {
  it('accepts normal names, including Cyrillic', () => {
    assertLayerName('Walls');
    assertLayerName('Размеры');
    assertLayerName('A-WALL_01');
  });
  it('rejects bad names', () => {
    expect(() => assertLayerName('')).toThrow(CadLayerError);
    expect(() => assertLayerName(' x')).toThrow(CadLayerError);
    expect(() => assertLayerName('x ')).toThrow(CadLayerError);
    expect(() => assertLayerName('a/b')).toThrow(CadLayerError);
    expect(() => assertLayerName('a:b')).toThrow(CadLayerError);
    expect(() => assertLayerName('a'.repeat(256))).toThrow(CadLayerError);
    expect(() => assertLayerName(5)).toThrow(CadLayerError);
  });
});

describe('buildLayer', () => {
  it('applies defaults and is frozen', () => {
    const l = buildLayer('walls');
    expect(l).toEqual({
      name: 'walls',
      color: '#000000',
      dxfColorIndex: 7,
      lineWeight: 0.25,
      lineType: 'continuous',
      opacity: 1,
      visible: true,
      locked: false,
      hatch: null,
    });
    expect(Object.isFrozen(l)).toBe(true);
  });
  it('derives the ACI from color unless set explicitly', () => {
    expect(buildLayer('a', { color: '#ff0000' }).dxfColorIndex).toBe(1);
    expect(buildLayer('a', { color: '#ff0000', dxfColorIndex: 30 }).dxfColorIndex).toBe(30);
    expect(buildLayer('a', { color: '#ff0000', dxfColorIndex: 'auto' }).dxfColorIndex).toBe(1);
  });
  it('keeps explicit ACI when other props change', () => {
    const base = buildLayer('a', { dxfColorIndex: 30 });
    expect(buildLayer('a', { lineWeight: 0.5 }, base).dxfColorIndex).toBe(30);
    expect(buildLayer('a', { color: '#0000ff' }, base).dxfColorIndex).toBe(5);
  });
  it('resolves hatch by preset name, init or object', () => {
    expect(buildLayer('a', { hatch: 'steel-45' }).hatch?.name).toBe('steel-45');
    expect(buildLayer('a', { hatch: { angle: 30 } }).hatch?.families[0]?.angle).toBe(30);
    expect(buildLayer('a', { hatch: null }, buildLayer('b', { hatch: 'concrete' })).hatch).toBe(null);
    expect(() => buildLayer('a', { hatch: 'nope' as never })).toThrow(CadLayerError);
  });
  it('validates every property', () => {
    expect(() => buildLayer('a', { opacity: 1.5 })).toThrow(CadLayerError);
    expect(() => buildLayer('a', { opacity: -0.1 })).toThrow(CadLayerError);
    expect(() => buildLayer('a', { lineWeight: -1 })).toThrow(CadLayerError);
    expect(() => buildLayer('a', { dxfColorIndex: 0 })).toThrow(CadLayerError);
    expect(() => buildLayer('a', { dxfColorIndex: 256 })).toThrow(CadLayerError);
    expect(() => buildLayer('a', { visible: 'yes' as never })).toThrow(CadLayerError);
    expect(() => buildLayer('a', { lineType: 'wavy' as never })).toThrow(CadLayerError);
  });
  it('errors derive from CadError', () => {
    try {
      buildLayer('a', { opacity: 2 });
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(CadError);
      expect((e as CadError).field).toBe('opacity');
    }
  });
});

describe('LayerManager: registry', () => {
  it('always has layer "0" as current', () => {
    const m = new LayerManager();
    expect(m.size).toBe(1);
    expect(m.current.name).toBe('0');
  });
  it('creates, gets and lists in insertion order', () => {
    const m = new LayerManager();
    m.create('walls', { color: '#ff0000' });
    m.create('Dims');
    expect(m.names()).toEqual(['0', 'walls', 'Dims']);
    expect(m.get('WALLS')?.color).toBe('#ff0000');
    expect(m.has('dims')).toBe(true);
    expect(m.get('missing')).toBe(undefined);
    expect([...m].length).toBe(3);
  });
  it('rejects duplicates (case-insensitive) and bad names', () => {
    const m = new LayerManager();
    m.create('Walls');
    expect(() => m.create('walls')).toThrow(CadLayerError);
    expect(() => m.create('0')).toThrow(CadLayerError);
    expect(() => m.create('bad/name')).toThrow(CadLayerError);
    expect(() => m.require('nope')).toThrow(CadLayerError);
  });
  it('accepts initial definitions and lets "0" be configured', () => {
    const m = new LayerManager([{ name: '0', color: '#333333' }, { name: 'a' }]);
    expect(m.size).toBe(2);
    expect(m.get('0')?.color).toBe('#333333');
  });
  it('rejects duplicate initial definitions', () => {
    expect(() => new LayerManager([{ name: 'a' }, { name: 'A' }])).toThrow(CadLayerError);
  });
});

describe('LayerManager: update, rename, clone, delete', () => {
  it('update returns a new layer and keeps the old one intact', () => {
    const m = new LayerManager();
    const a = m.create('a');
    const b = m.update('a', { lineWeight: 0.5, locked: true });
    expect(a.lineWeight).toBe(0.25);
    expect(b.lineWeight).toBe(0.5);
    expect(m.require('a')).toBe(b);
  });
  it('rename keeps order, properties and current layer', () => {
    const m = new LayerManager();
    m.create('a', { color: '#ff0000' });
    m.create('b');
    m.setCurrent('a');
    m.rename('a', 'Renamed');
    expect(m.names()).toEqual(['0', 'Renamed', 'b']);
    expect(m.current.name).toBe('Renamed');
    expect(m.get('renamed')?.color).toBe('#ff0000');
    expect(m.has('a')).toBe(false);
  });
  it('rename allows case-only change but not collisions or layer "0"', () => {
    const m = new LayerManager();
    m.create('a');
    m.create('b');
    expect(m.rename('a', 'A').name).toBe('A');
    expect(() => m.rename('a', 'b')).toThrow(CadLayerError);
    expect(() => m.rename('0', 'zero')).toThrow(CadLayerError);
  });
  it('clone copies properties and applies a patch', () => {
    const m = new LayerManager();
    m.create('src', { color: '#ff0000', lineType: 'dashed', hatch: 'steel-45' });
    const copy = m.clone('src', 'copy', { lineWeight: 0.7 });
    expect(copy.name).toBe('copy');
    expect(copy.color).toBe('#ff0000');
    expect(copy.dxfColorIndex).toBe(1);
    expect(copy.lineType).toBe('dashed');
    expect(copy.hatch?.name).toBe('steel-45');
    expect(copy.lineWeight).toBe(0.7);
    expect(m.require('src').lineWeight).toBe(0.25);
    expect(() => m.clone('src', 'COPY')).toThrow(CadLayerError);
    expect(() => m.clone('nope', 'x')).toThrow(CadLayerError);
  });
  it('delete protects "0", the current layer and unknown names', () => {
    const m = new LayerManager();
    m.create('a');
    expect(() => m.delete('0')).toThrow(CadLayerError);
    m.setCurrent('a');
    expect(() => m.delete('a')).toThrow(CadLayerError);
    m.setCurrent('0');
    m.delete('a');
    expect(m.has('a')).toBe(false);
    expect(() => m.delete('a')).toThrow(CadLayerError);
  });
});

describe('LayerManager: visibility helpers', () => {
  it('isolate and showAll', () => {
    const m = new LayerManager();
    m.create('a');
    m.create('b');
    m.isolate('b');
    expect(m.list().map((l) => l.visible)).toEqual([false, false, true]);
    m.showAll();
    expect(m.list().every((l) => l.visible)).toBe(true);
  });
  it('setVisible / setLocked', () => {
    const m = new LayerManager();
    m.create('a');
    expect(m.setVisible('a', false).visible).toBe(false);
    expect(m.setLocked('a', true).locked).toBe(true);
  });
});

describe('LayerManager: events', () => {
  it('notifies listeners and supports unsubscribe', () => {
    const m = new LayerManager();
    const seen: string[] = [];
    const off = m.onChange((c: LayerChange) => seen.push(`${c.type}:${c.layer.name}`));
    m.create('a');
    m.update('a', { opacity: 0.5 });
    m.rename('a', 'b');
    m.setCurrent('b');
    m.setCurrent('0');
    m.delete('b');
    off();
    m.create('c');
    expect(seen).toEqual(['create:a', 'update:a', 'rename:b', 'current:b', 'current:0', 'delete:b']);
  });
});

describe('LayerManager: JSON', () => {
  it('round-trips with hatch, custom line pattern and current layer', () => {
    const m = new LayerManager();
    m.create('a', { color: '#336699', lineType: [12, 3, 2, 3], hatch: { families: [{ angle: 45 }, { angle: 90, dash: [1, 1] }], background: '#eeeeee' }, opacity: 0.5 });
    m.create('b', { hatch: 'concrete', locked: true, visible: false });
    m.setCurrent('a');

    const restored = LayerManager.fromJSON(JSON.parse(JSON.stringify(m)));
    expect(restored.list()).toEqual(m.list());
    expect(restored.current.name).toBe('a');
  });
  it('validates input', () => {
    expect(() => LayerManager.fromJSON(null)).toThrow(CadLayerError);
    expect(() => LayerManager.fromJSON({})).toThrow(CadLayerError);
    expect(() => LayerManager.fromJSON({ layers: [{ name: 'a', opacity: 3 }] })).toThrow(CadLayerError);
    expect(() => LayerManager.fromJSON({ layers: [], current: 'ghost' })).toThrow(CadLayerError);
  });
});
