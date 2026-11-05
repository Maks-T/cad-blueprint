import { describe, expect, it } from 'vitest';
import {
  BoundsBuilder,
  CadPath,
  CadPrimitiveError,
  applyToPoint,
  arc,
  arcThrough,
  bezier,
  bezierBounds,
  boundsFromPoints,
  breakLine,
  buildEllipse,
  buildPolyline,
  buildText,
  circle,
  clampedUniformKnots,
  compose,
  contourSegments,
  decompose,
  ellipse,
  evalBezier,
  evalParametricArc,
  evalSpline,
  fitBezier,
  invert,
  isSimilarity,
  line,
  multiply,
  mtext,
  nestContours,
  parametricArcBounds,
  parseEntity,
  point,
  polygon,
  polyline,
  polylineFromPath,
  rect,
  rectVertices,
  rotation,
  scaling,
  spline,
  splineToBeziers,
  text,
  transformPrimitive,
  translation,
  zigzagBreakLine,
} from '../src';
import type { EllipseEntity, Matrix2D, Point2 } from '../src';

const closeTo = (a: readonly number[], b: readonly number[], digits = 9): void => {
  expect(a.length).toBe(b.length);
  a.forEach((v, i) => expect(v).toBeCloseTo(b[i] as number, digits));
};

/** Точки эллипса из сущности (для сравнения с исходной кривой). */
function ellipsePoint(e: EllipseEntity, tDeg: number): Point2 {
  const r = (e.rotationDeg * Math.PI) / 180;
  const t = (tDeg * Math.PI) / 180;
  const x = e.radiusX * Math.cos(t);
  const y = e.radiusY * Math.sin(t);
  return [e.center[0] + x * Math.cos(r) - y * Math.sin(r), e.center[1] + x * Math.sin(r) + y * Math.cos(r)];
}

describe('geometry: matrices', () => {
  it('composes translate · rotate · scale and inverts', () => {
    const m = compose(translation(10, 5), rotation(90), scaling(2, 3));
    closeTo(applyToPoint(m, [1, 1]), [10 - 3, 5 + 2]);
    const back = applyToPoint(invert(m), applyToPoint(m, [7, -4]));
    closeTo(back, [7, -4]);
    const d = decompose(m);
    expect(d.rotationDeg).toBeCloseTo(90);
    expect(d.scaleX).toBeCloseTo(2);
    expect(d.scaleY).toBeCloseTo(3);
  });

  it('detects similarity (uniform scale, rotation, mirror) and rejects skew', () => {
    expect(isSimilarity(compose(rotation(33), scaling(2, -2)))).toBe(true);
    expect(isSimilarity(scaling(2, 3))).toBe(false);
    expect(isSimilarity(multiply(rotation(10), scaling(1, 1.0001)))).toBe(false);
  });
});

