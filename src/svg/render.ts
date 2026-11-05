import { insertMatrix } from '../blocks/insert';
import { viewportMatrix } from '../blocks/viewport';
import type { BlockInsertEntity, CadBlock, ViewportEntity } from '../blocks/types';
import { CadBlockError } from '../blocks/errors';
import { resolveText } from '../bounds/text';
import { entitiesBounds, viewportContentBounds, viewportTitle } from '../bounds/bounds';
import type { TerminatorGeometry } from '../dim-styles';
import { buildDimensionGeometry } from '../dimensions/geometry';
import type { DimGeometryCurve } from '../dimensions/geometry';
import type { DimensionEntity } from '../dimensions/types';
import type { CadDocument } from '../document/document';
import { viewportContext } from '../document/context';
import type { RenderContext } from '../document/context';
import { isDimension } from '../entities/kinds';
import type { Entity } from '../entities/types';
import { isEmptyBounds, padBounds } from '../geometry/bounds';
import type { Bounds } from '../geometry/bounds';
import { splineToBeziers } from '../geometry/curves';
import { compose, determinant, scaling } from '../geometry/matrix';
import type { Matrix2D } from '../geometry/matrix';
import { fromAngleDeg } from '../geometry/vec';
import { getLineDashPattern, resolveHatchColors } from '../layers';
import type { HatchFamily, Layer, LineType } from '../layers';
import { contourSegments, rectVertices } from '../primitives/outline';
import { isFullEllipse } from '../primitives/build';
import type { EntityFill, MTextEntity, PrimitiveEntity, TextEntity } from '../primitives/types';
import type { PathVertex } from '../path-builder';
import { effectiveLayerName, MAX_NESTING, resolveLayer } from '../render/walk';
import type { Point2 } from '../settings';
import { attrs, escapeAttr, escapeXml, matrixAttr, num } from './format';

export interface SvgRenderOptions {
  /** Лист документа (id или имя); по умолчанию первый. */
  sheet?: string;
  /**
   * Размер `<svg>`: `'paper'` (по умолчанию) — `width` / `height` в мм бумаги по масштабу чертежа (печать 1:1);
   * `'none'` — без размеров (растягивается по контейнеру); `{ width }` / `{ height }` — в пикселях.
   */
  size?: 'paper' | 'none' | { width: number } | { height: number };
  /** Цвет фона или `null` (прозрачный, по умолчанию). */
  background?: string | null;
  /** Поля листа (`settings.padding`) вокруг чертежа. По умолчанию `true`. */
  padding?: boolean;
  /** Скрытые слои: `'omit'` — не выводить (по умолчанию), `'hide'` — вывести с `display: none` (для вьюпорта). */
  hiddenLayers?: 'omit' | 'hide';
  /** Подключить шрифты (`@import` / `@font-face`) в `<style>`. По умолчанию `true`. */
  embedFonts?: boolean;
  /** Префикс id и классов — чтобы несколько SVG на странице не конфликтовали. По умолчанию `cad`. */
  idPrefix?: string;
  /** Знаков после запятой в координатах; по умолчанию `settings.precision`. */
  precision?: number;
  /** Область чертежа (в координатах модели) вместо автоматического габарита. */
  bounds?: Bounds;
  /** `<title>` документа SVG. */
  title?: string;
  /** Добавлять `data-id` (из `entity.id`) и `data-layer` — для выбора объектов во вьюпорте. По умолчанию `true`. */
  dataAttributes?: boolean;
}

/** Результат с метаданными — для вьюпорта. */
export interface SvgRenderResult {
  readonly svg: string;
  /** `viewBox` в координатах SVG (Y вниз). */
  readonly viewBox: { x: number; y: number; width: number; height: number };
  /** Габарит чертежа в координатах модели (с полями). */
  readonly bounds: Bounds;
  /** Слой → класс видимости (`<prefix>-L<n>`). */
  readonly layerClasses: ReadonlyMap<string, string>;
  readonly idPrefix: string;
}

const PREFIX_RE = /^[A-Za-z][A-Za-z0-9_-]{0,31}$/;

/** Пространство вывода: контекст (масштаб), единицы на мм бумаги для толщин и штрихов, слой вставки. */
interface Space {
  readonly ctx: RenderContext;
  /** Накопленная линейная часть матрицы в координатах SVG `[a, b, c, d]` — чтобы узнать, зеркальна ли вставка. */
  readonly linear: Linear;
  readonly unitsPerMm: number;
  readonly inheritedLayer: string | null;
  readonly depth: number;
  readonly stack: readonly string[];
}

