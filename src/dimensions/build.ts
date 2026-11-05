import { dot, fromAngleDeg, perp, sub } from '../geometry/vec';
import {
  assertKnownKeys,
  assertObject,
  bool,
  finite,
  freezeEntity,
  optionalString,
  parseEntityProps,
  pointOf,
  pointsOf,
  positive,
  textValue,
} from '../primitives/common';
import type { Point2 } from '../settings';
import { CadDimensionError } from './errors';
import type {
  DimAlignedEntity,
  DimAlignedInit,
  DimAngularEntity,
  DimAngularInit,
  DimBaselineEntity,
  DimBaselineInit,
  DimChainEntity,
  DimChainInit,
  DimDiameterEntity,
  DimDiameterInit,
  DimLinearEntity,
  DimLinearInit,
  DimPlacementInit,
  DimRadiusEntity,
  DimRadiusInit,
  LeaderEntity,
  LeaderInit,
} from './types';

const MAX_DIM_TEXT = 1000;
const MAX_CHAIN_POINTS = 1000;

function styleOf(v: unknown, field: string): string | null {
  return optionalString(v, field, 255);
}

function overrideText(v: unknown, field: string): string | null {
  if (v === undefined || v === null) return null;
  const t = textValue(v, field, true);
  if (t.length > MAX_DIM_TEXT) throw new CadDimensionError(field, `must be at most ${MAX_DIM_TEXT} characters`);
  return t;
}

function directionOf(v: unknown, field: string, p1: Point2, p2: Point2): number {
  if (v === undefined) return Math.abs(p2[0] - p1[0]) >= Math.abs(p2[1] - p1[1]) ? 0 : 90;
  if (v === 'horizontal') return 0;
  if (v === 'vertical') return 90;
  return finite(v, field);
}

/** Смещение размерной линии от `origin` по нормали направления `angleDeg + 90°` (из `offset` или точки `at`). */
function offsetOf(init: DimPlacementInit, origin: Point2, angleDeg: number, field: string): number {
  if (init.offset !== undefined && init.at !== undefined) {
    throw new CadDimensionError(field, 'set either "offset" or "at", not both');
  }
  if (init.at !== undefined) {
    const at = pointOf(init.at, `${field}.at`);
    const n = perp(fromAngleDeg(angleDeg));
    const off = dot(sub(at, origin), n);
    return off === 0 ? 0 : off;
  }
  return finite(init.offset ?? 0, `${field}.offset`);
}

const PLACEMENT_KEYS = ['offset', 'at'];

export function buildDimLinear(init: DimLinearInit): DimLinearEntity {
  assertObject(init, 'dim-linear');
  assertKnownKeys(init, ['p1', 'p2', 'direction', 'style', 'text', ...PLACEMENT_KEYS], 'dim-linear');
  const p1 = pointOf(init.p1, 'dim-linear.p1');
  const p2 = pointOf(init.p2, 'dim-linear.p2');
  const angleDeg = directionOf(init.direction, 'dim-linear.direction', p1, p2);
  return freezeEntity({
    type: 'dim-linear',
    ...parseEntityProps(init, 'dim-linear'),
    style: styleOf(init.style, 'dim-linear.style'),
    text: overrideText(init.text, 'dim-linear.text'),
    p1,
    p2,
    angleDeg,
    offset: offsetOf(init, p1, angleDeg, 'dim-linear'),
  });
}

export function buildDimAligned(init: DimAlignedInit): DimAlignedEntity {
  assertObject(init, 'dim-aligned');
  assertKnownKeys(init, ['p1', 'p2', 'style', 'text', ...PLACEMENT_KEYS], 'dim-aligned');
  const p1 = pointOf(init.p1, 'dim-aligned.p1');
  const p2 = pointOf(init.p2, 'dim-aligned.p2');
  if (Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) <= 1e-12) throw new CadDimensionError('dim-aligned', 'p1 and p2 coincide');
  const angleDeg = (Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * 180) / Math.PI;
  return freezeEntity({
    type: 'dim-aligned',
    ...parseEntityProps(init, 'dim-aligned'),
    style: styleOf(init.style, 'dim-aligned.style'),
    text: overrideText(init.text, 'dim-aligned.text'),
    p1,
    p2,
    offset: offsetOf(init, p1, angleDeg, 'dim-aligned'),
  });
}

