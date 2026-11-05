import { describe, expect, it } from 'vitest';
import {
  CadDimStyleError,
  CadError,
  DEFAULT_DIM_STYLE_PROPS,
  DimStyleTable,
  FontManager,
  GOST_DIM_STYLE_NAME,
  TERMINATOR_TYPES,
  TextStyleTable,
  assertDimStyleName,
  buildDimStyle,
  createDrawingMetrics,
  createDrawingSettings,
  formatDimensionNumber,
  formatDimensionText,
  getTerminatorGeometry,
  layoutDimText,
  measureTextInModel,
  normalizeTerminatorType,
  registerGostDimStyle,
  resolveDimStyleMetrics,
} from '../src';
import type { DimStyle, DimStyleChange } from '../src';

function setup() {
  const fonts = new FontManager();
  const textStyles = new TextStyleTable(fonts);
  const dims = new DimStyleTable(textStyles);
  return { fonts, textStyles, dims };
}

const m1 = createDrawingMetrics(createDrawingSettings({ scale: '1:1', annotationScale: '1:1' }));
const m50 = createDrawingMetrics(createDrawingSettings({ scale: '1:50', annotationScale: '1:50' }));

describe('terminators', () => {
  it('lists the six types and maps "oblique" to "tick"', () => {
    expect(TERMINATOR_TYPES).toEqual(['arrow-closed', 'arrow-open', 'tick', 'dot', 'circle', 'none']);
    expect(normalizeTerminatorType('oblique')).toBe('tick');
    expect(normalizeTerminatorType('dot')).toBe('dot');
    expect(() => normalizeTerminatorType('arrow')).toThrow(CadDimStyleError);
  });

  it('draws a closed arrow with the tip at the origin and the requested apex angle', () => {
    const g = getTerminatorGeometry('arrow-closed', 5, { arrowAngle: 20 });
    expect(g.extent).toBe(5);
    expect(g.lineTrim).toBe(0);
    const shape = g.shapes[0];
    expect(shape?.kind).toBe('polygon');
    if (shape?.kind !== 'polygon') throw new Error('unreachable');
    const [tip, a, b] = shape.points as [readonly [number, number], readonly [number, number], readonly [number, number]];
    expect(tip).toEqual([0, 0]);
    expect(a[0]).toBe(-5);
    expect(a[1]).toBeCloseTo(5 * Math.tan((10 * Math.PI) / 180), 10);
    expect(b[1]).toBeCloseTo(-a[1], 10);
    // угол между сторонами = 20°
    const apex = (2 * Math.atan2(a[1], 5) * 180) / Math.PI;
    expect(apex).toBeCloseTo(20, 8);
  });

  it('draws an open arrow as a polyline through the tip', () => {
    const g = getTerminatorGeometry('arrow-open', 4);
    const shape = g.shapes[0];
    expect(shape?.kind).toBe('polyline');
    if (shape?.kind !== 'polyline') throw new Error('unreachable');
    expect(shape.points).toHaveLength(3);
    expect(shape.points[1]).toEqual([0, 0]);
  });

  it('draws a tick at 45° with the requested length centred on the tip', () => {
    const g = getTerminatorGeometry('tick', 3);
    const shape = g.shapes[0];
    expect(shape?.kind).toBe('line');
    if (shape?.kind !== 'line') throw new Error('unreachable');
    const dx = shape.to[0] - shape.from[0];
    const dy = shape.to[1] - shape.from[1];
    expect(Math.hypot(dx, dy)).toBeCloseTo(3, 10);
    expect((Math.atan2(dy, dx) * 180) / Math.PI).toBeCloseTo(45, 10);
    expect(shape.from[0] + shape.to[0]).toBeCloseTo(0, 12);
    expect(g.extent).toBe(0);
  });

  it('draws dot (filled) and circle (hollow, trims the line); "none" has no shapes', () => {
    const dot = getTerminatorGeometry('dot', 2);
    expect(dot.shapes[0]).toEqual({ kind: 'circle', center: [0, 0], radius: 1, fill: true });
    expect(dot.lineTrim).toBe(0);
    const circle = getTerminatorGeometry('circle', 2);
    expect(circle.shapes[0]).toEqual({ kind: 'circle', center: [0, 0], radius: 1, fill: false });
    expect(circle.lineTrim).toBe(1);
    expect(getTerminatorGeometry('none', 2).shapes).toEqual([]);
  });

  it('validates input and returns frozen data', () => {
    expect(() => getTerminatorGeometry('arrow-closed', 0)).toThrow(CadDimStyleError);
    expect(() => getTerminatorGeometry('arrow-closed', Number.NaN)).toThrow(CadDimStyleError);
    expect(() => getTerminatorGeometry('arrow-closed', 3, { arrowAngle: 180 })).toThrow(CadDimStyleError);
    expect(() => getTerminatorGeometry('nope' as never, 3)).toThrow(CadDimStyleError);
    const g = getTerminatorGeometry('arrow-closed', 3);
    expect(Object.isFrozen(g)).toBe(true);
    expect(Object.isFrozen(g.shapes)).toBe(true);
    expect(Object.isFrozen(g.shapes[0])).toBe(true);
  });
});

