# cad-blueprint

[![npm](https://img.shields.io/npm/v/cad-blueprint)](https://www.npmjs.com/package/cad-blueprint)
[![license](https://img.shields.io/npm/l/cad-blueprint)](./LICENSE)
[![demo](https://img.shields.io/badge/demo-online-047857)](https://maks-t.github.io/cad-blueprint/)

**English** · [Русский](https://github.com/Maks-T/cad-blueprint/blob/main/README.ru.md)

**[Demo](https://maks-t.github.io/cad-blueprint/)** · **[Documentation](https://maks-t.github.io/cad-blueprint/docs.html)** · **[npm](https://www.npmjs.com/package/cad-blueprint)**

Lightweight parametric 2D CAD engine for configurators: layers and hatches, fonts and text styles (including GOST type B),
dimension styles, primitives, dimensions and leaders, blocks and viewports, compact JSON and the `.vcad` container, exact bounds,
SVG and DXF export, DXF import, an interactive viewer (including for Filament) and a Three.js bridge.
The core has no DOM dependency and runs in the browser, Node and web workers.

## Demo

**https://maks-t.github.io/cad-blueprint/** — an interactive example built with this library:

- parametric drawing: width, depth, corner radius, Z-section depth;
- dimension styles (ticks, arrows, 45° GOST ticks) and dimension text placement;
- scales from 1:1 to 1:20, layers, zoom, pan, object selection;
- DXF / SVG / `.vcad` import, export to JSON, compact JSON and `.vcad`;
- Three.js 3D view with a movable section plane.

Demo sources live in [`demo/`](./demo); run locally with `pnpm demo`, publish to GitHub Pages with `pnpm demo:deploy`.

## Installation

```bash
pnpm add cad-blueprint          # three is an optional peer dependency, needed only for `cad-blueprint/three`
```

| Entry point | Contents |
|---|---|
| `cad-blueprint` | the whole core: settings, tables, primitives, dimensions, blocks, document, bounds, SVG, DXF, formats |
| `cad-blueprint/svg`, `/dxf`, `/format` | renderer / DXF / codecs only (for small bundles) |
| `cad-blueprint/viewer` | `CadViewer` — pan & zoom viewer (requires DOM) |
| `cad-blueprint/three` | contours → `THREE.Shape` / `ExtrudeGeometry`, plane sections of meshes |
| `cad-blueprint/iife` | `dist/cad-blueprint.iife.js` for `<script>`: `window.CadBlueprint` (core + viewer) |

## Quick start

```ts
import { CadDocument, CadPath, polygon, insert, dimLinear, dimChain, leader, renderSvg, exportDxf, stringifyDocument } from 'cad-blueprint';

const doc = new CadDocument({ gost: true, settings: { scale: '1:10' } }); // GOST font, text style and dimension style
doc.layers.create('Outline', { color: '#0f172a', lineWeight: 0.5 });
doc.layers.create('Dimensions', { color: '#047857', lineWeight: 0.18 });

const tread = CadPath.start(0, 0).right(300).up(40).left(300).close().filletAll(5).build();
doc.blocks.define('Tread', [polygon(tread, { layer: 'Outline' })]);

doc.addSheet('Stairs', [
  ...[0, 1, 2, 3].map((i) => insert('Tread', [i * 280, i * 170])),
  dimLinear([0, 0], [1140, 0], { at: [0, -150], layer: 'Dimensions' }),
  dimChain([[0, 0], [280, 0], [560, 0], [840, 0]], { offset: -250, layer: 'Dimensions' }),
  leader([[150, 40], [250, 160]], 'Tread 300×40', { layer: 'Dimensions' }),
]);

const svg = renderSvg(doc);                // <svg> sized in paper millimetres
const dxf = exportDxf(doc);                // DXF R2007 (UTF-8); { version: 'R2000' } for older software
const json = stringifyDocument(doc);       // compact JSON for a database
```

## Scripts

```bash
pnpm typecheck   # strict check: DOM-free core + DOM viewer
pnpm test        # vitest (viewer runs in happy-dom)
pnpm build       # dist/: ESM + .d.ts per entry point and an IIFE build
pnpm demo        # demo and docs page (vite, demo/); build: pnpm demo:build → dist-demo/
```

## Drawing settings

```ts
import { createDrawingSettings, createDrawingMetrics } from 'cad-blueprint';

const settings = createDrawingSettings({
  units: 'mm',              // 'mm' | 'cm' | 'm' | 'inch'
  precision: 3,             // decimal places, 0…10
  scale: '1:50',            // or { numerator: 1, denominator: 50 }
  annotationScale: 'auto',  // 'auto' = same as scale
  coordinateSystem: 'cartesian', // Y up | 'screen' — Y down
  padding: [10, 20],        // paper mm: number | [vert, horiz] | [t, r, b, l] | { left: 20 }
});

const m = createDrawingMetrics(settings);
m.modelToPaperMm(1000);     // 20   (1000 mm in the model → 20 mm on paper)
m.annotationToModel(3.5);   // 175  (3.5 mm text on paper → model size)
m.paddingInModelUnits();    // padding in model units
m.toScreen([10, 20]);       // [10, -20]
```

Settings are an immutable JSON-compatible object; `updateDrawingSettings(s, patch)` returns a new one,
`parseDrawingSettings(json)` validates data loaded from a database. Errors are `CadSettingsError` with a `field` property.

## Layers and hatches

```ts
import { LayerManager, createHatchStyle } from 'cad-blueprint';

const layers = new LayerManager();            // layer "0" always exists
layers.create('Walls', {
  color: '#0f172a',                           // dxfColorIndex is picked automatically (or set it yourself)
  lineWeight: 0.5,                            // paper mm
  lineType: [12, 3, 2, 3],                    // preset ('dashed', …) or a custom pattern, paper mm
  opacity: 0.9,
  hatch: 'steel-45',                          // preset, description or a ready HatchStyle
});
layers.clone('Walls', 'Walls-hidden', { lineType: 'dashed' });
layers.update('Walls', { locked: true });
layers.isolate('Walls');                      // show only this layer
layers.onChange((c) => console.log(c.type, c.layer.name));

// custom hatch: several line families + background
const mesh = createHatchStyle({
  families: [{ angle: 45, spacing: 3 }, { angle: 135, spacing: 3, dash: [2, 1] }],
  background: '#f1f5f9',
});
```

Layer names are case-insensitive; layer `"0"` cannot be deleted or renamed, and the current layer cannot be deleted.
Line weights, dashes and hatch spacing are in **paper millimetres** and do not depend on the drawing scale.
State is saved with `JSON.stringify(layers)` and restored with `LayerManager.fromJSON(...)`.

## Fonts and text styles

```ts
import {
  FontManager, TextStyleTable, registerGostTypeB,
  createDrawingMetrics, createDrawingSettings,
  measureTextInModel, placeText, projectTextOnAxis,
} from 'cad-blueprint';

const fonts = new FontManager();            // sans / serif / mono always exist
const styles = new TextStyleTable(fonts);   // style "Standard" always exists
registerGostTypeB(fonts, styles);           // font 'gost-b' + style "GOST" (75° slant to the baseline, h = 3.5 mm)

// custom font: web file / Google Fonts for SVG, AutoCAD font file for DXF, fallbacks
fonts.create('pt-sans', {
  family: 'PT Sans',
  google: { weights: [400, 700] },          // or faces: [{ url: 'https://…/a.woff2', weight: 700 }]
  dxf: { ttf: 'arial.ttf' },
  fallbacks: ['sans'],                      // registry id or a system family name
});
fonts.getCssFontFamily('pt-sans');          // '"PT Sans", "Arial", "Helvetica", sans-serif'
fonts.buildFontFaceCss(['pt-sans']);        // @import / @font-face for <style> in SVG
fonts.resolveDxfFont('gost-b');             // { ttf: 'isocpeur.ttf', … } for the STYLE table

styles.create('Dimensions', { fontFamily: 'gost-b', height: 3.5, obliqueAngle: 15, lineHeight: 1.7 });

// text extents: height in paper mm → model units via the annotation scale
const drawing = createDrawingMetrics(createDrawingSettings({ scale: '1:50', annotationScale: '1:50' }));
const layout = measureTextInModel('1250', styles.require('Dimensions'), fonts, drawing, { anchor: 'middle-center' });
layout.width;                                // text width in model units
const placed = placeText(layout, { position: [500, 120], rotationDeg: 0, padding: 20 });
projectTextOnAxis(placed, 0).length;         // length of the dimension line break under the text
```

`TextStyle.height` is the **cap height** in paper mm (as in GOST and AutoCAD).
`obliqueAngle` is measured **from the vertical** (as in AutoCAD / DXF): GOST 75° to the baseline = `obliqueAngle: 15`
(`obliqueFromBaselineSlant(75)`). Built-in font metrics are approximate (Latin from Helvetica / Times tables,
Cyrillic and GOST are estimates); for exact layout pass your font's metrics via `createFontMetrics`.

## Dimension styles

```ts
import {
  FontManager, TextStyleTable, DimStyleTable, registerGostDimStyle,
  formatDimensionText, layoutDimText, resolveDimStyleMetrics,
  createDrawingMetrics, createDrawingSettings,
} from 'cad-blueprint';

const fonts = new FontManager();
const textStyles = new TextStyleTable(fonts);
const dims = new DimStyleTable(textStyles);        // style "Standard" always exists
const gost = registerGostDimStyle(dims);            // gost-b font + GOST text style + GOST dimension style

// custom style: architectural ticks, text in a line break, horizontal
dims.create('Architectural', {
  terminatorType: 'tick',            // 'arrow-closed' | 'arrow-open' | 'tick' ('oblique') | 'dot' | 'circle' | 'none'
  terminatorSize: 2.5,               // paper mm
  dimLineOvershoot: 1.5,             // dimension line extension past extension lines (tick only)
  extensionOffset: 2,                // gap from the object
  extensionOvershoot: 2,             // extension past the dimension line
  hideSecondExtensionLine: false,
  textStyle: 'GOST',
  textPosition: 'centered',          // 'above' | 'centered' | 'outside'
  textOrientation: 'horizontal',     // 'aligned' | 'horizontal'
  suffix: ' mm',
  decimals: 0,
});

const drawing = createDrawingMetrics(createDrawingSettings({ scale: '1:50', annotationScale: '1:50' }));
const text = formatDimensionText(1250, gost);                          // '1250'; radius: (…, 'radius') → 'R50', diameter → 'Ø12', angle → '45°'
const placed = layoutDimText(text, gost, textStyles, drawing, { lineAngleDeg: 0 });
placed.rotationDeg; placed.anchor; placed.across;                     // rotation, anchor and text offset from the line
const m = resolveDimStyleMetrics(gost, drawing);
m.terminatorSize; m.extensionOvershoot; m.baselineSpacing;            // style lengths in model units
m.terminator.shapes;                                                  // terminator shape for SVG <marker> / DXF
```

All style lengths are **paper millimetres**, converted to model units via the annotation scale (`resolveDimStyleMetrics`).
`layoutDimText` returns the text position in the dimension line frame (along / across), its rotation (text is never upside down)
and the `lineBreak` for the `centered` position. A dimension style stores the *name* of its text style; deleted text styles
are reported by `dims.missingTextStyles()`. State is saved with `JSON.stringify(dims)` and restored with `DimStyleTable.fromJSON(textStyles, …)`.

## Path builder

```ts
import { CadPath } from 'cad-blueprint';

// Turtle graphics: one CadPath is one continuous contour of lines and arcs
const step = CadPath.start(0, 0)           // start point (default 0, 0)
  .right(280).up(170)                      // right / left / up / down, lineTo, lineBy, polar(length, angle°)
  .fillet(12)                              // round the corner between the last two segments
  .left(240).down(30).left(40)
  .close()                                 // close (adds the missing segment)
  .chamfer(8, 8, { vertex: 0 })            // chamfer at the start vertex: d1 along the previous, d2 along the next segment
  .build();

step.vertices;   // [[x, y, bulge?], …] — Polyline vertex format (step 2.1.2); a closed contour does not repeat the first vertex
step.segments;   // the same segments explicitly: { type: 'line' | 'arc', from, to, center, radius, … }
step.length;     // contour length (perimeter if closed)

// Arcs: by radius, bulge, center, three points or tangent to the previous segment
CadPath.start(0, 0).right(40)
  .arcTo(80, 40, { tangent: true })                    // smooth continuation
  .arcBy(20, 0, { radius: 10, sweep: 'cw' })           // sweep: 'ccw' | 'cw', large: true — arc larger than a semicircle
  .arcTo(150, 30, { through: [120, 50] });             // through three points

// All corners at once: a rounded rectangle
CadPath.start(0, 0).right(100).up(60).left(100).close().filletAll(15).build();
```

By default `fillet` / `chamfer` work on the corner between the last two segments (for a closed contour, on the start vertex);
any other corner is selected by vertex index `{ vertex }` (0 is the start, i is the end of the i-th segment). Fillets are applied at `build()`,
so vertex indices do not shift. Fillets support only corners between two **straight** segments; `filletAll` / `chamferAll`
skip collinear joints and joints with arcs.
In the `screen` coordinate system (Y down) `up` goes towards −Y and `'ccw'` is counter-clockwise on screen: `CadPath.start(0, 0, { coordinateSystem: 'screen' })`.
Errors are `CadPathError` with a `field` property. A finished contour can be turned back into a `CadPath` with `CadPath.fromVertices(vertices, closed)`.

## Conventions: axes and angles

- Coordinates are in model units (`settings.units`); line weights, dashes, hatch spacing, text height and dimension style
  lengths are **paper millimetres** and are scaled by `scale` / `annotationScale`.
- `cartesian` is Y up (like DXF), `screen` is Y down (like SVG). The SVG renderer and DXF export flip the axis themselves.
- **Geometry angles are in the numeric plane** (as in DXF): arcs, ellipses, dimension `angleDeg`, `rotationDeg` of inserts and
  viewports. In the `screen` system a positive angle looks clockwise on screen.
- **Text rotation is visual**: `rotationDeg: 90` reads bottom-to-top in both systems.
- `null` colour / line weight / line type on an entity means "by layer". Block entities on layer `"0"` are drawn on the insert's layer.

## Primitives

```ts
import { CadPath, point, line, circle, arc, arcThrough, ellipse, rect, polyline, polygon, text, mtext, spline, bezier, breakLine, fitBezier } from 'cad-blueprint';

line([0, 0], [100, 0], { layer: 'Outline', color: '#ff0000', lineWeight: 0.5, lineType: 'dashed', id: 'edge-1' });
circle([50, 50], 10, { fill: 'hatch' });                       // fill: 'hatch' (layer hatch) | 'solid' | '#rrggbb'
arc([0, 0], 20, 0, 90);                                         // by center and angles (counter-clockwise by default)
arcThrough([10, 0], [0, 10], [-10, 0]);                         // through three points
ellipse([0, 0], 40, 20, { rotationDeg: 30, startAngleDeg: 0, endAngleDeg: 180 });
rect(0, 0, 300, 40, { cornerRadius: 5 });
polygon(CadPath.start(0, 0).right(100).up(50).left(100).close().build(), { holes: [[[10, 10], [20, 10], [20, 20]]], fill: 'hatch' });
text([0, 0], 'Single line', { style: 'GOST', height: 5, anchor: 'middle-center', rotationDeg: 90 });
mtext([0, 0], 'Line 1\nLine 2', { anchor: 'top-right' });      // 9 anchor points
spline([[0, 0], [10, 20], [20, -5], [30, 0]], { degree: 3 });   // B-spline of degree 1…3, default knots are clamped uniform
fitBezier([[0, 0], [10, 5], [20, -5]]);                         // smooth curve through points
breakLine([0, -50], [0, 50], { waves: 2 });                     // wavy break line (GOST 2.303)
```

Entities are immutable and JSON-compatible: `parseEntity(JSON.parse(JSON.stringify(e)))` returns the same entity (fully validated;
an unknown field is an error). `transformPrimitive(e, matrix)` applies an affine matrix (non-uniform scale turns
a circle into an ellipse).

## Dimensions and leaders

```ts
import { dimLinear, dimAligned, dimChain, dimBaseline, dimAngular, dimRadius, dimDiameter, leader, buildDimensionGeometry } from 'cad-blueprint';

dimLinear([0, 0], [1000, 0], { offset: -100 });                          // horizontal; direction: 'vertical' | angle
dimLinear([0, 0], [0, 500], { direction: 'vertical', at: [-100, 0] });   // `at` — a point the dimension line passes through
dimAligned([0, 0], [300, 400], { offset: 50 });                          // parallel to a sloped edge
dimChain([[0, 0], [280, 0], [560, 0]], { offset: -200, texts: [null, '<> (2 pcs)'] });
dimBaseline([0, 0], [[300, 0], [600, 0], [1000, 0]], { offset: -200 });  // stacked with the style's baselineSpacing
dimAngular([0, 0], [100, 0], [0, 100], { radius: 60 });                  // 90°
dimRadius([0, 0], 50, { angleDeg: 45 });                                 // R50
dimDiameter([0, 0], 6, { angleDeg: 0 });                                 // Ø12
leader([[0, 0], [40, 40]], 'Detail A', { shelfLength: 20 });             // leader with a shelf

const g = buildDimensionGeometry(dim, doc.context());                    // lines, terminators, texts in drawing coordinates
```

The style is a name from `DimStyleTable` (`style: null` — the current one). If the text does not fit, it moves past the second terminator;
for small dimensions the arrows are placed outside. `text: '<> mm'` — custom text, `<>` is replaced by the value.

## Blocks, inserts and viewports

```ts
import { insert, viewport } from 'cad-blueprint';

doc.blocks.define('Tread', entities, { basePoint: [150, 0] });            // cyclic inserts are forbidden
insert('Tread', [0, 170], { rotationDeg: 90, scaleX: -1, layer: 'Axes' }); // mirror, rotation, insert layer

// Several independent views on one sheet: own scale, offset, clipping and title.
viewport([insert('Tread'), dimLinear([0, 0], [300, 0], { offset: -30 })], {
  position: [0, -900], scale: '1:2', title: 'Detail A (1:2)', clip: { minX: -40, minY: -70, maxX: 400, maxY: 100 }, frame: true,
});
```

Inside a viewport, text, arrows and line weights are computed by its own scale, so on paper they are the same size as outside.

## Document

```ts
const doc = new CadDocument({ gost: true, settings: { scale: '1:20', coordinateSystem: 'screen' } });
const sheet = doc.addSheet('Facade', entities); // sheet.add(...), remove(id), replace(id, e), find(id), set([...])
doc.audit();                                    // missing layers, styles, blocks, fonts
doc.context();                                  // RenderContext for renderers and bounds
```

## Formats: compact JSON and `.vcad`

```ts
import { stringifyDocument, decodeDocument, packVcad, unpackVcad, packBlockLibrary, unpackBlockLibrary } from 'cad-blueprint';

const json = stringifyDocument(doc);            // tuple-JSON: several times smaller than JSON.stringify(doc), coordinates rounded by precision
const same = decodeDocument(json);              // full validation of tables and entities

const bytes = packVcad(doc, { assets: { 'fonts/gost.woff2': fontBytes }, meta: { order: 42 } }); // ZIP
const { document, blocks, assets, manifest } = unpackVcad(bytes);
const library = unpackBlockLibrary(packBlockLibrary(doc.blocks)); // block library without sheets
```

`.vcad`: `manifest.json`, `document.json` (compact JSON without blocks), `blocks/0001.json` (one file per block, layers by name),
`assets/…`. Unpacking is limited to 256 MB and 10,000 files.

## Bounds

```ts
import { entitiesBounds, entityBounds, blockBounds } from 'cad-blueprint';
entitiesBounds(sheet.entities, doc.context());  // arcs, ellipses, splines — by extrema; text — by metrics; inserts and viewports — with matrices
```

## SVG

```ts
import { renderSvg, renderSvgResult } from 'cad-blueprint';
renderSvg(doc, { sheet: 'Facade', background: '#fff' });  // size: 'paper' (mm) | 'none' | { width }; padding; idPrefix
```

`<defs>` contains `<style>` (`@font-face` / Google Fonts, layer classes), terminator `<marker>`s, hatch `<pattern>`s,
block `<symbol>`s (`<use>` for inserts) and viewport `<clipPath>`s. `hiddenLayers: 'hide'` outputs hidden layers with `display:none`.

## DXF

```ts
import { exportDxf, importDxf, parseDxfToBlock } from 'cad-blueprint';

exportDxf(doc);                        // R2007 / UTF-8: LAYER, LTYPE, STYLE, BLOCKS, ENTITIES, HATCH; { version: 'R2000' } — \U+XXXX
const block = parseDxfToBlock(fileBytes, { name: 'Profile 40×30', fill: 'hatch', basePoint: 'min' });
const { block: b, layers, warnings } = importDxf(fileBytes, { units: 'mm', layer: 'Profile' });
```

Dimensions are written exploded (LINE / ARC / SOLID / TEXT), viewports as `_VIEWPORT<n>` blocks. Import supports LINE, POINT,
CIRCLE, ARC, ELLIPSE, LWPOLYLINE, POLYLINE (2D), SPLINE, SOLID, TEXT, MTEXT, INSERT (exploded); units come from `$INSUNITS`,
nested contours on the same layer become holes.

## Viewer (`cad-blueprint/viewer`)

```ts
import { CadViewer } from 'cad-blueprint/viewer';

const viewer = new CadViewer(container, doc, { toolbar: true });  // source: document, compact JSON (string/object) or .vcad
viewer.fitToView(); viewer.zoomIn(); viewer.setLayerVisible('Axes', false); viewer.isolateLayer('Outline');
viewer.on((e) => { if (e.type === 'select') console.log(e.id, e.point); });   // click on an entity with an id
viewer.downloadSvg('stairs'); viewer.downloadDxf('stairs');
viewer.render({ keepView: true });   // after the document changes
```

Wheel zooms to the cursor, drag pans, pinch zooms on touch screens, double-click fits the drawing.

### Filament 5 (Blade + Alpine.js, no bundler)

```blade
<div wire:ignore style="height: 480px"
     x-data
     x-init="CadBlueprint.mountCadViewer($el, @js($record->drawing_json), { toolbar: true, fileName: 'order-{{ $record->id }}' })">
</div>
@assets
  <script src="{{ asset('js/cad-blueprint.iife.js') }}"></script>
@endassets
```

`drawing_json` is the `stringifyDocument(doc)` string from the database. Copy `dist/cad-blueprint.iife.js` to `public/js`
(or register it via `FilamentAsset::register([Js::make('cad-blueprint', …)])`).

## Three.js (`cad-blueprint/three`)

```ts
import { blockToShapes, blockToExtrudeGeometry, sectionObject, sectionToBlock } from 'cad-blueprint/three';
import { Mesh, Plane, Vector3 } from 'three';

const geometry = blockToExtrudeGeometry(profileBlock, { depth: 2000 });      // holes → shape.holes, arcs → absarc
const section = sectionObject(scene, new Plane(new Vector3(1, 0, 0), -500)); // plane section of meshes
doc.blocks.add(sectionToBlock(section, 'Section A-A', { layer: 'Section' })); // closed contours with holes and hatch
```

## Build and publish

```bash
pnpm build                 # tsup → dist/*.js, dist/*.d.ts, dist/cad-blueprint.iife.js
npm login                  # account maxim.tsatsura
pnpm publish --access public
```

In the repository `exports` point to the sources (`src/*.ts`), so the package works in a workspace without a build. On publish
pnpm replaces them with `publishConfig.exports` (`dist/`); publish with `pnpm publish`, not `npm publish`.

## Structure

```
src/
  index.ts            public API (core)
  settings/           1.1  drawing settings
  layers/             1.2  layers, line types, hatches
  typography/         1.3  fonts, text styles, text extents
  dim-styles/         1.4  dimension styles
  geometry/           2.1  vectors, matrices, curve bounds, contour nesting
  primitives/         2.1  Point … Spline, Text / MText, transforms
  path-builder/       2.2  CadPath
  dimensions/         3.1  dimensions and leaders
  blocks/             3.2  blocks, inserts, viewports
  entities/                entity type union, parseEntity
  document/                CadDocument, sheets, RenderContext
  render/                  entity traversal with block expansion
  format/             4    compact JSON, .vcad
  bounds/             5.1  bounds
  svg/                5.2  SVG renderer
  dxf/                5.3  DXF export and import
  viewer/             5.4  CadViewer (DOM)
  three/              6.1  Three.js bridge
tests/
docs/reports/         stage reports
```