type Linear = readonly [number, number, number, number];

const IDENTITY_LINEAR: Linear = [1, 0, 0, 1];

function mulLinear(m: Linear, n: Linear): Linear {
  return [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3]];
}

const linearOf = (m: Matrix2D): Linear => [m[0], m[1], m[2], m[3]];
const isMirrored = (l: Linear): boolean => l[0] * l[3] - l[1] * l[2] < 0;

const SWAP_H: Record<string, string> = { left: 'right', right: 'left', center: 'center' };
const SWAP_V: Record<string, string> = { top: 'bottom', bottom: 'top', middle: 'middle' };

class SvgWriter {
  readonly precision: number;
  readonly flip: boolean;
  readonly prefix: string;
  private readonly styleRules: string[] = [];
  private readonly styleClasses = new Map<string, string>();
  private readonly layerIndex = new Map<string, number>();
  readonly layerClasses = new Map<string, string>();
  private readonly defs: string[] = [];
  private readonly defIds = new Map<string, string>();
  private readonly fontsUsed = new Set<string>();
  private readonly textClasses = new Map<string, string>();
  private counter = 0;

  constructor(
    readonly root: RenderContext,
    readonly options: SvgRenderOptions,
  ) {
    this.precision = options.precision ?? root.drawing.settings.precision;
    this.flip = root.drawing.settings.coordinateSystem === 'cartesian';
    this.prefix = options.idPrefix ?? 'cad';
    if (!PREFIX_RE.test(this.prefix)) throw new CadBlockError('idPrefix', `must match ${String(PREFIX_RE)}`);
    root.layers.list().forEach((l, i) => this.layerIndex.set(l.name.toLowerCase(), i));
  }

  n(v: number): string {
    return num(v, this.precision);
  }

  /** Точка чертежа → SVG (Y вниз). */
  p(pt: Point2): string {
    return `${this.n(pt[0])} ${this.n(this.flip ? -pt[1] : pt[1])}`;
  }

  y(v: number): number {
    return this.flip ? -v : v;
  }

  /** Матрица чертежа → матрица SVG: F·M·F. */
  svgMatrix(m: Matrix2D): Matrix2D {
    if (!this.flip) return m;
    const f = scaling(1, -1);
    return compose(f, m, f);
  }

  nextId(kind: string): string {
    this.counter += 1;
    return `${this.prefix}-${kind}${this.counter}`;
  }

  private layerIdx(layer: Layer): number {
    const key = layer.name.toLowerCase();
    let i = this.layerIndex.get(key);
    if (i === undefined) {
      i = this.layerIndex.size;
      this.layerIndex.set(key, i);
    }
    return i;
  }

  /** Класс видимости слоя. */
  visibilityClass(layer: Layer): string {
    const cls = `${this.prefix}-L${this.layerIdx(layer)}`;
    if (!this.layerClasses.has(layer.name)) {
      this.layerClasses.set(layer.name, cls);
      if (!layer.visible) this.styleRules.push(`.${cls}{display:none}`);
    }
    return cls;
  }

  dash(lineType: LineType, unitsPerMm: number): string | null {
    const pattern = getLineDashPattern(lineType);
    return pattern.length === 0 ? null : pattern.map((v) => this.n(v * unitsPerMm)).join(' ');
  }

  /** Класс оформления «слой × пространство». */
  styleClass(layer: Layer, space: Space): string {
    const key = `${layer.name.toLowerCase()}|${space.unitsPerMm.toPrecision(9)}`;
    let cls = this.styleClasses.get(key);
    if (cls) return cls;
    cls = `${this.prefix}-s${this.styleClasses.size}`;
    this.styleClasses.set(key, cls);
    const dash = this.dash(layer.lineType, space.unitsPerMm);
    const rules = [
      `stroke:${layer.color}`,
      `stroke-width:${this.n(Math.max(layer.lineWeight, 0.05) * space.unitsPerMm)}`,
      'fill:none',
      'stroke-linecap:round',
      'stroke-linejoin:round',
      `stroke-dasharray:${dash ?? 'none'}`,
      `opacity:${layer.opacity}`,
    ].filter(Boolean);
    this.styleRules.push(`.${cls}{${rules.join(';')}}`, `text.${cls}{fill:${layer.color};stroke:none}`);
    return cls;
  }

  textClass(fontId: string): string {
    let cls = this.textClasses.get(fontId.toLowerCase());
    if (cls) return cls;
    cls = `${this.prefix}-f${this.textClasses.size}`;
    this.textClasses.set(fontId.toLowerCase(), cls);
    this.fontsUsed.add(fontId);
    this.styleRules.push(`.${cls}{font-family:${this.root.fonts.getCssFontFamily(fontId)};white-space:pre}`);
    return cls;
  }

