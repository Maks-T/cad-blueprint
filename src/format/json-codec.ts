import { BlockTable } from '../blocks/block-table';
import { defineBlock } from '../blocks/block';
import type { CadBlock } from '../blocks/types';
import { DEFAULT_DIM_STYLE_PROPS, DimStyleTable } from '../dim-styles';
import type { DimStyle } from '../dim-styles';
import { CadDocument, CadSheet } from '../document/document';
import { CadError } from '../errors';
import { parseEntity } from '../entities/parse';
import type { Entity } from '../entities/types';
import { clampedUniformKnots } from '../geometry/curves';
import { LayerManager } from '../layers';
import type { Layer, LayerDefinition } from '../layers';
import { createDrawingSettings, formatScale, parseScale } from '../settings';
import type { DrawingSettings } from '../settings';
import { FontManager, TEXT_ANCHORS, TextStyleTable } from '../typography';
import type { TextStyle } from '../typography';

/** Ошибка компактного формата (чтение / запись). */
export class CadFormatError extends CadError {
  constructor(field: string, message: string) {
    super(field, message);
    this.name = 'CadFormatError';
  }
}

export const COMPACT_FORMAT = 'cbp';
export const COMPACT_VERSION = 1;

/**
 * Компактный JSON документа («tuple-JSON»): таблицы и объекты — массивами с фиксированным порядком полей,
 * хвостовые значения по умолчанию отбрасываются, слои объектов — индексами в таблице слоёв, координаты округлены
 * до `settings.precision`. Типичный размер в 3–5 раз меньше `JSON.stringify(doc)`.
 */
export interface CompactDocument {
  readonly f: typeof COMPACT_FORMAT;
  readonly v: number;
  /** settings: [units, precision, scale, annotationScale, 'c' | 's', [top, right, bottom, left]] */
  readonly s: unknown[];
  /** fonts: как `FontManager.toJSON().fonts` */
  readonly fo: unknown[];
  /** text styles: [current, [[name, font, height, letterSpacing, lineHeight, oblique, widthFactor], …]] */
  readonly ts: unknown[];
  /** dim styles: [current, [[name, {изменённые поля}], …]] */
  readonly ds: unknown[];
  /** layers: [current, [[name, color, aci, lineWeight, lineType, opacity, flags, hatch], …]] */
  readonly l: unknown[];
  /** blocks: [[name, [bx, by], description, [entities]], …] */
  readonly b: unknown[];
  /** sheets: [[id, name, [entities]], …] */
  readonly sh: unknown[];
}

export interface EncodeOptions {
  /** Знаков после запятой для координат и длин; по умолчанию `settings.precision`. */
  precision?: number;
}

// ---------------------------------------------------------------------------------------------------------------------
// Округление

function rounder(precision: number): (v: number) => number {
  return (v: number): number => {
    const r = Number(v.toFixed(precision));
    return r === 0 ? 0 : r;
  };
}
const fine = rounder(10);

// ---------------------------------------------------------------------------------------------------------------------
// Схемы объектов: код и порядок полей. Тип поля задаёт округление и значение по умолчанию (для отбрасывания хвоста).

type FieldKind = 'pt' | 'pts' | 'len' | 'num' | 'raw' | 'bool' | 'verts' | 'holes' | 'anchor' | 'knots' | 'ents' | 'scale' | 'clip';
interface Field {
  readonly key: string;
  readonly kind: FieldKind;
  readonly def?: unknown;
}

const f = (key: string, kind: FieldKind, def?: unknown): Field => (def === undefined ? { key, kind } : { key, kind, def });

