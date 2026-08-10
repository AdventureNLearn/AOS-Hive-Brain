import type { HiveModeId } from "@/data/hive-universe";
import { HIVE_NODES } from "@/data/hive-universe";

export type Vec3 = { x: number; y: number; z: number };

export type FormationLayout = Record<string, Vec3>;
export type FormationScales = Record<string, number>;

export type FormationBundle = {
  layout: FormationLayout;
  scales: FormationScales;
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

function missionSpine(): FormationBundle {
  const spine = ["aos", "evidence", "sense", "reason", "build", "human", "replication"];
  const out: FormationLayout = {};
  const scales: FormationScales = {};
  spine.forEach((id, i) => {
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
  return { layout: out, scales, camera: { radius: 16, phi: 1.12, targetY: 0.4 } };
}

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
  return { layout: out, scales, camera: { radius: 15, phi: 0.88, targetY: 0.6 } };
}

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
    out[id] = {
      x: Math.cos(a) * 5.8,
      y: Math.sin(a * 2) * 0.55 + (hash01(i) - 0.5) * 0.35,
      z: Math.sin(a) * 3.0,
    };
    scales[id] = 0.48 + (i % 4) * 0.07;
  });
  return { layout: out, scales, camera: { radius: 15, phi: 0.9, targetY: 0.7 } };
}

function senseReasonBuild(): FormationBundle {
  const out: FormationLayout = {
    sense: { x: -5.4, y: 0.6, z: 0 },
    reason: { x: 0, y: 1.25, z: 0 },
    build: { x: 5.4, y: 0.6, z: 0 },
  };
  const scales: FormationScales = { sense: 1.7, reason: 1.85, build: 1.7 };
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
  placeRing(["know", "evidence", "assumption", "fence", "archive", "aos"], 6.8, 0.05, 0.72);
  placeRing(
    ["inference", "supported", "unproven", "disputed", "critic", "architect", "builder"],
    4.0,
    0.4,
    0.9,
  );
  placeRing(
    ["hive", "human", "civic", "tutor", "integrator", "replication", "fidelity", "engagement-out"],
    1.7,
    0.65,
    1.0,
  );
  fillMissing(out, scales, (i, n) => {
    const a = (i / n) * Math.PI * 2;
    return { x: Math.cos(a) * 7.6, y: -0.55, z: Math.sin(a) * 5.0 };
  });
  return { layout: out, scales, camera: { radius: 16, phi: 0.86, targetY: 0.4 } };
}

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
      return { x: Math.cos(a) * 6.2, y: -1.6, z: Math.sin(a) * 5.0 };
    },
    0.5,
  );
  return { layout: out, scales, camera: { radius: 17, phi: 0.82, targetY: 0.15 } };
}

function fieldHelix(): FormationBundle {
  const order = ALL.slice();
  const out: FormationLayout = {};
  const scales: FormationScales = {};
  order.forEach((id, i) => {
    const t = i / Math.max(order.length - 1, 1);
    const a = t * Math.PI * 2 * 3;
    const r = 0.9 + t * 4.4;
    out[id] = { x: Math.cos(a) * r, y: -3.4 + t * 7.6, z: Math.sin(a) * r };
    const n = HIVE_NODES.find((x) => x.id === id);
    scales[id] =
      n?.kind === "process" || n?.kind === "core" || id === "human" ? 1.35 : 0.78;
  });
  return { layout: out, scales, camera: { radius: 16, phi: 1.05, targetY: 0.5 } };
}

function starBurst(): FormationBundle {
  const out: FormationLayout = { hive: { x: 0, y: 0.4, z: 0 }, human: { x: 0, y: 1.85, z: 0 } };
  const scales: FormationScales = { hive: 1.55, human: 1.15 };
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
    out[id] = { x: Math.cos(a) * r, y: 0.25 + Math.sin(i) * 0.12, z: Math.sin(a) * r };
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
    out[id] = {
      x: Math.cos(a) * 3.8,
      y: 0.55 + Math.sin(i * 1.1) * 0.3,
      z: Math.sin(a) * 3.8,
    };
    scales[id] = 1.35;
  });
  fillMissing(out, scales, (i, n) => {
    const a = (i / n) * Math.PI * 2;
    const r = 5.8 + (i % 2) * 0.7;
    return { x: Math.cos(a) * r, y: Math.sin(i * 0.8) * 0.4, z: Math.sin(a) * r };
  }, 0.55);
  return { layout: out, scales, camera: { radius: 14.5, phi: 0.88, targetY: 0.3 } };
}

