import { describe, expect, it } from 'vitest';
import {
  CadSettingsError,
  DEFAULT_DRAWING_SETTINGS,
  convertLength,
  createDrawingMetrics,
  createDrawingSettings,
  formatScale,
  normalizePadding,
  parseDrawingSettings,
  parseScale,
  roundTo,
  scaleFactor,
  toScreenPoint,
  updateDrawingSettings,
} from '../src';

describe('units', () => {
  it('converts between units', () => {
    expect(convertLength(1, 'm', 'mm')).toBe(1000);
    expect(convertLength(10, 'cm', 'mm')).toBe(100);
    expect(convertLength(1, 'inch', 'mm')).toBe(25.4);
    expect(convertLength(25.4, 'mm', 'inch')).toBe(1);
    expect(convertLength(5, 'mm', 'mm')).toBe(5);
  });
});

describe('roundTo', () => {
  it('rounds half away from zero without float artefacts', () => {
    expect(roundTo(1.005, 2)).toBe(1);
    expect(roundTo(1.0051, 2)).toBe(1.01);
    expect(roundTo(2.5, 0)).toBe(3);
    expect(roundTo(-2.5, 0)).toBe(-3);
    expect(roundTo(1234.56789, 3)).toBe(1234.568);
  });
  it('never returns -0', () => {
    expect(Object.is(roundTo(-0.0001, 2), 0)).toBe(true);
  });
  it('passes through non-finite values', () => {
    expect(roundTo(Infinity, 2)).toBe(Infinity);
    expect(Number.isNaN(roundTo(NaN, 2))).toBe(true);
  });
});

describe('scale', () => {
  it('parses strings', () => {
    expect(parseScale('1:50')).toEqual({ numerator: 1, denominator: 50 });
    expect(parseScale(' 2 : 1 ')).toEqual({ numerator: 2, denominator: 1 });
    expect(parseScale('1:2.5')).toEqual({ numerator: 1, denominator: 2.5 });
  });
  it('parses objects', () => {
    expect(parseScale({ numerator: 1, denominator: 10 })).toEqual({ numerator: 1, denominator: 10 });
  });
  it('rejects invalid input', () => {
    expect(() => parseScale('1-50')).toThrow(CadSettingsError);
    expect(() => parseScale('0:1')).toThrow(CadSettingsError);
    expect(() => parseScale('1:0')).toThrow(CadSettingsError);
    expect(() => parseScale({ numerator: -1, denominator: 1 })).toThrow(CadSettingsError);
    expect(() => parseScale({ numerator: 1, denominator: NaN })).toThrow(CadSettingsError);
  });
  it('computes factor and formats back', () => {
    expect(scaleFactor(parseScale('1:50'))).toBe(0.02);
    expect(scaleFactor(parseScale('2:1'))).toBe(2);
    expect(formatScale(parseScale('1:10'))).toBe('1:10');
  });
});

describe('padding', () => {
  it('normalizes all input forms', () => {
    expect(normalizePadding(10)).toEqual({ top: 10, right: 10, bottom: 10, left: 10 });
    expect(normalizePadding([5, 20])).toEqual({ top: 5, right: 20, bottom: 5, left: 20 });
    expect(normalizePadding([1, 2, 3, 4])).toEqual({ top: 1, right: 2, bottom: 3, left: 4 });
    expect(normalizePadding({ left: 20 })).toEqual({ top: 0, right: 0, bottom: 0, left: 20 });
  });
  it('rejects negatives, NaN and wrong array length', () => {
    expect(() => normalizePadding(-1)).toThrow(CadSettingsError);
    expect(() => normalizePadding(NaN)).toThrow(CadSettingsError);
    expect(() => normalizePadding({ top: -5 })).toThrow(CadSettingsError);
    expect(() => normalizePadding([1, 2, 3] as unknown as [number, number])).toThrow(CadSettingsError);
  });
});

describe('coordinate system', () => {
  it('flips Y only for cartesian', () => {
    expect(toScreenPoint('cartesian', [10, 20])).toEqual([10, -20]);
    expect(toScreenPoint('screen', [10, 20])).toEqual([10, 20]);
    expect(Object.is(toScreenPoint('cartesian', [1, 0])[1], 0)).toBe(true);
  });
});

