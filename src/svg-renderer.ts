import type { CadBlueprintJSON, CadEntity, CadSheetData, LayerStyle } from './types';

const FONT_MONO = "Consolas, 'Courier New', monospace";
const FONT_SANS = "'Segoe UI', Arial, sans-serif";

function computeSheetBounds(sheet: CadSheetData) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const expand = (x: number, y: number) => {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  };

  for (const e of sheet.entities) {
    switch (e.t) {
      case 'L': expand(e.x1, e.y1); expand(e.x2, e.y2); break;
      case 'P': e.pts.forEach(([x, y]) => expand(x, y)); break;
      case 'C': expand(e.cx - e.r, e.cy - e.r); expand(e.cx + e.r, e.cy + e.r); break;
      case 'M': expand(e.x - e.size * 1.5, e.y - e.size * 1.5); expand(e.x + e.size * 1.5, e.y + e.size * 1.5); break;
      case 'T': {
        const w = e.text.length * (e.size * 0.58);
        const x0 = e.anchor === 'middle' ? e.x - w / 2 : e.anchor === 'end' ? e.x - w : e.x;
        expand(x0, e.y - e.size); expand(x0 + w, e.y + 6);
        break;
      }
      case 'DL': {
        expand(e.x1, e.y1); expand(e.x2, e.y2);
        if (e.dir === 'h') {
          const ly = e.y1 + e.offset;
          expand(e.x1, ly - 22); expand(e.x2, ly + 22);
        } else {
          const lx = e.x1 + e.offset;
          const pad = (e.text.length * 8) + 14;
          expand(lx - pad, e.y1); expand(lx + pad, e.y2);
        }
        break;
      }
      case 'LA': expand(e.axisX - 25, e.baseY - e.count * e.stepH - 10); expand(e.axisX + 10, e.baseY + 10); break;
      case 'LM': expand(e.x, e.y); expand(e.symX + 75, e.y - 22); expand(e.symX + 75, e.y + 22); break;
      case 'SC': expand(e.x - 42, e.y - 42); expand(e.x + 42, e.y + 42); break;
    }
  }

  if (!Number.isFinite(minX)) return { minX: 0, minY: 0, width: 400, height: 300, contentMaxY: 200, contentMinX: 40 };

  const contentMinX = minX;
  const contentMaxY = maxY;
  const padX = 55;
  const padTop = sheet.title ? 85 : 45;
  const legendHeight = sheet.legend.length > 0 ? sheet.legend.length * 24 + 40 : 0;
  const padBottom = 50 + legendHeight;

  minX -= padX;
  maxX += padX;
  minY -= padTop;
  maxY += padBottom;

  // Если легенда длинная по тексту, гарантируем минимальную ширину холста
  const minLegendW = sheet.legend.length > 0 ? 680 : 0;
  const width = Math.max(maxX - minX, minLegendW);
  const height = maxY - minY;

  return { minX, minY, width, height, contentMaxY, contentMinX };
}

function dashAttr(layer: LayerStyle): string {
  if (layer.lineType === 'dashed') return 'stroke-dasharray="6 3"';
  if (layer.lineType === 'dashdot') return 'stroke-dasharray="10 3 2 3"';
  if (layer.lineType === 'dotted') return 'stroke-dasharray="2 2"';
  return '';
}

function fillValue(layer: LayerStyle): string {
  if (layer.hatch === 'steel-45') return 'url(#cad-steel-hatch)';
  if (layer.hatch === 'board-45') return 'url(#cad-board-hatch)';
  if (layer.hatch === 'cladding-45') return 'url(#cad-cladding-hatch)';
  return layer.fill ?? 'none';
}

