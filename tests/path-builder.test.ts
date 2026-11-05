import { describe, expect, it } from 'vitest';
import { CadError, CadPath, CadPathError } from '../src';
import type { PathArcSegment, PathData, PathVertex } from '../src';

type P = readonly [number, number];

const close = (a: readonly number[], b: readonly number[], digits = 9): void => {
  expect(a.length).toBe(b.length);
  a.forEach((v, i) => expect(v).toBeCloseTo(b[i] as number, digits));
};

const arcs = (d: PathData): PathArcSegment[] => d.segments.filter((s): s is PathArcSegment => s.type === 'arc');

/** Каждый сегмент начинается там, где закончился предыдущий; у замкнутого — последний возвращается в начало. */
function expectContinuous(d: PathData): void {
  for (let i = 0; i < d.segments.length - 1; i++) {
    close((d.segments[i] as { to: P }).to, (d.segments[i + 1] as { from: P }).from, 9);
  }
  if (d.closed) {
    close((d.segments[d.segments.length - 1] as { to: P }).to, (d.segments[0] as { from: P }).from, 9);
  }
}

const dist = (a: P, b: P): number => Math.hypot(a[0] - b[0], a[1] - b[1]);

describe('CadPath: turtle (шаг 2.2.1)', () => {
  it('draws with right / up / left / down and returns this for chaining', () => {
    const path = CadPath.start(10, 20);
    expect(path.right(5)).toBe(path);
    path.up(3).left(2).down(1);
    const d = path.build();
    expect(d.closed).toBe(false);
    expect(d.vertices).toEqual([
      [10, 20],
      [15, 20],
      [15, 23],
      [13, 23],
      [13, 22],
    ]);
    expect(d.segments.map((s) => s.type)).toEqual(['line', 'line', 'line', 'line']);
    expect(d.length).toBe(5 + 3 + 2 + 1);
  });

  it('supports moveTo / lineTo / lineBy and defaults the start to the origin', () => {
    const d = new CadPath().lineTo(4, 0).lineBy(0, 3).build();
    expect(d.vertices).toEqual([
      [0, 0],
      [4, 0],
      [4, 3],
    ]);
    const e = CadPath.start().moveTo(1, 1).moveTo(2, 2).lineTo(5, 2).build();
    expect(e.vertices[0]).toEqual([2, 2]);
  });

  it('polar() is exact for multiples of 90° and correct for other angles', () => {
    const d = CadPath.start(0, 0).polar(10, 0).polar(10, 90).polar(10, 180).polar(10, 270).build();
    expect(d.vertices).toEqual([
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
      [0, 0],
    ]);
    const e = CadPath.start(0, 0).polar(2, 30).build();
    close(e.vertices[1] as P, [Math.sqrt(3), 1]);
    const f = CadPath.start(0, 0).polar(1, -90).polar(1, 450).build(); // угол по модулю 360°
    expect(f.vertices).toEqual([
      [0, 0],
      [0, -1],
      [0, 0],
    ]);
  });

  it('skips zero-length segments and never produces -0', () => {
    const d = CadPath.start(0, 0).right(0).up(5).lineTo(0, 5).left(0).right(3).build();
    expect(d.segments).toHaveLength(2);
    const e = CadPath.start(0, 0).left(0).right(1).down(0).build();
    expect(Object.is(e.vertices[0]?.[0], 0)).toBe(true);
    const f = CadPath.start(1, 1).left(1).down(1).build();
    for (const v of f.vertices) for (const c of v) expect(Object.is(c, -0)).toBe(false);
  });

  it('accepts negative distances as the opposite direction', () => {
    expect(CadPath.start(0, 0).right(-5).build().vertices[1]).toEqual([-5, 0]);
    expect(CadPath.start(0, 0).up(-5).build().vertices[1]).toEqual([0, -5]);
  });

  it('allows moveTo only before the first segment', () => {
    const path = CadPath.start(0, 0).right(1);
    expect(() => path.moveTo(5, 5)).toThrow(CadPathError);
  });

  it('rejects non-finite numbers with a field name', () => {
    expect(() => CadPath.start(0, 0).right(NaN)).toThrow(/right/);
    expect(() => CadPath.start(0, 0).lineTo(1, Infinity)).toThrow(/lineTo\.y/);
    expect(() => CadPath.start(Number.NaN, 0)).toThrow(CadPathError);
    expect(() => CadPath.start(0, 0).polar(1, 'x' as unknown as number)).toThrow(/polar/);
    try {
      CadPath.start(0, 0).up(Infinity);
    } catch (e) {
      expect(e).toBeInstanceOf(CadError);
      expect((e as CadPathError).field).toBe('up');
    }
  });

  it('build() on an empty path throws; the snapshot is frozen and independent of later changes', () => {
    expect(() => CadPath.start(0, 0).build()).toThrow(/empty/);
    const path = CadPath.start(0, 0).right(1);
    const d1 = path.build();
    path.up(1);
    expect(d1.segments).toHaveLength(1);
    expect(path.build().segments).toHaveLength(2);
    expect(Object.isFrozen(d1)).toBe(true);
    expect(Object.isFrozen(d1.vertices)).toBe(true);
    expect(Object.isFrozen(d1.segments[0])).toBe(true);
  });

  it('exposes current / startPosition / segmentCount', () => {
    const path = CadPath.start(1, 2).right(3);
    expect(path.current).toEqual([4, 2]);
    expect(path.startPosition).toEqual([1, 2]);
    expect(path.segmentCount).toBe(1);
    expect(new CadPath().current).toEqual([0, 0]);
  });
});