  /** Определение в `<defs>` с дедупликацией по ключу. */
  def(key: string, kind: string, build: (id: string) => string): string {
    const existing = this.defIds.get(key);
    if (existing) return existing;
    const id = this.nextId(kind);
    this.defIds.set(key, id);
    this.defs.push(build(id));
    return id;
  }

  /** `<marker>` окончания размерной линии. */
  marker(geometry: TerminatorGeometry, color: string, strokeWidth: number, arrowAngle: number): string | null {
    if (geometry.shapes.length === 0) return null;
    const key = `mk|${geometry.type}|${geometry.extent.toPrecision(9)}|${arrowAngle}|${color}|${strokeWidth.toPrecision(6)}`;
    return this.def(key, 'mk', (id) => {
      // Локальная система окончания — Y вверх; в маркере (Y вниз) отражаем, чтобы засечка сохранила наклон «/».
      const q = (pt: Point2): string => `${this.n(pt[0])} ${this.n(-pt[1])}`;
      const body = geometry.shapes
        .map((s) => {
          switch (s.kind) {
            case 'polygon':
              return `<path d="M${s.points.map(q).join(' L')} Z" fill="${color}" stroke="${color}" stroke-width="${this.n(strokeWidth)}" stroke-linejoin="miter"/>`;
            case 'polyline':
              return `<path d="M${s.points.map(q).join(' L')}" fill="none" stroke="${color}" stroke-width="${this.n(strokeWidth)}"/>`;
            case 'line':
              return `<path d="M${q(s.from)} L${q(s.to)}" fill="none" stroke="${color}" stroke-width="${this.n(strokeWidth * 1.5)}" stroke-linecap="butt"/>`;
            case 'circle':
              return `<circle cx="${this.n(s.center[0])}" cy="${this.n(-s.center[1])}" r="${this.n(s.radius)}" fill="${s.fill ? color : 'none'}" stroke="${color}" stroke-width="${this.n(strokeWidth)}"/>`;
          }
        })
        .join('');
      return `<marker id="${id}" markerUnits="userSpaceOnUse" orient="auto-start-reverse" overflow="visible" refX="0" refY="0" markerWidth="1" markerHeight="1">${body}</marker>`;
    });
  }

  /** `<pattern>` одного семейства штриховки. */
  hatchPattern(family: HatchFamily, color: string, unitsPerMm: number): string {
    const key = `hp|${JSON.stringify(family)}|${color}|${unitsPerMm.toPrecision(9)}`;
    return this.def(key, 'hp', (id) => {
      const spacing = family.spacing * unitsPerMm;
      const dashTotal = family.dash.reduce((a, b) => a + b, 0) * unitsPerMm;
      const width = dashTotal > 0 ? dashTotal : spacing;
      const lw = Math.max(family.lineWidth, 0.05) * unitsPerMm;
      const skew = family.offset !== 0 ? ` skewX(${num((Math.atan2(family.offset, family.spacing) * 180) / Math.PI, 6)})` : '';
      const dash = family.dash.length > 0 ? ` stroke-dasharray="${family.dash.map((v) => this.n(v * unitsPerMm)).join(' ')}"` : '';
      return (
        `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${this.n(width)}" height="${this.n(spacing)}" ` +
        `patternTransform="rotate(${num(-family.angle, 6)})${skew}">` +
        `<path d="M0 ${this.n(spacing / 2)} H${this.n(width)}" stroke="${color}" stroke-width="${this.n(lw)}"${dash}/></pattern>`
      );
    });
  }

  addDef(markup: string): void {
    this.defs.push(markup);
  }

  buildStyle(): string {
    const fonts = this.options.embedFonts === false || this.fontsUsed.size === 0 ? '' : this.root.fonts.buildFontFaceCss([...this.fontsUsed]);
    return `<style>${fonts}${fonts ? '\n' : ''}${this.styleRules.join('\n')}</style>`;
  }

  buildDefs(): string {
    return this.defs.length === 0 ? '' : `<defs>${this.defs.join('')}</defs>`;
  }
}

// ---------------------------------------------------------------------------------------------------------------------

