export { CadGeometryError } from './errors';
export {
  GEOM_EPS,
  add,
  angleDegOf,
  assertPoint,
  clean0,
  cross,
  distance,
  dot,
  fromAngleDeg,
  isFiniteNumber,
  isPoint2,
  length,
  lerp,
  midpoint,
  mul,
  normalize,
  normalizeAngleDeg,
  perp,
  point2,
  samePoint,
  sub,
} from './vec';
export {
  IDENTITY,
  applyToPoint,
  applyToVector,
  assertMatrix,
  compose,
  decompose,
  determinant,
  invert,
  isIdentity,
  isMirroring,
  isSimilarity,
  multiply,
  rotation,
  scaling,
  translation,
  uniformScale,
} from './matrix';
export type { Matrix2D } from './matrix';
export {
  BoundsBuilder,
  EMPTY_BOUNDS,
  boundsCenter,
  boundsCorners,
  boundsFromPoints,
  boundsHeight,
  boundsWidth,
  containsPoint,
  isEmptyBounds,
  padBounds,
  unionBounds,
} from './bounds';
export type { Bounds } from './bounds';
export {
  assertKnots,
  bezierBounds,
  clampedUniformKnots,
  evalBezier,
  evalParametricArc,
  evalSpline,
  parametricArcBounds,
  splineToBeziers,
} from './curves';
export type { ParametricArc } from './curves';
export { interiorPoint, nestContours, pointInPolygon, signedArea } from './polygon';
