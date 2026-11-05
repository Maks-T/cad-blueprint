import type { CoordinateSystem, Point2 } from '../settings';
import {
  PATH_EPS,
  arcEndDirection,
  arcFromBulge,
  bulgeFromCenter,
  bulgeFromRadius,
  bulgeFromThrough,
  bulgeFromTangent,
  cosSinDeg,
  dist,
  pt,
  samePoint,
} from './arc-geometry';
import { computeCorner } from './corners';
import type { CornerResult, CornerSpec } from './corners';
import { CadPathError } from './errors';
import type {
  ArcOptions,
  CadPathOptions,
  CornerOptions,
  PathData,
  PathLineSegment,
  PathSegment,
  PathVertex,
} from './types';

interface Seg {
  readonly to: Point2;
  /** 0 — прямая. */
  readonly bulge: number;
}

function assertFiniteNumber(value: unknown, field: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new CadPathError(field, `must be a finite number, got ${String(value)}`);
  }
}

function assertPoint(value: unknown, field: string): asserts value is Point2 {
  if (!Array.isArray(value) || value.length !== 2) {
    throw new CadPathError(field, 'must be a point [x, y]');
  }
  assertFiniteNumber(value[0], `${field}[0]`);
  assertFiniteNumber(value[1], `${field}[1]`);
}

const ARC_KEYS = ['bulge', 'radius', 'center', 'through', 'tangent'] as const;
const ARC_ALLOWED_KEYS: Readonly<Record<string, readonly string[]>> = {
  bulge: ['bulge'],
  radius: ['radius', 'sweep', 'large'],
  center: ['center', 'sweep'],
  through: ['through'],
  tangent: ['tangent'],
};

/**
 * Fluent-построитель контура в «черепашьем» стиле (шаги 2.2.1 и 2.2.2 генплана).
 *
 * Один `CadPath` — ОДИН непрерывный контур (открытый или замкнутый) из прямых сегментов и дуг.
 * Результат — `build()`: вершины в формате `Polyline` (`[x, y, bulge?]`) и явные сегменты.
 * Билдер изменяемый (методы возвращают `this`), снимок `build()` — замороженный.
 *
 * ```ts
 * const profile = CadPath.start(0, 0)
 *   .right(100).up(50).fillet(8)     // скруглить угол между «вправо» и «вверх»
 *   .left(100).close()               // замкнуть (добавит недостающий сегмент)
 *   .filletAll(2)                    // и остальные углы — радиусом 2
 *   .build();
 * ```
 */
export class CadPath {
  private startPoint: Point2 = pt(0, 0);
  private readonly segs: Seg[] = [];
  private closedFlag = false;
  private readonly corners = new Map<number, CornerSpec>();
  private readonly ySign: 1 | -1;
  private readonly system: CoordinateSystem;

  constructor(options: CadPathOptions = {}) {
    const system = options.coordinateSystem ?? 'cartesian';
    if (system !== 'cartesian' && system !== 'screen') {
      throw new CadPathError('coordinateSystem', `must be "cartesian" or "screen", got ${String(system)}`);
    }
    this.system = system;
    this.ySign = system === 'cartesian' ? 1 : -1;
  }

  /** Новый контур с начальной точкой `(x, y)`. */
  static start(x = 0, y = 0, options: CadPathOptions = {}): CadPath {
    return new CadPath(options).moveTo(x, y);
  }

  /** Контур из вершин `[x, y, bulge?]` (формат `PathData.vertices` / `Polyline`). Нужен, например, чтобы сопрягать готовый контур. */
  static fromVertices(vertices: readonly PathVertex[], closed = false, options: CadPathOptions = {}): CadPath {
    if (!Array.isArray(vertices) || vertices.length < 2) {
      throw new CadPathError('vertices', 'at least two vertices are required');
    }
    const path = new CadPath(options);
    vertices.forEach((v, i) => {
      assertFiniteNumber(v[0], `vertices[${i}][0]`);
      assertFiniteNumber(v[1], `vertices[${i}][1]`);
      if (v[2] !== undefined) assertFiniteNumber(v[2], `vertices[${i}][2]`);
    });
    const first = vertices[0] as PathVertex;
    path.moveTo(first[0], first[1]);
    const last = vertices.length - 1;
    for (let i = 0; i < last; i++) {
      const next = vertices[i + 1] as PathVertex;
      path.addSegment(next[0], next[1], (vertices[i] as PathVertex)[2] ?? 0, `vertices[${i}]`);
    }
    const lastBulge = (vertices[last] as PathVertex)[2] ?? 0;
    if (closed) {
      if (lastBulge !== 0) path.addSegment(first[0], first[1], lastBulge, `vertices[${last}]`);
      path.close();
    } else if (lastBulge !== 0) {
      throw new CadPathError(`vertices[${last}]`, 'the last vertex of an open path cannot carry a bulge');
    }
    return path;
  }

