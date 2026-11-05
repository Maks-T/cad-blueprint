import { viewportFactor } from '../blocks/viewport';
import type { BlockInsertEntity, CadBlock, ViewportEntity } from '../blocks/types';
import { CadBlockError } from '../blocks/errors';
import { entitiesBounds, viewportContentBounds, viewportTitle } from '../bounds/bounds';
import { resolveText } from '../bounds/text';
import { buildDimensionGeometry } from '../dimensions/geometry';
import type { DimensionEntity } from '../dimensions/types';
import type { CadDocument } from '../document/document';
import { viewportContext } from '../document/context';
import type { RenderContext } from '../document/context';
import { isDimension } from '../entities/kinds';
import type { Entity } from '../entities/types';
import { isEmptyBounds } from '../geometry/bounds';
import { fromAngleDeg } from '../geometry/vec';
import { getLineTypeName, nearestDxfColorIndex, resolveHatchColors, toDxfLineTypeElements, toDxfLineWeight, ZERO_LAYER_NAME } from '../layers';
import type { Layer, LineType } from '../layers';
import { isFullEllipse } from '../primitives/build';
import { rectVertices } from '../primitives/outline';
import type { EllipseEntity, EntityFill, MTextEntity, PrimitiveEntity, TextEntity } from '../primitives/types';
import type { PathVertex } from '../path-builder';
import { MAX_NESTING } from '../render/walk';
import { getUnitDefinition } from '../settings';
import type { Point2 } from '../settings';
import type { TextAnchor } from '../typography';
import { encodeDxfString, encodeMText, encodeText, escapePercent } from './encoding';

export interface DxfExportOptions {
  /** Лист документа (id или имя); по умолчанию первый. */
  sheet?: string;
  /** Знаков после запятой в координатах; по умолчанию `max(settings.precision, 6)`. */
  precision?: number;
  /**
   * Версия DXF: `'R2007'` (по умолчанию, AC1021) — текст и имена в UTF-8, кириллица читается любыми программами;
   * `'R2000'` (AC1015) — для старых программ: символы вне ASCII пишутся как `\U+XXXX`.
   */
  version?: 'R2007' | 'R2000';
}

const DEG = 180 / Math.PI;

function encodeMTextUtf8(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\{/g, '\\{').replace(/\}/g, '\\}').replace(/\t/g, '^I').replace(/\n/g, '\\P');
}

function fmt(v: number, precision: number): string {
  if (!Number.isFinite(v)) return '0';
  const s = v.toFixed(precision);
  const t = s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
  return t === '-0' ? '0' : t;
}

interface Space {
  readonly ctx: RenderContext;
  /** Масштаб типов линий (код 48) внутри блоков экранов. */
  readonly ltScale: number;
  readonly depth: number;
  readonly stack: readonly string[];
  /** Владелец объектов (BLOCK_RECORD). */
  readonly owner: string;
}

interface PendingBlock {
  readonly name: string;
  readonly basePoint: Point2;
  readonly entities: readonly Entity[];
  readonly space: Omit<Space, 'owner'>;
  readonly record: string;
}

class DxfWriter {
  private out: string[] = [];
  private handle = 0x20;
  readonly precision: number;
  readonly flip: boolean;
  readonly lineTypes = new Map<string, LineType>();
  private readonly blocks: { name: string; record: string; basePoint: Point2; body: string[] }[] = [];
  private readonly blockNames = new Map<string, string>();
  private readonly pending: PendingBlock[] = [];
  private vpCounter = 0;
  /** Владелец записей текущей таблицы (TABLES). */
  tableOwner = '0';

  constructor(
    readonly root: RenderContext,
    precision: number,
    readonly utf8: boolean,
  ) {
    this.precision = precision;
    this.flip = root.drawing.settings.coordinateSystem === 'screen';
  }

  newHandle(): string {
    this.handle += 1;
    return this.handle.toString(16).toUpperCase();
  }

  get handseed(): string {
    return (this.handle + 1).toString(16).toUpperCase();
  }

  /** Строка (имя, значение): UTF-8 как есть или `\U+XXXX` для R2000. */
  str(v: string): string {
    return this.utf8 ? v : encodeDxfString(v);
  }

  text(v: string): string {
    return this.utf8 ? escapePercent(v) : encodeText(v);
  }

  mtext(v: string): string {
    return this.utf8 ? encodeMTextUtf8(v) : encodeMText(v);
  }

  tag(code: number, value: string | number): void {
    this.out.push(String(code), typeof value === 'number' ? this.num(value) : value);
  }

  num(v: number): string {
    return fmt(v, this.precision);
  }

  /** Точка чертежа → DXF (Y вверх). */
  P(p: Point2): Point2 {
    return this.flip ? [p[0], p[1] === 0 ? 0 : -p[1]] : p;
  }

  point(code: number, p: Point2, z = true): void {
    const q = this.P(p);
    this.tag(code, q[0]);
    this.tag(code + 10, q[1]);
    if (z) this.tag(code + 20, 0);
  }

