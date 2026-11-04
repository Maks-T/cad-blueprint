export type LineType = 'continuous' | 'dashed' | 'dashdot' | 'dotted';

export type HatchPattern =
  | 'none'
  | 'solid'
  | 'steel-45'
  | 'board-45'
  | 'cladding-45'
  | 'wall-45'
  | 'concrete';

export interface LayerStyle {
  id: string;
  stroke: string;
  strokeWidth: number;
  lineType: LineType;
  fill?: string;
  hatch?: HatchPattern;
  opacity?: number;
  /** Цвет в AutoCAD Color Index (1=Red, 3=Green, 5=Blue, 7=White/Black, 8=Gray) */
  dxfColor: number;
  visible: boolean;
}

export type Pt = [number, number];

export type CadEntity =
  | { t: 'L'; l: string; x1: number; y1: number; x2: number; y2: number }
  | { t: 'P'; l: string; pts: Pt[]; closed: boolean }
  | { t: 'C'; l: string; cx: number; cy: number; r: number }
  | { t: 'B'; l: string; blockId: string; x: number; y: number; sx: number; sy: number; rot: number }
  | { t: 'M'; l: string; x: number; y: number; shape: 'plus' | 'cross' | 'badge'; size: number; label?: string }
  | { t: 'T'; l: string; x: number; y: number; text: string; size: number; anchor: 'start' | 'middle' | 'end'; weight?: number; mono?: boolean; color?: string; rot?: number }
  | { t: 'DL'; l: string; x1: number; y1: number; x2: number; y2: number; offset: number; dir: 'h' | 'v'; text: string; side: 'start' | 'end' }
  | { t: 'LA'; l: string; axisX: number; baseY: number; count: number; stepH: number }
  | { t: 'LM'; l: string; x: number; y: number; symX: number; label: string; elev: string }
  | { t: 'SC'; l: string; x: number; y: number; dir: 'up' | 'down' | 'left' | 'right'; label: string; barSide: 1 | -1 };

export interface CadBlockData {
  id: string;
  base: Pt;
  entities: CadEntity[];
}

export interface CadSheetData {
  id: string;
  title: string;
  coordMode: 'elevation' | 'plan';
  entities: CadEntity[];
  legend: Array<{ icon: 'rect' | 'line' | 'plus' | 'cross'; layer: string; text: string }>;
}

export interface CadBlueprintJSON {
  v: 1;
  units: 'mm';
  layers: Record<string, LayerStyle>;
  blocks: Record<string, CadBlockData>;
  sheets: CadSheetData[];
}