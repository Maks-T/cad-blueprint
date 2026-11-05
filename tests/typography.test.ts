import { describe, expect, it } from 'vitest';
import {
  CadError,
  CadTypographyError,
  FONT_METRICS_PRESETS,
  FontManager,
  GOST_TYPE_B_STYLE,
  TextStyleTable,
  assertFontUrl,
  baselineSlantFromOblique,
  buildFont,
  buildTextStyle,
  createDrawingMetrics,
  createDrawingSettings,
  createFontMetrics,
  getAdvance,
  measureText,
  measureTextInModel,
  measureTextWidth,
  obliqueFromBaselineSlant,
  placeText,
  projectTextOnAxis,
  registerGostTypeB,
} from '../src';
import type { FontChange, TextAnchor, TextStyleChange } from '../src';

const CYR = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя';

function setup() {
  const fonts = new FontManager();
  const styles = new TextStyleTable(fonts);
  return { fonts, styles, standard: styles.require('Standard') };
}

describe('font metrics', () => {
  it('ships frozen presets', () => {
    expect(Object.keys(FONT_METRICS_PRESETS)).toEqual(['sans', 'serif', 'mono', 'gost-b']);
    expect(Object.isFrozen(FONT_METRICS_PRESETS.sans)).toBe(true);
    expect(Object.isFrozen(FONT_METRICS_PRESETS.sans.advances)).toBe(true);
  });
  it('has Helvetica/Arial widths for Latin', () => {
    const m = FONT_METRICS_PRESETS.sans;
    expect(getAdvance(m, 'H')).toBe(722);
    expect(getAdvance(m, 'i')).toBe(222);
    expect(getAdvance(m, ' ')).toBe(278);
    expect(getAdvance(FONT_METRICS_PRESETS.serif, 'M')).toBe(889);
    expect(getAdvance(FONT_METRICS_PRESETS.mono, 'W')).toBe(600);
  });
  it('covers the whole Russian alphabet in every proportional preset', () => {
    for (const name of ['sans', 'serif', 'gost-b'] as const) {
      for (const ch of CYR) {
        expect(ch in FONT_METRICS_PRESETS[name].advances).toBe(true);
      }
    }
  });
  it('uses the default advance for unknown glyphs and zero for control characters', () => {
    const m = FONT_METRICS_PRESETS.sans;
    expect(getAdvance(m, '☺')).toBe(m.defaultAdvance);
    expect(getAdvance(m, '\u0007')).toBe(0);
    expect(getAdvance(m, '\u0301')).toBe(0);
    expect(getAdvance(m, '\u200b')).toBe(0);
  });
  it('extends a preset with overrides', () => {
    const m = createFontMetrics({ base: 'sans', advances: { A: 700 } });
    expect(getAdvance(m, 'A')).toBe(700);
    expect(getAdvance(m, 'B')).toBe(667);
    expect(m.capHeight).toBe(716);
    expect(Object.isFrozen(m)).toBe(true);
  });
  it('builds metrics from scratch', () => {
    const m = createFontMetrics({ unitsPerEm: 2048, capHeight: 1467, xHeight: 1062, descent: 434, defaultAdvance: 1139 });
    expect(m.unitsPerEm).toBe(2048);
    expect(m.advances).toEqual({});
  });
  it('rejects invalid metrics', () => {
    expect(() => createFontMetrics('comic' as never)).toThrow(CadTypographyError);
    expect(() => createFontMetrics({ unitsPerEm: 1000 })).toThrow(CadTypographyError);
    expect(() => createFontMetrics({ base: 'sans', capHeight: 0 })).toThrow(CadTypographyError);
    expect(() => createFontMetrics({ base: 'sans', capHeight: NaN })).toThrow(CadTypographyError);
    expect(() => createFontMetrics({ base: 'sans', advances: { AB: 1 } })).toThrow(CadTypographyError);
    expect(() => createFontMetrics({ base: 'sans', advances: { A: -1 } })).toThrow(CadTypographyError);
    expect(() => createFontMetrics({ base: 'nope' as never })).toThrow(CadTypographyError);
    expect(() => createFontMetrics(null as never)).toThrow(CadTypographyError);
  });
  it('GOST type B profile follows the 6d / 2d rule', () => {
    const m = FONT_METRICS_PRESETS['gost-b'];
    expect(m.capHeight).toBe(m.unitsPerEm);
    expect(getAdvance(m, 'Н')).toBe(800); // 6d + 2d
    expect(getAdvance(m, ' ')).toBe(600); // пробел 6d
    expect(getAdvance(m, '1')).toBeLessThan(getAdvance(m, '8'));
  });
});