describe('CadPath: screen coordinate system', () => {
  it('up() goes towards −Y, down() towards +Y, polar 90° is "up" on screen', () => {
    const d = CadPath.start(0, 0, { coordinateSystem: 'screen' }).up(10).down(4).polar(2, 90).build();
    expect(d.vertices).toEqual([
      [0, 0],
      [0, -10],
      [0, -6],
      [0, -8],
    ]);
  });

  it('"ccw" is counter-clockwise as seen on screen, i.e. the opposite sign of bulge', () => {
    const cart = CadPath.start(0, 0).arcTo(10, 0, { radius: 5, sweep: 'ccw' }).build();
    const scr = CadPath.start(0, 0, { coordinateSystem: 'screen' }).arcTo(10, 0, { radius: 5, sweep: 'ccw' }).build();
    expect((cart.vertices[0] as readonly number[])[2]).toBe(1);
    expect((scr.vertices[0] as readonly number[])[2]).toBe(-1);
    // Числовое направление обхода в данных — «по часовой» (так же, как bulge < 0).
    expect(arcs(scr)[0]?.counterclockwise).toBe(false);
  });

  it('rejects an unknown coordinate system and is kept by clone()', () => {
    expect(() => new CadPath({ coordinateSystem: 'polar' as never })).toThrow(CadPathError);
    const copy = CadPath.start(0, 0, { coordinateSystem: 'screen' }).clone().up(1).build();
    expect(copy.vertices[1]).toEqual([0, -1]);
  });
});

describe('CadPath: close()', () => {
  it('adds the closing segment; the last vertex does not repeat the first', () => {
    const path = CadPath.start(0, 0).right(10).up(5).left(10).close();
    expect(path.isClosed).toBe(true);
    expect(path.current).toEqual([0, 0]);
    const d = path.build();
    expect(d.closed).toBe(true);
    expect(d.vertices).toEqual([
      [0, 0],
      [10, 0],
      [10, 5],
      [0, 5],
    ]);
    expect(d.segments).toHaveLength(4);
    expect(d.length).toBe(30);
    expectContinuous(d);
  });

  it('reuses the last segment when it already returns to the start', () => {
    const d = CadPath.start(0, 0).right(10).up(5).left(10).down(5).close().build();
    expect(d.vertices).toHaveLength(4);
    expect(d.segments).toHaveLength(4);
  });

  it('closes with an arc: rounded end, bulge stays on the last vertex', () => {
    const d = CadPath.start(0, 0).right(10).arcTo(0, 0, { bulge: 1 }).close().build();
    expect(d.closed).toBe(true);
    expect(d.vertices).toEqual([
      [0, 0],
      [10, 0, 1],
    ]);
    expect(d.length).toBeCloseTo(10 + Math.PI * 5, 9);
  });

  it('rejects a degenerate contour, empty paths and further drawing', () => {
    expect(() => CadPath.start(0, 0).close()).toThrow(CadPathError);
    expect(() => CadPath.start(0, 0).right(5).close()).toThrow(/three/);
    const path = CadPath.start(0, 0).right(5).up(5).close();
    expect(() => path.right(1)).toThrow(/closed/);
    expect(() => path.close()).toThrow(/closed/);
    expect(() => path.arcTo(1, 1, { radius: 5 })).toThrow(/closed/);
  });
});