export function renderSheetSvg(doc: CadBlueprintJSON, sheetId?: string): string {
  const sheet = (sheetId ? doc.sheets.find((s) => s.id === sheetId) : doc.sheets[0]) ?? doc.sheets[0];
  if (!sheet) return '<svg xmlns="http://www.w3.org/2000/svg"></svg>';

  const b = computeSheetBounds(sheet);
  const vb = `${Number(b.minX.toFixed(1))} ${Number(b.minY.toFixed(1))} ${Number(b.width.toFixed(1))} ${Number(b.height.toFixed(1))}`;
  const out: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(b.width)}" height="${Math.round(b.height)}" viewBox="${vb}" style="display:block;">`,
    `<defs>
      <pattern id="cad-board-hatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="8" stroke="#94a3b8" stroke-width="1.0" />
      </pattern>
      <pattern id="cad-steel-hatch" width="5" height="5" patternTransform="rotate(-45 0 0)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="5" stroke="#334155" stroke-width="0.8" />
      </pattern>
      <pattern id="cad-cladding-hatch" width="12" height="12" patternTransform="rotate(-45 0 0)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="12" stroke="#e2e8f0" stroke-width="1" />
      </pattern>
      <marker id="cad-arrow-start" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
        <polygon points="8 0.5, 0 3, 8 5.5" fill="#0284c7" />
      </marker>
      <marker id="cad-arrow-end" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
        <polygon points="0 0.5, 8 3, 0 5.5" fill="#0284c7" />
      </marker>
    </defs>`
  ];

  if (sheet.title) {
    const titleX = b.minX + b.width / 2;
    const titleY = b.minY + 34;
    out.push(`<text x="${titleX}" y="${titleY}" text-anchor="middle" font-size="16" font-weight="700" fill="#0f172a" font-family="${FONT_SANS}">${sheet.title}</text>`);
  }

  const getLayer = (id: string): LayerStyle => doc.layers[id] ?? doc.layers.contour!;

  const renderEntity = (e: CadEntity): string => {
    const l = getLayer(e.l);
    if (!l.visible) return '';
    const op = l.opacity !== undefined ? `opacity="${l.opacity}"` : '';
    const dash = dashAttr(l);

    switch (e.t) {
      case 'L':
        return `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${l.stroke}" stroke-width="${l.strokeWidth}" ${dash} ${op}/>`;
      case 'P': {
        const pts = e.pts.map(([x, y]) => `${Number(x.toFixed(2))},${Number(y.toFixed(2))}`).join(' ');
        const tag = e.closed ? 'polygon' : 'polyline';
        const bg = l.hatch && l.hatch !== 'none' && l.fill
          ? `<${tag} points="${pts}" fill="${l.fill}" stroke="none" ${op}/>`
          : '';
        return `${bg}<${tag} points="${pts}" fill="${fillValue(l)}" stroke="${l.stroke}" stroke-width="${l.strokeWidth}" stroke-linejoin="miter" ${dash} ${op}/>`;
      }
      case 'C':
        return `<circle cx="${e.cx}" cy="${e.cy}" r="${e.r}" fill="${fillValue(l)}" stroke="${l.stroke}" stroke-width="${l.strokeWidth}" ${dash} ${op}/>`;
      case 'M': {
        if (e.shape === 'plus') {
          return `<path d="M${e.x - e.size} ${e.y}H${e.x + e.size}M${e.x} ${e.y - e.size}V${e.y + e.size}" stroke="${l.stroke}" stroke-width="${l.strokeWidth}" />`;
        }
        if (e.shape === 'cross') {
          const d = e.size * 0.75;
          return `<path d="M${e.x - d} ${e.y - d}L${e.x + d} ${e.y + d}M${e.x - d} ${e.y + d}L${e.x + d} ${e.y - d}" stroke="${l.stroke}" stroke-width="${l.strokeWidth}" />`;
        }
        return `<g><circle cx="${e.x}" cy="${e.y}" r="${e.size}" fill="#ffffff" stroke="${l.stroke}" stroke-width="1.2"/><text x="${e.x}" y="${e.y + 4}" text-anchor="middle" font-size="11" font-weight="700" font-family="${FONT_SANS}" fill="${l.stroke}">${e.label ?? ''}</text></g>`;
      }
      case 'T': {
        const fam = e.mono ? FONT_MONO : FONT_SANS;
        const col = e.color ?? l.stroke;
        const tr = e.rot ? `transform="translate(${e.x} ${e.y}) rotate(${e.rot})"` : `x="${e.x}" y="${e.y}"`;
        return `<text ${tr} text-anchor="${e.anchor}" font-size="${e.size}" font-weight="${e.weight ?? 600}" fill="${col}" font-family="${fam}">${e.text}</text>`;
      }
      case 'DL': {
        const ext = `stroke="#94a3b8" stroke-width="0.8"`;
        const dim = `stroke="${l.stroke}" stroke-width="${l.strokeWidth}" marker-start="url(#cad-arrow-start)" marker-end="url(#cad-arrow-end)"`;
        if (e.dir === 'h') {
          const ly = e.y1 + e.offset;
          const ty = e.side === 'start' ? ly - 5 : ly + 15;
          const tx = (e.x1 + e.x2) / 2;
          return `<g class="dim-line">
            <line x1="${e.x1}" y1="${e.y1}" x2="${e.x1}" y2="${ly + (e.offset > 0 ? 5 : -5)}" ${ext}/>
            <line x1="${e.x2}" y1="${e.y2}" x2="${e.x2}" y2="${ly + (e.offset > 0 ? 5 : -5)}" ${ext}/>
            <line x1="${e.x1}" y1="${ly}" x2="${e.x2}" y2="${ly}" ${dim}/>
            <text x="${tx}" y="${ty}" text-anchor="middle" font-size="12" font-weight="600" fill="#0369a1" font-family="${FONT_MONO}">${e.text}</text>
          </g>`;
        }
        const lx = e.x1 + e.offset;
        const tx = e.side === 'start' ? lx - 6 : lx + 6;
        const ty = (e.y1 + e.y2) / 2 + 4;
        const anchor = e.side === 'start' ? 'end' : 'start';
        return `<g class="dim-line">
          <line x1="${e.x1}" y1="${e.y1}" x2="${lx + (e.offset > 0 ? 5 : -5)}" y2="${e.y1}" ${ext}/>
          <line x1="${e.x2}" y1="${e.y2}" x2="${lx + (e.offset > 0 ? 5 : -5)}" y2="${e.y2}" ${ext}/>
          <line x1="${lx}" y1="${e.y1}" x2="${lx}" y2="${e.y2}" ${dim}/>
          <text x="${tx}" y="${ty}" text-anchor="${anchor}" font-size="12" font-weight="600" fill="#0369a1" font-family="${FONT_MONO}">${e.text}</text>
        </g>`;
      }
      case 'LA': {
        const parts: string[] = [
          `<line x1="${e.axisX}" y1="${e.baseY}" x2="${e.axisX}" y2="${e.baseY - e.count * e.stepH}" stroke="#0284c7" stroke-width="0.8" stroke-dasharray="10 3 2 3" />`
        ];
        for (let i = 0; i < e.count; i++) {
          const yLow = e.baseY - i * e.stepH;
          const yHigh = e.baseY - (i + 1) * e.stepH;
          const yMid = (yLow + yHigh) / 2;
          parts.push(
            `<line x1="${e.axisX}" y1="${yLow}" x2="${e.axisX}" y2="${yHigh}" stroke="#0284c7" stroke-width="1.2" marker-start="url(#cad-arrow-start)" marker-end="url(#cad-arrow-end)" />`,
            `<text transform="translate(${e.axisX - 5} ${yMid}) rotate(-90)" text-anchor="middle" font-size="12" font-weight="600" fill="#0369a1" font-family="${FONT_MONO}">${Math.round(e.stepH)}</text>`
          );
        }
        return `<g class="level-axis">${parts.join('')}</g>`;
      }
      case 'LM':
        return `<g class="level-mark">
          <line x1="${e.x}" y1="${e.y}" x2="${e.symX}" y2="${e.y}" stroke="#0284c7" stroke-width="0.8" stroke-dasharray="10 3 2 3" />
          <polygon points="${e.symX - 5},${e.y - 8} ${e.symX + 5},${e.y - 8} ${e.symX},${e.y}" fill="#0284c7" />
          <line x1="${e.symX - 5}" y1="${e.y - 8}" x2="${e.symX + 62}" y2="${e.y - 8}" stroke="#0284c7" stroke-width="1.2" />
          <text x="${e.symX + 7}" y="${e.y - 11}" font-size="11" font-weight="700" fill="#dc2626" font-family="${FONT_MONO}">${e.elev}</text>
          <text x="${e.symX + 7}" y="${e.y + 15}" font-size="11" font-weight="600" fill="#0369a1" font-family="${FONT_SANS}">${e.label}</text>
        </g>`;
      case 'SC': {
        const vx = e.dir === 'right' ? 1 : e.dir === 'left' ? -1 : 0;
        const vy = e.dir === 'down' ? 1 : e.dir === 'up' ? -1 : 0;
        const px = vy !== 0 ? e.barSide : 0;
        const py = vx !== 0 ? e.barSide : 0;
        const barStart = { x: e.x - px * 4, y: e.y - py * 4 };
        const barEnd = { x: e.x + px * 26, y: e.y + py * 26 };
        const tail = { x: e.x - vx * 32, y: e.y - vy * 32 };
        const headBase = { x: e.x - vx * 10, y: e.y - vy * 10 };
        const head = `${e.x},${e.y} ${headBase.x + px * 3.5},${headBase.y + py * 3.5} ${headBase.x - px * 3.5},${headBase.y - py * 3.5}`;
        const midX = (tail.x + e.x) / 2;
        const midY = (tail.y + e.y) / 2;
        const lx = vx !== 0 ? midX : e.x + px * 11;
        const ly = vx !== 0 ? (e.barSide < 0 ? midY - 6 : midY + 15) : midY + 4;
        return `<g class="section-cut">
          <line x1="${barStart.x}" y1="${barStart.y}" x2="${barEnd.x}" y2="${barEnd.y}" stroke="#0f172a" stroke-width="3" />
          <line x1="${tail.x}" y1="${tail.y}" x2="${headBase.x}" y2="${headBase.y}" stroke="#0f172a" stroke-width="1.4" />
          <polygon points="${head}" fill="#0f172a" />
          <text x="${lx}" y="${ly}" font-size="13" font-weight="800" fill="#0f172a" text-anchor="middle" font-family="${FONT_SANS}">${e.label}</text>
        </g>`;
      }
      default:
        return '';
    }
  };

  sheet.entities.forEach((e) => out.push(renderEntity(e)));

  // Отрисовка декларативной легенды внизу чертежа
  if (sheet.legend.length > 0) {
    let rowY = b.contentMaxY + 50;
    const lx = b.contentMinX;
    for (const item of sheet.legend) {
      const l = getLayer(item.layer);
      const dash = dashAttr(l);
      if (item.icon === 'rect') {
        out.push(`<rect x="${lx}" y="${rowY - 11}" width="14" height="14" fill="${fillValue(l)}" stroke="${l.stroke}" stroke-width="${l.strokeWidth}" ${dash}/>`);
      } else if (item.icon === 'line') {
        out.push(`<line x1="${lx}" y1="${rowY - 4}" x2="${lx + 14}" y2="${rowY - 4}" stroke="${l.stroke}" stroke-width="${l.strokeWidth}" ${dash}/>`);
      } else if (item.icon === 'plus') {
        out.push(renderEntity({ t: 'M', l: item.layer, x: lx + 7, y: rowY - 4, shape: 'plus', size: 7 }));
      } else if (item.icon === 'cross') {
        out.push(renderEntity({ t: 'M', l: item.layer, x: lx + 7, y: rowY - 4, shape: 'cross', size: 7 }));
      }
      out.push(`<text x="${lx + 22}" y="${rowY}" font-size="11" font-weight="600" fill="#0f172a" font-family="${FONT_SANS}">${item.text}</text>`);
      rowY += 24;
    }
  }

  out.push('</svg>');
  return out.join('\n');
}