import type { Point2 } from '../settings';
import { CadDimStyleError } from './errors';

/**
 * Окончание размерной линии.
 * - `arrow-closed` — закрытая залитая стрелка (ГОСТ 2.307);
 * - `arrow-open` — открытая стрелка (две линии);
 * - `tick` — архитектурная засечка под 45° к размерной линии;
 * - `dot` — залитая точка; `circle` — кружок без заливки;
 * - `none` — без окончаний.
 */
export type TerminatorType = 'arrow-closed' | 'arrow-open' | 'tick' | 'dot' | 'circle' | 'none';

/** На вход принимается и `oblique` — синоним `tick` (в генплане «`tick` / `oblique`»); хранится всегда `tick`. */
export type TerminatorTypeInput = TerminatorType | 'oblique';

export const TERMINATOR_TYPES: readonly TerminatorType[] = Object.freeze([
  'arrow-closed',
  'arrow-open',
  'tick',
  'dot',
  'circle',
  'none',
] as const);

export function isTerminatorType(value: unknown): value is TerminatorType {
  return typeof value === 'string' && (TERMINATOR_TYPES as readonly string[]).includes(value);
}

/** Проверяет значение и приводит синоним `oblique` к `tick`. */
export function normalizeTerminatorType(value: unknown, field = 'terminatorType'): TerminatorType {
  if (value === 'oblique') return 'tick';
  if (!isTerminatorType(value)) {
    throw new CadDimStyleError(
      field,
      `must be one of ${TERMINATOR_TYPES.join(' | ')} (or "oblique" as an alias of "tick"), got ${String(value)}`,
    );
  }
  return value;
}

/** Часть рисунка окончания. Все координаты — в локальной системе, см. `TerminatorGeometry`. */
export type TerminatorShape =
  | { readonly kind: 'polygon'; readonly points: readonly Point2[] } // замкнутый, залитый цветом линии
  | { readonly kind: 'polyline'; readonly points: readonly Point2[] } // открытая ломаная, без заливки
  | { readonly kind: 'line'; readonly from: Point2; readonly to: Point2 }
  | { readonly kind: 'circle'; readonly center: Point2; readonly radius: number; readonly fill: boolean };

/**
 * Рисунок окончания в локальных координатах:
 * остриё — в (0, 0), размерная линия подходит со стороны отрицательных X (то есть окончание нарисовано для
 * КОНЦА линии, идущей в сторону +X; для начала линии его разворачивают на 180° — в SVG это `orient="auto-start-reverse"`).
 * Единицы — те же, что у переданного размера (мм на бумаге либо единицы модели).
 */
export interface TerminatorGeometry {
  readonly type: TerminatorType;
  readonly shapes: readonly TerminatorShape[];
  /** Насколько окончание заходит назад вдоль размерной линии (в сторону −X) от острия. */
  readonly extent: number;
  /**
   * На каком расстоянии от острия размерная линия должна заканчиваться, чтобы не просвечивать сквозь окончание
   * (кружок без заливки: линия упирается в его край). 0 — линия идёт до острия.
   */
  readonly lineTrim: number;
}

export interface TerminatorGeometryOptions {
  /** Полный угол при вершине стрелки, градусы (по умолчанию 20 — ГОСТ 2.307). */
  arrowAngle?: number;
}

const freezePoint = (x: number, y: number): Point2 => Object.freeze([x, y]) as unknown as Point2;

/**
 * Геометрия окончания размерной линии.
 * `size`: длина стрелки / длина засечки / диаметр точки и кружка.
 */
export function getTerminatorGeometry(
  type: TerminatorType,
  size: number,
  options: TerminatorGeometryOptions = {},
): TerminatorGeometry {
  if (!isTerminatorType(type)) {
    throw new CadDimStyleError('type', `must be one of ${TERMINATOR_TYPES.join(' | ')}, got ${String(type)}`);
  }
  if (typeof size !== 'number' || !Number.isFinite(size) || size <= 0) {
    throw new CadDimStyleError('size', `must be a positive finite number, got ${String(size)}`);
  }
  const angle = options.arrowAngle ?? 20;
  if (typeof angle !== 'number' || !Number.isFinite(angle) || angle <= 0 || angle >= 180) {
    throw new CadDimStyleError('arrowAngle', `must be a number in range 0…180 (exclusive), got ${String(angle)}`);
  }

  let shapes: TerminatorShape[] = [];
  let extent = 0;
  let lineTrim = 0;

  switch (type) {
    case 'arrow-closed':
    case 'arrow-open': {
      const half = size * Math.tan((angle * Math.PI) / 360); // половина ширины основания
      const tip = freezePoint(0, 0);
      const a = freezePoint(-size, half);
      const b = freezePoint(-size, -half);
      shapes = [
        type === 'arrow-closed'
          ? { kind: 'polygon', points: Object.freeze([tip, a, b]) }
          : { kind: 'polyline', points: Object.freeze([a, tip, b]) },
      ];
      extent = size;
      break;
    }
    case 'tick': {
      // Засечка длиной `size` под 45° к размерной линии, центр — в острие.
      const h = size / (2 * Math.SQRT2);
      shapes = [{ kind: 'line', from: freezePoint(-h, -h), to: freezePoint(h, h) }];
      break;
    }
    case 'dot': {
      shapes = [{ kind: 'circle', center: freezePoint(0, 0), radius: size / 2, fill: true }];
      extent = size / 2;
      break;
    }
    case 'circle': {
      shapes = [{ kind: 'circle', center: freezePoint(0, 0), radius: size / 2, fill: false }];
      extent = size / 2;
      lineTrim = size / 2;
      break;
    }
    case 'none':
      break;
  }

  return Object.freeze({ type, shapes: Object.freeze(shapes.map((s) => Object.freeze(s))), extent, lineTrim });
}