describe('geometry: exact curve bounds', () => {
  it('arc bounds include axis extremes only when they lie on the arc', () => {
    const quarter = { center: [0, 0] as Point2, u: [10, 0] as Point2, v: [0, 10] as Point2, t0: 0, sweep: Math.PI / 2 };
    const b = parametricArcBounds(quarter).build();
    closeTo([b.minX, b.minY, b.maxX, b.maxY], [0, 0, 10, 10]);
    const half = { ...quarter, t0: Math.PI / 4, sweep: Math.PI };
    const h = parametricArcBounds(half).build();
    expect(h.maxY).toBeCloseTo(10);
    expect(h.minX).toBeCloseTo(-10);
  });

  it('clockwise arcs (negative sweep) are handled', () => {
    const arcCw = { center: [0, 0] as Point2, u: [1, 0] as Point2, v: [0, 1] as Point2, t0: 0, sweep: -Math.PI / 2 };
    const b = parametricArcBounds(arcCw).build();
    closeTo([b.minX, b.minY, b.maxX, b.maxY], [0, -1, 1, 0]);
  });

  it('cubic Bezier bounds match dense sampling', () => {
    const pts: Point2[] = [[0, 0], [10, 30], [20, -30], [30, 0]];
    const b = bezierBounds(pts).build();
    const samples = Array.from({ length: 2001 }, (_, i) => evalBezier(pts, i / 2000));
    const s = boundsFromPoints(samples);
    expect(b.maxY).toBeCloseTo(s.maxY, 4);
    expect(b.minY).toBeCloseTo(s.minY, 4);
    expect(b.maxY).toBeGreaterThan(s.maxY - 1e-9);
  });

  it('B-spline → Bezier decomposition reproduces the curve (including unclamped knots)', () => {
    const cp: Point2[] = [[0, 0], [10, 20], [20, -5], [35, 15], [50, 0]];
    for (const knots of [clampedUniformKnots(5, 3), [0, 1, 2, 3, 4, 5, 6, 7, 8]]) {
      const parts = splineToBeziers(3, cp, knots);
      const lo = knots[3] as number;
      const hi = knots[5] as number;
      parts.forEach((bz, i) => {
        const u0 = lo + ((hi - lo) * i) / parts.length;
        const u1 = lo + ((hi - lo) * (i + 1)) / parts.length;
        for (const t of [0, 0.3, 0.7, 1]) closeTo(evalBezier(bz, t), evalSpline(3, cp, knots, u0 + (u1 - u0) * t), 6);
      });
    }
  });

  it('nestContours: even depth → outer, odd depth → hole of the nearest outer', () => {
    const sq = (s: number, o = 0): Point2[] => [[o, o], [o + s, o], [o + s, o + s], [o, o + s]];
    const n = nestContours([sq(100), sq(60, 20), sq(20, 40), sq(10, 200)]);
    expect(n).toEqual([
      { outer: 0, holes: [1] },
      { outer: 2, holes: [] },
      { outer: 3, holes: [] },
    ]);
  });
});

describe('primitives: builders (шаг 2.1.1)', () => {
  it('creates frozen, JSON-compatible entities with ByLayer defaults', () => {
    const l = line([0, 0], [10, 5], { layer: 'Контур' });
    expect(l).toEqual({ type: 'line', id: null, layer: 'Контур', color: null, lineWeight: null, lineType: null, from: [0, 0], to: [10, 5] });
    expect(Object.isFrozen(l)).toBe(true);
    expect(parseEntity(JSON.parse(JSON.stringify(l)))).toEqual(l);
  });

  it('validates numbers, colors, layers and unknown properties', () => {
    expect(() => circle([0, 0], 0)).toThrow(CadPrimitiveError);
    expect(() => circle([0, Number.NaN], 1)).toThrow(/finite point/);
    expect(() => line([0, 0], [1, 1], { color: 'red' })).toThrow(/color/);
    expect(() => line([0, 0], [1, 1], { layer: 'a/b' })).toThrow(/forbidden/);
    expect(() => parseEntity({ type: 'circle', center: [0, 0], raduis: 1 })).toThrow(/raduis.*unknown property/);
    expect(() => parseEntity({ type: 'nope' })).toThrow(/must be one of/);
    expect(circle([0, 0], 2, { color: '#ABC' }).color).toBe('#aabbcc');
  });

  it('arc: angles normalized to [0, 360), direction kept; full circle rejected', () => {
    const a = arc([0, 0], 5, -90, 450);
    expect([a.startAngleDeg, a.endAngleDeg, a.counterclockwise]).toEqual([270, 90, true]);
    expect(() => arc([0, 0], 5, 10, 370)).toThrow(/use circle/);
  });

  it('arcThrough: three points', () => {
    const a = arcThrough([10, 0], [0, 10], [-10, 0]);
    closeTo(a.center, [0, 0]);
    expect(a.radius).toBeCloseTo(10);
    expect(a.counterclockwise).toBe(true);
    const cw = arcThrough([-10, 0], [0, 10], [10, 0]);
    expect(cw.counterclockwise).toBe(false);
  });

  it('ellipse: full by default, arcs keep sweep across 0°', () => {
    const e = ellipse([0, 0], 20, 10, { rotationDeg: 30 });
    expect([e.startAngleDeg, e.endAngleDeg]).toEqual([0, 360]);
    const part = buildEllipse({ center: [0, 0], radiusX: 2, radiusY: 1, startAngleDeg: 350, endAngleDeg: 10 });
    expect([part.startAngleDeg, part.endAngleDeg]).toEqual([350, 370]);
  });

  it('point, text and mtext', () => {
    expect(point([1, 2]).position).toEqual([1, 2]);
    expect(() => text([0, 0], 'a\nb')).toThrow(/use mtext/);
    const m = mtext([0, 0], 'a\r\nb', { anchor: 'middle-center', height: 5, style: 'GOST' });
    expect(m.value).toBe('a\nb');
    expect(() => buildText({ position: [0, 0], value: 'x', anchor: 'center' as never })).toThrow(/anchor/);
  });
});