  /** Независимая копия (вместе с заданными сопряжениями). */
  clone(): CadPath {
    const copy = new CadPath({ coordinateSystem: this.system });
    copy.startPoint = this.startPoint;
    copy.segs.push(...this.segs);
    copy.closedFlag = this.closedFlag;
    for (const [v, spec] of this.corners) copy.corners.set(v, spec);
    return copy;
  }

  // ---------------------------------------------------------------- состояние

  /** Текущая точка («перо»); у замкнутого контура — начальная. */
  get current(): Point2 {
    const last = this.segs[this.segs.length - 1];
    return this.closedFlag || !last ? this.startPoint : last.to;
  }

  /** Начальная точка контура. */
  get startPosition(): Point2 {
    return this.startPoint;
  }

  get isClosed(): boolean {
    return this.closedFlag;
  }

  /** Число сегментов (у замкнутого — вместе с замыкающим). */
  get segmentCount(): number {
    return this.segs.length;
  }

  // ---------------------------------------------------------------- 2.2.1 перо

  /** Задаёт начальную точку. Допустимо только до первого сегмента — один `CadPath` описывает один непрерывный контур. */
  moveTo(x: number, y: number): this {
    assertFiniteNumber(x, 'moveTo.x');
    assertFiniteNumber(y, 'moveTo.y');
    if (this.segs.length > 0) {
      throw new CadPathError('moveTo', 'a path is one continuous contour: moveTo is only allowed before the first segment (use a new CadPath for another contour)');
    }
    this.startPoint = pt(x, y);
    return this;
  }

  /** Прямой сегмент в точку `(x, y)`. Сегмент нулевой длины пропускается. */
  lineTo(x: number, y: number): this {
    assertFiniteNumber(x, 'lineTo.x');
    assertFiniteNumber(y, 'lineTo.y');
    return this.addSegment(x, y, 0, 'lineTo');
  }

  /** Прямой сегмент на `(dx, dy)` от текущей точки. */
  lineBy(dx: number, dy: number): this {
    assertFiniteNumber(dx, 'lineBy.dx');
    assertFiniteNumber(dy, 'lineBy.dy');
    const [cx, cy] = this.current;
    return this.addSegment(cx + dx, cy + dy, 0, 'lineBy');
  }

  /** Вправо на экране (+X). */
  right(distance: number): this {
    assertFiniteNumber(distance, 'right');
    return this.stepBy(distance, 0, 'right');
  }

  /** Влево на экране (−X). */
  left(distance: number): this {
    assertFiniteNumber(distance, 'left');
    return this.stepBy(-distance, 0, 'left');
  }

  /** Вверх на экране: +Y в `cartesian`, −Y в `screen`. */
  up(distance: number): this {
    assertFiniteNumber(distance, 'up');
    return this.stepBy(0, this.ySign * distance, 'up');
  }

  /** Вниз на экране: −Y в `cartesian`, +Y в `screen`. */
  down(distance: number): this {
    assertFiniteNumber(distance, 'down');
    return this.stepBy(0, -this.ySign * distance, 'down');
  }

  /** Сегмент длиной `length` под углом `angleDeg` (против часовой стрелки на экране, 0° — вправо, 90° — вверх). */
  polar(length: number, angleDeg: number): this {
    assertFiniteNumber(length, 'polar.length');
    assertFiniteNumber(angleDeg, 'polar.angleDeg');
    const [c, s] = cosSinDeg(angleDeg);
    return this.stepBy(length * c, this.ySign * length * s, 'polar');
  }

  /** Дуга из текущей точки в `(x, y)`; способ задания — `options` (см. `ArcOptions`). */
  arcTo(x: number, y: number, options: ArcOptions): this {
    assertFiniteNumber(x, 'arcTo.x');
    assertFiniteNumber(y, 'arcTo.y');
    return this.addArc([x, y], options, [0, 0], 'arcTo');
  }

  /** То же, что `arcTo`, но конец (и `center` / `through`) задаются относительно текущей точки. */
  arcBy(dx: number, dy: number, options: ArcOptions): this {
    assertFiniteNumber(dx, 'arcBy.dx');
    assertFiniteNumber(dy, 'arcBy.dy');
    const [cx, cy] = this.current;
    return this.addArc([cx + dx, cy + dy], options, [cx, cy], 'arcBy');
  }

