import CanvasContainer from "../CanvasContainer";
import HeaderToolBar from "../CanvasPanel/HeaderToolBar";
import CanvasPanelLeft from "../CanvasPanel/LeftPanel";
import CanvasPanelRight from "../CanvasPanel/RightPanel";

const EditorContainer = () => {
  return (
    <div className="editor-container h-screen w-full overflow-hidden grid grid-cols-[280px_1fr_240px] grid-rows-[auto_1fr]">
      {/* Header 横跨所有列 */}
      <div className="col-span-3">
        <HeaderToolBar />
      </div>

      {/* 左侧面板 */}
      <div className="overflow-hidden">
        <CanvasPanelLeft />
      </div>

      {/* 主画布区域 */}
      <div className="min-w-0 overflow-hidden">
        <CanvasContainer />
      </div>

      {/* 右侧面板 */}
      <div className="overflow-hidden">
        <CanvasPanelRight />
      </div>
    </div>
  );
};

export default EditorContainer;
