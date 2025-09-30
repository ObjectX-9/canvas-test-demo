import { useEffect, useRef, useState, useCallback } from "react";
import {
  coordinateSystemManager,
  pageManager,
  viewManager,
} from "../../core/manage";

import { PageNode } from "../../core/nodeTree/node/pageNode";
import { globalEventManager, initializeEventSystem } from "../../core/event";
import { selectionStore } from "../../core/store/SelectionStore";

// 导入Skia风格的渲染器
import {
  SkiaLikeRenderer,
  createSkiaLikeRenderer,
} from "../../core/render/direct/SkiaLikeRenderer";

/**
 * 画布容器
 * 使用Skia风格的JSX元素渲染：<canvas-grid>, <canvas-ruler>等
 */
const CanvasContainer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<SkiaLikeRenderer | null>(null);
  const [viewState, setViewState] = useState(
    coordinateSystemManager.getViewState()
  );
  const [currentPage, setCurrentPage] = useState<PageNode | null>(
    pageManager.getCurrentPage()
  );
  const isDragging = useRef(false);
  const lastMousePosition = useRef({ x: 0, y: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showRuler, setShowRuler] = useState(true);

  console.log("✅ ~ currentPage:", currentPage);

  // 渲染Skia风格UI层
  const renderSkiaLikeUI = useCallback(() => {
    if (rendererRef.current) {
      rendererRef.current.render(<ckpage></ckpage>);
    }
  }, [showGrid, showRuler, currentPage]);

  // 初始化Skia风格渲染器
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && !rendererRef.current) {
      try {
        console.log("🚀 初始化SkiaLike渲染器");

        const renderer = createSkiaLikeRenderer(canvas);
        renderer.setCanvasSize(window.innerWidth, window.innerHeight);

        rendererRef.current = renderer;

        // 渲染Skia风格UI层
        renderSkiaLikeUI();

        // 初始化事件系统
        if (!globalEventManager.isInitialized()) {
          initializeEventSystem();
        }

        // 创建事件上下文
        const eventContext = {
          canvas,
          currentPage,
          viewState,
          isDragging,
          lastMousePosition,
          selectionStore,
          coordinateSystemManager,
          setViewState,
          renderer: {
            requestRender: () => renderer.requestRender(),
            getCanvas: () => renderer.getCanvas(),
          },
        };

        globalEventManager.setContext(eventContext);
        globalEventManager.bindCanvasEvents(canvas);

        setIsInitialized(true);
        console.log("✅ SkiaLike渲染器初始化完成");
      } catch (error) {
        console.error("❌ SkiaLike渲染器初始化失败:", error);
      }
    }
  }, []);

  // 监听UI变化
  useEffect(() => {
    renderSkiaLikeUI();
  }, [renderSkiaLikeUI]);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      if (rendererRef.current) {
        rendererRef.current.setCanvasSize(
          window.innerWidth,
          window.innerHeight
        );
        renderSkiaLikeUI();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [renderSkiaLikeUI]);

  // 清理
  useEffect(() => {
    return () => {
      if (rendererRef.current) {
        rendererRef.current.clear();
      }
    };
  }, []);

  return (
    <div className="canvas-container-wrapper" style={{ position: "relative" }}>
      {/* 工具面板 */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 1000,
          background: "rgba(255, 255, 255, 0.9)",
          padding: "10px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          fontSize: "12px",
          minWidth: "200px",
        }}
      >
        <div style={{ color: "#2ecc71", fontWeight: "bold" }}>
          ✅ 简化Skia风格Canvas (直接渲染)
        </div>
        <div style={{ fontSize: "10px", color: "#666" }}>
          页面: {currentPage?.name || "无"} (
          {currentPage?.children?.length || 0} 个子节点)
        </div>
        {viewState &&
          (() => {
            const scale = viewManager.getScale(viewState);
            const translation = viewManager.getTranslation(viewState);
            return (
              <div style={{ fontSize: "10px", color: "#666" }}>
                视图: 缩放 {scale.toFixed(2)} | 位移 (
                {translation.pageX.toFixed(0)}, {translation.pageY.toFixed(0)})
              </div>
            );
          })()}
        <div style={{ fontSize: "10px", marginTop: "4px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
            />
            显示网格
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <input
              type="checkbox"
              checked={showRuler}
              onChange={(e) => setShowRuler(e.target.checked)}
            />
            显示标尺
          </label>
        </div>
        <div style={{ fontSize: "10px", color: "#999", marginTop: "4px" }}>
          🎯 无中间层，直接Canvas渲染
        </div>
      </div>

      {/* Canvas区域 */}
      <div style={{ height: "100%", position: "relative" }}>
        <canvas
          ref={canvasRef}
          width={window.innerWidth}
          height={window.innerHeight}
          style={{
            cursor: isDragging.current ? "grabbing" : "grab",
            display: "block",
            width: `${window.innerWidth}px`,
            height: `${window.innerHeight}px`,
          }}
        />
      </div>

      {/* Loading指示器 */}
      {!isInitialized && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "20px",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        >
          🚀 正在初始化简化渲染器...
        </div>
      )}
    </div>
  );
};

export default CanvasContainer;
