import LeftToolBar from "./LeftToolBar";

const CanvasPanelLeft = () => {
  return (
    <div className="h-full w-full bg-blue-500 text-white text-sm font-bold flex flex-row border-r-4 border-green-600">
      {/* 工具栏区域 */}
      <LeftToolBar />

      {/* 面板内容区域 */}
      <div className="flex-1 p-4 overflow-y-auto">
        <h3 className="text-lg mb-4">左侧面板</h3>
        <div className="text-xs text-blue-100 mb-4">
          CanvasPanelLeft - Tailwind Test
        </div>

        {/* 其他面板内容 */}
        <div className="space-y-3">
          <div className="text-sm">
            <div className="font-semibold mb-1">图层</div>
            <div className="text-xs text-blue-200">这里可以显示图层列表</div>
          </div>

          <div className="text-sm">
            <div className="font-semibold mb-1">属性</div>
            <div className="text-xs text-blue-200">
              这里可以显示选中元素的属性
            </div>
          </div>

          <div className="text-sm">
            <div className="font-semibold mb-1">历史记录</div>
            <div className="text-xs text-blue-200">这里可以显示操作历史</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasPanelLeft;