  /**
   * Замыкает контур. Если текущая точка не совпадает с начальной, добавляется замыкающий прямой сегмент;
   * если совпадает (последний сегмент уже вернулся в начало, в том числе дугой) — используется он.
   */
  close(): this {
    this.assertOpen('close');
    if (this.segs.length === 0) throw new CadPathError('close', 'the path has no segments');
    const last = this.segs[this.segs.length - 1] as Seg;
    if (samePoint(last.to, this.startPoint)) {
      this.segs[this.segs.length - 1] = { to: this.startPoint, bulge: last.bulge };
    } else {
      this.segs.push({ to: this.startPoint, bulge: 0 });
    }
    const allLines = this.segs.every((s) => s.bulge === 0);
    if (this.segs.length < 2 || (allLines && this.segs.length < 3)) {
      throw new CadPathError('close', 'a closed contour needs at least three straight segments (or two with an arc)');
    }
    this.closedFlag = true;
    return this;
  }

  // ---------------------------------------------------------------- 2.2.2 сопряжения

  /**
   * Скругляет угол между двумя прямыми сегментами дугой радиуса `radius`.
   * По умолчанию — «последний угол»: стык двух последних сегментов (у замкнутого контура — начальная вершина).
   * Другой угол — `{ vertex }`. Сопряжение применяется при `build()`, поэтому номера вершин не сдвигаются.
   * Повторный вызов для той же вершины заменяет предыдущий.
   */
  fillet(radius: number, options: CornerOptions = {}): this {
    assertFiniteNumber(radius, 'fillet.radius');
    return this.setCorner({ kind: 'fillet', radius }, options, 'fillet');
  }

  /**
   * Срезает угол фаской: `d1` — отступ от вершины по предыдущему сегменту, `d2` — по следующему (по умолчанию `d2 = d1`).
   * Выбор угла — как у `fillet`.
   */
  chamfer(d1: number, d2: number = d1, options: CornerOptions = {}): this {
    assertFiniteNumber(d1, 'chamfer.d1');
    assertFiniteNumber(d2, 'chamfer.d2');
    return this.setCorner({ kind: 'chamfer', d1, d2 }, options, 'chamfer');
  }

  /**
   * Скругляет ВСЕ существующие на момент вызова углы между прямыми сегментами (у замкнутого — включая начальный).
   * Стыки на одной прямой и стыки с дугами пропускаются. Вызывайте после того, как контур нарисован.
   */
  filletAll(radius: number): this {
    assertFiniteNumber(radius, 'filletAll.radius');
    return this.setAllCorners({ kind: 'fillet', radius }, 'filletAll');
  }

  /** Фаска на всех углах, как `filletAll`. */
  chamferAll(d1: number, d2: number = d1): this {
    assertFiniteNumber(d1, 'chamferAll.d1');
    assertFiniteNumber(d2, 'chamferAll.d2');
    return this.setAllCorners({ kind: 'chamfer', d1, d2 }, 'chamferAll');
  }

  // ---------------------------------------------------------------- результат