describe('buildDimStyle', () => {
  it('uses frozen defaults', () => {
    const s = buildDimStyle('A');
    expect(s).toEqual({ name: 'A', ...DEFAULT_DIM_STYLE_PROPS });
    expect(Object.isFrozen(s)).toBe(true);
    expect(Object.isFrozen(DEFAULT_DIM_STYLE_PROPS)).toBe(true);
    expect(s.terminatorType).toBe('arrow-closed');
    expect(s.textPosition).toBe('above');
    expect(s.textOrientation).toBe('aligned');
  });

  it('accepts all terminator types and stores "oblique" as "tick"', () => {
    for (const t of TERMINATOR_TYPES) expect(buildDimStyle('A', { terminatorType: t }).terminatorType).toBe(t);
    expect(buildDimStyle('A', { terminatorType: 'oblique' }).terminatorType).toBe('tick');
  });

  it('applies init over base and treats undefined as "keep"', () => {
    const base = buildDimStyle('Base', { terminatorSize: 5, suffix: 'мм' });
    const s = buildDimStyle('Child', { terminatorSize: 2, suffix: undefined as unknown as string }, base);
    expect(s.terminatorSize).toBe(2);
    expect(s.suffix).toBe('мм');
  });

  it('validates numeric ranges', () => {
    const bad: Array<[string, unknown]> = [
      ['terminatorSize', 0],
      ['terminatorSize', 51],
      ['arrowAngle', 4],
      ['arrowAngle', 91],
      ['dimLineOvershoot', -1],
      ['baselineSpacing', 0],
      ['extensionOffset', -0.1],
      ['extensionOvershoot', 51],
      ['textGap', 21],
      ['decimals', 1.5],
      ['decimals', 9],
      ['angleDecimals', -1],
      ['lineWeight', 11],
      ['terminatorSize', Number.NaN],
      ['terminatorSize', '3'],
    ];
    for (const [key, value] of bad) {
      expect(() => buildDimStyle('A', { [key]: value } as never), `${key}=${String(value)}`).toThrow(CadDimStyleError);
    }
  });

  it('validates enums, booleans and strings', () => {
    expect(() => buildDimStyle('A', { textPosition: 'below' as never })).toThrow(CadDimStyleError);
    expect(() => buildDimStyle('A', { textOrientation: 'vertical' as never })).toThrow(CadDimStyleError);
    expect(() => buildDimStyle('A', { decimalSeparator: ';' as never })).toThrow(CadDimStyleError);
    expect(() => buildDimStyle('A', { hideFirstExtensionLine: 1 as never })).toThrow(CadDimStyleError);
    expect(() => buildDimStyle('A', { prefix: 5 as never })).toThrow(CadDimStyleError);
    expect(() => buildDimStyle('A', { prefix: 'x'.repeat(33) })).toThrow(CadDimStyleError);
    expect(() => buildDimStyle('A', { suffix: 'a\nb' })).toThrow(CadDimStyleError);
    expect(() => buildDimStyle('A', { textStyle: 'bad:name' })).toThrow(CadDimStyleError);
    expect(buildDimStyle('A', { prefix: '', suffix: 'мм' }).suffix).toBe('мм');
  });

  it('normalizes colours and allows null (by layer) for colours and line weight', () => {
    const s = buildDimStyle('A', { lineColor: '#ABC', textColor: '#FF0000', lineWeight: 0.25 });
    expect(s.lineColor).toBe('#aabbcc');
    expect(s.textColor).toBe('#ff0000');
    expect(s.lineWeight).toBe(0.25);
    const byLayer = buildDimStyle('A', { lineColor: null, lineWeight: null, textColor: null }, s);
    expect(byLayer.lineColor).toBeNull();
    expect(byLayer.lineWeight).toBeNull();
    expect(byLayer.textColor).toBeNull();
    expect(() => buildDimStyle('A', { lineColor: 'red' })).toThrow(CadDimStyleError);
    expect(() => buildDimStyle('A', { textColor: 5 as never })).toThrow(CadDimStyleError);
    try {
      buildDimStyle('A', { lineColor: 'red' });
    } catch (e) {
      expect(e).toBeInstanceOf(CadError);
      expect((e as CadDimStyleError).field).toBe('lineColor');
    }
  });

  it('rejects unknown properties (typos) and non-object input', () => {
    expect(() => buildDimStyle('A', { terminatorTyp: 'tick' } as never)).toThrow(/unknown dimension style property/);
    expect(() => buildDimStyle('A', null as never)).toThrow(CadDimStyleError);
    expect(() => buildDimStyle('A', [] as never)).toThrow(CadDimStyleError);
  });

  it('validates names like layers and text styles', () => {
    expect(() => assertDimStyleName('')).toThrow(CadDimStyleError);
    expect(() => assertDimStyleName(' A')).toThrow(CadDimStyleError);
    expect(() => assertDimStyleName('A/B')).toThrow(CadDimStyleError);
    expect(() => assertDimStyleName('x'.repeat(256))).toThrow(CadDimStyleError);
    expect(() => assertDimStyleName('Размеры 1:50')).toThrow(CadDimStyleError); // «:» запрещён
    expect(() => assertDimStyleName('Размеры ГОСТ')).not.toThrow();
  });
});