export function buildDimChain(init: DimChainInit): DimChainEntity {
  assertObject(init, 'dim-chain');
  assertKnownKeys(init, ['points', 'direction', 'style', 'texts', ...PLACEMENT_KEYS], 'dim-chain');
  const points = pointsOf(init.points, 'dim-chain.points', 2);
  if (points.length > MAX_CHAIN_POINTS) throw new CadDimensionError('dim-chain.points', `at most ${MAX_CHAIN_POINTS} points`);
  const angleDeg = directionOf(init.direction, 'dim-chain.direction', points[0] as Point2, points[points.length - 1] as Point2);
  let texts: (string | null)[] | null = null;
  if (init.texts !== undefined && init.texts !== null) {
    if (!Array.isArray(init.texts) || init.texts.length !== points.length - 1) {
      throw new CadDimensionError('dim-chain.texts', `must be an array of ${points.length - 1} items (one per segment)`);
    }
    texts = init.texts.map((t, i) => overrideText(t, `dim-chain.texts[${i}]`));
  }
  return freezeEntity({
    type: 'dim-chain',
    ...parseEntityProps(init, 'dim-chain'),
    style: styleOf(init.style, 'dim-chain.style'),
    text: null,
    points: Object.freeze(points),
    angleDeg,
    offset: offsetOf(init, points[0] as Point2, angleDeg, 'dim-chain'),
    texts: texts === null ? null : Object.freeze(texts),
  });
}

export function buildDimBaseline(init: DimBaselineInit): DimBaselineEntity {
  assertObject(init, 'dim-baseline');
  assertKnownKeys(init, ['base', 'points', 'direction', 'style', 'spacing', ...PLACEMENT_KEYS], 'dim-baseline');
  const base = pointOf(init.base, 'dim-baseline.base');
  const points = pointsOf(init.points, 'dim-baseline.points', 1);
  if (points.length > MAX_CHAIN_POINTS) throw new CadDimensionError('dim-baseline.points', `at most ${MAX_CHAIN_POINTS} points`);
  const far = points.reduce((a, b) => (Math.hypot(b[0] - base[0], b[1] - base[1]) > Math.hypot(a[0] - base[0], a[1] - base[1]) ? b : a));
  const angleDeg = directionOf(init.direction, 'dim-baseline.direction', base, far);
  const spacing = init.spacing === undefined || init.spacing === null ? null : positive(init.spacing, 'dim-baseline.spacing');
  return freezeEntity({
    type: 'dim-baseline',
    ...parseEntityProps(init, 'dim-baseline'),
    style: styleOf(init.style, 'dim-baseline.style'),
    text: null,
    base,
    points: Object.freeze(points),
    angleDeg,
    offset: offsetOf(init, base, angleDeg, 'dim-baseline'),
    spacing,
  });
}

export function buildDimAngular(init: DimAngularInit): DimAngularEntity {
  assertObject(init, 'dim-angular');
  assertKnownKeys(init, ['center', 'start', 'end', 'radius', 'counterclockwise', 'style', 'text'], 'dim-angular');
  const center = pointOf(init.center, 'dim-angular.center');
  const start = pointOf(init.start, 'dim-angular.start');
  const end = pointOf(init.end, 'dim-angular.end');
  const r1 = Math.hypot(start[0] - center[0], start[1] - center[1]);
  const r2 = Math.hypot(end[0] - center[0], end[1] - center[1]);
  if (r1 <= 1e-12 || r2 <= 1e-12) throw new CadDimensionError('dim-angular', 'start and end must differ from center');
  return freezeEntity({
    type: 'dim-angular',
    ...parseEntityProps(init, 'dim-angular'),
    style: styleOf(init.style, 'dim-angular.style'),
    text: overrideText(init.text, 'dim-angular.text'),
    center,
    start,
    end,
    radius: init.radius === undefined ? Math.min(r1, r2) : positive(init.radius, 'dim-angular.radius'),
    counterclockwise: bool(init.counterclockwise, 'dim-angular.counterclockwise', true),
  });
}

