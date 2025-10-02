import { useState, useEffect } from "react";
import { toolStore, ToolType } from "../../../../core/store/ToolStore";

const LeftToolBar = () => {
  const [currentTool, setCurrentTool] = useState<ToolType>(
    toolStore.getCurrentTool()
  );

  useEffect(() => {
    const handleToolChange = (tool: ToolType) => {
      setCurrentTool(tool);
    };

    toolStore.addListener(handleToolChange);
    return () => {
      toolStore.removeListener(handleToolChange);
    };
  }, []);

  const handleToolClick = (tool: ToolType) => {
    toolStore.setCurrentTool(tool);
  };

  const getButtonClass = (tool: ToolType) => {
    const baseClass =
      "w-8 h-8 rounded flex items-center justify-center text-white text-xs transition-colors";
    if (currentTool === tool) {
      return `${baseClass} bg-blue-800 border-2 border-blue-300`;
    }
    return `${baseClass} bg-blue-700 hover:bg-blue-800`;
  };

  return (
    <div className="w-10 h-full bg-blue-600 border-r border-blue-400 py-2 px-1">
      <div className="flex flex-col gap-1">
        {/* 选择工具 */}
        <button
          className={getButtonClass("select")}
          onClick={() => handleToolClick("select")}
          title="选择工具"
        >
          ⚪
        </button>

        {/* 矩形工具 */}
        <button
          className={getButtonClass("rectangle")}
          onClick={() => handleToolClick("rectangle")}
          title="矩形工具"
        >
          ⬜
        </button>

        {/* 圆形工具 */}
        <button
          className={getButtonClass("circle")}
          onClick={() => handleToolClick("circle")}
          title="圆形工具"
        >
          ⭕
        </button>

        {/* 文本工具 */}
        <button
          className={getButtonClass("text")}
          onClick={() => handleToolClick("text")}
          title="文本工具"
        >
          T
        </button>

        {/* 画笔工具 */}
        <button
          className={getButtonClass("pencil")}
          onClick={() => handleToolClick("pencil")}
          title="画笔工具"
        >
          🖌️
        </button>

        {/* 橡皮擦 */}
        <button
          className={getButtonClass("eraser")}
          onClick={() => handleToolClick("eraser")}
          title="橡皮擦工具"
        >
          🧽
        </button>

        {/* 手动工具 */}
        <button
          className={getButtonClass("hand")}
          onClick={() => handleToolClick("hand")}
          title="手动工具 (H)"
        >
          ✋
        </button>
      </div>
    </div>
  );
};

export default LeftToolBar;