  /** Угол в числовой плоскости → DXF. */
  A(a: number): number {
    return this.flip ? -a : a;
  }

  take(): string[] {
    const t = this.out;
    this.out = [];
    return t;
  }

  pushRaw(lines: string[]): void {
    this.out.push(...lines);
  }

  registerLineType(lt: LineType): string {
    const name = getLineTypeName(lt);
    if (name !== 'CONTINUOUS' && !this.lineTypes.has(name)) this.lineTypes.set(name, lt);
    return name === 'CONTINUOUS' ? 'Continuous' : name;
  }

  /** Имя блока DXF для пары «блок × масштаб аннотаций» (тексты и размеры внутри зависят от масштаба). */
  blockFor(block: CadBlock, space: Omit<Space, 'owner'>): string {
    const factor = space.ctx.drawing.annotationFactor;
    const key = `${block.name.toLowerCase()}|${factor}|${space.ltScale}`;
    let name = this.blockNames.get(key);
    if (name) return name;
    const variants = [...this.blockNames.keys()].filter((k) => k.startsWith(`${block.name.toLowerCase()}|`)).length;
    name = variants === 0 ? block.name : `${block.name}$A${variants}`;
    this.blockNames.set(key, name);
    this.pending.push({ name, basePoint: block.basePoint, entities: block.entities, space, record: this.newHandle() });
    return name;
  }

  viewportBlock(entities: readonly Entity[], target: Point2, space: Omit<Space, 'owner'>): string {
    this.vpCounter += 1;
    const name = `_VIEWPORT${this.vpCounter}`;
    this.pending.push({ name, basePoint: target, entities, space, record: this.newHandle() });
    return name;
  }

  /** Генерирует отложенные блоки (вложенные вставки добавляют новые — цикл до опустошения). */
  flushBlocks(emit: (list: readonly Entity[], space: Space) => void): void {
    while (this.pending.length > 0) {
      const b = this.pending.shift() as PendingBlock;
      const saved = this.take();
      emit(b.entities, { ...b.space, owner: b.record });
      const body = this.take();
      this.pushRaw(saved);
      this.blocks.push({ name: b.name, record: b.record, basePoint: b.basePoint, body });
    }
  }

  get blockList(): readonly { name: string; record: string; basePoint: Point2; body: string[] }[] {
    return this.blocks;
  }
}

// ---------------------------------------------------------------------------------------------------------------------

function entityHeader(w: DxfWriter, type: string, owner: string, layerName: string, e: { color: string | null; lineWeight: number | null; lineType: LineType | null }, space: Space, subclass: string): void {
  w.tag(0, type);
  w.tag(5, w.newHandle());
  w.tag(330, owner);
  w.tag(100, 'AcDbEntity');
  w.tag(8, w.str(layerName));
  if (e.lineType !== null) w.tag(6, w.str(w.registerLineType(e.lineType)));
  if (e.color !== null) {
    w.tag(62, nearestDxfColorIndex(e.color));
    // R2007: точный цвет (код 420, 0xRRGGBB) — ACI остаётся для старых программ.
    if (w.utf8) w.tag(420, parseInt(e.color.slice(1), 16));
  }
  if (e.lineWeight !== null) w.tag(370, toDxfLineWeight(e.lineWeight));
  if (space.ltScale !== 1) w.tag(48, space.ltScale);
  w.tag(100, subclass);
}

type Style = { color: string | null; lineWeight: number | null; lineType: LineType | null };

function writeLine(w: DxfWriter, space: Space, layer: string, st: Style, a: Point2, b: Point2): void {
  entityHeader(w, 'LINE', space.owner, layer, st, space, 'AcDbLine');
  w.point(10, a);
  w.point(11, b);
}

/** ARC: в DXF всегда против часовой; дугу по часовой записываем с переставленными углами. */
function writeArc(w: DxfWriter, space: Space, layer: string, st: Style, center: Point2, r: number, a1: number, a2: number, ccw: boolean): void {
  let s = w.A(a1);
  let e = w.A(a2);
  let dxfCcw = w.flip ? !ccw : ccw;
  if (!dxfCcw) {
    [s, e] = [e, s];
    dxfCcw = true;
  }
  entityHeader(w, 'ARC', space.owner, layer, st, space, 'AcDbCircle');
  w.point(10, center);
  w.tag(40, r);
  w.tag(100, 'AcDbArc');
  w.tag(50, ((s % 360) + 360) % 360);
  w.tag(51, ((e % 360) + 360) % 360);
}

function writeCircle(w: DxfWriter, space: Space, layer: string, st: Style, center: Point2, r: number): void {
  entityHeader(w, 'CIRCLE', space.owner, layer, st, space, 'AcDbCircle');
  w.point(10, center);
  w.tag(40, r);
}

function flippedVertices(w: DxfWriter, vertices: readonly PathVertex[]): PathVertex[] {
  return vertices.map((v) => {
    const [x, y] = w.P([v[0], v[1]]);
    const b = v[2] ?? 0;
    return b === 0 ? [x, y] : [x, y, w.flip ? -b : b];
  });
}

