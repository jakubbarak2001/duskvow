"use client";

import dagre from "@dagrejs/dagre";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { SkillNodeComponent } from "@/components/tree/SkillNodeComponent";
import { SkillEdgeComponent } from "@/components/tree/SkillEdgeComponent";
import type { SkillNode } from "@/types";

const nodeTypes: NodeTypes = { skillNode: SkillNodeComponent as never };
const edgeTypes: EdgeTypes = { skillEdge: SkillEdgeComponent as never };

const NODE_WIDTH = 140;
const NODE_HEIGHT = 140;

/** Compute clean positions using Dagre left-to-right layout. */
function applyDagreLayout(nodes: SkillNode[]): Map<string, { x: number; y: number }> {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "LR", nodesep: 80, ranksep: 140, marginx: 60, marginy: 60 });
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

  const positions = new Map<string, { x: number; y: number }>();
  for (const node of nodes) {
    const { x, y } = g.node(node.id);
    positions.set(node.id, { x: x - NODE_WIDTH / 2, y: y - NODE_HEIGHT / 2 });
  }
  return positions;
}

function toFlowNodes(nodes: SkillNode[]): Node[] {
  const positions = applyDagreLayout(nodes);
  return nodes.map((n) => {
    const pos = positions.get(n.id) ?? { x: 0, y: 0 };
    return {
      id: n.id,
      type: "skillNode",
      position: pos,
      data: n as never,
      draggable: false,
    };
  });
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

export function TreeCanvas({ nodes, onNodeClick, selectedNodeId }: TreeCanvasProps) {
  const flowNodes = toFlowNodes(nodes).map((n) => ({
    ...n,
    selected: n.id === selectedNodeId,
  }));
  const flowEdges = toFlowEdges(nodes);

  return (
    <ReactFlow
      nodes={flowNodes}
      edges={flowEdges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodeClick={onNodeClick}
      fitView
      fitViewOptions={{ padding: 0.15, maxZoom: 1.2 }}
      minZoom={0.3}
      maxZoom={2}
      style={{ background: "var(--bg-abyss)" }}
      proOptions={{ hideAttribution: true }}
    >
      <Background color="rgba(224, 216, 200, 0.04)" gap={32} size={1} />
      <Controls
        style={{
          backgroundColor: "var(--bg-elevated)",
          border: "1px solid var(--border-default)",
          borderRadius: "6px",
        }}
      />
    </ReactFlow>
  );
}