function layerStack(): FormationBundle {
  const floors = [
    ["aos", "hive"],
    ["know", "evidence", "inference", "assumption"],
    ["fence", "archive"],
    ["civic", "tutor", "replication", "fidelity"],
  ];
  const out: FormationLayout = {};
  const scales: FormationScales = {};
  floors.forEach((floor, fi) => {
    const y = 4.2 - fi * 2.4;
    floor.forEach((id, i) => {
      const a = (i / Math.max(floor.length, 1)) * Math.PI * 2 - Math.PI / 2;
      const r = 1.2 + floor.length * 0.35;
      out[id] = { x: Math.cos(a) * r, y, z: Math.sin(a) * r * 0.75 };
      scales[id] = fi === 0 ? 1.55 : 1.1;
    });
  });
  fillMissing(out, scales, (i, n) => {
    const a = (i / n) * Math.PI * 2;
    return { x: Math.cos(a) * 5.5, y: -2.2, z: Math.sin(a) * 4.2 };
  }, 0.55);
  return { layout: out, scales, camera: { radius: 15, phi: 1.0, targetY: 0.6 } };
}

function welcomePath(): FormationBundle {
  const path = ["hive", "aos", "evidence", "supported", "human", "civic", "tutor"];
  const out: FormationLayout = {};
  const scales: FormationScales = {};
  path.forEach((id, i) => {
    out[id] = {
      x: -4.5 + i * 1.5,
      y: Math.sin(i * 0.7) * 0.6 + 0.4,
      z: Math.cos(i * 0.5) * 0.8,
    };
    scales[id] = 1.4;
  });
  fillMissing(out, scales, (i, n) => {
    const a = (i / n) * Math.PI * 2;
    return { x: Math.cos(a) * 6, y: -1.4 + (i % 3) * 0.2, z: Math.sin(a) * 5 };
  }, 0.5);
  return { layout: out, scales, camera: { radius: 14, phi: 0.92, targetY: 0.2 } };
}

function provenanceChain(): FormationBundle {
  const chain = ["evidence", "supported", "inference", "assumption", "unproven", "human"];
  const out: FormationLayout = {};
  const scales: FormationScales = {};
  chain.forEach((id, i) => {
    out[id] = { x: -4 + i * 1.7, y: 1.2 - (i % 2) * 0.4, z: 0 };
    scales[id] = 1.5;
  });
  out.hive = { x: 0, y: -1.8, z: 0 };
  scales.hive = 1.2;
  fillMissing(out, scales, (i, n) => {
    const a = (i / n) * Math.PI * 2;
    return { x: Math.cos(a) * 5.8, y: 2.5, z: Math.sin(a) * 4 };
  }, 0.5);
  return { layout: out, scales, camera: { radius: 14, phi: 0.9, targetY: 0.4 } };
}

function honestGap(): FormationBundle {
  const out: FormationLayout = {
    unproven: { x: 0, y: 1.2, z: 0 },
    assumption: { x: -3.2, y: 0.4, z: 1 },
    evidence: { x: 3.2, y: 0.4, z: -1 },
    disputed: { x: 0, y: -2.2, z: 0 },
    human: { x: 0, y: 3.6, z: 0 },
    hive: { x: 0, y: -0.4, z: 2.2 },
  };
  const scales: FormationScales = {
    unproven: 1.9,
    assumption: 1.2,
    evidence: 1.2,
    disputed: 1.1,
    human: 1.4,
    hive: 1.1,
  };
  fillMissing(out, scales, (i, n) => {
    const a = (i / n) * Math.PI * 2;
    return { x: Math.cos(a) * 5.5, y: Math.sin(i) * 0.4, z: Math.sin(a) * 4.2 };
  }, 0.52);
  return { layout: out, scales, camera: { radius: 14, phi: 0.88, targetY: 0.5 } };
}