function contourPath(w: SvgWriter, vertices: readonly PathVertex[], closed: boolean): string {
  const segs = contourSegments(vertices, closed);
  if (segs.length === 0) return '';
  let d = `M${w.p(segs[0]!.from)}`;
  for (const s of segs) {
    if (s.type === 'line') {
      d += ` L${w.p(s.to)}`;
    } else {
      const large = s.sweepDeg > 180 ? 1 : 0;
      const ccw = w.flip ? !s.counterclockwise : s.counterclockwise;
      d += ` A${w.n(s.radius)} ${w.n(s.radius)} 0 ${large} ${ccw ? 1 : 0} ${w.p(s.to)}`;
    }
  }
  return closed ? `${d} Z` : d;
}

function arcPath(w: SvgWriter, center: Point2, radius: number, a1: number, a2: number, ccw: boolean): string {
  const s = fromAngleDeg(a1);
  const e = fromAngleDeg(a2);
  const from: Point2 = [center[0] + s[0] * radius, center[1] + s[1] * radius];
  const to: Point2 = [center[0] + e[0] * radius, center[1] + e[1] * radius];
  let sweep = ccw ? a2 - a1 : a1 - a2;
  sweep = ((sweep % 360) + 360) % 360 || 360;
  const svgCcw = w.flip ? !ccw : ccw;
  if (sweep >= 360 - 1e-9) {
    const mid: Point2 = [center[0] - s[0] * radius, center[1] - s[1] * radius];
    return `M${w.p(from)} A${w.n(radius)} ${w.n(radius)} 0 0 ${svgCcw ? 1 : 0} ${w.p(mid)} A${w.n(radius)} ${w.n(radius)} 0 0 ${svgCcw ? 1 : 0} ${w.p(from)}`;
  }
  return `M${w.p(from)} A${w.n(radius)} ${w.n(radius)} 0 ${sweep > 180 ? 1 : 0} ${svgCcw ? 1 : 0} ${w.p(to)}`;
}

/** `d` для замкнутой фигуры с вырезами (или `null`, если фигура не замкнутая). */
function closedShapePath(w: SvgWriter, e: PrimitiveEntity): string | null {
  switch (e.type) {
    case 'circle':
      return arcPath(w, e.center, e.radius, 0, 360, true);
    case 'rect':
      return contourPath(w, rectVertices(e), true);
    case 'polyline':
      if (!e.closed) return null;
      return [contourPath(w, e.vertices, true), ...e.holes.map((h) => contourPath(w, h, true))].join(' ');
    case 'ellipse': {
      if (!isFullEllipse(e)) return null;
      return ellipsePath(w, e.center, e.radiusX, e.radiusY, e.rotationDeg, 0, 360);
    }
    default:
      return null;
  }
}

function ellipsePath(w: SvgWriter, c: Point2, rx: number, ry: number, rot: number, t1: number, t2: number): string {
  const [cr, sr] = fromAngleDeg(rot);
  const at = (t: number): Point2 => {
    const [ct, st] = fromAngleDeg(t);
    return [c[0] + cr * rx * ct - sr * ry * st, c[1] + sr * rx * ct + cr * ry * st];
  };
  const svgRot = w.flip ? -rot : rot;
  const sweepFlag = w.flip ? 0 : 1;
  const sweep = t2 - t1;
  if (sweep >= 360 - 1e-9) {
    return `M${w.p(at(t1))} A${w.n(rx)} ${w.n(ry)} ${num(svgRot, 6)} 0 ${sweepFlag} ${w.p(at(t1 + 180))} A${w.n(rx)} ${w.n(ry)} ${num(svgRot, 6)} 0 ${sweepFlag} ${w.p(at(t1))} Z`;
  }
  return `M${w.p(at(t1))} A${w.n(rx)} ${w.n(ry)} ${num(svgRot, 6)} ${sweep > 180 ? 1 : 0} ${sweepFlag} ${w.p(at(t2))}`;
}

function curvesPath(w: SvgWriter, e: PrimitiveEntity): string {
  switch (e.type) {
    case 'line':
      return `M${w.p(e.from)} L${w.p(e.to)}`;
    case 'arc':
      return arcPath(w, e.center, e.radius, e.startAngleDeg, e.endAngleDeg, e.counterclockwise);
    case 'ellipse':
      return ellipsePath(w, e.center, e.radiusX, e.radiusY, e.rotationDeg, e.startAngleDeg, e.endAngleDeg);
    case 'polyline':
      return [contourPath(w, e.vertices, e.closed), ...e.holes.map((h) => contourPath(w, h, true))].join(' ');
    case 'spline': {
      const parts = splineToBeziers(e.degree, e.controlPoints, e.knots);
      if (parts.length === 0) return '';
      let d = `M${w.p(parts[0]![0]!)}`;
      for (const b of parts) {
        if (b.length === 2) d += ` L${w.p(b[1]!)}`;
        else if (b.length === 3) d += ` Q${w.p(b[1]!)} ${w.p(b[2]!)}`;
        else d += ` C${w.p(b[1]!)} ${w.p(b[2]!)} ${w.p(b[3]!)}`;
      }
      return d;
    }
    case 'bezier': {
      let d = `M${w.p(e.points[0]!)}`;
      for (let i = 1; i + 2 < e.points.length; i += 3) d += ` C${w.p(e.points[i]!)} ${w.p(e.points[i + 1]!)} ${w.p(e.points[i + 2]!)}`;
      return d;
    }
    default:
      return closedShapePath(w, e) ?? '';
  }
}