describe('DimStyleTable', () => {
  it('always has Standard, which cannot be deleted or renamed', () => {
    const { dims } = setup();
    expect(dims.names()).toEqual(['Standard']);
    expect(dims.current.name).toBe('Standard');
    expect(() => dims.delete('Standard')).toThrow(CadDimStyleError);
    expect(() => dims.rename('standard', 'Other')).toThrow(CadDimStyleError);
    expect(dims.update('Standard', { terminatorType: 'tick' }).terminatorType).toBe('tick');
  });

  it('creates styles with case-insensitive unique names, keeping order and case', () => {
    const { dims } = setup();
    dims.create('Архитектура', { terminatorType: 'tick' });
    dims.create('Мелкие');
    expect(dims.names()).toEqual(['Standard', 'Архитектура', 'Мелкие']);
    expect(dims.has('архитектура')).toBe(true);
    expect(dims.get('АРХИТЕКТУРА')?.name).toBe('Архитектура');
    expect(() => dims.create('архитектура')).toThrow(/already exists/);
    expect(() => dims.require('nope')).toThrow(/not found/);
    expect(dims.get('nope')).toBeUndefined();
    expect(dims.size).toBe(3);
    expect([...dims].map((s) => s.name)).toEqual(['Standard', 'Архитектура', 'Мелкие']);
  });

  it('updates immutably and keeps the previous object intact', () => {
    const { dims } = setup();
    const before = dims.create('A', { terminatorSize: 2 });
    const after = dims.update('a', { terminatorSize: 4, hideSecondExtensionLine: true });
    expect(before.terminatorSize).toBe(2);
    expect(after.terminatorSize).toBe(4);
    expect(after.hideSecondExtensionLine).toBe(true);
    expect(dims.require('A')).toBe(after);
    expect(() => dims.update('A', { terminatorSize: -1 })).toThrow(CadDimStyleError);
    expect(dims.require('A')).toBe(after);
  });

  it('renames keeping order and the current style; allows case-only changes', () => {
    const { dims } = setup();
    dims.create('A');
    dims.create('B');
    dims.create('C');
    dims.setCurrent('B');
    dims.rename('B', 'Beta');
    expect(dims.names()).toEqual(['Standard', 'A', 'Beta', 'C']);
    expect(dims.current.name).toBe('Beta');
    dims.rename('a', 'A2');
    dims.rename('A2', 'a2');
    expect(dims.names()).toEqual(['Standard', 'a2', 'Beta', 'C']);
    expect(() => dims.rename('C', 'beta')).toThrow(/already exists/);
  });

  it('clones with a patch and refuses duplicates', () => {
    const { dims } = setup();
    dims.create('A', { terminatorType: 'dot', suffix: 'мм' });
    const copy = dims.clone('A', 'B', { terminatorType: 'circle' });
    expect(copy.terminatorType).toBe('circle');
    expect(copy.suffix).toBe('мм');
    expect(() => dims.clone('A', 'b')).toThrow(/already exists/);
    expect(() => dims.clone('nope', 'X')).toThrow(/not found/);
  });

  it('deletes styles but not the current one', () => {
    const { dims } = setup();
    dims.create('A');
    dims.setCurrent('A');
    expect(() => dims.delete('A')).toThrow(/current/);
    dims.setCurrent('Standard');
    dims.delete('a');
    expect(dims.has('A')).toBe(false);
  });

  it('emits change events and supports unsubscribe', () => {
    const { dims } = setup();
    const log: string[] = [];
    const off = dims.onChange((c: DimStyleChange) => log.push(`${c.type}:${c.style.name}`));
    dims.create('A');
    dims.update('A', { textGap: 2 });
    dims.clone('A', 'B');
    dims.rename('B', 'C');
    dims.setCurrent('C');
    dims.setCurrent('A');
    dims.delete('C');
    off();
    dims.create('Z');
    expect(log).toEqual(['create:A', 'update:A', 'create:B', 'rename:C', 'current:C', 'current:A', 'delete:C']);
  });

  it('only accepts text styles that exist and stores their registered spelling', () => {
    const { textStyles, dims } = setup();
    expect(() => dims.create('A', { textStyle: 'Нет такого' })).toThrow(/not registered/);
    textStyles.create('Размеры', { height: 2.5 });
    const s = dims.create('A', { textStyle: 'размеры' });
    expect(s.textStyle).toBe('Размеры');
    expect(dims.resolveTextStyle(s).height).toBe(2.5);
    expect(dims.resolveTextStyle('A').name).toBe('Размеры');
    expect(() => dims.update('A', { textStyle: 'x' })).toThrow(/not registered/);
    expect(() => dims.clone('A', 'B', { textStyle: 'x' })).toThrow(/not registered/);
  });

  it('reports dangling text style references', () => {
    const { textStyles, dims } = setup();
    textStyles.create('T1');
    textStyles.create('T2');
    dims.create('A', { textStyle: 'T1' });
    dims.create('B', { textStyle: 'T1' });
    dims.create('C', { textStyle: 'T2' });
    expect(dims.textStylesInUse()).toEqual(['Standard', 'T1', 'T2']);
    expect(dims.missingTextStyles()).toEqual([]);
    textStyles.delete('T2');
    expect(dims.missingTextStyles()).toEqual(['T2']);
    expect(() => dims.resolveTextStyle('C')).toThrow(/not registered/);
  });

  it('round-trips through JSON (including via JSON.stringify)', () => {
    const { textStyles, dims } = setup();
    textStyles.create('T');
    dims.create('A', { terminatorType: 'oblique', textStyle: 'T', lineColor: '#123456', lineWeight: 0.18, decimalSeparator: ',' });
    dims.create('B', { textPosition: 'centered' });
    dims.setCurrent('A');
    const raw: unknown = JSON.parse(JSON.stringify(dims));
    const restored = DimStyleTable.fromJSON(textStyles, raw);
    expect(restored.names()).toEqual(['Standard', 'A', 'B']);
    expect(restored.current.name).toBe('A');
    expect(restored.require('A')).toEqual(dims.require('A'));
    expect(restored.require('A').terminatorType).toBe('tick');
    expect(restored.toJSON()).toEqual(dims.toJSON());
  });

  it('validates data coming from outside', () => {
    const { textStyles } = setup();
    expect(() => DimStyleTable.fromJSON(textStyles, null)).toThrow(CadDimStyleError);
    expect(() => DimStyleTable.fromJSON(textStyles, { styles: 'x' })).toThrow(CadDimStyleError);
    expect(() => DimStyleTable.fromJSON(textStyles, { styles: [5] })).toThrow(CadDimStyleError);
    expect(() => DimStyleTable.fromJSON(textStyles, { styles: [{ name: 'A', terminatorSize: -1 }] })).toThrow(CadDimStyleError);
    expect(() => DimStyleTable.fromJSON(textStyles, { styles: [{ name: 'A' }, { name: 'a' }] })).toThrow(/already exists/);
    expect(() => DimStyleTable.fromJSON(textStyles, { current: 7, styles: [] })).toThrow(CadDimStyleError);
    expect(() => DimStyleTable.fromJSON(textStyles, { current: 'nope', styles: [] })).toThrow(/not found/);
    expect(() => DimStyleTable.fromJSON(textStyles, { styles: [{ name: 'A', textStyle: 'ghost' }] })).toThrow(/not registered/);
  });

  it('lets a definition override Standard', () => {
    const { textStyles } = setup();
    const dims = new DimStyleTable(textStyles, [{ name: 'standard', terminatorType: 'dot' }, { name: 'A' }]);
    expect(dims.names()).toEqual(['Standard', 'A']);
    expect(dims.require('Standard').terminatorType).toBe('dot');
  });
});