describe('CadPath: arcTo / arcBy', () => {
  it('by radius: a semicircle has bulge 1 and the right centre', () => {
    const d = CadPath.start(0, 0).arcTo(10, 0, { radius: 5 }).build();
    expect(d.vertices).toEqual([[0, 0, 1], [10, 0]]);
    const a = arcs(d)[0] as PathArcSegment;
    expect(a.center).toEqual([5, 0]);
    expect(a.radius).toBe(5);
    expect(a.counterclockwise).toBe(true);
    expect(a.sweepDeg).toBeCloseTo(180, 9);
    expect(a.startAngleDeg).toBe(180);
    expect(a.endAngleDeg).toBe(0);
    expect(a.length).toBeCloseTo(Math.PI * 5, 9);
  });

  it('by radius: sweep and large choose one of four arcs', () => {
    const small = arcs(CadPath.start(0, 0).arcTo(10, 0, { radius: 10 }).build())[0] as PathArcSegment;
    const smallCw = arcs(CadPath.start(0, 0).arcTo(10, 0, { radius: 10, sweep: 'cw' }).build())[0] as PathArcSegment;
    const large = arcs(CadPath.start(0, 0).arcTo(10, 0, { radius: 10, large: true }).build())[0] as PathArcSegment;
    expect(small.sweepDeg).toBeCloseTo(60, 9);
    expect(small.counterclockwise).toBe(true);
    // Против часовой слева направо: центр слева от направления движения (выше хорды), сама дуга провисает вниз.
    close(small.center, [5, Math.sqrt(75)]);
    expect(smallCw.counterclockwise).toBe(false);
    close(smallCw.center, [5, -Math.sqrt(75)]);
    expect(large.sweepDeg).toBeCloseTo(300, 9);
    close(large.center, [5, -Math.sqrt(75)]); // большая дуга: центр по другую сторону хорды
    expect(large.radius).toBeCloseTo(10, 9);
  });

  it('by radius: every arc keeps both ends on the circle', () => {
    for (const sweep of ['ccw', 'cw'] as const) {
      for (const large of [false, true]) {
        const a = arcs(CadPath.start(1, 2).arcTo(7, -3, { radius: 9, sweep, large }).build())[0] as PathArcSegment;
        expect(dist(a.center, a.from)).toBeCloseTo(9, 9);
        expect(dist(a.center, a.to)).toBeCloseTo(9, 9);
        expect(a.sweepDeg > 180).toBe(large);
      }
    }
  });

  it('by radius: too small a radius is an error, exactly half the chord is a semicircle', () => {
    expect(() => CadPath.start(0, 0).arcTo(10, 0, { radius: 4.9 })).toThrow(/too small/);
    expect(arcs(CadPath.start(0, 0).arcTo(10, 0, { radius: 5 }).build())[0]?.sweepDeg).toBeCloseTo(180, 9);
    expect(() => CadPath.start(0, 0).arcTo(10, 0, { radius: -1 })).toThrow(/radius/);
    expect(() => CadPath.start(0, 0).arcTo(10, 0, { radius: 5, large: 1 as never })).toThrow(/large/);
    expect(() => CadPath.start(0, 0).arcTo(10, 0, { radius: 5, sweep: 'left' as never })).toThrow(/sweep/);
  });

  it('by bulge: sign selects direction, 0 degrades to a line', () => {
    const pos = arcs(CadPath.start(0, 0).arcTo(10, 0, { bulge: 0.5 }).build())[0] as PathArcSegment;
    const neg = arcs(CadPath.start(0, 0).arcTo(10, 0, { bulge: -0.5 }).build())[0] as PathArcSegment;
    expect(pos.counterclockwise).toBe(true);
    expect(neg.counterclockwise).toBe(false);
    expect(pos.sweepDeg).toBeCloseTo(4 * Math.atan(0.5) * (180 / Math.PI), 9);
    expect(pos.center[1]).toBeGreaterThan(0); // ccw: центр слева от хорды, дуга провисает вниз
    expect(neg.center[1]).toBeLessThan(0);
    expect(CadPath.start(0, 0).arcTo(10, 0, { bulge: 0 }).build().segments[0]?.type).toBe('line');
    expect(() => CadPath.start(0, 0).arcTo(10, 0, { bulge: NaN })).toThrow(/bulge/);
  });

  it('bulge ↔ geometry: radius, centre and angles agree for bulges above 1', () => {
    for (const bulge of [0.2, 1, 2.5, -0.7, -3]) {
      const a = arcs(CadPath.start(0, 0).arcTo(6, 8, { bulge }).build())[0] as PathArcSegment;
      expect(dist(a.center, a.from)).toBeCloseTo(a.radius, 9);
      expect(dist(a.center, a.to)).toBeCloseTo(a.radius, 9);
      expect(a.length).toBeCloseTo((a.radius * a.sweepDeg * Math.PI) / 180, 9);
      expect(Math.tan((a.sweepDeg * Math.PI) / 180 / 4)).toBeCloseTo(Math.abs(bulge), 9);
    }
  });

  it('by centre: radius from the start point, direction from sweep', () => {
    const q = arcs(CadPath.start(10, 0).arcTo(0, 10, { center: [0, 0] }).build())[0] as PathArcSegment;
    expect(q.sweepDeg).toBeCloseTo(90, 9);
    expect(q.counterclockwise).toBe(true);
    const threeQuarters = arcs(CadPath.start(10, 0).arcTo(0, 10, { center: [0, 0], sweep: 'cw' }).build())[0] as PathArcSegment;
    expect(threeQuarters.sweepDeg).toBeCloseTo(270, 9);
    expect(() => CadPath.start(10, 0).arcTo(0, 12, { center: [0, 0] })).toThrow(/equidistant/);
    expect(() => CadPath.start(0, 0).arcTo(0, 12, { center: [0, 0] })).toThrow(/start point/);
    expect(() => CadPath.start(10, 0).arcTo(10, 0, { center: [0, 0] })).toThrow(/coincide/);
  });

  it('by three points: the middle point lies on the arc', () => {
    const d = CadPath.start(0, 0).arcTo(10, 0, { through: [5, 5] }).build();
    const a = arcs(d)[0] as PathArcSegment;
    expect(a.counterclockwise).toBe(false); // сверху слева направо — по часовой
    close(a.center, [5, 0]);
    expect(a.sweepDeg).toBeCloseTo(180, 9);
    const b = arcs(CadPath.start(0, 0).arcTo(10, 0, { through: [5, -2] }).build())[0] as PathArcSegment;
    expect(b.counterclockwise).toBe(true);
    expect(dist(b.center, [5, -2])).toBeCloseTo(b.radius, 9);
    // большая дуга: промежуточная точка далеко «за» хордой
    const c = arcs(CadPath.start(0, 0).arcTo(10, 0, { through: [5, 30] }).build())[0] as PathArcSegment;
    expect(c.sweepDeg).toBeGreaterThan(180);
    expect(dist(c.center, [5, 30])).toBeCloseTo(c.radius, 9);
    expect(() => CadPath.start(0, 0).arcTo(10, 0, { through: [5, 0] })).toThrow(/collinear/);
    expect(() => CadPath.start(0, 0).arcTo(0, 0, { through: [5, 5] })).toThrow(CadPathError);
    expect(() => CadPath.start(0, 0).arcTo(10, 0, { through: [5] as never })).toThrow(/through/);
  });

  it('tangent: continues the previous line smoothly', () => {
    const d = CadPath.start(0, 0).right(10).arcTo(20, 10, { tangent: true }).build();
    const a = arcs(d)[0] as PathArcSegment;
    close(a.center, [10, 10]);
    expect(a.radius).toBeCloseTo(10, 9);
    expect(a.counterclockwise).toBe(true);
    expect(a.sweepDeg).toBeCloseTo(90, 9);
    // касательная к дуге в начале — горизонтальная: радиус к началу вертикален
    expect(a.from[0]).toBeCloseTo(a.center[0], 9);
  });

  it('tangent: can chain after an arc (S-curve) and turns right when the end is below', () => {
    const d = CadPath.start(0, 0).right(10).arcTo(20, 10, { tangent: true }).arcTo(30, 20, { tangent: true }).build();
    const [first, second] = arcs(d) as [PathArcSegment, PathArcSegment];
    // после дуги, закончившейся направлением «вверх», конец (30, 20) лежит справа → поворот по часовой
    expect(first.counterclockwise).toBe(true);
    expect(second.counterclockwise).toBe(false);
    close(second.center, [30, 10]);
    const cw = arcs(CadPath.start(0, 0).right(10).arcTo(20, -10, { tangent: true }).build())[0] as PathArcSegment;
    expect(cw.counterclockwise).toBe(false);
  });

  it('tangent: errors without a previous segment or when no tangent arc exists', () => {
    expect(() => CadPath.start(0, 0).arcTo(5, 5, { tangent: true })).toThrow(/previous segment/);
    expect(() => CadPath.start(0, 0).right(10).arcTo(20, 0, { tangent: true })).toThrow(/lineTo/);
    expect(() => CadPath.start(0, 0).right(10).arcTo(0, 0, { tangent: true })).toThrow(/behind/);
    expect(() => CadPath.start(0, 0).right(10).arcTo(10, 0, { tangent: true })).toThrow(/coincide/);
  });

  it('arcBy is relative to the current point, including centre and through', () => {
    const a = arcs(CadPath.start(100, 50).arcBy(10, 0, { radius: 5 }).build())[0] as PathArcSegment;
    expect(a.to).toEqual([110, 50]);
    expect(a.center).toEqual([105, 50]);
    const b = arcs(CadPath.start(100, 50).arcBy(10, 0, { center: [5, 0] }).build())[0] as PathArcSegment;
    expect(b.center).toEqual([105, 50]);
    const c = arcs(CadPath.start(100, 50).arcBy(10, 0, { through: [5, 5] }).build())[0] as PathArcSegment;
    close(c.center, [105, 50]);
  });

  it('validates options: exactly one mode, no unknown keys', () => {
    const p = (): CadPath => CadPath.start(0, 0);
    expect(() => p().arcTo(1, 1, {} as never)).toThrow(/exactly one/);
    expect(() => p().arcTo(1, 1, { radius: 2, bulge: 1 } as never)).toThrow(/radius \+ bulge|bulge \+ radius/);
    expect(() => p().arcTo(1, 1, { bulge: 1, sweep: 'cw' } as never)).toThrow(/unknown/);
    expect(() => p().arcTo(1, 1, null as never)).toThrow(/options/);
    expect(() => p().arcTo(1, 1, { tangent: false } as never)).toThrow(/tangent/);
    expect(() => p().arcTo(Infinity, 1, { radius: 1 })).toThrow(/arcTo\.x/);
  });

  it('an arc with equal start and end points is rejected, not silently dropped', () => {
    expect(() => CadPath.start(0, 0).arcTo(0, 0, { bulge: 1 })).toThrow(/coincide/);
  });
});