describe('font definition', () => {
  it('applies defaults', () => {
    const f = buildFont('my-font');
    expect(f.family).toBe('my-font');
    expect(f.generic).toBe('sans-serif');
    expect(f.faces).toEqual([]);
    expect(f.google).toBeNull();
    expect(f.dxf).toBeNull();
    expect(f.fallbacks).toEqual([]);
    expect(f.metrics).toBe(FONT_METRICS_PRESETS.sans);
    expect(Object.isFrozen(f)).toBe(true);
  });
  it('infers web font format from the URL', () => {
    const f = buildFont('f', {
      faces: [
        { url: 'fonts/a.ttf' },
        { url: 'https://x.test/a.woff2?v=3', weight: 700 },
        { url: 'data:font/woff2;base64,AAAA', style: 'italic' },
        { url: 'https://x.test/font', format: null },
        { url: 'https://x.test/font.bin' },
      ],
    });
    expect(f.faces.map((x) => x.format)).toEqual(['truetype', 'woff2', 'woff2', null, null]);
    expect(f.faces[1]?.weight).toBe(700);
  });
  it('rejects unsafe URLs and families (CSS / SVG injection)', () => {
    expect(() => assertFontUrl('javascript:alert(1)')).toThrow(CadTypographyError);
    expect(() => assertFontUrl('ftp://x.test/a.ttf')).toThrow(CadTypographyError);
    expect(() => assertFontUrl('https://x.test/a.ttf")};body{x:y')).toThrow(CadTypographyError);
    expect(() => assertFontUrl('https://x.test/a b.ttf')).toThrow(CadTypographyError);
    expect(() => assertFontUrl('https://x.test/a(1).ttf')).toThrow(CadTypographyError);
    expect(() => assertFontUrl('data:text/html;base64,AAAA')).toThrow(CadTypographyError);
    expect(() => assertFontUrl('')).toThrow(CadTypographyError);
    expect(() => buildFont('f', { family: 'A"; } body { x:y' })).toThrow(CadTypographyError);
    expect(() => buildFont('f', { family: 'A</style><script>' })).toThrow(CadTypographyError);
    expect(() => buildFont('bad"id')).toThrow(CadTypographyError);
    expect(() => buildFont('')).toThrow(CadTypographyError);
    expect(() => buildFont(' padded ')).toThrow(CadTypographyError);
  });
  it('validates faces, google, dxf and fallbacks', () => {
    expect(() => buildFont('f', { faces: [{ url: 'a.ttf', weight: 450 }] })).toThrow(CadTypographyError);
    expect(() => buildFont('f', { faces: [{ url: 'a.ttf', style: 'wavy' as never }] })).toThrow(CadTypographyError);
    expect(() => buildFont('f', { faces: [{ url: 'a.ttf', format: 'exe' as never }] })).toThrow(CadTypographyError);
    expect(() => buildFont('f', { generic: 'cursive' as never })).toThrow(CadTypographyError);
    expect(() => buildFont('f', { google: { weights: [] } })).toThrow(CadTypographyError);
    expect(() => buildFont('f', { google: { weights: [401] } })).toThrow(CadTypographyError);
    expect(() => buildFont('f', { dxf: { ttf: 'C:\\fonts\\a.ttf' } })).toThrow(CadTypographyError);
    expect(() => buildFont('f', { dxf: { shx: 'a.ttf' } })).toThrow(CadTypographyError);
    expect(() => buildFont('f', { dxf: {} })).toThrow(CadTypographyError);
    expect(() => buildFont('f', { fallbacks: ['ok', 'bad"'] })).toThrow(CadTypographyError);
    expect(buildFont('f', { fallbacks: ['A', 'a', 'B'] }).fallbacks).toEqual(['A', 'B']);
  });
});

