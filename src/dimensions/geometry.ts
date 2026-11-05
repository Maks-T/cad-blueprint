import { formatDimensionText, layoutDimText, resolveDimStyleMetrics } from '../dim-styles';
import type { DimStyle, DimStyleMetrics, DimStyleTable } from '../dim-styles';
import { add, angleDegOf, dot, fromAngleDeg, mul, normalize, perp, sub } from '../geometry/vec';
import type { DrawingMetrics, Point2 } from '../settings';
import { measureTextInModel, placeText, projectTextOnAxis } from '../typography';
import type { TextAnchor, TextLayout } from '../typography';
import { CadDimensionError } from './errors';
import type {
  DimAngularEntity,
  DimBaselineEntity,
  DimChainEntity,
  DimDiameterEntity,
  DimensionEntity,
  DimRadiusEntity,
  LeaderEntity,
} from './types';

/** Что нужно для построения размеров: метрики чертежа (масштаб) и таблица размерных стилей (→ текстовые стили → шрифты). */
export interface DimensionContext {
  readonly drawing: DrawingMetrics;
  readonly dimStyles: DimStyleTable;
}

export type DimLineRole = 'dimension' | 'extension' | 'leader' | 'shelf';

/**
 * Линия размера. `startTerminator` / `endTerminator` — окончание в этой точке; оно ориентировано по направлению
 * линии (в конце — по ходу, в начале — против хода), как `marker-end` / `marker-start` с `orient="auto-start-reverse"`.
 */
export interface DimGeometryLine {
  readonly kind: 'line';
  readonly role: DimLineRole;
  readonly from: Point2;
  readonly to: Point2;
  readonly startTerminator: boolean;
  readonly endTerminator: boolean;
}

export interface DimGeometryArc {
  readonly kind: 'arc';
  readonly role: DimLineRole;
  readonly center: Point2;
  readonly radius: number;
  /** Углы в числовой плоскости, [0, 360). */
  readonly startAngleDeg: number;
  readonly endAngleDeg: number;
  readonly counterclockwise: boolean;
  readonly startTerminator: boolean;
  readonly endTerminator: boolean;
}

export type DimGeometryCurve = DimGeometryLine | DimGeometryArc;

/** Окончание: остриё и направление, с которого к нему подходит линия (ось +X локального рисунка `TerminatorGeometry`). */
export interface DimGeometryTerminator {
  readonly tip: Point2;
  /** Угол направления в числовой плоскости, градусы. */
  readonly angleDeg: number;
}

export interface DimGeometryText {
  readonly text: string;
  readonly position: Point2;
  /** Поворот так, как он виден на экране (против часовой), как у `TextEntity`. */
  readonly rotationDeg: number;
  readonly anchor: TextAnchor;
  /** Имя текстового стиля. */
  readonly textStyle: string;
  /** Высота текста, мм на бумаге. */
  readonly paperHeight: number;
  /** Высота текста в единицах модели. */
  readonly height: number;
  readonly layout: TextLayout;
  /** Углы габарита текста в координатах чертежа. */
  readonly corners: readonly Point2[];
}

/** Готовая геометрия размера в координатах чертежа (для рендереров и габаритов). */
export interface DimensionGeometry {
  readonly style: DimStyle;
  readonly metrics: DimStyleMetrics;
  /** Измеренные значения (мм модели или градусы): одно для простых размеров, по звену для цепочки / базы. */
  readonly values: readonly number[];
  readonly curves: readonly DimGeometryCurve[];
  readonly terminators: readonly DimGeometryTerminator[];
  readonly texts: readonly DimGeometryText[];
}

const EPS = 1e-9;
const DEG = Math.PI / 180;

// ---------------------------------------------------------------------------------------------------------------------
// Сборщик результата. Размер считается в «видимой» декартовой системе (Y вверх на экране);
// для документа `screen` точки отражаются по Y на входе и на выходе.

class Collector {
  readonly curves: DimGeometryCurve[] = [];
  readonly texts: DimGeometryText[] = [];
  readonly values: number[] = [];

  constructor(
    readonly ctx: DimensionContext,
    readonly style: DimStyle,
    readonly metrics: DimStyleMetrics,
  ) {}