describe('formatting', () => {
  it('rounds, pads and trims', () => {
    expect(formatDimensionNumber(1250, { decimals: 0 })).toBe('1250');
    expect(formatDimensionNumber(1250.5, { decimals: 0 })).toBe('1251');
    expect(formatDimensionNumber(12.3456, { decimals: 2 })).toBe('12.35');
    expect(formatDimensionNumber(12.5, { decimals: 2 })).toBe('12.50');
    expect(formatDimensionNumber(12.5, { decimals: 2, trimTrailingZeros: true })).toBe('12.5');
    expect(formatDimensionNumber(12, { decimals: 2, trimTrailingZeros: true })).toBe('12');
    expect(formatDimensionNumber(100, { decimals: 0, trimTrailingZeros: true })).toBe('100');
    expect(formatDimensionNumber(100, { decimals: 1, trimTrailingZeros: true })).toBe('100');
    expect(formatDimensionNumber(100.25, { decimals: 2, trimTrailingZeros: true })).toBe('100.25');
  });
  it('uses the decimal separator and never prints negative zero', () => {
    expect(formatDimensionNumber(12.5, { decimals: 1, separator: ',' })).toBe('12,5');
    expect(formatDimensionNumber(-0.4, { decimals: 0 })).toBe('0');
    expect(formatDimensionNumber(-0.04, { decimals: 1 })).toBe('0.0');
    expect(formatDimensionNumber(-12.5, { decimals: 1 })).toBe('-12.5');
  });
  it('rejects non-finite values and bad decimals', () => {
    expect(() => formatDimensionNumber(Number.NaN, { decimals: 0 })).toThrow(CadDimStyleError);
    expect(() => formatDimensionNumber(Infinity, { decimals: 0 })).toThrow(CadDimStyleError);
    expect(() => formatDimensionNumber(1, { decimals: 9 })).toThrow(CadDimStyleError);
    expect(() => formatDimensionNumber(1, { decimals: 0.5 })).toThrow(CadDimStyleError);
  });
  it('builds text for every kind of dimension', () => {
    const s: DimStyle = buildDimStyle('A', { prefix: '≈', suffix: 'мм', decimals: 1, angleDecimals: 0 });
    expect(formatDimensionText(1250, s)).toBe('≈1250мм');
    expect(formatDimensionText(50, s, 'radius')).toBe('R50мм');
    expect(formatDimensionText(12, s, 'diameter')).toBe('Ø12мм');
    expect(formatDimensionText(44.6, s, 'angular')).toBe('45°');
    const plain = buildDimStyle('B');
    expect(formatDimensionText(1250, plain)).toBe('1250');
    expect(formatDimensionText(37.5, plain, 'angular')).toBe('37.5°');
    expect(formatDimensionText(45, plain, 'angular')).toBe('45°');
    expect(() => formatDimensionText(1, plain, 'weird' as never)).toThrow(CadDimStyleError);
  });
  it('honours the decimal separator in the text of a style', () => {
    const s = buildDimStyle('A', { decimalSeparator: ',', decimals: 2, trimTrailingZeros: false, suffix: ' мм' });
    expect(formatDimensionText(3.5, s)).toBe('3,50 мм');
  });
});