/**
 * Атрибуты объекта. Переопределения оформления идут в `style` (а не в атрибуты `stroke` / `fill`): CSS-класс слоя
 * сильнее атрибутов представления, но слабее встроенного стиля.
 */
function commonAttrs(
  w: SvgWriter,
  e: Entity,
  layer: Layer,
  space: Space,
  cls: string,
  extraStyle: Record<string, string | undefined> = {},
): Record<string, string | undefined> {
  const st: Record<string, string | undefined> = {};
  if (e.color !== null) st['stroke'] = e.color;
  if (e.lineWeight !== null) st['stroke-width'] = w.n(Math.max(e.lineWeight, 0.05) * space.unitsPerMm);
  if (e.lineType !== null) st['stroke-dasharray'] = w.dash(e.lineType, space.unitsPerMm) ?? 'none';
  Object.assign(st, extraStyle);
  const style = Object.entries(st)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
  const a: Record<string, string | undefined> = { class: cls, style: style || undefined };
  if (w.options.dataAttributes !== false) {
    if (e.id !== null) a['data-id'] = e.id;
    a['data-layer'] = layer.name;
  }
  return a;
}

function fillMarkup(w: SvgWriter, e: PrimitiveEntity, fill: EntityFill | null, layer: Layer, space: Space, d: string): string {
  if (fill === null) return '';
  const color = e.color ?? layer.color;
  if (fill === 'solid') return `<path d="${d}" fill="${color}" stroke="none" fill-rule="evenodd"/>`;
  if (fill !== 'hatch') return `<path d="${d}" fill="${fill}" stroke="none" fill-rule="evenodd"/>`;
  if (!layer.hatch) return '';
  const hatch = resolveHatchColors(layer.hatch, color);
  let out = hatch.background ? `<path d="${d}" fill="${hatch.background}" stroke="none" fill-rule="evenodd"/>` : '';
  for (const f of hatch.families) {
    const id = w.hatchPattern(f, f.color ?? color, space.unitsPerMm);
    out += `<path d="${d}" fill="url(#${id})" stroke="none" fill-rule="evenodd"/>`;
  }
  return out;
}

/**
 * Текст. Внутри зеркальной вставки текст остаётся читаемым (как `MIRRTEXT = 0` в AutoCAD): буквы отражаются обратно
 * относительно точки вставки, а выравнивание меняется на противоположное — текст занимает ту же (отражённую) область.
 */
function textMarkup(w: SvgWriter, source: TextEntity | MTextEntity, layer: Layer, space: Space, cls: string): string {
  let e = source;
  let flip = '';
  if (isMirrored(space.linear)) {
    const rad = (-e.rotationDeg * Math.PI) / 180;
    const c = mulLinear(space.linear, [Math.cos(rad), Math.sin(rad), -Math.sin(rad), Math.cos(rad)]);
    const [v, h] = e.anchor.split('-') as [string, string];
    // Вариант «отразить по X» оставляет строку слева направо, если её ось после всех матриц смотрит вправо.
    if (-c[0] >= -1e-9) {
      flip = ' scale(-1 1)';
      e = { ...e, anchor: `${v}-${SWAP_H[h] ?? h}` as TextEntity['anchor'] };
    } else {
      flip = ' scale(1 -1)';
      e = { ...e, anchor: `${SWAP_V[v] ?? v}-${h}` as TextEntity['anchor'] };
    }
  }
  const r = resolveText(e, space.ctx);
  const font = space.ctx.fonts.require(r.style.fontFamily);
  const size = (r.layout.fontHeight * font.metrics.unitsPerEm) / font.metrics.capHeight;
  const h = e.anchor.split('-')[1];
  const anchor = h === 'left' ? 'start' : h === 'center' ? 'middle' : 'end';
  const wf = r.style.widthFactor;
  const transform =
    `translate(${w.p(e.position)})` +
    (e.rotationDeg !== 0 ? ` rotate(${num(-e.rotationDeg, 6)})` : '') +
    flip +
    (r.style.obliqueAngle !== 0 ? ` skewX(${num(-r.style.obliqueAngle, 6)})` : '') +
    (wf !== 1 ? ` scale(${num(wf, 6)} 1)` : '');
  const plain = { ...e, color: null, lineWeight: null, lineType: null } as Entity;
  const a = commonAttrs(w, plain, layer, space, `${cls} ${w.textClass(r.style.fontFamily)}`, e.color !== null ? { fill: e.color } : {});
  const ls = r.style.letterSpacing !== 0 ? w.n(r.style.letterSpacing * r.layout.fontHeight) : undefined;
  const lines = r.layout.lines;
  const body =
    lines.length === 1
      ? escapeXml(lines[0]!.text)
      : lines.map((l) => `<tspan x="0" y="${w.n(-l.baselineY)}">${escapeXml(l.text)}</tspan>`).join('');
  const y = lines.length === 1 ? w.n(-lines[0]!.baselineY) : undefined;
  return `<text${attrs({ ...a, x: '0', y, transform, 'font-size': w.n(size), 'text-anchor': anchor, 'letter-spacing': ls })}>${body}</text>`;
}

