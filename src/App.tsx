import { useEffect, useState } from "react";
import "./App.css";
import EditorContainer from "./components/EditorContainer";
import { initEditor } from "./core/init";
import { elementStore } from "./core/store/ElementStore";
import { pageStore } from "./core/store/PageStore";
import { fileStore } from "./core/store/FileStore";
import { nodeTree } from "./core/nodeTree";

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 数据 & 节点树初始化
    initEditor();
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "l") {
        console.log("ctrl + l");
        console.log(elementStore.getElement());
        console.log(pageStore.getPage());
        console.log(fileStore.getFile());
        console.log(nodeTree.getAllNodes());
      }
    });
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