  /** Собирает контур: применяет сопряжения и возвращает замороженные вершины и сегменты. */
  build(): PathData {
    const n = this.segs.length;
    if (n === 0) throw new CadPathError('build', 'the path is empty: add at least one segment');
    const closed = this.closedFlag;

    // 1. Расчёт всех углов.
    const results = new Map<number, CornerResult>();
    for (const [v, spec] of this.corners) {
      const field = spec.kind;
      results.set(v, computeCorner(this.vertexAt(v - 1), this.vertexAt(v), this.vertexAt(v + 1), spec, `${field}[vertex ${v}]`));
    }

    // 2. Обход сегментов с укорочением под углы.
    const out: Array<{ from: Point2; to: Point2; bulge: number }> = [];
    for (let i = 0; i < n; i++) {
      const seg = this.segs[i] as Seg;
      const a = this.vertexAt(i);
      const b = this.vertexAt(i + 1);
      const startCorner = results.get(i);
      const endCorner = results.get(closed ? (i + 1) % n : i + 1);
      if (seg.bulge === 0) {
        const len = dist(a, b);
        const trimStart = startCorner?.trimNext ?? 0;
        const trimEnd = endCorner?.trimPrev ?? 0;
        if (trimStart + trimEnd > len + 1e-9 * Math.max(1, len)) {
          throw new CadPathError('build', `corners overlap on segment ${i}: they need ${trimStart} + ${trimEnd}, but the segment is ${len} long`);
        }
        const ux = (b[0] - a[0]) / len;
        const uy = (b[1] - a[1]) / len;
        const s = trimStart > 0 ? pt(a[0] + ux * trimStart, a[1] + uy * trimStart) : a;
        const e = trimEnd > 0 ? pt(b[0] - ux * trimEnd, b[1] - uy * trimEnd) : b;
        if (dist(s, e) > PATH_EPS) out.push({ from: s, to: e, bulge: 0 });
      } else {
        out.push({ from: a, to: b, bulge: seg.bulge });
      }
      const joint = results.get(closed ? (i + 1) % n : i + 1);
      if (joint && (closed || i + 1 < n)) out.push({ from: joint.from, to: joint.to, bulge: joint.bulge });
    }

    // 3. Вершины и явные сегменты.
    const vertices: PathVertex[] = out.map((p) => Object.freeze(p.bulge === 0 ? [p.from[0], p.from[1]] : [p.from[0], p.from[1], p.bulge]) as PathVertex);
    if (!closed) {
      const end = (out[out.length - 1] as { to: Point2 }).to;
      vertices.push(Object.freeze([end[0], end[1]]) as PathVertex);
    }
    const segments: PathSegment[] = out.map((p) =>
      p.bulge === 0
        ? (Object.freeze({ type: 'line' as const, from: p.from, to: p.to, length: dist(p.from, p.to) }) satisfies PathLineSegment)
        : arcFromBulge(p.from, p.to, p.bulge),
    );
    const length = segments.reduce((sum, s) => sum + s.length, 0);
    return Object.freeze({ vertices: Object.freeze(vertices), closed, segments: Object.freeze(segments), length });
  }

  // ---------------------------------------------------------------- внутреннее

  private assertOpen(field: string): void {
    if (this.closedFlag) throw new CadPathError(field, 'the path is already closed');
  }

  /** Точка вершины i. У замкнутого контура номера берутся по кругу (вершина n = вершина 0). */
  private vertexAt(i: number): Point2 {
    const n = this.segs.length;
    const idx = this.closedFlag ? ((i % n) + n) % n : i;
    if (idx === 0) return this.startPoint;
    return (this.segs[idx - 1] as Seg).to;
  }

  private stepBy(dx: number, dy: number, field: string): this {
    const [cx, cy] = this.current;
    return this.addSegment(cx + dx, cy + dy, 0, field);
  }

  private addSegment(x: number, y: number, bulge: number, field: string): this {
    this.assertOpen(field);
    const from = this.current;
    const to = pt(x, y);
    if (bulge === 0) {
      if (samePoint(from, to)) return this; // нулевая длина — не сегмент
      this.segs.push({ to, bulge: 0 });
    } else {
      arcFromBulge(from, to, bulge); // проверка хорды
      this.segs.push({ to, bulge });
    }
    return this;
  }

  private addArc(end: Point2, options: ArcOptions, origin: Point2, field: string): this {
    this.assertOpen(field);
    if (options === null || typeof options !== 'object') {
      throw new CadPathError(`${field}.options`, 'must be an object like { radius }, { bulge }, { center }, { through } or { tangent: true }');
    }
    const keys = Object.keys(options);
    const modes = ARC_KEYS.filter((k) => keys.includes(k));
    if (modes.length !== 1) {
      throw new CadPathError(`${field}.options`, `exactly one of ${ARC_KEYS.join(' | ')} is required, got ${modes.length === 0 ? 'none' : modes.join(' + ')}`);
    }
    const mode = modes[0] as (typeof ARC_KEYS)[number];
    const unknown = keys.filter((k) => !(ARC_ALLOWED_KEYS[mode] as readonly string[]).includes(k));
    if (unknown.length > 0) {
      throw new CadPathError(`${field}.options`, `unknown option(s) for "${mode}": ${unknown.join(', ')}`);
    }

    const from = this.current;
    const to = pt(end[0], end[1]);
    const o = options as Record<string, unknown>;
    const ccw = (): boolean => {
      const sweep = o['sweep'] ?? 'ccw';
      if (sweep !== 'ccw' && sweep !== 'cw') throw new CadPathError(`${field}.sweep`, `must be "ccw" or "cw", got ${String(sweep)}`);
      return (sweep === 'ccw') === (this.ySign === 1);
    };

    let bulge: number;
    switch (mode) {
      case 'bulge': {
        assertFiniteNumber(o['bulge'], `${field}.bulge`);
        bulge = o['bulge'];
        break;
      }
      case 'radius': {
        assertFiniteNumber(o['radius'], `${field}.radius`);
        const large = o['large'] ?? false;
        if (typeof large !== 'boolean') throw new CadPathError(`${field}.large`, 'must be a boolean');
        bulge = bulgeFromRadius(from, to, o['radius'], ccw(), large);
        break;
      }
      case 'center': {
        const c = o['center'];
        assertPoint(c, `${field}.center`);
        bulge = bulgeFromCenter(from, to, pt(c[0] + origin[0], c[1] + origin[1]), ccw());
        break;
      }
      case 'through': {
        const t = o['through'];
        assertPoint(t, `${field}.through`);
        bulge = bulgeFromThrough(from, pt(t[0] + origin[0], t[1] + origin[1]), to);
        break;
      }
      case 'tangent': {
        if (o['tangent'] !== true) throw new CadPathError(`${field}.tangent`, 'must be true');
        bulge = bulgeFromTangent(from, to, this.endDirection(field));
        break;
      }
    }
    return this.addSegment(to[0], to[1], bulge, field);
  }