function writeLwPolyline(w: DxfWriter, space: Space, layer: string, st: Style, vertices: readonly PathVertex[], closed: boolean, width = 0): void {
  entityHeader(w, 'LWPOLYLINE', space.owner, layer, st, space, 'AcDbPolyline');
  w.tag(90, vertices.length);
  w.tag(70, closed ? 1 : 0);
  if (width > 0) w.tag(43, width);
  for (const v of flippedVertices(w, vertices)) {
    w.tag(10, v[0]);
    w.tag(20, v[1]);
    if (v[2] !== undefined && v[2] !== 0) w.tag(42, v[2]);
  }
}

function writeEllipse(w: DxfWriter, space: Space, layer: string, st: Style, e: EllipseEntity): void {
  const major = e.radiusX >= e.radiusY;
  const rot = e.rotationDeg + (major ? 0 : 90);
  const len = major ? e.radiusX : e.radiusY;
  const ratio = major ? e.radiusY / e.radiusX : e.radiusX / e.radiusY;
  const shift = major ? 0 : 90;
  let t1 = e.startAngleDeg - shift;
  let t2 = e.endAngleDeg - shift;
  const [c, s] = fromAngleDeg(rot);
  let ax: Point2 = [c * len, s * len];
  if (w.flip) {
    ax = [ax[0], -ax[1]];
    [t1, t2] = [-t2, -t1];
  }
  entityHeader(w, 'ELLIPSE', space.owner, layer, st, space, 'AcDbEllipse');
  w.point(10, e.center);
  w.tag(11, ax[0]);
  w.tag(21, ax[1]);
  w.tag(31, 0);
  w.tag(40, ratio);
  const full = isFullEllipse(e);
  w.tag(41, full ? 0 : t1 / DEG);
  w.tag(42, full ? Math.PI * 2 : t2 / DEG);
}

function writeSpline(w: DxfWriter, space: Space, layer: string, st: Style, degree: number, controlPoints: readonly Point2[], knots: readonly number[]): void {
  entityHeader(w, 'SPLINE', space.owner, layer, st, space, 'AcDbSpline');
  w.tag(210, 0);
  w.tag(220, 0);
  w.tag(230, 1);
  w.tag(70, 8);
  w.tag(71, degree);
  w.tag(72, knots.length);
  w.tag(73, controlPoints.length);
  w.tag(74, 0);
  w.tag(42, 1e-10);
  w.tag(43, 1e-10);
  for (const k of knots) w.tag(40, k);
  for (const p of controlPoints) w.point(10, p);
}

const H_JUST: Record<string, number> = { left: 0, center: 1, right: 2 };
const V_JUST: Record<string, number> = { bottom: 0, middle: 2, top: 3 };
const ATTACH: Record<TextAnchor, number> = {
  'top-left': 1,
  'top-center': 2,
  'top-right': 3,
  'middle-left': 4,
  'middle-center': 5,
  'middle-right': 6,
  'bottom-left': 7,
  'bottom-center': 8,
  'bottom-right': 9,
};

function writeText(w: DxfWriter, space: Space, layer: string, st: Style, e: TextEntity | MTextEntity): void {
  const r = resolveText(e, space.ctx);
  const height = r.layout.fontHeight;
  const multiline = e.type === 'mtext' || e.value.includes('\n');
  const style = w.str(r.style.name);
  const textStyle: Style = { color: st.color, lineWeight: null, lineType: null };
  if (!multiline) {
    const [vertical, horizontal] = e.anchor.split('-') as [string, string];
    entityHeader(w, 'TEXT', space.owner, layer, textStyle, space, 'AcDbText');
    w.point(10, e.position);
    w.tag(40, height);
    w.tag(1, w.text(e.value));
    if (e.rotationDeg !== 0) w.tag(50, e.rotationDeg);
    if (r.style.widthFactor !== 1) w.tag(41, r.style.widthFactor);
    if (r.style.obliqueAngle !== 0) w.tag(51, r.style.obliqueAngle);
    w.tag(7, style);
    const h = H_JUST[horizontal] ?? 0;
    const v = V_JUST[vertical] ?? 0;
    if (h !== 0) w.tag(72, h);
    if (h !== 0 || v !== 0) w.point(11, e.position);
    w.tag(100, 'AcDbText');
    if (v !== 0) w.tag(73, v);
    return;
  }
  entityHeader(w, 'MTEXT', space.owner, layer, textStyle, space, 'AcDbMText');
  w.point(10, e.position);
  w.tag(40, height);
  w.tag(41, 0);
  w.tag(71, ATTACH[e.anchor]);
  w.tag(72, 1);
  const encoded = w.mtext(e.value);
  for (let i = 0; i + 250 < encoded.length; i += 250) w.tag(3, encoded.slice(i, i + 250));
  w.tag(1, encoded.slice(Math.floor(Math.max(0, encoded.length - 1) / 250) * 250));
  w.tag(7, style);
  const [c, s] = fromAngleDeg(e.rotationDeg);
  w.tag(11, c);
  w.tag(21, s);
  w.tag(31, 0);
  w.tag(73, 2);
  w.tag(44, Math.min(4, Math.max(0.25, r.style.lineHeight / (5 / 3))));
}

