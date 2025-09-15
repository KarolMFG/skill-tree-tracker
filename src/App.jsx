// App.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";

// Initial nodes
const initialNodes = [
  {
    id: "1",
    type: "default",
    position: { x: 250, y: 50 },
    data: {
      label: "Problem Solving",
      category: "Cognitive",
      points: 0,
      maxPoints: 3,
      icon: "🧠",
      subSkills: ["Analytical Thinking", "Creative Solutions"],
      prerequisites: [],
      color: "#8e44ad",
    },
  },
  {
    id: "2",
    type: "default",
    position: { x: 50, y: 200 },
    data: {
      label: "Time Management",
      category: "Productivity",
      points: 0,
      maxPoints: 2,
      icon: "⏱️",
      prerequisites: ["1"],
      color: "#f39c12",
    },
  },
  {
    id: "3",
    type: "default",
    position: { x: 250, y: 200 },
    data: {
      label: "Critical Thinking",
      category: "Cognitive",
      points: 0,
      maxPoints: 3,
      icon: "🧠",
      prerequisites: ["1"],
      color: "#9b59b6",
    },
  },
  {
    id: "4",
    type: "default",
    position: { x: 450, y: 200 },
    data: {
      label: "Communication",
      category: "Social",
      points: 0,
      maxPoints: 2,
      icon: "👥",
      prerequisites: ["1"],
      color: "#3498db",
    },
  },
  {
    id: "5",
    type: "default",
    position: { x: 250, y: 350 },
    data: {
      label: "Leadership",
      category: "Social",
      points: 0,
      maxPoints: 4,
      icon: "👥",
      prerequisites: ["3", "4"],
      color: "#2ecc71",
    },
  },
];

const initialEdges = [
  { id: "e1-3", source: "1", target: "3", animated: true },
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e1-4", source: "1", target: "4", animated: true },
  { id: "e3-5", source: "3", target: "5", animated: true },
  { id: "e4-5", source: "4", target: "5", animated: true },
];

// LocalStorage helpers
const saveProgress = (nodes) =>
  localStorage.setItem("skillTreeProgress", JSON.stringify(nodes));
const loadProgress = () => JSON.parse(localStorage.getItem("skillTreeProgress")) || null;

// Define nodeTypes/edgeTypes outside component to avoid React Flow warning
const nodeTypes = {};
const edgeTypes = {};

