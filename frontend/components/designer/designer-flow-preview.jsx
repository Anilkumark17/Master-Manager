"use client";

import * as React from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

const defaultNodes = [
  {
    id: "hint",
    position: { x: 24, y: 40 },
    data: { label: "Generate from PRD to preview the map" },
    type: "default",
  },
];

const defaultEdges = [];

function normalizeFlow(reactFlow) {
  if (
    !reactFlow ||
    typeof reactFlow !== "object" ||
    !Array.isArray(reactFlow.nodes)
  ) {
    return { nodes: defaultNodes, edges: defaultEdges };
  }
  const nodes = reactFlow.nodes.map((n, i) => ({
    id: String(n.id ?? `n-${i}`),
    position: {
      x: Number(n.position?.x) || 0,
      y: Number(n.position?.y) || 0,
    },
    data: { label: String(n.data?.label ?? n.label ?? "Node") },
    type: n.type === "input" || n.type === "output" ? n.type : "default",
  }));
  const edges = Array.isArray(reactFlow.edges)
    ? reactFlow.edges.map((e, i) => ({
        id: String(e.id ?? `e-${i}`),
        source: String(e.source),
        target: String(e.target),
        label: e.label ? String(e.label) : undefined,
      }))
    : [];
  return { nodes: nodes.length ? nodes : defaultNodes, edges };
}

export function DesignerFlowPreview({ reactFlow }) {
  const { nodes, edges } = React.useMemo(
    () => normalizeFlow(reactFlow),
    [reactFlow]
  );

  return (
    <ReactFlowProvider>
      <div className="h-[300px] w-full overflow-hidden rounded-lg border border-border bg-muted/10">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.4}
          maxZoom={1.25}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={16} size={1} />
          <Controls showInteractive={false} />
          <MiniMap
            className="!bg-muted/80"
            maskColor="rgb(0 0 0 / 12%)"
            pannable
            zoomable
          />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}