const SCHEMAS: Record<string, { code: string; fields: Field[] }> = {
  point: { code: 'P', fields: [f('position', 'pt')] },
  line: { code: 'L', fields: [f('from', 'pt'), f('to', 'pt')] },
  circle: { code: 'C', fields: [f('center', 'pt'), f('radius', 'len'), f('fill', 'raw', null)] },
  arc: { code: 'A', fields: [f('center', 'pt'), f('radius', 'len'), f('startAngleDeg', 'num'), f('endAngleDeg', 'num'), f('counterclockwise', 'bool', true)] },
  ellipse: {
    code: 'E',
    fields: [f('center', 'pt'), f('radiusX', 'len'), f('radiusY', 'len'), f('rotationDeg', 'num', 0), f('startAngleDeg', 'num', 0), f('endAngleDeg', 'num', 360), f('fill', 'raw', null)],
  },
  rect: { code: 'R', fields: [f('x', 'len'), f('y', 'len'), f('width', 'len'), f('height', 'len'), f('cornerRadius', 'len', 0), f('fill', 'raw', null)] },
  polyline: { code: 'PL', fields: [f('vertices', 'verts'), f('closed', 'bool', false), f('holes', 'holes', []), f('fill', 'raw', null)] },
  text: { code: 'T', fields: [f('position', 'pt'), f('value', 'raw'), f('style', 'raw', null), f('height', 'num', null), f('rotationDeg', 'num', 0), f('anchor', 'anchor', 'bottom-left')] },
  mtext: { code: 'MT', fields: [f('position', 'pt'), f('value', 'raw'), f('style', 'raw', null), f('height', 'num', null), f('rotationDeg', 'num', 0), f('anchor', 'anchor', 'bottom-left')] },
  spline: { code: 'S', fields: [f('controlPoints', 'pts'), f('degree', 'raw', 3), f('knots', 'knots', null)] },
  bezier: { code: 'B', fields: [f('points', 'pts')] },
  'dim-linear': { code: 'DL', fields: [f('p1', 'pt'), f('p2', 'pt'), f('angleDeg', 'num'), f('offset', 'len'), f('style', 'raw', null), f('text', 'raw', null)] },
  'dim-aligned': { code: 'DA', fields: [f('p1', 'pt'), f('p2', 'pt'), f('offset', 'len'), f('style', 'raw', null), f('text', 'raw', null)] },
  'dim-chain': { code: 'DC', fields: [f('points', 'pts'), f('angleDeg', 'num'), f('offset', 'len'), f('style', 'raw', null), f('texts', 'raw', null)] },
  'dim-baseline': { code: 'DB', fields: [f('base', 'pt'), f('points', 'pts'), f('angleDeg', 'num'), f('offset', 'len'), f('style', 'raw', null), f('spacing', 'num', null)] },
  'dim-angular': {
    code: 'DG',
    fields: [f('center', 'pt'), f('start', 'pt'), f('end', 'pt'), f('radius', 'len'), f('counterclockwise', 'bool', true), f('style', 'raw', null), f('text', 'raw', null)],
  },
  'dim-radius': { code: 'DR', fields: [f('center', 'pt'), f('radius', 'len'), f('angleDeg', 'num'), f('style', 'raw', null), f('text', 'raw', null)] },
  'dim-diameter': { code: 'DD', fields: [f('center', 'pt'), f('radius', 'len'), f('angleDeg', 'num'), f('style', 'raw', null), f('text', 'raw', null)] },
  leader: { code: 'LD', fields: [f('points', 'pts'), f('text', 'raw'), f('style', 'raw', null), f('shelf', 'bool', true), f('shelfLength', 'num', null)] },
  insert: { code: 'I', fields: [f('block', 'raw'), f('position', 'pt'), f('scaleX', 'num', 1), f('scaleY', 'num', 1), f('rotationDeg', 'num', 0)] },
  viewport: {
    code: 'V',
    fields: [f('entities', 'ents'), f('position', 'pt'), f('target', 'pt', [0, 0]), f('scale', 'scale', null), f('rotationDeg', 'num', 0), f('title', 'raw', null), f('clip', 'clip', null), f('frame', 'bool', false)],
  },
};

const BY_CODE = new Map(Object.entries(SCHEMAS).map(([type, s]) => [s.code, { type, fields: s.fields }]));

