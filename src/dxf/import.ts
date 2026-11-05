import { defineBlock } from '../blocks/block';
import type { CadBlock } from '../blocks/types';
import { primitiveBounds } from '../bounds/bounds';
import { createRenderContext } from '../document/context';
import { CadError } from '../errors';
import { BoundsBuilder, boundsCenter, isEmptyBounds } from '../geometry/bounds';
import { clampedUniformKnots, evalSpline } from '../geometry/curves';
import { compose, rotation, scaling, translation } from '../geometry/matrix';
import type { Matrix2D } from '../geometry/matrix';
import { nestContours } from '../geometry/polygon';
import { assertLayerName, normalizeHexColor } from '../layers';
import type { LayerDefinition } from '../layers';
import { buildArc, buildCircle, buildEllipse, buildLine, buildMText, buildPoint, buildPolyline, buildSpline, buildText } from '../primitives/build';
import { fitBezier } from '../primitives/curves';
import { transformPrimitive, flattenContour } from '../primitives/transform';
import type { EntityFill, EntityPropsInit, PolylineEntity, PrimitiveEntity } from '../primitives/types';
import type { PathVertex } from '../path-builder';
import { getUnitDefinition, parseScale, scaleFactor } from '../settings';
import type { CoordinateSystem, LengthUnit, Point2, ScaleInput } from '../settings';
import type { TextAnchor } from '../typography';
import { aciToHex, trueColorToHex } from './aci';
import { decodeDxfString, plainMText, plainText } from './encoding';

/** Ошибка разбора DXF. */
export class CadDxfError extends CadError {
  constructor(field: string, message: string) {
    super(field, message);
    this.name = 'CadDxfError';
  }
}

export interface DxfImportOptions {
  /** Имя блока. По умолчанию `Imported`. */
  name?: string;
  /** Единицы результата (координаты пересчитываются по `$INSUNITS` файла). По умолчанию `mm`. */
  units?: LengthUnit;
  /** Положить все объекты на этот слой; `null` (по умолчанию) — сохранить слои DXF. */
  layer?: string | null;
  /** Цвета объектов: `'bylayer'` (по умолчанию) — сбросить на «по слою», `'keep'` — сохранить явные цвета DXF. */
  colors?: 'bylayer' | 'keep';
  /** Собрать вложенные замкнутые контуры в полилинии с вырезами (`holes`). По умолчанию `true`. */
  detectHoles?: boolean;
  /** Заливка внешних замкнутых контуров (например, `'hatch'` для сечений профилей). По умолчанию без заливки. */
  fill?: EntityFill | null;
  /** Базовая точка блока: начало координат DXF (по умолчанию), угол габарита, центр габарита или точка. */
  basePoint?: 'origin' | 'min' | 'center' | Point2;
  /** Система координат документа, куда пойдёт блок: для `screen` ось Y отражается. По умолчанию `cartesian`. */
  coordinateSystem?: CoordinateSystem;
  /** Масштаб аннотаций документа: высота текста DXF (в единицах модели) → мм на бумаге. По умолчанию `1:1`. */
  annotationScale?: ScaleInput;
  /** Откуда брать объекты: `'entities'` (пространство модели, по умолчанию) или имя блока из секции BLOCKS. */
  source?: string;
  /** Импортировать тексты (TEXT, MTEXT). По умолчанию `true`. */
  text?: boolean;
}

export interface DxfImportResult {
  readonly block: CadBlock;
  /** Слои файла (имя, цвет, толщина, видимость) — их можно создать в `LayerManager`. */
  readonly layers: LayerDefinition[];
  /** Единицы файла по `$INSUNITS` (`null` — не заданы). */
  readonly fileUnits: LengthUnit | 'feet' | 'dm' | null;
  /** Пропущенные и упрощённые объекты. */
  readonly warnings: string[];
}

type Tag = readonly [number, string];

interface RawEntity {
  readonly type: string;
  readonly tags: Tag[];
  /** VERTEX для POLYLINE. */
  readonly vertices?: RawEntity[];
}