// ---------------------------------------------------------------------------------------------------------------------
// HATCH

type Loop = { kind: 'poly'; vertices: readonly PathVertex[] } | { kind: 'circle'; center: Point2; radius: number } | { kind: 'ellipse'; e: EllipseEntity };

function shapeLoops(e: PrimitiveEntity): Loop[] | null {
  switch (e.type) {
    case 'circle':
      return [{ kind: 'circle', center: e.center, radius: e.radius }];
    case 'rect':
      return [{ kind: 'poly', vertices: rectVertices(e) }];
    case 'polyline':
      return e.closed ? [{ kind: 'poly', vertices: e.vertices }, ...e.holes.map((h): Loop => ({ kind: 'poly', vertices: h }))] : null;
    case 'ellipse':
      return isFullEllipse(e) ? [{ kind: 'ellipse', e }] : null;
    default:
      return null;
  }
}

function writeHatch(
  w: DxfWriter,
  space: Space,
  layer: string,
  color: string | null,
  loops: Loop[],
  pattern: { solid: true } | { solid: false; families: { angle: number; spacing: number; offset: number; dash: readonly number[] }[] },
): void {
  entityHeader(w, 'HATCH', space.owner, layer, { color, lineWeight: null, lineType: null }, space, 'AcDbHatch');
  w.tag(10, 0);
  w.tag(20, 0);
  w.tag(30, 0);
  w.tag(210, 0);
  w.tag(220, 0);
  w.tag(230, 1);
  w.tag(2, pattern.solid ? 'SOLID' : pattern.families.length === 1 ? '_USER' : 'CB_CUSTOM');
  w.tag(70, pattern.solid ? 1 : 0);
  w.tag(71, 0);
  w.tag(91, loops.length);
  loops.forEach((loop, i) => {
    const external = i === 0 ? 1 : 0;
    if (loop.kind === 'poly') {
      const verts = flippedVertices(w, loop.vertices);
      const hasBulge = verts.some((v) => v[2] !== undefined && v[2] !== 0);
      w.tag(92, 2 | external);
      w.tag(72, hasBulge ? 1 : 0);
      w.tag(73, 1);
      w.tag(93, verts.length);
      for (const v of verts) {
        w.tag(10, v[0]);
        w.tag(20, v[1]);
        if (hasBulge) w.tag(42, v[2] ?? 0);
      }
      w.tag(97, 0);
    } else if (loop.kind === 'circle') {
      w.tag(92, external);
      w.tag(93, 1);
      w.tag(72, 2);
      const c = w.P(loop.center);
      w.tag(10, c[0]);
      w.tag(20, c[1]);
      w.tag(40, loop.radius);
      w.tag(50, 0);
      w.tag(51, 360);
      w.tag(73, 1);
      w.tag(97, 0);
    } else {
      const e = loop.e;
      const major = e.radiusX >= e.radiusY;
      const rot = e.rotationDeg + (major ? 0 : 90);
      const len = major ? e.radiusX : e.radiusY;
      const [cr, sr] = fromAngleDeg(rot);
      const ax = w.flip ? [cr * len, -sr * len] : [cr * len, sr * len];
      w.tag(92, external);
      w.tag(93, 1);
      w.tag(72, 3);
      const c = w.P(e.center);
      w.tag(10, c[0]);
      w.tag(20, c[1]);
      w.tag(11, ax[0] as number);
      w.tag(21, ax[1] as number);
      w.tag(40, major ? e.radiusY / e.radiusX : e.radiusX / e.radiusY);
      w.tag(50, 0);
      w.tag(51, 360);
      w.tag(73, 1);
      w.tag(97, 0);
    }
  });
  w.tag(75, 0);
  w.tag(76, pattern.solid ? 1 : pattern.families.length === 1 ? 0 : 2);
  if (!pattern.solid) {
    w.tag(52, 0);
    w.tag(41, 1);
    w.tag(77, 0);
    w.tag(78, pattern.families.length);
    for (const f of pattern.families) {
      const [dx, dy] = fromAngleDeg(f.angle);
      w.tag(53, f.angle);
      w.tag(43, 0);
      w.tag(44, 0);
      w.tag(45, f.offset * dx - f.spacing * dy);
      w.tag(46, f.offset * dy + f.spacing * dx);
      w.tag(79, f.dash.length);
      f.dash.forEach((d, i) => w.tag(49, i % 2 === 0 ? d : -d));
    }
  }
  w.tag(98, 0);
}