function shipGate(): FormationBundle {
  const out: FormationLayout = {
    fence: { x: -3.8, y: 1.2, z: 0 },
    evidence: { x: -1.5, y: 2.4, z: 0 },
    supported: { x: 1.5, y: 2.4, z: 0 },
    human: { x: 3.8, y: 1.2, z: 0 },
    build: { x: 0, y: 0.2, z: 0 },
    civic: { x: -2, y: -1.6, z: 1.2 },
    tutor: { x: 2, y: -1.6, z: -1.2 },
    "engagement-out": { x: 0, y: -2.8, z: 0 },
    replication: { x: 0, y: 3.8, z: 0 },
  };
  const scales: FormationScales = {
    fence: 1.4,
    evidence: 1.3,
    supported: 1.3,
    human: 1.7,
    build: 1.5,
    civic: 1.1,
    tutor: 1.1,
    "engagement-out": 0.9,
    replication: 1.35,
  };
  fillMissing(out, scales, (i, n) => {
    const a = (i / n) * Math.PI * 2;
    return { x: Math.cos(a) * 6, y: -0.5, z: Math.sin(a) * 5 };
  }, 0.5);
  return { layout: out, scales, camera: { radius: 15, phi: 0.9, targetY: 0.5 } };
}

function freezeEra(): FormationBundle {
  const out: FormationLayout = {
    archive: { x: 0, y: 4.2, z: 0 },
    fidelity: { x: -2.2, y: 2.6, z: 0.5 },
    replication: { x: 2.2, y: 2.6, z: -0.5 },
    human: { x: 0, y: 1.4, z: 0 },
    hive: { x: 0, y: -0.2, z: 0 },
    build: { x: -3, y: -1.2, z: 1 },
    civic: { x: 3, y: -1.2, z: -1 },
  };
  const scales: FormationScales = {
    archive: 1.85,
    fidelity: 1.35,
    replication: 1.35,
    human: 1.4,
    hive: 1.2,
    build: 1.0,
    civic: 1.0,
  };
  fillMissing(out, scales, (i, n) => {
    const a = (i / n) * Math.PI * 2;
    return { x: Math.cos(a) * 5.2, y: -2.4, z: Math.sin(a) * 4.4 };
  }, 0.5);
  return { layout: out, scales, camera: { radius: 15, phi: 1.05, targetY: 0.8 } };
}

function syncGate(): FormationBundle {
  const left = ["architect", "builder", "aos", "build"];
  const right = ["critic", "integrator", "disputed", "human"];
  const out: FormationLayout = {};
  const scales: FormationScales = {};
  left.forEach((id, i) => {
    out[id] = { x: -3.8, y: 2.5 - i * 1.5, z: -0.4 };
    scales[id] = i < 2 ? 1.55 : 1.0;
  });
  right.forEach((id, i) => {
    out[id] = { x: 3.8, y: 2.5 - i * 1.5, z: 0.4 };
    scales[id] = i < 2 ? 1.55 : 1.0;
  });
  out.hive = { x: 0, y: 0.6, z: 0 };
  scales.hive = 1.45;
  out.know = { x: 0, y: 2.8, z: 0 };
  scales.know = 1.15;
  fillMissing(out, scales, (i, n) => {
    const a = (i / n) * Math.PI * 2;
    return { x: Math.cos(a) * 6.2, y: -2, z: Math.sin(a) * 4.5 };
  }, 0.48);
  return { layout: out, scales, camera: { radius: 16, phi: 0.88, targetY: 0.3 } };
}

function edgePermission(): FormationBundle {
  const out: FormationLayout = {
    hive: { x: 0, y: 1.5, z: 0 },
    sense: { x: -4.5, y: 2.2, z: 0 },
    reason: { x: 0, y: 3.5, z: 0 },
    build: { x: 4.5, y: 2.2, z: 0 },
    evidence: { x: -4.5, y: 0, z: 1.2 },
    civic: { x: 4.5, y: 0, z: -1.2 },
    tutor: { x: 4.5, y: -1.5, z: 1 },
    human: { x: 0, y: -0.5, z: 0 },
  };
  const scales: FormationScales = {
    hive: 1.3,
    sense: 1.4,
    reason: 1.4,
    build: 1.4,
    evidence: 1.1,
    civic: 1.1,
    tutor: 1.1,
    human: 1.35,
  };
  fillMissing(out, scales, (i, n) => {
    const a = (i / n) * Math.PI * 2;
    return { x: Math.cos(a) * 6.5, y: -2.2, z: Math.sin(a) * 5 };
  }, 0.48);
  return { layout: out, scales, camera: { radius: 15, phi: 0.9, targetY: 0.4 } };
}