  /** Единичное направление последнего сегмента в текущей точке. */
  private endDirection(field: string): Point2 {
    const n = this.segs.length;
    if (n === 0) throw new CadPathError(`${field}.tangent`, 'there is no previous segment to be tangent to');
    const seg = this.segs[n - 1] as Seg;
    const a = this.vertexAt(n - 1);
    if (seg.bulge !== 0) return arcEndDirection(arcFromBulge(a, seg.to, seg.bulge));
    const len = dist(a, seg.to);
    return pt((seg.to[0] - a[0]) / len, (seg.to[1] - a[1]) / len);
  }

  private setCorner(spec: CornerSpec, options: CornerOptions, field: string): this {
    const n = this.segs.length;
    let v: number;
    if (options.vertex === undefined) {
      if (this.closedFlag) v = 0;
      else if (n >= 2) v = n - 1;
      else throw new CadPathError(field, 'there is no corner yet: add two segments first (or pass { vertex })');
    } else {
      v = options.vertex;
      if (!Number.isInteger(v)) throw new CadPathError(`${field}.vertex`, `must be an integer, got ${String(v)}`);
      const min = this.closedFlag ? 0 : 1;
      const max = n - 1;
      if (v < min || v > max) {
        throw new CadPathError(`${field}.vertex`, `${v} is not a corner of this path (corners: ${min}…${max})`);
      }
    }
    this.assertStraightCorner(v, field);
    computeCorner(this.vertexAt(v - 1), this.vertexAt(v), this.vertexAt(v + 1), spec, field);
    this.corners.set(v, spec);
    return this;
  }

  private setAllCorners(spec: CornerSpec, field: string): this {
    const n = this.segs.length;
    if (n === 0) throw new CadPathError(field, 'the path is empty');
    const from = this.closedFlag ? 0 : 1;
    for (let v = from; v < n; v++) {
      if (!this.isStraightLines(v)) continue;
      const a = this.vertexAt(v - 1);
      const b = this.vertexAt(v);
      const c = this.vertexAt(v + 1);
      const l1 = dist(a, b);
      const l2 = dist(b, c);
      const cross = ((a[0] - b[0]) * (c[1] - b[1]) - (a[1] - b[1]) * (c[0] - b[0])) / (l1 * l2);
      const dot = ((a[0] - b[0]) * (c[0] - b[0]) + (a[1] - b[1]) * (c[1] - b[1])) / (l1 * l2);
      if (Math.abs(cross) <= PATH_EPS && dot < 0) continue; // продолжение прямой — не угол
      computeCorner(a, b, c, spec, `${field}[vertex ${v}]`);
      this.corners.set(v, spec);
    }
    return this;
  }

  /** Оба сегмента, сходящиеся в вершине `v`, — прямые. */
  private isStraightLines(v: number): boolean {
    const n = this.segs.length;
    const before = this.segs[this.closedFlag ? (((v - 1) % n) + n) % n : v - 1];
    const after = this.segs[this.closedFlag ? v % n : v];
    return before !== undefined && after !== undefined && before.bulge === 0 && after.bulge === 0;
  }

  private assertStraightCorner(v: number, field: string): void {
    if (!this.isStraightLines(v)) {
      throw new CadPathError(field, `vertex ${v} touches an arc: only corners between two straight segments are supported`);
    }
  }
}
