import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  CadDocument,
  CadPath,
  arc,
  circle,
  decodeDxfString,
  dimLinear,
  ellipse,
  encodeDxfString,
  encodeMText,
  exportDxf,
  importDxf,
  insert,
  leader,
  line,
  mtext,
  parseDxfToBlock,
  plainMText,
  polygon,
  rect,
  renderSvg,
  renderSvgResult,
  spline,
  text,
  viewport,
} from '../src';
import type { PolylineEntity } from '../src';

function demo(coordinateSystem: 'cartesian' | 'screen' = 'cartesian'): CadDocument {
  const doc = new CadDocument({ gost: true, settings: { scale: '1:10', coordinateSystem } });
  doc.layers.create('Контур', { color: '#0f172a', lineWeight: 0.5 });
  doc.layers.create('Сталь', { color: '#1d4ed8', hatch: 'steel-45' });
  doc.layers.create('Оси', { color: '#dc2626', lineType: 'dashdot' });
  doc.layers.create('Скрытый', { visible: false });
  doc.blocks.define('Ступень', [polygon(CadPath.start(0, 0).right(300).up(40).left(300).close().filletAll(5).build(), { layer: 'Контур' }), line([150, -20], [150, 60])]);
  doc.addSheet('Лист 1', [
    insert('Ступень', [0, 0], { layer: 'Оси' }),
    insert('Ступень', [280, 170], { rotationDeg: 10, scaleX: -1 }),
    polygon([[0, 0], [1100, 0], [1100, -60], [0, -60]], { layer: 'Сталь', fill: 'hatch', holes: [[[100, -20], [200, -20], [200, -40], [100, -40]]] }),
    dimLinear([0, 0], [1100, 0], { offset: -150, layer: 'Контур' }),
    leader([[150, 40], [250, 160]], 'Ступень <300>'),
    text([0, 800], 'Заголовок & «кавычки»', { height: 7, color: '#ff0000' }),
    mtext([800, 800], 'Две\nстроки', { anchor: 'top-center' }),
    circle([1500, 300], 100, { fill: 'solid' }),
    arc([1500, 0], 80, 0, 200),
    ellipse([1900, 300], 120, 60, { rotationDeg: 30, fill: '#fde68a' }),
    spline([[1300, -200], [1400, -100], [1500, -300], [1700, -150]]),
    rect(1800, -300, 200, 100, { cornerRadius: 20 }),
    line([0, 0], [10, 10], { layer: 'Скрытый' }),
    viewport([insert('Ступень'), dimLinear([0, 0], [300, 0], { offset: -30 })], { position: [0, -900], scale: '1:2', title: 'Узел А', clip: { minX: -40, minY: -70, maxX: 400, maxY: 100 }, frame: true }),
  ]);
  return doc;
}

const count = (s: string, re: RegExp): number => (s.match(re) ?? []).length;

