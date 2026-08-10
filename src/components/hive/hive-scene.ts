import * as THREE from "three";
import { HIVE_NODES, type HiveModeId, type ReasonStep } from "@/data/hive-universe";
import {
  defaultEdges,
  formationForMode,
  type FormationLayout,
  type FormationScales,
} from "@/lib/hive-formations";
import { PLAY_END_DWELL_SEC } from "@/lib/decision/store";

export type HiveSceneCallbacks = {
  onSelectNode: (id: string | null) => void;
  /** Desktop hover only — null when pointer leaves nodes */
  onHoverNode?: (id: string | null, screen?: { x: number; y: number }) => void;
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

function edgeKey(a: string, b: string) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

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
  private dragMoved = false;
  private lastX = 0;
  private lastY = 0;
  private pointerDownX = 0;
  private pointerDownY = 0;
  private autoRotate = true;
  private scripts: ReasonStep[] = [];
  private playT = 0;
  private playing = true;
  private lastStepIndex = -1;
  private reducedMotion = false;
  private formSnap = 0;
  private pinchDist = 0;
  private pulse = 0;
  private hoverId: string | null = null;
  private selectedId: string | null = null;
  private suppressClickUntil = 0;
  private callbacks: HiveSceneCallbacks;
  private el: HTMLElement;

  constructor(el: HTMLElement, callbacks: HiveSceneCallbacks) {
    this.el = el;
    this.callbacks = callbacks;
    this.reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const w = el.clientWidth || 800;
    const h = Math.max(el.clientHeight, 1);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x07060c, 0.028);

    this.camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 120);
    this.camera.position.set(0, 4, ZOOM_DEFAULT);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(w, h, false);
    this.renderer.setClearColor(0x000000, 0);
    const canvas = this.renderer.domElement;
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.touchAction = "none";
    el.appendChild(canvas);

    this.root = new THREE.Group();
    this.scene.add(this.root);

    const amb = new THREE.AmbientLight(0xb8b0d0, 0.55);
    this.scene.add(amb);
    const key = new THREE.DirectionalLight(0xffffff, 1.05);
    key.position.set(4, 8, 6);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0x7c6cff, 0.45);
    fill.position.set(-5, 2, -3);
    this.scene.add(fill);
    const rim = new THREE.PointLight(0x22d3ee, 0.8, 40);
    rim.position.set(0, -2, 4);
    this.scene.add(rim);

    this.edgePositions = new Float32Array(this.maxEdges * 6);
    this.edgeColors = new Float32Array(this.maxEdges * 6);
    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(this.edgePositions, 3),
    );
    edgeGeo.setAttribute("color", new THREE.BufferAttribute(this.edgeColors, 3));
    edgeGeo.setDrawRange(0, 0);
    const edgeMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    this.edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    this.root.add(this.edgeLines);

    this.buildNodes();
    this.bindInput();
    window.addEventListener("resize", this.onResize);

    this.setMode("honeycomb", []);
    this.animId = requestAnimationFrame(this.loop);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.animId);
    window.removeEventListener("resize", this.onResize);
    this.unbindInput();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement === this.el) {
      this.el.removeChild(this.renderer.domElement);
    }
  }

  private buildNodes() {
    for (const n of HIVE_NODES) {
      const color = hexToColor(n.color);
      const baseScale =
        n.kind === "core" ? 1.35 : n.kind === "product" ? 1.05 : 0.92;

      const group = new THREE.Group();
      group.userData.nodeId = n.id;

      const shellGeo = new THREE.IcosahedronGeometry(0.42, 1);
      const shellMat = new THREE.MeshStandardMaterial({
        color: color.clone().multiplyScalar(0.55),
        emissive: color,
        emissiveIntensity: 0.38,
        metalness: 0.25,
        roughness: 0.35,
        transparent: true,
        opacity: 0.92,
      });
      const shell = new THREE.Mesh(shellGeo, shellMat);

      const coreGeo = new THREE.IcosahedronGeometry(0.18, 0);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: color,
        emissiveIntensity: 0.8,
        metalness: 0.4,
        roughness: 0.2,
      });
      const core = new THREE.Mesh(coreGeo, coreMat);

      const ringGeo = new THREE.TorusGeometry(0.55, 0.018, 8, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.45,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2.4;

      const glassGeo = new THREE.SphereGeometry(0.62, 24, 24);
      const glassMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.08,
        depthWrite: false,
      });
      const glass = new THREE.Mesh(glassGeo, glassMat);

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
    this.playing = true;
    this.formSnap = 1.25;
    this.playT = 0;
    this.lastStepIndex = -1;
    this.activeEdges.clear();

    // Frame the new shape; keep relative zoom feel but bias to formation camera
    this.targetOrbit.radius = clamp(bundle.camera.radius, ZOOM_MIN, ZOOM_MAX);
    this.targetOrbit.phi = bundle.camera.phi;
    this.targetLookAt.set(0, bundle.camera.targetY, 0);
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

    // Seed first step focus immediately — never flash "all nodes lit"
    this.seedScriptFocus(true);
    this.rebuildEdges(this.edgePairs);
    this.emitZoom();
  }

  setPlaying(v: boolean) {
    this.playing = v;
  }

  replay() {
    this.playT = 0;
    this.lastStepIndex = -1;
    this.activeEdges.clear();
    this.playing = true;
    this.edgePairs = defaultEdges(this.mode);
    this.seedScriptFocus(true);
    this.rebuildEdges(this.edgePairs);
  }

  /** Jump PLAY timeline to a spine step (for scrubber). */
  seekToStep(index: number) {
    if (this.scripts.length === 0) return;
    const i = Math.max(0, Math.min(this.scripts.length - 1, index));
    const step = this.scripts[i]!;
    this.playT = step.t;
    this.lastStepIndex = -1;
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
    this.lastStepIndex = i;
    this.callbacks.onStepChange(step, i);
  }

  /**
   * Apply first script step (or neutral rest). Avoids empty focus while a
   * script is active — empty focus used to light every node (full-field glitch).
   */
  private seedScriptFocus(emitStep: boolean) {
    if (this.scripts.length === 0) {
      this.focus.clear();
      this.lastStepIndex = -1;
      if (emitStep) this.callbacks.onStepChange(null, -1);
      return;
    }
    const first = this.scripts[0]!;
    // Land on first step timeline immediately so cards + lights match
    this.playT = first.t;
    this.lastStepIndex = 0;
    this.focus = new Set(first.focusNodeIds);
    this.activeEdges.clear();
    for (const [a, b] of first.edgePairs ?? []) {
      this.activeEdges.add(edgeKey(a, b));
    }
    const base = defaultEdges(this.mode);
    const extra = first.edgePairs ?? [];
    const merged = [...base];
    for (const e of extra) {
      if (!merged.some(([a, b]) => edgeKey(a, b) === edgeKey(e[0], e[1]))) {
        merged.push(e);
      }
    }
    this.edgePairs = merged;
    if (emitStep) this.callbacks.onStepChange(first, 0);
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
    const t =
      (this.orbit.radius - ZOOM_MIN) / Math.max(ZOOM_MAX - ZOOM_MIN, 0.001);
    return Math.round((1 - t) * 100 + 40);
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
    let i = 0;
    const pos = this.edgePositions;
    const col = this.edgeColors;
    for (const [a, b] of this.edgePairs) {
      if (i >= this.maxEdges) break;
      const na = this.nodes.get(a);
      const nb = this.nodes.get(b);
      if (!na || !nb) continue;
      const ax = na.group.position.x;
      const ay = na.group.position.y;
      const az = na.group.position.z;
      const bx = nb.group.position.x;
      const by = nb.group.position.y;
      const bz = nb.group.position.z;
      const o = i * 6;
      pos[o] = ax;
      pos[o + 1] = ay;
      pos[o + 2] = az;
      pos[o + 3] = bx;
      pos[o + 4] = by;
      pos[o + 5] = bz;

      const active =
        this.activeEdges.has(edgeKey(a, b)) ||
        (this.focus.size > 0 && (this.focus.has(a) || this.focus.has(b)));
      const intensity = active ? 0.95 : 0.28;
      const ca = (na.shell.material as THREE.MeshStandardMaterial).emissive;
      const cb = (nb.shell.material as THREE.MeshStandardMaterial).emissive;
      col[o] = ca.r * intensity;
      col[o + 1] = ca.g * intensity;
      col[o + 2] = ca.b * intensity;
      col[o + 3] = cb.r * intensity;
      col[o + 4] = cb.g * intensity;
      col[o + 5] = cb.b * intensity;
      i++;
    }
    const geo = this.edgeLines.geometry;
    const posAttr = geo.getAttribute("position") as THREE.BufferAttribute;
    const colAttr = geo.getAttribute("color") as THREE.BufferAttribute;
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    geo.setDrawRange(0, i * 2);
  }

  private bindInput() {
    const c = this.renderer.domElement;
    c.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
    c.addEventListener("pointermove", this.onCanvasHover);
    c.addEventListener("pointerleave", this.onCanvasLeave);
    c.addEventListener("wheel", this.onWheel, { passive: false });
    c.addEventListener("click", this.onClick);
    c.addEventListener("touchstart", this.onTouchStart, { passive: false });
    c.addEventListener("touchmove", this.onTouchMove, { passive: false });
    c.addEventListener("touchend", this.onTouchEnd);
  }

  private unbindInput() {
    const c = this.renderer.domElement;
    c.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    c.removeEventListener("pointermove", this.onCanvasHover);
    c.removeEventListener("pointerleave", this.onCanvasLeave);
    c.removeEventListener("wheel", this.onWheel);
    c.removeEventListener("click", this.onClick);
    c.removeEventListener("touchstart", this.onTouchStart);
    c.removeEventListener("touchmove", this.onTouchMove);
    c.removeEventListener("touchend", this.onTouchEnd);
  }

  private pickNodeAt(clientX: number, clientY: number): string | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const meshes = [...this.nodes.values()].map((n) => n.shell);
    const hits = this.raycaster.intersectObjects(meshes, false);
    if (!hits[0]) return null;
    const group = hits[0].object.parent as THREE.Group;
    return (group?.userData?.nodeId as string | undefined) ?? null;
  }

  private setHover(id: string | null, clientX?: number, clientY?: number) {
    if (id === this.hoverId) {
      if (id && clientX != null && clientY != null) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.callbacks.onHoverNode?.(id, {
          x: clientX - rect.left,
          y: clientY - rect.top,
        });
      }
      return;
    }
    this.hoverId = id;
    if (id && clientX != null && clientY != null) {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.callbacks.onHoverNode?.(id, {
        x: clientX - rect.left,
        y: clientY - rect.top,
      });
    } else {
      this.callbacks.onHoverNode?.(null);
    }
  }

  clearSelection() {
    this.selectedId = null;
    this.callbacks.onSelectNode(null);
  }

  private onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    this.dragging = true;
    this.dragMoved = false;
    this.autoRotate = false;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.pointerDownX = e.clientX;
    this.pointerDownY = e.clientY;
    this.renderer.domElement.setPointerCapture(e.pointerId);
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.dragging) return;
    const dx = e.clientX - this.lastX;
    const dy = e.clientY - this.lastY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    if (
      Math.hypot(e.clientX - this.pointerDownX, e.clientY - this.pointerDownY) > 6
    ) {
      this.dragMoved = true;
    }
    this.targetOrbit.theta -= dx * 0.005;
    this.targetOrbit.phi = clamp(this.targetOrbit.phi + dy * 0.005, 0.2, Math.PI - 0.2);
    this.orbit.theta = this.targetOrbit.theta;
    this.orbit.phi = this.targetOrbit.phi;
  };

  private onPointerUp = () => {
    this.dragging = false;
  };

  private onCanvasHover = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    if (this.dragging) return;
    const id = this.pickNodeAt(e.clientX, e.clientY);
    this.setHover(id, e.clientX, e.clientY);
    this.renderer.domElement.style.cursor = id ? "pointer" : "grab";
  };

  private onCanvasLeave = () => {
    this.setHover(null);
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.08 : 0.92;
    this.targetOrbit.radius = clamp(this.targetOrbit.radius * factor, ZOOM_MIN, ZOOM_MAX);
    this.orbit.radius += (this.targetOrbit.radius - this.orbit.radius) * 0.45;
    this.autoRotate = false;
    this.emitZoom();
  };

  private onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      this.pinchDist = touchDist(e.touches[0]!, e.touches[1]!);
      this.dragging = false;
      this.dragMoved = true;
    } else if (e.touches.length === 1) {
      this.dragging = true;
      this.dragMoved = false;
      this.autoRotate = false;
      this.lastX = e.touches[0]!.clientX;
      this.lastY = e.touches[0]!.clientY;
      this.pointerDownX = this.lastX;
      this.pointerDownY = this.lastY;
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
        this.pinchDist = d;
        this.emitZoom();
      }
    } else if (e.touches.length === 1 && this.dragging) {
      e.preventDefault();
      const t = e.touches[0]!;
      const dx = t.clientX - this.lastX;
      const dy = t.clientY - this.lastY;
      this.lastX = t.clientX;
      this.lastY = t.clientY;
      if (
        Math.hypot(t.clientX - this.pointerDownX, t.clientY - this.pointerDownY) > 8
      ) {
        this.dragMoved = true;
      }
      this.targetOrbit.theta -= dx * 0.005;
      this.targetOrbit.phi = clamp(this.targetOrbit.phi + dy * 0.005, 0.2, Math.PI - 0.2);
      this.orbit.theta = this.targetOrbit.theta;
      this.orbit.phi = this.targetOrbit.phi;
    }
  };

  private onTouchEnd = (e: TouchEvent) => {
    if (e.touches.length < 2) this.pinchDist = 0;
    if (e.touches.length === 0) {
      if (!this.dragMoved && e.changedTouches[0]) {
        const t = e.changedTouches[0];
        const id = this.pickNodeAt(t.clientX, t.clientY);
        this.selectedId = id;
        this.callbacks.onSelectNode(id);
        // Prevent the synthetic click from toggling the same pick off
        this.suppressClickUntil = performance.now() + 450;
      }
      this.dragging = false;
      this.dragMoved = false;
    }
  };

  private onClick = (e: MouseEvent) => {
    if (performance.now() < this.suppressClickUntil) return;
    if (this.dragMoved) {
      this.dragMoved = false;
      return;
    }
    const id = this.pickNodeAt(e.clientX, e.clientY);
    if (id && id === this.selectedId) {
      this.selectedId = null;
      this.callbacks.onSelectNode(null);
      return;
    }
    this.selectedId = id;
    this.callbacks.onSelectNode(id);
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
      }
      // Never clear focus to empty while a script is loaded — that lights all nodes.
    }

    const last = this.scripts[this.scripts.length - 1];
    if (last && this.playT > last.t + PLAY_END_DWELL_SEC) {
      // Loop: jump straight onto first step (no all-lit interstitial)
      this.edgePairs = defaultEdges(this.mode);
      this.seedScriptFocus(true);
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

    const morphRate = this.formSnap > 0 ? 9.5 : 3.4;
    const lerp = 1 - Math.exp(-morphRate * dt);
    const scriptActive = this.scripts.length > 0;

    for (const mesh of this.nodes.values()) {
      mesh.group.position.lerp(mesh.target, lerp);

      // During PLAY: only step-focused nodes light up.
      // Idle (no script): even ambient field — never a hard "all max" flash.
      let focused: boolean;
      let dim: boolean;
      const isHover = this.hoverId === mesh.id;
      const isSelected = this.selectedId === mesh.id;
      if (scriptActive) {
        focused = this.focus.size > 0 && this.focus.has(mesh.id);
        dim = this.focus.size > 0 ? !this.focus.has(mesh.id) : true;
        // User pick always readable even during play
        if (isHover || isSelected) {
          focused = true;
          dim = false;
        }
      } else {
        focused = isHover || isSelected;
        dim = false;
      }

      const scaleTarget =
        mesh.targetScale *
        (focused ? 1.22 : 1) *
        (isSelected ? 1.12 : isHover ? 1.06 : 1) *
        (dim ? 0.62 : 1);
      const s = mesh.group.scale.x + (scaleTarget - mesh.group.scale.x) * lerp;
      mesh.group.scale.setScalar(s);

      const mat = mesh.shell.material as THREE.MeshStandardMaterial;
      const wantEmissive = dim
        ? 0.1
        : isSelected
          ? 1.15
          : isHover
            ? 1.05
            : focused
              ? 0.95
              : 0.38;
      mat.emissiveIntensity += (wantEmissive - mat.emissiveIntensity) * lerp;
      mat.opacity += ((dim ? 0.28 : 0.92) - mat.opacity) * lerp;

      const gmat = mesh.glass.material as THREE.MeshBasicMaterial;
      const hub = mesh.targetScale >= 1.15;
      gmat.opacity = dim
        ? 0.03
        : isSelected || isHover
          ? 0.22
          : hub || focused
            ? 0.16
            : 0.08;

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
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function touchDist(a: Touch, b: Touch) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}
