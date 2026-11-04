import { DEFAULT_LAYERS } from './layers';
import { CadPath } from './path';
import type { CadBlockData, CadBlueprintJSON, CadEntity, CadSheetData, LayerStyle, Pt } from './types';

/** Умный прямоугольник с готовыми привязками для размеров, бейджей кромок и открывания дверей */
export class CadBox {
  constructor(
    private readonly sheet: CadSheet,
    public readonly x: number,
    public readonly y: number,
    public readonly width: number,
    public readonly height: number
  ) {}

  /** Кружок маркировки кромки (Т, А, П как в Ligron) */
  public edgeBadge(side: 'top' | 'bottom' | 'left' | 'right', label: string): this {
    const cx = side === 'left' ? this.x : side === 'right' ? this.x + this.width : this.x + this.width / 2;
    const cy = side === 'bottom' ? this.y : side === 'top' ? this.y + this.height : this.y + this.height / 2;
    this.sheet.badge(cx, cy, label);
    return this;
  }

  /** Схема открывания створки двери (треугольник петель как в Configdoor) */
  public openingSymbol(hingeSide: 'left' | 'right', layer = 'axes'): this {
    const xHinge = hingeSide === 'left' ? this.x : this.x + this.width;
    const xHandle = hingeSide === 'left' ? this.x + this.width : this.x;
    const yMid = this.y + this.height / 2;
    this.sheet.line(xHinge, this.y, xHandle, yMid, layer);
    this.sheet.line(xHandle, yMid, xHinge, this.y + this.height, layer);
    return this;
  }
}

export class CadSheet {
  private readonly data: CadSheetData;

  constructor(id: string, title: string, coordMode: 'elevation' | 'plan' = 'elevation') {
    this.data = { id, title, coordMode, entities: [], legend: [] };
  }

  // В режиме 'elevation' (Вид сбоку/Фасад) ось Y входных координат смотрит ВВЕРХ,
  // а внутри листа хранится в экранных координатах (Y вниз), чтобы рендереры работали мгновенно.
  private sy(y: number): number {
    return this.data.coordMode === 'elevation' ? -y : y;
  }

  public line(x1: number, y1: number, x2: number, y2: number, layer = 'contour'): this {
    this.data.entities.push({ t: 'L', l: layer, x1, y1: this.sy(y1), x2, y2: this.sy(y2) });
    return this;
  }

  public rect(x: number, y: number, w: number, h: number, layer = 'contour'): CadBox {
    const y1 = this.sy(y);
    const y2 = this.sy(y + h);
    const top = Math.min(y1, y2);
    const bot = Math.max(y1, y2);
    this.data.entities.push({
      t: 'P', l: layer, closed: true,
      pts: [[x, top], [x + w, top], [x + w, bot], [x, bot]]
    });
    return new CadBox(this, x, y, w, h);
  }

  public polygon(pts: Pt[], layer = 'contour', closed = true): this {
    this.data.entities.push({
      t: 'P', l: layer, closed,
      pts: pts.map(([x, y]) => [x, this.sy(y)] as Pt)
    });
    return this;
  }

  public path(builder: (p: typeof CadPath) => CadPath, layer = 'contour'): this {
    const { pts, closed } = builder(CadPath).build();
    return this.polygon(pts, layer, closed);
  }

  public circle(cx: number, cy: number, r: number, layer = 'contour'): this {
    this.data.entities.push({ t: 'C', l: layer, cx, cy: this.sy(cy), r });
    return this;
  }

  public insertBlock(blockId: string, opts: { x: number; y: number; scaleX?: number; scaleY?: number; rot?: number; layer?: string }): this {
    this.data.entities.push({
      t: 'B', l: opts.layer ?? 'contour', blockId,
      x: opts.x, y: this.sy(opts.y),
      sx: opts.scaleX ?? 1, sy: opts.scaleY ?? 1, rot: opts.rot ?? 0
    });
    return this;
  }

  public mark(x: number, y: number, shape: 'plus' | 'cross', size = 9, layer = 'fasteners'): this {
    this.data.entities.push({ t: 'M', l: layer, x, y: this.sy(y), shape, size });
    return this;
  }

  public badge(x: number, y: number, label: string, radius = 9, layer = 'annotations'): this {
    this.data.entities.push({ t: 'M', l: layer, x, y: this.sy(y), shape: 'badge', size: radius, label });
    return this;
  }

  public text(
    x: number, y: number, text: string,
    opts: { size?: number; anchor?: 'start' | 'middle' | 'end'; weight?: number; mono?: boolean; color?: string; rot?: number; layer?: string } = {}
  ): this {
    this.data.entities.push({
      t: 'T', l: opts.layer ?? 'annotations',
      x, y: this.sy(y), text,
      size: opts.size ?? 11,
      anchor: opts.anchor ?? 'start',
      weight: opts.weight ?? 600,
      mono: opts.mono,
      color: opts.color,
      rot: opts.rot
    });
    return this;
  }

