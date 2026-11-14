export type DemoLang = 'en' | 'ru';

const LANG_STORAGE_KEY = 'cad-blueprint-demo-lang';

export function detectInitialLang(): DemoLang {
  try {
    const q = new URLSearchParams(window.location.search).get('lang');
    if (q === 'en' || q === 'ru') return q;
    const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'en' || saved === 'ru') return saved;
  } catch {
    /* ignore storage / URL errors */
  }
  return 'en';
}

export function saveLang(lang: DemoLang): void {
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }
  try {
    const url = new URL(window.location.href);
    if (lang === 'en') url.searchParams.delete('lang');
    else url.searchParams.set('lang', lang);
    window.history.replaceState(null, '', url);
  } catch {
    /* ignore */
  }
}

export interface DemoUiStrings {
  pageTitle: string;
  brandMeta: string;
  docsLink: string;
  fitTitle: string;
  zoomOutTitle: string;
  zoomInTitle: string;
  importDxf: string;
  importDxfTitle: string;
  dxf2000Title: string;
  vcadTitle: string;
  layersHeading: string;
  showAllLayers: string;
  isolateLayer: string;
  isolateLayerTitle: string;
  dimStyleHeading: string;
  terminatorLabel: string;
  terminators: {
    'arrow-closed': string;
    'arrow-open': string;
    tick: string;
    dot: string;
    circle: string;
    none: string;
  };
  textPosLabel: string;
  textPositions: {
    above: string;
    centered: string;
    outside: string;
  };
  textOrientLabel: string;
  textOrientations: {
    aligned: string;
    horizontal: string;
  };
  scaleLabel: string;
  parametricHeading: string;
  widthLabel: string;
  depthLabel: string;
  cornerRadiusLabel: string;
  cutZLabel: string;
  mmUnit: string;
  statusDefault: string;
  threeHeading: string;
  threeHintHtml: string;
  docSizeHeading: string;
  sizeVerboseLabel: string;
  sizeCompactLabel: string;
  sizeVcadLabel: string;
  jsonPreviewHeading: string;
  bytesUnit: string;
  kbUnit: string;
  sizeRatio: (ratio: string) => string;
  auditOk: string;
  auditIssues: (count: number) => string;
  importSuccess: (count: number, fileUnits: string | null, warnings: readonly string[]) => string;
  importError: (message: string) => string;
  selectEntity: (id: string, layer: string | null, at: string) => string;
  selectPoint: (at: string, layer: string | null) => string;
  webglError: (message: string) => string;
}

