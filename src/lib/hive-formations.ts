import type { HiveModeId } from "@/data/hive-universe";
import { HIVE_NODES } from "@/data/hive-universe";

export type Vec3 = { x: number; y: number; z: number };

/** Target positions for each node id under a formation */
export type FormationLayout = Record<string, Vec3>;

/** Per-node visual scale multipliers for a formation (hubs vs satellites) */
export type FormationScales = Record<string, number>;

export type FormationBundle = {
  layout: FormationLayout;
  scales: FormationScales;
  /** Suggested orbit framing when entering this mode */
  camera: { radius: number; phi: number; targetY: number };
};

const ALL = HIVE_NODES.map((n) => n.id);

function fillMissing(
  out: FormationLayout,
  scales: FormationScales,
  place: (i: number, n: number) => Vec3,
  defaultScale = 0.72,
) {
  const missing = ALL.filter((id) => !out[id]);
  missing.forEach((id, i) => {
    out[id] = place(i, missing.length);
    if (scales[id] == null) scales[id] = defaultScale;
  });
}

function hash01(i: number, salt = 0) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function hexPackLayout(spacing: number): FormationBundle {
  const out: FormationLayout = {};
  const scales: FormationScales = {};
  const pts: Vec3[] = [{ x: 0, y: 0.15, z: 0 }];
  let ring = 1;
  while (pts.length < ALL.length) {
    for (let side = 0; side < 6 && pts.length < ALL.length; side++) {
      for (let j = 0; j < ring && pts.length < ALL.length; j++) {
        const a0 = (Math.PI / 3) * side;
        const a1 = (Math.PI / 3) * ((side + 1) % 6);
        const t = j / ring;
        const x = (Math.cos(a0) * (1 - t) + Math.cos(a1) * t) * spacing * ring;
        const z = (Math.sin(a0) * (1 - t) + Math.sin(a1) * t) * spacing * ring;
        pts.push({
          x,
          y: 0.08 * Math.sin(ring + side) + (ring % 2) * 0.06,
          z,
        });
      }
    }
    ring++;
  }
  ALL.forEach((id, i) => {
    out[id] = pts[i] ?? { x: 0, y: 0, z: 0 };
    const n = HIVE_NODES[i]!;
    scales[id] =
      n.kind === "core" ? 1.35 : n.kind === "product" || n.kind === "process" ? 1.0 : 0.82;
  });
  return {
    layout: out,
    scales,
    camera: { radius: 12, phi: 0.95, targetY: 0.2 },
  };
}

/** Tall vertical tower + orbiting satellites — Mission Spine (video spine) */
function missionSpine(): FormationBundle {
  const spine = [
    "aos",
    "evidence",
    "sense",
    "reason",
    "build",
    "human",
    "replication",
  ];
  const out: FormationLayout = {};
  const scales: FormationScales = {};
  spine.forEach((id, i) => {
    // Strong vertical stack — primary silhouette of this mode
    out[id] = { x: 0, y: 5.8 - i * 1.55, z: 0 };
    scales[id] = 1.65 - i * 0.05;
  });
  const sats = ALL.filter((id) => !spine.includes(id));
  sats.forEach((id, i) => {
    const t = i / Math.max(sats.length - 1, 1);
    const a = t * Math.PI * 5 + (i % 2) * Math.PI;
    const r = 2.8 + (i % 4) * 0.75;
    out[id] = {
      x: Math.cos(a) * r,
      y: 5.2 - t * 9.0 + (i % 3) * 0.12,
      z: Math.sin(a) * r,
    };
    scales[id] = 0.48 + (i % 3) * 0.07;
  });
  return {
    layout: out,
    scales,
    camera: { radius: 16, phi: 1.12, targetY: 0.4 },
  };
}