describe('primitives: rect, polyline, holes (шаг 2.1.2)', () => {
  it('rect with corner radius → polyline vertices with bulges', () => {
    const r = rect(0, 0, 100, 60, { cornerRadius: 10, fill: 'hatch' });
    const v = rectVertices(r);
    expect(v.filter((x) => x.length === 3)).toHaveLength(4);
    const len = contourSegments(v, true).reduce((s, x) => s + x.length, 0);
    expect(len).toBeCloseTo(2 * (100 + 60) - 8 * 10 + 2 * Math.PI * 10, 9);
    expect(() => rect(0, 0, 10, 10, { cornerRadius: 6 })).toThrow(/half of the shorter side/);
  });

  it('polyline from CadPath with holes; holes need a closed outline', () => {
    const outer = CadPath.start(0, 0).right(100).up(50).left(100).close().build();
    const hole = CadPath.start(10, 10).right(10).up(10).left(10).close().build();
    const p = polylineFromPath(outer, { holes: [hole], fill: 'solid', layer: 'Сечение' });
    expect(p.closed).toBe(true);
    expect(p.holes).toHaveLength(1);
    expect(p.vertices).toHaveLength(4);
    expect(() => polyline([[0, 0], [1, 0]], { holes: [[[0, 0], [1, 1], [1, 0]]] })).toThrow(/closed polyline/);
    expect(polygon(outer, { holes: [hole] }).holes[0]).toEqual(hole.vertices);
  });

  it('drops the duplicated closing vertex and the trailing bulge of an open polyline', () => {
    const p = buildPolyline({ vertices: [[0, 0], [10, 0], [10, 10], [0, 0]], closed: true });
    expect(p.vertices).toHaveLength(3);
    const open = buildPolyline({ vertices: [[0, 0], [10, 0, 0.5], [20, 0, 1]] });
    expect(open.vertices[2]).toEqual([20, 0]);
    expect(() => buildPolyline({ vertices: [[0, 0, 1], [0, 0]] })).toThrow(/coincident/);
  });
});