function writeFill(w: DxfWriter, space: Space, layerName: string, layer: Layer, e: PrimitiveEntity, fill: EntityFill): void {
  const loops = shapeLoops(e);
  if (!loops) return;
  if (fill === 'solid') return writeHatch(w, space, layerName, e.color, loops, { solid: true });
  if (fill !== 'hatch') return writeHatch(w, space, layerName, fill, loops, { solid: true });
  if (!layer.hatch) return;
  const hatch = resolveHatchColors(layer.hatch, e.color ?? layer.color);
  if (hatch.background) writeHatch(w, space, layerName, hatch.background, loops, { solid: true });
  if (hatch.families.length === 0) return;
  const toModel = (mm: number): number => space.ctx.drawing.paperMmToModel(mm);
  // Семейства разного цвета — отдельными штриховками; одного цвета — одной.
  const byColor = new Map<string, typeof hatch.families[number][]>();
  for (const f of hatch.families) {
    const key = f.color ?? '';
    byColor.set(key, [...(byColor.get(key) ?? []), f]);
  }
  for (const [color, families] of byColor) {
    writeHatch(w, space, layerName, color === '' ? e.color : color, loops, {
      solid: false,
      families: families.map((f) => ({ angle: f.angle, spacing: toModel(f.spacing), offset: toModel(f.offset), dash: f.dash.map(toModel) })),
    });
  }
}

// ---------------------------------------------------------------------------------------------------------------------

function writePrimitive(w: DxfWriter, e: PrimitiveEntity, layerName: string, layer: Layer, space: Space): void {
  if ('fill' in e && e.fill !== null) writeFill(w, space, layerName, layer, e, e.fill);
  const st: Style = e;
  switch (e.type) {
    case 'point':
      entityHeader(w, 'POINT', space.owner, layerName, st, space, 'AcDbPoint');
      w.point(10, e.position);
      return;
    case 'line':
      return writeLine(w, space, layerName, st, e.from, e.to);
    case 'circle':
      return writeCircle(w, space, layerName, st, e.center, e.radius);
    case 'arc':
      return writeArc(w, space, layerName, st, e.center, e.radius, e.startAngleDeg, e.endAngleDeg, e.counterclockwise);
    case 'ellipse':
      return writeEllipse(w, space, layerName, st, e);
    case 'rect':
      return writeLwPolyline(w, space, layerName, st, rectVertices(e), true);
    case 'polyline':
      writeLwPolyline(w, space, layerName, st, e.vertices, e.closed);
      for (const h of e.holes) writeLwPolyline(w, space, layerName, st, h, true);
      return;
    case 'text':
    case 'mtext':
      return writeText(w, space, layerName, st, e);
    case 'spline':
      return writeSpline(w, space, layerName, st, e.degree, e.controlPoints, e.knots);
    case 'bezier': {
      const n = (e.points.length - 1) / 3;
      const knots: number[] = [0, 0, 0, 0];
      for (let i = 1; i < n; i++) knots.push(i, i, i);
      knots.push(n, n, n, n);
      return writeSpline(w, space, layerName, st, 3, e.points, knots);
    }
  }
}

/** Размер в DXF — разложенным: LINE / ARC / SOLID / TEXT на слое размера (не DIMENSION). */
function writeDimension(w: DxfWriter, e: DimensionEntity, layerName: string, space: Space): void {
  const g = buildDimensionGeometry(e, space.ctx);
  const lineColor = e.color ?? g.style.lineColor;
  const textColor = e.color ?? g.style.textColor;
  const lw = e.lineWeight ?? g.style.lineWeight;
  const st: Style = { color: lineColor, lineWeight: lw, lineType: e.lineType };
  for (const c of g.curves) {
    if (c.kind === 'line') writeLine(w, space, layerName, st, c.from, c.to);
    else writeArc(w, space, layerName, st, c.center, c.radius, c.startAngleDeg, c.endAngleDeg, c.counterclockwise);
  }
  const term = g.metrics.terminator;
  for (const t of g.terminators) {
    const [cx, sx] = fromAngleDeg(t.angleDeg);
    const at = (p: Point2): Point2 => [t.tip[0] + p[0] * cx - p[1] * sx, t.tip[1] + p[0] * sx + p[1] * cx];
    for (const s of term.shapes) {
      if (s.kind === 'polygon') {
        const pts = s.points.map(at);
        entityHeader(w, 'SOLID', space.owner, layerName, { color: lineColor, lineWeight: null, lineType: null }, space, 'AcDbTrace');
        const order = pts.length === 3 ? [pts[0], pts[1], pts[2], pts[2]] : [pts[0], pts[1], pts[3], pts[2]];
        order.forEach((p, i) => w.point(10 + i, p as Point2));
      } else if (s.kind === 'polyline') {
        const pts = s.points.map(at);
        for (let i = 0; i + 1 < pts.length; i++) writeLine(w, space, layerName, st, pts[i] as Point2, pts[i + 1] as Point2);
      } else if (s.kind === 'line') {
        writeLine(w, space, layerName, st, at(s.from), at(s.to));
      } else {
        const c = at(s.center);
        if (s.fill) {
          // Залитая точка — «кольцо» из LWPOLYLINE с шириной (как DONUT в AutoCAD).
          const r = s.radius / 2;
          writeLwPolyline(w, space, layerName, { color: lineColor, lineWeight: null, lineType: null }, [[c[0] - r, c[1], 1], [c[0] + r, c[1], 1]], true, s.radius);
        } else {
          writeCircle(w, space, layerName, st, c, s.radius);
        }
      }
    }
  }
  for (const t of g.texts) {
    const text: TextEntity | MTextEntity = Object.freeze({
      type: t.text.includes('\n') ? 'mtext' : 'text',
      id: null,
      layer: e.layer,
      color: textColor,
      lineWeight: null,
      lineType: null,
      position: t.position,
      value: t.text,
      style: t.textStyle,
      height: t.paperHeight,
      rotationDeg: t.rotationDeg,
      anchor: t.anchor,
    }) as TextEntity | MTextEntity;
    writeText(w, space, layerName, { color: textColor, lineWeight: null, lineType: null }, text);
  }
}