// ---------------------------------------------------------------------------------------------------------------------

/** `TextDecoder` есть в браузерах и Node ≥ 11; ядро собирается без DOM-типов, поэтому берём его из `globalThis`. */
type Decoder = { decode(bytes: Uint8Array): string };
const TextDecoderCtor = (globalThis as unknown as { TextDecoder: new (label?: string) => Decoder }).TextDecoder;

function toText(input: string | Uint8Array | ArrayBuffer): string {
  if (typeof input === 'string') return input;
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  // Версия и кодовая страница читаются из заголовка (он ASCII).
  const head = new TextDecoderCtor('latin1').decode(bytes.subarray(0, Math.min(bytes.length, 64 * 1024)));
  const ver = /\$ACADVER\s*\r?\n\s*1\s*\r?\n\s*(AC\d+)/.exec(head)?.[1] ?? 'AC1009';
  if (ver >= 'AC1021') return new TextDecoderCtor('utf-8').decode(bytes);
  const cp = /\$DWGCODEPAGE\s*\r?\n\s*3\s*\r?\n\s*(\S+)/.exec(head)?.[1]?.toUpperCase() ?? 'ANSI_1252';
  const m = /ANSI_(\d+)/.exec(cp);
  const label = m ? `windows-${m[1]}` : 'windows-1252';
  try {
    return new TextDecoderCtor(label).decode(bytes);
  } catch {
    return new TextDecoderCtor('latin1').decode(bytes);
  }
}

function tokenize(text: string): Tag[] {
  const lines = text.split(/\r\n|\r|\n/);
  const tags: Tag[] = [];
  for (let i = 0; i + 1 < lines.length; i += 2) {
    const codeLine = (lines[i] as string).trim();
    if (codeLine === '') {
      i -= 1;
      continue;
    }
    const code = Number(codeLine);
    if (!Number.isInteger(code)) throw new CadDxfError('dxf', `invalid group code "${codeLine}" at line ${i + 1}`);
    tags.push([code, (lines[i + 1] as string).replace(/\s+$/, '')]);
  }
  return tags;
}

/** Секции DXF: имя → теги между `SECTION` и `ENDSEC`. */
function sections(tags: Tag[]): Map<string, Tag[]> {
  const out = new Map<string, Tag[]>();
  for (let i = 0; i < tags.length; i++) {
    const t = tags[i] as Tag;
    if (t[0] === 0 && t[1] === 'SECTION') {
      const name = tags[i + 1]?.[1] ?? '';
      const start = i + 2;
      let j = start;
      while (j < tags.length && !((tags[j] as Tag)[0] === 0 && (tags[j] as Tag)[1] === 'ENDSEC')) j++;
      out.set(name, tags.slice(start, j));
      i = j;
    }
  }
  return out;
}

/** Делит теги на объекты по коду 0; VERTEX / SEQEND присоединяются к POLYLINE. */
function splitEntities(tags: Tag[]): RawEntity[] {
  const out: RawEntity[] = [];
  let cur: RawEntity | null = null;
  let poly: { type: string; tags: Tag[]; vertices: RawEntity[] } | null = null;
  for (const t of tags) {
    if (t[0] === 0) {
      if (cur) {
        if (poly && cur.type === 'VERTEX') poly.vertices.push(cur);
        else if (cur.type !== 'SEQEND') out.push(cur);
      }
      if (t[1] === 'SEQEND') poly = null;
      cur = { type: t[1], tags: [] };
      if (t[1] === 'POLYLINE') {
        poly = { type: 'POLYLINE', tags: cur.tags, vertices: [] };
        cur = poly;
      }
      continue;
    }
    cur?.tags.push(t);
  }
  if (cur && cur.type !== 'SEQEND' && !(poly && cur.type === 'VERTEX')) out.push(cur);
  return out;
}

