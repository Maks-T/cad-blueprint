import { ExtrudeGeometry, Path, Shape } from 'three';
import type { ExtrudeGeometryOptions } from 'three';
import type { BlockTable } from '../blocks/block-table';
import type { CadBlock } from '../blocks/types';
import { createRenderContext } from '../document/context';
import type { Entity } from '../entities/types';
import { nestContours } from '../geometry/polygon';
import type { PathSegment, PathVertex } from '../path-builder';
import { isFullEllipse } from '../primitives/build';
import { contourSegments, rectVertices } from '../primitives/outline';
import { flattenContour, transformPrimitive } from '../primitives/transform';
import type { PrimitiveEntity } from '../primitives/types';
import { walkEntities } from '../render/walk';
import type { Point2 } from '../settings';

const DEG = Math.PI / 180;

/** Замкнутый контур: точные сегменты (прямые и дуги) или эллипс. Точки для проверки вложенности — `polygon`. */
type Loop =
  | { readonly kind: 'segments'; readonly segments: readonly PathSegment[]; readonly polygon: Point2[] }
  | { readonly kind: 'ellipse'; readonly center: Point2; readonly rx: number; readonly ry: number; readonly rotation: number; readonly polygon: Point2[] };

export interface ShapeOptions {
  /** Таблица блоков для раскрытия вставок внутри блока. */
  blocks?: BlockTable;
  /** Учитывать только эти слои (по умолчанию — все). */
  layers?: readonly string[];
  /** Отражать ось Y (для документов в системе `screen`). По умолчанию `false`. */
  flipY?: boolean;
}

function contourLoop(vertices: readonly PathVertex[]): Loop {
  return { kind: 'segments', segments: contourSegments(vertices, true), polygon: flattenContour(vertices, true) };
}

/** Замкнутые контуры объекта (внешний и собственные вырезы полилинии — все как отдельные контуры). */
function loopsOf(e: PrimitiveEntity): Loop[] {
  switch (e.type) {
    case 'polyline':
      return e.closed && e.vertices.length >= 2 ? [contourLoop(e.vertices), ...e.holes.map((h) => contourLoop(h))] : [];
    case 'rect':
      return [contourLoop(rectVertices(e))];
    case 'circle': {
      const [cx, cy] = e.center;
      return [contourLoop([
        [cx - e.radius, cy, 1],
        [cx + e.radius, cy, 1],
      ])];
    }
    case 'ellipse': {
      if (!isFullEllipse(e)) return [];
      const polygon: Point2[] = [];
      const c = Math.cos(e.rotationDeg * DEG);
      const s = Math.sin(e.rotationDeg * DEG);
      for (let i = 0; i < 72; i++) {
        const t = (i / 72) * Math.PI * 2;
        const x = e.radiusX * Math.cos(t);
        const y = e.radiusY * Math.sin(t);
        polygon.push([e.center[0] + x * c - y * s, e.center[1] + x * s + y * c]);
      }
      return [{ kind: 'ellipse', center: e.center, rx: e.radiusX, ry: e.radiusY, rotation: e.rotationDeg * DEG, polygon }];
    }
    default:
      return [];
  }
}

function drawLoop(target: Path, loop: Loop, flip: number): void {
  if (loop.kind === 'ellipse') {
    target.absellipse(loop.center[0], flip * loop.center[1], loop.rx, loop.ry, 0, Math.PI * 2, false, flip * loop.rotation);
    return;
  }
  const first = loop.segments[0];
  if (!first) return;
  target.moveTo(first.from[0], flip * first.from[1]);
  for (const s of loop.segments) {
    if (s.type === 'line') {
      target.lineTo(s.to[0], flip * s.to[1]);
    } else {
      const ccw = flip > 0 ? s.counterclockwise : !s.counterclockwise;
      const a1 = flip * s.startAngleDeg * DEG;
      const a2 = flip * s.endAngleDeg * DEG;
      target.absarc(s.center[0], flip * s.center[1], s.radius, a1, a2, !ccw);
    }
  }
  target.closePath();
}

/**
 * Замкнутые контуры объектов → `THREE.Shape[]`: вложенные контуры становятся вырезами (`shape.holes`),
 * контуры внутри вырезов — снова отдельными фигурами. Дуги передаются точно (`absarc`), вставки блоков раскрываются;
 * при неравномерном масштабе вставки дуги аппроксимируются отрезками.
 */
export function entitiesToShapes(entities: readonly Entity[], options: ShapeOptions = {}): Shape[] {
  const ctx = createRenderContext(options.blocks ? { blocks: options.blocks } : {});
  const filter = options.layers ? new Set(options.layers.map((l) => l.toLowerCase())) : null;
  const loops: Loop[] = [];
  walkEntities(entities, ctx, {
    primitive: (e, layer, state) => {
      if (filter && !filter.has(layer.name.toLowerCase())) return;
      loops.push(...loopsOf(transformPrimitive(e, state.matrix)));
    },
  });
  const flip = options.flipY ? -1 : 1;
  const nested = nestContours(loops.map((l) => l.polygon));
  return nested.map((n) => {
    const shape = new Shape();
    drawLoop(shape, loops[n.outer] as Loop, flip);
    for (const h of n.holes) {
      const path = new Path();
      drawLoop(path, loops[h] as Loop, flip);
      shape.holes.push(path);
    }
    return shape;
  });
}

/** Контуры блока (в его координатах, относительно `basePoint`) → `THREE.Shape[]`. */
export function blockToShapes(block: CadBlock, options: ShapeOptions = {}): Shape[] {
  const [bx, by] = block.basePoint;
  const shapes = entitiesToShapes(block.entities, options);
  if (bx !== 0 || by !== 0) {
    const flip = options.flipY ? -1 : 1;
    // Сдвигаем к базовой точке на уровне геометрии THREE (кривые хранят абсолютные координаты).
    for (const s of shapes) translateShape(s, -bx, -flip * by);
  }
  return shapes;
}

function translateShape(shape: Path, dx: number, dy: number): void {
  for (const c of shape.curves as unknown as Array<Record<string, unknown>>) {
    for (const key of ['v0', 'v1', 'v2', 'v3']) {
      const v = c[key] as { x: number; y: number } | undefined;
      if (v) {
        v.x += dx;
        v.y += dy;
      }
    }
    if (typeof c['aX'] === 'number') {
      c['aX'] = (c['aX'] as number) + dx;
      c['aY'] = (c['aY'] as number) + dy;
    }
  }
  const cp = (shape as unknown as { currentPoint: { x: number; y: number } }).currentPoint;
  cp.x += dx;
  cp.y += dy;
  if (shape instanceof Shape) for (const h of shape.holes) translateShape(h, dx, dy);
}

/** Выдавливание контуров блока: `ExtrudeGeometry` (по умолчанию без фаски, 24 сегмента на дугу). */
export function blockToExtrudeGeometry(
  block: CadBlock,
  extrude: ExtrudeGeometryOptions & { depth: number },
  options: ShapeOptions = {},
): ExtrudeGeometry {
  const shapes = blockToShapes(block, options);
  return new ExtrudeGeometry(shapes, { bevelEnabled: false, curveSegments: 24, ...extrude });
}
