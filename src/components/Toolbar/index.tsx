import React, { useState } from "react";
import "./style.css";

export type NodeType = "rectangle" | "circle" | "text";
export type CreationMode = "select" | "click" | "drag";

export interface ToolbarProps {
  selectedNodeType: NodeType;
  creationMode: CreationMode;
  onNodeTypeChange: (type: NodeType) => void;
  onCreationModeChange: (mode: CreationMode) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  selectedNodeType,
  creationMode,
  onNodeTypeChange,
  onCreationModeChange,
}) => {
  const nodeTypes: { type: NodeType; label: string; icon: string }[] = [
    { type: "rectangle", label: "矩形", icon: "⬜" },
    { type: "circle", label: "圆形", icon: "⭕" },
    { type: "text", label: "文本", icon: "📝" },
  ];

  const creationModes: { mode: CreationMode; label: string; icon: string }[] = [
    { mode: "select", label: "选择", icon: "🔍" },
    { mode: "click", label: "点击创建", icon: "👆" },
    { mode: "drag", label: "拖拽创建", icon: "🖱️" },
  ];

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <h3>创建模式</h3>
        <div className="toolbar-group">
          {creationModes.map((item) => (
            <button
              key={item.mode}
              className={`toolbar-button ${
                creationMode === item.mode ? "active" : ""
              }`}
              onClick={() => onCreationModeChange(item.mode)}
              title={item.label}
            >
              <span className="toolbar-icon">{item.icon}</span>
              <span className="toolbar-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-section">
        <h3>节点类型</h3>
        <div className="toolbar-group">
          {nodeTypes.map((item) => (
            <button
              key={item.type}
              className={`toolbar-button ${
                selectedNodeType === item.type ? "active" : ""
              }`}
              onClick={() => onNodeTypeChange(item.type)}
              title={item.label}
              disabled={creationMode === "select"}
            >
              <span className="toolbar-icon">{item.icon}</span>
              <span className="toolbar-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-status">
        {creationMode === "select" && <span>🔍 选择模式：点击选择节点</span>}
        {creationMode === "click" && (
          <span>
            👆 点击创建：点击画布创建{" "}
            {nodeTypes.find((n) => n.type === selectedNodeType)?.label}
          </span>
        )}
        {creationMode === "drag" && (
          <span>
            🖱️ 拖拽创建：拖拽画布创建{" "}
            {nodeTypes.find((n) => n.type === selectedNodeType)?.label}
          </span>
        )}
      </div>
    </div>
  );
};