  line(role: DimLineRole, from: Point2, to: Point2, startTerminator = false, endTerminator = false): void {
    if (Math.hypot(to[0] - from[0], to[1] - from[1]) <= EPS) return;
    this.curves.push({ kind: 'line', role, from, to, startTerminator, endTerminator });
  }

  arc(role: DimLineRole, center: Point2, radius: number, a1: number, a2: number, ccw: boolean, st = false, et = false): void {
    if (Math.abs(a2 - a1) * radius <= EPS) return;
    this.curves.push({
      kind: 'arc',
      role,
      center,
      radius,
      startAngleDeg: norm360(a1),
      endAngleDeg: norm360(a2),
      counterclockwise: ccw,
      startTerminator: st,
      endTerminator: et,
    });
  }

  text(text: string, position: Point2, rotationDeg: number, anchor: TextAnchor, layout: TextLayout, textStyle: string, paperHeight: number): void {
    const placed = placeText(layout, { position, rotationDeg });
    this.texts.push({ text, position, rotationDeg, anchor, textStyle, paperHeight, height: layout.fontHeight, layout, corners: placed.corners });
  }
}

function norm360(a: number): number {
  const n = Number((((a % 360) + 360) % 360).toFixed(10)) % 360;
  return n === 0 ? 0 : n;
}

function resolveStyle(ctx: DimensionContext, name: string | null): DimStyle {
  if (name === null) return ctx.dimStyles.current;
  const style = ctx.dimStyles.get(name);
  if (!style) throw new CadDimensionError('style', `dimension style "${name}" is not registered`);
  return style;
}

function applyOverride(override: string | null, formatted: string): string {
  return override === null ? formatted : override.split('<>').join(formatted);
}

function isArrowLike(style: DimStyle): boolean {
  return style.terminatorType !== 'tick' && style.terminatorType !== 'none';
}

/** Длина текста вдоль линии (проекция габарита с наклоном). */
function textSpanAlong(layout: TextLayout, rotationDeg: number, lineAngleDeg: number): number {
  return projectTextOnAxis(placeText(layout, { rotationDeg }), lineAngleDeg, [0, 0]).length;
}

// ---------------------------------------------------------------------------------------------------------------------
// Линейный размер между двумя точками на линии с направлением `angleDeg`.

interface LinearOptions {
  hideExt1: boolean;
  hideExt2: boolean;
  text: string | null;
}