export default function App() {
  const savedNodes = loadProgress();
  const [nodes, setNodes, onNodesChange] = useNodesState(savedNodes || initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [skillPoints, setSkillPoints] = useState(10);
  const [filterCategory, setFilterCategory] = useState("All");
  const [newSkill, setNewSkill] = useState({ label: "", maxPoints: 1, category: "" });

  const addPoint = (nodeId) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === nodeId && n.data.points < n.data.maxPoints && skillPoints > 0) {
          // check prerequisites
          const canUnlock = n.data.prerequisites.every((pid) => {
            const prereqNode = nds.find((node) => node.id === pid);
            return prereqNode?.data.points > 0;
          });
          if (!canUnlock) return n;

          setSkillPoints((p) => p - 1);
          return { ...n, data: { ...n.data, points: n.data.points + 1 } };
        }
        return n;
      })
    );
  };

  const removePoint = (nodeId) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === nodeId && n.data.points > 0) {
          setSkillPoints((p) => p + 1);
          return { ...n, data: { ...n.data, points: n.data.points - 1 } };
        }
        return n;
      })
    );
  };

  const addSkill = () => {
    if (!newSkill.label) return;
    const id = Date.now().toString();
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: "default",
        position: { x: Math.random() * 400 + 50, y: Math.random() * 300 + 50 },
        data: {
          label: newSkill.label,
          category: newSkill.category || "General",
          points: 0,
          maxPoints: newSkill.maxPoints || 1,
          icon: "⭐",
          subSkills: [],
          prerequisites: [],
          color: "#888",
        },
      },
    ]);
    setNewSkill({ label: "", maxPoints: 1, category: "" });
  };

  useEffect(() => {
    saveProgress(nodes);
  }, [nodes]);

  const displayedNodes =
    filterCategory === "All" ? nodes : nodes.filter((n) => n.data.category === filterCategory);

  // Render each node with a progress bar
  const renderNodeLabel = useCallback((n) => {
    const percent = (n.data.points / n.data.maxPoints) * 100;
    return (
      <div style={{ textAlign: "center", width: "100%" }}>
        <div style={{ fontWeight: "bold", color: "#fff", textShadow: "1px 1px 3px #000" }}>
          {n.data.icon} {n.data.label}
        </div>
        <div
          style={{
            height: 6,
            width: "100%",
            background: "#333",
            borderRadius: 3,
            marginTop: 4,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${percent}%`,
              background: "gold",
              borderRadius: 3,
              transition: "width 0.3s",
            }}
          />
        </div>
      </div>
    );
  }, []);

  return (
    <ReactFlowProvider>
      <div style={{ width: "100vw", height: "100vh", background: "#111", position: "relative" }}>
        {/* Skill Points */}
        <div style={{ position: "absolute", top: 10, right: 10, color: "#fff", zIndex: 1000 }}>
          Available Skill Points: {skillPoints}
        </div>

        {/* Category Filter */}
        <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1000, display: "flex", gap: 5 }}>
          {["All", "Cognitive", "Social", "Productivity"].map((cat) => (
            <button
              key={cat}
              style={{
                padding: "5px 10px",
                borderRadius: 5,
                border: filterCategory === cat ? "2px solid #fff" : "none",
                background: "#222",
                color: "#fff",
                cursor: "pointer",
              }}
              onClick={() => setFilterCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Add New Skill */}
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 10,
            background: "#222",
            padding: 10,
            borderRadius: 8,
            zIndex: 1000,
            color: "#fff",
          }}
        >
          <h4>Add New Skill</h4>
          <input
            placeholder="Skill Name"
            value={newSkill.label}
            onChange={(e) => setNewSkill({ ...newSkill, label: e.target.value })}
          />
          <input
            placeholder="Max Points"
            type="number"
            value={newSkill.maxPoints}
            onChange={(e) => setNewSkill({ ...newSkill, maxPoints: parseInt(e.target.value) })}
          />
          <input
            placeholder="Category"
            value={newSkill.category}
            onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
          />
          <button onClick={addSkill} style={{ marginTop: 5 }}>
            Add Skill
          </button>
        </div>

        <ReactFlow
          nodes={displayedNodes.map((n) => ({
            ...n,
            data: { ...n.data, label: renderNodeLabel(n) },
            style: {
              minWidth: 150,
              padding: 10,
              borderRadius: 15,
              border: n.data.points === n.data.maxPoints ? "2px solid gold" : "none",
              background: n.data.color,
              color: "#fff",
            },
          }))}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeMouseEnter={(e, node) => setHoveredNode(node)}
          onNodeMouseLeave={() => setHoveredNode(null)}
        >
          <MiniMap nodeColor={(n) => n.data.color} />
          <Controls />
          <Background color="#222" gap={20} />
        </ReactFlow>

        {/* Hover Panel */}
        {hoveredNode && (
          <div
            style={{
              position: "absolute",
              top: hoveredNode.position.y,
              left: hoveredNode.position.x + 180,
              background: "#222",
              padding: 15,
              borderRadius: 10,
              width: 260,
              color: "#fff",
              boxShadow: "0 0 15px rgba(0,0,0,0.7)",
              zIndex: 1000,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {hoveredNode.data.icon}
              <strong>{hoveredNode.data.label}</strong>
            </div>
            <p>Category: {hoveredNode.data.category}</p>
            <p>
              Points: {hoveredNode.data.points} / {hoveredNode.data.maxPoints}
            </p>
            <p>
              Sub-skills:{" "}
              {hoveredNode.data.subSkills?.length > 0 ? hoveredNode.data.subSkills.join(", ") : "None"}
            </p>
            <p>
              Prerequisites:{" "}
              {hoveredNode.data.prerequisites?.length > 0 ? hoveredNode.data.prerequisites.join(", ") : "None"}
            </p>
            <div style={{ marginTop: 8, display: "flex", gap: 5 }}>
              <button onClick={() => addPoint(hoveredNode.id)}>+</button>
              <button onClick={() => removePoint(hoveredNode.id)}>-</button>
            </div>
          </div>
        )}
      </div>
    </ReactFlowProvider>
  );
}
