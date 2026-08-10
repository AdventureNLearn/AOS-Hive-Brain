import * as THREE from "three";
import { HIVE_NODES, type HiveModeId, type ReasonStep } from "@/data/hive-universe";
import {
  defaultEdges,
  formationForMode,
  type FormationLayout,
  type FormationScales,
  type Vec3,
} from "@/lib/hive-formations";

export type HiveSceneCallbacks = {
  onSelectNode: (id: string | null) => void;
  onStepChange: (step: ReasonStep | null, index: number) => void;
  onZoomChange?: (pct: number) => void;
};

type NodeMesh = {
  id: string;
  group: THREE.Group;
  shell: THREE.Mesh;
  core: THREE.Mesh;
  ring: THREE.Mesh;
  glass: THREE.Mesh;
  target: THREE.Vector3;
  baseScale: number;
  targetScale: number;
};

function hexToColor(hex: string) {
  return new THREE.Color(hex);
}

const ZOOM_MIN = 4.2;
const ZOOM_MAX = 28;
const ZOOM_DEFAULT = 11;

export class HiveScene {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  private root: THREE.Group;
  private nodes = new Map<string, NodeMesh>();
  private edgeLines: THREE.LineSegments | null = null;
  private edgePositions: Float32Array;
  private edgeColors: Float32Array;
  private edgePairs: [string, string][] = [];
  private maxEdges = 80;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private clock = new THREE.Timer();
  private animId = 0;
  private disposed = false;
  private mode: HiveModeId = "honeycomb";
  private layout: FormationLayout = formationForMode("honeycomb").layout;
  private scales: FormationScales = formationForMode("honeycomb").scales;
  private focus = new Set<string>();
  private activeEdges = new Set<string>();
  private orbit = { theta: 0.55, phi: 0.95, radius: ZOOM_DEFAULT };
  private targetOrbit = { theta: 0.55, phi: 0.95, radius: ZOOM_DEFAULT };
  private lookAt = new THREE.Vector3(0, 0.4, 0);
  private targetLookAt = new THREE.Vector3(0, 0.4, 0);
  private dragging = false;
  private lastX = 0;
  private lastY = 0;
  private autoRotate = true;
  private scripts: ReasonStep[] = [];
  private playT = 0;
  private playing = true;
  private lastStepIndex = -1;
  private reducedMotion = false;
  private callbacks: HiveSceneCallbacks;
  private el: HTMLElement;
  private pulse = 0;
  private pinchDist = 0;
  private moved = false;
  /** Higher right after mode change so shapes reform quickly */
  private formSnap = 0;

  constructor(el: HTMLElement, callbacks: HiveSceneCallbacks) {
    this.el = el;
    this.callbacks = callbacks;
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(el.clientWidth, el.clientHeight);
    this.renderer.setClearColor(0x000000, 0);
    el.appendChild(this.renderer.domElement);
    const canvas = this.renderer.domElement;
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.touchAction = "none";
    canvas.style.cursor = "grab";

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      42,
      el.clientWidth / Math.max(el.clientHeight, 1),
      0.1,
      160,
    );

    this.root = new THREE.Group();
    this.scene.add(this.root);

    this.addStars();
    this.addFloorGlow();

    const amb = new THREE.AmbientLight(0xb8c0ff, 0.55);
    this.scene.add(amb);
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(4, 8, 6);
    this.scene.add(key);
    const rim = new THREE.PointLight(0x8b5cf6, 40, 40);
    rim.position.set(-4, 2, -3);
    this.scene.add(rim);
    const cyan = new THREE.PointLight(0x22d3ee, 28, 35);
    cyan.position.set(5, 1, 4);
    this.scene.add(cyan);

    this.edgePositions = new Float32Array(this.maxEdges * 6);
    this.edgeColors = new Float32Array(this.maxEdges * 6);
    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute("position", new THREE.BufferAttribute(this.edgePositions, 3));
    edgeGeo.setAttribute("color", new THREE.BufferAttribute(this.edgeColors, 3));
    edgeGeo.setDrawRange(0, 0);
    const edgeMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    this.root.add(this.edgeLines);

