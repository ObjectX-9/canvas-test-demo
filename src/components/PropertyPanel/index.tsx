import React, { useState, useEffect } from "react";
import { selectionStore } from "../../core/store/SelectionStore";
import { elementStore } from "../../core/store/ElementStore";
import { BaseState } from "../../core/types/nodes/baseState";
import styles from "./index.module.less";

interface PropertyPanelProps {
  className?: string;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({ className }) => {
  const [selectedNodes, setSelectedNodes] = useState<BaseState[]>([]);

  useEffect(() => {
    // 监听选择变化
    const handleSelectionChange = (selectedIds: string[]) => {
      console.log("属性面板接收到选择变化:", selectedIds);
      const nodes = selectedIds
        .map((id) => elementStore.getOneElement(id))
        .filter((node): node is BaseState => Boolean(node));
      console.log("获取到的节点:", nodes);
      setSelectedNodes(nodes);
    };

    selectionStore.addSelectionListener(handleSelectionChange);

    return () => {
      selectionStore.removeSelectionListener(handleSelectionChange);
    };
  }, []);

  // 如果没有选中任何节点
  if (selectedNodes.length === 0) {
    return (
      <div className={`${styles.propertyPanel} ${className || ""}`}>
        <div className={styles.header}>
          <h3>属性面板</h3>
        </div>
        <div className={styles.content}>
          <div className={styles.emptyState}>
            <p>请选择一个元素来查看和编辑属性</p>
          </div>
        </div>
      </div>
    );
  }

  // 单选情况
  if (selectedNodes.length === 1) {
    return (
      <div className={`${styles.propertyPanel} ${className || ""}`}>
        <div className={styles.header}>
          <h3>属性面板</h3>
          <div className={styles.nodeInfo}>
            <span className={styles.nodeType}>{selectedNodes[0].type}</span>
            <span className={styles.nodeId}>ID: {selectedNodes[0].id}</span>
          </div>
        </div>
        <div className={styles.content}>
          <SingleNodeProperties node={selectedNodes[0]} />
        </div>
      </div>
    );
  }

  // 多选情况
  return (
    <div className={`${styles.propertyPanel} ${className || ""}`}>
      <div className={styles.header}>
        <h3>属性面板</h3>
        <div className={styles.nodeInfo}>
          <span className={styles.multiSelect}>
            已选择 {selectedNodes.length} 个元素
          </span>
        </div>
      </div>
      <div className={styles.content}>
        <MultiNodeProperties nodes={selectedNodes} />
      </div>
    </div>
  );
};

// 单个节点属性编辑器
interface SingleNodePropertiesProps {
  node: BaseState;
}

const SingleNodeProperties: React.FC<SingleNodePropertiesProps> = ({
  node,
}) => {
  const [localNode, setLocalNode] = useState<BaseState>({ ...node });

  useEffect(() => {
    setLocalNode({ ...node });
  }, [node]);

  const handlePropertyChange = (
    property: keyof BaseState,
    value: string | number
  ) => {
    const updatedNode = { ...localNode, [property]: value };
    setLocalNode(updatedNode);

    // 更新实际的节点数据
    const originalNode = elementStore.getOneElement(node.id);
    if (originalNode) {
      // 类型安全的属性更新
      Object.assign(originalNode, { [property]: value });
    }
  };

  return (
    <div className={styles.singleNodeProperties}>
      {/* 位置属性 */}
      <div className={styles.propertyGroup}>
        <h4>位置和尺寸</h4>
        <div className={styles.propertyRow}>
          <label>X</label>
          <input
            type="number"
            value={localNode.x}
            onChange={(e) =>
              handlePropertyChange("x", parseFloat(e.target.value) || 0)
            }
          />
        </div>
        <div className={styles.propertyRow}>
          <label>Y</label>
          <input
            type="number"
            value={localNode.y}
            onChange={(e) =>
              handlePropertyChange("y", parseFloat(e.target.value) || 0)
            }
          />
        </div>
        <div className={styles.propertyRow}>
          <label>宽度</label>
          <input
            type="number"
            value={localNode.w}
            onChange={(e) =>
              handlePropertyChange("w", parseFloat(e.target.value) || 0)
            }
          />
        </div>
        <div className={styles.propertyRow}>
          <label>高度</label>
          <input
            type="number"
            value={localNode.h}
            onChange={(e) =>
              handlePropertyChange("h", parseFloat(e.target.value) || 0)
            }
          />
        </div>
      </div>

      {/* 样式属性 */}
      <div className={styles.propertyGroup}>
        <h4>样式</h4>
        <div className={styles.propertyRow}>
          <label>填充颜色</label>
          <input
            type="color"
            value={localNode.fill}
            onChange={(e) => handlePropertyChange("fill", e.target.value)}
          />
        </div>
        <div className={styles.propertyRow}>
          <label>旋转角度</label>
          <input
            type="number"
            step="0.1"
            value={(localNode.rotation * 180) / Math.PI} // 转换为度数显示
            onChange={(e) =>
              handlePropertyChange(
                "rotation",
                ((parseFloat(e.target.value) || 0) * Math.PI) / 180
              )
            }
          />
          <span className={styles.unit}>°</span>
        </div>
      </div>

      {/* 基础信息 */}
      <div className={styles.propertyGroup}>
        <h4>基础信息</h4>
        <div className={styles.propertyRow}>
          <label>ID</label>
          <input
            type="text"
            value={localNode.id}
            onChange={(e) => handlePropertyChange("id", e.target.value)}
          />
        </div>
        <div className={styles.propertyRow}>
          <label>类型</label>
          <input
            type="text"
            value={localNode.type}
            readOnly
            className={styles.readonly}
          />
        </div>
      </div>
    </div>
  );
};

// 多个节点属性编辑器
interface MultiNodePropertiesProps {
  nodes: BaseState[];
}

const MultiNodeProperties: React.FC<MultiNodePropertiesProps> = ({ nodes }) => {
  const handleBatchPropertyChange = (
    property: keyof BaseState,
    value: string | number
  ) => {
    nodes.forEach((node) => {
      const originalNode = elementStore.getOneElement(node.id);
      if (originalNode) {
        // 类型安全的属性更新
        Object.assign(originalNode, { [property]: value });
      }
    });
  };

  // 计算共同属性值
  const getCommonValue = (property: keyof BaseState): string | number => {
    const values = nodes.map((node) => node[property]);
    const firstValue = values[0];
    const allSame = values.every((value) => value === firstValue);
    return allSame ? firstValue : "";
  };

  return (
    <div className={styles.multiNodeProperties}>
      <div className={styles.propertyGroup}>
        <h4>批量编辑</h4>
        <div className={styles.propertyRow}>
          <label>填充颜色</label>
          <input
            type="color"
            value={(getCommonValue("fill") as string) || "#ffffff"}
            onChange={(e) => handleBatchPropertyChange("fill", e.target.value)}
          />
        </div>
        <div className={styles.propertyRow}>
          <label>X偏移</label>
          <input
            type="number"
            placeholder="相对移动"
            onChange={(e) => {
              const offset = parseFloat(e.target.value) || 0;
              nodes.forEach((node) => {
                const originalNode = elementStore.getOneElement(node.id);
                if (originalNode) {
                  originalNode.x += offset;
                }
              });
            }}
          />
        </div>
        <div className={styles.propertyRow}>
          <label>Y偏移</label>
          <input
            type="number"
            placeholder="相对移动"
            onChange={(e) => {
              const offset = parseFloat(e.target.value) || 0;
              nodes.forEach((node) => {
                const originalNode = elementStore.getOneElement(node.id);
                if (originalNode) {
                  originalNode.y += offset;
                }
              });
            }}
          />
        </div>
      </div>

      <div className={styles.propertyGroup}>
        <h4>选中的元素</h4>
        <div className={styles.nodeList}>
          {nodes.map((node) => (
            <div key={node.id} className={styles.nodeItem}>
              <span className={styles.nodeType}>{node.type}</span>
              <span className={styles.nodeId}>{node.id}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
