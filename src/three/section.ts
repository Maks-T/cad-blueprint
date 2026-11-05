import { Matrix4, Mesh, Vector3 } from 'three';
import type { BufferGeometry, Object3D, Plane } from 'three';
import { defineBlock } from '../blocks/block';
import type { CadBlock } from '../blocks/types';
import { CadError } from '../errors';
import { nestContours, signedArea } from '../geometry/polygon';
import { buildPolyline } from '../primitives/build';
import type { EntityFill, PolylineEntity } from '../primitives/types';
import type { Point2 } from '../settings';

/** Система координат плоскости сечения: 2D-точка = `origin + x·xAxis + y·yAxis`, нормаль = `xAxis × yAxis`. */
export interface SectionBasis {
  readonly origin: Vector3;
  readonly xAxis: Vector3;
  readonly yAxis: Vector3;
  readonly normal: Vector3;
}

export interface SectionOptions {
  /** Допуск (единицы сцены): точки ближе — одна точка, вершины ближе к плоскости — на плоскости. По умолчанию 1e-6. */
  tolerance?: number;
  /**
   * Ось «вверх» 2D-чертежа в мире (проекция на плоскость). По умолчанию мировая Y, а для горизонтальной плоскости —
   * мировая −Z (вид сверху, «север» вверху).
   */
  up?: Vector3;
  /** Начало координат 2D (по умолчанию — ближайшая к началу мира точка плоскости). */
  origin?: Vector3;
  /** Дополнительная матрица геометрии (для `sectionGeometry`). */
  matrix?: Matrix4;
}

export interface SectionLoop {
  readonly points: Point2[];
  readonly closed: boolean;
}

export interface SectionResult {
  readonly basis: SectionBasis;
  /** Отрезки пересечения треугольников с плоскостью (2D). */
  readonly segments: readonly (readonly [Point2, Point2])[];
  /** Отрезки, собранные в контуры. Замкнутые — сечения тел; открытые — у незамкнутых сеток. */
  readonly loops: readonly SectionLoop[];
}

/** Базис плоскости сечения. */
export function sectionBasis(plane: Plane, options: Pick<SectionOptions, 'up' | 'origin'> = {}): SectionBasis {
  const n = plane.normal.clone().normalize();
  let up = options.up?.clone() ?? new Vector3(0, 1, 0);
  if (!options.up && Math.abs(n.dot(up)) > 0.99) up = new Vector3(0, 0, -1);
  const y = up.sub(n.clone().multiplyScalar(up.dot(n)));
  if (y.lengthSq() < 1e-20) throw new CadError('section.up', 'is parallel to the plane normal');
  y.normalize();
  const x = new Vector3().crossVectors(y, n).normalize();
  const origin = options.origin?.clone() ?? plane.coplanarPoint(new Vector3());
  return { origin, xAxis: x, yAxis: y, normal: n };
}

function collect(geometry: BufferGeometry, matrix: Matrix4, plane: Plane, basis: SectionBasis, tol: number, out: [Point2, Point2][]): void {
  const pos = geometry.getAttribute('position');
  if (!pos) return;
  const index = geometry.getIndex();
  const count = index ? index.count : pos.count;
  const a = new Vector3();
  const b = new Vector3();
  const c = new Vector3();
  const to2 = (v: Vector3): Point2 => {
    const d = v.clone().sub(basis.origin);
    const x = d.dot(basis.xAxis);
    const y = d.dot(basis.yAxis);
    return [x === 0 ? 0 : x, y === 0 ? 0 : y];
  };
  const get = (i: number, v: Vector3): Vector3 => v.fromBufferAttribute(pos, index ? index.getX(i) : i).applyMatrix4(matrix);
  for (let i = 0; i + 2 < count; i += 3) {
    const tri = [get(i, a), get(i + 1, b), get(i + 2, c)];
    const d = tri.map((v) => plane.distanceToPoint(v));
    const s = d.map((x) => (x > tol ? 1 : x < -tol ? -1 : 0));
    if (s.every((x) => x === 0)) continue; // треугольник в плоскости
    if (s.every((x) => x > 0) || s.every((x) => x < 0)) continue; // целиком по одну сторону
    const pts: Vector3[] = [];
    for (let k = 0; k < 3; k++) {
      const p = tri[k] as Vector3;
      const q = tri[(k + 1) % 3] as Vector3;
      const sp = s[k] as number;
      const sq = s[(k + 1) % 3] as number;
      const dp = d[k] as number;
      const dq = d[(k + 1) % 3] as number;
      if (sp === 0) pts.push(p.clone());
      if (sp * sq < 0) pts.push(p.clone().lerp(q, dp / (dp - dq)));
    }
    const uniq: Vector3[] = [];
    for (const p of pts) if (!uniq.some((u) => u.distanceTo(p) <= tol)) uniq.push(p);
    if (uniq.length === 2) out.push([to2(uniq[0] as Vector3), to2(uniq[1] as Vector3)]);
  }
}

