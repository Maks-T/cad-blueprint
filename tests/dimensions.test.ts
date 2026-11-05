import { describe, expect, it } from 'vitest';
import {
  CadDimensionError,
  CadDocument,
  buildDimensionGeometry,
  dimAligned,
  dimAngular,
  dimBaseline,
  dimChain,
  dimDiameter,
  dimLinear,
  dimRadius,
  leader,
  parseEntity,
} from '../src';
import type { DimGeometryLine, DimensionEntity, DimensionGeometry, Point2, RenderContext } from '../src';

const closeTo = (a: readonly number[], b: readonly number[], digits = 6): void => {
  expect(a.length).toBe(b.length);
  a.forEach((v, i) => expect(v).toBeCloseTo(b[i] as number, digits));
};

function ctxOf(scale = '1:10', coordinateSystem: 'cartesian' | 'screen' = 'cartesian'): RenderContext {
  return new CadDocument({ gost: true, settings: { scale, coordinateSystem } }).context();
}

const lines = (g: DimensionGeometry, role: string): DimGeometryLine[] =>
  g.curves.filter((c): c is DimGeometryLine => c.kind === 'line' && c.role === role);

describe('dimensions: builders', () => {
  it('linear: direction auto / horizontal / vertical, offset or "at"', () => {
    expect(dimLinear([0, 0], [100, 10]).angleDeg).toBe(0);
    expect(dimLinear([0, 0], [10, 100]).angleDeg).toBe(90);
    expect(dimLinear([0, 0], [100, 0], { at: [50, -40] }).offset).toBeCloseTo(-40);
    expect(dimLinear([0, 0], [0, 100], { direction: 'vertical', at: [30, 0] }).offset).toBeCloseTo(-30);
    expect(() => dimLinear([0, 0], [1, 0], { offset: 1, at: [0, 1] })).toThrow(/not both/);
  });

  it('round-trips through JSON (angleDeg ↔ direction)', () => {
    const list: DimensionEntity[] = [
      dimLinear([0, 0], [100, 0], { offset: -10, text: '<> min' }),
      dimAligned([0, 0], [30, 40], { offset: 5 }),
      dimChain([[0, 0], [10, 0], [30, 0]], { offset: -5, texts: [null, 'x'] }),
      dimBaseline([0, 0], [[10, 0], [30, 0]], { offset: -5, spacing: 8 }),
      dimAngular([0, 0], [10, 0], [0, 10], { radius: 5 }),
      dimRadius([0, 0], 5, { angleDeg: 30 }),
      dimDiameter([0, 0], 5),
      leader([[0, 0], [10, 10]], 'Узел\nА', { shelfLength: 20 }),
    ];
    for (const d of list) expect(parseEntity(JSON.parse(JSON.stringify(d)))).toEqual(d);
  });
});