describe('primitives: splines and break lines (шаг 2.1.4)', () => {
  it('spline: clamped uniform knots by default, degree 1…3', () => {
    const s = spline([[0, 0], [1, 2], [3, 1], [4, 4]]);
    expect(s.knots).toEqual([0, 0, 0, 0, 1, 1, 1, 1]);
    expect(() => spline([[0, 0], [1, 1]], { degree: 3 })).toThrow(/at least 4/);
    expect(() => spline([[0, 0], [1, 1], [2, 2], [3, 3]], { degree: 4 })).toThrow(/1, 2 or 3/);
    expect(() => spline([[0, 0], [1, 1], [2, 0]], { degree: 2, knots: [0, 0, 1, 1, 1, 1] })).toThrow();
  });

  it('bezier: 3n + 1 points', () => {
    expect(() => bezier([[0, 0], [1, 1], [2, 2], [3, 3], [4, 4]])).toThrow(/3n \+ 1/);
    expect(() => bezier([[0, 0], [1, 1], [2, 2]])).toThrow(/at least 4/);
    expect(bezier([[0, 0], [1, 1], [2, 1], [3, 0]]).points).toHaveLength(4);
  });

  it('fitBezier passes through all points', () => {
    const pts: Point2[] = [[0, 0], [10, 5], [20, -5], [30, 0]];
    const b = fitBezier(pts);
    expect(b.points).toHaveLength(10);
    pts.forEach((p, i) => closeTo(b.points[i * 3] as Point2, p));
  });

  it('breakLine is a sine-like wave with the requested amplitude', () => {
    const b = breakLine([0, 0], [0, 100], { amplitude: 5, waves: 2 });
    expect(b.points).toHaveLength(13);
    closeTo(b.points[12] as Point2, [0, 100]);
    const bounds = new BoundsBuilder();
    for (let i = 0; i + 3 < b.points.length; i += 3) bezierBounds(b.points.slice(i, i + 4), bounds);
    const bb = bounds.build();
    expect(bb.maxX).toBeCloseTo(5, 6);
    expect(bb.minX).toBeCloseTo(-5, 6);
    const z = zigzagBreakLine([0, 0], [120, 0]);
    expect(z.vertices).toHaveLength(6);
  });
});

describe('primitives: transformPrimitive', () => {
  const sampleEq = (m: Matrix2D, e: EllipseEntity, source: (t: number) => Point2): void => {
    // Каждая точка исходной кривой после матрицы лежит на эллипсе-результате.
    for (let i = 0; i < 12; i++) {
      const p = applyToPoint(m, source((i / 12) * 2 * Math.PI));
      const r = (e.rotationDeg * Math.PI) / 180;
      const dx = p[0] - e.center[0];
      const dy = p[1] - e.center[1];
      const x = dx * Math.cos(r) + dy * Math.sin(r);
      const y = -dx * Math.sin(r) + dy * Math.cos(r);
      expect((x / e.radiusX) ** 2 + (y / e.radiusY) ** 2).toBeCloseTo(1, 9);
    }
  };

  it('similarity keeps circles and arcs; mirror flips arc direction', () => {
    const c = transformPrimitive(circle([1, 0], 2), compose(rotation(90), scaling(3)));
    expect(c.type).toBe('circle');
    const a = transformPrimitive(arc([0, 0], 1, 0, 90), scaling(-1, 1));
    expect(a.type === 'arc' && a.counterclockwise).toBe(false);
    if (a.type === 'arc') expect([a.startAngleDeg, a.endAngleDeg]).toEqual([180, 90]);
  });

  it('non-uniform scale turns a circle into an ellipse through the transformed points', () => {
    const m = compose(rotation(20), scaling(3, 1), rotation(35));
    const e = transformPrimitive(circle([5, 5], 2), m) as EllipseEntity;
    expect(e.type).toBe('ellipse');
    sampleEq(m, e, (t) => [5 + 2 * Math.cos(t), 5 + 2 * Math.sin(t)]);
  });

  it('non-uniform scale of an arc keeps its end points', () => {
    const m = scaling(2, 0.5);
    const e = transformPrimitive(arc([0, 0], 10, 30, 120), m) as EllipseEntity;
    closeTo(ellipsePoint(e, e.startAngleDeg), applyToPoint(m, [10 * Math.cos(Math.PI / 6), 10 * Math.sin(Math.PI / 6)]), 9);
    closeTo(ellipsePoint(e, e.endAngleDeg), applyToPoint(m, [10 * Math.cos((2 * Math.PI) / 3), 10 * Math.sin((2 * Math.PI) / 3)]), 9);
  });

  it('mirrored text stays readable', () => {
    const t = transformPrimitive(text([10, 0], 'A', { height: 5 }), scaling(-2, 2));
    expect(t.type === 'text' && t.rotationDeg).toBe(0);
    expect(t.type === 'text' && t.height).toBe(10);
    expect(evalParametricArc({ center: [0, 0], u: [1, 0], v: [0, 1], t0: 0, sweep: 1 }, 0)).toEqual([1, 0]);
  });
});
