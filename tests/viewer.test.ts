// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { CadDocument, line, rect, stringifyDocument, packVcad } from '../src';
import { CadViewer, fitViewBox, mountCadViewer, panBy, resizeViewBox, screenToSvg, zoomAt } from '../src/viewer';
import type { CadViewerEvent } from '../src/viewer';

describe('viewer: view math (Этап 5.4)', () => {
  const size = { width: 400, height: 200 };

  it('fit keeps the aspect ratio of the container and centres the content', () => {
    const v = fitViewBox({ x: 0, y: 0, width: 100, height: 100 }, size);
    expect(v).toEqual({ x: -50, y: 0, width: 200, height: 100 });
    const m = fitViewBox({ x: 0, y: 0, width: 100, height: 100 }, size, 10);
    expect(m.height).toBeCloseTo(100 * (200 / 180));
  });

  it('zoom keeps the point under the cursor; pan follows the pointer', () => {
    const v = { x: 0, y: 0, width: 400, height: 200 };
    const before = screenToSvg(v, size, 100, 50);
    const z = zoomAt(v, size, 2, 100, 50);
    expect(screenToSvg(z, size, 100, 50)).toEqual(before);
    expect(z.width).toBe(200);
    expect(panBy(v, size, 10, -5)).toEqual({ x: -10, y: 5, width: 400, height: 200 });
    expect(resizeViewBox(v, size, { width: 200, height: 200 })).toEqual({ x: 100, y: 0, width: 200, height: 200 });
  });
});

function makeDoc(): CadDocument {
  const doc = new CadDocument();
  doc.layers.create('Контур', { color: '#ff0000' });
  doc.layers.create('Скрытый', { visible: false });
  doc.addSheet('A', [rect(0, 0, 100, 50, { layer: 'Контур', id: 'step-1' }), line([0, 0], [100, 50], { layer: 'Скрытый' })]);
  return doc;
}

describe('viewer: CadViewer component', () => {
  it('renders inline SVG, fits, zooms, toggles layers and emits events', () => {
    const host = document.createElement('div');
    document.body.append(host);
    const events: CadViewerEvent['type'][] = [];
    const viewer = new CadViewer(host, makeDoc(), { toolbar: true });
    viewer.on((e) => events.push(e.type));
    const svg = host.querySelector('svg')!;
    expect(svg).toBeTruthy();
    expect(svg.getAttribute('preserveAspectRatio')).toBe('xMidYMid meet');
    expect(host.querySelectorAll('button')).toHaveLength(5);

    expect(viewer.zoom).toBeCloseTo(1);
    viewer.zoomIn();
    expect(viewer.zoom).toBeCloseTo(1.2);
    viewer.fitToView();
    expect(viewer.zoom).toBeCloseTo(1);

    expect(viewer.layers().find((l) => l.name === 'Скрытый')!.visible).toBe(false);
    viewer.setLayerVisible('Скрытый', true);
    const style = host.querySelector('style')!.textContent ?? '';
    expect(style).toMatch(/display:inline !important/);
    viewer.isolateLayer('Контур');
    expect(viewer.layers().filter((l) => l.visible).map((l) => l.name)).toEqual(['Контур']);
    expect(viewer.document.layers.get('0')!.visible).toBe(true); // документ не меняется
    viewer.showAllLayers();
    expect(events).toContain('view');
    expect(events).toContain('layers');

    expect(viewer.toSvgString()).toContain('<svg');
    expect(viewer.toDxfString()).toContain('ENTITIES');
    expect(viewer.toVcadBytes()[0]).toBe(0x50);
    expect(viewer.sheet).toBe('sheet-1');
    viewer.destroy();
    expect(host.children).toHaveLength(0);
  });

  it('accepts compact JSON and .vcad bytes (as stored by Laravel / Filament)', () => {
    const host = document.createElement('div');
    const fromJson = mountCadViewer(host, stringifyDocument(makeDoc()));
    expect(fromJson.document.layers.has('Контур')).toBe(true);
    fromJson.setDocument(packVcad(makeDoc()));
    expect(host.querySelector('svg')).toBeTruthy();
    fromJson.destroy();
  });

  it('wheel zooms to the cursor; click on an entity emits select with its id', () => {
    const host = document.createElement('div');
    document.body.append(host);
    const viewer = new CadViewer(host, makeDoc());
    const stage = host.querySelector('.cad-viewer')!.children[1] as HTMLElement;
    stage.dispatchEvent(new WheelEvent('wheel', { deltaY: -100, clientX: 10, clientY: 10, bubbles: true, cancelable: true }));
    expect(viewer.zoom).toBeCloseTo(1.2);
    const selected: unknown[] = [];
    viewer.on((e) => {
      if (e.type === 'select') selected.push(e.id);
    });
    const target = host.querySelector('[data-id="step-1"]')!;
    target.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, button: 0, bubbles: true }));
    target.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, button: 0, bubbles: true }));
    expect(selected).toEqual(['step-1']);
    viewer.destroy();
  });
});
