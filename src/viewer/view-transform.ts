import type { Bounds } from '../geometry/bounds';

/** Область просмотра в координатах SVG (Y вниз), как атрибут `viewBox`. */
export interface ViewBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** Размер контейнера в CSS-пикселях. */
export interface ViewportSize {
  readonly width: number;
  readonly height: number;
}

/**
 * Подгоняет `viewBox` под пропорции контейнера (без искажений): исходная область целиком видна и стоит по центру,
 * `marginPx` — поля в пикселях экрана.
 */
export function fitViewBox(content: ViewBox, size: ViewportSize, marginPx = 0): ViewBox {
  const w = Math.max(size.width - 2 * marginPx, 1);
  const h = Math.max(size.height - 2 * marginPx, 1);
  const cw = Math.max(content.width, 1e-9);
  const ch = Math.max(content.height, 1e-9);
  const unitsPerPx = Math.max(cw / w, ch / h);
  const width = size.width * unitsPerPx;
  const height = size.height * unitsPerPx;
  return {
    x: content.x + cw / 2 - width / 2,
    y: content.y + ch / 2 - height / 2,
    width,
    height,
  };
}

/** Единиц SVG на один пиксель экрана. */
export function unitsPerPixel(view: ViewBox, size: ViewportSize): number {
  return view.width / Math.max(size.width, 1);
}

/** Точка экрана (пиксели от левого верхнего угла контейнера) → координаты SVG. */
export function screenToSvg(view: ViewBox, size: ViewportSize, px: number, py: number): [number, number] {
  return [view.x + (px / Math.max(size.width, 1)) * view.width, view.y + (py / Math.max(size.height, 1)) * view.height];
}

/** Зум в `factor` раз (> 1 — приблизить) так, чтобы точка под курсором осталась на месте. */
export function zoomAt(view: ViewBox, size: ViewportSize, factor: number, px: number, py: number): ViewBox {
  const [sx, sy] = screenToSvg(view, size, px, py);
  const width = view.width / factor;
  const height = view.height / factor;
  return {
    x: sx - (px / Math.max(size.width, 1)) * width,
    y: sy - (py / Math.max(size.height, 1)) * height,
    width,
    height,
  };
}

/** Сдвиг на `dxPx`, `dyPx` пикселей экрана (содержимое едет вместе с курсором). */
export function panBy(view: ViewBox, size: ViewportSize, dxPx: number, dyPx: number): ViewBox {
  const k = unitsPerPixel(view, size);
  return { ...view, x: view.x - dxPx * k, y: view.y - dyPx * k };
}

/** Новые пропорции контейнера: центр и масштаб (единиц на пиксель) сохраняются. */
export function resizeViewBox(view: ViewBox, from: ViewportSize, to: ViewportSize): ViewBox {
  const k = unitsPerPixel(view, from);
  const cx = view.x + view.width / 2;
  const cy = view.y + view.height / 2;
  const width = to.width * k;
  const height = to.height * k;
  return { x: cx - width / 2, y: cy - height / 2, width, height };
}

/** Габарит модели → область SVG (для `cartesian` ось Y отражается). */
export function boundsToViewBox(b: Bounds, flipY: boolean): ViewBox {
  return { x: b.minX, y: flipY ? -b.maxY : b.minY, width: b.maxX - b.minX, height: b.maxY - b.minY };
}

/** Точка SVG → координаты модели. */
export function svgToModel(x: number, y: number, flipY: boolean): [number, number] {
  return [x, flipY ? -y : y];
}
