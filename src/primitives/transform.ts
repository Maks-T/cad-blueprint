import { applyToPoint, applyToVector, determinant, isIdentity, isSimilarity, uniformScale } from '../geometry/matrix';
import type { Matrix2D } from '../geometry/matrix';
import { angleDegOf, length } from '../geometry/vec';
import type { PathVertex } from '../path-builder';
import type { CoordinateSystem, Point2 } from '../settings';
import { buildArc, buildCircle, buildEllipse, buildLine, buildMText, buildPoint, buildPolyline, buildSpline, buildBezier, buildText } from './build';
import { arcParametric, circleParametric, contourSegments, ellipseParametric, rectVertices } from './outline';
import type { ParametricArc } from '../geometry/curves';
import type { EllipseEntity, PolylineEntity, PrimitiveEntity } from './types';

const DEG = 180 / Math.PI;

/** Аппроксимация дуг контура отрезками (не длиннее `maxStepDeg` градусов дуги). */
export function flattenContour(vertices: readonly PathVertex[], closed: boolean, maxStepDeg = 5): Point2[] {
  const segs = contourSegments(vertices, closed);
  if (segs.length === 0) return vertices.map((v) => [v[0], v[1]]);
  const out: Point2[] = [segs[0]!.from];
  for (const s of segs) {
    if (s.type === 'line') {
      out.push(s.to);
      continue;
    }
    const n = Math.max(2, Math.ceil(s.sweepDeg / maxStepDeg));
    const dir = s.counterclockwise ? 1 : -1;
    for (let i = 1; i <= n; i++) {
      const a = (s.startAngleDeg + (dir * s.sweepDeg * i) / n) / DEG;
      out.push(i === n ? s.to : [s.center[0] + s.radius * Math.cos(a), s.center[1] + s.radius * Math.sin(a)]);
    }
  }
  if (closed) out.pop();
  return out;
}

/** Параметрическая эллиптическая дуга → эллипс в главных осях (для `buildEllipse`). */
function ellipseFromParametric(arc: ParametricArc, props: PrimitiveEntity, fill: EllipseEntity['fill']): EllipseEntity {
  let u = arc.u;
  let v = arc.v;
  let t1 = arc.t0;
  let t2 = arc.t0 + arc.sweep;
  // Обход по часовой (или зеркальная матрица): меняем знак V и параметра, чтобы параметр рос против часовой.
  if (u[0] * v[1] - u[1] * v[0] < 0) {
    v = [-v[0], -v[1]];
    [t1, t2] = [-t1, -t2];
  }
  if (t2 < t1) [t1, t2] = [t2, t1];
  const t0 = 0.5 * Math.atan2(2 * (u[0] * v[0] + u[1] * v[1]), u[0] * u[0] + u[1] * u[1] - (v[0] * v[0] + v[1] * v[1]));
  const a: Point2 = [u[0] * Math.cos(t0) + v[0] * Math.sin(t0), u[1] * Math.cos(t0) + v[1] * Math.sin(t0)];
  const b: Point2 = [-u[0] * Math.sin(t0) + v[0] * Math.cos(t0), -u[1] * Math.sin(t0) + v[1] * Math.cos(t0)];
  const full = Math.abs(arc.sweep) >= Math.PI * 2 - 1e-12;
  return buildEllipse({
    id: props.id,
    layer: props.layer,
    color: props.color,
    lineWeight: props.lineWeight,
    lineType: props.lineType,
    center: arc.center,
    radiusX: length(a),
    radiusY: length(b),
    rotationDeg: angleDegOf(a),
    startAngleDeg: full ? 0 : (t1 - t0) * DEG,
    endAngleDeg: full ? 360 : (t2 - t0) * DEG,
    fill,
  });
}

function transformArc(arc: ParametricArc, m: Matrix2D): ParametricArc {
  return { center: applyToPoint(m, arc.center), u: applyToVector(m, arc.u), v: applyToVector(m, arc.v), t0: arc.t0, sweep: arc.sweep };
}

function common(e: PrimitiveEntity): { id: string | null; layer: string; color: string | null; lineWeight: number | null; lineType: PrimitiveEntity['lineType'] } {
  return { id: e.id, layer: e.layer, color: e.color, lineWeight: e.lineWeight, lineType: e.lineType };
}