const num = (e: RawEntity, code: number, fallback = 0): number => {
  const t = e.tags.find((x) => x[0] === code);
  const v = t ? Number(t[1]) : fallback;
  return Number.isFinite(v) ? v : fallback;
};
const str = (e: RawEntity, code: number): string | undefined => e.tags.find((x) => x[0] === code)?.[1];
const all = (e: RawEntity, code: number): number[] => e.tags.filter((x) => x[0] === code).map((x) => Number(x[1]));

function pointsOf(e: RawEntity, xc: number): Point2[] {
  const out: Point2[] = [];
  let x: number | null = null;
  for (const [c, v] of e.tags) {
    if (c === xc) x = Number(v);
    else if (c === xc + 10 && x !== null) {
      out.push([x, Number(v)]);
      x = null;
    }
  }
  return out;
}

const INSUNITS: Record<number, { unit: LengthUnit | 'feet' | 'dm'; mm: number }> = {
  1: { unit: 'inch', mm: 25.4 },
  2: { unit: 'feet', mm: 304.8 },
  4: { unit: 'mm', mm: 1 },
  5: { unit: 'cm', mm: 10 },
  6: { unit: 'm', mm: 1000 },
  14: { unit: 'dm', mm: 100 },
};

// ---------------------------------------------------------------------------------------------------------------------

interface ImportState {
  readonly opts: Required<Pick<DxfImportOptions, 'colors' | 'text'>> & DxfImportOptions;
  readonly blocks: Map<string, RawEntity[]>;
  readonly warnings: string[];
  readonly decode: (s: string) => string;
  readonly textScale: number;
  readonly unitsToMm: number;
}