describe('resolveDimStyleMetrics', () => {
  it('converts paper millimetres to model units by the annotation scale', () => {
    const s = buildDimStyle('A', { terminatorSize: 3, extensionOvershoot: 2, extensionOffset: 1, textGap: 1, baselineSpacing: 7, dimLineOvershoot: 1.5 });
    const r = resolveDimStyleMetrics(s, m50);
    expect(r.terminatorSize).toBeCloseTo(150, 9);
    expect(r.extensionOvershoot).toBeCloseTo(100, 9);
    expect(r.extensionOffset).toBeCloseTo(50, 9);
    expect(r.textGap).toBeCloseTo(50, 9);
    expect(r.baselineSpacing).toBeCloseTo(350, 9);
    expect(r.terminator.extent).toBeCloseTo(150, 9);
  });
  it('is identity at 1:1 in millimetres and respects units', () => {
    const s = buildDimStyle('A', { terminatorSize: 3 });
    expect(resolveDimStyleMetrics(s, m1).terminatorSize).toBe(3);
    const m = createDrawingMetrics(createDrawingSettings({ units: 'm', scale: '1:1', annotationScale: '1:1' }));
    expect(resolveDimStyleMetrics(s, m).terminatorSize).toBeCloseTo(0.003, 12);
  });
  it('applies dimLineOvershoot only to ticks', () => {
    const base = { dimLineOvershoot: 2 } as const;
    expect(resolveDimStyleMetrics(buildDimStyle('A', { ...base, terminatorType: 'tick' }), m1).effectiveDimLineOvershoot).toBe(2);
    for (const t of ['arrow-closed', 'arrow-open', 'dot', 'circle', 'none'] as const) {
      expect(resolveDimStyleMetrics(buildDimStyle('A', { ...base, terminatorType: t }), m1).effectiveDimLineOvershoot).toBe(0);
    }
  });
});