/** Склеивает отрезки в контуры по совпадению концов (с допуском). */
export function chainSegments(segments: readonly (readonly [Point2, Point2])[], tolerance = 1e-6): SectionLoop[] {
  const q = Math.max(tolerance * 10, 1e-12);
  const key = (p: Point2): string => `${Math.round(p[0] / q)},${Math.round(p[1] / q)}`;
  const seen = new Set<string>();
  const edges: { a: string; b: string; pa: Point2; pb: Point2; used: boolean }[] = [];
  for (const [pa, pb] of segments) {
    const a = key(pa);
    const b = key(pb);
    if (a === b) continue;
    const id = a < b ? `${a}|${b}` : `${b}|${a}`;
    if (seen.has(id)) continue; // ребро в плоскости дают оба соседних треугольника
    seen.add(id);
    edges.push({ a, b, pa, pb, used: false });
  }
  const adj = new Map<string, number[]>();
  edges.forEach((e, i) => {
    adj.set(e.a, [...(adj.get(e.a) ?? []), i]);
    adj.set(e.b, [...(adj.get(e.b) ?? []), i]);
  });
  const loops: SectionLoop[] = [];
  const walk = (startKey: string, startPoint: Point2): SectionLoop => {
    const points: Point2[] = [startPoint];
    let cur = startKey;
    for (;;) {
      const next = (adj.get(cur) ?? []).find((i) => !(edges[i] as (typeof edges)[number]).used);
      if (next === undefined) break;
      const e = edges[next] as (typeof edges)[number];
      e.used = true;
      const forward = e.a === cur;
      cur = forward ? e.b : e.a;
      points.push(forward ? e.pb : e.pa);
      if (cur === startKey) {
        points.pop();
        return { points, closed: true };
      }
    }
    return { points, closed: false };
  };
  // Сначала открытые цепочки (от концов степени 1), затем циклы.
  for (const [k, list] of adj) {
    if (list.length === 1 && !(edges[list[0] as number] as (typeof edges)[number]).used) {
      const e = edges[list[0] as number] as (typeof edges)[number];
      loops.push(walk(k, e.a === k ? e.pa : e.pb));
    }
  }
  for (const e of edges) if (!e.used) loops.push(walk(e.a, e.pa));
  return loops.filter((l) => l.points.length >= 2);
}

/** Сечение геометрии плоскостью (в мировых координатах с учётом `options.matrix`). */
export function sectionGeometry(geometry: BufferGeometry, plane: Plane, options: SectionOptions = {}): SectionResult {
  const tol = options.tolerance ?? 1e-6;
  const basis = sectionBasis(plane, options);
  const segments: [Point2, Point2][] = [];
  collect(geometry, options.matrix ?? new Matrix4(), plane, basis, tol, segments);
  return { basis, segments, loops: chainSegments(segments, tol) };
}

/** Сечение всех мешей объекта (с их `matrixWorld`) одной плоскостью. */
export function sectionObject(object: Object3D, plane: Plane, options: Omit<SectionOptions, 'matrix'> = {}): SectionResult {
  const tol = options.tolerance ?? 1e-6;
  const basis = sectionBasis(plane, options);
  const segments: [Point2, Point2][] = [];
  object.updateMatrixWorld(true);
  object.traverse((child) => {
    if (child instanceof Mesh && child.geometry) collect(child.geometry as BufferGeometry, child.matrixWorld, plane, basis, tol, segments);
  });
  return { basis, segments, loops: chainSegments(segments, tol) };
}

/** Убирает промежуточные точки на одной прямой (сетки дают точку на каждом ребре треугольника). */
export function simplifyCollinear(points: readonly Point2[], closed: boolean, tolerance = 1e-6): Point2[] {
  if (points.length < 3) return [...points];
  const out: Point2[] = [];
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const prev = (out[out.length - 1] ?? (closed ? points[n - 1] : undefined)) as Point2 | undefined;
    const cur = points[i] as Point2;
    const next = (closed ? points[(i + 1) % n] : points[i + 1]) as Point2 | undefined;
    if (!prev || !next) {
      out.push(cur);
      continue;
    }
    const len = Math.hypot(next[0] - prev[0], next[1] - prev[1]);
    const cross = (cur[0] - prev[0]) * (next[1] - prev[1]) - (cur[1] - prev[1]) * (next[0] - prev[0]);
    if (len > 0 && Math.abs(cross) / len <= tolerance) continue;
    out.push(cur);
  }
  return out;
}

export interface SectionToBlockOptions {
  layer?: string;
  /** Заливка сечения (по умолчанию `'hatch'` — штриховка слоя, как положено разрезу). */
  fill?: EntityFill | null;
  /** Открытые цепочки тоже выводить (полилиниями без заливки). По умолчанию `false`. */
  includeOpen?: boolean;
  tolerance?: number;
  basePoint?: Point2;
}

/** Результат сечения → `CadBlock` с полилиниями (вложенные контуры — вырезы). */
export function sectionToBlock(result: SectionResult, name: string, options: SectionToBlockOptions = {}): CadBlock {
  const tol = options.tolerance ?? 1e-6;
  const layer = options.layer ?? '0';
  const closed = result.loops.filter((l) => l.closed).map((l) => simplifyCollinear(l.points, true, tol)).filter((p) => p.length >= 3 && Math.abs(signedArea(p)) > tol * tol);
  const nested = nestContours(closed);
  const entities: PolylineEntity[] = nested.map((n) =>
    buildPolyline({
      layer,
      vertices: closed[n.outer] as Point2[],
      closed: true,
      holes: n.holes.map((h) => closed[h] as Point2[]),
      fill: options.fill === undefined ? 'hatch' : options.fill,
    }),
  );
  if (options.includeOpen) {
    for (const l of result.loops.filter((x) => !x.closed)) entities.push(buildPolyline({ layer, vertices: simplifyCollinear(l.points, false, tol) }));
  }
  return defineBlock(name, entities, options.basePoint ? { basePoint: options.basePoint } : {});
}
