import { buildInsert } from '../blocks/insert';
import { buildViewport } from '../blocks/viewport';
import {
  buildDimAligned,
  buildDimAngular,
  buildDimBaseline,
  buildDimChain,
  buildDimDiameter,
  buildDimLinear,
  buildDimRadius,
  buildLeader,
} from '../dimensions/build';
import {
  buildArc,
  buildBezier,
  buildCircle,
  buildEllipse,
  buildLine,
  buildMText,
  buildPoint,
  buildPolyline,
  buildRect,
  buildSpline,
  buildText,
} from '../primitives/build';
import { CadPrimitiveError } from '../primitives/errors';
import { ENTITY_TYPES } from './kinds';
import type { Entity } from './types';

const MAX_DEPTH = 32;

/* eslint-disable @typescript-eslint/no-explicit-any */
type Raw = Record<string, any>;

function withoutType(raw: Raw): Raw {
  const { type: _type, ...rest } = raw;
  return rest;
}

/** Вид объекта (как его отдаёт `JSON.stringify`) → вход фабрики: `angleDeg` линейных размеров → `direction`. */
function directional(raw: Raw, dropText: boolean): Raw {
  const { angleDeg, text, ...rest } = withoutType(raw);
  const out: Raw = { ...rest };
  if (angleDeg !== undefined) out['direction'] = angleDeg;
  if (!dropText && text !== undefined) out['text'] = text;
  if (dropText && text !== undefined && text !== null) {
    throw new CadPrimitiveError(`${String(raw['type'])}.text`, 'is not supported here (use "texts" for a chain)');
  }
  return out;
}

/**
 * Разбирает объект чертежа из JSON (например, из БД) с полной проверкой. Принимает и вид, который отдаёт
 * `JSON.stringify(entity)`, и вход фабрик (`buildX`). Неизвестный `type` или поле — ошибка.
 */
export function parseEntity(raw: unknown, field = 'entity', depth = 0): Entity {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new CadPrimitiveError(field, 'must be an object with a "type"');
  }
  if (depth > MAX_DEPTH) throw new CadPrimitiveError(field, `nesting is deeper than ${MAX_DEPTH} levels`);
  const r = raw as Raw;
  const init = withoutType(r) as any;
  try {
    switch (r['type']) {
      case 'point':
        return buildPoint(init);
      case 'line':
        return buildLine(init);
      case 'circle':
        return buildCircle(init);
      case 'arc':
        return buildArc(init);
      case 'ellipse':
        return buildEllipse(init);
      case 'rect':
        return buildRect(init);
      case 'polyline':
        return buildPolyline(init);
      case 'text':
        return buildText(init);
      case 'mtext':
        return buildMText(init);
      case 'spline':
        return buildSpline(init);
      case 'bezier':
        return buildBezier(init);
      case 'dim-linear':
        return buildDimLinear(directional(r, false) as any);
      case 'dim-aligned':
        return buildDimAligned(init);
      case 'dim-chain':
        return buildDimChain(directional(r, true) as any);
      case 'dim-baseline':
        return buildDimBaseline(directional(r, true) as any);
      case 'dim-angular':
        return buildDimAngular(init);
      case 'dim-radius':
        return buildDimRadius(init);
      case 'dim-diameter':
        return buildDimDiameter(init);
      case 'leader':
        return buildLeader(init);
      case 'insert':
        return buildInsert(init);
      case 'viewport': {
        if (!Array.isArray(init.entities)) throw new CadPrimitiveError(`${field}.entities`, 'must be an array');
        const children = (init.entities as unknown[]).map((e, i) => parseEntity(e, `${field}.entities[${i}]`, depth + 1));
        return buildViewport({ ...init, entities: children });
      }
      default:
        throw new CadPrimitiveError(`${field}.type`, `must be one of ${ENTITY_TYPES.join(' | ')}, got ${String(r['type'])}`);
    }
  } catch (err) {
    if (err instanceof Error && field !== 'entity' && !err.message.includes(field)) {
      err.message = `${err.message} (at ${field})`;
    }
    throw err;
  }
}

/** Разбирает массив объектов. */
export function parseEntities(raw: unknown, field = 'entities'): Entity[] {
  if (!Array.isArray(raw)) throw new CadPrimitiveError(field, 'must be an array');
  return raw.map((e, i) => parseEntity(e, `${field}[${i}]`));
}
