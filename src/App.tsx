import { useEffect, useState } from "react";
import "./App.css";
import EditorContainer from "./components/EditorContainer";
import { initEditor } from "./core/init";
import { elementStore } from "./core/store/ElementStore";
import { pageStore } from "./core/store/PageStore";
import { fileStore } from "./core/store/FileStore";
import { nodeTree } from "./core/nodeTree";
import { toolStore } from "./core/store/ToolStore";

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 数据 & 节点树初始化
    initEditor();
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // 调试快捷键
      if (e.ctrlKey && e.key === "l") {
        console.log("ctrl + l");
        console.log(elementStore.getElement());
        console.log(pageStore.getPage());
        console.log(fileStore.getFile());
        console.log(nodeTree.getAllNodes());
        return;
      }

      // 工具切换快捷键
      switch (e.key.toLowerCase()) {
        case "h":
          console.log("🖐️ 切换到手动工具");
          toolStore.setCurrentTool("hand");
          e.preventDefault();
          break;
        case "v":
          console.log("⚪ 切换到选择工具");
          toolStore.setCurrentTool("select");
          e.preventDefault();
          break;
        case "r":
          console.log("⬜ 切换到矩形工具");
          toolStore.setCurrentTool("rectangle");
          e.preventDefault();
          break;
        case "p":
          console.log("🖌️ 切换到画笔工具");
          toolStore.setCurrentTool("pencil");
          e.preventDefault();
          break;
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
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
