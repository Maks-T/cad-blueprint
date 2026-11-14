import { BoxGeometry, Group, Mesh, Plane, Vector3 } from 'three';
import {
  CadDocument,
  CadPath,
  arc,
  arcThrough,
  bezier,
  breakLine,
  circle,
  createHatchStyle,
  dimAligned,
  dimAngular,
  dimBaseline,
  dimChain,
  dimDiameter,
  dimLinear,
  dimRadius,
  ellipse,
  fitBezier,
  insert,
  leader,
  line,
  mtext,
  point,
  polygon,
  polyline,
  rect,
  spline,
  text,
  viewport,
  zigzagBreakLine,
} from '../src';
import type { DimTextOrientation, DimTextPosition, TerminatorType } from '../src';
import { blockToExtrudeGeometry, sectionObject, sectionToBlock } from '../src/three';
import type { SectionResult } from '../src/three';
import type { DemoLang } from './i18n';

export interface DemoParams {
  lang: DemoLang;
  terminatorType: TerminatorType;
  textPosition: DimTextPosition;
  textOrientation: DimTextOrientation;
  scale: string;
  width: number;
  height: number;
  cornerRadius: number;
  cutZ: number;
}

const DOC_TEXT = {
  en: {
    layers: {
      outline: 'Outline',
      steel: 'Section-Steel',
      wood: 'Section-Wood',
      concrete: 'Concrete',
      wall: 'Wall',
      mesh: 'Mesh-Custom',
      hidden: 'Hidden',
      axes: 'Axes',
      dims: 'Dimensions',
      annot: 'Annotations',
    },
    blocks: {
      profile: 'Profile-AL',
      profileDesc: 'Aluminium profile 80×60 with chamber',
      tread: 'Tread-WPC',
      treadDesc: 'Tread 300×25 with drip nose',
      fastener: 'Fastener',
      section: 'Section-3D',
    },
    sheets: {
      primitives: 'Primitives',
      dimensions: 'Dimensions',
      blocks: 'Blocks & Viewports',
      parametric: 'Parametric',
      section: '3D Section',
    },
    primTitle1: 'Layer hatches, holes and CadPath',
    primTitle2: 'Arcs, B-splines, Bézier curves and GOST 2.303 break lines',
    primMText: 'Multiline MText (GOST type B)\nSecond line: Ø12 ±0.1 mm · 45°',
    dimStep: '<> (step)',
    leaderSteel: 'Steel St3sp, t = 8 mm',
    leaderHole: 'Hole Ø80 H9',
    vpDetailA: 'Detail A (1:2)',
    vpDetailB: 'Detail B, tread (1:4)',
    leaderDrip: 'Drip nose R6',
    planTitle: 'Model plan (top view)',
    cutLabel: 'A',
    vpSectionTitle: (z: number) => `Section A–A from 3D, Z = ${z} mm (1:2)`,
  },
  ru: {
    layers: {
      outline: 'Контур',
      steel: 'Сечение-Сталь',
      wood: 'Сечение-Дерево',
      concrete: 'Бетон',
      wall: 'Стена',
      mesh: 'Сетка-Кастом',
      hidden: 'Скрытые',
      axes: 'Оси',
      dims: 'Размеры',
      annot: 'Аннотации',
    },
    blocks: {
      profile: 'Профиль-АЛ',
      profileDesc: 'Алюминиевый профиль 80×60 с камерой',
      tread: 'Ступень-ДПК',
      treadDesc: 'Ступень 300×25 с капельником',
      fastener: 'Крепёж',
      section: 'Разрез-3D',
    },
    sheets: {
      primitives: 'Примитивы',
      dimensions: 'Размеры',
      blocks: 'Блоки и экраны',
      parametric: 'Параметрика',
      section: '3D-разрез',
    },
    primTitle1: 'Штриховки слоёв, вырезы (holes) и CadPath',
    primTitle2: 'Дуги, B-сплайны, Безье и линии обрыва ГОСТ 2.303',
    primMText: 'Многострочный MText (ГОСТ тип Б)\nВторая строка: Ø12 ±0,1 мм · 45°',
    dimStep: '<> (шаг)',
    leaderSteel: 'Сталь Ст3сп, t = 8 мм',
    leaderHole: 'Отв. Ø80 H9',
    vpDetailA: 'Узел А (1:2)',
    vpDetailB: 'Узел Б, ступень (1:4)',
    leaderDrip: 'Капельник R6',
    planTitle: 'План модели (вид сверху)',
    cutLabel: 'А',
    vpSectionTitle: (z: number) => `Разрез А–А из 3D, Z = ${z} мм (1:2)`,
  },
} as const;

