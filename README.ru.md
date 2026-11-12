# cad-blueprint

[![npm](https://img.shields.io/npm/v/cad-blueprint)](https://www.npmjs.com/package/cad-blueprint)
[![license](https://img.shields.io/npm/l/cad-blueprint)](./LICENSE)
[![demo](https://img.shields.io/badge/demo-online-047857)](https://maks-t.github.io/cad-blueprint/)

[English](https://github.com/Maks-T/cad-blueprint/blob/main/README.md) · **Русский**

**[Демо](https://maks-t.github.io/cad-blueprint/)** · **[Документация](https://maks-t.github.io/cad-blueprint/docs.html)** · **[npm](https://www.npmjs.com/package/cad-blueprint)**

Лёгкий параметрический 2D CAD-движок для конфигураторов: слои и штриховки, шрифты и текстовые стили (в т. ч. ГОСТ тип Б),
размерные стили, примитивы, размеры и выноски, блоки и видовые экраны, компактный JSON и контейнер `.vcad`, точные габариты,
экспорт в SVG и DXF, импорт DXF, интерактивный просмотр (в т. ч. для Filament) и мост к Three.js.
Ядро не зависит от DOM и работает в браузере, Node и воркерах.

## Демо

**https://maks-t.github.io/cad-blueprint/** — интерактивный пример на этой библиотеке:

- параметрический чертёж: ширина, глубина, радиус скругления, глубина Z-сечения;
- размерные стили (засечки, стрелки, засечки 45° по ГОСТ) и положение текста размера;
- масштабы от 1:1 до 1:20, слои, зум, панорамирование, выделение объектов;
- импорт DXF / SVG / `.vcad`, экспорт в JSON, компактный JSON и `.vcad`;
- 3D-вид на Three.js с подвижной секущей плоскостью.

Исходники демо — в [`demo/`](./demo), локальный запуск — `pnpm demo`, публикация на GitHub Pages — `pnpm demo:deploy`.

## Установка

```bash
pnpm add cad-blueprint          # three — необязательная peer-зависимость, нужна только для `cad-blueprint/three`
```

| Точка входа | Что внутри |
|---|---|
| `cad-blueprint` | всё ядро: настройки, таблицы, примитивы, размеры, блоки, документ, габариты, SVG, DXF, форматы |
| `cad-blueprint/svg`, `/dxf`, `/format` | только рендерер / DXF / кодеки (для лёгких бандлов) |
| `cad-blueprint/viewer` | `CadViewer` — просмотр с панорамированием и зумом (нужен DOM) |
| `cad-blueprint/three` | контуры → `THREE.Shape` / `ExtrudeGeometry`, сечения мешей плоскостью |
| `cad-blueprint/iife` | `dist/cad-blueprint.iife.js` для `<script>`: `window.CadBlueprint` (ядро + вьюпорт) |

## Быстрый старт

```ts
import { CadDocument, CadPath, polygon, insert, dimLinear, dimChain, leader, renderSvg, exportDxf, stringifyDocument } from 'cad-blueprint';

const doc = new CadDocument({ gost: true, settings: { scale: '1:10' } }); // шрифт, текстовый и размерный стиль ГОСТ
doc.layers.create('Контур', { color: '#0f172a', lineWeight: 0.5 });
doc.layers.create('Размеры', { color: '#047857', lineWeight: 0.18 });

const tread = CadPath.start(0, 0).right(300).up(40).left(300).close().filletAll(5).build();
doc.blocks.define('Ступень', [polygon(tread, { layer: 'Контур' })]);

doc.addSheet('Лестница', [
  ...[0, 1, 2, 3].map((i) => insert('Ступень', [i * 280, i * 170])),
  dimLinear([0, 0], [1140, 0], { at: [0, -150], layer: 'Размеры' }),
  dimChain([[0, 0], [280, 0], [560, 0], [840, 0]], { offset: -250, layer: 'Размеры' }),
  leader([[150, 40], [250, 160]], 'Ступень 300×40', { layer: 'Размеры' }),
]);

const svg = renderSvg(doc);                // <svg> c размерами в мм бумаги
const dxf = exportDxf(doc);                // DXF R2007 (UTF-8); { version: 'R2000' } — для старых программ
const json = stringifyDocument(doc);       // компактный JSON для БД
```

## Скрипты

```bash
pnpm typecheck   # строгая проверка: ядро без DOM + вьюпорт с DOM
pnpm test        # vitest (вьюпорт — в happy-dom)
pnpm build       # dist/: ESM + .d.ts по точкам входа и IIFE-сборка
pnpm demo        # демо и страница документации (vite, demo/), сборка: pnpm demo:build → dist-demo/
```

## Настройки чертежа

```ts
import { createDrawingSettings, createDrawingMetrics } from 'cad-blueprint';

const settings = createDrawingSettings({
  units: 'mm',              // 'mm' | 'cm' | 'm' | 'inch'
  precision: 3,             // знаков после запятой, 0…10
  scale: '1:50',            // или { numerator: 1, denominator: 50 }
  annotationScale: 'auto',  // 'auto' = как scale
  coordinateSystem: 'cartesian', // Y вверх | 'screen' — Y вниз
  padding: [10, 20],        // мм на бумаге: число | [верт, гор] | [t, r, b, l] | { left: 20 }
});

const m = createDrawingMetrics(settings);
m.modelToPaperMm(1000);     // 20   (1000 мм в модели → 20 мм на бумаге)
m.annotationToModel(3.5);   // 175  (текст 3.5 мм на бумаге → размер в модели)
m.paddingInModelUnits();    // поля в единицах модели
m.toScreen([10, 20]);       // [10, -20]
```

Настройки — иммутабельный JSON-совместимый объект; `updateDrawingSettings(s, patch)` возвращает новый,
`parseDrawingSettings(json)` валидирует данные из БД. Ошибки — `CadSettingsError` с полем `field`.

## Слои и штриховки

```ts
import { LayerManager, createHatchStyle } from 'cad-blueprint';

const layers = new LayerManager();            // слой "0" есть всегда
layers.create('Стены', {
  color: '#0f172a',                           // dxfColorIndex подберётся сам (или задайте вручную)
  lineWeight: 0.5,                            // мм на бумаге
  lineType: [12, 3, 2, 3],                    // пресет ('dashed', …) или свой паттерн, мм на бумаге
  opacity: 0.9,
  hatch: 'steel-45',                          // пресет, описание или готовый HatchStyle
});
layers.clone('Стены', 'Стены-скрытые', { lineType: 'dashed' });
layers.update('Стены', { locked: true });
layers.isolate('Стены');                      // показать только этот слой
layers.onChange((c) => console.log(c.type, c.layer.name));

// кастомная штриховка: несколько семейств линий + фон
const mesh = createHatchStyle({
  families: [{ angle: 45, spacing: 3 }, { angle: 135, spacing: 3, dash: [2, 1] }],
  background: '#f1f5f9',
});
```

Имена слоёв регистронезависимы, слой `"0"` нельзя удалить или переименовать, текущий слой удалить нельзя.
Толщины, штрихи и шаг штриховки заданы в **мм на бумаге** и от масштаба чертежа не зависят.
Состояние сохраняется через `JSON.stringify(layers)` и `LayerManager.fromJSON(...)`.

## Шрифты и текстовые стили

```ts
import {
  FontManager, TextStyleTable, registerGostTypeB,
  createDrawingMetrics, createDrawingSettings,
  measureTextInModel, placeText, projectTextOnAxis,
} from 'cad-blueprint';

const fonts = new FontManager();            // sans / serif / mono есть всегда
const styles = new TextStyleTable(fonts);   // стиль "Standard" есть всегда
registerGostTypeB(fonts, styles);           // шрифт 'gost-b' + стиль "GOST" (наклон 75° к строке, h = 3.5 мм)

// свой шрифт: веб-файл / Google Fonts для SVG, файл AutoCAD для DXF, запасные шрифты
fonts.create('pt-sans', {
  family: 'PT Sans',
  google: { weights: [400, 700] },          // или faces: [{ url: 'https://…/a.woff2', weight: 700 }]
  dxf: { ttf: 'arial.ttf' },
  fallbacks: ['sans'],                      // id из реестра или имя системного семейства
});
fonts.getCssFontFamily('pt-sans');          // '"PT Sans", "Arial", "Helvetica", sans-serif'
fonts.buildFontFaceCss(['pt-sans']);        // @import / @font-face для <style> в SVG
fonts.resolveDxfFont('gost-b');             // { ttf: 'isocpeur.ttf', … } для таблицы STYLE

styles.create('Размеры', { fontFamily: 'gost-b', height: 3.5, obliqueAngle: 15, lineHeight: 1.7 });

// габариты текста: высота из мм на бумаге → единицы модели по масштабу аннотаций
const drawing = createDrawingMetrics(createDrawingSettings({ scale: '1:50', annotationScale: '1:50' }));
const layout = measureTextInModel('1250', styles.require('Размеры'), fonts, drawing, { anchor: 'middle-center' });
layout.width;                                // ширина текста в единицах модели
const placed = placeText(layout, { position: [500, 120], rotationDeg: 0, padding: 20 });
projectTextOnAxis(placed, 0).length;         // длина разрыва размерной линии под текстом
```

`TextStyle.height` — высота **прописных** букв в мм на бумаге (как в ГОСТ и AutoCAD).
`obliqueAngle` отсчитывается **от вертикали** (как в AutoCAD / DXF): ГОСТ 75° к строке = `obliqueAngle: 15`
(`obliqueFromBaselineSlant(75)`). Метрики встроенных шрифтов приблизительные (Latin из таблиц Helvetica / Times,
кириллица и ГОСТ — оценка); для точного расчёта передайте метрики своего шрифта через `createFontMetrics`.

## Размерные стили

```ts
import {
  FontManager, TextStyleTable, DimStyleTable, registerGostDimStyle,
  formatDimensionText, layoutDimText, resolveDimStyleMetrics,
  createDrawingMetrics, createDrawingSettings,
} from 'cad-blueprint';

const fonts = new FontManager();
const textStyles = new TextStyleTable(fonts);
const dims = new DimStyleTable(textStyles);        // стиль "Standard" есть всегда
const gost = registerGostDimStyle(dims);            // шрифт gost-b + текстовый стиль GOST + размерный стиль GOST

// свой стиль: архитектурные засечки, текст в разрыве линии, горизонтальный
dims.create('Архитектура', {
  terminatorType: 'tick',            // 'arrow-closed' | 'arrow-open' | 'tick' ('oblique') | 'dot' | 'circle' | 'none'
  terminatorSize: 2.5,               // мм на бумаге
  dimLineOvershoot: 1.5,             // выход линии за выносные (только для tick)
  extensionOffset: 2,                // зазор от объекта
  extensionOvershoot: 2,             // выпуск за размерную линию
  hideSecondExtensionLine: false,
  textStyle: 'GOST',
  textPosition: 'centered',          // 'above' | 'centered' | 'outside'
  textOrientation: 'horizontal',     // 'aligned' | 'horizontal'
  suffix: ' мм',
  decimals: 0,
});

const drawing = createDrawingMetrics(createDrawingSettings({ scale: '1:50', annotationScale: '1:50' }));
const text = formatDimensionText(1250, gost);                          // '1250'; радиус: (…, 'radius') → 'R50', диаметр → 'Ø12', угол → '45°'
const placed = layoutDimText(text, gost, textStyles, drawing, { lineAngleDeg: 0 });
placed.rotationDeg; placed.anchor; placed.across;                     // поворот, опорная точка и смещение текста от линии
const m = resolveDimStyleMetrics(gost, drawing);
m.terminatorSize; m.extensionOvershoot; m.baselineSpacing;            // длины стиля в единицах модели
m.terminator.shapes;                                                  // рисунок окончания для SVG <marker> / DXF
```

Все длины стиля — **мм на бумаге**, в единицы модели они переводятся по масштабу аннотаций (`resolveDimStyleMetrics`).
`layoutDimText` возвращает положение текста в системе размерной линии (вдоль / поперёк), поворот (текст не «вверх ногами»)
и разрыв линии `lineBreak` для положения `centered`. Размерный стиль хранит *имя* текстового стиля; удалённые текстовые стили
показывает `dims.missingTextStyles()`. Состояние сохраняется через `JSON.stringify(dims)` и `DimStyleTable.fromJSON(textStyles, …)`.

## Построитель контуров

```ts
import { CadPath } from 'cad-blueprint';

// «Черепашья» графика: один CadPath — один непрерывный контур из отрезков и дуг
const step = CadPath.start(0, 0)           // начальная точка (по умолчанию 0, 0)
  .right(280).up(170)                      // right / left / up / down, lineTo, lineBy, polar(длина, угол°)
  .fillet(12)                              // скруглить угол между двумя последними сегментами
  .left(240).down(30).left(40)
  .close()                                 // замкнуть (добавит недостающий сегмент)
  .chamfer(8, 8, { vertex: 0 })            // фаска на начальной вершине: d1 по предыдущему, d2 по следующему сегменту
  .build();

step.vertices;   // [[x, y, bulge?], …] — формат вершин Polyline (шаг 2.1.2); у замкнутого контура первая вершина не повторяется
step.segments;   // те же сегменты явно: { type: 'line' | 'arc', from, to, center, radius, … }
step.length;     // длина контура (периметр, если замкнут)

// Дуги: по радиусу, bulge, центру, трём точкам или по касательной к предыдущему сегменту
CadPath.start(0, 0).right(40)
  .arcTo(80, 40, { tangent: true })                    // плавное продолжение
  .arcBy(20, 0, { radius: 10, sweep: 'cw' })           // sweep: 'ccw' | 'cw', large: true — дуга больше полуокружности
  .arcTo(150, 30, { through: [120, 50] });             // по трём точкам

// Все углы сразу: прямоугольник со скруглёнными углами
CadPath.start(0, 0).right(100).up(60).left(100).close().filletAll(15).build();
```

`fillet` / `chamfer` по умолчанию работают с углом между двумя последними сегментами (у замкнутого контура — с начальной вершиной);
любой другой угол выбирается номером вершины `{ vertex }` (0 — начало, i — конец i-го сегмента). Сопряжения применяются при `build()`,
поэтому номера вершин не сдвигаются. Сопряжения поддерживают только углы между двумя **прямыми** сегментами; `filletAll` / `chamferAll`
стыки на одной прямой и стыки с дугами пропускают.
В системе координат `screen` (Y вниз) `up` идёт к −Y, а `'ccw'` — против часовой стрелки на экране: `CadPath.start(0, 0, { coordinateSystem: 'screen' })`.
Ошибки — `CadPathError` с полем `field`. Готовый контур можно снова превратить в `CadPath` через `CadPath.fromVertices(vertices, closed)`.

## Соглашения: оси и углы

- Координаты — в единицах модели (`settings.units`); толщины, штрихи, шаг штриховки, высота текста, длины размерного
  стиля — **мм на бумаге** и пересчитываются по масштабу (`scale` / `annotationScale`).
- Система `cartesian` — Y вверх (как DXF), `screen` — Y вниз (как SVG). SVG-рендерер и DXF-экспорт отражают ось сами.
- **Углы геометрии — в числовой плоскости** (как в DXF): дуги, эллипсы, `angleDeg` размеров, `rotationDeg` вставок и
  видовых экранов. В системе `screen` положительный угол на экране выглядит как поворот по часовой.
- **Поворот текста — визуальный**: `rotationDeg: 90` — текст читается снизу вверх в обеих системах.
- `null` в цвете / толщине / типе линии объекта — «по слою». Объекты блока на слое `"0"` рисуются на слое вставки.

## Примитивы

```ts
import { CadPath, point, line, circle, arc, arcThrough, ellipse, rect, polyline, polygon, text, mtext, spline, bezier, breakLine, fitBezier } from 'cad-blueprint';

line([0, 0], [100, 0], { layer: 'Контур', color: '#ff0000', lineWeight: 0.5, lineType: 'dashed', id: 'edge-1' });
circle([50, 50], 10, { fill: 'hatch' });                       // fill: 'hatch' (штриховка слоя) | 'solid' | '#rrggbb'
arc([0, 0], 20, 0, 90);                                         // по центру и углам (против часовой по умолчанию)
arcThrough([10, 0], [0, 10], [-10, 0]);                         // по трём точкам
ellipse([0, 0], 40, 20, { rotationDeg: 30, startAngleDeg: 0, endAngleDeg: 180 });
rect(0, 0, 300, 40, { cornerRadius: 5 });
polygon(CadPath.start(0, 0).right(100).up(50).left(100).close().build(), { holes: [[[10, 10], [20, 10], [20, 20]]], fill: 'hatch' });
text([0, 0], 'Однострочный', { style: 'GOST', height: 5, anchor: 'middle-center', rotationDeg: 90 });
mtext([0, 0], 'Строка 1\nСтрока 2', { anchor: 'top-right' });  // 9 опорных точек
spline([[0, 0], [10, 20], [20, -5], [30, 0]], { degree: 3 });   // B-сплайн 1…3, узлы по умолчанию — зажатые равномерные
fitBezier([[0, 0], [10, 5], [20, -5]]);                         // гладкая кривая через точки
breakLine([0, -50], [0, 50], { waves: 2 });                     // волнистая линия обрыва (ГОСТ 2.303)
```

Объекты неизменяемы и JSON-совместимы: `parseEntity(JSON.parse(JSON.stringify(e)))` вернёт тот же объект (с полной проверкой;
неизвестное поле — ошибка). `transformPrimitive(e, matrix)` применяет аффинную матрицу (неравномерный масштаб превращает
окружность в эллипс).

## Размеры и выноски

```ts
import { dimLinear, dimAligned, dimChain, dimBaseline, dimAngular, dimRadius, dimDiameter, leader, buildDimensionGeometry } from 'cad-blueprint';

dimLinear([0, 0], [1000, 0], { offset: -100 });                          // горизонтальный; direction: 'vertical' | угол
dimLinear([0, 0], [0, 500], { direction: 'vertical', at: [-100, 0] });   // `at` — точка, через которую идёт размерная линия
dimAligned([0, 0], [300, 400], { offset: 50 });                          // параллельно наклонной грани
dimChain([[0, 0], [280, 0], [560, 0]], { offset: -200, texts: [null, '<> (2 шт.)'] });
dimBaseline([0, 0], [[300, 0], [600, 0], [1000, 0]], { offset: -200 });  // этажерка с шагом baselineSpacing стиля
dimAngular([0, 0], [100, 0], [0, 100], { radius: 60 });                  // 90°
dimRadius([0, 0], 50, { angleDeg: 45 });                                 // R50
dimDiameter([0, 0], 6, { angleDeg: 0 });                                 // Ø12
leader([[0, 0], [40, 40]], 'Узел А', { shelfLength: 20 });               // выноска с полкой

const g = buildDimensionGeometry(dim, doc.context());                    // линии, окончания, тексты в координатах чертежа
```

Стиль — имя из `DimStyleTable` (`style: null` — текущий). Если текст не помещается, он уходит за второе окончание; при
малых размерах стрелки выносятся наружу. `text: '<> мм'` — свой текст, `<>` заменяется значением.

## Блоки, вставки и видовые экраны

```ts
import { insert, viewport } from 'cad-blueprint';

doc.blocks.define('Ступень', entities, { basePoint: [150, 0] });         // циклические вставки запрещены
insert('Ступень', [0, 170], { rotationDeg: 90, scaleX: -1, layer: 'Оси' }); // зеркало, поворот, слой вставки

// Несколько независимых видов на одном листе: свой масштаб, сдвиг, обрезка и подпись.
viewport([insert('Ступень'), dimLinear([0, 0], [300, 0], { offset: -30 })], {
  position: [0, -900], scale: '1:2', title: 'Узел А (1:2)', clip: { minX: -40, minY: -70, maxX: 400, maxY: 100 }, frame: true,
});
```

Внутри экрана тексты, стрелки и толщины считаются по его масштабу — на бумаге они того же размера, что и снаружи.

## Документ

```ts
const doc = new CadDocument({ gost: true, settings: { scale: '1:20', coordinateSystem: 'screen' } });
const sheet = doc.addSheet('Фасад', entities);  // sheet.add(...), remove(id), replace(id, e), find(id), set([...])
doc.audit();                                    // несуществующие слои, стили, блоки, шрифты
doc.context();                                  // RenderContext для рендереров и габаритов
```

## Форматы: компактный JSON и `.vcad`

```ts
import { stringifyDocument, decodeDocument, packVcad, unpackVcad, packBlockLibrary, unpackBlockLibrary } from 'cad-blueprint';

const json = stringifyDocument(doc);            // tuple-JSON: в несколько раз меньше JSON.stringify(doc), координаты по precision
const same = decodeDocument(json);              // полная проверка таблиц и объектов

const bytes = packVcad(doc, { assets: { 'fonts/gost.woff2': fontBytes }, meta: { order: 42 } }); // ZIP
const { document, blocks, assets, manifest } = unpackVcad(bytes);
const library = unpackBlockLibrary(packBlockLibrary(doc.blocks)); // библиотека блоков без листов
```

`.vcad`: `manifest.json`, `document.json` (компактный JSON без блоков), `blocks/0001.json` (по файлу на блок, слои — именами),
`assets/…`. Распаковка ограничена 256 МБ и 10 000 файлами.

## Габариты

```ts
import { entitiesBounds, entityBounds, blockBounds } from 'cad-blueprint';
entitiesBounds(sheet.entities, doc.context());  // дуги, эллипсы, сплайны — по экстремумам; текст — по метрикам; вставки и экраны — с матрицами
```

## SVG

```ts
import { renderSvg, renderSvgResult } from 'cad-blueprint';
renderSvg(doc, { sheet: 'Фасад', background: '#fff' });   // size: 'paper' (мм) | 'none' | { width }; padding; idPrefix
```

В `<defs>`: `<style>` (шрифты `@font-face` / Google Fonts, классы слоёв), `<marker>` окончаний, `<pattern>` штриховок,
`<symbol>` блоков (`<use>` для вставок), `<clipPath>` экранов. `hiddenLayers: 'hide'` выводит скрытые слои с `display:none`.

## DXF

```ts
import { exportDxf, importDxf, parseDxfToBlock } from 'cad-blueprint';

exportDxf(doc);                        // R2007 / UTF-8: LAYER, LTYPE, STYLE, BLOCKS, ENTITIES, HATCH; { version: 'R2000' } — \U+XXXX
const block = parseDxfToBlock(fileBytes, { name: 'Профиль 40×30', fill: 'hatch', basePoint: 'min' });
const { block: b, layers, warnings } = importDxf(fileBytes, { units: 'mm', layer: 'Профиль' });
```

Размеры записываются разложенными (LINE / ARC / SOLID / TEXT), видовые экраны — блоками `_VIEWPORT<n>`. Импорт: LINE, POINT,
CIRCLE, ARC, ELLIPSE, LWPOLYLINE, POLYLINE (2D), SPLINE, SOLID, TEXT, MTEXT, INSERT (раскрывается); единицы по `$INSUNITS`,
вложенные контуры одного слоя становятся вырезами.

## Вьюпорт (`cad-blueprint/viewer`)

```ts
import { CadViewer } from 'cad-blueprint/viewer';

const viewer = new CadViewer(container, doc, { toolbar: true });  // источник: документ, компактный JSON (строка/объект) или .vcad
viewer.fitToView(); viewer.zoomIn(); viewer.setLayerVisible('Оси', false); viewer.isolateLayer('Контур');
viewer.on((e) => { if (e.type === 'select') console.log(e.id, e.point); });   // клик по объекту с id
viewer.downloadSvg('stairs'); viewer.downloadDxf('stairs');
viewer.render({ keepView: true });   // после изменения документа
```

Колесо — зум к курсору, перетаскивание — панорама, щипок — зум на сенсорных экранах, двойной клик — «вписать».

### Filament 5 (Blade + Alpine.js, без сборщика)

```blade
<div wire:ignore style="height: 480px"
     x-data
     x-init="CadBlueprint.mountCadViewer($el, @js($record->drawing_json), { toolbar: true, fileName: 'order-{{ $record->id }}' })">
</div>
@assets
  <script src="{{ asset('js/cad-blueprint.iife.js') }}"></script>
@endassets
```

`drawing_json` — строка `stringifyDocument(doc)` из БД. Файл `dist/cad-blueprint.iife.js` скопируйте в `public/js`
(или подключите через `FilamentAsset::register([Js::make('cad-blueprint', …)])`).

## Three.js (`cad-blueprint/three`)

```ts
import { blockToShapes, blockToExtrudeGeometry, sectionObject, sectionToBlock } from 'cad-blueprint/three';
import { Mesh, Plane, Vector3 } from 'three';

const geometry = blockToExtrudeGeometry(profileBlock, { depth: 2000 });      // вырезы → shape.holes, дуги — absarc
const section = sectionObject(scene, new Plane(new Vector3(1, 0, 0), -500)); // сечение мешей плоскостью
doc.blocks.add(sectionToBlock(section, 'Разрез А-А', { layer: 'Сечение' }));  // замкнутые контуры с вырезами и штриховкой
```

## Сборка и публикация

```bash
pnpm build                 # tsup → dist/*.js, dist/*.d.ts, dist/cad-blueprint.iife.js
npm login                  # аккаунт maxim.tsatsura
pnpm publish --access public
```

В репозитории `exports` указывают на исходники (`src/*.ts`) — так пакет работает в workspace без сборки. При публикации
pnpm подменяет их на `publishConfig.exports` (`dist/`); публиковать нужно через `pnpm publish`, а не `npm publish`.

## Структура

```
src/
  index.ts            публичный API (ядро)
  settings/           1.1  настройки чертежа
  layers/             1.2  слои, типы линий, штриховки
  typography/         1.3  шрифты, текстовые стили, габариты текста
  dim-styles/         1.4  размерные стили
  geometry/           2.1  векторы, матрицы, габариты кривых, вложенность контуров
  primitives/         2.1  Point … Spline, Text / MText, преобразования
  path-builder/       2.2  CadPath
  dimensions/         3.1  размеры и выноски
  blocks/             3.2  блоки, вставки, видовые экраны
  entities/                объединение типов объектов, parseEntity
  document/                CadDocument, листы, RenderContext
  render/                  обход объектов с раскрытием блоков
  format/             4    компактный JSON, .vcad
  bounds/             5.1  габариты
  svg/                5.2  SVG-рендерер
  dxf/                5.3  DXF: экспорт и импорт
  viewer/             5.4  CadViewer (DOM)
  three/              6.1  мост к Three.js
tests/
docs/reports/         отчёты по этапам
```
