import { useEffect, useState } from "react";
import { initState } from "./core/init/init";
import "./App.css";
import EditorContainer from "./components/EditorContainer";

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 用后端存储数据初始化节点树
    initState({});
    setIsInitialized(true);
  }, []);

  if (!isInitialized) {
    return <div className="app-loading">Loading...</div>; // 显示加载状态
  }

  return (
    <div className="app">
      <div className="app-main">
        <EditorContainer />
      </div>
    </div>
  );
}

export default App;
