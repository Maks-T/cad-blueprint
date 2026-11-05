import type { Point2 } from '../settings';

/** Прямоугольный габарит, оси параллельны осям чертежа. Пустой габарит: `minX = +∞`. */
export interface Bounds {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
}

export const EMPTY_BOUNDS: Bounds = Object.freeze({ minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });

export function isEmptyBounds(b: Bounds): boolean {
  return !(b.minX <= b.maxX && b.minY <= b.maxY);
}

/** Изменяемый накопитель габарита. */
export class BoundsBuilder {
  minX = Infinity;
  minY = Infinity;
  maxX = -Infinity;
  maxY = -Infinity;

  addPoint(p: Point2): this {
    if (p[0] < this.minX) this.minX = p[0];
    if (p[0] > this.maxX) this.maxX = p[0];
    if (p[1] < this.minY) this.minY = p[1];
    if (p[1] > this.maxY) this.maxY = p[1];
    return this;
  }

  addBounds(b: Bounds): this {
    if (isEmptyBounds(b)) return this;
    this.addPoint([b.minX, b.minY]);
    return this.addPoint([b.maxX, b.maxY]);
  }

  get empty(): boolean {
    return isEmptyBounds(this);
  }

  build(): Bounds {
    if (this.empty) return EMPTY_BOUNDS;
    return Object.freeze({ minX: this.minX, minY: this.minY, maxX: this.maxX, maxY: this.maxY });
  }
}

export function boundsFromPoints(points: Iterable<Point2>): Bounds {
  const b = new BoundsBuilder();
  for (const p of points) b.addPoint(p);
  return b.build();
}

export function unionBounds(...items: Bounds[]): Bounds {
  const b = new BoundsBuilder();
  for (const item of items) b.addBounds(item);
  return b.build();
}

export function boundsWidth(b: Bounds): number {
  return isEmptyBounds(b) ? 0 : b.maxX - b.minX;
}

export function boundsHeight(b: Bounds): number {
  return isEmptyBounds(b) ? 0 : b.maxY - b.minY;
}

export function boundsCenter(b: Bounds): Point2 {
  return [(b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2];
}

/** Расширяет габарит на `pad` (единицы модели) со всех сторон или по сторонам. */
export function padBounds(
  b: Bounds,
  pad: number | { top: number; right: number; bottom: number; left: number },
): Bounds {
  if (isEmptyBounds(b)) return b;
  const p = typeof pad === 'number' ? { top: pad, right: pad, bottom: pad, left: pad } : pad;
  return Object.freeze({ minX: b.minX - p.left, minY: b.minY - p.bottom, maxX: b.maxX + p.right, maxY: b.maxY + p.top });
}

export function boundsCorners(b: Bounds): [Point2, Point2, Point2, Point2] {
  return [
    [b.minX, b.minY],
    [b.maxX, b.minY],
    [b.maxX, b.maxY],
    [b.minX, b.maxY],
  ];
}

export function containsPoint(b: Bounds, p: Point2, eps = 0): boolean {
  return p[0] >= b.minX - eps && p[0] <= b.maxX + eps && p[1] >= b.minY - eps && p[1] <= b.maxY + eps;
}
