import type { CadBlueprintJSON } from './types';

export function exportSheetDxf(doc: CadBlueprintJSON, sheetId?: string): string {
  const sheet = (sheetId ? doc.sheets.find((s) => s.id === sheetId) : doc.sheets[0]) ?? doc.sheets[0];
  if (!sheet) return '';

  const out: Array<string | number> = [];
  const push = (code: number, val: string | number) => out.push(code, val);
  const cx = (x: number) => Number(x.toFixed(2));
  const cy = (screenY: number) => Number((-screenY).toFixed(2)); // В AutoCAD ось Y смотрит вверх!

  push(0, 'SECTION'); push(2, 'HEADER');
  push(9, '$INSUNITS'); push(70, 4); // 4 = миллиметры
  push(0, 'ENDSEC');

  push(0, 'SECTION'); push(2, 'TABLES');
  push(0, 'TABLE'); push(2, 'LTYPE'); push(70, 2);
  push(0, 'LTYPE'); push(2, 'CONTINUOUS'); push(70, 0); push(3, 'Solid'); push(72, 65); push(73, 0); push(40, 0);
  push(0, 'LTYPE'); push(2, 'DASHED'); push(70, 0); push(3, 'Dashed'); push(72, 65); push(73, 2); push(40, 9); push(49, 6); push(49, -3);
  push(0, 'ENDTAB');

  const layers = Object.values(doc.layers);
  push(0, 'TABLE'); push(2, 'LAYER'); push(70, layers.length);
  for (const l of layers) {
    push(0, 'LAYER');
    push(2, l.id.toUpperCase());
    push(70, 0);
    push(62, l.dxfColor);
    push(6, l.lineType === 'continuous' ? 'CONTINUOUS' : 'DASHED');
  }
  push(0, 'ENDTAB');
  push(0, 'ENDSEC');

  push(0, 'SECTION'); push(2, 'ENTITIES');

  const line = (layer: string, x1: number, y1: number, x2: number, y2: number) => {
    push(0, 'LINE'); push(8, layer.toUpperCase());
    push(10, cx(x1)); push(20, cy(y1)); push(30, 0);
    push(11, cx(x2)); push(21, cy(y2)); push(31, 0);
  };
  const text = (layer: string, x: number, y: number, val: string, h = 10, rot = 0) => {
    push(0, 'TEXT'); push(8, layer.toUpperCase());
    push(10, cx(x)); push(20, cy(y)); push(30, 0);
    push(40, h); push(1, val);
    if (rot) push(50, rot);
  };

  for (const e of sheet.entities) {
    const lName = e.l.toUpperCase();
    if (e.t === 'L') {
      line(lName, e.x1, e.y1, e.x2, e.y2);
    } else if (e.t === 'P') {
      push(0, 'LWPOLYLINE'); push(8, lName);
      push(90, e.pts.length);
      push(70, e.closed ? 1 : 0);
      e.pts.forEach(([x, y]) => { push(10, cx(x)); push(20, cy(y)); });
    } else if (e.t === 'C') {
      push(0, 'CIRCLE'); push(8, lName);
      push(10, cx(e.cx)); push(20, cy(e.cy)); push(30, 0); push(40, e.r);
    } else if (e.t === 'M') {
      const d = e.shape === 'cross' ? e.size * 0.75 : e.size;
      if (e.shape === 'cross') {
        line(lName, e.x - d, e.y - d, e.x + d, e.y + d);
        line(lName, e.x - d, e.y + d, e.x + d, e.y - d);
      } else {
        line(lName, e.x - d, e.y, e.x + d, e.y);
        line(lName, e.x, e.y - d, e.x, e.y + d);
      }
    } else if (e.t === 'T') {
      text(lName, e.x, e.y, e.text, e.size, e.rot ? -e.rot : 0);
    } else if (e.t === 'DL') {
      if (e.dir === 'h') {
        const ly = e.y1 + e.offset;
        line(lName, e.x1, e.y1, e.x1, ly);
        line(lName, e.x2, e.y2, e.x2, ly);
        line(lName, e.x1, ly, e.x2, ly);
        text(lName, (e.x1 + e.x2) / 2, ly - 5, e.text, 10);
      } else {
        const lx = e.x1 + e.offset;
        line(lName, e.x1, e.y1, lx, e.y1);
        line(lName, e.x2, e.y2, lx, e.y2);
        line(lName, lx, e.y1, lx, e.y2);
        text(lName, lx - 5, (e.y1 + e.y2) / 2, e.text, 10, 90);
      }
    }
  }

  push(0, 'ENDSEC'); push(0, 'EOF');
  return out.join('\n');
}