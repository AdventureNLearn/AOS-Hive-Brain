# Hive Decision / Claim Schema (v0.1)

**For humans first.** This page describes how Hive records decisions so a non-technical builder can follow along.

**Posture:** Pattern-only substrate inspired by decision-intelligence graphs
(record → causal links → conflict flags → provenance → human gate).
**Not** a Semantica runtime. Do **not** claim “powered by Semantica”
unless deliberately wired later.

**Doctrine (non-negotiable):**

- Status stays honest: Supported · Unproven · Disputed · Human call
- Reasoning stays labeled: Evidence · Inference · Assumption
- Conflicts are **flagged**, never silently overwritten
- Multi-model agreement ≠ automatic truth
- Human final call is a **recorded event**, not a slogan

---

## Objects (plain English)

### Claim / Decision

A **decision** answers a question: what were we deciding, what did we choose, how sure are we, and who said so?

| Field | Everyday meaning |
| --- | --- |
| `title` | Short name of the step |
| `scenario` | The question we were answering |
| `outcome` | What we chose |
| `status` | Supported / Unproven / Disputed / Human call |
| `reasoningKind` | Evidence / Inference / Assumption |
| `reasoning` | Why, in plain words |
| `confidence` | 0–1 display only — never auto-truth |
| `decisionMaker` | Role label (public-safe) |
| `focusNodeIds` | Which Hive lights to highlight during PLAY |
| `provenance` | Where this came from (source + who recorded it) |
| `humanCall` | Required when status is Human call |

### Links (edges)

| Kind | Meaning |
| --- | --- |
| `evidence-of` | This supports that claim |
| `inferred-from` | Derived from another node (keep Inference label) |
| `conflicts-with` | Conflict stays visible |
| `caused` | Hard “this led to that” |
| `influenced` | Soft influence |
| `precedent-for` | Earlier decision used as precedent |

### Human call (hard gate)

Someone with a name/role accepts residual risk in writing. The store **refuses**
status `Human call` without this event.

---

## Operations

| Op | What it does |
| --- | --- |
| `recordDecision` | Add an immutable decision |
| `addEdge` | Link two decisions |
| `flagConflict` | Mark a conflict; never merge values |
| `recordHumanCall` | Lock a human sign-off |
| `traceDecisionChain` | Walk root → leaf for PLAY |
| `exportGraph` | JSON snapshot for fidelity / sharing |

---

## Mapping to Hive shapes

| Shape | Decision story idea |
| --- | --- |
| Honeycomb | Orient without forcing a ship path |
| Mission Spine | Full mission with conflict + human call |
| Integrity Triangle | Evidence / Inference / Assumption walk |
| Claim Diamond | Four claim postures + tip human call |
| Sense → Reason → Build | Process order check |
| 4-Agent Lanes | Parallel roles, one merge |
| Field Helix | Observe → claim → communicate → archive |
| Star Burst | Core integrity + public rays + fence |

All eight shapes have demo graphs in `src/lib/decision/formation-graphs.ts`.

---

## Substrate boundary

```
[Optional future decision-graph runtime]
            ↑
[This schema + in-memory store]   ← public Hive owns this layer
            ↑
[Hive integrity kernel + formations UI]
            ↑
[Public brief + clean seed]
```

Keep enterprise connectors, auto-resolution without human review, and full KG
platforms **out** of public Hive.

Class: **PUBLIC** principle + demo fixtures only.
