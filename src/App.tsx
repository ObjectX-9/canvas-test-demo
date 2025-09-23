import { useEffect, useState } from "react";
import CanvasContainer from "./components/CanvasContainer";
import { Toolbar, NodeType, CreationMode } from "./components/Toolbar";
import { creationStore } from "./core/store/CreationStore";
import { initState } from "./core/init/init";
import "./App.css";

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedNodeType, setSelectedNodeType] =
    useState<NodeType>("rectangle");
  const [creationMode, setCreationMode] = useState<CreationMode>("select");

  useEffect(() => {
    // 用后端存储数据初始化节点树
    initState({});
    setIsInitialized(true);
  }, []);

  // 处理创建模式变化
  const handleCreationModeChange = (mode: CreationMode) => {
    setCreationMode(mode);
    creationStore.setCreationMode(mode);
  };

  // 处理节点类型变化
  const handleNodeTypeChange = (type: NodeType) => {
    setSelectedNodeType(type);
    creationStore.setSelectedNodeType(type);
  };

  if (!isInitialized) {
    return <div className="app-loading">Loading...</div>; // 显示加载状态
  }

  return (
    <div className="app">
      <Toolbar
        selectedNodeType={selectedNodeType}
        creationMode={creationMode}
        onNodeTypeChange={handleNodeTypeChange}
        onCreationModeChange={handleCreationModeChange}
      />
      <div className="app-main">
        <CanvasContainer />
      </div>
    </div>
  );
}

export default App;