    this.buildNodes();
    this.setMode("honeycomb", []);
    this.bindInput();
    this.onResize();
    window.addEventListener("resize", this.onResize);
    this.clock.connect(document);
    this.emitZoom();
    this.loop();
  }

  private addStars() {
    const count = 1000;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 18 + Math.random() * 45;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xc8d0ff,
      size: 0.04,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
      depthWrite: false,
    });
    this.scene.add(new THREE.Points(geo, mat));
  }

  private addFloorGlow() {
    const geo = new THREE.RingGeometry(0.4, 7.2, 64);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x6d28d9,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -3.0;
    this.root.add(ring);

    const dots = new THREE.Group();
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 8, 8),
        new THREE.MeshBasicMaterial({
          color: 0xa78bfa,
          transparent: true,
          opacity: 0.35,
        }),
      );
      m.position.set(Math.cos(a) * 3.4, -2.95, Math.sin(a) * 3.4);
      dots.add(m);
    }
    this.root.add(dots);
  }

  private geometryForKind(kind: string): THREE.BufferGeometry {
    switch (kind) {
      case "core":
        return new THREE.IcosahedronGeometry(0.42, 1);
      case "claim":
        return new THREE.OctahedronGeometry(0.42, 0);
      case "integrity":
        return new THREE.DodecahedronGeometry(0.4, 0);
      case "process":
        return new THREE.IcosahedronGeometry(0.42, 0);
      case "agent":
        return new THREE.OctahedronGeometry(0.4, 1);
      case "product":
        return new THREE.IcosahedronGeometry(0.44, 1);
      case "layer":
        return new THREE.DodecahedronGeometry(0.38, 0);
      default:
        return new THREE.IcosahedronGeometry(0.38, 0);
    }
  }

  private buildNodes() {
    for (const n of HIVE_NODES) {
      const group = new THREE.Group();
      group.userData.nodeId = n.id;

      const isCore = n.kind === "core";
      const baseScale = isCore ? 1.15 : n.kind === "product" ? 0.95 : 0.78;
      const color = hexToColor(n.color);

      const shellGeo = this.geometryForKind(n.kind);
      const shellMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.35,
        metalness: 0.35,
        roughness: 0.35,
        transparent: true,
        opacity: 0.88,
      });
      const shell = new THREE.Mesh(shellGeo, shellMat);

      const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.16, 0),
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.85,
        }),
      );

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.55, 0.018, 8, 48),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.45,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      ring.rotation.x = Math.PI / 2.4;

      const glass = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.62, 1),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.1,
          wireframe: true,
        }),
      );

      group.add(glass);
      group.add(shell);
      group.add(core);
      group.add(ring);
      group.scale.setScalar(baseScale);
      this.root.add(group);

      this.nodes.set(n.id, {
        id: n.id,
        group,
        shell,
        core,
        ring,
        glass,
        target: new THREE.Vector3(),
        baseScale,
        targetScale: baseScale,
      });
    }
  }

  setMode(mode: HiveModeId, script: ReasonStep[]) {
    this.mode = mode;
    const bundle = formationForMode(mode);
    this.layout = bundle.layout;
    this.scales = bundle.scales;
    this.edgePairs = defaultEdges(mode);
    this.scripts = script;
    this.playT = 0;
    this.lastStepIndex = -1;
    this.focus.clear();
    this.activeEdges.clear();
    this.playing = true;
    this.formSnap = 1.25; // seconds of fast morph
    this.callbacks.onStepChange(null, -1);

    // Frame the new shape; keep relative zoom feel but bias to formation camera
    this.targetOrbit.radius = clamp(bundle.camera.radius, ZOOM_MIN, ZOOM_MAX);
    this.targetOrbit.phi = bundle.camera.phi;
    this.targetLookAt.set(0, bundle.camera.targetY, 0);
    // ease orbit radius immediately a bit so shape is readable
    this.orbit.radius = this.orbit.radius * 0.35 + this.targetOrbit.radius * 0.65;

    for (const [id, mesh] of this.nodes) {
      const p = this.layout[id] ?? { x: 0, y: 0, z: 0 };
      mesh.target.set(p.x, p.y, p.z);
      mesh.targetScale = this.scales[id] ?? mesh.baseScale;
      if (mesh.group.position.lengthSq() < 0.0001) {
        mesh.group.position.copy(mesh.target);
        mesh.group.scale.setScalar(mesh.targetScale);
      }
    }
    this.rebuildEdges(this.edgePairs);
    this.emitZoom();
  }

  setPlaying(v: boolean) {
    this.playing = v;
  }

  replay() {
    this.playT = 0;
    this.lastStepIndex = -1;
    this.focus.clear();
    this.activeEdges.clear();
    this.playing = true;
    this.callbacks.onStepChange(null, -1);
  }

  zoomIn(steps = 1) {
    this.autoRotate = false;
    this.targetOrbit.radius = clamp(
      this.targetOrbit.radius * Math.pow(0.82, steps),
      ZOOM_MIN,
      ZOOM_MAX,
    );
    this.emitZoom();
  }

  zoomOut(steps = 1) {
    this.autoRotate = false;
    this.targetOrbit.radius = clamp(
      this.targetOrbit.radius * Math.pow(1.22, steps),
      ZOOM_MIN,
      ZOOM_MAX,
    );
    this.emitZoom();
  }

  resetView() {
    const bundle = formationForMode(this.mode);
    this.targetOrbit.radius = bundle.camera.radius;
    this.targetOrbit.phi = bundle.camera.phi;
    this.targetOrbit.theta = this.orbit.theta;
    this.targetLookAt.set(0, bundle.camera.targetY, 0);
    this.autoRotate = true;
    this.emitZoom();
  }

  getZoomPct() {
    const t = (ZOOM_MAX - this.orbit.radius) / (ZOOM_MAX - ZOOM_MIN);
    return Math.round(25 + t * 225);
  }

  private emitZoom() {
    this.callbacks.onZoomChange?.(this.getZoomPct());
  }

  private rebuildEdges(pairs: [string, string][]) {
    this.edgePairs = pairs.slice(0, this.maxEdges);
    this.syncEdgeBuffers();
  }

  private syncEdgeBuffers() {
    if (!this.edgeLines) return;
    const pos = this.edgePositions;
    const col = this.edgeColors;
    let i = 0;
    for (const [a, b] of this.edgePairs) {
      const na = this.nodes.get(a);
      const nb = this.nodes.get(b);
      if (!na || !nb) continue;
      const key = edgeKey(a, b);
      const active = this.activeEdges.has(key) || this.focus.has(a) || this.focus.has(b);
      pos[i * 6] = na.group.position.x;
      pos[i * 6 + 1] = na.group.position.y;
      pos[i * 6 + 2] = na.group.position.z;
      pos[i * 6 + 3] = nb.group.position.x;
      pos[i * 6 + 4] = nb.group.position.y;
      pos[i * 6 + 5] = nb.group.position.z;

      const ca = (na.shell.material as THREE.MeshStandardMaterial).color;
      const cb = (nb.shell.material as THREE.MeshStandardMaterial).color;
      const boost = active ? 1.45 : 0.5;
      col[i * 6] = ca.r * boost;
      col[i * 6 + 1] = ca.g * boost;
      col[i * 6 + 2] = ca.b * boost;
      col[i * 6 + 3] = cb.r * boost;
      col[i * 6 + 4] = cb.g * boost;
      col[i * 6 + 5] = cb.b * boost;
      i++;
    }
    const geo = this.edgeLines.geometry;
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
    geo.setDrawRange(0, i * 2);
  }

  private bindInput() {
    const canvas = this.renderer.domElement;
    canvas.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
    canvas.addEventListener("wheel", this.onWheel, { passive: false });
    canvas.addEventListener("click", this.onClick);
    canvas.addEventListener("touchstart", this.onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", this.onTouchMove, { passive: false });
    canvas.addEventListener("touchend", this.onTouchEnd, { passive: true });
  }

  private onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    this.dragging = true;
    this.moved = false;
    this.autoRotate = false;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.renderer.domElement.style.cursor = "grabbing";
    this.renderer.domElement.setPointerCapture(e.pointerId);
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.dragging) return;
    const dx = e.clientX - this.lastX;
    const dy = e.clientY - this.lastY;
    if (Math.abs(dx) + Math.abs(dy) > 2) this.moved = true;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.targetOrbit.theta -= dx * 0.005;
    this.targetOrbit.phi = clamp(this.targetOrbit.phi + dy * 0.005, 0.2, Math.PI - 0.2);
    this.orbit.theta = this.targetOrbit.theta;
    this.orbit.phi = this.targetOrbit.phi;
  };

  private onPointerUp = (e: PointerEvent) => {
    this.dragging = false;
    this.renderer.domElement.style.cursor = "grab";
    try {
      this.renderer.domElement.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    this.autoRotate = false;
    const factor = e.deltaY > 0 ? 1.08 : 0.92;
    this.targetOrbit.radius = clamp(this.targetOrbit.radius * factor, ZOOM_MIN, ZOOM_MAX);
    this.orbit.radius += (this.targetOrbit.radius - this.orbit.radius) * 0.45;
    this.emitZoom();
  };

  private onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      this.pinchDist = touchDist(e.touches[0]!, e.touches[1]!);
      this.autoRotate = false;
    } else if (e.touches.length === 1) {
      this.dragging = true;
      this.moved = false;
      this.autoRotate = false;
      this.lastX = e.touches[0]!.clientX;
      this.lastY = e.touches[0]!.clientY;
    }
  };

  private onTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const d = touchDist(e.touches[0]!, e.touches[1]!);
      if (this.pinchDist > 0) {
        const ratio = this.pinchDist / d;
        this.targetOrbit.radius = clamp(
          this.targetOrbit.radius * ratio,
          ZOOM_MIN,
          ZOOM_MAX,
        );
        this.orbit.radius = this.targetOrbit.radius;
        this.emitZoom();
      }
      this.pinchDist = d;
    } else if (e.touches.length === 1 && this.dragging) {
      e.preventDefault();
      const t = e.touches[0]!;
      const dx = t.clientX - this.lastX;
      const dy = t.clientY - this.lastY;
      if (Math.abs(dx) + Math.abs(dy) > 2) this.moved = true;
      this.lastX = t.clientX;
      this.lastY = t.clientY;
      this.targetOrbit.theta -= dx * 0.005;
      this.targetOrbit.phi = clamp(this.targetOrbit.phi + dy * 0.005, 0.2, Math.PI - 0.2);
      this.orbit.theta = this.targetOrbit.theta;
      this.orbit.phi = this.targetOrbit.phi;
    }
  };

  private onTouchEnd = (e: TouchEvent) => {
    if (e.touches.length < 2) this.pinchDist = 0;
    if (e.touches.length === 0) this.dragging = false;
  };

  private onClick = (e: MouseEvent) => {
    if (this.moved) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const meshes = [...this.nodes.values()].map((n) => n.shell);
    const hits = this.raycaster.intersectObjects(meshes, false);
    if (hits[0]) {
      const group = hits[0].object.parent as THREE.Group;
      const id = group?.userData?.nodeId as string | undefined;
      this.callbacks.onSelectNode(id ?? null);
    } else {
      this.callbacks.onSelectNode(null);
    }
  };

  private onResize = () => {
    const w = this.el.clientWidth;
    const h = Math.max(this.el.clientHeight, 1);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  };

  private applyReasoning(dt: number) {
    if (!this.playing || this.scripts.length === 0) return;
    this.playT += dt;
    let idx = -1;
    for (let i = 0; i < this.scripts.length; i++) {
      if (this.playT >= this.scripts[i]!.t) idx = i;
    }
    if (idx !== this.lastStepIndex) {
      this.lastStepIndex = idx;
      if (idx >= 0) {
        const step = this.scripts[idx]!;
        this.focus = new Set(step.focusNodeIds);
        this.activeEdges.clear();
        for (const [a, b] of step.edgePairs ?? []) {
          this.activeEdges.add(edgeKey(a, b));
        }
        const base = defaultEdges(this.mode);
        const extra = step.edgePairs ?? [];
        const merged = [...base];
        for (const e of extra) {
          if (!merged.some(([a, b]) => edgeKey(a, b) === edgeKey(e[0], e[1]))) {
            merged.push(e);
          }
        }
        this.edgePairs = merged;
        this.callbacks.onStepChange(step, idx);
      } else {
        this.callbacks.onStepChange(null, -1);
      }
    }
    const last = this.scripts[this.scripts.length - 1];
    if (last && this.playT > last.t + 2.8) {
      this.playT = 0;
      this.lastStepIndex = -1;
      this.focus.clear();
      this.activeEdges.clear();
      this.edgePairs = defaultEdges(this.mode);
    }
  }

  private loop = () => {
    if (this.disposed) return;
    this.animId = requestAnimationFrame(this.loop);
    this.clock.update();
    let dt = this.clock.getDelta();
    if (dt > 0.1) dt = 0.1;

    this.pulse += dt;
    if (this.formSnap > 0) this.formSnap = Math.max(0, this.formSnap - dt);
    this.applyReasoning(dt);

    if (this.autoRotate && !this.reducedMotion) {
      this.targetOrbit.theta += dt * 0.12;
    }

    const ease = 1 - Math.exp(-5.5 * dt);
    this.orbit.radius += (this.targetOrbit.radius - this.orbit.radius) * ease;
    this.orbit.theta += (this.targetOrbit.theta - this.orbit.theta) * Math.min(1, ease * 2);
    this.orbit.phi += (this.targetOrbit.phi - this.orbit.phi) * ease;
    this.lookAt.lerp(this.targetLookAt, ease);

    const { theta, phi, radius } = this.orbit;
    this.camera.position.set(
      this.lookAt.x + radius * Math.sin(phi) * Math.sin(theta),
      this.lookAt.y + radius * Math.cos(phi),
      this.lookAt.z + radius * Math.sin(phi) * Math.cos(theta),
    );
    this.camera.lookAt(this.lookAt);

    // Fast morph after mode switch so reasoning shapes read clearly
    const morphRate = this.formSnap > 0 ? 9.5 : 3.4;
    const lerp = 1 - Math.exp(-morphRate * dt);
    for (const mesh of this.nodes.values()) {
      mesh.group.position.lerp(mesh.target, lerp);
      const focused = this.focus.size === 0 || this.focus.has(mesh.id);
      const dim = this.focus.size > 0 && !this.focus.has(mesh.id);
      const scaleTarget =
        mesh.targetScale * (focused && this.focus.size ? 1.22 : 1) * (dim ? 0.62 : 1);
      const s = mesh.group.scale.x + (scaleTarget - mesh.group.scale.x) * lerp;
      mesh.group.scale.setScalar(s);

      const mat = mesh.shell.material as THREE.MeshStandardMaterial;
      const wantEmissive = dim ? 0.1 : focused && this.focus.size ? 0.95 : 0.38;
      mat.emissiveIntensity += (wantEmissive - mat.emissiveIntensity) * lerp;
      mat.opacity += ((dim ? 0.28 : 0.92) - mat.opacity) * lerp;

      const gmat = mesh.glass.material as THREE.MeshBasicMaterial;
      const hub = mesh.targetScale >= 1.15;
      gmat.opacity = dim ? 0.03 : hub || (focused && this.focus.size) ? 0.16 : 0.08;

      // Scale glass bubble with hub importance
      mesh.glass.scale.setScalar(hub ? 1.15 : 1);

      mesh.ring.rotation.z += dt * (dim ? 0.2 : 0.85);
      mesh.group.rotation.y += dt * 0.22;
      if (!this.reducedMotion && this.formSnap <= 0) {
        mesh.group.position.y += Math.sin(this.pulse * 1.4 + mesh.target.x) * 0.0015;
      }
    }

    this.syncEdgeBuffers();
    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.animId);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    const canvas = this.renderer.domElement;
    canvas.removeEventListener("pointerdown", this.onPointerDown);
    canvas.removeEventListener("wheel", this.onWheel);
    canvas.removeEventListener("click", this.onClick);
    canvas.removeEventListener("touchstart", this.onTouchStart);
    canvas.removeEventListener("touchmove", this.onTouchMove);
    canvas.removeEventListener("touchend", this.onTouchEnd);
    this.clock.dispose();
    this.renderer.dispose();
    canvas.remove();
  }
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function edgeKey(a: string, b: string) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function touchDist(a: Touch, b: Touch) {
  const dx = a.clientX - b.clientX;
  const dy = a.clientY - b.clientY;
  return Math.hypot(dx, dy);
}

void (0 as unknown as Vec3);