function trimCurve(c: DimGeometryCurve, trim: number): DimGeometryCurve {
  if (trim <= 0 || c.kind !== 'line') return c;
  const dx = c.to[0] - c.from[0];
  const dy = c.to[1] - c.from[1];
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const s = c.startTerminator ? Math.min(trim, len / 2) : 0;
  const t = c.endTerminator ? Math.min(trim, len / 2) : 0;
  return { ...c, from: [c.from[0] + ux * s, c.from[1] + uy * s], to: [c.to[0] - ux * t, c.to[1] - uy * t] };
}

function dimensionMarkup(w: SvgWriter, e: DimensionEntity, layer: Layer, space: Space, cls: string): string {
  const g = buildDimensionGeometry(e, space.ctx);
  const style = g.style;
  const lineColor = e.color ?? style.lineColor ?? layer.color;
  const textColor = e.color ?? style.textColor ?? layer.color;
  const lw = (e.lineWeight ?? style.lineWeight ?? layer.lineWeight) * space.unitsPerMm;
  const markerId = w.marker(g.metrics.terminator, lineColor, Math.max(lw, 0.01), style.arrowAngle);
  const over: Record<string, string | undefined> = {};
  if (e.color !== null || style.lineColor !== null) over['stroke'] = lineColor;
  if (e.lineWeight !== null || style.lineWeight !== null) over['stroke-width'] = w.n(Math.max(lw, 0.01));
  const a = commonAttrs(w, { ...e, color: null, lineWeight: null }, layer, space, cls, over);
  let out = `<g${attrs(a)}>`;
  for (const raw of g.curves) {
    const c = trimCurve(raw, g.metrics.terminator.lineTrim);
    const d = c.kind === 'line' ? `M${w.p(c.from)} L${w.p(c.to)}` : arcPath(w, c.center, c.radius, c.startAngleDeg, c.endAngleDeg, c.counterclockwise);
    const ms = markerId && c.startTerminator ? ` marker-start="url(#${markerId})"` : '';
    const me = markerId && c.endTerminator ? ` marker-end="url(#${markerId})"` : '';
    out += `<path d="${d}"${ms}${me}/>`;
  }
  for (const t of g.texts) {
    const textEntity: TextEntity = Object.freeze({
      type: 'text',
      id: null,
      layer: e.layer,
      color: textColor === layer.color ? null : textColor,
      lineWeight: null,
      lineType: null,
      position: t.position,
      value: t.text,
      style: t.textStyle,
      height: t.paperHeight,
      rotationDeg: t.rotationDeg,
      anchor: t.anchor,
    });
    out += textMarkup(w, textEntity.value.includes('\n') ? { ...textEntity, type: 'mtext' } : textEntity, layer, space, cls);
  }
  return `${out}</g>`;
}