function buildRadial<T extends 'dim-radius' | 'dim-diameter'>(type: T, init: DimRadiusInit) {
  assertObject(init, type);
  assertKnownKeys(init, ['center', 'radius', 'angleDeg', 'style', 'text'], type);
  return {
    type,
    ...parseEntityProps(init, type),
    style: styleOf(init.style, `${type}.style`),
    text: overrideText(init.text, `${type}.text`),
    center: pointOf(init.center, `${type}.center`),
    radius: positive(init.radius, `${type}.radius`),
    angleDeg: finite(init.angleDeg ?? 45, `${type}.angleDeg`),
  };
}

export function buildDimRadius(init: DimRadiusInit): DimRadiusEntity {
  return freezeEntity(buildRadial('dim-radius', init));
}

export function buildDimDiameter(init: DimDiameterInit): DimDiameterEntity {
  return freezeEntity(buildRadial('dim-diameter', init));
}

export function buildLeader(init: LeaderInit): LeaderEntity {
  assertObject(init, 'leader');
  assertKnownKeys(init, ['points', 'text', 'style', 'shelf', 'shelfLength'], 'leader');
  const points = pointsOf(init.points, 'leader.points', 2);
  const shelfLength =
    init.shelfLength === undefined || init.shelfLength === null ? null : positive(init.shelfLength, 'leader.shelfLength');
  const text = textValue(init.text, 'leader.text', true);
  if (text.length > MAX_DIM_TEXT) throw new CadDimensionError('leader.text', `must be at most ${MAX_DIM_TEXT} characters`);
  return freezeEntity({
    type: 'leader',
    ...parseEntityProps(init, 'leader'),
    points: Object.freeze(points),
    text,
    style: styleOf(init.style, 'leader.style'),
    shelf: bool(init.shelf, 'leader.shelf', true),
    shelfLength,
  });
}

// Короткие фабрики.
export const dimLinear = (p1: Point2, p2: Point2, options: Omit<DimLinearInit, 'p1' | 'p2'> = {}): DimLinearEntity =>
  buildDimLinear({ ...options, p1, p2 });
export const dimAligned = (p1: Point2, p2: Point2, options: Omit<DimAlignedInit, 'p1' | 'p2'> = {}): DimAlignedEntity =>
  buildDimAligned({ ...options, p1, p2 });
export const dimChain = (points: readonly Point2[], options: Omit<DimChainInit, 'points'> = {}): DimChainEntity =>
  buildDimChain({ ...options, points });
export const dimBaseline = (
  base: Point2,
  points: readonly Point2[],
  options: Omit<DimBaselineInit, 'base' | 'points'> = {},
): DimBaselineEntity => buildDimBaseline({ ...options, base, points });
export const dimAngular = (
  center: Point2,
  start: Point2,
  end: Point2,
  options: Omit<DimAngularInit, 'center' | 'start' | 'end'> = {},
): DimAngularEntity => buildDimAngular({ ...options, center, start, end });
export const dimRadius = (center: Point2, radius: number, options: Omit<DimRadiusInit, 'center' | 'radius'> = {}): DimRadiusEntity =>
  buildDimRadius({ ...options, center, radius });
export const dimDiameter = (
  center: Point2,
  radius: number,
  options: Omit<DimDiameterInit, 'center' | 'radius'> = {},
): DimDiameterEntity => buildDimDiameter({ ...options, center, radius });
export const leader = (points: readonly Point2[], text: string, options: Omit<LeaderInit, 'points' | 'text'> = {}): LeaderEntity =>
  buildLeader({ ...options, points, text });