function writeInsert(w: DxfWriter, name: string, e: Pick<BlockInsertEntity, 'position' | 'scaleX' | 'scaleY' | 'rotationDeg' | 'color' | 'lineWeight' | 'lineType'>, layerName: string, space: Space): void {
  entityHeader(w, 'INSERT', space.owner, layerName, e, space, 'AcDbBlockReference');
  w.tag(2, w.str(name));
  w.point(10, e.position);
  if (e.scaleX !== 1) w.tag(41, e.scaleX);
  if (e.scaleY !== 1) w.tag(42, e.scaleY);
  const rot = w.A(e.rotationDeg);
  if (rot !== 0) w.tag(50, ((rot % 360) + 360) % 360);
}

function writeEntities(w: DxfWriter, list: readonly Entity[], space: Space): void {
  for (const e of list) {
    // В DXF правило «слой 0 внутри блока» работает само: объект блока на слое 0 рисуется на слое вставки.
    const layerName = e.layer;
    const layer = space.ctx.layers.get(layerName) ?? space.ctx.layers.require(ZERO_LAYER_NAME);
    const outLayer = space.ctx.layers.has(layerName) ? layer.name : ZERO_LAYER_NAME;
    if (e.type === 'insert') {
      const block = space.ctx.blocks.get(e.block);
      if (!block) throw new CadBlockError(e.block, 'block is not defined');
      if (space.stack.includes(block.name.toLowerCase()) || space.depth >= MAX_NESTING) {
        throw new CadBlockError(block.name, 'circular or too deep block nesting');
      }
      const name = w.blockFor(block, { ctx: space.ctx, ltScale: space.ltScale, depth: space.depth + 1, stack: [...space.stack, block.name.toLowerCase()] });
      writeInsert(w, name, e, outLayer, space);
    } else if (e.type === 'viewport') {
      writeViewport(w, e, outLayer, space);
    } else if (isDimension(e)) {
      writeDimension(w, e, outLayer, space);
    } else {
      writePrimitive(w, e as PrimitiveEntity, outLayer, layer, space);
    }
  }
}

function writeViewport(w: DxfWriter, vp: ViewportEntity, layerName: string, space: Space): void {
  if (space.depth >= MAX_NESTING) throw new CadBlockError('viewport', 'too deep nesting');
  const k = viewportFactor(vp, space.ctx.drawing);
  const child = viewportContext(space.ctx, vp);
  const entities: Entity[] = [...vp.entities];
  const name = w.viewportBlock(entities, vp.target, { ctx: child, ltScale: space.ltScale / k, depth: space.depth + 1, stack: space.stack });
  writeInsert(w, name, { position: vp.position, scaleX: k, scaleY: k, rotationDeg: vp.rotationDeg, color: null, lineWeight: null, lineType: null }, layerName, space);
  if (vp.clip && vp.frame) {
    // Рамка экрана — в координатах родителя.
    const m = (p: Point2): Point2 => {
      const [c, s] = fromAngleDeg(vp.rotationDeg);
      const x = (p[0] - vp.target[0]) * k;
      const y = (p[1] - vp.target[1]) * k;
      return [vp.position[0] + x * c - y * s, vp.position[1] + x * s + y * c];
    };
    const c = vp.clip;
    const pts = [m([c.minX, c.minY]), m([c.maxX, c.minY]), m([c.maxX, c.maxY]), m([c.minX, c.maxY])];
    writeLwPolyline(w, space, layerName, { color: vp.color, lineWeight: vp.lineWeight, lineType: vp.lineType }, pts, true);
  }
  const title = viewportTitle(vp, space.ctx, viewportContentBounds(vp, space.ctx));
  if (title) writeText(w, space, layerName, { color: vp.color, lineWeight: null, lineType: null }, title);
}

// ---------------------------------------------------------------------------------------------------------------------

function table(w: DxfWriter, name: string, entries: () => void, count: number, extra?: () => void): void {
  const h = w.newHandle();
  w.tag(0, 'TABLE');
  w.tag(2, name);
  w.tag(5, h);
  w.tag(330, '0');
  w.tag(100, 'AcDbSymbolTable');
  w.tag(70, count);
  extra?.();
  w.tableOwner = h;
  entries();
  w.tag(0, 'ENDTAB');
}