describe('CadPath: fillet (шаг 2.2.2)', () => {
  it('rounds a right-angle corner: tangent points, centre, radius, direction', () => {
    const d = CadPath.start(0, 0).right(100).up(50).fillet(10).build();
    expect(d.vertices).toEqual([[0, 0], [90, 0, Math.tan(Math.PI / 8)], [100, 10], [100, 50]]);
    const a = arcs(d)[0] as PathArcSegment;
    close(a.center, [90, 10]);
    expect(a.radius).toBeCloseTo(10, 9);
    expect(a.sweepDeg).toBeCloseTo(90, 9);
    expect(a.counterclockwise).toBe(true); // поворот налево
    expect(d.length).toBeCloseTo(90 + (Math.PI * 10) / 2 + 40, 9);
    expectContinuous(d);
  });

  it('a right turn gives a clockwise arc (negative bulge)', () => {
    const d = CadPath.start(0, 0).right(100).down(50).fillet(10).build();
    const a = arcs(d)[0] as PathArcSegment;
    expect(a.counterclockwise).toBe(false);
    expect((d.vertices[1] as readonly number[])[2]).toBeLessThan(0);
    close(a.center, [90, -10]);
  });

  it('works for an arbitrary angle: tangent to both lines at distance r / tan(θ/2)', () => {
    // угол 60° между сегментами: идём вправо, затем поворачиваем на 120° налево
    const r = 4;
    const d = CadPath.start(0, 0).right(50).polar(50, 120).fillet(r).build();
    const a = arcs(d)[0] as PathArcSegment;
    const theta = (60 * Math.PI) / 180;
    const t = r / Math.tan(theta / 2);
    close(a.from, [50 - t, 0]);
    expect(dist(a.from, [50, 0])).toBeCloseTo(t, 9);
    expect(dist(a.to, [50, 0])).toBeCloseTo(t, 9);
    expect(a.radius).toBeCloseTo(r, 9);
    expect(a.sweepDeg).toBeCloseTo(120, 9); // π − θ
    // центр отстоит от обеих прямых ровно на r
    expect(Math.abs(a.center[1])).toBeCloseTo(r, 9);
    const line2dir: P = [Math.cos((120 * Math.PI) / 180), Math.sin((120 * Math.PI) / 180)];
    const toCenter: P = [a.center[0] - 50, a.center[1]];
    expect(Math.abs(toCenter[0] * line2dir[1] - toCenter[1] * line2dir[0])).toBeCloseTo(r, 9);
    expectContinuous(d);
  });

  it('obtuse and acute corners both stay tangent (arc ends lie on the original lines)', () => {
    for (const turn of [30, 90, 150, -45, -135]) {
      const d = CadPath.start(0, 0).right(40).polar(40, turn).fillet(3).build();
      const a = arcs(d)[0] as PathArcSegment;
      expect(a.from[1]).toBeCloseTo(0, 9); // первая точка — на первой прямой (y = 0)
      expect(dist(a.center, a.from)).toBeCloseTo(3, 9);
      expect(dist(a.center, a.to)).toBeCloseTo(3, 9);
      // радиус в точке касания перпендикулярен прямой: центр над/под точкой касания
      expect(a.center[0]).toBeCloseTo(a.from[0], 9);
    }
  });

  it('by default rounds the corner between the last two segments', () => {
    const d = CadPath.start(0, 0).right(100).up(50).fillet(5).left(100).fillet(5).build();
    expect(arcs(d)).toHaveLength(2);
    close(arcs(d)[0]?.center as P, [95, 5]);
    close(arcs(d)[1]?.center as P, [95, 45]);
  });

  it('on a closed path the default corner is the start vertex; { vertex } picks any other', () => {
    const rect = (): CadPath => CadPath.start(0, 0).right(100).up(50).left(100).close();
    const a = rect().fillet(10).build();
    expect(arcs(a)).toHaveLength(1);
    close(arcs(a)[0]?.center as P, [10, 10]);
    const b = rect().fillet(10, { vertex: 3 }).build();
    close(arcs(b)[0]?.center as P, [10, 40]);
    const c = rect().fillet(10, { vertex: 1 }).fillet(5, { vertex: 2 }).build();
    expect(arcs(c)).toHaveLength(2);
    expectContinuous(c);
  });

  it('filletAll on a rectangle: perimeter 2(w+h) − 8r + 2πr, four arcs, eight vertices', () => {
    const d = CadPath.start(0, 0).right(100).up(50).left(100).close().filletAll(10).build();
    expect(d.closed).toBe(true);
    expect(d.vertices).toHaveLength(8);
    expect(arcs(d)).toHaveLength(4);
    expect(d.length).toBeCloseTo(2 * 150 - 8 * 10 + 2 * Math.PI * 10, 9);
    expectContinuous(d);
    // порядок обхода — по часовой/против, но каждая дуга — четверть окружности радиуса 10
    for (const a of arcs(d)) {
      expect(a.radius).toBeCloseTo(10, 9);
      expect(a.sweepDeg).toBeCloseTo(90, 9);
    }
  });

  it('numbers of vertices stay stable: a later fillet does not shift earlier { vertex } references', () => {
    const d = CadPath.start(0, 0).right(100).up(100).left(100).close().fillet(5, { vertex: 1 }).fillet(5, { vertex: 2 }).fillet(5, { vertex: 3 }).fillet(5).build();
    expect(arcs(d)).toHaveLength(4);
  });

  it('radius equal to half the side collapses straight pieces: a square becomes a circle', () => {
    const d = CadPath.start(0, 0).right(100).up(100).left(100).close().filletAll(50).build();
    expect(d.segments.every((s) => s.type === 'arc')).toBe(true);
    expect(d.segments).toHaveLength(4);
    expect(d.length).toBeCloseTo(2 * Math.PI * 50, 6);
    expectContinuous(d);
  });

  it('a repeated call for the same vertex replaces the previous one', () => {
    const d = CadPath.start(0, 0).right(100).up(50).fillet(5).fillet(10, { vertex: 1 }).build();
    expect(arcs(d)).toHaveLength(1);
    expect(arcs(d)[0]?.radius).toBeCloseTo(10, 9);
    const e = CadPath.start(0, 0).right(100).up(50).fillet(5).chamfer(5).build();
    expect(arcs(e)).toHaveLength(0);
  });

  it('fillet applies after later changes are drawn: earlier fillets are not affected by lineTo order', () => {
    const a = CadPath.start(0, 0).right(100).up(50).fillet(8).left(30).build();
    const b = CadPath.start(0, 0).right(100).up(50).left(30).fillet(8, { vertex: 1 }).build();
    expect(a.vertices).toEqual(b.vertices);
  });

  it('fillet does not touch other corners and leaves the path open at the ends', () => {
    const d = CadPath.start(0, 0).right(10).up(10).left(10).fillet(2).build();
    expect(d.vertices[0]).toEqual([0, 0]);
    expect(d.vertices[d.vertices.length - 1]).toEqual([0, 10]);
    expect(d.closed).toBe(false);
  });

  it('errors: nothing to round yet, bad radius, bad vertex', () => {
    expect(() => CadPath.start(0, 0).fillet(5)).toThrow(/no corner yet/);
    expect(() => CadPath.start(0, 0).right(10).fillet(5)).toThrow(/no corner yet/);
    const p = (): CadPath => CadPath.start(0, 0).right(10).up(10);
    expect(() => p().fillet(0)).toThrow(/radius/);
    expect(() => p().fillet(-1)).toThrow(/radius/);
    expect(() => p().fillet(NaN)).toThrow(/fillet\.radius/);
    expect(() => p().fillet(1, { vertex: 0 })).toThrow(/not a corner/); // начало открытого контура
    expect(() => p().fillet(1, { vertex: 2 })).toThrow(/not a corner/); // конец открытого контура
    expect(() => p().fillet(1, { vertex: 1.5 })).toThrow(/integer/);
    expect(() => p().close().fillet(1, { vertex: 3 })).toThrow(/not a corner/);
  });

  it('errors: too large a radius is reported with the available lengths', () => {
    expect(() => CadPath.start(0, 0).right(10).up(10).fillet(10.01)).toThrow(/does not fit/);
    expect(() => CadPath.start(0, 0).right(10).up(10).fillet(10)).not.toThrow();
  });

  it('errors: neighbouring corners that compete for one segment are caught by build()', () => {
    const path = CadPath.start(0, 0).right(10).up(10).left(10).fillet(6, { vertex: 1 }).fillet(6, { vertex: 2 });
    expect(() => path.build()).toThrow(/overlap on segment 1/);
    const ok = CadPath.start(0, 0).right(10).up(10).left(10).fillet(5, { vertex: 1 }).fillet(5, { vertex: 2 });
    expect(() => ok.build()).not.toThrow();
    expect(ok.build().segments.filter((s) => s.type === 'line')).toHaveLength(2); // средняя прямая исчезла целиком
  });

  it('errors: collinear segments, 180° fold-backs, zero-length neighbours', () => {
    expect(() => CadPath.start(0, 0).right(10).right(10).fillet(1)).toThrow(/collinear/);
    expect(() => CadPath.start(0, 0).right(10).left(5).fillet(1)).toThrow(/fold back/);
    expect(() => CadPath.start(0, 0).right(10).left(5).chamfer(1)).toThrow(/fold back/);
  });

  it('errors: a corner touching an arc is not supported (and says so)', () => {
    const path = CadPath.start(0, 0).right(10).arcTo(20, 10, { tangent: true }).up(10);
    expect(() => path.fillet(2)).toThrow(/touches an arc/);
    expect(() => path.fillet(2, { vertex: 1 })).toThrow(/touches an arc/);
  });

  it('filletAll skips collinear joints and joints next to arcs instead of failing', () => {
    const d = CadPath.start(0, 0).right(10).right(10).up(10).filletAll(3).build();
    expect(arcs(d)).toHaveLength(1); // только настоящий угол в (20, 0)
    const e = CadPath.start(0, 0).right(10).arcTo(20, 10, { tangent: true }).up(10).right(10).filletAll(2).build();
    expect(arcs(e)).toHaveLength(2); // исходная дуга + скругление в (20, 20)
    expect(() => CadPath.start(0, 0).filletAll(1)).toThrow(/empty/);
  });

  it('filletAll still reports a radius that does not fit', () => {
    expect(() => CadPath.start(0, 0).right(10).up(10).left(10).close().filletAll(6).build()).toThrow(CadPathError);
  });
});

