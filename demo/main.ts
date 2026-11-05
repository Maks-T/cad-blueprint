import {
  encodeDocument,
  exportDxf,
  importDxf,
  insert,
  packVcad,
  stringifyDocument,
  type CadDocument,
} from '../src';
import { sectionObject } from '../src/three';
import { CadViewer } from '../src/viewer';
import { PROFILE_DEPTH, buildDemo3DScene, buildShowcaseDocument, cutPlane, type DemoParams } from './demo-document';
import { ThreePreview } from './three-preview';

const $ = <T extends HTMLElement = HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} not found`);
  return el as T;
};

const params: DemoParams = {
  terminatorType: 'arrow-closed',
  textPosition: 'above',
  textOrientation: 'aligned',
  scale: '1:5',
  width: 1200,
  height: 600,
  cornerRadius: 40,
  cutZ: 180,
};

// 3D-сцена строится один раз: профиль не зависит от параметров витрины.
const scene3d = buildDemo3DScene(buildShowcaseDocument(params));
// Импортированные DXF переносятся в новые документы при перестроении.
const imported: { sheetId: string; title: string; build: (doc: CadDocument) => void }[] = [];

function makeDocument(): CadDocument {
  const doc = buildShowcaseDocument(params, scene3d);
  for (const item of imported) item.build(doc);
  return doc;
}

const viewer = new CadViewer($('viewer-host'), makeDocument(), {
  sheet: 'primitives',
  background: 'transparent',
  paper: '#ffffff',
  fitMargin: 24,
  fileName: 'cad-blueprint-demo',
});

// ── Листы ────────────────────────────────────────────────────────────────────
function renderTabs(): void {
  const tabs = $('sheet-tabs');
  tabs.replaceChildren();
  for (const sheet of viewer.document.sheets) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `tab-btn${sheet.id === viewer.sheet ? ' active' : ''}`;
    btn.textContent = sheet.name;
    btn.addEventListener('click', () => showSheet(sheet.id));
    tabs.append(btn);
  }
}

function showSheet(id: string): void {
  if (viewer.sheet !== id) viewer.setSheet(id);
  renderTabs();
  renderLayers();
}

// ── Слои ─────────────────────────────────────────────────────────────────────
function renderLayers(): void {
  const list = $('layer-list');
  list.replaceChildren();
  for (const l of viewer.layers()) {
    const row = document.createElement('label');
    row.className = 'layer-row';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = l.visible;
    cb.addEventListener('change', () => viewer.setLayerVisible(l.name, cb.checked));
    const dot = document.createElement('span');
    dot.className = 'layer-dot';
    dot.style.background = l.color;
    const name = document.createElement('span');
    name.className = 'layer-name';
    name.textContent = l.name;
    const iso = document.createElement('button');
    iso.type = 'button';
    iso.className = 'link-btn';
    iso.textContent = 'только';
    iso.title = 'Показать только этот слой';
    iso.addEventListener('click', (e) => {
      e.preventDefault();
      viewer.isolateLayer(l.name);
      renderLayers();
    });
    row.append(cb, dot, name, iso);
    list.append(row);
  }
}

$('btn-show-all-layers').addEventListener('click', () => {
  viewer.showAllLayers();
  renderLayers();
});

// ── Форматы ──────────────────────────────────────────────────────────────────
const bytes = (s: string): number => new TextEncoder().encode(s).length;
const fmtSize = (n: number): string => (n < 1024 ? `${n} Б` : `${(n / 1024).toFixed(1)} КБ`);

function updateStats(): void {
  const doc = viewer.document;
  const verbose = bytes(JSON.stringify(doc));
  const compact = stringifyDocument(doc);
  $('size-verbose').textContent = fmtSize(verbose);
  $('size-compact').textContent = fmtSize(bytes(compact));
  $('size-vcad').textContent = fmtSize(packVcad(doc).byteLength);
  $('size-ratio').textContent = `в ${(verbose / bytes(compact)).toFixed(1)} раза меньше`;
  const sheet = encodeDocument(doc).sh.find((s) => Array.isArray(s) && s[0] === viewer.sheet);
  const preview = JSON.stringify(sheet ?? []);
  $('json-preview').textContent = preview.length > 1500 ? `${preview.slice(0, 1500)}…` : preview;
  const issues = doc.audit();
  const audit = $('status-audit');
  audit.textContent = issues.length === 0 ? 'audit: без замечаний' : `audit: ${issues.length} замеч.`;
  audit.title = issues.map((i) => `${i.path}: ${i.message}`).join('\n');
}

// ── Перестроение ─────────────────────────────────────────────────────────────
let rebuildFrame = 0;
/** Пересобирает документ (не чаще раза за кадр), сохраняя лист, зум и видимость слоёв. */
function rebuild(keepView = true): void {
  if (rebuildFrame) return;
  rebuildFrame = requestAnimationFrame(() => {
    rebuildFrame = 0;
    const hidden = viewer.layers().filter((l) => !l.visible).map((l) => l.name);
    viewer.setDocument(makeDocument(), { keepView });
    for (const name of hidden) if (viewer.document.layers.has(name)) viewer.setLayerVisible(name, false);
    renderTabs();
    renderLayers();
    updateStats();
  });
}

function bindSelect<K extends keyof DemoParams>(id: string, key: K, keepView = true): void {
  const el = $<HTMLSelectElement>(id);
  el.value = String(params[key]);
  el.addEventListener('change', () => {
    (params as unknown as Record<string, unknown>)[key] = el.value;
    rebuild(keepView);
  });
}
bindSelect('sel-terminator', 'terminatorType');
bindSelect('sel-text-pos', 'textPosition');
bindSelect('sel-text-orient', 'textOrientation');
bindSelect('sel-scale', 'scale', false);

function bindRange(id: string, key: 'width' | 'height' | 'cornerRadius' | 'cutZ', sheet: string): void {
  const input = $<HTMLInputElement>(id);
  const label = $(`${id}-val`);
  input.value = String(params[key]);
  label.textContent = String(params[key]);
  input.addEventListener('input', () => {
    params[key] = Number(input.value);
    label.textContent = input.value;
    if (key === 'cutZ') preview?.setCut(params.cutZ, sectionObject(scene3d, cutPlane(params.cutZ)));
    if (viewer.sheet !== sheet) viewer.setSheet(sheet);
    rebuild(true);
  });
}
bindRange('rng-w', 'width', 'parametric');
bindRange('rng-h', 'height', 'parametric');
bindRange('rng-r', 'cornerRadius', 'parametric');
bindRange('rng-cut', 'cutZ', 'section');

// ── Зум, экспорт, импорт ─────────────────────────────────────────────────────
$('btn-fit').addEventListener('click', () => viewer.fitToView());
$('btn-zoom-in').addEventListener('click', () => viewer.zoomIn());
$('btn-zoom-out').addEventListener('click', () => viewer.zoomOut());
$('btn-svg').addEventListener('click', () => viewer.downloadSvg(`cad-${viewer.sheet}`));
$('btn-dxf').addEventListener('click', () => viewer.downloadDxf(`cad-${viewer.sheet}-r2007`));
$('btn-dxf-2000').addEventListener('click', () => {
  download(`cad-${viewer.sheet}-r2000.dxf`, exportDxf(viewer.document, { sheet: viewer.sheet, version: 'R2000' }), 'application/dxf');
});
$('btn-vcad').addEventListener('click', () => download('cad-blueprint-demo.vcad', packVcad(viewer.document, { meta: { demo: true } }), 'application/zip'));

function download(name: string, content: string | Uint8Array, type: string): void {
  const url = URL.createObjectURL(new Blob([content as BlobPart], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const fileInput = $<HTMLInputElement>('input-dxf');
fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  fileInput.value = ''; // тот же файл можно выбрать ещё раз
  if (!file) return;
  try {
    const buffer = await file.arrayBuffer();
    const title = file.name.replace(/\.dxf$/i, '');
    const n = imported.length + 1;
    const sheetId = `dxf-${n}`;
    const blockName = `DXF-${n}`;
    const result = importDxf(buffer, { name: blockName, fill: 'hatch', basePoint: 'min' });
    imported.push({
      sheetId,
      title,
      build: (doc) => {
        for (const l of result.layers) if (!doc.layers.has(l.name)) doc.layers.create(l.name, l);
        doc.blocks.add(result.block);
        doc.addSheet(`DXF: ${title}`, [insert(blockName, [0, 0], { id: `dxf-${n}` })], sheetId);
      },
    });
    viewer.setDocument(makeDocument());
    showSheet(sheetId);
    updateStats();
    setStatus(
      `Импортировано: ${result.block.entities.length} объектов, единицы файла: ${result.fileUnits ?? 'не заданы'}` +
        (result.warnings.length ? ` · пропущено: ${result.warnings.join('; ')}` : ''),
    );
  } catch (err) {
    setStatus(`Не удалось прочитать DXF: ${(err as Error).message}`, true);
  }
});

function setStatus(text: string, error = false): void {
  const el = $('status-select');
  el.textContent = text;
  el.classList.toggle('error', error);
}

viewer.on((ev) => {
  if (ev.type === 'view') {
    $('zoom-label').textContent = `${Math.round(ev.zoom * 100)}%`;
  } else if (ev.type === 'select') {
    const [x, y] = ev.point;
    const at = `(${x.toFixed(1)}; ${y.toFixed(1)})`;
    setStatus(ev.id ? `Объект id="${ev.id}", слой «${ev.layer}», точка ${at}` : `Точка модели ${at}${ev.layer ? `, слой «${ev.layer}»` : ''}`);
  }
});

// ── 3D ───────────────────────────────────────────────────────────────────────
let preview: ThreePreview | null = null;
try {
  preview = new ThreePreview($('three-preview'), {
    scene: scene3d,
    cutZ: params.cutZ,
    minZ: 0,
    maxZ: PROFILE_DEPTH,
    onCut: (z) => {
      params.cutZ = z;
      $<HTMLInputElement>('rng-cut').value = String(z);
      $('rng-cut-val').textContent = String(z);
      preview?.setContour(sectionObject(scene3d, cutPlane(z)));
      if (viewer.sheet !== 'section') viewer.setSheet('section');
      rebuild(true);
    },
  });
  preview.setContour(sectionObject(scene3d, cutPlane(params.cutZ)));
} catch (err) {
  $('three-preview').textContent = `WebGL недоступен: ${(err as Error).message}`;
}

renderTabs();
renderLayers();
updateStats();