function props(e: RawEntity, st: ImportState, inheritedLayer: string | null): EntityPropsInit {
  let layer = st.decode(str(e, 8) ?? '0');
  if (layer === '0' && inheritedLayer !== null) layer = inheritedLayer;
  try {
    assertLayerName(layer);
  } catch {
    layer = layer.replace(/[<>/\\":;?*|=,`]/g, '_').trim() || '0';
  }
  const out: EntityPropsInit = { layer };
  if (st.opts.colors === 'keep') {
    const tc = str(e, 420);
    const aci = str(e, 62);
    const color = tc !== undefined ? trueColorToHex(Number(tc)) : aci !== undefined ? aciToHex(Number(aci)) : null;
    if (color) out.color = normalizeHexColor(color);
  }
  const lw = str(e, 370);
  if (lw !== undefined && Number(lw) >= 0) out.lineWeight = Math.min(10, Number(lw) / 100);
  return out;
}

const H: Record<number, string> = { 0: 'left', 1: 'center', 2: 'right', 3: 'center', 4: 'center', 5: 'center' };
const V: Record<number, string> = { 0: 'bottom', 1: 'bottom', 2: 'middle', 3: 'top' };
const ATTACH: Record<number, TextAnchor> = {
  1: 'top-left',
  2: 'top-center',
  3: 'top-right',
  4: 'middle-left',
  5: 'middle-center',
  6: 'middle-right',
  7: 'bottom-left',
  8: 'bottom-center',
  9: 'bottom-right',
};

function convert(e: RawEntity, st: ImportState, inherited: string | null, m: Matrix2D, depth: number): PrimitiveEntity[] {
  const p = props(e, st, inherited);
  const out: PrimitiveEntity[] = [];
  const push = (prim: PrimitiveEntity): void => {
    out.push(prim);
  };
  switch (e.type) {
    case 'LINE':
      push(buildLine({ ...p, from: [num(e, 10), num(e, 20)], to: [num(e, 11), num(e, 21)] }));
      break;
    case 'POINT':
      push(buildPoint({ ...p, position: [num(e, 10), num(e, 20)] }));
      break;
    case 'CIRCLE':
      push(buildCircle({ ...p, center: [num(e, 10), num(e, 20)], radius: num(e, 40) }));
      break;
    case 'ARC': {
      const a1 = num(e, 50);
      const a2 = num(e, 51);
      if (Math.abs(((a2 - a1) % 360 + 360) % 360) < 1e-9) push(buildCircle({ ...p, center: [num(e, 10), num(e, 20)], radius: num(e, 40) }));
      else push(buildArc({ ...p, center: [num(e, 10), num(e, 20)], radius: num(e, 40), startAngleDeg: a1, endAngleDeg: a2 }));
      break;
    }
    case 'ELLIPSE': {
      const mx = num(e, 11);
      const my = num(e, 21);
      const major = Math.hypot(mx, my);
      const t1 = (num(e, 41, 0) * 180) / Math.PI;
      let t2 = (num(e, 42, Math.PI * 2) * 180) / Math.PI;
      if (t2 <= t1) t2 += 360;
      push(
        buildEllipse({
          ...p,
          center: [num(e, 10), num(e, 20)],
          radiusX: major,
          radiusY: major * num(e, 40, 1),
          rotationDeg: (Math.atan2(my, mx) * 180) / Math.PI,
          startAngleDeg: t1,
          endAngleDeg: t2 - t1 >= 360 - 1e-9 ? t1 + 360 : t2,
        }),
      );
      break;
    }
    case 'LWPOLYLINE': {
      const verts: [number, number, number][] = [];
      let x: number | null = null;
      for (const [c, v] of e.tags) {
        if (c === 10) x = Number(v);
        else if (c === 20 && x !== null) {
          verts.push([x, Number(v), 0]);
          x = null;
        } else if (c === 42 && verts.length > 0) (verts[verts.length - 1] as [number, number, number])[2] = Number(v);
      }
      const closed = (num(e, 70) & 1) === 1;
      if (verts.length >= 2) push(buildPolyline({ ...p, vertices: dedupe(verts, closed), closed }));
      break;
    }
    case 'POLYLINE': {
      const flags = num(e, 70);
      if (flags & (8 | 16 | 64)) {
        st.warnings.push('POLYLINE: 3D polylines and meshes are skipped');
        break;
      }
      const verts: [number, number, number][] = (e.vertices ?? []).map((v) => [num(v, 10), num(v, 20), num(v, 42)]);
      const closed = (flags & 1) === 1;
      if (verts.length >= 2) push(buildPolyline({ ...p, vertices: dedupe(verts, closed), closed }));
      break;
    }
    case 'SOLID':
    case 'TRACE': {
      const pts = [10, 11, 12, 13].map((c): Point2 => [num(e, c), num(e, c + 10)]);
      // Порядок вершин SOLID: 1, 2, 4, 3.
      const poly = [pts[0], pts[1], pts[3], pts[2]] as Point2[];
      push(buildPolyline({ ...p, vertices: dedupe(poly.map((q) => [q[0], q[1], 0]), true), closed: true, fill: 'solid' }));
      break;
    }
    case 'SPLINE': {
      const degree = num(e, 71, 3);
      const knots = all(e, 40);
      const control = pointsOf(e, 10);
      const fit = pointsOf(e, 11);
      if (all(e, 41).some((w) => Math.abs(w - 1) > 1e-9)) st.warnings.push('SPLINE: rational weights are ignored');
      if (control.length >= degree + 1 && degree >= 1 && degree <= 3) {
        const ok = knots.length === control.length + degree + 1;
        push(buildSpline({ ...p, degree, controlPoints: control, knots: ok ? knots : clampedUniformKnots(control.length, degree) }));
      } else if (control.length >= 2 && degree > 3 && knots.length === control.length + degree + 1) {
        const lo = knots[degree] as number;
        const hi = knots[control.length] as number;
        const n = Math.max(16, control.length * 8);
        const pts: Point2[] = [];
        for (let i = 0; i <= n; i++) pts.push(evalSpline(degree, control, knots, lo + ((hi - lo) * i) / n));
        push(fitBezier(pts, p));
        st.warnings.push(`SPLINE: degree ${degree} approximated by Bezier curves`);
      } else if (fit.length >= 2) {
        push(fitBezier(fit, p));
      }
      break;
    }
    case 'TEXT':
    case 'ATTRIB': {
      if (!st.opts.text) break;
      const h = num(e, 72);
      const v = num(e, 73);
      const aligned = h !== 0 || v !== 0;
      const pos: Point2 = aligned && str(e, 11) !== undefined ? [num(e, 11), num(e, 21)] : [num(e, 10), num(e, 20)];
      const value = plainText(st.decode(str(e, 1) ?? ''));
      if (value.trim() === '') break;
      push(
        buildText({
          ...p,
          position: pos,
          value: value.replace(/\n/g, ' '),
          height: Math.max(0.1, num(e, 40, 2.5) * st.textScale),
          rotationDeg: num(e, 50),
          anchor: `${V[v] ?? 'bottom'}-${H[h] ?? 'left'}` as TextAnchor,
        }),
      );
      break;
    }
    case 'MTEXT': {
      if (!st.opts.text) break;
      const raw = e.tags.filter((t) => t[0] === 3).map((t) => t[1]).join('') + (str(e, 1) ?? '');
      const value = plainMText(st.decode(raw));
      if (value.trim() === '') break;
      const dx = str(e, 11);
      const rot = dx !== undefined ? (Math.atan2(num(e, 21), num(e, 11)) * 180) / Math.PI : num(e, 50);
      push(
        buildMText({
          ...p,
          position: [num(e, 10), num(e, 20)],
          value,
          height: Math.max(0.1, num(e, 40, 2.5) * st.textScale),
          rotationDeg: rot,
          anchor: ATTACH[num(e, 71, 1)] ?? 'top-left',
        }),
      );
      break;
    }
    case 'INSERT': {
      const name = st.decode(str(e, 2) ?? '');
      const def = st.blocks.get(name.toLowerCase());
      if (!def) {
        st.warnings.push(`INSERT: block "${name}" not found`);
        break;
      }
      if (depth > 16) {
        st.warnings.push(`INSERT: block "${name}" nested too deep`);
        break;
      }
      if (num(e, 70, 1) > 1 || num(e, 71, 1) > 1) st.warnings.push(`INSERT "${name}": MINSERT arrays are imported as a single copy`);
      const base = st.blocks.get(`${name.toLowerCase()}#base`)?.[0];
      const bx = base ? num(base, 10) : 0;
      const by = base ? num(base, 20) : 0;
      const sx = num(e, 41, 1);
      const sy = num(e, 42, 1);
      const im = compose(translation(num(e, 10), num(e, 20)), rotation(num(e, 50)), scaling(sx || 1, sy || 1), translation(-bx, -by));
      const layer = p.layer ?? '0';
      for (const child of def) out.push(...convert(child, st, layer, im, depth + 1));
      return out.map((x) => transformPrimitive(x, m));
    }
    case 'DIMENSION':
      st.warnings.push('DIMENSION entities are skipped');
      break;
    case 'HATCH':
    case 'VIEWPORT':
    case 'ATTDEF':
      break;
    default:
      st.warnings.push(`${e.type}: entity type is not supported`);
  }
  return out.map((x) => transformPrimitive(x, m));
}

function dedupe(verts: readonly (readonly number[])[], closed: boolean): PathVertex[] {
  const out: PathVertex[] = [];
  for (const v of verts) {
    const prev = out[out.length - 1];
    if (prev && Math.hypot((v[0] as number) - prev[0], (v[1] as number) - prev[1]) <= 1e-12) continue;
    const b = (v[2] as number | undefined) ?? 0;
    out.push(b === 0 ? [v[0] as number, v[1] as number] : [v[0] as number, v[1] as number, b]);
  }
  if (closed && out.length > 2) {
    const a = out[0] as PathVertex;
    const z = out[out.length - 1] as PathVertex;
    if (Math.hypot(a[0] - z[0], a[1] - z[1]) <= 1e-12) out.pop();
  }
  return out;
}

/** Собирает вложенные замкнутые контуры (полилинии и окружности) одного слоя в полилинии с вырезами. */
function mergeHoles(list: PrimitiveEntity[], fill: EntityFill | null): PrimitiveEntity[] {
  type Closed = { index: number; entity: PrimitiveEntity; vertices: PathVertex[]; polygon: Point2[] };
  const closed: Closed[] = [];
  list.forEach((e, index) => {
    if (e.type === 'polyline' && e.closed && e.holes.length === 0 && e.vertices.length >= 2) {
      closed.push({ index, entity: e, vertices: [...e.vertices], polygon: flattenContour(e.vertices, true) });
    } else if (e.type === 'circle') {
      const [cx, cy] = e.center;
      const v: PathVertex[] = [
        [cx - e.radius, cy, 1],
        [cx + e.radius, cy, 1],
      ];
      closed.push({ index, entity: e, vertices: v, polygon: flattenContour(v, true) });
    }
  });
  const byLayer = new Map<string, Closed[]>();
  for (const c of closed) byLayer.set(c.entity.layer, [...(byLayer.get(c.entity.layer) ?? []), c]);
  const consumed = new Set<number>();
  const replacement = new Map<number, PrimitiveEntity>();
  for (const group of byLayer.values()) {
    const nested = nestContours(group.map((g) => g.polygon));
    for (const n of nested) {
      const outer = group[n.outer] as Closed;
      if (n.holes.length === 0) {
        if (fill !== null && outer.entity.type === 'polyline') replacement.set(outer.index, { ...(outer.entity as PolylineEntity), fill } as PolylineEntity);
        if (fill !== null && outer.entity.type === 'circle') replacement.set(outer.index, buildCircle({ ...outer.entity, fill }));
        continue;
      }
      const e = outer.entity;
      replacement.set(
        outer.index,
        buildPolyline({
          id: e.id,
          layer: e.layer,
          color: e.color,
          lineWeight: e.lineWeight,
          lineType: e.lineType,
          vertices: outer.vertices,
          closed: true,
          holes: n.holes.map((h) => (group[h] as Closed).vertices),
          fill,
        }),
      );
      for (const h of n.holes) consumed.add((group[h] as Closed).index);
    }
  }
  return list.flatMap((e, i) => (consumed.has(i) ? [] : [replacement.get(i) ?? e]));
}

/**
 * Читает DXF (ASCII; строкой или байтами — кодировка определяется по `$ACADVER` / `$DWGCODEPAGE`) и собирает
 * объекты пространства модели (или указанного блока) в `CadBlock`. Вставки блоков раскрываются, вложенные замкнутые
 * контуры одного слоя становятся вырезами полилиний. Поддерживаются LINE, POINT, CIRCLE, ARC, ELLIPSE, LWPOLYLINE,
 * POLYLINE (2D), SPLINE, SOLID, TEXT, MTEXT, INSERT. Размеры и штриховки пропускаются (см. `warnings`).
 */
export function importDxf(input: string | Uint8Array | ArrayBuffer, options: DxfImportOptions = {}): DxfImportResult {
  const text = toText(input);
  const tags = tokenize(text);
  const secs = sections(tags);
  const header = secs.get('HEADER') ?? [];
  const headerValue = (name: string): string | undefined => {
    const i = header.findIndex((t) => t[0] === 9 && t[1] === name);
    return i >= 0 ? header[i + 1]?.[1] : undefined;
  };
  const version = headerValue('$ACADVER') ?? 'AC1009';
  const decode = version >= 'AC1021' ? (s: string): string => s : decodeDxfString;
  const ins = Number(headerValue('$INSUNITS') ?? 0);
  const fileUnit = INSUNITS[ins] ?? null;
  const target = options.units ?? 'mm';
  const targetMm = getUnitDefinition(target).mmPerUnit;
  const factor = fileUnit ? fileUnit.mm / targetMm : 1;

  // Блоки.
  const blocks = new Map<string, RawEntity[]>();
  const blockTags = secs.get('BLOCKS') ?? [];
  let currentName: string | null = null;
  let current: RawEntity[] = [];
  for (const e of splitEntities(blockTags)) {
    if (e.type === 'BLOCK') {
      currentName = decode(str(e, 2) ?? '');
      current = [];
      blocks.set(`${currentName.toLowerCase()}#base`, [e]);
    } else if (e.type === 'ENDBLK') {
      if (currentName !== null) blocks.set(currentName.toLowerCase(), current);
      currentName = null;
    } else if (currentName !== null) {
      current.push(e);
    }
  }

  // Слои.
  const layers: LayerDefinition[] = [];
  const tableTags = secs.get('TABLES') ?? [];
  for (const e of splitEntities(tableTags)) {
    if (e.type !== 'LAYER') continue;
    const name = decode(str(e, 2) ?? '');
    if (!name) continue;
    try {
      assertLayerName(name);
    } catch {
      continue;
    }
    const aci = num(e, 62, 7);
    const tc = str(e, 420);
    const def: LayerDefinition = { name, color: tc !== undefined ? trueColorToHex(Number(tc)) : (aciToHex(aci) ?? '#000000'), visible: aci >= 0 };
    const lw = str(e, 370);
    if (lw !== undefined && Number(lw) >= 0) def.lineWeight = Math.min(10, Number(lw) / 100);
    layers.push(def);
  }

  const annotation = scaleFactor(parseScale(options.annotationScale ?? '1:1', 'annotationScale'));
  const st: ImportState = {
    opts: { colors: 'bylayer', text: true, ...options },
    blocks,
    warnings: [],
    decode,
    textScale: targetMm * annotation, // масштаб единиц (factor) к высоте применит матрица
    unitsToMm: targetMm,
  };

  const sourceName = options.source ?? 'entities';
  const raw = sourceName === 'entities' ? splitEntities(secs.get('ENTITIES') ?? []) : blocks.get(sourceName.toLowerCase());
  if (!raw) throw new CadDxfError('source', `block "${sourceName}" not found in the DXF file`);

  const flip = options.coordinateSystem === 'screen';
  const m = compose(scaling(factor, flip ? -factor : factor));
  let list: PrimitiveEntity[] = [];
  for (const e of raw) {
    try {
      list.push(...convert(e, st, null, IDENTITY_M, 0).map((x) => transformPrimitive(x, m, options.coordinateSystem ?? 'cartesian')));
    } catch (err) {
      st.warnings.push(`${e.type}: skipped (${(err as Error).message})`);
    }
  }
  if (options.layer !== undefined && options.layer !== null) {
    const layer = options.layer;
    list = list.map((e) => ({ ...e, layer }) as PrimitiveEntity).map((e) => Object.freeze(e));
  }
  if (options.detectHoles !== false) list = mergeHoles(list, options.fill ?? null);
  else if (options.fill) list = mergeHoles(list.map((e) => e), options.fill);

  let basePoint: Point2 = [0, 0];
  const bp = options.basePoint ?? 'origin';
  if (bp === 'min' || bp === 'center') {
    const ctx = createRenderContext({ settings: { units: target, annotationScale: options.annotationScale ?? '1:1', coordinateSystem: options.coordinateSystem ?? 'cartesian' } });
    const b = new BoundsBuilder();
    for (const e of list) primitiveBounds(e, ctx, undefined, b);
    const bounds = b.build();
    if (!isEmptyBounds(bounds)) basePoint = bp === 'min' ? [bounds.minX, flip ? bounds.maxY : bounds.minY] : boundsCenter(bounds);
  } else if (Array.isArray(bp)) {
    basePoint = [bp[0] as number, bp[1] as number];
  }

  return {
    block: defineBlock(options.name ?? 'Imported', list, { basePoint }),
    layers,
    fileUnits: fileUnit?.unit ?? null,
    warnings: [...new Set(st.warnings)],
  };
}

const IDENTITY_M: Matrix2D = [1, 0, 0, 1, 0, 0];

/** Короткая форма `importDxf(...).block`: заводское сечение профиля из `.dxf` → `CadBlock`. */
export function parseDxfToBlock(input: string | Uint8Array | ArrayBuffer, options: DxfImportOptions = {}): CadBlock {
  return importDxf(input, options).block;
}