describe('FontManager', () => {
  it('ships sans, serif and mono', () => {
    const fonts = new FontManager();
    expect(fonts.ids()).toEqual(['sans', 'serif', 'mono']);
    expect(fonts.require('SANS').family).toBe('Arial');
  });
  it('creates, updates and clones fonts; ids are case-insensitive', () => {
    const fonts = new FontManager();
    const a = fonts.create('GOST-B', { family: 'GOST type B', metrics: 'gost-b' });
    expect(fonts.get('gost-b')).toBe(a);
    expect(() => fonts.create('gost-b')).toThrow(CadTypographyError);
    const b = fonts.update('gost-b', { generic: 'serif' });
    expect(b.id).toBe('GOST-B');
    expect(b.family).toBe('GOST type B');
    expect(b.generic).toBe('serif');
    expect(a.generic).toBe('sans-serif'); // старый объект не изменился
    const c = fonts.clone('gost-b', 'gost-c', { family: 'GOST C' });
    expect(c.metrics).toBe(FONT_METRICS_PRESETS['gost-b']);
    expect(() => fonts.clone('gost-b', 'GOST-C')).toThrow(CadTypographyError);
    expect(() => fonts.require('missing')).toThrow(CadTypographyError);
    expect(() => fonts.update('missing', {})).toThrow(CadTypographyError);
  });
  it('protects the default font and cleans fallbacks when a font is deleted', () => {
    const fonts = new FontManager();
    expect(() => fonts.delete('sans')).toThrow(CadTypographyError);
    fonts.create('a', { fallbacks: ['serif', 'Arial Narrow'] });
    fonts.delete('serif');
    expect(fonts.has('serif')).toBe(false);
    expect(fonts.require('a').fallbacks).toEqual(['Arial Narrow']);
  });
  it('emits change events and supports unsubscribe', () => {
    const fonts = new FontManager();
    const log: string[] = [];
    const off = fonts.onChange((c: FontChange) => log.push(`${c.type}:${c.font.id}`));
    fonts.create('x');
    fonts.update('x', { generic: 'serif' });
    fonts.delete('x');
    off();
    fonts.create('y');
    expect(log).toEqual(['create:x', 'update:x', 'delete:x']);
  });
  it('builds the CSS font-family chain from fallbacks', () => {
    const fonts = new FontManager();
    expect(fonts.getCssFontFamily('sans')).toBe('"Arial", "Helvetica", sans-serif');
    fonts.create('x', { family: 'X', fallbacks: ['serif', 'Roboto'] });
    expect(fonts.getCssFontFamily('x')).toBe('"X", "Times New Roman", "Times", "Roboto", sans-serif');
  });
  it('survives fallback cycles', () => {
    const fonts = new FontManager();
    fonts.create('a', { family: 'A', fallbacks: ['b'] });
    fonts.create('b', { family: 'B', fallbacks: ['a'] });
    fonts.setFallbacks('a', ['b']);
    expect(fonts.getFontChain('a').map((f) => f.id)).toEqual(['a', 'b']);
    expect(fonts.getCssFontFamily('a')).toBe('"A", "B", sans-serif');
  });
  it('exposes and sets the fallback map atomically', () => {
    const fonts = new FontManager();
    expect(fonts.fallbackMap).toEqual({ sans: ['Helvetica'], serif: ['Times'], mono: ['Courier'] });
    fonts.setFallbackMap({ sans: ['Verdana'], mono: [] });
    expect(fonts.require('sans').fallbacks).toEqual(['Verdana']);
    expect(fonts.require('mono').fallbacks).toEqual([]);
    expect(() => fonts.setFallbackMap({ serif: ['Georgia'], ghost: ['Arial'] })).toThrow(CadTypographyError);
    expect(fonts.require('serif').fallbacks).toEqual(['Times']);
    expect(() => fonts.setFallbackMap({ serif: ['bad"'] })).toThrow(CadTypographyError);
  });
  it('resolves DXF fonts through the chain', () => {
    const fonts = new FontManager();
    expect(fonts.resolveDxfFont('sans')).toEqual({ shx: null, ttf: 'arial.ttf', bigFont: null, sourceId: 'sans' });
    fonts.create('custom', { fallbacks: ['serif'] });
    expect(fonts.resolveDxfFont('custom').ttf).toBe('times.ttf');
    expect(fonts.resolveDxfFont('custom').sourceId).toBe('serif');
    fonts.create('alone', { fallbacks: ['Some System Font'] });
    expect(fonts.resolveDxfFont('alone')).toEqual({ shx: 'txt.shx', ttf: null, bigFont: null, sourceId: null });
    fonts.create('shx', { dxf: { shx: 'gost.shx', bigFont: 'gbcbig.shx' } });
    expect(fonts.resolveDxfFont('shx')).toEqual({ shx: 'gost.shx', ttf: null, bigFont: 'gbcbig.shx', sourceId: 'shx' });
  });
  it('builds Google Fonts URLs', () => {
    const fonts = new FontManager();
    expect(fonts.getGoogleFontsUrl()).toBeNull();
    fonts.create('ps', { family: 'PT Sans', google: { weights: [700, 400], italic: true } });
    fonts.create('os', { family: 'Open Sans', google: true });
    expect(fonts.getGoogleFontsUrl(['ps'])).toBe(
      'https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap',
    );
    expect(fonts.getGoogleFontsUrl()).toBe(
      'https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Open+Sans:wght@400&display=swap',
    );
  });
  it('merges the same Google family from several fonts', () => {
    const fonts = new FontManager();
    fonts.create('r', { family: 'Roboto', google: { weights: [400] } });
    fonts.create('rb', { family: 'Roboto Bold', google: { family: 'Roboto', weights: [700] } });
    expect(fonts.getGoogleFontsUrl()).toBe('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
  });
  it('builds @font-face CSS with @import first, only for the requested fonts', () => {
    const fonts = new FontManager();
    expect(fonts.buildFontFaceCss()).toBe('');
    fonts.create('gost-b', {
      family: 'GOST type B',
      faces: [{ url: 'https://x.test/gost.woff2', weight: 700 }, { url: 'fonts/gost-i.ttf', style: 'italic' }],
    });
    fonts.create('ps', { family: 'PT Sans', google: true });
    const css = fonts.buildFontFaceCss();
    expect(css.startsWith('@import url("https://fonts.googleapis.com/css2?family=PT+Sans:wght@400&display=swap");')).toBe(true);
    expect(css).toContain(
      '@font-face{font-family:"GOST type B";src:url("https://x.test/gost.woff2") format("woff2");font-weight:700;font-style:normal;font-display:swap}',
    );
    expect(css).toContain('src:url("fonts/gost-i.ttf") format("truetype");font-weight:400;font-style:italic');
    expect(fonts.buildFontFaceCss(['gost-b'])).not.toContain('@import');
    expect(fonts.buildFontFaceCss(['sans'])).toBe('');
    expect(() => fonts.buildFontFaceCss(['ghost'])).toThrow(CadTypographyError);
  });
  it('round-trips through JSON, keeping preset metrics compact', () => {
    const fonts = new FontManager();
    fonts.create('gost-b', { family: 'GOST type B', metrics: 'gost-b', fallbacks: ['ISOCPEUR'], dxf: { shx: 'gost.shx' } });
    fonts.create('mine', {
      faces: [{ url: 'a.woff2' }],
      google: { weights: [300, 600] },
      metrics: { base: 'sans', advances: { A: 650 } },
    });
    fonts.update('sans', { dxf: null });
    const json = JSON.parse(JSON.stringify(fonts)) as { fonts: { id: string; metrics: unknown }[] };
    expect(json.fonts.find((f) => f.id === 'gost-b')?.metrics).toBe('gost-b');
    expect(typeof json.fonts.find((f) => f.id === 'mine')?.metrics).toBe('object');
    const restored = FontManager.fromJSON(json);
    expect(restored.ids()).toEqual(fonts.ids());
    expect(restored.require('gost-b').metrics).toBe(FONT_METRICS_PRESETS['gost-b']);
    expect(restored.require('gost-b').dxf?.shx).toBe('gost.shx');
    expect(restored.require('sans').dxf).toBeNull();
    expect(getAdvance(restored.require('mine').metrics, 'A')).toBe(650);
    expect(restored.require('mine').google?.weights).toEqual([300, 600]);
    expect(restored.getCssFontFamily('mine')).toBe(fonts.getCssFontFamily('mine'));
  });
  it('rejects malformed JSON', () => {
    expect(() => FontManager.fromJSON(null)).toThrow(CadTypographyError);
    expect(() => FontManager.fromJSON({})).toThrow(CadTypographyError);
    expect(() => FontManager.fromJSON({ fonts: [1] })).toThrow(CadTypographyError);
    expect(() => FontManager.fromJSON({ fonts: [{ id: 'a"b' }] })).toThrow(CadTypographyError);
    expect(() => FontManager.fromJSON({ fonts: [{ id: 'a', faces: [{ url: 'javascript:1' }] }] })).toThrow(CadTypographyError);
  });
});

describe('TextStyle', () => {
  it('has sensible defaults', () => {
    const s = buildTextStyle('S');
    expect(s).toEqual({ name: 'S', fontFamily: 'sans', height: 3.5, letterSpacing: 0, lineHeight: 1.5, obliqueAngle: 0, widthFactor: 1 });
    expect(Object.isFrozen(s)).toBe(true);
  });
  it('validates ranges', () => {
    expect(() => buildTextStyle('S', { height: 0 })).toThrow(CadTypographyError);
    expect(() => buildTextStyle('S', { height: -1 })).toThrow(CadTypographyError);
    expect(() => buildTextStyle('S', { height: NaN })).toThrow(CadTypographyError);
    expect(() => buildTextStyle('S', { obliqueAngle: 86 })).toThrow(CadTypographyError);
    expect(() => buildTextStyle('S', { obliqueAngle: -86 })).toThrow(CadTypographyError);
    expect(() => buildTextStyle('S', { widthFactor: 0 })).toThrow(CadTypographyError);
    expect(() => buildTextStyle('S', { lineHeight: 0.1 })).toThrow(CadTypographyError);
    expect(() => buildTextStyle('S', { letterSpacing: 6 })).toThrow(CadTypographyError);
    expect(() => buildTextStyle('bad:name')).toThrow(CadTypographyError);
    expect(() => buildTextStyle('S', null as never)).toThrow(CadTypographyError);
    expect(buildTextStyle('S', { obliqueAngle: 85, widthFactor: 100 }).obliqueAngle).toBe(85);
  });
  it('checks the font against FontManager when given', () => {
    const fonts = new FontManager();
    expect(() => buildTextStyle('S', { fontFamily: 'ghost' }, undefined, fonts)).toThrow(CadTypographyError);
    expect(buildTextStyle('S', { fontFamily: 'SERIF' }, undefined, fonts).fontFamily).toBe('SERIF');
  });
  it('converts GOST slope (75° to the baseline) to the oblique angle (15° from vertical)', () => {
    expect(obliqueFromBaselineSlant(75)).toBe(15);
    expect(baselineSlantFromOblique(15)).toBe(75);
    expect(GOST_TYPE_B_STYLE.obliqueAngle).toBe(15);
    expect(() => obliqueFromBaselineSlant(0)).toThrow(CadTypographyError);
  });
  it('CadTypographyError is a CadError with a field', () => {
    try {
      buildTextStyle('S', { height: 0 });
      expect.unreachable?.('should throw');
    } catch (e) {
      expect(e instanceof CadError).toBe(true);
      expect((e as CadTypographyError).field).toBe('height');
    }
  });
});

describe('TextStyleTable', () => {
  it('always has the Standard style', () => {
    const { styles } = setup();
    expect(styles.names()).toEqual(['Standard']);
    expect(styles.current.name).toBe('Standard');
    expect(() => styles.delete('standard')).toThrow(CadTypographyError);
    expect(() => styles.rename('Standard', 'Main')).toThrow(CadTypographyError);
  });
  it('creates styles with case-insensitive names', () => {
    const { styles } = setup();
    styles.create('Dim', { height: 2.5 });
    expect(styles.get('DIM')?.height).toBe(2.5);
    expect(() => styles.create('dim')).toThrow(CadTypographyError);
    expect(() => styles.create('X', { fontFamily: 'ghost' })).toThrow(CadTypographyError);
    expect(() => styles.require('none')).toThrow(CadTypographyError);
  });
  it('updates, clones and renames keeping order and current style', () => {
    const { styles } = setup();
    styles.create('A');
    styles.create('B');
    styles.create('C');
    styles.setCurrent('b');
    styles.update('A', { height: 5 });
    styles.clone('A', 'A2', { obliqueAngle: 15 });
    expect(styles.require('A2').height).toBe(5);
    expect(styles.require('A2').obliqueAngle).toBe(15);
    styles.rename('B', 'Beta');
    expect(styles.names()).toEqual(['Standard', 'A', 'Beta', 'C', 'A2']);
    expect(styles.current.name).toBe('Beta');
    styles.rename('Beta', 'BETA');
    expect(styles.current.name).toBe('BETA');
    expect(() => styles.rename('C', 'a')).toThrow(CadTypographyError);
  });
  it('does not delete the current style', () => {
    const { styles } = setup();
    styles.create('A');
    styles.setCurrent('A');
    expect(() => styles.delete('A')).toThrow(CadTypographyError);
    styles.setCurrent('Standard');
    styles.delete('a');
    expect(styles.has('A')).toBe(false);
  });
  it('emits events', () => {
    const { styles } = setup();
    const log: string[] = [];
    const off = styles.onChange((c: TextStyleChange) => log.push(`${c.type}:${c.style.name}`));
    styles.create('A');
    styles.update('A', { height: 4 });
    styles.rename('A', 'B');
    styles.setCurrent('B');
    styles.setCurrent('Standard');
    styles.delete('B');
    off();
    styles.create('C');
    expect(log).toEqual(['create:A', 'update:A', 'rename:B', 'current:B', 'current:Standard', 'delete:B']);
  });
  it('reports fonts in use and missing fonts', () => {
    const { fonts, styles } = setup();
    fonts.create('extra');
    styles.create('A', { fontFamily: 'EXTRA' });
    expect(styles.fontsInUse()).toEqual(['sans', 'extra']);
    expect(styles.missingFonts()).toEqual([]);
    fonts.delete('extra');
    expect(styles.missingFonts()).toEqual(['EXTRA']);
  });
  it('round-trips through JSON and lets definitions override Standard', () => {
    const { fonts, styles } = setup();
    registerGostTypeB(fonts, styles);
    styles.update('Standard', { height: 5 });
    styles.setCurrent('GOST');
    const restored = TextStyleTable.fromJSON(fonts, JSON.parse(JSON.stringify(styles)));
    expect(restored.names()).toEqual(['Standard', 'GOST']);
    expect(restored.current.name).toBe('GOST');
    expect(restored.require('Standard').height).toBe(5);
    expect(restored.require('GOST').obliqueAngle).toBe(15);
    expect(() => TextStyleTable.fromJSON(fonts, null)).toThrow(CadTypographyError);
    expect(() => TextStyleTable.fromJSON(fonts, { styles: 1 })).toThrow(CadTypographyError);
    expect(() => TextStyleTable.fromJSON(fonts, { styles: [], current: 'nope' })).toThrow(CadTypographyError);
  });
  it('registerGostTypeB is idempotent', () => {
    const { fonts, styles } = setup();
    const first = registerGostTypeB(fonts, styles);
    const second = registerGostTypeB(fonts, styles);
    expect(second).toBe(first);
    expect(fonts.has('gost-b')).toBe(true);
    expect(fonts.getCssFontFamily('gost-b')).toBe('"GOST type B", "ISOCPEUR", "osifont", "Arial Narrow", sans-serif');
    expect(fonts.resolveDxfFont('gost-b').ttf).toBe('isocpeur.ttf');
    expect(first?.lineHeight).toBe(1.7);
  });
});

describe('text layout', () => {
  // При height = capHeight sans (716) масштаб равен 1, и ширины читаются прямо из таблицы AFM.
  const H = 716;

  it('sums advances: "Hello" = H722 + e556 + l222 + l222 + o556 = 2278', () => {
    const { fonts, standard } = setup();
    const layout = measureText('Hello', standard, fonts, { height: H });
    expect(layout.width).toBe(2278);
    expect(layout.height).toBe(H);
    expect(layout.box).toEqual({ minX: 0, minY: 0, maxX: 2278, maxY: H });
    expect(layout.lines[0]?.baselineY).toBe(0);
    expect(measureTextWidth('Hello', standard, fonts, H)).toBe(2278);
  });
  it('scales linearly with height', () => {
    const { fonts, standard } = setup();
    const a = measureText('Hello', standard, fonts, { height: 3.5 });
    const b = measureText('Hello', standard, fonts, { height: 7 });
    expect(b.width).toBeCloseTo(a.width * 2, 9);
    expect(a.width).toBeCloseTo((2278 / 716) * 3.5, 9);
  });
  it('uses style.height by default', () => {
    const { fonts, styles } = setup();
    const s = styles.create('Big', { height: 7 });
    expect(measureText('A', s, fonts).fontHeight).toBe(7);
  });
  it('applies widthFactor to the whole line, including letterSpacing', () => {
    const { fonts, styles } = setup();
    const wide = styles.create('Wide', { widthFactor: 2 });
    const spaced = styles.create('Spaced', { letterSpacing: 0.1 });
    const both = styles.create('Both', { widthFactor: 2, letterSpacing: 0.1 });
    expect(measureText('Hello', wide, fonts, { height: H }).width).toBe(4556);
    expect(measureText('Hello', spaced, fonts, { height: H }).width).toBeCloseTo(2278 + 4 * 0.1 * H, 9);
    expect(measureText('Hello', both, fonts, { height: H }).width).toBeCloseTo(2 * (2278 + 4 * 0.1 * H), 9);
    expect(measureText('H', spaced, fonts, { height: H }).width).toBe(722); // один символ — без интервала
  });
  it('handles empty text, tabs, unknown glyphs and surrogate pairs', () => {
    const { fonts, standard } = setup();
    expect(measureText('', standard, fonts, { height: H }).width).toBe(0);
    expect(measureText('', standard, fonts, { height: H }).lines.length).toBe(1);
    expect(measureText('\t', standard, fonts, { height: H }).width).toBe(4 * 278);
    expect(measureText('☺', standard, fonts, { height: H }).width).toBe(556);
    expect(measureText('😀', standard, fonts, { height: H, anchor: 'bottom-left' }).width).toBe(556); // одна кодовая точка
  });
  it('lays out several lines with lineHeight pitch', () => {
    const { fonts, standard } = setup();
    const layout = measureText('AB\r\nHello\nx', standard, fonts, { height: H });
    expect(layout.lines.map((l) => l.text)).toEqual(['AB', 'Hello', 'x']);
    const pitch = 1.5 * H;
    expect(layout.height).toBeCloseTo(2 * pitch + H, 9);
    expect(layout.width).toBe(2278);
    expect(layout.lines[0]?.baselineY).toBeCloseTo(2 * pitch, 9);
    expect(layout.lines[2]?.baselineY).toBeCloseTo(0, 9);
  });
  it('places the 9 anchors', () => {
    const { fonts, standard } = setup();
    const w = 2278;
    const cases: Record<TextAnchor, [number, number, number, number]> = {
      'top-left': [0, -H, w, 0],
      'top-center': [-w / 2, -H, w / 2, 0],
      'top-right': [-w, -H, 0, 0],
      'middle-left': [0, -H / 2, w, H / 2],
      'middle-center': [-w / 2, -H / 2, w / 2, H / 2],
      'middle-right': [-w, -H / 2, 0, H / 2],
      'bottom-left': [0, 0, w, H],
      'bottom-center': [-w / 2, 0, w / 2, H],
      'bottom-right': [-w, 0, 0, H],
    };
    for (const [anchor, [minX, minY, maxX, maxY]] of Object.entries(cases) as [TextAnchor, [number, number, number, number]][]) {
      const box = measureText('Hello', standard, fonts, { height: H, anchor }).box;
      expect(box.minX).toBeCloseTo(minX, 9);
      expect(box.minY).toBeCloseTo(minY, 9);
      expect(box.maxX).toBeCloseTo(maxX, 9);
      expect(box.maxY).toBeCloseTo(maxY, 9);
    }
    expect(() => measureText('A', standard, fonts, { anchor: 'nowhere' as never })).toThrow(CadTypographyError);
  });
  it('aligns lines inside a multi-line block by the horizontal anchor', () => {
    const { fonts, standard } = setup();
    const ab = 667 + 667;
    const left = measureText('AB\nHello', standard, fonts, { height: H, anchor: 'bottom-left' });
    const center = measureText('AB\nHello', standard, fonts, { height: H, anchor: 'bottom-center' });
    const right = measureText('AB\nHello', standard, fonts, { height: H, anchor: 'bottom-right' });
    expect(left.lines[0]?.x).toBe(0);
    expect(center.lines[0]?.x).toBeCloseTo(-ab / 2, 9);
    expect(right.lines[0]?.x).toBeCloseTo(-ab, 9);
    expect(right.lines[1]?.x).toBeCloseTo(-2278, 9);
  });
  it('can include descenders in the lower bound', () => {
    const { fonts, standard } = setup();
    const layout = measureText('gy', standard, fonts, { height: H, includeDescenders: true });
    expect(layout.height).toBe(H + 212);
    expect(layout.box.minY).toBe(0);
    expect(layout.lines[0]?.baselineY).toBe(212);
  });
  it('widens the box for oblique text (positive leans right, negative leans left)', () => {
    const { fonts, styles } = setup();
    const right = styles.create('R', { obliqueAngle: 15 });
    const left = styles.create('L', { obliqueAngle: -15 });
    const t = Math.tan((15 * Math.PI) / 180);
    const r = measureText('Hello', right, fonts, { height: H });
    expect(r.width).toBe(2278);
    expect(r.box.minX).toBe(0);
    expect(r.box.maxX).toBeCloseTo(2278 + H * t, 9);
    const l = measureText('Hello', left, fonts, { height: H });
    expect(l.box.minX).toBeCloseTo(-H * t, 9);
    expect(l.box.maxX).toBe(2278);
    const rd = measureText('Hello', right, fonts, { height: H, includeDescenders: true });
    expect(rd.box.minX).toBeCloseTo(-212 * t, 9);
  });
  it('measures GOST type B text: 6d letter + 2d gap, 6d space', () => {
    const { fonts, styles } = setup();
    registerGostTypeB(fonts, styles);
    const gost = styles.require('GOST');
    expect(measureText('Н', gost, fonts, { height: 1000 }).width).toBe(800);
    expect(measureText('Н Н', gost, fonts, { height: 1000 }).width).toBe(800 + 600 + 800);
    const h = 3.5;
    expect(measureText('НН', gost, fonts, { height: h }).width).toBeCloseTo(2 * 0.8 * h, 9);
  });
  it('rejects bad input', () => {
    const { fonts, standard } = setup();
    expect(() => measureText(5 as never, standard, fonts)).toThrow(CadTypographyError);
    expect(() => measureText('A', standard, fonts, { height: 0 })).toThrow(CadTypographyError);
    expect(() => measureText('A', standard, fonts, { height: NaN })).toThrow(CadTypographyError);
    const ghost = { ...standard, fontFamily: 'ghost' };
    expect(() => measureText('A', ghost, fonts)).toThrow(CadTypographyError);
  });
  it('converts paper height to model units via annotationScale', () => {
    const { fonts, standard } = setup();
    const drawing = createDrawingMetrics(createDrawingSettings({ scale: '1:50', annotationScale: '1:50' }));
    const layout = measureTextInModel('Hello', standard, fonts, drawing);
    expect(layout.fontHeight).toBeCloseTo(175, 9); // 3.5 мм × 50
    expect(layout.width).toBeCloseTo((2278 / 716) * 175, 9);
    const custom = measureTextInModel('Hello', standard, fonts, drawing, { paperHeight: 5 });
    expect(custom.fontHeight).toBeCloseTo(250, 9);
    expect(() => measureTextInModel('A', standard, fonts, drawing, { paperHeight: 0 })).toThrow(CadTypographyError);
  });
});

describe('placing text', () => {
  const H = 716;

  it('translates, pads and rotates the box', () => {
    const { fonts, standard } = setup();
    const layout = measureText('Hello', standard, fonts, { height: H });
    const plain = placeText(layout, { position: [10, 20] });
    expect(plain.bounds).toEqual({ minX: 10, minY: 20, maxX: 10 + 2278, maxY: 20 + H });
    expect(plain.center[0]).toBeCloseTo(10 + 1139, 9);

    const padded = placeText(layout, { padding: 10 });
    expect(padded.bounds).toEqual({ minX: -10, minY: -10, maxX: 2288, maxY: H + 10 });

    const rotated = placeText(layout, { position: [10, 20], rotationDeg: 90 });
    expect(rotated.bounds.minX).toBeCloseTo(10 - H, 9);
    expect(rotated.bounds.maxX).toBeCloseTo(10, 9);
    expect(rotated.bounds.minY).toBeCloseTo(20, 9);
    expect(rotated.bounds.maxY).toBeCloseTo(20 + 2278, 9);
    expect(rotated.corners[1][0]).toBeCloseTo(10, 9);
    expect(rotated.corners[1][1]).toBeCloseTo(20 + 2278, 9);
  });
  it('rotation by 45° grows the axis-aligned bounds', () => {
    const { fonts, standard } = setup();
    const layout = measureText('Hello', standard, fonts, { height: H, anchor: 'middle-center' });
    const r = placeText(layout, { rotationDeg: 45 });
    const w = r.bounds.maxX - r.bounds.minX;
    expect(w).toBeCloseTo((2278 + H) * Math.SQRT1_2, 9);
    expect(r.center[0]).toBeCloseTo(0, 9);
    expect(r.center[1]).toBeCloseTo(0, 9);
  });
  it('projects the box on a dimension line to get the line break length', () => {
    const { fonts, standard } = setup();
    const layout = measureText('Hello', standard, fonts, { height: H, anchor: 'middle-center' });
    const flat = placeText(layout, { padding: 50 });
    const span = projectTextOnAxis(flat, 0);
    expect(span.start).toBeCloseTo(-1139 - 50, 9);
    expect(span.end).toBeCloseTo(1139 + 50, 9);
    expect(span.length).toBeCloseTo(2278 + 100, 9);
    expect(projectTextOnAxis(flat, 90).length).toBeCloseTo(H + 100, 9);
    // текст, повёрнутый вдоль линии, даёт ту же длину разрыва
    const along = placeText(layout, { padding: 50, rotationDeg: 30 });
    expect(projectTextOnAxis(along, 30).length).toBeCloseTo(2278 + 100, 9);
    // отсчёт от другой точки сдвигает start/end, но не длину
    const shifted = projectTextOnAxis(flat, 0, [100, 0]);
    expect(shifted.start).toBeCloseTo(-1139 - 50 - 100, 9);
    expect(shifted.length).toBeCloseTo(2378, 9);
  });
  it('rejects bad input', () => {
    const { fonts, standard } = setup();
    const layout = measureText('A', standard, fonts);
    expect(() => placeText(layout, { position: [NaN, 0] })).toThrow(CadTypographyError);
    expect(() => placeText(layout, { rotationDeg: Infinity })).toThrow(CadTypographyError);
    expect(() => placeText(layout, { padding: -1 })).toThrow(CadTypographyError);
    expect(() => projectTextOnAxis(placeText(layout), NaN)).toThrow(CadTypographyError);
  });
});