function primitiveMarkup(w: SvgWriter, e: PrimitiveEntity, layer: Layer, space: Space, cls: string): string {
  if (e.type === 'text' || e.type === 'mtext') return textMarkup(w, e, layer, space, cls);
  if (e.type === 'point') {
    const r = 0.5 * space.unitsPerMm;
    const [x, y] = [e.position[0], w.y(e.position[1])];
    const a = commonAttrs(w, { ...e, color: null }, layer, space, cls, { fill: e.color ?? layer.color, stroke: 'none' });
    return `<circle${attrs({ ...a, cx: w.n(x), cy: w.n(y), r: w.n(r) })}/>`;
  }
  let out = '';
  if ('fill' in e && e.fill !== null) {
    const d = closedShapePath(w, e);
    if (d) out += fillMarkup(w, e, e.fill, layer, space, d);
  }
  const a = commonAttrs(w, e, layer, space, cls);
  if (e.type === 'rect' && e.cornerRadius === 0) {
    const y = w.flip ? -(e.y + e.height) : e.y;
    out += `<rect${attrs({ ...a, x: w.n(e.x), y: w.n(y), width: w.n(e.width), height: w.n(e.height) })}/>`;
  } else if (e.type === 'circle') {
    out += `<circle${attrs({ ...a, cx: w.n(e.center[0]), cy: w.n(w.y(e.center[1])), r: w.n(e.radius) })}/>`;
  } else {
    const d = curvesPath(w, e);
    if (d) out += `<path${attrs({ ...a, d, 'fill-rule': e.type === 'polyline' && e.holes.length > 0 ? 'evenodd' : undefined })}/>`;
  }
  return out;
}

function renderEntities(w: SvgWriter, list: readonly Entity[], space: Space): string {
  let out = '';
  for (const e of list) {
    const layerName = effectiveLayerName(e.layer, space.inheritedLayer);
    const layer = resolveLayer(space.ctx, layerName);
    if (!layer.visible && w.options.hiddenLayers !== 'hide') continue;
    const vis = w.visibilityClass(layer);
    const cls = `${vis} ${w.styleClass(layer, space)}`;
    if (e.type === 'insert') {
      out += insertMarkup(w, e, layer, layerName, space, cls);
    } else if (e.type === 'viewport') {
      out += viewportMarkup(w, e, layer, space, cls);
    } else if (isDimension(e)) {
      out += dimensionMarkup(w, e, layer, space, cls);
    } else {
      out += primitiveMarkup(w, e as PrimitiveEntity, layer, space, cls);
    }
  }
  return out;
}

function insertMarkup(w: SvgWriter, e: BlockInsertEntity, layer: Layer, layerName: string, space: Space, cls: string): string {
  const block: CadBlock | undefined = space.ctx.blocks.get(e.block);
  if (!block) throw new CadBlockError(e.block, 'block is not defined');
  const key = block.name.toLowerCase();
  if (space.stack.includes(key) || space.depth >= MAX_NESTING) throw new CadBlockError(block.name, 'circular or too deep block nesting');
  const det = Math.abs(e.scaleX * e.scaleY);
  const m = w.svgMatrix(insertMatrix(e, block));
  const inner: Space = {
    ctx: space.ctx,
    linear: mulLinear(space.linear, linearOf(m)),
    unitsPerMm: space.unitsPerMm / Math.sqrt(det),
    inheritedLayer: layerName,
    depth: space.depth + 1,
    stack: [...space.stack, key],
  };
  // Зеркальные вставки получают свой вариант символа: тексты в нём «разворачиваются» под конкретную матрицу.
  const mirrorKey = isMirrored(inner.linear) ? `|m${inner.linear.map((v) => v.toPrecision(6)).join(',')}` : '';
  const symKey = `sym|${key}|${inner.unitsPerMm.toPrecision(9)}|${layerName.toLowerCase()}|${space.ctx.drawing.annotationFactor}${mirrorKey}`;
  const id = w.def(symKey, 'b', (sid) => `<symbol id="${sid}" overflow="visible" data-block="${escapeAttr(block.name)}">${renderEntities(w, block.entities, inner)}</symbol>`);
  const a: Record<string, string | undefined> = { class: cls, href: `#${id}`, transform: matrixAttr(m, w.precision) };
  if (w.options.dataAttributes !== false) {
    if (e.id !== null) a['data-id'] = e.id;
    a['data-layer'] = layer.name;
  }
  return `<use${attrs(a)}/>`;
}

