import type { Bounds } from '../geometry/bounds';
import type { EntityProps, EntityPropsInit } from '../primitives';
import type { DrawingScale, Point2, ScaleInput } from '../settings';
import type { Entity } from '../entities/types';

/**
 * Определение блока (как BLOCK в AutoCAD): набор объектов в локальной системе координат блока.
 * `basePoint` — точка блока, которая совмещается с точкой вставки.
 */
export interface CadBlock {
  readonly name: string;
  readonly basePoint: Point2;
  readonly entities: readonly Entity[];
  readonly description: string | null;
}

export interface CadBlockInit {
  basePoint?: Point2;
  description?: string | null;
}

/**
 * Вставка блока (INSERT). Матрица вставки: `T(position) · R(rotationDeg) · S(scaleX, scaleY) · T(−basePoint)`.
 * `scaleX: -1` — зеркало. Поворот — в числовой плоскости, как у дуг и INSERT в DXF (в системе `screen` положительный угол
 * на экране выглядит как поворот по часовой).
 * Объекты блока на слое `"0"` рисуются на слое вставки (правило AutoCAD), остальные — на своих слоях.
 */
export interface BlockInsertEntity extends EntityProps {
  readonly type: 'insert';
  readonly block: string;
  readonly position: Point2;
  readonly scaleX: number;
  readonly scaleY: number;
  readonly rotationDeg: number;
}

export interface BlockInsertInit extends EntityPropsInit {
  block: string;
  position?: Point2;
  /** Равномерный масштаб (вместо `scaleX` / `scaleY`). */
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  rotationDeg?: number;
}

/**
 * Видовой экран / группа (SubCanvas): отдельный чертёж внутри листа со своим масштабом и смещением.
 * Точка `target` локальной системы попадает в `position` родителя, затем поворот и масштаб
 * `k = scale(экрана) / scale(родителя)`. Внутри экрана тексты, стрелки и прочие аннотации считаются по его
 * масштабу, поэтому на бумаге они того же размера, что и снаружи (как у видовых экранов AutoCAD).
 */
export interface ViewportEntity extends EntityProps {
  readonly type: 'viewport';
  readonly position: Point2;
  readonly target: Point2;
  /** Масштаб экрана; `null` — как у родителя (просто группа со сдвигом и поворотом). */
  readonly scale: DrawingScale | null;
  readonly rotationDeg: number;
  readonly entities: readonly Entity[];
  /** Подпись над видом (например, «Фасад», «А–А»); `null` — без подписи. */
  readonly title: string | null;
  /** Обрезка в локальных координатах экрана; `null` — без обрезки. */
  readonly clip: Bounds | null;
  /** Рисовать рамку по границе обрезки. */
  readonly frame: boolean;
}

export interface ViewportInit extends EntityPropsInit {
  entities: readonly Entity[];
  position?: Point2;
  target?: Point2;
  scale?: ScaleInput | null;
  rotationDeg?: number;
  title?: string | null;
  clip?: Bounds | { minX: number; minY: number; maxX: number; maxY: number } | null;
  frame?: boolean;
}
