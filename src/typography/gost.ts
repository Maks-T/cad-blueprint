import type { FontDefinition } from './font';
import type { FontManager } from './font-manager';
import { obliqueFromBaselineSlant } from './text-style';
import type { TextStyle, TextStyleInit } from './text-style';
import type { TextStyleTable } from './text-style-table';

/** Идентификатор чертёжного шрифта ГОСТ тип Б в реестре. */
export const GOST_TYPE_B_FONT_ID = 'gost-b';
/** Имя текстового стиля ГОСТ. */
export const GOST_TEXT_STYLE_NAME = 'GOST';

/**
 * Шрифт ГОСТ 2.304 тип Б. Файл шрифта в библиотеку не входит (лицензии), поэтому в SVG браузер возьмёт
 * первый доступный из цепочки `GOST type B → ISOCPEUR → osifont → Arial Narrow → sans-serif`;
 * чтобы форма букв была «чертёжной» везде, добавьте `faces` / `google` со своим файлом.
 *
 * `dxf.ttf = 'isocpeur.ttf'` — имя файла из стандартной поставки AutoCAD; проверьте его на вашей установке
 * или задайте своё (`shx: 'gost.shx'` и т. п.).
 */
export const GOST_TYPE_B_FONT: FontDefinition = Object.freeze({
  id: GOST_TYPE_B_FONT_ID,
  family: 'GOST type B',
  generic: 'sans-serif',
  fallbacks: Object.freeze(['ISOCPEUR', 'osifont', 'Arial Narrow']),
  dxf: Object.freeze({ ttf: 'isocpeur.ttf' }),
  metrics: 'gost-b',
});

/** Стиль ГОСТ: тип Б с наклоном 75° к основанию строки (`obliqueAngle = 15`), h = 3.5 мм, шаг строк 1.7 h (ГОСТ 2.304). */
export const GOST_TYPE_B_STYLE: TextStyleInit = Object.freeze({
  fontFamily: GOST_TYPE_B_FONT_ID,
  height: 3.5,
  letterSpacing: 0,
  lineHeight: 1.7,
  obliqueAngle: obliqueFromBaselineSlant(75),
  widthFactor: 1,
});

/**
 * Подключает шрифт и стиль ГОСТ тип Б. Уже существующие `gost-b` / `GOST` не перезаписываются.
 * Возвращает стиль `GOST`.
 */
export function registerGostTypeB(fonts: FontManager, styles?: TextStyleTable): TextStyle | null {
  if (!fonts.has(GOST_TYPE_B_FONT_ID)) {
    const { id, ...props } = GOST_TYPE_B_FONT;
    fonts.create(id, props);
  }
  if (!styles) return null;
  return styles.get(GOST_TEXT_STYLE_NAME) ?? styles.create(GOST_TEXT_STYLE_NAME, GOST_TYPE_B_STYLE);
}