describe('CadPath: chamfer (шаг 2.2.2)', () => {
  it('cuts a corner with distances d1 (previous segment) and d2 (next)', () => {
    const d = CadPath.start(0, 0).right(100).up(50).chamfer(10, 20).build();
    expect(d.vertices).toEqual([[0, 0], [90, 0], [100, 20], [100, 50]]);
    expect(d.segments.map((s) => s.type)).toEqual(['line', 'line', 'line']);
    expect(d.length).toBeCloseTo(90 + Math.hypot(10, 20) + 30, 9);
  });

  it('d2 defaults to d1; { vertex } and chamferAll work like for fillet', () => {
    const d = CadPath.start(0, 0).right(100).up(50).chamfer(10).build();
    expect(d.vertices).toEqual([[0, 0], [90, 0], [100, 10], [100, 50]]);
    const rect = CadPath.start(0, 0).right(100).up(50).left(100).close().chamferAll(5, 10).build();
    // Начальная вершина: d1 = 5 берётся по замыкающему сегменту (вниз, до (0, 5)), d2 = 10 — по первому (вправо, до (10, 0)).
    expect(rect.vertices).toEqual([[10, 0], [95, 0], [100, 10], [100, 45], [90, 50], [5, 50], [0, 40], [0, 5]]);
    expect(rect.length).toBeCloseTo(300 - 4 * 15 + 4 * Math.hypot(5, 10), 9);
    const c = CadPath.start(0, 0).right(100).up(50).left(100).close().chamfer(10, 10, { vertex: 2 }).build();
    expect(c.segments).toHaveLength(5);
  });

  it('does not depend on the angle: works on skewed corners and keeps the distances', () => {
    const d = CadPath.start(0, 0).right(50).polar(50, 120).chamfer(7, 9).build();
    const [, cutFrom, cutTo] = d.vertices as [P, P, P, P];
    expect(dist(cutFrom, [50, 0])).toBeCloseTo(7, 9);
    expect(dist(cutTo, [50, 0])).toBeCloseTo(9, 9);
  });

  it('errors: non-positive or too long distances', () => {
    const p = (): CadPath => CadPath.start(0, 0).right(10).up(10);
    expect(() => p().chamfer(0)).toThrow(/d1/);
    expect(() => p().chamfer(2, -1)).toThrow(/d2/);
    expect(() => p().chamfer(11)).toThrow(/does not fit/);
    expect(() => p().chamfer(2, 11)).toThrow(/does not fit/);
    expect(() => p().chamfer(NaN)).toThrow(/chamfer\.d1/);
  });

  it('fillet and chamfer can be mixed on one contour', () => {
    const d = CadPath.start(0, 0).right(100).up(50).fillet(10).left(100).chamfer(10, 10).build();
    expect(arcs(d)).toHaveLength(1);
    expect(d.segments).toHaveLength(5);
    expectContinuous(d);
  });
});

