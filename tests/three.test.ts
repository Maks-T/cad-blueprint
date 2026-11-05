import { BoxGeometry, Group, Mesh, Plane, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { CadPath, BlockTable, circle, createRenderContext, defineBlock, ellipse, entitiesBounds, insert, polygon, rect } from '../src';
import { blockToExtrudeGeometry, blockToShapes, chainSegments, entitiesToShapes, sectionBasis, sectionGeometry, sectionObject, sectionToBlock, simplifyCollinear } from '../src/three';

const profile = defineBlock('P', [
  polygon(CadPath.start(0, 0).right(40).up(30).left(40).close().filletAll(4).build(), { holes: [[[5, 5], [15, 5], [15, 25], [5, 25]]] }),
  circle([28, 15], 5),
  circle([10, 15], 2), // остров внутри выреза — отдельная фигура
]);

describe('three: 2D → Shape / ExtrudeGeometry (шаг 6.1.1)', () => {
  it('nested contours become holes; islands inside holes become separate shapes', () => {
    const shapes = blockToShapes(profile);
    expect(shapes).toHaveLength(2);
    expect(shapes.map((s) => s.holes.length).sort()).toEqual([0, 2]);
  });

  it('arcs are exact (absarc): the outline length matches the CAD contour', () => {
    const [outer] = blockToShapes(defineBlock('R', [rect(0, 0, 100, 60, { cornerRadius: 10 })]));
    expect(outer!.getLength()).toBeCloseTo(2 * 160 - 80 + 2 * Math.PI * 10, 3);
  });

  it('inserts are expanded, base point shifts the shapes, ellipses supported', () => {
    const blocks = new BlockTable([defineBlock('Hole', [circle([0, 0], 1)])]);
    const shapes = entitiesToShapes([rect(0, 0, 10, 10), insert('Hole', [5, 5], { scale: 2 }), ellipse([20, 0], 3, 1)], { blocks });
    expect(shapes).toHaveLength(2);
    expect(shapes[0]!.holes).toHaveLength(1);
    const shifted = blockToShapes(defineBlock('S', [rect(10, 10, 5, 5)], { basePoint: [10, 10] }));
    const pts = shifted[0]!.getPoints();
    expect(Math.min(...pts.map((p) => p.x))).toBeCloseTo(0);
    expect(Math.min(...pts.map((p) => p.y))).toBeCloseTo(0);
  });

  it('extrudes to the requested depth', () => {
    const g = blockToExtrudeGeometry(profile, { depth: 100 });
    g.computeBoundingBox();
    expect(g.boundingBox!.max.z - g.boundingBox!.min.z).toBeCloseTo(100);
    expect(g.boundingBox!.max.x).toBeCloseTo(40);
  });
});

describe('three: sections (шаг 6.1.2)', () => {
  it('cross-section of the extrusion reproduces the profile with holes', () => {
    const g = blockToExtrudeGeometry(profile, { depth: 100 });
    const r = sectionGeometry(g, new Plane(new Vector3(0, 0, 1), -50));
    expect(r.loops.every((l) => l.closed)).toBe(true);
    const b = sectionToBlock(r, 'S', { layer: 'Разрез' });
    const polys = b.entities.filter((e) => e.type === 'polyline');
    expect(polys).toHaveLength(2);
    expect(polys.map((p) => (p.type === 'polyline' ? p.holes.length : -1)).sort()).toEqual([0, 2]);
    expect(polys.every((p) => p.type === 'polyline' && p.fill === 'hatch' && p.layer === 'Разрез')).toBe(true);
    const bb = entitiesBounds(b.entities, createRenderContext());
    expect([bb.minX, bb.minY, bb.maxX, bb.maxY].map((v) => Math.round(v * 1000) / 1000 + 0)).toEqual([0, 0, 40, 30]);
  });

  it('object sections use world matrices; plane basis is right-handed', () => {
    const group = new Group();
    const m = new Mesh(new BoxGeometry(100, 30, 20));
    m.position.set(200, 15, 0);
    group.add(m);
    const r = sectionObject(group, new Plane(new Vector3(1, 0, 0), -200));
    const b = sectionToBlock(r, 'X');
    expect(b.entities).toHaveLength(1);
    const e = b.entities[0]!;
    expect(e.type === 'polyline' && e.vertices.length).toBe(4);
    const basis = sectionBasis(new Plane(new Vector3(0, 1, 0), 0));
    expect(basis.xAxis.toArray().map((v) => v + 0)).toEqual([1, 0, 0]);
    expect(basis.yAxis.toArray().map((v) => v + 0)).toEqual([0, 0, -1]);
  });

  it('chains segments into loops and simplifies collinear points', () => {
    const loops = chainSegments([
      [[0, 0], [1, 0]],
      [[1, 0], [2, 0]],
      [[2, 0], [2, 1]],
      [[2, 1], [0, 0]],
      [[5, 5], [6, 6]],
    ]);
    expect(loops.map((l) => [l.closed, l.points.length])).toEqual([[false, 2], [true, 4]]);
    expect(simplifyCollinear([[0, 0], [1, 0], [2, 0], [2, 1]], true)).toEqual([[0, 0], [2, 0], [2, 1]]);
  });
});