describe('SVG renderer (Этап 5.2)', () => {
  const doc = demo();
  const svg = renderSvg(doc);

  it('is a single well-formed <svg> with style, defs and content', () => {
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
    expect(svg.endsWith('</svg>')).toBe(true);
    expect(svg).toContain('<style>');
    expect(count(svg, /<defs>/g)).toBe(1);
    expect(svg).toMatch(/width="[\d.]+mm" height="[\d.]+mm"/);
  });

  it('<defs>: markers for terminators, hatch patterns, symbols for blocks (with scale variants), clip paths', () => {
    expect(count(svg, /<marker /g)).toBeGreaterThanOrEqual(1);
    expect(svg).toContain('orient="auto-start-reverse"');
    expect(count(svg, /<pattern /g)).toBe(1);
    expect(count(svg, /<symbol /g)).toBe(3); // ступень на «Оси», на «0» и внутри экрана 1:2
    expect(count(svg, /<use /g)).toBe(3);
    expect(svg).toContain('<clipPath');
    expect(svg).toMatch(/marker-start="url\(#cad-mk\d+\)" marker-end="url\(#cad-mk\d+\)"/);
  });

  it('layer classes, overrides as inline style (beats the class), fonts and escaping', () => {
    expect(svg).toMatch(/\.cad-s\d+\{stroke:#0f172a;stroke-width:5;fill:none/); // 0.5 мм при 1:10
    expect(svg).toContain('style="fill:#ff0000"');
    expect(svg).toContain('Заголовок &amp; «кавычки»');
    expect(svg).toContain('font-family:"GOST type B"');
    expect(svg).toContain('<tspan x="0"');
    expect(svg).toContain('data-layer="Контур"');
  });

  it('hidden layers are omitted by default and emitted with display:none for the viewer', () => {
    expect(svg).not.toContain('data-layer="Скрытый"');
    const hide = renderSvgResult(doc, { hiddenLayers: 'hide', idPrefix: 'v1' });
    expect(hide.svg).toContain('data-layer="Скрытый"');
    const cls = hide.layerClasses.get('Скрытый')!;
    expect(hide.svg).toContain(`.${cls}{display:none}`);
    expect(hide.svg).toContain('class="v1"');
  });

  it('Y axis: cartesian flips to SVG, screen does not', () => {
    const a = renderSvgResult(doc, { padding: false });
    expect(a.viewBox.y).toBeCloseTo(-a.bounds.maxY);
    const s = new CadDocument({ settings: { coordinateSystem: 'screen' } });
    s.addSheet('s', [line([0, 0], [10, 20])]);
    expect(renderSvg(s, { padding: false })).toContain('d="M0 0 L10 20"');
    const c = new CadDocument();
    c.addSheet('s', [line([0, 0], [10, 20])]);
    expect(renderSvg(c, { padding: false })).toContain('d="M0 0 L10 -20"');
  });

  it('text inside a mirrored insert stays readable (MIRRTEXT = 0)', () => {
    const d = new CadDocument();
    d.blocks.define('T', [text([10, 0], 'Узел', { height: 5 })]);
    d.addSheet('s', [insert('T', [0, 0]), insert('T', [0, 0], { scaleX: -1 }), insert('T', [0, 100], { scaleY: -1 })]);
    const out = renderSvg(d, { padding: false });
    expect(count(out, /<symbol /g)).toBe(3);
    expect(out).toContain('scale(-1 1)'); // зеркало по X: буквы отражены обратно, выравнивание вправо
    expect(out).toContain('text-anchor="end"');
    expect(out).toContain('scale(1 -1)'); // зеркало по Y: текст не встаёт «вверх ногами»
  });

  it('size options and prefix validation', () => {
    expect(renderSvg(doc, { size: 'none' })).not.toMatch(/<svg[^>]* width=/);
    expect(renderSvg(doc, { size: { width: 800 } })).toMatch(/<svg[^>]* width="800"/);
    expect(() => renderSvg(doc, { idPrefix: '1bad' })).toThrow(/idPrefix/);
  });
});

describe('DXF export (Этап 5.3.1)', () => {
  it('R2007 (default): sections, tables, blocks, UTF-8 names, unique handles', () => {
    const dxf = exportDxf(demo());
    const lines = dxf.split('\n');
    expect(lines.slice(0, 2)).toEqual(['0', 'SECTION']);
    expect(dxf).toContain('AC1021');
    for (const t of ['LTYPE', 'LAYER', 'STYLE', 'BLOCK_RECORD', 'DIMSTYLE', 'APPID']) expect(dxf).toContain(`\n2\n${t}\n`);
    for (const s of ['HEADER', 'TABLES', 'BLOCKS', 'ENTITIES', 'OBJECTS']) expect(dxf).toContain(`\n2\n${s}\n`);
    expect(dxf.trimEnd().endsWith('EOF')).toBe(true);
    expect(dxf).toContain('\nКонтур\n');
    expect(dxf).toContain('\nСтупень\n');
    expect(dxf).toContain('Ступень$A1'); // вариант блока для экрана 1:2
    expect(dxf).toContain('_VIEWPORT1');
    expect(dxf).toContain('\nHATCH\n');
    expect(dxf).toContain('\nSOLID\n');
    const handles: string[] = [];
    for (let i = 0; i + 1 < lines.length; i += 2) if (lines[i] === '5' || lines[i] === '105') handles.push(lines[i + 1] as string);
    expect(new Set(handles).size).toBe(handles.length);
  });

  it('R2000: non-ASCII as \\U+XXXX', () => {
    const dxf = exportDxf(demo(), { version: 'R2000' });
    expect(dxf).toContain('AC1015');
    expect(dxf).toContain('\\U+041A\\U+043E\\U+043D\\U+0442\\U+0443\\U+0440');
    expect(/[^\x00-\x7f]/.test(dxf)).toBe(false);
    expect(encodeDxfString('Ø12')).toBe('\\U+00D812');
    expect(decodeDxfString('\\U+00D812')).toBe('Ø12');
    expect(encodeMText('a{b}\\c\nd')).toBe('a\\{b\\}\\\\c\\Pd');
    expect(plainMText('{\\fArial|b0;Первая}\\PВторая \\H2.5;x')).toBe('Первая\nВторая x');
  });

  it('screen documents are written Y-up (mirrored back)', () => {
    const s = new CadDocument({ settings: { coordinateSystem: 'screen' } });
    s.addSheet('s', [line([0, 0], [10, 20])]);
    expect(exportDxf(s)).toMatch(/\n11\n10\n21\n-20\n/);
  });
});

describe('DXF import (Этап 5.3.2)', () => {
  const fixture = readFileSync(new URL('./fixtures/profile-r2000.dxf', import.meta.url));

  it('reads a factory profile: units (cm → mm), holes, nested blocks, text', () => {
    const r = importDxf(fixture, { name: 'Профиль', fill: 'hatch' });
    expect(r.fileUnits).toBe('cm');
    expect(r.warnings).toEqual([]);
    expect(r.layers.map((l) => l.name)).toContain('ТЕКСТ');
    const outer = r.block.entities.find((e): e is PolylineEntity => e.type === 'polyline')!;
    expect(outer.holes).toHaveLength(2); // прямоугольный вырез и отверстие
    expect(outer.fill).toBe('hatch');
    expect(outer.vertices.some((v) => v.length === 3)).toBe(true); // скругление (bulge) сохранено
    expect(Math.max(...outer.vertices.map((v) => v[0]))).toBeCloseTo(40); // 4 см → 40 мм
    const t = r.block.entities.find((e) => e.type === 'text');
    expect(t && t.type === 'text' && t.value).toBe('Профиль 40×30');
    expect(t && t.type === 'text' && t.height).toBeCloseTo(3.5);
    // Вставка BOLT (поворот 90°, масштаб 2) раскрыта: окружность r = 0.1 см · 2 = 2 мм в точке (50, 10).
    const bolt = r.block.entities.find((e) => e.type === 'circle' && Math.abs(e.radius - 2) < 1e-9 && e.center[0] > 40);
    expect(bolt && bolt.type === 'circle' && bolt.center[1]).toBeCloseTo(10);
  });

  it('base point, target layer and colors', () => {
    const b = parseDxfToBlock(fixture, { basePoint: 'min', layer: 'Профиль', units: 'cm' });
    expect(b.entities.every((e) => e.layer === 'Профиль')).toBe(true);
    expect(b.basePoint[1]).toBeCloseTo(-0.5);
    const keep = importDxf(fixture, { colors: 'keep' });
    expect(keep.block.entities.some((e) => e.color !== null)).toBe(false); // в файле цвета по слою
  });

  it('round trip: our DXF (R2007 and R2000) reads back with the same geometry', () => {
    const doc = new CadDocument();
    doc.layers.create('Контур');
    doc.addSheet('s', [
      polygon([[0, 0], [100, 0, 0.5], [100, 50], [0, 50]], { layer: 'Контур', holes: [[[10, 10], [20, 10], [20, 20]]] }),
      arc([0, 0], 10, 30, 120, { counterclockwise: false }),
      ellipse([5, 5], 4, 2, { rotationDeg: 15, startAngleDeg: 10, endAngleDeg: 200 }),
      text([1, 2], 'Ø12 мм', { anchor: 'middle-center', height: 5 }),
    ]);
    for (const version of ['R2007', 'R2000'] as const) {
      const back = importDxf(exportDxf(doc, { version }), { name: 'RT' });
      const types = back.block.entities.map((e) => e.type).sort();
      expect(types).toEqual(['arc', 'ellipse', 'polyline', 'text']);
      const p = back.block.entities.find((e): e is PolylineEntity => e.type === 'polyline')!;
      expect(p.holes).toHaveLength(1);
      expect(p.vertices[1]![2]).toBeCloseTo(0.5);
      const t = back.block.entities.find((e) => e.type === 'text');
      expect(t && t.type === 'text' && [t.value, t.anchor]).toEqual(['Ø12 мм', 'middle-center']);
      const a = back.block.entities.find((e) => e.type === 'arc');
      // Дуга по часовой 30° → 120° записана в DXF против часовой 120° → 30°.
      expect(a && a.type === 'arc' && [a.startAngleDeg, a.endAngleDeg, a.counterclockwise]).toEqual([120, 30, true]);
    }
  });

  it('reports unsupported entities and invalid files', () => {
    const dxf = '0\nSECTION\n2\nENTITIES\n0\nDIMENSION\n8\n0\n0\nWIPEOUT\n8\n0\n0\nENDSEC\n0\nEOF\n';
    expect(importDxf(dxf).warnings).toEqual(['DIMENSION entities are skipped', 'WIPEOUT: entity type is not supported']);
    expect(() => importDxf('abc\nx\n')).toThrow(/invalid group code/);
    expect(() => importDxf(dxf, { source: 'NOPE' })).toThrow(/not found/);
  });
});