describe('dimensions: linear geometry (шаг 3.1.1)', () => {
  const ctx = ctxOf('1:10');

  it('horizontal: extension lines with offset / overshoot, dimension line with two terminators, text above', () => {
    const g = buildDimensionGeometry(dimLinear([0, 0], [1000, 0], { offset: -100 }), ctx);
    expect(g.values).toEqual([1000]);
    const ext = lines(g, 'extension');
    expect(ext).toHaveLength(2);
    // ГОСТ-стиль: отступ 0, выпуск 2 мм бумаги = 20 ед. при 1:10.
    closeTo(ext[0]!.from, [0, 0]);
    closeTo(ext[0]!.to, [0, -120]);
    const dim = lines(g, 'dimension');
    expect(dim).toHaveLength(1);
    expect([dim[0]!.startTerminator, dim[0]!.endTerminator]).toEqual([true, true]);
    expect(g.terminators.map((t) => t.angleDeg).sort()).toEqual([0, 180]);
    const t = g.texts[0]!;
    expect(t.text).toBe('1000');
    expect(t.anchor).toBe('bottom-center');
    closeTo(t.position, [500, -100 + 10]); // зазор 1 мм = 10 ед.
    expect(t.rotationDeg).toBe(0);
    expect(t.height).toBeCloseTo(35);
  });

  it('vertical: text rotated 90° and placed left of the line (above for a reader)', () => {
    const g = buildDimensionGeometry(dimLinear([0, 0], [0, 500], { direction: 'vertical', offset: 100 }), ctx);
    const t = g.texts[0]!;
    expect(t.rotationDeg).toBe(90);
    expect(t.position[0]).toBeLessThan(-100);
  });

  it('aligned: parallel to the slanted edge, value = true length', () => {
    const g = buildDimensionGeometry(dimAligned([0, 0], [300, 400], { offset: 50 }), ctx);
    expect(g.values[0]).toBeCloseTo(500);
    const d = lines(g, 'dimension')[0]!;
    closeTo([d.to[0] - d.from[0], d.to[1] - d.from[1]], [300, 400]);
    expect(g.texts[0]!.rotationDeg).toBeCloseTo((Math.atan2(400, 300) * 180) / Math.PI);
  });

  it('small dimension: arrows go outside, text moves past the second terminator', () => {
    const g = buildDimensionGeometry(dimLinear([0, 0], [30, 0], { offset: -50 }), ctx);
    const dim = lines(g, 'dimension');
    expect(dim.filter((l) => l.endTerminator)).toHaveLength(2);
    expect(g.terminators.map((t) => t.angleDeg).sort((a, b) => a - b)).toEqual([0, 180]);
    // Стрелки снаружи смотрят внутрь: у левой точки остриё направлено вправо.
    const left = g.terminators.find((t) => Math.abs(t.tip[0]) < 1e-9)!;
    expect(left.angleDeg).toBe(0);
    expect(g.texts[0]!.position[0]).toBeGreaterThan(30);
  });

  it('centered text breaks the dimension line', () => {
    const doc = new CadDocument({ gost: true, settings: { scale: '1:10' } });
    doc.dimStyles.create('C', { textStyle: 'GOST', textPosition: 'centered' });
    const g = buildDimensionGeometry(dimLinear([0, 0], [1000, 0], { offset: -100, style: 'C' }), doc.context());
    const dim = lines(g, 'dimension');
    expect(dim).toHaveLength(2);
    expect(dim[0]!.to[0]).toBeLessThan(500);
    expect(dim[1]!.from[0]).toBeGreaterThan(500);
    expect([dim[0]!.startTerminator, dim[1]!.endTerminator]).toEqual([true, true]);
  });

  it('tick terminators extend the dimension line past the extension lines', () => {
    const doc = new CadDocument({ gost: true, settings: { scale: '1:10' } });
    doc.dimStyles.create('T', { textStyle: 'GOST', terminatorType: 'tick', dimLineOvershoot: 2 });
    const g = buildDimensionGeometry(dimLinear([0, 0], [1000, 0], { offset: -100, style: 'T' }), doc.context());
    const xs = lines(g, 'dimension').flatMap((l) => [l.from[0], l.to[0]]);
    expect(Math.min(...xs)).toBeCloseTo(-20);
    expect(Math.max(...xs)).toBeCloseTo(1020);
  });

  it('text override with <> and a missing style', () => {
    const g = buildDimensionGeometry(dimLinear([0, 0], [1250, 0], { text: '<> (max)' }), ctx);
    expect(g.texts[0]!.text).toBe('1250 (max)');
    expect(() => buildDimensionGeometry(dimLinear([0, 0], [1, 0], { style: 'Нет' }), ctx)).toThrow(CadDimensionError);
    expect(() => buildDimensionGeometry(dimLinear([0, 0], [0, 10], { direction: 'horizontal' }), ctx)).toThrow(/zero/);
  });
});

describe('dimensions: chains and baselines (шаг 3.1.2)', () => {
  const ctx = ctxOf('1:10');

  it('chain: one dimension line, shared extension lines are not duplicated', () => {
    const g = buildDimensionGeometry(dimChain([[0, 0], [300, 0], [1000, 0]], { offset: -200 }), ctx);
    expect(g.values).toEqual([300, 700]);
    expect(lines(g, 'extension')).toHaveLength(3);
    const ys = new Set(lines(g, 'dimension').map((l) => l.from[1]));
    expect([...ys]).toEqual([-200]);
  });

  it('baseline: sorted by length, each next line one baselineSpacing further', () => {
    const g = buildDimensionGeometry(dimBaseline([0, 0], [[1000, 0], [300, 0], [600, 0]], { offset: -200 }), ctx);
    expect(g.values).toEqual([300, 600, 1000]);
    const levels = [...new Set(lines(g, 'dimension').map((l) => l.from[1]))];
    expect(levels).toEqual([-200, -270, -340]); // 7 мм = 70 ед.
    // Выносная базы — одна, от дальнего размера.
    expect(lines(g, 'extension').filter((l) => Math.abs(l.from[0]) < 1e-9)).toHaveLength(1);
  });
});

