"use client";

import dagre from "@dagrejs/dagre";
import {
  ReactFlow,
  Controls,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
} from "@xyflow/react";
import { useMemo } from "react";
import "@xyflow/react/dist/style.css";

import { SkillNodeComponent } from "@/components/tree/SkillNodeComponent";
import { SkillEdgeComponent } from "@/components/tree/SkillEdgeComponent";
import { TierLabelNode } from "@/components/tree/TierLabelNode";
import type { SkillNode } from "@/types";

const nodeTypes: NodeTypes = {
  skillNode: SkillNodeComponent as never,
  tierLabel: TierLabelNode as never,
};
const edgeTypes: EdgeTypes = { skillEdge: SkillEdgeComponent as never };

// Wrapper bounding box is now fixed at 130x130 (see .skill-node-wrapper),
// so Dagre slot dimensions can be tighter and predictable. NODE_HEIGHT keeps
// some extra room for the absolute label strip + breathing room.
const NODE_WIDTH = 150;
const NODE_HEIGHT = 170;
const TIER_LABEL_X_OFFSET = 360;

/**
 * Tier chapter labels — walked by prerequisite depth, not rarity. Depth 0 is
 * "First Steps" (no prereqs); the canonical 6-tier journey ends at Apotheosis.
 * For any depth past the named entries we synthesize a unique label via
 * `chapterFor()` so we never get two identically-named labels at different
 * y positions (which is what produces the "VI APOTHEOSIS twice" bug when the
 * AI emits an unusually deep tree).
 */
const TIER_CHAPTERS = [
  { roman: "I", title: "First Steps" },
  { roman: "II", title: "Trials" },
  { roman: "III", title: "Rites" },
  { roman: "IV", title: "Mastery" },
  { roman: "V", title: "Ascension" },
  { roman: "VI", title: "Apotheosis" },
  { roman: "VII", title: "Transcendence" },
  { roman: "VIII", title: "Beyond" },
] as const;

/** Tiny roman numeral converter, sufficient for tier indices in [1, 12]. */
function toRoman(n: number): string {
  const map: [number, string][] = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let out = "";
  let remaining = n;
  for (const [v, s] of map) {
    while (remaining >= v) {
      out += s;
      remaining -= v;
    }
  }
  return out;
}

/**
 * Return the chapter label for a given prerequisite depth. Uses the named
 * entries when possible; for very deep trees, synthesizes a unique fallback
 * label so two tier labels never collide.
 */
function chapterFor(depth: number): { roman: string; title: string } {
  if (depth < TIER_CHAPTERS.length) return TIER_CHAPTERS[depth];
  return { roman: toRoman(depth + 1), title: "Beyond" };
}

/** Compute prerequisite depth for every node (memoized DFS with cycle guard). */
function computeDepths(nodes: SkillNode[]): Map<string, number> {
  const depths = new Map<string, number>();
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  function depthOf(id: string, visiting: Set<string>): number {
    if (depths.has(id)) return depths.get(id)!;
    if (visiting.has(id)) return 0; // cycle guard — treat as root
    visiting.add(id);
    const node = nodeMap.get(id);
    if (!node || node.prerequisites.length === 0) {
      depths.set(id, 0);
      return 0;
    }
    let max = 0;
    for (const p of node.prerequisites) {
      if (nodeMap.has(p)) {
        const d = depthOf(p, visiting) + 1;
        if (d > max) max = d;
      }
    }
    depths.set(id, max);
    return max;
  }

  for (const node of nodes) depthOf(node.id, new Set());
  return depths;
}

interface DagrePos {
  x: number;
  y: number;
}

/**
 * Compute positions via Dagre top-to-bottom layout. TB mode makes prereq depth
 * map directly to rank, so nodes at the same depth share the same y and are
 * spread horizontally by Dagre — which is exactly the tier-row layout we want.
 * No post-hoc y override needed.
 */
function applyDagreLayout(nodes: SkillNode[]): Map<string, DagrePos> {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "TB", nodesep: 110, ranksep: 150, marginx: 80, marginy: 80 });
  g.setDefaultEdgeLabel(() => ({}));

  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  for (const node of nodes) {
    for (const prereqId of node.prerequisites) {
      if (g.hasNode(prereqId)) {
        g.setEdge(prereqId, node.id);
      }
    }
  }

  dagre.layout(g);

  const positions = new Map<string, DagrePos>();
  for (const node of nodes) {
    const { x, y } = g.node(node.id);
    positions.set(node.id, { x: x - NODE_WIDTH / 2, y: y - NODE_HEIGHT / 2 });
  }
  return positions;
}

