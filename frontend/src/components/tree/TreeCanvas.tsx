"use client";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes: NodeTypes = { skillNode: SkillNodeComponent as any };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const edgeTypes: EdgeTypes = { skillEdge: SkillEdgeComponent as any };

/** Convert our SkillNode array into React Flow Node array. */
function toFlowNodes(nodes: SkillNode[]): Node[] {
  return nodes.map((n) => ({
    id: n.id,
    type: "skillNode",
    position: { x: n.position_x, y: n.position_y },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: n as any,
    draggable: false,
  }));
}

/** Derive React Flow edges from prerequisites. Mark completed if source is done. */
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

export function TreeCanvas({
  nodes,
  onNodeClick,
  selectedNodeId,
}: TreeCanvasProps) {
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
      <Background
        color="rgba(224, 216, 200, 0.04)"
        gap={32}
        size={1}
      />
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
