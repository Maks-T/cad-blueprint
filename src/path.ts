import type { Pt } from './types';

export class CadPath {
  private pts: Pt[] = [];
  private isClosed = false;

  public static start(x = 0, y = 0): CadPath {
    return new CadPath().moveTo(x, y);
  }

  public moveTo(x: number, y: number): this {
    this.pts.push([x, y]);
    return this;
  }

  public lineTo(x: number, y: number): this {
    this.pts.push([x, y]);
    return this;
  }

  public moveBy(dx: number, dy: number): this {
    const [cx, cy] = this.current;
    this.pts.push([cx + dx, cy + dy]);
    return this;
  }

  public right(dist: number): this { return this.moveBy(dist, 0); }
  public left(dist: number): this { return this.moveBy(-dist, 0); }
  public up(dist: number): this { return this.moveBy(0, dist); }
  public down(dist: number): this { return this.moveBy(0, -dist); }

  public polar(length: number, angleDeg: number): this {
    const rad = (angleDeg * Math.PI) / 180;
    return this.moveBy(length * Math.cos(rad), length * Math.sin(rad));
  }

  public close(): this {
    this.isClosed = true;
    return this;
  }

  public get current(): Pt {
    return this.pts[this.pts.length - 1] ?? [0, 0];
  }

  public build(): { pts: Pt[]; closed: boolean } {
    return { pts: [...this.pts], closed: this.isClosed };
  }
}