function viewportMarkup(w: SvgWriter, vp: ViewportEntity, layer: Layer, space: Space, cls: string): string {
  if (space.depth >= MAX_NESTING) throw new CadBlockError('viewport', 'too deep nesting');
  const childCtx = viewportContext(space.ctx, vp);
  const m = viewportMatrix(vp, space.ctx.drawing);
  const scale = Math.sqrt(Math.abs(determinant(m)));
  const inner: Space = {
    ctx: childCtx,
    linear: mulLinear(space.linear, linearOf(w.svgMatrix(m))),
    unitsPerMm: space.unitsPerMm / scale,
    inheritedLayer: space.inheritedLayer,
    depth: space.depth + 1,
    stack: space.stack,
  };
  let body = renderEntities(w, vp.entities, inner);
  if (vp.clip) {
    const clipId = w.nextId('clip');
    const c = vp.clip;
    const y = w.flip ? -c.maxY : c.minY;
    w.addDef(`<clipPath id="${clipId}"><rect x="${w.n(c.minX)}" y="${w.n(y)}" width="${w.n(c.maxX - c.minX)}" height="${w.n(c.maxY - c.minY)}"/></clipPath>`);
    body = `<g clip-path="url(#${clipId})">${body}</g>`;
    if (vp.frame) {
      const frameCls = `${w.visibilityClass(layer)} ${w.styleClass(layer, inner)}`;
      body += `<rect class="${frameCls}" x="${w.n(c.minX)}" y="${w.n(y)}" width="${w.n(c.maxX - c.minX)}" height="${w.n(c.maxY - c.minY)}"/>`;
    }
  }
  const a: Record<string, string | undefined> = { transform: matrixAttr(w.svgMatrix(m), w.precision) };
  if (w.options.dataAttributes !== false && vp.id !== null) a['data-id'] = vp.id;
  let out = `<g${attrs(a)}>${body}</g>`;
  const title = viewportTitle(vp, space.ctx, viewportContentBounds(vp, space.ctx));
  if (title) out += primitiveMarkup(w, title, layer, space, cls);
  return out;
}

/** SVG из набора объектов. */
export function renderEntitiesToSvg(entities: readonly Entity[], ctx: RenderContext, options: SvgRenderOptions = {}): SvgRenderResult {
  const w = new SvgWriter(ctx, options);
  const rootSpace: Space = { ctx, linear: IDENTITY_LINEAR, unitsPerMm: ctx.drawing.paperMmToModel(1), inheritedLayer: null, depth: 0, stack: [] };
  const body = renderEntities(w, entities, rootSpace);

  let bounds = options.bounds ?? entitiesBounds(entities, ctx, { visibleOnly: options.hiddenLayers !== 'hide' });
  if (isEmptyBounds(bounds)) bounds = { minX: 0, minY: 0, maxX: 1, maxY: 1 };
  if (options.padding !== false) bounds = padBounds(bounds, ctx.drawing.paddingInModelUnits());
  const width = Math.max(bounds.maxX - bounds.minX, 1e-9);
  const height = Math.max(bounds.maxY - bounds.minY, 1e-9);
  const viewBox = { x: bounds.minX, y: w.flip ? -bounds.maxY : bounds.minY, width, height };

  const size = options.size ?? 'paper';
  let sizeAttrs = '';
  if (size === 'paper') {
    sizeAttrs = ` width="${num(ctx.drawing.modelToPaperMm(width), 3)}mm" height="${num(ctx.drawing.modelToPaperMm(height), 3)}mm"`;
  } else if (size !== 'none') {
    const px = 'width' in size ? { w: size.width, h: (size.width * height) / width } : { w: (size.height * width) / height, h: size.height };
    sizeAttrs = ` width="${num(px.w, 2)}" height="${num(px.h, 2)}"`;
  }
  const vb = `${w.n(viewBox.x)} ${w.n(viewBox.y)} ${w.n(viewBox.width)} ${w.n(viewBox.height)}`;
  const bg = options.background ? `<rect class="${w.prefix}-paper cad-paper" x="${w.n(viewBox.x)}" y="${w.n(viewBox.y)}" width="${w.n(viewBox.width)}" height="${w.n(viewBox.height)}" fill="${escapeAttr(options.background)}"/>` : '';
  const title = options.title ? `<title>${escapeXml(options.title)}</title>` : '';
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${vb}"${sizeAttrs} class="${w.prefix}">` +
    `${title}${w.buildStyle()}${w.buildDefs()}${bg}<g class="${w.prefix}-content">${body}</g></svg>`;
  return { svg, viewBox, bounds, layerClasses: w.layerClasses, idPrefix: w.prefix };
}

/** SVG листа документа (по умолчанию — первого). */
export function renderSvg(doc: CadDocument, options: SvgRenderOptions = {}): string {
  return renderSvgResult(doc, options).svg;
}

export function renderSvgResult(doc: CadDocument, options: SvgRenderOptions = {}): SvgRenderResult {
  const sheet = doc.requireSheet(options.sheet);
  return renderEntitiesToSvg(sheet.entities, doc.context(), options);
}