function toFlowNodes(nodes: SkillNode[]): { flowNodes: Node[]; maxDepth: number } {
  const positions = applyDagreLayout(nodes);
  const depths = computeDepths(nodes);

  // Track one y per depth level — taken from whatever Dagre assigned to the
  // first node at that depth — so tier labels align precisely with their row.
  const rowY = new Map<number, number>();
  // Track left-most x per depth so tier labels sit just outside the row.
  const rowMinX = new Map<number, number>();

  const flowNodes: Node[] = nodes.map((n) => {
    const pos = positions.get(n.id) ?? { x: 0, y: 0 };
    const depth = depths.get(n.id) ?? 0;

    if (!rowY.has(depth)) rowY.set(depth, pos.y);
    const currentMin = rowMinX.get(depth);
    if (currentMin === undefined || pos.x < currentMin) {
      rowMinX.set(depth, pos.x);
    }

    return {
      id: n.id,
      type: "skillNode",
      position: pos,
      data: n as never,
      draggable: false,
    };
  });

  const maxDepth = Math.max(0, ...Array.from(depths.values()));

  // Tier labels stack in a single gutter column — use the GLOBAL leftmost x
  // across all rows, not the per-row leftmost. Otherwise rows with branches
  // (which are physically wider) would push their label further left than
  // skinny rows, producing the misalignment the user flagged.
  const allMinX = Array.from(rowMinX.values());
  const globalMinX = allMinX.length > 0 ? Math.min(...allMinX) : 0;
  const labelX = globalMinX - TIER_LABEL_X_OFFSET;

  // Synthesize tier label nodes — one per row, rendered at a single shared x.
  for (let d = 0; d <= maxDepth; d++) {
    const chapter = chapterFor(d);
    const y = rowY.get(d);
    if (y === undefined) continue;
    flowNodes.push({
      id: `__tier-label-${d}`,
      type: "tierLabel",
      position: { x: labelX, y: y + NODE_HEIGHT / 2 - 22 },
      data: { roman: chapter.roman, title: chapter.title } as never,
      draggable: false,
      selectable: false,
    });
  }

  return { flowNodes, maxDepth };
}

function toFlowEdges(nodes: SkillNode[]): Edge[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const edges: Edge[] = [];
  for (const node of nodes) {
    for (const prereqId of node.prerequisites) {
      const source = nodeMap.get(prereqId);
      edges.push({
        id: `${prereqId}->${node.id}`,
        source: prereqId,
        target: node.id,
        type: "skillEdge",
        data: { completed: source?.state === "completed" },
      });
    }
  }
  return edges;
}

interface TreeCanvasProps {
  nodes: SkillNode[];
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  selectedNodeId?: string | null;
}

/** Faint drifting embers in the canvas background — decorative only. */
function CanvasEmbers() {
  const embers = Array.from({ length: 14 }, (_, i) => i);
  return (
    <div className="tree-canvas-embers" aria-hidden="true">
      {embers.map((i) => (
        <span
          key={i}
          className={`tree-canvas-ember tree-canvas-ember-${(i % 3) + 1}`}
          style={{
            left: `${(i * 83) % 100}%`,
            animationDelay: `${(i * 0.7) % 6}s`,
          }}
        />
      ))}
    </div>
  );
}

/** Four corner ornaments that frame the canvas like a manuscript page. */
function CanvasCorners() {
  return (
    <div className="tree-canvas-corners" aria-hidden="true">
      <span className="tree-canvas-corner tree-canvas-corner-tl">◆</span>
      <span className="tree-canvas-corner tree-canvas-corner-tr">◆</span>
      <span className="tree-canvas-corner tree-canvas-corner-bl">◆</span>
      <span className="tree-canvas-corner tree-canvas-corner-br">◆</span>
    </div>
  );
}

export function TreeCanvas({ nodes, onNodeClick, selectedNodeId }: TreeCanvasProps) {
  // Memoize layout computation — Dagre is expensive and only needs to rerun
  // when node data changes, not on every render (e.g. selectedNodeId changes).
  const { flowNodes: baseFlowNodes } = useMemo(() => toFlowNodes(nodes), [nodes]);
  const flowEdges = useMemo(() => toFlowEdges(nodes), [nodes]);
  const flowNodes = useMemo(
    () =>
      baseFlowNodes.map((n) =>
        n.type === "skillNode" ? { ...n, selected: n.id === selectedNodeId } : n,
      ),
    [baseFlowNodes, selectedNodeId],
  );

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    // Tier label nodes are decorative — don't fire the click handler on them
    if (node.type === "tierLabel") return;
    onNodeClick(event, node);
  };

  return (
    <div className="tree-canvas-stage">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1.1 }}
        minZoom={0.3}
        maxZoom={2}
        className="tree-canvas-flow"
        proOptions={{ hideAttribution: true }}
      >
        <Controls
          style={{
            backgroundColor: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            borderRadius: "6px",
          }}
        />
      </ReactFlow>

      <CanvasEmbers />
      <CanvasCorners />
    </div>
  );
}