/** Three huge hubs in a triangle + supporting clouds */
function integrityTriangle(): FormationBundle {
  const hubs = ["evidence", "inference", "assumption"] as const;
  const out: FormationLayout = {};
  const scales: FormationScales = {};
  hubs.forEach((id, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 3;
    out[id] = { x: Math.cos(a) * 4.8, y: 0.85, z: Math.sin(a) * 4.8 };
    scales[id] = 1.95;
  });
  out.hive = { x: 0, y: 0.1, z: 0 };
  scales.hive = 1.15;
  out.human = { x: 0, y: 3.4, z: 0 };
  scales.human = 1.2;

  const rest = ALL.filter((id) => !out[id]);
  rest.forEach((id, i) => {
    const hub = hubs[i % 3]!;
    const base = out[hub]!;
    const a = (i / rest.length) * Math.PI * 8;
    const r = 1.35 + (i % 4) * 0.55;
    out[id] = {
      x: base.x + Math.cos(a) * r * 0.85,
      y: base.y + Math.sin(i * 0.9) * 0.7 - 0.15,
      z: base.z + Math.sin(a) * r * 0.85,
    };
    scales[id] = 0.5 + (i % 3) * 0.08;
  });
  return {
    layout: out,
    scales,
    camera: { radius: 15, phi: 0.88, targetY: 0.6 },
  };
}

/** Claim Diamond — four claim postures + eye ring */
function claimDiamond(): FormationBundle {
  const out: FormationLayout = {
    human: { x: 0, y: 4.4, z: 0 },
    supported: { x: -4.2, y: 1.0, z: 0.15 },
    unproven: { x: 4.2, y: 1.0, z: -0.15 },
    disputed: { x: 0, y: -2.6, z: 0 },
    hive: { x: 0, y: 1.0, z: 0 },
    evidence: { x: -1.8, y: 2.5, z: 1.4 },
    inference: { x: 1.8, y: 2.5, z: -1.4 },
    assumption: { x: 0, y: -0.5, z: 2.0 },
  };
  const scales: FormationScales = {
    human: 1.75,
    supported: 1.55,
    unproven: 1.55,
    disputed: 1.55,
    hive: 1.25,
    evidence: 1.0,
    inference: 1.0,
    assumption: 1.0,
  };
  const rest = ALL.filter((id) => !out[id]);
  rest.forEach((id, i) => {
    const a = (i / rest.length) * Math.PI * 2;
    const rx = 5.8;
    const rz = 3.0;
    out[id] = {
      x: Math.cos(a) * rx,
      y: Math.sin(a * 2) * 0.55 + (hash01(i) - 0.5) * 0.35,
      z: Math.sin(a) * rz,
    };
    scales[id] = 0.48 + (i % 4) * 0.07;
  });
  return {
    layout: out,
    scales,
    camera: { radius: 15, phi: 0.9, targetY: 0.7 },
  };
}

/** Three nested elliptical rings — Sense / Reason / Build */
function senseReasonBuild(): FormationBundle {
  const out: FormationLayout = {
    sense: { x: -5.4, y: 0.6, z: 0 },
    reason: { x: 0, y: 1.25, z: 0 },
    build: { x: 5.4, y: 0.6, z: 0 },
  };
  const scales: FormationScales = {
    sense: 1.7,
    reason: 1.85,
    build: 1.7,
  };

  const outer = ["know", "evidence", "assumption", "fence", "archive", "aos"];
  const mid = [
    "inference",
    "supported",
    "unproven",
    "disputed",
    "critic",
    "architect",
    "builder",
  ];
  const core = [
    "hive",
    "human",
    "civic",
    "tutor",
    "integrator",
    "replication",
    "fidelity",
    "engagement-out",
  ];

  const placeRing = (ids: string[], r: number, y: number, s: number, squash = 0.68) => {
    ids.forEach((id, i) => {
      const a = (i / ids.length) * Math.PI * 2 - Math.PI / 2;
      out[id] = {
        x: Math.cos(a) * r,
        y: y + Math.sin(i) * 0.14,
        z: Math.sin(a) * r * squash,
      };
      scales[id] = s;
    });
  };
  placeRing(outer, 6.8, 0.05, 0.72);
  placeRing(mid, 4.0, 0.4, 0.9);
  placeRing(core, 1.7, 0.65, 1.0);

  fillMissing(out, scales, (i, n) => {
    const a = (i / n) * Math.PI * 2;
    return { x: Math.cos(a) * 7.6, y: -0.55, z: Math.sin(a) * 5.0 };
  });

  return {
    layout: out,
    scales,
    camera: { radius: 16, phi: 0.86, targetY: 0.4 },
  };
}

