const LeftToolBar = () => {
  return (
    <div className="w-10 h-full bg-blue-600 border-r border-blue-400 py-2 px-1">
      <div className="flex flex-col gap-1">
        {/* 选择工具 */}
        <button className="w-8 h-8 bg-blue-700 hover:bg-blue-800 rounded flex items-center justify-center text-white text-xs transition-colors">
          ⚪
        </button>

        {/* 矩形工具 */}
        <button className="w-8 h-8 bg-blue-700 hover:bg-blue-800 rounded flex items-center justify-center text-white text-xs transition-colors">
          ⬜
        </button>

        {/* 圆形工具 */}
        <button className="w-8 h-8 bg-blue-700 hover:bg-blue-800 rounded flex items-center justify-center text-white text-xs transition-colors">
          ⭕
        </button>

        {/* 文本工具 */}
        <button className="w-8 h-8 bg-blue-700 hover:bg-blue-800 rounded flex items-center justify-center text-white text-xs transition-colors">
          T
        </button>

        {/* 画笔工具 */}
        <button className="w-8 h-8 bg-blue-700 hover:bg-blue-800 rounded flex items-center justify-center text-white text-xs transition-colors">
          🖌️
        </button>

        {/* 橡皮擦 */}
        <button className="w-8 h-8 bg-blue-700 hover:bg-blue-800 rounded flex items-center justify-center text-white text-xs transition-colors">
          🧽
        </button>
      </div>
    </div>
  );
};

export default LeftToolBar;