function freshVerifier(): FormationBundle {
  const work = ["builder", "build", "civic", "tutor", "sense"];
  const out: FormationLayout = {};
  const scales: FormationScales = {};
  work.forEach((id, i) => {
    const a = (i / work.length) * Math.PI * 1.4 - 0.7;
    out[id] = {
      x: Math.cos(a) * 3.2 - 1.5,
      y: Math.sin(a) * 1.2 + 0.5,
      z: Math.sin(a) * 2,
    };
    scales[id] = id === "builder" ? 1.55 : 1.05;
  });
  out.critic = { x: 4.2, y: 1.8, z: 0 };
  scales.critic = 1.85;
  out.human = { x: 4.2, y: -0.6, z: 0 };
  scales.human = 1.4;
  out.disputed = { x: 2.2, y: 0.8, z: 1.5 };
  scales.disputed = 1.15;
  out.hive = { x: 0, y: -1.8, z: 0 };
  scales.hive = 1.15;
  fillMissing(out, scales, (i, n) => {
    const a = (i / n) * Math.PI * 2;
    return { x: Math.cos(a) * 6, y: -2.5, z: Math.sin(a) * 4.5 };
  }, 0.48);
  return { layout: out, scales, camera: { radius: 15, phi: 0.9, targetY: 0.3 } };
}

function civicLens(): FormationBundle {
  const out: FormationLayout = {
    civic: { x: 0, y: 1.5, z: 0 },
    supported: { x: -2.8, y: 2.2, z: 0.5 },
    unproven: { x: 2.8, y: 2.2, z: -0.5 },
    disputed: { x: 0, y: -0.8, z: 2 },
    human: { x: 0, y: 3.6, z: 0 },
    evidence: { x: -3.5, y: 0.2, z: 0 },
    hive: { x: 0, y: -1.6, z: 0 },
    fence: { x: 3.5, y: 0.2, z: 0 },
  };
  const scales: FormationScales = {
    civic: 1.9,
    supported: 1.2,
    unproven: 1.2,
    disputed: 1.15,
    human: 1.4,
    evidence: 1.1,
    hive: 1.15,
    fence: 1.2,
  };
  fillMissing(out, scales, (i, n) => {
    const a = (i / n) * Math.PI * 2;
    return { x: Math.cos(a) * 5.8, y: -2, z: Math.sin(a) * 4.5 };
  }, 0.5);
  return { layout: out, scales, camera: { radius: 14, phi: 0.9, targetY: 0.5 } };
}

function tutorPath(): FormationBundle {
  const path = ["sense", "know", "reason", "tutor", "build", "human", "fidelity"];
  const out: FormationLayout = {};
  const scales: FormationScales = {};
  path.forEach((id, i) => {
    const t = i / (path.length - 1);
    out[id] = {
      x: -4 + t * 8,
      y: Math.sin(t * Math.PI) * 1.4 + 0.3,
      z: Math.cos(t * Math.PI * 2) * 0.6,
    };
    scales[id] = id === "tutor" ? 1.85 : 1.25;
  });
  out["engagement-out"] = { x: 0, y: -2.4, z: 0 };
  scales["engagement-out"] = 0.9;
  fillMissing(out, scales, (i, n) => {
    const a = (i / n) * Math.PI * 2;
    return { x: Math.cos(a) * 6, y: -1.8, z: Math.sin(a) * 4.8 };
  }, 0.48);
  return { layout: out, scales, camera: { radius: 14.5, phi: 0.92, targetY: 0.3 } };
}