describe('createDrawingSettings', () => {
  it('returns defaults', () => {
    const s = createDrawingSettings();
    expect(s).toEqual(DEFAULT_DRAWING_SETTINGS);
    expect(s.units).toBe('mm');
    expect(s.coordinateSystem).toBe('cartesian');
  });
  it('is frozen', () => {
    expect(Object.isFrozen(createDrawingSettings())).toBe(true);
  });
  it('applies overrides and keeps annotation scale at base unless set', () => {
    const s = createDrawingSettings({ units: 'm', precision: 2, scale: '1:50', padding: [10, 20] });
    expect(s.units).toBe('m');
    expect(s.precision).toBe(2);
    expect(formatScale(s.scale)).toBe('1:50');
    expect(formatScale(s.annotationScale)).toBe('1:1');
    expect(s.padding).toEqual({ top: 10, right: 20, bottom: 10, left: 20 });
  });
  it("'auto' annotation scale follows scale", () => {
    const s = createDrawingSettings({ scale: '1:20', annotationScale: 'auto' });
    expect(formatScale(s.annotationScale)).toBe('1:20');
  });
  it('rejects invalid values', () => {
    expect(() => createDrawingSettings({ units: 'ft' as never })).toThrow(CadSettingsError);
    expect(() => createDrawingSettings({ precision: 11 })).toThrow(CadSettingsError);
    expect(() => createDrawingSettings({ precision: 1.5 })).toThrow(CadSettingsError);
    expect(() => createDrawingSettings({ coordinateSystem: 'polar' as never })).toThrow(CadSettingsError);
  });
  it('rejects prototype keys as units', () => {
    expect(() => createDrawingSettings({ units: 'toString' as never })).toThrow(CadSettingsError);
  });
  it('reports field in error', () => {
    try {
      createDrawingSettings({ scale: 'abc' });
      expect.unreachable();
    } catch (e) {
      expect((e as CadSettingsError).field).toBe('scale');
    }
  });
});

describe('updateDrawingSettings / parseDrawingSettings', () => {
  it('does not mutate the source', () => {
    const a = createDrawingSettings({ scale: '1:10' });
    const b = updateDrawingSettings(a, { scale: '1:50', annotationScale: 'auto' });
    expect(formatScale(a.scale)).toBe('1:10');
    expect(formatScale(b.scale)).toBe('1:50');
    expect(formatScale(b.annotationScale)).toBe('1:50');
  });
  it('parses unknown JSON', () => {
    expect(parseDrawingSettings(undefined)).toEqual(DEFAULT_DRAWING_SETTINGS);
    expect(parseDrawingSettings(JSON.parse('{"units":"cm","scale":"1:5"}')).units).toBe('cm');
    expect(() => parseDrawingSettings('nope')).toThrow(CadSettingsError);
    expect(() => parseDrawingSettings([])).toThrow(CadSettingsError);
  });
  it('round-trips through JSON', () => {
    const s = createDrawingSettings({ units: 'inch', scale: '2:1', padding: 3 });
    expect(parseDrawingSettings(JSON.parse(JSON.stringify(s)))).toEqual(s);
  });
});

describe('createDrawingMetrics', () => {
  it('converts model <-> paper with scale and units', () => {
    const m = createDrawingMetrics(createDrawingSettings({ units: 'mm', scale: '1:50' }));
    expect(m.modelToPaperMm(1000)).toBe(20);
    expect(m.paperMmToModel(20)).toBe(1000);

    const meters = createDrawingMetrics(createDrawingSettings({ units: 'm', scale: '1:100' }));
    expect(meters.modelToPaperMm(1)).toBe(10);
  });
  it('sizes annotations by annotationScale', () => {
    const m = createDrawingMetrics(createDrawingSettings({ scale: '1:50', annotationScale: 'auto' }));
    expect(m.annotationToModel(3.5)).toBeCloseTo(175, 9);
    const independent = createDrawingMetrics(
      createDrawingSettings({ scale: '1:50', annotationScale: '1:10' }),
    );
    expect(independent.annotationToModel(3.5)).toBeCloseTo(35, 9);
  });
  it('converts padding to model units', () => {
    const m = createDrawingMetrics(createDrawingSettings({ scale: '1:10', padding: 10 }));
    expect(m.paddingInModelUnits()).toEqual({ top: 100, right: 100, bottom: 100, left: 100 });
  });
  it('rounds by precision and flips Y', () => {
    const m = createDrawingMetrics(createDrawingSettings({ precision: 1 }));
    expect(m.round(1.26)).toBe(1.3);
    expect(m.roundPoint([1.04, 2.06])).toEqual([1, 2.1]);
    expect(m.toScreen([5, 7])).toEqual([5, -7]);
    expect(m.fromScreen(m.toScreen([5, 7]))).toEqual([5, 7]);
  });
});