/** Длина выдавливания профиля в 3D-сцене, мм. */
export const PROFILE_DEPTH = 400;
/** Поперечина в 3D-сцене: попадает в разрез при Z = 120…280. */
export const CROSS_BOX = { x: 130, y: 20, z: 200, w: 50, h: 40, d: 160 } as const;

function setupTables(doc: CadDocument, params: DemoParams): void {
  const t = DOC_TEXT[params.lang].layers;
  // Размерный стиль ГОСТ под переключатели в UI
  doc.dimStyles.update('GOST', {
    terminatorType: params.terminatorType,
    textPosition: params.textPosition,
    textOrientation: params.textOrientation,
    dimLineOvershoot: params.terminatorType === 'tick' ? 2 : 0,
    decimalSeparator: params.lang === 'en' ? '.' : ',',
  });

  doc.layers.create(t.outline, { color: '#0f172a', lineWeight: 0.5 });
  doc.layers.create(t.steel, { color: '#1e3a8a', lineWeight: 0.5, hatch: 'steel-45' });
  doc.layers.create(t.wood, { color: '#78350f', lineWeight: 0.4, hatch: 'board-45' });
  doc.layers.create(t.concrete, { color: '#475569', lineWeight: 0.35, hatch: 'concrete' });
  doc.layers.create(t.wall, { color: '#334155', lineWeight: 0.4, hatch: 'wall-45' });
  doc.layers.create(t.mesh, {
    color: '#0f766e',
    lineWeight: 0.35,
    hatch: createHatchStyle({
      families: [
        { angle: 45, spacing: 3, lineWidth: 0.15 },
        { angle: 135, spacing: 3, lineWidth: 0.15 },
      ],
      background: '#f0fdfa',
    }),
  });
  doc.layers.create(t.hidden, { color: '#64748b', lineWeight: 0.25, lineType: 'dashed' });
  doc.layers.create(t.axes, { color: '#dc2626', lineWeight: 0.18, lineType: 'dashdot' });
  doc.layers.create(t.dims, { color: '#0284c7', lineWeight: 0.2 });
  doc.layers.create(t.annot, { color: '#0f172a', lineWeight: 0.25 });
}

function setupBlocks(doc: CadDocument, lang: DemoLang): void {
  const t = DOC_TEXT[lang];
  // Профиль 80×60 с пазом сверху и внутренней камерой
  const outer = CadPath.start(0, 0).right(80).up(60).left(25).down(18).left(30).up(18).left(25).close().filletAll(4).build();
  const chamber = CadPath.start(10, 10).right(60).up(22).left(60).close().filletAll(2).build();
  doc.blocks.define(
    t.blocks.profile,
    [
      polygon(outer, { holes: [chamber], layer: t.layers.steel, fill: 'hatch', id: 'block-profile-body' }),
      line([-8, 21], [88, 21], { layer: t.layers.axes }),
    ],
    { description: t.blocks.profileDesc },
  );

  // Ступень 300×25 с носиком-капельником
  const tread = CadPath.start(0, 0).right(300).down(35).fillet(6).left(22).up(10).left(278).close().chamfer(4, 4, { vertex: 0 }).build();
  doc.blocks.define(t.blocks.tread, [polygon(tread, { layer: t.layers.wood, fill: 'hatch', id: 'block-tread' })], {
    description: t.blocks.treadDesc,
  });

  // Маркер крепежа на слое «0»: рисуется на слое вставки
  doc.blocks.define(t.blocks.fastener, [circle([0, 0], 8), line([-12, 0], [12, 0]), line([0, -12], [0, 12])]);
}