function linearCore(col: Collector, p1: Point2, p2: Point2, angleDeg: number, offset: number, opt: LinearOptions): void {
  const { style, metrics, ctx } = col;
  const d = fromAngleDeg(angleDeg);
  const n = perp(d);
  const c = dot(p1, n) + offset;
  const dist1 = c - dot(p1, n);
  const dist2 = c - dot(p2, n);
  const D1 = add(p1, mul(n, dist1));
  const D2 = add(p2, mul(n, dist2));
  const value = Math.abs(dot(sub(p2, p1), d));
  col.values.push(value);
  if (value <= EPS) throw new CadDimensionError('points', 'the measured distance along the dimension direction is zero');

  // Выносные линии.
  const ext = (p: Point2, D: Point2, dist: number): void => {
    if (Math.abs(dist) <= metrics.extensionOffset + EPS) return;
    const s = Math.sign(dist);
    col.line('extension', add(p, mul(n, s * metrics.extensionOffset)), add(D, mul(n, s * metrics.extensionOvershoot)));
  };
  if (!opt.hideExt1 && !style.hideFirstExtensionLine) ext(p1, D1, dist1);
  if (!opt.hideExt2 && !style.hideSecondExtensionLine) ext(p2, D2, dist2);

  const u = normalize(sub(D2, D1));
  const lineAngle = angleDegOf(u);
  const L = value;
  const extent = metrics.terminator.extent;
  const arrows = isArrowLike(style);
  const arrowsOutside = arrows && L < 2 * extent + metrics.textGap;
  const tail = 2 * extent;

  // Текст.
  const text = applyOverride(opt.text, formatDimensionText(value, style, 'linear'));
  const textStyle = ctx.dimStyles.resolveTextStyle(style);
  const placement = layoutDimText(text, style, ctx.dimStyles.textStyles, ctx.drawing, { lineAngleDeg: lineAngle });
  const span = textSpanAlong(placement.layout, placement.rotationDeg, lineAngle);
  const inner = L - (arrowsOutside ? 0 : 2 * extent);
  const textFits = placement.position === 'outside' || span + 2 * metrics.textGap <= inner;
  const mid: Point2 = [(D1[0] + D2[0]) / 2, (D1[1] + D2[1]) / 2];
  const nl = perp(u);

  let breakSpan: { start: number; end: number } | null = null;
  if (textFits && placement.position !== 'outside') {
    const pos = add(add(mid, mul(u, placement.along.offset)), mul(nl, placement.across));
    col.text(text, pos, placement.rotationDeg, placement.anchor, placement.layout, textStyle.name, textStyle.height);
    if (placement.lineBreak) breakSpan = placement.lineBreak;
  } else {
    // Текст не помещается (или стиль `outside`): переносим его за второе окончание, на продолжение размерной линии.
    const startAt = add(D2, mul(u, (arrowsOutside ? tail : 0) + metrics.textGap));
    if (style.textPosition === 'above') {
      const shelfLen = span + 2 * metrics.textGap;
      col.line('dimension', D2, add(startAt, mul(u, shelfLen - metrics.textGap)));
      const pos = add(add(startAt, mul(u, shelfLen / 2 - metrics.textGap)), mul(nl, placement.across));
      col.text(text, pos, placement.rotationDeg, placement.anchor, placement.layout, textStyle.name, textStyle.height);
    } else {
      const out = layoutDimText(text, { ...style, textPosition: 'outside' }, ctx.dimStyles.textStyles, ctx.drawing, {
        lineAngleDeg: lineAngle,
      });
      col.text(text, startAt, out.rotationDeg, out.anchor, out.layout, textStyle.name, textStyle.height);
    }
  }

  // Размерная линия и окончания.
  if (arrowsOutside) {
    col.line('dimension', sub(D1, mul(u, tail)), D1, false, true);
    col.line('dimension', D1, D2);
    col.line('dimension', add(D2, mul(u, tail)), D2, false, true);
    return;
  }
  const over = metrics.effectiveDimLineOvershoot;
  if (over > 0) {
    col.line('dimension', sub(D1, mul(u, over)), D1);
    col.line('dimension', D2, add(D2, mul(u, over)));
  }
  if (breakSpan) {
    col.line('dimension', D1, add(mid, mul(u, breakSpan.start)), true, false);
    col.line('dimension', add(mid, mul(u, breakSpan.end)), D2, false, true);
  } else {
    col.line('dimension', D1, D2, true, true);
  }
}

// ---------------------------------------------------------------------------------------------------------------------