export function formationForMode(mode: HiveModeId): FormationBundle {
  switch (mode) {
    case "honeycomb":
      return hexPackLayout(1.7);
    case "layer-stack":
      return layerStack();
    case "welcome-path":
      return welcomePath();
    case "map-atlas":
      return hexPackLayout(1.95);
    case "mission-spine":
      return missionSpine();
    case "integrity-triangle":
      return integrityTriangle();
    case "claim-diamond":
      return claimDiamond();
    case "provenance-chain":
      return provenanceChain();
    case "honest-gap":
      return honestGap();
    case "sense-reason-build":
      return senseReasonBuild();
    case "ship-gate":
      return shipGate();
    case "freeze-era":
      return freezeEra();
    case "four-agent":
      return fourAgent();
    case "sync-gate":
      return syncGate();
    case "edge-permission":
      return edgePermission();
    case "fresh-verifier":
      return freshVerifier();
    case "field-helix":
      return fieldHelix();
    case "star-burst":
      return starBurst();
    case "civic-lens":
      return civicLens();
    case "tutor-path":
      return tutorPath();
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
      ];
    case "claim-diamond":
      return [
        ["supported", "human"],
        ["unproven", "human"],
        ["disputed", "human"],
        ["supported", "disputed"],
        ["unproven", "disputed"],
        ["evidence", "supported"],
        ["hive", "human"],
      ];
    case "sense-reason-build":
      return [
        ["sense", "reason"],
        ["reason", "build"],
        ["build", "civic"],
        ["build", "tutor"],
        ["build", "human"],
        ["hive", "reason"],
      ];
    case "four-agent":
    case "sync-gate":
      return [
        ["architect", "builder"],
        ["builder", "critic"],
        ["critic", "integrator"],
        ["architect", "integrator"],
        ["integrator", "human"],
        ["integrator", "hive"],
      ];
    case "edge-permission":
      return [
        ["sense", "reason"],
        ["reason", "build"],
        ["build", "civic"],
        ["build", "tutor"],
        ["build", "human"],
      ];
    case "fresh-verifier":
      return [
        ["builder", "build"],
        ["build", "civic"],
        ["critic", "human"],
        ["builder", "critic"],
      ];
    case "field-helix":
    case "tutor-path":
      return [
        ["sense", "know"],
        ["know", "reason"],
        ["reason", "tutor"],
        ["tutor", "build"],
        ["build", "human"],
        ["human", "fidelity"],
      ];
    case "star-burst":
      return [
        ["hive", "civic"],
        ["hive", "tutor"],
        ["hive", "aos"],
        ["hive", "know"],
        ["hive", "fence"],
        ["human", "hive"],
      ];
    case "layer-stack":
      return [
        ["aos", "hive"],
        ["hive", "know"],
        ["know", "evidence"],
        ["fence", "archive"],
        ["civic", "tutor"],
      ];
    case "welcome-path":
      return [
        ["hive", "aos"],
        ["aos", "evidence"],
        ["evidence", "supported"],
        ["supported", "human"],
        ["human", "civic"],
        ["civic", "tutor"],
      ];
    case "provenance-chain":
      return [
        ["evidence", "supported"],
        ["supported", "inference"],
        ["inference", "assumption"],
        ["assumption", "unproven"],
        ["unproven", "human"],
      ];
    case "honest-gap":
      return [
        ["evidence", "unproven"],
        ["assumption", "unproven"],
        ["unproven", "human"],
        ["disputed", "unproven"],
      ];
    case "ship-gate":
      return [
        ["fence", "evidence"],
        ["evidence", "supported"],
        ["supported", "human"],
        ["build", "civic"],
        ["human", "replication"],
      ];
    case "freeze-era":
      return [
        ["build", "human"],
        ["human", "fidelity"],
        ["human", "replication"],
        ["fidelity", "archive"],
        ["replication", "archive"],
      ];
    case "civic-lens":
      return [
        ["evidence", "supported"],
        ["supported", "civic"],
        ["unproven", "civic"],
        ["civic", "human"],
        ["fence", "civic"],
      ];
    default:
      return [
        ["hive", "aos"],
        ["hive", "know"],
        ["hive", "civic"],
        ["hive", "tutor"],
        ["hive", "human"],
        ["sense", "reason"],
        ["reason", "build"],
      ];
  }
}
