import { viewportMatrix } from '../blocks/viewport';
import type { CadBlock, ViewportEntity } from '../blocks/types';
import { buildDimensionGeometry } from '../dimensions/geometry';
import type { DimensionGeometry } from '../dimensions/geometry';
import type { DimensionEntity } from '../dimensions/types';
import type { RenderContext } from '../document/context';
import { viewportContext } from '../document/context';
import type { Entity } from '../entities/types';
import { BoundsBuilder, boundsCorners, isEmptyBounds } from '../geometry/bounds';
import type { Bounds } from '../geometry/bounds';
import { bezierBounds, parametricArcBounds, splineToBeziers } from '../geometry/curves';
import type { ParametricArc } from '../geometry/curves';
import { IDENTITY, applyToPoint, applyToVector, multiply } from '../geometry/matrix';
import type { Matrix2D } from '../geometry/matrix';
import { fromAngleDeg } from '../geometry/vec';
import {
  arcParametric,
  circleParametric,
  contourSegments,
  ellipseParametric,
  rectVertices,
  segmentParametric,
} from '../primitives/outline';
import { buildMText } from '../primitives/build';
import type { MTextEntity, PrimitiveEntity } from '../primitives/types';
import type { PathVertex } from '../path-builder';
import { walkEntities } from '../render/walk';
import type { Point2 } from '../settings';
import { resolveText } from './text';

export interface BoundsOptions {
  /** Учитывать только объекты на видимых слоях (по умолчанию `false` — все). */
  visibleOnly?: boolean;
  /** Внешняя матрица (например, вставки). */
  matrix?: Matrix2D;
}

function transformArc(arc: ParametricArc, m: Matrix2D): ParametricArc {
  return { center: applyToPoint(m, arc.center), u: applyToVector(m, arc.u), v: applyToVector(m, arc.v), t0: arc.t0, sweep: arc.sweep };
}

function contourBounds(vertices: readonly PathVertex[], closed: boolean, m: Matrix2D, b: BoundsBuilder): void {
  for (const seg of contourSegments(vertices, closed)) {
    if (seg.type === 'line') {
      b.addPoint(applyToPoint(m, seg.from));
      b.addPoint(applyToPoint(m, seg.to));
    } else {
      parametricArcBounds(transformArc(segmentParametric(seg), m), b);
    }
  }
  if (vertices.length === 1) {
    const v = vertices[0] as PathVertex;
    b.addPoint(applyToPoint(m, [v[0], v[1]]));
  }
}

/** Габарит примитива в координатах после матрицы `m`. */
export function primitiveBounds(e: PrimitiveEntity, ctx: RenderContext, m: Matrix2D = IDENTITY, b: BoundsBuilder = new BoundsBuilder()): BoundsBuilder {
  switch (e.type) {
    case 'point':
      return b.addPoint(applyToPoint(m, e.position));
    case 'line':
      return b.addPoint(applyToPoint(m, e.from)).addPoint(applyToPoint(m, e.to));
    case 'circle':
      return parametricArcBounds(transformArc(circleParametric(e), m), b);
    case 'arc':
      return parametricArcBounds(transformArc(arcParametric(e), m), b);
    case 'ellipse':
      return parametricArcBounds(transformArc(ellipseParametric(e), m), b);
    case 'rect':
      contourBounds(rectVertices(e), true, m, b);
      return b;
    case 'polyline':
      contourBounds(e.vertices, e.closed, m, b);
      return b;
    case 'text':
    case 'mtext':
      for (const c of resolveText(e, ctx).corners) b.addPoint(applyToPoint(m, c));
      return b;
    case 'spline': {
      const pts = e.controlPoints.map((p) => applyToPoint(m, p));
      for (const bz of splineToBeziers(e.degree, pts, e.knots)) bezierBounds(bz, b);
      return b;
    }
    case 'bezier': {
      const pts = e.points.map((p) => applyToPoint(m, p));
      for (let i = 0; i + 3 < pts.length; i += 3) bezierBounds(pts.slice(i, i + 4), b);
      return b;
    }
  }
}

