import { normalizeHexColor } from './color';
import { CadLayerError } from './errors';
import { parseDashPattern } from './linetype';

/**
 * Семейство параллельных линий штриховки. Все размеры — мм на бумаге
 * (штриховка не меняет шаг при смене масштаба чертежа, как в ГОСТ).
 */
export interface HatchFamily {
  /** Угол наклона линий, градусы против часовой стрелки от оси X, нормализован в [0, 180). */
  readonly angle: number;
  /** Расстояние между соседними линиями (по нормали), мм. */
  readonly spacing: number;
  /** Толщина линий, мм (0 — самая тонкая). */
  readonly lineWidth: number;
  /** Цвет линий `#rrggbb`; `null` — цвет слоя (ByLayer). */
  readonly color: string | null;
  /** Паттерн штрихов вдоль линии (штрих, пробел, …) в мм; пустой — сплошная линия. */
  readonly dash: readonly number[];
  /** Сдвиг штрихов каждой следующей линии относительно предыдущей вдоль линии (шахматка), мм. */
  readonly offset: number;
}

/** Стиль штриховки/заливки слоя: набор семейств линий и опциональная фоновая заливка. */
export interface HatchStyle {
  /** Человекочитаемое имя (для UI и отладки; на идентичность стиля не влияет — см. `hatchKey`). */
  readonly name: string;
  /** Пустой список — только фоновая заливка (сплошная заливка). */
  readonly families: readonly HatchFamily[];
  /** Цвет фоновой заливки `#rrggbb` или `null` (без заливки). */
  readonly background: string | null;
}

export interface HatchFamilyInit {
  angle?: number;
  spacing?: number;
  lineWidth?: number;
  color?: string | null;
  dash?: readonly number[];
  offset?: number;
}

/**
 * Вход для создания штриховки. Три формы:
 * - простая: поля `angle` / `spacing` / `lineWidth` / `color` / `dash` / `offset` — одно семейство линий;
 * - кастомный паттерн: `families: [...]` (простые поля при этом не задаются);
 * - только `background` — сплошная заливка.
 */
export interface HatchStyleInit extends HatchFamilyInit {
  name?: string;
  background?: string | null;
  families?: readonly HatchFamilyInit[];
}

export const HATCH_DEFAULTS = Object.freeze({
  angle: 45,
  spacing: 3,
  lineWidth: 0.18,
  offset: 0,
});

export const MAX_HATCH_FAMILIES = 8;
export const MAX_HATCH_SPACING_MM = 1000;

const SIMPLE_KEYS = ['angle', 'spacing', 'lineWidth', 'color', 'dash', 'offset'] as const;

function finite(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new CadLayerError(field, `must be a finite number, got ${String(value)}`);
  }
  return value;
}

/** Угол линии в [0, 180): линия не имеет направления, поэтому 225° ≡ 45°. */
export function normalizeHatchAngle(angle: number): number {
  const a = ((angle % 180) + 180) % 180;
  return a === 0 ? 0 : a;
}

function createFamily(init: HatchFamilyInit, field: string): HatchFamily {
  const spacing = finite(init.spacing ?? HATCH_DEFAULTS.spacing, `${field}.spacing`);
  if (spacing <= 0 || spacing > MAX_HATCH_SPACING_MM) {
    throw new CadLayerError(`${field}.spacing`, `must be in range (0, ${MAX_HATCH_SPACING_MM}] mm, got ${spacing}`);
  }
  const lineWidth = finite(init.lineWidth ?? HATCH_DEFAULTS.lineWidth, `${field}.lineWidth`);
  if (lineWidth < 0) {
    throw new CadLayerError(`${field}.lineWidth`, `must be >= 0, got ${lineWidth}`);
  }
  const offset = finite(init.offset ?? HATCH_DEFAULTS.offset, `${field}.offset`);
  return Object.freeze({
    angle: normalizeHatchAngle(finite(init.angle ?? HATCH_DEFAULTS.angle, `${field}.angle`)),
    spacing,
    lineWidth,
    color: init.color === undefined || init.color === null ? null : normalizeHexColor(init.color, `${field}.color`),
    dash: init.dash === undefined ? Object.freeze([]) : parseDashPattern(init.dash, `${field}.dash`, true),
    offset,
  });
}

/** Создаёт и валидирует `HatchStyle`. Результат заморожен. */
export function createHatchStyle(init: HatchStyleInit = {}): HatchStyle {
  if (typeof init !== 'object' || init === null) {
    throw new CadLayerError('hatch', `must be an object, got ${String(init)}`);
  }
  const hasSimple = SIMPLE_KEYS.some((k) => init[k] !== undefined);

  let families: HatchFamily[];
  if (init.families !== undefined) {
    if (hasSimple) {
      throw new CadLayerError('hatch', 'use either "families" or the simple fields (angle, spacing, …), not both');
    }
    if (!Array.isArray(init.families) || init.families.length > MAX_HATCH_FAMILIES) {
      throw new CadLayerError('hatch.families', `must be an array of up to ${MAX_HATCH_FAMILIES} items`);
    }
    families = init.families.map((f, i) => createFamily(f, `hatch.families[${i}]`));
  } else if (hasSimple) {
    families = [createFamily(init, 'hatch')];
  } else {
    families = [];
  }

  const background =
    init.background === undefined || init.background === null
      ? null
      : normalizeHexColor(init.background, 'hatch.background');

  if (families.length === 0 && background === null) {
    throw new CadLayerError('hatch', 'is empty: set line fields, "families" or "background" (or use null for no hatch)');
  }

  if (init.name !== undefined && (typeof init.name !== 'string' || init.name.length > 100)) {
    throw new CadLayerError('hatch.name', 'must be a string up to 100 characters');
  }

  return Object.freeze({
    name: init.name ?? 'custom',
    families: Object.freeze(families),
    background,
  });
}

/** Стабильный структурный ключ стиля (без `name`): рендереры по нему дедуплицируют `<pattern>` / DXF-штриховки. */
export function hatchKey(style: HatchStyle): string {
  return JSON.stringify([
    style.families.map((f) => [f.angle, f.spacing, f.lineWidth, f.color, f.dash, f.offset]),
    style.background,
  ]);
}

export function isSameHatch(a: HatchStyle, b: HatchStyle): boolean {
  return hatchKey(a) === hatchKey(b);
}

/** Подставляет цвет слоя вместо `null` (ByLayer) в цветах линий. Фон не меняется. */
export function resolveHatchColors(style: HatchStyle, layerColor: string): HatchStyle {
  const color = normalizeHexColor(layerColor, 'layerColor');
  if (style.families.every((f) => f.color !== null)) return style;
  return Object.freeze({
    ...style,
    families: Object.freeze(style.families.map((f) => (f.color === null ? Object.freeze({ ...f, color }) : f))),
  });
}