export const DEMO_STRINGS: Record<DemoLang, DemoUiStrings> = {
  en: {
    pageTitle: 'cad-blueprint · demo',
    brandMeta: 'v0.3 · demo',
    docsLink: 'Documentation →',
    fitTitle: 'Fit to view',
    zoomOutTitle: 'Zoom out',
    zoomInTitle: 'Zoom in',
    importDxf: 'Import DXF',
    importDxfTitle: 'Open DXF as a new sheet',
    dxf2000Title: 'DXF R2000 for legacy CAD software',
    vcadTitle: 'Full document: JSON + manifest in zip',
    layersHeading: 'Layers',
    showAllLayers: 'show all',
    isolateLayer: 'only',
    isolateLayerTitle: 'Show only this layer',
    dimStyleHeading: 'Dimension style',
    terminatorLabel: 'Terminators',
    terminators: {
      'arrow-closed': 'Arrow (closed)',
      'arrow-open': 'Arrow (open)',
      tick: 'Tick 45° (GOST)',
      dot: 'Dot',
      circle: 'Circle',
      none: 'None',
    },
    textPosLabel: 'Text position',
    textPositions: {
      above: 'Above line',
      centered: 'Centered (break line)',
      outside: 'Outside',
    },
    textOrientLabel: 'Text orientation',
    textOrientations: {
      aligned: 'Aligned with line',
      horizontal: 'Horizontal',
    },
    scaleLabel: 'Drawing scale',
    parametricHeading: 'Parametric',
    widthLabel: 'Width',
    depthLabel: 'Depth',
    cornerRadiusLabel: 'Corner radius',
    cutZLabel: 'Section Z',
    mmUnit: 'mm',
    statusDefault: 'Wheel — zoom, drag — pan, double-click — fit, click — select entity',
    threeHeading: '3D & section',
    threeHintHtml: 'Drag the <b>red plane</b> to move the section. Orbit with drag, zoom with wheel.',
    docSizeHeading: 'Document size',
    sizeVerboseLabel: 'JSON (verbose)',
    sizeCompactLabel: 'Compact JSON',
    sizeVcadLabel: '.vcad (zip)',
    jsonPreviewHeading: 'Sheet compact JSON',
    bytesUnit: 'B',
    kbUnit: 'KB',
    sizeRatio: (ratio) => `${ratio}× smaller`,
    auditOk: 'audit: ok',
    auditIssues: (count) => `audit: ${count} issue${count === 1 ? '' : 's'}`,
    importSuccess: (count, fileUnits, warnings) =>
      `Imported: ${count} entities, file units: ${fileUnits ?? 'unspecified'}` +
      (warnings.length ? ` · skipped: ${warnings.join('; ')}` : ''),
    importError: (message) => `Failed to read DXF: ${message}`,
    selectEntity: (id, layer, at) => `Entity id="${id}", layer "${layer ?? ''}", point ${at}`,
    selectPoint: (at, layer) => `Model point ${at}${layer ? `, layer "${layer}"` : ''}`,
    webglError: (message) => `WebGL unavailable: ${message}`,
  },
  ru: {
    pageTitle: 'cad-blueprint · демо',
    brandMeta: 'v0.3 · демо',
    docsLink: 'Документация →',
    fitTitle: 'Вписать в окно',
    zoomOutTitle: 'Отдалить',
    zoomInTitle: 'Приблизить',
    importDxf: 'Импорт DXF',
    importDxfTitle: 'Открыть DXF как новый лист',
    dxf2000Title: 'DXF R2000 для старых программ',
    vcadTitle: 'Весь документ: JSON + манифест в zip',
    layersHeading: 'Слои',
    showAllLayers: 'показать все',
    isolateLayer: 'только',
    isolateLayerTitle: 'Показать только этот слой',
    dimStyleHeading: 'Стиль размеров',
    terminatorLabel: 'Засечки',
    terminators: {
      'arrow-closed': 'Стрелка (закрытая)',
      'arrow-open': 'Стрелка (открытая)',
      tick: 'Засечка 45° (ГОСТ)',
      dot: 'Точка',
      circle: 'Кружок',
      none: 'Нет',
    },
    textPosLabel: 'Положение текста',
    textPositions: {
      above: 'Над линией',
      centered: 'В разрыве линии',
      outside: 'Снаружи',
    },
    textOrientLabel: 'Ориентация текста',
    textOrientations: {
      aligned: 'Вдоль линии',
      horizontal: 'Горизонтально',
    },
    scaleLabel: 'Масштаб чертежа',
    parametricHeading: 'Параметрика',
    widthLabel: 'Ширина',
    depthLabel: 'Глубина',
    cornerRadiusLabel: 'Радиус углов',
    cutZLabel: 'Разрез по Z',
    mmUnit: 'мм',
    statusDefault: 'Колесо — зум, перетаскивание — панорама, двойной клик — вписать, клик — выбор объекта',
    threeHeading: '3D и сечение',
    threeHintHtml: 'Тяни <b>красную плоскость</b> мышью, чтобы двигать разрез. Остальное вращает камеру, колесо — зум.',
    docSizeHeading: 'Размер документа',
    sizeVerboseLabel: 'JSON (подробный)',
    sizeCompactLabel: 'Компактный JSON',
    sizeVcadLabel: '.vcad (zip)',
    jsonPreviewHeading: 'Компактный JSON листа',
    bytesUnit: 'Б',
    kbUnit: 'КБ',
    sizeRatio: (ratio) => `в ${ratio} раза меньше`,
    auditOk: 'audit: без замечаний',
    auditIssues: (count) => `audit: ${count} замеч.`,
    importSuccess: (count, fileUnits, warnings) =>
      `Импортировано: ${count} объектов, единицы файла: ${fileUnits ?? 'не заданы'}` +
      (warnings.length ? ` · пропущено: ${warnings.join('; ')}` : ''),
    importError: (message) => `Не удалось прочитать DXF: ${message}`,
    selectEntity: (id, layer, at) => `Объект id="${id}", слой «${layer ?? ''}», точка ${at}`,
    selectPoint: (at, layer) => `Точка модели ${at}${layer ? `, слой «${layer}»` : ''}`,
    webglError: (message) => `WebGL недоступен: ${message}`,
  },
};