describe('dimensions: angular, radius, diameter, leader (шаг 3.1.3)', () => {
  const ctx = ctxOf('1:10');

  it('angular: value in degrees, arc between the rays, tangent terminators', () => {
    const g = buildDimensionGeometry(dimAngular([0, 0], [1000, 0], [0, 1000], { radius: 500 }), ctx);
    expect(g.values[0]).toBeCloseTo(90);
    expect(g.texts[0]!.text).toBe('90°');
    const arcs = g.curves.filter((c) => c.kind === 'arc');
    expect(arcs).toHaveLength(1);
    const tips = g.terminators.map((t) => [Math.round(t.tip[0]), Math.round(t.tip[1]), Math.round(t.angleDeg)]);
    expect(tips).toContainEqual([0, 500, 180]);
    expect(tips).toContainEqual([500, 0, 270]);
    // Текст снаружи дуги, по касательной.
    const p = g.texts[0]!.position;
    expect(Math.hypot(p[0], p[1])).toBeGreaterThan(500);
    expect(g.texts[0]!.rotationDeg).toBeCloseTo(-45);
  });

  it('angular clockwise measures the other side', () => {
    const g = buildDimensionGeometry(dimAngular([0, 0], [10, 0], [0, 10], { radius: 5, counterclockwise: false }), ctxOf('1:1'));
    expect(g.values[0]).toBeCloseTo(270);
  });

  it('radius and diameter texts use the style prefixes', () => {
    expect(buildDimensionGeometry(dimRadius([0, 0], 300), ctx).texts[0]!.text).toBe('R300');
    const d = buildDimensionGeometry(dimDiameter([0, 0], 300, { angleDeg: 0 }), ctx);
    expect(d.texts[0]!.text).toBe('Ø600');
    expect(d.terminators).toHaveLength(2);
    const r = buildDimensionGeometry(dimRadius([0, 0], 300, { angleDeg: 0 }), ctx);
    expect(r.terminators).toHaveLength(1);
    closeTo(r.terminators[0]!.tip, [300, 0]);
  });

  it('small radius: text moves outside the circle', () => {
    const g = buildDimensionGeometry(dimRadius([0, 0], 20, { angleDeg: 0 }), ctx);
    expect(g.texts[0]!.position[0]).toBeGreaterThan(20);
  });

  it('leader: arrow at the first point, shelf under the text towards the last segment', () => {
    const g = buildDimensionGeometry(leader([[0, 0], [200, 200]], 'Узел 1'), ctx);
    expect(g.curves[0]!.startTerminator).toBe(true);
    const shelf = lines(g, 'shelf')[0]!;
    closeTo(shelf.from, [200, 200]);
    expect(shelf.to[0]).toBeGreaterThan(200);
    expect(g.texts[0]!.anchor).toBe('bottom-left');
    const left = buildDimensionGeometry(leader([[0, 0], [-200, 200]], 'A'), ctx);
    expect(left.texts[0]!.anchor).toBe('bottom-right');
    expect(lines(left, 'shelf')[0]!.to[0]).toBeLessThan(-200);
  });
});

describe('dimensions: screen coordinate system', () => {
  it('geometry is the Y-mirror of the cartesian one; text stays readable (visual rotation)', () => {
    const cart = buildDimensionGeometry(dimAligned([0, 0], [300, 400], { offset: 50 }), ctxOf('1:10'));
    const scr = buildDimensionGeometry(dimAligned([0, 0], [300, -400], { offset: -50 }), ctxOf('1:10', 'screen'));
    const fy = (p: Point2): number[] => [p[0], -p[1]];
    expect(scr.curves.length).toBe(cart.curves.length);
    scr.curves.forEach((c, i) => {
      const o = cart.curves[i]!;
      if (c.kind === 'line' && o.kind === 'line') {
        closeTo(fy(c.from), o.from);
        closeTo(fy(c.to), o.to);
      }
    });
    closeTo(fy(scr.texts[0]!.position), cart.texts[0]!.position);
    expect(scr.texts[0]!.rotationDeg).toBeCloseTo(cart.texts[0]!.rotationDeg);
  });
});