/** Four parallel S-curve lanes */
function fourAgent(): FormationBundle {
  const lanes: string[][] = [
    ["architect", "aos", "know", "evidence"],
    ["builder", "build", "civic", "tutor", "sense"],
    ["critic", "disputed", "assumption", "unproven", "inference"],
    ["integrator", "human", "hive", "replication", "fidelity", "engagement-out"],
  ];
  const out: FormationLayout = {};
  const scales: FormationScales = {};
  const laneZ = [-4.0, -1.3, 1.3, 4.0];
  const hubIds = ["architect", "builder", "critic", "integrator"];

  lanes.forEach((lane, li) => {
    const z = laneZ[li]!;
    lane.forEach((id, i) => {
      const t = i / Math.max(lane.length - 1, 1);
      const curve = Math.sin(t * Math.PI) * 0.85 * (li % 2 === 0 ? 1 : -1);
      out[id] = {
        x: -5.2 + t * 10.4,
        y: 0.45 + curve + (hubIds.includes(id) ? 0.55 : 0),
        z: z + Math.sin(t * Math.PI * 2) * 0.25,
      };
      scales[id] = hubIds.includes(id) ? 1.65 : 0.82;
    });
  });

  fillMissing(
    out,
    scales,
    (i, n) => {
      const a = (i / n) * Math.PI * 2;
      return {
        x: Math.cos(a) * 6.2,
        y: -1.6,
        z: Math.sin(a) * 5.0,
      };
    },
    0.5,
  );

  return {
    layout: out,
    scales,
    camera: { radius: 17, phi: 0.82, targetY: 0.15 },
  };
}

/** Rising spiral progress loop */
function fieldHelix(): FormationBundle {
  const order = [
    "sense",
    "know",
    "evidence",
    "supported",
    "unproven",
    "disputed",
    "reason",
    "inference",
    "assumption",
    "civic",
    "tutor",
    "build",
    "architect",
    "builder",
    "critic",
    "integrator",
    "human",
    "replication",
    "fidelity",
    "archive",
    "hive",
    "aos",
    "fence",
    "engagement-out",
  ];
  const out: FormationLayout = {};
  const scales: FormationScales = {};
  order.forEach((id, i) => {
    const t = i / Math.max(order.length - 1, 1);
    const turns = 3.0;
    const a = t * Math.PI * 2 * turns;
    const r = 0.9 + t * 4.4;
    out[id] = {
      x: Math.cos(a) * r,
      y: -3.4 + t * 7.6,
      z: Math.sin(a) * r,
    };
    const n = HIVE_NODES.find((x) => x.id === id);
    scales[id] =
      n?.kind === "process" || n?.kind === "core" || id === "human" ? 1.35 : 0.78;
  });
  fillMissing(
    out,
    scales,
    (i, n) => {
      const t = i / n;
      const a = t * Math.PI * 2;
      return { x: Math.cos(a) * 6.2, y: -3.8, z: Math.sin(a) * 6.2 };
    },
    0.48,
  );

  return {
    layout: out,
    scales,
    camera: { radius: 16, phi: 1.05, targetY: 0.5 },
  };
}

/** Dense hex core + dual orbital rings — Star Burst */
function starBurst(): FormationBundle {
  const out: FormationLayout = {
    hive: { x: 0, y: 0.4, z: 0 },
    human: { x: 0, y: 1.85, z: 0 },
  };
  const scales: FormationScales = {
    hive: 1.55,
    human: 1.15,
  };

  const core = [
    "evidence",
    "inference",
    "assumption",
    "supported",
    "unproven",
    "disputed",
    "sense",
    "reason",
    "build",
  ];
  core.forEach((id, i) => {
    const a = (i / core.length) * Math.PI * 2 - Math.PI / 2;
    const r = 1.35 + (i % 2) * 0.3;
    out[id] = {
      x: Math.cos(a) * r,
      y: 0.25 + Math.sin(i) * 0.12,
      z: Math.sin(a) * r,
    };
    scales[id] = 0.78;
  });

  const mid = [
    "civic",
    "tutor",
    "architect",
    "builder",
    "critic",
    "integrator",
    "aos",
    "know",
  ];
  mid.forEach((id, i) => {
    const a = (i / mid.length) * Math.PI * 2 + Math.PI / 8;
    const r = 3.8;
    out[id] = {
      x: Math.cos(a) * r,
      y: 0.55 + Math.sin(i * 1.1) * 0.3,
      z: Math.sin(a) * r,
    };
    scales[id] = 1.35;
  });

  const outer = ["fence", "archive", "replication", "fidelity", "engagement-out"];
  const rest = ALL.filter((id) => !out[id]);
  const outerAll = [...outer, ...rest.filter((id) => !outer.includes(id))];
  outerAll.forEach((id, i) => {
    const a = (i / outerAll.length) * Math.PI * 2;
    const r = 5.8 + (i % 2) * 0.7;
    out[id] = {
      x: Math.cos(a) * r,
      y: Math.sin(i * 0.8) * 0.4,
      z: Math.sin(a) * r,
    };
    scales[id] = 0.55 + (i % 3) * 0.08;
  });

  return {
    layout: out,
    scales,
    camera: { radius: 14.5, phi: 0.88, targetY: 0.3 },
  };
}