function transformContour(vertices: readonly PathVertex[], closed: boolean, m: Matrix2D, similar: boolean, mirror: boolean): PathVertex[] {
  if (similar) {
    return vertices.map((v) => {
      const [x, y] = applyToPoint(m, [v[0], v[1]]);
      const b = v[2] ?? 0;
      return b === 0 ? [x, y] : [x, y, mirror ? -b : b];
    });
  }
  return flattenContour(vertices, closed).map((p) => applyToPoint(m, p));
}

/**
 * Применяет аффинную матрицу к примитиву. Подобие (поворот, равномерный масштаб, зеркало) сохраняет тип объекта;
 * при неравномерном масштабе окружность и дуга становятся эллипсом, а дуги полилинии — отрезками (шаг ≤ 5°).
 * `coordinateSystem` нужен только тексту (его поворот — визуальный). Текст: точка вставки переносится, поворот добавляется, высота умножается на масштаб по Y; зеркальный текст остаётся читаемым.
 */
export function transformPrimitive(e: PrimitiveEntity, m: Matrix2D, coordinateSystem: CoordinateSystem = 'cartesian'): PrimitiveEntity {
  if (isIdentity(m)) return e;
  const similar = isSimilarity(m);
  const mirror = determinant(m) < 0;
  const s = uniformScale(m);
  const c = common(e);
  switch (e.type) {
    case 'point':
      return buildPoint({ ...c, position: applyToPoint(m, e.position) });
    case 'line':
      return buildLine({ ...c, from: applyToPoint(m, e.from), to: applyToPoint(m, e.to) });
    case 'circle':
      return similar
        ? buildCircle({ ...c, center: applyToPoint(m, e.center), radius: e.radius * s, fill: e.fill })
        : ellipseFromParametric(transformArc(circleParametric(e), m), e, e.fill);
    case 'arc': {
      if (!similar) return ellipseFromParametric(transformArc(arcParametric(e), m), e, null);
      const center = applyToPoint(m, e.center);
      const a1 = (e.startAngleDeg / DEG);
      const a2 = (e.endAngleDeg / DEG);
      const p1 = applyToPoint(m, [e.center[0] + e.radius * Math.cos(a1), e.center[1] + e.radius * Math.sin(a1)]);
      const p2 = applyToPoint(m, [e.center[0] + e.radius * Math.cos(a2), e.center[1] + e.radius * Math.sin(a2)]);
      return buildArc({
        ...c,
        center,
        radius: e.radius * s,
        startAngleDeg: angleDegOf([p1[0] - center[0], p1[1] - center[1]]),
        endAngleDeg: angleDegOf([p2[0] - center[0], p2[1] - center[1]]),
        counterclockwise: mirror ? !e.counterclockwise : e.counterclockwise,
      });
    }
    case 'ellipse':
      return ellipseFromParametric(transformArc(ellipseParametric(e), m), e, e.fill);
    case 'rect':
      return buildPolyline({ ...c, vertices: transformContour(rectVertices(e), true, m, similar, mirror), closed: true, fill: e.fill });
    case 'polyline': {
      const p = e as PolylineEntity;
      return buildPolyline({
        ...c,
        vertices: transformContour(p.vertices, p.closed, m, similar, mirror),
        closed: p.closed,
        holes: p.holes.map((h) => transformContour(h, true, m, similar, mirror)),
        fill: p.fill,
      });
    }
    case 'text':
    case 'mtext': {
      const x = applyToVector(m, [1, 0]);
      const y = applyToVector(m, [0, 1]);
      const build = e.type === 'text' ? buildText : buildMText;
      // Поворот текста визуальный: в системе `screen` числовой угол оси X на экране выглядит с обратным знаком.
      let rot = (coordinateSystem === 'screen' ? -angleDegOf(x) : angleDegOf(x)) + e.rotationDeg;
      const n = ((rot % 360) + 360) % 360;
      if (mirror && n > 90 && n <= 270) rot -= 180; // зеркальный текст остаётся читаемым (как MIRRTEXT = 0)
      return build({
        ...c,
        position: applyToPoint(m, e.position),
        value: e.value,
        style: e.style,
        height: e.height === null ? null : e.height * length(y),
        rotationDeg: rot,
        anchor: e.anchor,
      });
    }
    case 'spline':
      return buildSpline({ ...c, degree: e.degree, controlPoints: e.controlPoints.map((p) => applyToPoint(m, p)), knots: e.knots });
    case 'bezier':
      return buildBezier({ ...c, points: e.points.map((p) => applyToPoint(m, p)) });
  }
}