  /** Одиночный линейный размер */
  public dimLinear(opts: {
    x1: number; y1: number; x2: number; y2: number;
    offset: number;
    orientation: 'horizontal' | 'vertical';
    text?: string;
    textSide?: 'start' | 'end';
  }): this {
    const sy1 = this.sy(opts.y1);
    const sy2 = this.sy(opts.y2);
    const dist = opts.orientation === 'horizontal' ? Math.abs(opts.x2 - opts.x1) : Math.abs(sy2 - sy1);
    this.data.entities.push({
      t: 'DL', l: 'dimensions',
      x1: opts.x1, y1: sy1, x2: opts.x2, y2: sy2,
      offset: opts.offset,
      dir: opts.orientation === 'horizontal' ? 'h' : 'v',
      text: opts.text ?? String(Math.round(dist)),
      side: opts.textSide ?? 'start'
    });
    return this;
  }

  /** Автоматическая цепочка размеров по массиву координат (для стоек и пролетов!) */
  public dimChain(opts: {
    coords: number[];
    fixedCoord: number;
    offset: number;
    orientation: 'horizontal' | 'vertical';
    textSide?: 'start' | 'end';
    minSpan?: number;
  }): this {
    const { coords, fixedCoord, offset, orientation, textSide = 'end', minSpan = 12 } = opts;
    for (let i = 0; i < coords.length - 1; i++) {
      const a = coords[i] ?? 0;
      const b = coords[i + 1] ?? 0;
      if (Math.abs(b - a) < minSpan) continue;
      if (orientation === 'horizontal') {
        this.dimLinear({ x1: a, y1: fixedCoord, x2: b, y2: fixedCoord, offset, orientation: 'horizontal', textSide });
      } else {
        this.dimLinear({ x1: fixedCoord, y1: a, x2: fixedCoord, y2: b, offset, orientation: 'vertical', textSide });
      }
    }
    return this;
  }

  /** Этажерка параллельных размеров с автоматическим шагом отступа (чтобы не наезжали!) */
  public dimStack(opts: {
    items: Array<{ from: number; to: number; text?: string }>;
    fixedCoord: number;
    baseOffset: number;
    stepOffset?: number;
    orientation: 'horizontal' | 'vertical';
    textSide?: 'start' | 'end';
  }): this {
    const { items, fixedCoord, baseOffset, stepOffset = 26, orientation, textSide } = opts;
    const sign = baseOffset >= 0 ? 1 : -1;
    items.forEach((item, idx) => {
      const offset = baseOffset + sign * idx * stepOffset;
      if (orientation === 'horizontal') {
        this.dimLinear({ x1: item.from, y1: fixedCoord, x2: item.to, y2: fixedCoord, offset, orientation, text: item.text, textSide });
      } else {
        this.dimLinear({ x1: fixedCoord, y1: item.from, x2: fixedCoord, y2: item.to, offset, orientation, text: item.text, textSide });
      }
    });
    return this;
  }

  public levelAxis(axisX: number, baseY: number, stepCount: number, stepHeight: number): this {
    this.data.entities.push({ t: 'LA', l: 'dimensions', axisX, baseY: this.sy(baseY), count: stepCount, stepH: stepHeight });
    return this;
  }

  public levelMark(x: number, y: number, symbolX: number, label: string, elevation: string): this {
    this.data.entities.push({ t: 'LM', l: 'dimensions', x, y: this.sy(y), symX: symbolX, label, elev: elevation });
    return this;
  }

  public sectionCut(opts: { x: number; y: number; dir: 'up' | 'down' | 'left' | 'right'; label: string; barSide: 1 | -1 }): this {
    this.data.entities.push({ t: 'SC', l: 'annotations', x: opts.x, y: this.sy(opts.y), dir: opts.dir, label: opts.label, barSide: opts.barSide });
    return this;
  }

  /** Декларативная легенда чертежа (автоматически размещается внизу листа!) */
  public addLegendItem(icon: 'rect' | 'line' | 'plus' | 'cross', layer: string, text: string): this {
    this.data.legend.push({ icon, layer, text });
    return this;
  }

  public toData(): CadSheetData {
    return this.data;
  }
}

export class CadDocument {
  private layers: Record<string, LayerStyle> = structuredClone(DEFAULT_LAYERS);
  private blocks: Record<string, CadBlockData> = {};
  private sheets: CadSheet[] = [];

  public setLayerStyle(id: string, style: Partial<LayerStyle>): this {
    const existing = this.layers[id] ?? {
      id, stroke: '#0f172a', strokeWidth: 1, lineType: 'continuous', dxfColor: 7, visible: true
    };
    this.layers[id] = { ...existing, ...style };
    return this;
  }

  public defineBlock(id: string, base: Pt, builder: (sheet: CadSheet) => void): this {
    const temp = new CadSheet(id, '', 'plan');
    builder(temp);
    this.blocks[id] = { id, base, entities: temp.toData().entities };
    return this;
  }

  public createSheet(id: string, title: string, coordMode: 'elevation' | 'plan' = 'elevation'): CadSheet {
    const sheet = new CadSheet(id, title, coordMode);
    this.sheets.push(sheet);
    return sheet;
  }

  public toJSON(): CadBlueprintJSON {
    return {
      v: 1,
      units: 'mm',
      layers: this.layers,
      blocks: this.blocks,
      sheets: this.sheets.map((s) => s.toData())
    };
  }

  public static fromJSON(json: CadBlueprintJSON): CadDocument {
    const doc = new CadDocument();
    doc.layers = structuredClone(json.layers);
    doc.blocks = structuredClone(json.blocks);
    doc.sheets = json.sheets.map((s) => {
      const sh = new CadSheet(s.id, s.title, s.coordMode);
      Object.assign(sh.toData(), structuredClone(s));
      return sh;
    });
    return doc;
  }
}