describe('CadPath: fromVertices / clone', () => {
  it('restores a path from build() output exactly (open and closed, with arcs)', () => {
    const original = CadPath.start(0, 0).right(100).up(50).left(100).close().filletAll(10).build();
    const again = CadPath.fromVertices(original.vertices, true).build();
    expect(again.vertices).toEqual(original.vertices);
    expect(again.length).toBeCloseTo(original.length, 9);

    const open = CadPath.start(0, 0).right(10).arcTo(20, 10, { tangent: true }).up(5).build();
    const copy = CadPath.fromVertices(open.vertices).build();
    expect(copy.vertices).toEqual(open.vertices);
  });

  it('lets you fillet an existing polyline', () => {
    const verts: PathVertex[] = [[0, 0], [100, 0], [100, 50], [0, 50]];
    const d = CadPath.fromVertices(verts, true).filletAll(5).build();
    expect(arcs(d)).toHaveLength(4);
  });

  it('a closing bulge on the last vertex becomes the closing arc', () => {
    const d = CadPath.fromVertices([[0, 0], [10, 0], [10, 10, 1]], true).build();
    expect(d.segments.map((s) => s.type)).toEqual(['line', 'line', 'arc']);
  });

  it('validates input', () => {
    expect(() => CadPath.fromVertices([[0, 0]])).toThrow(/two vertices/);
    expect(() => CadPath.fromVertices([[0, 0], [1, NaN]])).toThrow(/vertices\[1\]/);
    expect(() => CadPath.fromVertices([[0, 0], [1, 1, 0.5]])).toThrow(/open path/);
    expect(() => CadPath.fromVertices(undefined as never)).toThrow(CadPathError);
  });

  it('clone() is independent, including pending fillets', () => {
    const a = CadPath.start(0, 0).right(10).up(10).fillet(2);
    const b = a.clone().left(10);
    expect(a.segmentCount).toBe(2);
    expect(b.segmentCount).toBe(3);
    expect(arcs(b.build())).toHaveLength(1);
    b.fillet(1, { vertex: 2 });
    expect(arcs(a.build())).toHaveLength(1);
  });
});

describe('CadPath: realistic profile', () => {
  it('a step profile with a rounded nosing and a chamfered heel stays continuous and closed', () => {
    const run = 280;
    const rise = 170;
    const d = CadPath.start(0, 0)
      .right(run)
      .up(rise)
      .fillet(12) // скруглённый «нос» ступени
      .left(run - 40)
      .down(30)
      .left(40)
      .close()
      .chamfer(8, 8, { vertex: 0 })
      .build();
    expect(d.closed).toBe(true);
    expectContinuous(d);
    expect(arcs(d)).toHaveLength(1);
    expect(d.length).toBeGreaterThan(0);
  });
});