describe('layoutDimText', () => {
  const { fonts, textStyles } = setup();
  const style = (init: Parameters<typeof buildDimStyle>[1] = {}): DimStyle => buildDimStyle('T', init);
  const lay = (s: DimStyle, angle: number, text = '1250', paperHeight?: number) =>
    layoutDimText(text, s, textStyles, m1, paperHeight === undefined ? { lineAngleDeg: angle } : { lineAngleDeg: angle, paperHeight });
  const std = textStyles.require('Standard');
  const ref = measureTextInModel('1250', std, fonts, m1, { anchor: 'bottom-center' });

  it('puts aligned text above a horizontal line', () => {
    const p = lay(style(), 0);
    expect(p.rotationDeg).toBe(0);
    expect(p.flipped).toBe(false);
    expect(p.anchor).toBe('bottom-center');
    expect(p.across).toBe(1);
    expect(p.along).toEqual({ from: 'middle', offset: 0 });
    expect(p.lineBreak).toBeNull();
    expect(p.layout.width).toBeCloseTo(ref.width, 10);
    expect(p.gap).toBe(1);
  });

  it('keeps aligned text readable for every direction', () => {
    const cases: Array<[number, number, boolean]> = [
      [0, 0, false], [30, 30, false], [90, 90, false], [91, -89, true], [135, -45, true],
      [180, 0, true], [225, 45, true], [270, 90, true], [271, -89, false], [315, -45, false],
      [360, 0, false], [-45, -45, false], [-90, 90, true], [750, 30, false],
    ];
    for (const [angle, rot, flipped] of cases) {
      const p = lay(style(), angle);
      expect(p.rotationDeg, `angle ${angle}`).toBeCloseTo(rot, 9);
      expect(p.flipped, `angle ${angle}`).toBe(flipped);
      expect(p.rotationDeg).toBeGreaterThan(-90);
      expect(p.rotationDeg).toBeLessThanOrEqual(90);
    }
  });

  it('mirrors the offset to the other side of the line when the text is flipped', () => {
    expect(lay(style(), 180).across).toBe(-1);
    expect(lay(style(), 0).across).toBe(1);
    // Текст всегда выше линии, если смотреть на него: для перевёрнутого текста «выше» — правая нормаль линии.
    const p = lay(style(), 225);
    const rad = (225 * Math.PI) / 180;
    const left = [-Math.sin(rad), Math.cos(rad)] as const;
    const anchorXY = [left[0] * p.across, left[1] * p.across] as const;
    // верх текста (повёрнут на 45°) смотрит по нормали (−sin45, cos45): якорь должен быть смещён против «верха» относительно линии? нет — по «верху»
    const textUp = [-Math.sin(Math.PI / 4), Math.cos(Math.PI / 4)] as const;
    expect(anchorXY[0] * textUp[0] + anchorXY[1] * textUp[1]).toBeCloseTo(1, 9);
  });

  it('breaks the line under centred text by the projected width plus the gap on both sides', () => {
    const s = style({ textPosition: 'centered', textGap: 2 });
    const p = lay(s, 0);
    expect(p.anchor).toBe('middle-center');
    expect(p.across).toBe(0);
    expect(p.lineBreak).not.toBeNull();
    expect(p.lineBreak?.length).toBeCloseTo(ref.width + 4, 9);
    expect(p.lineBreak?.start).toBeCloseTo(-(ref.width + 4) / 2, 9);
    expect(p.lineBreak?.end).toBeCloseTo((ref.width + 4) / 2, 9);
    // для текста, повёрнутого вдоль линии, длина разрыва не зависит от угла
    expect(lay(s, 37).lineBreak?.length).toBeCloseTo(ref.width + 4, 9);
    expect(lay(s, 90).lineBreak?.length).toBeCloseTo(ref.width + 4, 9);
  });

  it('breaks a line under horizontal text by the text height when the line is vertical', () => {
    const s = style({ textPosition: 'centered', textOrientation: 'horizontal', textGap: 1 });
    const p = lay(s, 90);
    expect(p.rotationDeg).toBe(0);
    expect(p.lineBreak?.length).toBeCloseTo(ref.height + 2, 9);
    expect(lay(s, 0).lineBreak?.length).toBeCloseTo(ref.width + 2, 9);
    // на наклонной линии проекция горизонтального текста длиннее, чем у вдоль-линейного
    const slanted = lay(s, 45).lineBreak?.length ?? 0;
    expect(slanted).toBeCloseTo((ref.width + 2 + ref.height + 2) * Math.SQRT1_2, 9);
  });

  it('keeps horizontal "above" text fully on one side of the line', () => {
    const s = style({ textOrientation: 'horizontal', textGap: 1 });
    const flat = lay(s, 0);
    expect(flat.rotationDeg).toBe(0);
    expect(flat.across).toBeCloseTo(1 + ref.height / 2, 9);

    const vertical = lay(s, 90); // текст слева от вертикальной линии
    expect(vertical.across).toBeCloseTo(1 + ref.width / 2, 9);
    const down = lay(s, 270); // та же линия, обратное направление: текст остаётся слева (по чертежу)
    expect(down.across).toBeCloseTo(-(1 + ref.width / 2), 9);

    const slantedUp = lay(s, 45);
    expect(slantedUp.across).toBeGreaterThan(0);
    const slantedDown = lay(s, 135);
    expect(slantedDown.across).toBeLessThan(0);
    // в обоих случаях центр текста смещён в сторону «вверх» (y > 0)
    for (const [angle, p] of [[45, slantedUp], [135, slantedDown]] as const) {
      const rad = (angle * Math.PI) / 180;
      expect(Math.cos(rad) * p.across).toBeGreaterThan(0); // y-компонента левой нормали = cos(angle)
    }
    // ближайшая к линии точка текста отстоит ровно на gap
    const rad = (45 * Math.PI) / 180;
    const nx = -Math.sin(rad);
    const ny = Math.cos(rad);
    const corners = slantedUp.placed.corners.map((c) => (c[0] + nx * slantedUp.across) * nx + (c[1] + ny * slantedUp.across) * ny);
    expect(Math.min(...corners)).toBeCloseTo(1, 9);
  });

  it('puts "outside" text on the continuation of the line past its end', () => {
    const s = style({ textPosition: 'outside' });
    const right = lay(s, 0);
    expect(right.anchor).toBe('middle-left');
    expect(right.along).toEqual({ from: 'end', offset: 1 });
    expect(right.across).toBe(0);
    expect(right.lineBreak).toBeNull();
    expect(lay(s, 180).anchor).toBe('middle-right'); // перевёрнутый текст: его правый край у конца линии
    expect(lay(s, 180).flipped).toBe(true);

    const h = style({ textPosition: 'outside', textOrientation: 'horizontal' });
    expect(lay(h, 0).anchor).toBe('middle-left');
    expect(lay(h, 180).anchor).toBe('middle-right');
    expect(lay(h, 90).anchor).toBe('bottom-center');
    expect(lay(h, 270).anchor).toBe('top-center');
    expect(lay(h, 45).anchor).toBe('middle-left');
  });

  it('converts the gap and text height by the annotation scale', () => {
    const s = style({ textGap: 1, textPosition: 'centered' });
    const p = layoutDimText('1250', s, textStyles, m50, { lineAngleDeg: 0 });
    expect(p.gap).toBeCloseTo(50, 9);
    const big = measureTextInModel('1250', std, fonts, m50, { anchor: 'middle-center' });
    expect(p.layout.width).toBeCloseTo(big.width, 9);
    expect(p.lineBreak?.length).toBeCloseTo(big.width + 100, 9);
    // свой размер текста
    const small = layoutDimText('1250', s, textStyles, m1, { lineAngleDeg: 0, paperHeight: 1.75 });
    expect(small.layout.fontHeight).toBeCloseTo(1.75, 9);
  });

  it('accounts for the oblique angle of the text style in the line break', () => {
    const { dims, textStyles: ts } = setup();
    const gost = registerGostDimStyle(dims);
    expect(gost.name).toBe(GOST_DIM_STYLE_NAME);
    const centered = buildDimStyle('G', { textPosition: 'centered' }, gost);
    const p = layoutDimText('1250', centered, ts, m1, { lineAngleDeg: 0 });
    const box = p.layout.box;
    expect(p.lineBreak?.length).toBeCloseTo(box.maxX - box.minX + 2, 9);
    expect(box.maxX - box.minX).toBeGreaterThan(p.layout.width); // наклон расширяет габарит
  });

  it('validates its input', () => {
    expect(() => lay(style(), Number.NaN)).toThrow(CadDimStyleError);
    expect(() => layoutDimText(5 as never, style(), textStyles, m1, { lineAngleDeg: 0 })).toThrow(CadDimStyleError);
    const ghost = buildDimStyle('G', { textStyle: 'Нет' });
    expect(() => layoutDimText('1', ghost, textStyles, m1, { lineAngleDeg: 0 })).toThrow(/not registered/);
    const broken = { ...style(), textPosition: 'below' } as unknown as DimStyle;
    expect(() => layoutDimText('1', broken, textStyles, m1, { lineAngleDeg: 0 })).toThrow(CadDimStyleError);
  });

  it('returns frozen results', () => {
    const p = lay(style({ textPosition: 'centered' }), 10);
    expect(Object.isFrozen(p)).toBe(true);
    expect(Object.isFrozen(p.along)).toBe(true);
    expect(Object.isFrozen(p.lineBreak)).toBe(true);
  });
});