function record(w: DxfWriter, type: string, subclass: string, handleCode = 5): void {
  w.tag(0, type);
  w.tag(handleCode, w.newHandle());
  w.tag(330, w.tableOwner);
  w.tag(100, 'AcDbSymbolTableRecord');
  w.tag(100, subclass);
}

/** Экспорт набора объектов в DXF (по умолчанию R2007 / UTF-8; см. `version`). */
export function exportEntitiesToDxf(entities: readonly Entity[], ctx: RenderContext, options: DxfExportOptions = {}): string {
  const version = options.version ?? 'R2007';
  const w = new DxfWriter(ctx, options.precision ?? Math.max(ctx.drawing.settings.precision, 6), version === 'R2007');
  const modelRecord = w.newHandle();
  const paperRecord = w.newHandle();
  const rootSpace: Space = { ctx, ltScale: 1, depth: 0, stack: [], owner: modelRecord };

  // 1. Объекты модели и (рекурсивно) блоки.
  writeEntities(w, entities, rootSpace);
  w.flushBlocks((list, space) => writeEntities(w, list, space));
  const entitiesBody = w.take();

  // 2. Типы линий: слоёв и объектов.
  for (const l of ctx.layers) w.registerLineType(l.lineType);

  const bounds = entitiesBounds(entities, ctx);
  const ext = isEmptyBounds(bounds) ? { minX: 0, minY: 0, maxX: 0, maxY: 0 } : bounds;
  const lo = w.P([ext.minX, w.flip ? ext.maxY : ext.minY]);
  const hi = w.P([ext.maxX, w.flip ? ext.minY : ext.maxY]);

  // 3. Таблицы.
  const tables = (): void => {
    table(w, 'VPORT', () => {
      record(w, 'VPORT', 'AcDbViewportTableRecord');
      w.tag(2, '*ACTIVE');
      w.tag(70, 0);
      w.tag(10, 0);
      w.tag(20, 0);
      w.tag(11, 1);
      w.tag(21, 1);
      w.tag(12, (lo[0] + hi[0]) / 2);
      w.tag(22, (lo[1] + hi[1]) / 2);
      w.tag(40, Math.max(hi[1] - lo[1], 1) * 1.1);
      w.tag(41, Math.max((hi[0] - lo[0]) / Math.max(hi[1] - lo[1], 1), 0.1));
    }, 1);
    const lts = [...w.lineTypes.entries()];
    table(w, 'LTYPE', () => {
      for (const [name, desc] of [['ByBlock', ''], ['ByLayer', ''], ['Continuous', 'Solid line']] as const) {
        record(w, 'LTYPE', 'AcDbLinetypeTableRecord');
        w.tag(2, name);
        w.tag(70, 0);
        w.tag(3, desc);
        w.tag(72, 65);
        w.tag(73, 0);
        w.tag(40, 0);
      }
      for (const [name, lt] of lts) {
        const els = toDxfLineTypeElements(lt).map((v) => ctx.drawing.paperMmToModel(v));
        record(w, 'LTYPE', 'AcDbLinetypeTableRecord');
        w.tag(2, w.str(name));
        w.tag(70, 0);
        w.tag(3, name);
        w.tag(72, 65);
        w.tag(73, els.length);
        w.tag(40, els.reduce((a, b) => a + Math.abs(b), 0));
        for (const v of els) {
          w.tag(49, v);
          w.tag(74, 0);
        }
      }
    }, 3 + lts.length);
    const layers = ctx.layers.list();
    table(w, 'LAYER', () => {
      for (const l of layers) {
        record(w, 'LAYER', 'AcDbLayerTableRecord');
        w.tag(2, w.str(l.name));
        w.tag(70, l.locked ? 4 : 0);
        w.tag(62, l.visible ? l.dxfColorIndex : -l.dxfColorIndex);
        w.tag(6, w.str(w.registerLineType(l.lineType)));
        w.tag(370, toDxfLineWeight(l.lineWeight));
      }
    }, layers.length);
    const styles = ctx.textStyles.list();
    table(w, 'STYLE', () => {
      for (const s of styles) {
        const font = ctx.fonts.has(s.fontFamily) ? ctx.fonts.resolveDxfFont(s.fontFamily) : { shx: 'txt.shx', ttf: null, bigFont: null };
        record(w, 'STYLE', 'AcDbTextStyleTableRecord');
        w.tag(2, w.str(s.name));
        w.tag(70, 0);
        w.tag(40, 0);
        w.tag(41, s.widthFactor);
        w.tag(50, s.obliqueAngle);
        w.tag(71, 0);
        w.tag(42, ctx.drawing.annotationToModel(s.height));
        w.tag(3, w.str(font.ttf ?? font.shx ?? 'txt.shx'));
        w.tag(4, w.str(font.bigFont ?? ''));
      }
    }, styles.length);
    table(w, 'VIEW', () => undefined, 0);
    table(w, 'UCS', () => undefined, 0);
    table(w, 'APPID', () => {
      record(w, 'APPID', 'AcDbRegAppTableRecord');
      w.tag(2, 'ACAD');
      w.tag(70, 0);
    }, 1);
    table(
      w,
      'DIMSTYLE',
      () => {
        record(w, 'DIMSTYLE', 'AcDbDimStyleTableRecord', 105);
        w.tag(2, 'Standard');
        w.tag(70, 0);
      },
      1,
      () => w.tag(100, 'AcDbDimStyleTable'),
    );
    const blocks = w.blockList;
    table(w, 'BLOCK_RECORD', () => {
      const rec = (handle: string, name: string): void => {
        w.tag(0, 'BLOCK_RECORD');
        w.tag(5, handle);
        w.tag(330, w.tableOwner);
        w.tag(100, 'AcDbSymbolTableRecord');
        w.tag(100, 'AcDbBlockTableRecord');
        w.tag(2, name);
      };
      rec(modelRecord, '*Model_Space');
      rec(paperRecord, '*Paper_Space');
      for (const b of blocks) rec(b.record, w.str(b.name));
    }, 2 + blocks.length);
  };

  const blockSection = (): void => {
    const block = (record: string, name: string, base: Point2, body: string[]): void => {
      w.tag(0, 'BLOCK');
      w.tag(5, w.newHandle());
      w.tag(330, record);
      w.tag(100, 'AcDbEntity');
      w.tag(8, '0');
      w.tag(100, 'AcDbBlockBegin');
      w.tag(2, name);
      w.tag(70, 0);
      w.point(10, base);
      w.tag(3, name);
      w.tag(1, '');
      w.pushRaw(body);
      w.tag(0, 'ENDBLK');
      w.tag(5, w.newHandle());
      w.tag(330, record);
      w.tag(100, 'AcDbEntity');
      w.tag(8, '0');
      w.tag(100, 'AcDbBlockEnd');
    };
    block(modelRecord, '*Model_Space', [0, 0], []);
    block(paperRecord, '*Paper_Space', [0, 0], []);
    for (const b of w.blockList) block(b.record, w.str(b.name), b.basePoint, b.body);
  };

  // 4. Сборка файла.
  const units = getUnitDefinition(ctx.drawing.settings.units).dxfInsUnits;
  const header = (seed: string): void => {
    w.tag(0, 'SECTION');
    w.tag(2, 'HEADER');
    w.tag(9, '$ACADVER');
    w.tag(1, version === 'R2007' ? 'AC1021' : 'AC1015');
    w.tag(9, '$DWGCODEPAGE');
    w.tag(3, 'ANSI_1252');
    w.tag(9, '$INSBASE');
    w.point(10, [0, 0]);
    w.tag(9, '$EXTMIN');
    w.tag(10, lo[0]);
    w.tag(20, lo[1]);
    w.tag(30, 0);
    w.tag(9, '$EXTMAX');
    w.tag(10, hi[0]);
    w.tag(20, hi[1]);
    w.tag(30, 0);
    w.tag(9, '$LTSCALE');
    w.tag(40, 1);
    w.tag(9, '$INSUNITS');
    w.tag(70, units);
    w.tag(9, '$MEASUREMENT');
    w.tag(70, ctx.drawing.settings.units === 'inch' ? 0 : 1);
    w.tag(9, '$LWDISPLAY');
    w.tag(290, 1);
    w.tag(9, '$HANDSEED');
    w.tag(5, seed);
    w.tag(0, 'ENDSEC');
  };

  w.tag(0, 'SECTION');
  w.tag(2, 'CLASSES');
  w.tag(0, 'ENDSEC');
  w.tag(0, 'SECTION');
  w.tag(2, 'TABLES');
  tables();
  w.tag(0, 'ENDSEC');
  w.tag(0, 'SECTION');
  w.tag(2, 'BLOCKS');
  blockSection();
  w.tag(0, 'ENDSEC');
  w.tag(0, 'SECTION');
  w.tag(2, 'ENTITIES');
  w.pushRaw(entitiesBody);
  w.tag(0, 'ENDSEC');
  // OBJECTS: корневой словарь с ACAD_GROUP.
  const root = w.newHandle();
  const groups = w.newHandle();
  w.tag(0, 'SECTION');
  w.tag(2, 'OBJECTS');
  w.tag(0, 'DICTIONARY');
  w.tag(5, root);
  w.tag(330, '0');
  w.tag(100, 'AcDbDictionary');
  w.tag(281, 1);
  w.tag(3, 'ACAD_GROUP');
  w.tag(350, groups);
  w.tag(0, 'DICTIONARY');
  w.tag(5, groups);
  w.tag(330, root);
  w.tag(100, 'AcDbDictionary');
  w.tag(281, 1);
  w.tag(0, 'ENDSEC');
  w.tag(0, 'EOF');
  const rest = w.take();
  header(w.handseed);
  const head = w.take();
  return [...head, ...rest].join('\n') + '\n';
}

/** Экспорт листа документа (по умолчанию — первого) в DXF. */
export function exportDxf(doc: CadDocument, options: DxfExportOptions = {}): string {
  const sheet = doc.requireSheet(options.sheet);
  return exportEntitiesToDxf(sheet.entities, doc.context(), options);
}