function primitivesSheet(doc: CadDocument, lang: DemoLang): void {
  const t = DOC_TEXT[lang];
  const s = doc.addSheet(t.sheets.primitives, [], 'primitives');
  s.add(
    text([0, 540], t.primTitle1, { layer: t.layers.annot, height: 3.5 }),
    polygon(CadPath.start(0, 320).right(260).up(180).left(260).close().fillet(25, { vertex: 1 }).chamfer(25, 25, { vertex: 2 }).build(), {
      id: 'prim-poly-holes',
      layer: t.layers.steel,
      fill: 'hatch',
      holes: [CadPath.start(30, 360).right(80).up(100).left(80).close().filletAll(12).build(), [[150, 410, 1], [220, 410, 1]]],
    }),
    rect(310, 320, 180, 180, { cornerRadius: 24, layer: t.layers.wood, fill: 'hatch', id: 'prim-rect-wood' }),
    circle([610, 410], 90, { layer: t.layers.concrete, fill: 'hatch', id: 'prim-circle-concrete' }),
    ellipse([840, 410], 110, 65, { rotationDeg: 25, layer: t.layers.mesh, fill: 'hatch', id: 'prim-ellipse-mesh' }),
    line([500, 410], [720, 410], { layer: t.layers.axes }),
    line([610, 300], [610, 520], { layer: t.layers.axes }),
  );

  const sCurve = CadPath.start(0, 120).right(80).arcTo(180, 200, { tangent: true }).arcTo(280, 120, { tangent: true }).right(60).build();
  s.add(
    text([0, 265], t.primTitle2, { layer: t.layers.annot, height: 3.5 }),
    polyline(sCurve, { layer: t.layers.outline, id: 'prim-scurve' }),
    arc([430, 150], 70, 20, 240, { layer: t.layers.outline, id: 'prim-arc' }),
    point([430, 150], { layer: t.layers.axes, id: 'prim-center-pt' }),
    arcThrough([540, 100], [610, 220], [680, 110], { layer: t.layers.steel, id: 'prim-arc-3pt' }),
    spline([[720, 100], [770, 230], [850, 60], [930, 220], [1000, 120]], { degree: 3, layer: t.layers.outline, id: 'prim-spline' }),
    fitBezier([[1040, 110], [1100, 210], [1170, 90], [1240, 190]], { layer: t.layers.axes, id: 'prim-fit-bezier' }),
    bezier([[0, 30], [60, 90], [120, -30], [180, 30]], { layer: t.layers.hidden, id: 'prim-bezier' }),
    breakLine([260, -10], [260, 90], { waves: 3, amplitude: 8, layer: t.layers.outline, id: 'prim-break-wave' }),
    zigzagBreakLine([340, 40], [560, 40], { size: 36, layer: t.layers.outline, id: 'prim-break-zigzag' }),
    mtext([720, 40], t.primMText, {
      layer: t.layers.annot,
      height: 3.5,
      anchor: 'top-left',
      id: 'prim-mtext',
    }),
  );
}

function dimensionsSheet(doc: CadDocument, lang: DemoLang): void {
  const t = DOC_TEXT[lang];
  const s = doc.addSheet(t.sheets.dimensions, [], 'dimensions');
  // Деталь: снизу 700, справа 120, полка 180, скос 45° длиной 220, верх 200, затем замыкание
  const part = CadPath.start(0, 0).right(700).up(120).left(180).polar(220, 135).left(200).fillet(40).close().build();
  const slopeEnd: [number, number] = [520 - 220 * Math.SQRT1_2, 120 + 220 * Math.SQRT1_2];
  s.add(
    polygon(part, {
      layer: t.layers.outline,
      fill: '#f8fafc',
      holes: [[[140, 110, 1], [220, 110, 1]], [[460, 80, 1], [500, 80, 1]]],
      id: 'dim-part',
    }),
    line([120, 110], [240, 110], { layer: t.layers.axes }),
    line([180, 50], [180, 170], { layer: t.layers.axes }),
    line([445, 80], [515, 80], { layer: t.layers.axes }),
    line([480, 45], [480, 115], { layer: t.layers.axes }),

    dimChain([[0, 0], [180, 0], [480, 0], [700, 0]], { offset: -70, layer: t.layers.dims, texts: [null, t.dimStep, null], id: 'dim-chain' }),
    dimBaseline([0, 0], [[180, 0], [480, 0], [700, 0]], { offset: -150, layer: t.layers.dims, id: 'dim-baseline' }),
    dimLinear([700, 0], [700, 120], { direction: 'vertical', offset: -80, layer: t.layers.dims, id: 'dim-vertical' }),
    dimLinear([520, 120], [700, 120], { offset: 30, layer: t.layers.dims, id: 'dim-shelf' }),
    dimLinear([180, 110], [198, 110], { offset: 150, layer: t.layers.dims, id: 'dim-tight' }),
    dimAligned([520, 120], slopeEnd, { offset: -60, layer: t.layers.dims, id: 'dim-aligned-slope' }),
    dimAngular([520, 120], [700, 120], slopeEnd, { radius: 110, layer: t.layers.dims, id: 'dim-angle' }),
    dimDiameter([180, 110], 40, { angleDeg: 35, layer: t.layers.dims, id: 'dim-dia' }),
    dimRadius([480, 80], 20, { angleDeg: -45, layer: t.layers.dims, id: 'dim-rad' }),
    leader([[600, 60], [780, 220]], t.leaderSteel, { layer: t.layers.dims, id: 'leader-right' }),
    leader([[150, 140], [40, 360]], t.leaderHole, { layer: t.layers.dims, id: 'leader-left' }),
  );
}

