import type { Point2 } from '../settings';

/** Ориентированная площадь контура (> 0 — обход против часовой стрелки в числовой плоскости). */
export function signedArea(points: readonly Point2[]): number {
  let s = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i] as Point2;
    const b = points[(i + 1) % points.length] as Point2;
    s += a[0] * b[1] - b[0] * a[1];
  }
  return s / 2;
}

/** Точка внутри многоугольника (правило чётности, лучом вправо). Точки на границе — неопределённо. */
export function pointInPolygon(p: Point2, polygon: readonly Point2[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i] as Point2;
    const b = polygon[j] as Point2;
    if (a[1] > p[1] !== b[1] > p[1]) {
      const x = ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0];
      if (p[0] < x) inside = !inside;
    }
  }
  return inside;
}

/** Внутренняя точка многоугольника — для проверки вложенности контуров (центр масс или середина ребра со сдвигом). */
export function interiorPoint(polygon: readonly Point2[]): Point2 {
  const n = polygon.length;
  let cx = 0;
  let cy = 0;
  for (const p of polygon) {
    cx += p[0];
    cy += p[1];
  }
  const centroid: Point2 = [cx / n, cy / n];
  if (pointInPolygon(centroid, polygon)) return centroid;
  // Невыпуклый контур: пробуем точки чуть внутрь от середин рёбер.
  const area = signedArea(polygon);
  for (let i = 0; i < n; i++) {
    const a = polygon[i] as Point2;
    const b = polygon[(i + 1) % n] as Point2;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (len === 0) continue;
    const nx = (-(b[1] - a[1]) / len) * Math.sign(area || 1);
    const ny = ((b[0] - a[0]) / len) * Math.sign(area || 1);
    const eps = len * 1e-4;
    const p: Point2 = [(a[0] + b[0]) / 2 + nx * eps, (a[1] + b[1]) / 2 + ny * eps];
    if (pointInPolygon(p, polygon)) return p;
  }
  return centroid;
}

/**
 * Делит замкнутые контуры на внешние и вырезы по вложенности (чётная глубина — внешний контур, нечётная — вырез
 * ближайшего охватывающего). Возвращает индексы: `[{ outer, holes: [...] }]`.
 */
export function nestContours(polygons: readonly (readonly Point2[])[]): { outer: number; holes: number[] }[] {
  const areas = polygons.map((p) => Math.abs(signedArea(p)));
  const probes = polygons.map((p) => interiorPoint(p));
  const parent: number[] = polygons.map(() => -1);
  for (let i = 0; i < polygons.length; i++) {
    let best = -1;
    for (let j = 0; j < polygons.length; j++) {
      if (i === j || (areas[j] as number) <= (areas[i] as number)) continue;
      if (pointInPolygon(probes[i] as Point2, polygons[j] as Point2[])) {
        if (best === -1 || (areas[j] as number) < (areas[best] as number)) best = j;
      }
    }
    parent[i] = best;
  }
  const depth = (i: number): number => {
    let d = 0;
    let p = parent[i] as number;
    while (p !== -1) {
      d++;
      p = parent[p] as number;
    }
    return d;
  };
  const groups = new Map<number, number[]>();
  const result: { outer: number; holes: number[] }[] = [];
  polygons.forEach((_, i) => {
    if (depth(i) % 2 === 0) {
      const holes: number[] = [];
      groups.set(i, holes);
      result.push({ outer: i, holes });
    }
  });
  polygons.forEach((_, i) => {
    if (depth(i) % 2 === 1) groups.get(parent[i] as number)?.push(i);
  });
  return result;
}