export function formationForMode(mode: HiveModeId): FormationBundle {
  switch (mode) {
    case "honeycomb":
      return hexPackLayout(1.7);
    case "mission-spine":
      return missionSpine();
    case "integrity-triangle":
      return integrityTriangle();
    case "claim-diamond":
      return claimDiamond();
    case "sense-reason-build":
      return senseReasonBuild();
    case "four-agent":
      return fourAgent();
    case "field-helix":
      return fieldHelix();
    case "star-burst":
      return starBurst();
    default:
      return hexPackLayout(1.55);
  }
}

export function layoutForMode(mode: HiveModeId): FormationLayout {
  return formationForMode(mode).layout;
}

export function defaultEdges(mode: HiveModeId): [string, string][] {
  switch (mode) {
    case "mission-spine":
      return [
        ["aos", "evidence"],
        ["evidence", "sense"],
        ["sense", "reason"],
        ["reason", "build"],
        ["build", "human"],
        ["human", "replication"],
        ["hive", "human"],
        ["civic", "build"],
        ["tutor", "build"],
      ];
    case "integrity-triangle":
      return [
        ["evidence", "inference"],
        ["inference", "assumption"],
        ["assumption", "evidence"],
        ["hive", "evidence"],
        ["hive", "inference"],
        ["hive", "assumption"],
        ["human", "hive"],
        ["supported", "evidence"],
        ["unproven", "assumption"],
        ["disputed", "inference"],
      ];
    case "claim-diamond":
      return [
        ["supported", "human"],
        ["unproven", "human"],
        ["disputed", "human"],
        ["supported", "disputed"],
        ["unproven", "disputed"],
        ["supported", "unproven"],
        ["evidence", "supported"],
        ["hive", "human"],
        ["assumption", "unproven"],
      ];
    case "sense-reason-build":
      return [
        ["sense", "reason"],
        ["reason", "build"],
        ["sense", "know"],
        ["reason", "evidence"],
        ["reason", "inference"],
        ["build", "civic"],
        ["build", "tutor"],
        ["build", "human"],
        ["hive", "reason"],
      ];
    case "four-agent":
      return [
        ["architect", "builder"],
        ["builder", "critic"],
        ["critic", "integrator"],
        ["architect", "integrator"],
        ["builder", "integrator"],
        ["architect", "aos"],
        ["builder", "build"],
        ["critic", "disputed"],
        ["integrator", "human"],
        ["integrator", "hive"],
      ];
    case "field-helix":
      return [
        ["sense", "evidence"],
        ["evidence", "supported"],
        ["supported", "reason"],
        ["reason", "civic"],
        ["civic", "build"],
        ["build", "human"],
        ["human", "replication"],
        ["replication", "fidelity"],
        ["fidelity", "archive"],
        ["archive", "hive"],
      ];
    case "star-burst":
      return [
        ["hive", "civic"],
        ["hive", "tutor"],
        ["hive", "aos"],
        ["hive", "know"],
        ["hive", "fence"],
        ["hive", "archive"],
        ["hive", "replication"],
        ["hive", "fidelity"],
        ["hive", "architect"],
        ["hive", "builder"],
        ["hive", "critic"],
        ["hive", "integrator"],
        ["human", "hive"],
        ["sense", "reason"],
        ["reason", "build"],
      ];
    default:
      return [
        ["hive", "aos"],
        ["hive", "know"],
        ["hive", "civic"],
        ["hive", "tutor"],
        ["evidence", "inference"],
        ["inference", "assumption"],
        ["assumption", "evidence"],
        ["sense", "reason"],
        ["reason", "build"],
      ];
  }
}