function angularCore(col: Collector, e: DimAngularEntity): void {
  const { style, metrics, ctx } = col;
  const C = e.center;
  let a1 = angleDegOf(sub(e.start, C));
  let a2 = angleDegOf(sub(e.end, C));
  let r1 = Math.hypot(e.start[0] - C[0], e.start[1] - C[1]);
  let r2 = Math.hypot(e.end[0] - C[0], e.end[1] - C[1]);
  if (!e.counterclockwise) {
    [a1, a2] = [a2, a1];
    [r1, r2] = [r2, r1];
  }
  let sweep = norm360(a2 - a1);
  if (sweep <= 1e-9) throw new CadDimensionError('dim-angular', 'the two rays coincide: the angle is zero');
  a2 = a1 + sweep;
  col.values.push(sweep);
  const R = e.radius;

  const ext = (a: number, r: number): void => {
    const dir = fromAngleDeg(a);
    if (R > r + metrics.extensionOffset) {
      col.line('extension', add(C, mul(dir, r + metrics.extensionOffset)), add(C, mul(dir, R + metrics.extensionOvershoot)));
    } else if (R < r - metrics.extensionOffset) {
      col.line('extension', add(C, mul(dir, r - metrics.extensionOffset)), add(C, mul(dir, Math.max(0, R - metrics.extensionOvershoot))));
    }
  };
  if (!style.hideFirstExtensionLine) ext(a1, r1);
  if (!style.hideSecondExtensionLine) ext(a2, r2);

  const arcLen = R * sweep * DEG;
  const extent = metrics.terminator.extent;
  const arrowsOutside = isArrowLike(style) && arcLen < 2 * extent + metrics.textGap;

  const text = applyOverride(e.text, formatDimensionText(sweep, style, 'angular'));
  const textStyle = ctx.dimStyles.resolveTextStyle(style);
  const am = a1 + sweep / 2;
  const tangentAngle = am - 90; // левая нормаль касательной смотрит наружу
  const position = style.textPosition === 'centered' ? 'centered' : 'above';
  const placement = layoutDimText(text, { ...style, textPosition: position }, ctx.dimStyles.textStyles, ctx.drawing, {
    lineAngleDeg: tangentAngle,
  });
  const P = add(C, mul(fromAngleDeg(am), R));
  let breakA: [number, number] | null = null;
  if (placement.lineBreak && !arrowsOutside) {
    // Касательная (am − 90°) идёт по часовой: смещение +s по ней = уменьшение угла на s / R.
    const b1 = am - (placement.lineBreak.end / R) / DEG;
    const b2 = am - (placement.lineBreak.start / R) / DEG;
    if (b1 - a1 > extent / R / DEG && a2 - b2 > extent / R / DEG) breakA = [b1, b2];
  }
  if (placement.lineBreak && !breakA) {
    const above = layoutDimText(text, { ...style, textPosition: 'above' }, ctx.dimStyles.textStyles, ctx.drawing, {
      lineAngleDeg: tangentAngle,
    });
    col.text(text, add(P, mul(fromAngleDeg(am), above.across)), above.rotationDeg, above.anchor, above.layout, textStyle.name, textStyle.height);
  } else {
    col.text(text, add(P, mul(fromAngleDeg(am), placement.across)), placement.rotationDeg, placement.anchor, placement.layout, textStyle.name, textStyle.height);
  }

  if (arrowsOutside) {
    const t = (2 * extent) / R / DEG;
    col.arc('dimension', C, R, a1 - t, a1, true, false, true);
    col.arc('dimension', C, R, a1, a2, true);
    col.arc('dimension', C, R, a2 + t, a2, false, false, true);
    return;
  }
  const over = metrics.effectiveDimLineOvershoot / R / DEG;
  if (over > 0) {
    col.arc('dimension', C, R, a1 - over, a1, true);
    col.arc('dimension', C, R, a2, a2 + over, true);
  }
  if (breakA) {
    col.arc('dimension', C, R, a1, breakA[0], true, true, false);
    col.arc('dimension', C, R, breakA[1], a2, true, false, true);
  } else {
    col.arc('dimension', C, R, a1, a2, true, true, true);
  }
}

// ---------------------------------------------------------------------------------------------------------------------

function radialCore(col: Collector, e: DimRadiusEntity | DimDiameterEntity): void {
  const { style, metrics, ctx } = col;
  const diameter = e.type === 'dim-diameter';
  const u = fromAngleDeg(e.angleDeg);
  const C = e.center;
  const R = e.radius;
  const P2 = add(C, mul(u, R));
  const P1 = diameter ? sub(C, mul(u, R)) : C;
  const value = diameter ? 2 * R : R;
  col.values.push(value);
  const text = applyOverride(e.text, formatDimensionText(value, style, diameter ? 'diameter' : 'radius'));
  const textStyle = ctx.dimStyles.resolveTextStyle(style);
  const placement = layoutDimText(text, style, ctx.dimStyles.textStyles, ctx.drawing, { lineAngleDeg: e.angleDeg });
  const span = textSpanAlong(placement.layout, placement.rotationDeg, e.angleDeg);
  const extent = metrics.terminator.extent;
  const length = diameter ? 2 * R : R;
  const inner = length - (diameter ? 2 : 1) * extent;
  const fits = placement.position !== 'outside' && span + 2 * metrics.textGap <= inner;
  const nl = perp(u);

  if (fits) {
    const mid: Point2 = diameter ? C : add(C, mul(u, R / 2));
    const pos = add(add(mid, mul(u, placement.along.offset)), mul(nl, placement.across));
    col.text(text, pos, placement.rotationDeg, placement.anchor, placement.layout, textStyle.name, textStyle.height);
    if (placement.lineBreak) {
      col.line('dimension', P1, add(mid, mul(u, placement.lineBreak.start)), diameter, false);
      col.line('dimension', add(mid, mul(u, placement.lineBreak.end)), P2, false, true);
    } else {
      col.line('dimension', P1, P2, diameter, true);
    }
    return;
  }
  // Текст снаружи: размерная линия продолжается за окружность, текст — на продолжении.
  col.line('dimension', P1, P2, diameter, true);
  const startAt = add(P2, mul(u, metrics.textGap));
  if (style.textPosition === 'above') {
    const shelf = span + 2 * metrics.textGap;
    col.line('dimension', P2, add(P2, mul(u, shelf + metrics.textGap)));
    const pos = add(add(P2, mul(u, metrics.textGap + shelf / 2)), mul(nl, placement.across));
    col.text(text, pos, placement.rotationDeg, placement.anchor, placement.layout, textStyle.name, textStyle.height);
  } else {
    const out = layoutDimText(text, { ...style, textPosition: 'outside' }, ctx.dimStyles.textStyles, ctx.drawing, {
      lineAngleDeg: e.angleDeg,
    });
    col.text(text, startAt, out.rotationDeg, out.anchor, out.layout, textStyle.name, textStyle.height);
  }
}