function sameValue(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

interface EncodeCtx {
  readonly round: (v: number) => number;
  readonly layerIndex: Map<string, number>;
}

function encodeValue(kind: FieldKind, v: unknown, c: EncodeCtx): unknown {
  switch (kind) {
    case 'pt': {
      const p = v as readonly [number, number];
      return [c.round(p[0]), c.round(p[1])];
    }
    case 'pts':
      return (v as readonly (readonly [number, number])[]).map((p) => [c.round(p[0]), c.round(p[1])]);
    case 'len':
      return c.round(v as number);
    case 'num':
      return v === null ? null : fine(v as number);
    case 'bool':
      return v ? 1 : 0;
    case 'verts':
      return (v as readonly (readonly number[])[]).map((p) => (p.length === 3 ? [c.round(p[0] as number), c.round(p[1] as number), fine(p[2] as number)] : [c.round(p[0] as number), c.round(p[1] as number)]));
    case 'holes':
      return (v as readonly (readonly (readonly number[])[])[]).map((h) => encodeValue('verts', h, c));
    case 'anchor':
      return TEXT_ANCHORS.indexOf(v as (typeof TEXT_ANCHORS)[number]);
    case 'knots':
      return v === null ? null : (v as number[]).map(fine);
    case 'ents':
      return (v as readonly Entity[]).map((e) => encodeEntity(e, c));
    case 'scale':
      return v === null ? null : formatScale(v as { numerator: number; denominator: number });
    case 'clip': {
      if (v === null) return null;
      const b = v as { minX: number; minY: number; maxX: number; maxY: number };
      return [c.round(b.minX), c.round(b.minY), c.round(b.maxX), c.round(b.maxY)];
    }
    case 'raw':
      return v;
  }
}

function decodeValue(kind: FieldKind, v: unknown, field: string, layers: readonly string[], depth: number): unknown {
  switch (kind) {
    case 'bool':
      return v === 1 || v === true;
    case 'anchor': {
      const a = TEXT_ANCHORS[v as number];
      if (a === undefined) throw new CadFormatError(field, `unknown text anchor index ${String(v)}`);
      return a;
    }
    case 'ents':
      if (!Array.isArray(v)) throw new CadFormatError(field, 'must be an array of entities');
      return v.map((e, i) => decodeEntity(e, layers, `${field}[${i}]`, depth + 1));
    case 'scale':
      return v === null ? null : parseScale(v as string, field);
    case 'clip': {
      if (v === null) return null;
      if (!Array.isArray(v) || v.length !== 4) throw new CadFormatError(field, 'must be [minX, minY, maxX, maxY]');
      return { minX: v[0], minY: v[1], maxX: v[2], maxY: v[3] };
    }
    default:
      return v;
  }
}

/** Объект → кортеж `[код, слой, …поля, {доп. свойства}?]`. */
function encodeEntity(e: Entity, c: EncodeCtx): unknown[] {
  const schema = SCHEMAS[e.type];
  if (!schema) throw new CadFormatError('entity', `unknown type ${e.type}`);
  const rec = e as unknown as Record<string, unknown>;
  let values = schema.fields.map((fd) => {
    let v = rec[fd.key];
    if (e.type === 'spline' && fd.key === 'knots') {
      const s = e as Extract<Entity, { type: 'spline' }>;
      if (sameValue(s.knots, clampedUniformKnots(s.controlPoints.length, s.degree))) v = null;
    }
    return { fd, v: encodeValue(fd.kind, v, c) };
  });
  // Отбрасываем хвостовые значения по умолчанию.
  while (values.length > 0) {
    const last = values[values.length - 1] as { fd: Field; v: unknown };
    if (last.fd.def === undefined) break;
    const def = encodeValue(last.fd.kind, last.fd.def, c);
    if (!sameValue(last.v, def)) break;
    values = values.slice(0, -1);
  }
  const idx = c.layerIndex.get(e.layer.toLowerCase());
  const out: unknown[] = [schema.code, idx ?? e.layer, ...values.map((x) => x.v)];
  const extra: Record<string, unknown> = {};
  if (e.id !== null) extra['i'] = e.id;
  if (e.color !== null) extra['c'] = e.color;
  if (e.lineWeight !== null) extra['w'] = e.lineWeight;
  if (e.lineType !== null) extra['t'] = e.lineType;
  if (Object.keys(extra).length > 0) out.push(extra);
  return out;
}

const MAX_DEPTH = 32;

function decodeEntity(raw: unknown, layers: readonly string[], field: string, depth = 0): Entity {
  if (!Array.isArray(raw) || raw.length < 2) throw new CadFormatError(field, 'must be an entity tuple [code, layer, …]');
  if (depth > MAX_DEPTH) throw new CadFormatError(field, 'nesting is too deep');
  const [code, layerRef, ...rest] = raw as [unknown, unknown, ...unknown[]];
  const schema = BY_CODE.get(String(code));
  if (!schema) throw new CadFormatError(field, `unknown entity code ${String(code)}`);
  let extra: Record<string, unknown> = {};
  const last = rest[rest.length - 1];
  if (typeof last === 'object' && last !== null && !Array.isArray(last)) {
    extra = last as Record<string, unknown>;
    rest.pop();
  }
  if (rest.length > schema.fields.length) throw new CadFormatError(field, `too many fields for ${schema.type}`);
  const layer = typeof layerRef === 'number' ? layers[layerRef] : layerRef;
  if (typeof layer !== 'string') throw new CadFormatError(`${field}.layer`, `unknown layer reference ${String(layerRef)}`);
  const obj: Record<string, unknown> = { type: schema.type, layer };
  schema.fields.forEach((fd, i) => {
    if (i >= rest.length) {
      if (fd.def === undefined) throw new CadFormatError(`${field}.${fd.key}`, 'is missing');
      obj[fd.key] = fd.def; // значение по умолчанию уже в «развёрнутом» виде
      return;
    }
    obj[fd.key] = decodeValue(fd.kind, rest[i], `${field}.${fd.key}`, layers, depth);
  });
  if (schema.type === 'spline' && obj['knots'] === null) delete obj['knots'];
  for (const [k, key] of [
    ['i', 'id'],
    ['c', 'color'],
    ['w', 'lineWeight'],
    ['t', 'lineType'],
  ] as const) {
    if (extra[k] !== undefined) obj[key] = extra[k];
  }
  return parseEntity(obj, field);
}

// ---------------------------------------------------------------------------------------------------------------------
// Таблицы

function encodeSettings(s: DrawingSettings): unknown[] {
  return [s.units, s.precision, formatScale(s.scale), formatScale(s.annotationScale), s.coordinateSystem === 'screen' ? 's' : 'c', [s.padding.top, s.padding.right, s.padding.bottom, s.padding.left]];
}

function decodeSettings(raw: unknown): DrawingSettings {
  if (!Array.isArray(raw)) throw new CadFormatError('s', 'settings must be an array');
  const [units, precision, scale, annotationScale, cs, padding] = raw as [unknown, unknown, unknown, unknown, unknown, unknown];
  return createDrawingSettings({
    units: units as DrawingSettings['units'],
    precision: precision as number,
    scale: scale as string,
    annotationScale: annotationScale as string,
    coordinateSystem: cs === 's' ? 'screen' : 'cartesian',
    padding: padding as [number, number, number, number],
  });
}

function encodeLayer(l: Layer): unknown[] {
  const flags = (l.visible ? 1 : 0) | (l.locked ? 2 : 0);
  const out: unknown[] = [l.name, l.color, l.dxfColorIndex, l.lineWeight, l.lineType, l.opacity, flags, l.hatch];
  while (out.length > 6 && (out[out.length - 1] === null || (out.length === 7 && out[6] === 1))) out.pop();
  return out;
}

function decodeLayer(raw: unknown, i: number): LayerDefinition {
  if (!Array.isArray(raw) || raw.length < 6) throw new CadFormatError(`l[${i}]`, 'layer must be [name, color, aci, lineWeight, lineType, opacity, flags?, hatch?]');
  const [name, color, aci, lineWeight, lineType, opacity, flags = 1, hatch = null] = raw as [string, string, number, number, LayerDefinition['lineType'], number, number?, unknown?];
  const def: LayerDefinition = { name, color, dxfColorIndex: aci, lineWeight, opacity, visible: ((flags as number) & 1) === 1, locked: ((flags as number) & 2) === 2 };
  if (lineType !== undefined) def.lineType = lineType;
  if (hatch !== null && hatch !== undefined) def.hatch = hatch as NonNullable<LayerDefinition['hatch']>;
  return def;
}

function encodeTextStyle(s: TextStyle): unknown[] {
  return [s.name, s.fontFamily, s.height, s.letterSpacing, s.lineHeight, s.obliqueAngle, s.widthFactor];
}

function encodeDimStyle(s: DimStyle): unknown[] {
  const changed: Record<string, unknown> = {};
  for (const [k, def] of Object.entries(DEFAULT_DIM_STYLE_PROPS)) {
    const v = (s as unknown as Record<string, unknown>)[k];
    if (!sameValue(v, def)) changed[k] = v;
  }
  return Object.keys(changed).length === 0 ? [s.name] : [s.name, changed];
}

function encodeBlock(b: CadBlock, c: EncodeCtx): unknown[] {
  return [b.name, [c.round(b.basePoint[0]), c.round(b.basePoint[1])], b.description, b.entities.map((e) => encodeEntity(e, c))];
}

function decodeBlock(raw: unknown, layers: readonly string[], i: number): CadBlock {
  if (!Array.isArray(raw) || raw.length !== 4) throw new CadFormatError(`b[${i}]`, 'block must be [name, basePoint, description, entities]');
  const [name, basePoint, description, entities] = raw as [string, [number, number], string | null, unknown[]];
  if (!Array.isArray(entities)) throw new CadFormatError(`b[${i}].entities`, 'must be an array');
  return defineBlock(
    name,
    entities.map((e, j) => decodeEntity(e, layers, `b[${i}].entities[${j}]`)),
    { basePoint, description },
  );
}

/** Документ → компактный JSON (объект; для строки — `JSON.stringify`). */
export function encodeDocument(doc: CadDocument, options: EncodeOptions = {}): CompactDocument {
  const precision = options.precision ?? doc.settings.precision;
  const layerList = doc.layers.list();
  const c: EncodeCtx = { round: rounder(precision), layerIndex: new Map(layerList.map((l, i) => [l.name.toLowerCase(), i])) };
  return {
    f: COMPACT_FORMAT,
    v: COMPACT_VERSION,
    s: encodeSettings(doc.settings),
    fo: [...doc.fonts.toJSON().fonts],
    ts: [doc.textStyles.current.name, doc.textStyles.list().map(encodeTextStyle)],
    ds: [doc.dimStyles.current.name, doc.dimStyles.list().map(encodeDimStyle)],
    l: [doc.layers.current.name, layerList.map(encodeLayer)],
    b: doc.blocks.list().map((b) => encodeBlock(b, c)),
    sh: doc.sheets.map((s) => [s.id, s.name, s.entities.map((e) => encodeEntity(e, c))]),
  };
}

/** Компактный JSON (объект или строка) → документ, с полной проверкой всех таблиц и объектов. */
export function decodeDocument(input: CompactDocument | string | unknown): CadDocument {
  let raw: unknown = input;
  if (typeof input === 'string') {
    try {
      raw = JSON.parse(input);
    } catch (err) {
      throw new CadFormatError('json', `invalid JSON: ${(err as Error).message}`);
    }
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) throw new CadFormatError('document', 'must be an object');
  const r = raw as Record<string, unknown>;
  if (r['f'] !== COMPACT_FORMAT) throw new CadFormatError('f', `must be "${COMPACT_FORMAT}", got ${String(r['f'])}`);
  if (r['v'] !== COMPACT_VERSION) throw new CadFormatError('v', `unsupported version ${String(r['v'])} (expected ${COMPACT_VERSION})`);
  const arr = (key: string): unknown[] => {
    const v = r[key];
    if (!Array.isArray(v)) throw new CadFormatError(key, 'must be an array');
    return v;
  };
  const settings = decodeSettings(r['s']);
  const fonts = FontManager.fromJSON({ fonts: arr('fo') });

  const [tsCurrent, tsList] = arr('ts') as [string, unknown[]];
  if (!Array.isArray(tsList)) throw new CadFormatError('ts', 'must be [current, styles]');
  const textStyles = TextStyleTable.fromJSON(fonts, {
    current: tsCurrent,
    styles: tsList.map((t, i) => {
      if (!Array.isArray(t) || t.length !== 7) throw new CadFormatError(`ts[${i}]`, 'must be [name, font, height, letterSpacing, lineHeight, oblique, widthFactor]');
      const [name, fontFamily, height, letterSpacing, lineHeight, obliqueAngle, widthFactor] = t as [string, string, number, number, number, number, number];
      return { name, fontFamily, height, letterSpacing, lineHeight, obliqueAngle, widthFactor };
    }),
  });

  const [dsCurrent, dsList] = arr('ds') as [string, unknown[]];
  if (!Array.isArray(dsList)) throw new CadFormatError('ds', 'must be [current, styles]');
  const dimStyles = DimStyleTable.fromJSON(textStyles, {
    current: dsCurrent,
    styles: dsList.map((d, i) => {
      if (!Array.isArray(d) || d.length < 1) throw new CadFormatError(`ds[${i}]`, 'must be [name, changes?]');
      return { name: d[0], ...((d[1] as object | undefined) ?? {}) };
    }),
  });

  const [lCurrent, lList] = arr('l') as [string, unknown[]];
  if (!Array.isArray(lList)) throw new CadFormatError('l', 'must be [current, layers]');
  const layerDefs = lList.map(decodeLayer);
  const layers = LayerManager.fromJSON({ current: lCurrent, layers: layerDefs });
  const layerNames = layerDefs.map((l) => l.name);
  if (!layerNames.some((n) => n === '0')) layerNames.unshift('0');

  const blocks = new BlockTable();
  for (const b of arr('b').map((x, i) => decodeBlock(x, layerNames, i))) blocks.add(b);

  const sheets = arr('sh').map((s, i) => {
    if (!Array.isArray(s) || s.length !== 3) throw new CadFormatError(`sh[${i}]`, 'sheet must be [id, name, entities]');
    const [id, name, entities] = s as [string, string, unknown[]];
    if (!Array.isArray(entities)) throw new CadFormatError(`sh[${i}].entities`, 'must be an array');
    return new CadSheet(id, name, entities.map((e, j) => decodeEntity(e, layerNames, `sh[${i}].entities[${j}]`)));
  });

  return CadDocument.fromParts({ settings, dimStyles, layers, blocks, sheets });
}

/** Документ → строка компактного JSON. */
export function stringifyDocument(doc: CadDocument, options: EncodeOptions = {}): string {
  return JSON.stringify(encodeDocument(doc, options));
}

/** Отдельные объекты → компактные кортежи (слои — по таблице `layers`, или именами). */
export function encodeEntities(entities: readonly Entity[], options: { precision?: number; layers?: LayerManager } = {}): unknown[] {
  const list = options.layers?.list() ?? [];
  const c: EncodeCtx = { round: rounder(options.precision ?? 3), layerIndex: new Map(list.map((l, i) => [l.name.toLowerCase(), i])) };
  return entities.map((e) => encodeEntity(e, c));
}

export function decodeEntities(raw: unknown, options: { layers?: LayerManager } = {}): Entity[] {
  if (!Array.isArray(raw)) throw new CadFormatError('entities', 'must be an array');
  const names = options.layers?.names() ?? [];
  return raw.map((e, i) => decodeEntity(e, names, `entities[${i}]`));
}