describe('GOST dimension style', () => {
  it('registers font, text style and dimension style once', () => {
    const { fonts, textStyles, dims } = setup();
    const s = registerGostDimStyle(dims);
    expect(fonts.has('gost-b')).toBe(true);
    expect(textStyles.has('GOST')).toBe(true);
    expect(s.textStyle).toBe('GOST');
    expect(s.terminatorType).toBe('arrow-closed');
    expect(s.arrowAngle).toBe(20);
    expect(s.textPosition).toBe('above');
    expect(s.textOrientation).toBe('aligned');
    expect(s.decimalSeparator).toBe(',');
    expect(s.baselineSpacing).toBe(7);
    expect(registerGostDimStyle(dims)).toBe(s);
    dims.update('GOST', { terminatorSize: 5 });
    expect(registerGostDimStyle(dims).terminatorSize).toBe(5); // не перезаписывается
    expect(dims.names()).toEqual(['Standard', 'GOST']);
  });
});

describe('full example', () => {
  it('builds a dimension text at 1:50 with the GOST style', () => {
    const { textStyles, dims } = setup();
    const gost = registerGostDimStyle(dims);
    const text = formatDimensionText(1250, gost);
    expect(text).toBe('1250');
    const placement = layoutDimText(text, gost, textStyles, m50, { lineAngleDeg: 0 });
    const metrics = resolveDimStyleMetrics(gost, m50);
    expect(placement.across).toBeCloseTo(metrics.textGap, 9);
    expect(metrics.terminator.shapes).toHaveLength(1);
    expect(placement.layout.width).toBeGreaterThan(0);
  });
});