// ---------------------------------------------------------------------------------------------------------------------

function leaderCore(col: Collector, e: LeaderEntity): void {
  const { style, metrics, ctx } = col;
  const pts = e.points;
  for (let i = 0; i < pts.length - 1; i++) {
    col.line('leader', pts[i] as Point2, pts[i + 1] as Point2, i === 0, false);
  }
  const last = pts[pts.length - 1] as Point2;
  const prev = pts[pts.length - 2] as Point2;
  const dir = last[0] - prev[0] < -EPS ? -1 : 1;
  const textStyle = ctx.dimStyles.resolveTextStyle(style);
  const gap = metrics.textGap;
  if (e.shelf) {
    const anchor: TextAnchor = dir > 0 ? 'bottom-left' : 'bottom-right';
    const layout = measureTextInModel(e.text, textStyle, ctx.dimStyles.textStyles.fonts, ctx.drawing, { anchor });
    const width = layout.box.maxX - layout.box.minX;
    const shelfLen = e.shelfLength === null ? width + 2 * gap : ctx.drawing.annotationToModel(e.shelfLength);
    col.line('shelf', last, [last[0] + dir * shelfLen, last[1]]);
    col.text(e.text, [last[0] + dir * gap, last[1] + gap], 0, anchor, layout, textStyle.name, textStyle.height);
  } else {
    const anchor: TextAnchor = dir > 0 ? 'middle-left' : 'middle-right';
    const layout = measureTextInModel(e.text, textStyle, ctx.dimStyles.textStyles.fonts, ctx.drawing, { anchor });
    col.text(e.text, [last[0] + dir * gap, last[1]], 0, anchor, layout, textStyle.name, textStyle.height);
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// Отражение по Y для документа `screen`.

const fy = (p: Point2): Point2 => [p[0], p[1] === 0 ? 0 : -p[1]];

function toVisual(e: DimensionEntity): DimensionEntity {
  switch (e.type) {
    case 'dim-linear':
      return { ...e, p1: fy(e.p1), p2: fy(e.p2), angleDeg: -e.angleDeg, offset: -e.offset };
    case 'dim-aligned':
      return { ...e, p1: fy(e.p1), p2: fy(e.p2), offset: -e.offset };
    case 'dim-chain':
      return { ...e, points: e.points.map(fy), angleDeg: -e.angleDeg, offset: -e.offset };
    case 'dim-baseline':
      return { ...e, base: fy(e.base), points: e.points.map(fy), angleDeg: -e.angleDeg, offset: -e.offset };
    case 'dim-angular':
      return { ...e, center: fy(e.center), start: fy(e.start), end: fy(e.end), counterclockwise: !e.counterclockwise };
    case 'dim-radius':
    case 'dim-diameter':
      return { ...e, center: fy(e.center), angleDeg: -e.angleDeg };
    case 'leader':
      return { ...e, points: e.points.map(fy) };
  }
}

function fromVisual(g: DimensionGeometry): DimensionGeometry {
  return {
    ...g,
    curves: g.curves.map((c) =>
      c.kind === 'line'
        ? { ...c, from: fy(c.from), to: fy(c.to) }
        : { ...c, center: fy(c.center), startAngleDeg: norm360(-c.startAngleDeg), endAngleDeg: norm360(-c.endAngleDeg), counterclockwise: !c.counterclockwise },
    ),
    terminators: g.terminators.map((t) => ({ tip: fy(t.tip), angleDeg: -t.angleDeg })),
    texts: g.texts.map((t) => ({ ...t, position: fy(t.position), corners: t.corners.map(fy) })),
  };
}

/** Окончания по флагам линий: в конце — по ходу линии, в начале — против хода. */
function collectTerminators(curves: readonly DimGeometryCurve[]): DimGeometryTerminator[] {
  const out: DimGeometryTerminator[] = [];
  for (const c of curves) {
    if (c.kind === 'line') {
      const dir = angleDegOf(sub(c.to, c.from));
      if (c.endTerminator) out.push({ tip: c.to, angleDeg: dir });
      if (c.startTerminator) out.push({ tip: c.from, angleDeg: dir + 180 });
    } else {
      const at = (a: number): Point2 => add(c.center, mul(fromAngleDeg(a), c.radius));
      const s = c.counterclockwise ? 1 : -1;
      if (c.endTerminator) out.push({ tip: at(c.endAngleDeg), angleDeg: c.endAngleDeg + s * 90 });
      if (c.startTerminator) out.push({ tip: at(c.startAngleDeg), angleDeg: c.startAngleDeg - s * 90 });
    }
  }
  return out.map((t) => ({ tip: t.tip, angleDeg: norm360(t.angleDeg) }));
}

/**
 * Строит геометрию размера или выноски: линии (с отметками окончаний), окончания и тексты — в координатах чертежа.
 * Стиль берётся из `ctx.dimStyles` по имени (`null` — текущий), длины переводятся по масштабу аннотаций `ctx.drawing`.
 */
export function buildDimensionGeometry(entity: DimensionEntity, ctx: DimensionContext): DimensionGeometry {
  const style = resolveStyle(ctx, entity.style);
  const metrics = resolveDimStyleMetrics(style, ctx.drawing);
  const screen = ctx.drawing.settings.coordinateSystem === 'screen';
  const e = screen ? toVisual(entity) : entity;
  const col = new Collector(ctx, style, metrics);

  switch (e.type) {
    case 'dim-linear':
      linearCore(col, e.p1, e.p2, e.angleDeg, e.offset, { hideExt1: false, hideExt2: false, text: e.text });
      break;
    case 'dim-aligned': {
      const angle = angleDegOf(sub(e.p2, e.p1));
      linearCore(col, e.p1, e.p2, angle, e.offset, { hideExt1: false, hideExt2: false, text: e.text });
      break;
    }
    case 'dim-chain':
      chainCore(col, e);
      break;
    case 'dim-baseline':
      baselineCore(col, e);
      break;
    case 'dim-angular':
      angularCore(col, e);
      break;
    case 'dim-radius':
    case 'dim-diameter':
      radialCore(col, e);
      break;
    case 'leader':
      leaderCore(col, e);
      break;
    default:
      throw new CadDimensionError('type', `unknown dimension type ${String((e as { type: unknown }).type)}`);
  }

  const result: DimensionGeometry = {
    style,
    metrics,
    values: col.values,
    curves: col.curves,
    terminators: collectTerminators(col.curves),
    texts: col.texts,
  };
  return screen ? fromVisual(result) : result;
}

function chainCore(col: Collector, e: DimChainEntity): void {
  const n = perp(fromAngleDeg(e.angleDeg));
  const c = dot(e.points[0] as Point2, n) + e.offset;
  for (let i = 0; i < e.points.length - 1; i++) {
    const a = e.points[i] as Point2;
    const b = e.points[i + 1] as Point2;
    linearCore(col, a, b, e.angleDeg, c - dot(a, n), { hideExt1: i > 0, hideExt2: false, text: e.texts?.[i] ?? null });
  }
}

function baselineCore(col: Collector, e: DimBaselineEntity): void {
  const d = fromAngleDeg(e.angleDeg);
  const spacing = e.spacing === null ? col.metrics.baselineSpacing : col.ctx.drawing.annotationToModel(e.spacing);
  const sign = e.offset < 0 ? -1 : 1;
  const sorted = [...e.points].sort((p, q) => Math.abs(dot(sub(p, e.base), d)) - Math.abs(dot(sub(q, e.base), d)));
  sorted.forEach((p, k) => {
    // Выносную линию базы рисует только последний (дальний) размер — она покрывает все остальные.
    linearCore(col, e.base, p, e.angleDeg, e.offset + sign * k * spacing, {
      hideExt1: k < sorted.length - 1,
      hideExt2: false,
      text: null,
    });
  });
}