function blocksSheet(doc: CadDocument, lang: DemoLang): void {
  const t = DOC_TEXT[lang];
  const s = doc.addSheet(t.sheets.blocks, [], 'blocks');
  s.add(
    ...[0, 1, 2, 3].flatMap((i) => [
      insert(t.blocks.tread, [i * 270, (i + 1) * 160], { id: `tread-${i + 1}` }),
      insert(t.blocks.fastener, [i * 270 + 60, (i + 1) * 160 - 12], { layer: t.layers.axes, id: `fastener-${i + 1}` }),
    ]),
    // одна и та же стойка: обычная и зеркальная (scaleX: −1)
    insert(t.blocks.profile, [0, 0], { id: 'profile-left' }),
    insert(t.blocks.profile, [1150, 0], { scaleX: -1, id: 'profile-right-mirrored' }),
    text([1070, 80], 'scaleX: −1', { layer: t.layers.annot, height: 2.5, anchor: 'bottom-center' }),
    dimLinear([0, 0], [1150, 0], { offset: -90, layer: t.layers.dims }),
    dimChain([[0, 0], [270, 0], [540, 0], [810, 0], [1110, 0]], { offset: -170, layer: t.layers.dims }),

    viewport(
      [
        insert(t.blocks.profile, [0, 0]),
        insert(t.blocks.fastener, [40, 21], { layer: t.layers.axes, scale: 0.5 }),
        dimLinear([0, 0], [80, 0], { offset: -14, layer: t.layers.dims }),
        dimLinear([80, 0], [80, 60], { direction: 'vertical', offset: -14, layer: t.layers.dims }),
      ],
      {
        id: 'vp-detail-a',
        position: [150, -560],
        target: [40, 30],
        scale: '1:2',
        clip: { minX: -20, minY: -32, maxX: 112, maxY: 72 },
        frame: true,
        title: t.vpDetailA,
        layer: t.layers.annot,
      },
    ),
    viewport(
      [
        insert(t.blocks.tread, [0, 0]),
        dimLinear([0, 0], [300, 0], { offset: 22, layer: t.layers.dims }),
        leader([[290, -30], [230, -70]], t.leaderDrip, { layer: t.layers.dims }),
      ],
      {
        id: 'vp-detail-b',
        position: [860, -560],
        target: [150, -15],
        scale: '1:4',
        clip: { minX: -20, minY: -90, maxX: 320, maxY: 50 },
        frame: true,
        title: t.vpDetailB,
        layer: t.layers.annot,
      },
    ),
  );
}

function parametricSheet(doc: CadDocument, params: DemoParams): void {
  const t = DOC_TEXT[params.lang];
  const s = doc.addSheet(t.sheets.parametric, [], 'parametric');
  const { width: W, height: H, cornerRadius: R } = params;
  const panel = CadPath.start(0, 0).right(W).up(H).left(W).close();
  const r = Math.min(R, Math.min(W, H) / 2 - 1);
  if (r > 0) panel.filletAll(r);
  const sink = CadPath.start(W * 0.2, H * 0.25).right(W * 0.35).up(H * 0.5).left(W * 0.35).close().filletAll(Math.min(20, H * 0.24)).build();
  s.add(
    // П-образная стена вокруг столешницы
    polygon([[-25, 0], [-25, H + 25], [W + 25, H + 25], [W + 25, 0], [W, 0], [W, H], [0, H], [0, 0]], { layer: t.layers.wall, fill: 'hatch', id: 'param-wall' }),
    polygon(panel.build(), { layer: t.layers.outline, fill: '#fef9c3', holes: [sink], id: 'param-countertop' }),
    circle([W * 0.375, H * 0.85], 17.5, { layer: t.layers.outline, id: 'param-mixer-hole' }),
    dimBaseline([0, H + 25], [[W, H + 25], [W + 25, H + 25]], { offset: 40, layer: t.layers.dims }),
    dimLinear([0, 0], [0, H], { direction: 'vertical', offset: 85, layer: t.layers.dims }),
    dimChain([[0, 0], [W * 0.2, 0], [W * 0.55, 0], [W, 0]], { offset: -60, layer: t.layers.dims }),
    dimDiameter([W * 0.375, H * 0.85], 17.5, { angleDeg: 45, layer: t.layers.dims }),
    ...(r > 0 ? [dimRadius([W - r, H - r], r, { angleDeg: 45, layer: t.layers.dims })] : []),
  );
}

