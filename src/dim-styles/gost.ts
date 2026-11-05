import { GOST_TEXT_STYLE_NAME, registerGostTypeB } from '../typography';
import type { DimStyle, DimStyleInit } from './dim-style';
import type { DimStyleTable } from './dim-style-table';

/** Имя размерного стиля ГОСТ. */
export const GOST_DIM_STYLE_NAME = 'GOST';

/**
 * Размерный стиль по ГОСТ 2.307: закрытая стрелка с углом 20°, выпуск выносных линий за размерную 2 мм,
 * расстояние между параллельными размерными линиями 7 мм, текст над линией вдоль неё, шрифт типа Б,
 * десятичная запятая. Длина стрелки (3.5 мм) и зазор текста (1 мм) — ориентировочные: ГОСТ связывает их с толщиной линий.
 */
export const GOST_DIM_STYLE: DimStyleInit = Object.freeze({
  terminatorType: 'arrow-closed',
  terminatorSize: 3.5,
  arrowAngle: 20,
  dimLineOvershoot: 0,
  baselineSpacing: 7,
  extensionOffset: 0,
  extensionOvershoot: 2,
  textStyle: GOST_TEXT_STYLE_NAME,
  textPosition: 'above',
  textOrientation: 'aligned',
  textGap: 1,
  decimals: 0,
  angleDecimals: 1,
  decimalSeparator: ',',
  trimTrailingZeros: true,
} as const);

/**
 * Подключает размерный стиль `GOST`, а при необходимости и шрифт `gost-b` с текстовым стилем `GOST`
 * (см. `registerGostTypeB`) — в таблицы, с которыми связан `dimStyles`. Уже существующие `gost-b`, `GOST` и размерный
 * стиль `GOST` не перезаписываются. Возвращает размерный стиль `GOST`.
 */
export function registerGostDimStyle(dimStyles: DimStyleTable): DimStyle {
  registerGostTypeB(dimStyles.textStyles.fonts, dimStyles.textStyles);
  return dimStyles.get(GOST_DIM_STYLE_NAME) ?? dimStyles.create(GOST_DIM_STYLE_NAME, GOST_DIM_STYLE);
}