/** Габарит готовой геометрии размера (линии, окончания с их рисунком, тексты). */
export function dimensionGeometryBounds(g: DimensionGeometry, m: Matrix2D = IDENTITY, b: BoundsBuilder = new BoundsBuilder()): BoundsBuilder {
  for (const c of g.curves) {
    if (c.kind === 'line') {
      b.addPoint(applyToPoint(m, c.from)).addPoint(applyToPoint(m, c.to));
    } else {
      const sweepDeg = c.counterclockwise ? c.endAngleDeg - c.startAngleDeg : c.startAngleDeg - c.endAngleDeg;
      const sweep = ((((sweepDeg % 360) + 360) % 360) || 360) * (Math.PI / 180);
      parametricArcBounds(
        transformArc({ center: c.center, u: [c.radius, 0], v: [0, c.radius], t0: (c.startAngleDeg * Math.PI) / 180, sweep: c.counterclockwise ? sweep : -sweep }, m),
        b,
      );
    }
  }
  const term = g.metrics.terminator;
  for (const t of g.terminators) {
    const [cx, sx] = fromAngleDeg(t.angleDeg);
    const local = (p: Point2): Point2 => applyToPoint(m, [t.tip[0] + p[0] * cx - p[1] * sx, t.tip[1] + p[0] * sx + p[1] * cx]);
    for (const s of term.shapes) {
      if (s.kind === 'line') b.addPoint(local(s.from)).addPoint(local(s.to));
      else if (s.kind === 'circle') {
        const c = applyToPoint(m, [t.tip[0] + s.center[0], t.tip[1] + s.center[1]]);
        parametricArcBounds({ center: c, u: applyToVector(m, [s.radius, 0]), v: applyToVector(m, [0, s.radius]), t0: 0, sweep: Math.PI * 2 }, b);
      }
      else for (const p of s.points) b.addPoint(local(p));
    }
  }
  for (const t of g.texts) for (const c of t.corners) b.addPoint(applyToPoint(m, c));
  return b;
}

export function dimensionBounds(e: DimensionEntity, ctx: RenderContext, m: Matrix2D = IDENTITY): Bounds {
  return dimensionGeometryBounds(buildDimensionGeometry(e, ctx), m).build();
}

/** Подпись видового экрана: текст над содержимым (в координатах родителя). `null`, если подписи нет. */
export function viewportTitle(vp: ViewportEntity, ctx: RenderContext, contentBounds: Bounds): MTextEntity | null {
  if (vp.title === null || isEmptyBounds(contentBounds)) return null;
  const gap = ctx.drawing.annotationToModel(3);
  const screen = ctx.drawing.settings.coordinateSystem === 'screen';
  const cx = (contentBounds.minX + contentBounds.maxX) / 2;
  return buildMText({
    position: [cx, screen ? contentBounds.minY - gap : contentBounds.maxY + gap],
    value: vp.title,
    anchor: 'bottom-center',
    height: 5,
    layer: vp.layer,
  });
}

/** Габарит содержимого экрана в координатах родителя (с учётом обрезки), без подписи. */
export function viewportContentBounds(vp: ViewportEntity, ctx: RenderContext, m: Matrix2D = IDENTITY, options: BoundsOptions = {}): Bounds {
  const vm = multiply(m, viewportMatrix(vp, ctx.drawing));
  if (vp.clip) {
    const b = new BoundsBuilder();
    for (const c of boundsCorners(vp.clip)) b.addPoint(applyToPoint(vm, c));
    return b.build();
  }
  return entitiesBounds(vp.entities, viewportContext(ctx, vp), { ...options, matrix: vm });
}

/**
 * Точный габарит набора объектов: дуги, эллипсы и сплайны — по экстремумам, текст — по метрикам шрифта и наклону,
 * размеры — со стрелками и текстом, вставки блоков и видовые экраны — с их матрицами. Толщина линий не учитывается.
 */
export function entitiesBounds(entities: readonly Entity[], ctx: RenderContext, options: BoundsOptions = {}): Bounds {
  const b = new BoundsBuilder();
  walkEntities(
    entities,
    ctx,
    {
      primitive: (e, _layer, s) => {
        primitiveBounds(e, s.ctx, s.matrix, b);
      },
      dimension: (e, _layer, s) => {
        dimensionGeometryBounds(buildDimensionGeometry(e, s.ctx), s.matrix, b);
      },
      viewport: (vp, _layer, s) => {
        const content = viewportContentBounds(vp, s.ctx, IDENTITY, options);
        const title = viewportTitle(vp, s.ctx, content);
        if (vp.clip) {
          b.addBounds(viewportContentBounds(vp, s.ctx, s.matrix, options));
          if (title) primitiveBounds(title, s.ctx, s.matrix, b);
          return false;
        }
        if (title) primitiveBounds(title, s.ctx, s.matrix, b);
        return true;
      },
    },
    { visibleOnly: options.visibleOnly ?? false, matrix: options.matrix ?? IDENTITY },
  );
  return b.build();
}

export function entityBounds(entity: Entity, ctx: RenderContext, options: BoundsOptions = {}): Bounds {
  return entitiesBounds([entity], ctx, options);
}

/** Габарит блока в его собственных координатах. */
export function blockBounds(block: CadBlock | string, ctx: RenderContext, options: BoundsOptions = {}): Bounds {
  const b = typeof block === 'string' ? ctx.blocks.require(block) : block;
  return entitiesBounds(b.entities, ctx, options);
}