/** Лист «3D-разрез»: план модели (X–Z), линия секущей плоскости и разрез, полученный из мешей Three.js. */
function sectionSheet(doc: CadDocument, params: DemoParams, section: SectionResult): void {
  const t = DOC_TEXT[params.lang];
  const s = doc.addSheet(t.sheets.section, [], 'section');
  const z = params.cutZ;
  const b = CROSS_BOX;
  // План: X вправо, Z вниз (Y листа = −Z)
  s.add(
    text([0, 40], t.planTitle, { layer: t.layers.annot, height: 3.5 }),
    rect(0, -PROFILE_DEPTH, 80, PROFILE_DEPTH, { layer: t.layers.outline, fill: '#dbeafe', id: 'plan-profile' }),
    rect(b.x - b.w / 2, -(b.z + b.d / 2), b.w, b.d, { layer: t.layers.outline, fill: '#e0e7ff', id: 'plan-cross' }),
    dimLinear([0, 0], [0, -PROFILE_DEPTH], { direction: 'vertical', offset: 90, layer: t.layers.dims }),
    dimLinear([b.x + b.w / 2, -(b.z - b.d / 2)], [b.x + b.w / 2, -(b.z + b.d / 2)], { direction: 'vertical', offset: -25, layer: t.layers.dims }),
    line([-40, -z], [b.x + b.w / 2 + 40, -z], { layer: t.layers.axes, id: 'cut-line' }),
    text([-45, -z], t.cutLabel, { layer: t.layers.annot, height: 5, anchor: 'middle-right' }),
    text([b.x + b.w / 2 + 45, -z], t.cutLabel, { layer: t.layers.annot, height: 5, anchor: 'middle-left' }),
  );

  doc.blocks.add(sectionToBlock(section, t.blocks.section, { layer: t.layers.steel, fill: 'hatch' }));
  const hasCross = Math.abs(z - b.z) < b.d / 2;
  s.add(
    viewport(
      [
        insert(t.blocks.section, [0, 0], { id: 'three-section' }),
        dimLinear([0, 0], [80, 0], { offset: -14, layer: t.layers.dims }),
        ...(hasCross ? [dimLinear([80, 0], [b.x + b.w / 2, 0], { offset: -14, layer: t.layers.dims })] : []),
        dimLinear([0, 0], [0, 60], { direction: 'vertical', offset: 14, layer: t.layers.dims }),
      ],
      {
        id: 'vp-section',
        position: [760, -200],
        target: [80, 30],
        scale: '1:2',
        title: t.vpSectionTitle(z),
        layer: t.layers.annot,
      },
    ),
  );
}

/** 3D-сцена: выдавленный блок «Профиль-АЛ» и поперечина (для `sectionObject`). */
export function buildDemo3DScene(doc: CadDocument): Group {
  const group = new Group();
  const profileBlock = doc.blocks.get(DOC_TEXT.en.blocks.profile) ?? doc.blocks.require(DOC_TEXT.ru.blocks.profile);
  const profile = new Mesh(blockToExtrudeGeometry(profileBlock, { depth: PROFILE_DEPTH }));
  profile.name = 'profile';
  group.add(profile);
  const b = CROSS_BOX;
  const cross = new Mesh(new BoxGeometry(b.w, b.h, b.d));
  cross.name = 'cross';
  cross.position.set(b.x, b.y, b.z);
  group.add(cross);
  group.updateMatrixWorld(true);
  return group;
}

/** Плоскость сечения Z = cutZ. */
export function cutPlane(cutZ: number): Plane {
  return new Plane(new Vector3(0, 0, 1), -cutZ);
}

/** Документ витрины: пять листов, общие слои, стили и блоки. `scene` — готовая 3D-сцена (чтобы не строить её каждый раз). */
export function buildShowcaseDocument(params: DemoParams, scene?: Group): CadDocument {
  const doc = new CadDocument({
    gost: true,
    settings: { units: 'mm', precision: 2, scale: params.scale, annotationScale: 'auto', coordinateSystem: 'cartesian', padding: [12, 16] },
  });
  setupTables(doc, params);
  setupBlocks(doc, params.lang);
  primitivesSheet(doc, params.lang);
  dimensionsSheet(doc, params.lang);
  blocksSheet(doc, params.lang);
  parametricSheet(doc, params);
  sectionSheet(doc, params, sectionObject(scene ?? buildDemo3DScene(doc), cutPlane(params.cutZ)));
  return doc;
}
