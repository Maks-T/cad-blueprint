import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { SectionResult } from '../src/three';
import { CROSS_BOX, PROFILE_DEPTH } from './demo-document';

export interface ThreePreviewOptions {
  /** Модель (меши), которую режет плоскость. */
  scene: THREE.Group;
  cutZ: number;
  minZ: number;
  maxZ: number;
  /** Вызывается при перетаскивании плоскости (уже округлённое значение). */
  onCut: (z: number) => void;
}

/**
 * Мини-сцена Three.js: вращение / зум мышью (OrbitControls), секущая плоскость, которую можно тянуть мышью
 * вдоль оси Z, и красный контур сечения на ней. Рендер — только по запросу (без постоянного цикла).
 */
export class ThreePreview {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly world = new THREE.Scene();
  private readonly controls: OrbitControls;
  private readonly plane: THREE.Mesh;
  private readonly planeEdge: THREE.LineSegments;
  private readonly contour = new THREE.Group();
  private readonly raycaster = new THREE.Raycaster();
  private dragging = false;
  private hover = false;
  private cutZ: number;
  private frame = 0;

  constructor(
    private readonly host: HTMLElement,
    private readonly options: ThreePreviewOptions,
  ) {
    this.cutZ = options.cutZ;
    const { width, height } = this.size();
    this.camera = new THREE.PerspectiveCamera(38, width / height, 1, 10000);
    this.camera.position.set(330, 240, 640);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    host.append(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(80, 30, PROFILE_DEPTH / 2);
    this.controls.enableDamping = false;
    this.controls.addEventListener('change', () => this.requestRender());
    this.controls.update();

    this.world.add(new THREE.HemisphereLight(0xffffff, 0x94a3b8, 1.1));
    const sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(300, 500, 400);
    this.world.add(sun);

    const material = (color: number): THREE.MeshStandardMaterial =>
      new THREE.MeshStandardMaterial({ color, metalness: 0.25, roughness: 0.55, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    options.scene.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.material = material(o.name === 'cross' ? 0x6366f1 : 0x60a5fa);
        o.add(new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, 25), new THREE.LineBasicMaterial({ color: 0x1e3a8a })));
      }
    });
    this.world.add(options.scene);

    const b = CROSS_BOX;
    const pw = b.x + b.w / 2 + 60;
    const ph = 110;
    this.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(pw, ph),
      new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false }),
    );
    this.plane.position.set(pw / 2 - 30, 30, this.cutZ);
    this.planeEdge = new THREE.LineSegments(new THREE.EdgesGeometry(this.plane.geometry), new THREE.LineBasicMaterial({ color: 0xef4444 }));
    this.plane.add(this.planeEdge);
    this.world.add(this.plane, this.contour);

    this.bindDrag();
    new ResizeObserver(() => this.resize()).observe(host);
    this.requestRender();
  }

  /** Положение плоскости извне (ползунок) и новый контур сечения. */
  setCut(z: number, section: SectionResult | null): void {
    this.cutZ = z;
    this.plane.position.z = z;
    if (section) this.setContour(section);
    this.requestRender();
  }

  /** Красный контур сечения: 2D-контуры из `sectionObject` возвращаются в 3D по базису плоскости. */
  setContour(section: SectionResult): void {
    for (const c of [...this.contour.children]) {
      this.contour.remove(c);
      (c as THREE.Line).geometry.dispose();
    }
    const { origin, xAxis, yAxis } = section.basis;
    const mat = new THREE.LineBasicMaterial({ color: 0xdc2626, depthTest: false });
    for (const loop of section.loops) {
      const pts = loop.points.map(([x, y]) => origin.clone().addScaledVector(xAxis, x).addScaledVector(yAxis, y));
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const obj = loop.closed ? new THREE.LineLoop(geom, mat) : new THREE.Line(geom, mat);
      obj.renderOrder = 10;
      this.contour.add(obj);
    }
    this.requestRender();
  }

  private size(): { width: number; height: number } {
    return { width: Math.max(this.host.clientWidth, 1), height: Math.max(this.host.clientHeight, 1) };
  }

  private resize(): void {
    const { width, height } = this.size();
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.requestRender();
  }

  private requestRender(): void {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.renderer.render(this.world, this.camera);
    });
  }

  private pointer(e: PointerEvent): THREE.Vector2 {
    const r = this.renderer.domElement.getBoundingClientRect();
    return new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  }

  private hitsPlane(e: PointerEvent): boolean {
    this.raycaster.setFromCamera(this.pointer(e), this.camera);
    return this.raycaster.intersectObject(this.plane, false).length > 0;
  }

  /** Z точки под курсором на прямой оси Z, проходящей через центр плоскости (плоскость перетаскивания смотрит на камеру). */
  private zUnderPointer(e: PointerEvent): number | null {
    this.raycaster.setFromCamera(this.pointer(e), this.camera);
    const axis = new THREE.Vector3(0, 0, 1);
    const center = this.plane.position.clone();
    const toCamera = this.camera.position.clone().sub(center);
    const normal = toCamera.sub(axis.clone().multiplyScalar(toCamera.dot(axis)));
    if (normal.lengthSq() < 1e-9) return null;
    const dragPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(normal.normalize(), center);
    const hit = this.raycaster.ray.intersectPlane(dragPlane, new THREE.Vector3());
    return hit ? hit.z : null;
  }

  private setHover(on: boolean): void {
    if (this.hover === on) return;
    this.hover = on;
    (this.plane.material as THREE.MeshBasicMaterial).opacity = on || this.dragging ? 0.32 : 0.18;
    this.renderer.domElement.style.cursor = on ? 'ns-resize' : '';
    this.requestRender();
  }

  private bindDrag(): void {
    const el = this.renderer.domElement;
    let offset = 0;
    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || !this.hitsPlane(e)) return;
      const z = this.zUnderPointer(e);
      if (z === null) return;
      this.dragging = true;
      offset = this.cutZ - z;
      this.controls.enabled = false;
      el.setPointerCapture(e.pointerId);
      e.stopImmediatePropagation();
    }, { capture: true });
    el.addEventListener('pointermove', (e) => {
      if (!this.dragging) {
        this.setHover(this.hitsPlane(e));
        return;
      }
      const z = this.zUnderPointer(e);
      if (z === null) return;
      const next = Math.round(Math.min(this.options.maxZ, Math.max(this.options.minZ, z + offset)));
      if (next !== this.cutZ) {
        this.cutZ = next;
        this.plane.position.z = next;
        this.requestRender();
        this.options.onCut(next);
      }
    });
    const end = (e: PointerEvent): void => {
      if (!this.dragging) return;
      this.dragging = false;
      this.controls.enabled = true;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      this.setHover(this.hitsPlane(e));
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  }
}
