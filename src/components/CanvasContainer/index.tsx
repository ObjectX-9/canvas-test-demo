import { useEffect, useRef, useState, useCallback } from "react";
import {
  coordinateSystemManager,
  pageManager,
  viewManager,
} from "../../core/manage";

import { PageNode } from "../../core/nodeTree/node/pageNode";
import { globalEventManager, initializeEventSystem } from "../../core/event";
import { selectionStore } from "../../core/store/SelectionStore";

// 导入新的Canvas组件系统
import {
  Canvas,
  Grid,
  Ruler,
  Background,
  type CanvasComponentRef,
  type NodeTreeCanvasRenderer,
} from "../../core/render";
import { ViewInfo } from "../../core/types/view";

/**
 * 画布容器
 * 使用新的Canvas组件系统，支持声明式UI组件
 */
const CanvasContainer = () => {
  const canvasRef = useRef<CanvasComponentRef>(null);
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

  // 渲染器准备就绪回调
  const handleRendererReady = useCallback(
    (renderer: NodeTreeCanvasRenderer) => {
      console.log("🎯 Canvas渲染器准备就绪");

      // 初始化事件系统
      const canvas = renderer.getCanvas();
      if (canvas) {
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
        };

        // 设置事件上下文
        globalEventManager.setContext(eventContext);
        globalEventManager.bindCanvasEvents(canvas);
      }

      setIsInitialized(true);
    },
    [currentPage, viewState]
  );

  // 初始化页面视图状态
  useEffect(() => {
    const initialPage = pageManager.getCurrentPage();
    if (initialPage) {
      setCurrentPage(initialPage);
      // 同步初始页面的视图状态
      const initialViewState = viewManager.create(
        initialPage.panX,
        initialPage.panY,
        initialPage.zoom
      );
      coordinateSystemManager.setViewState(initialViewState);
      setViewState(coordinateSystemManager.getViewState());
    }
  }, []);

  // 当页面数据变化时，重建渲染树并重新渲染
  useEffect(() => {
    const renderer = canvasRef.current?.getRenderer();
    if (renderer && currentPage) {
      renderer.rebuildContentRenderTree(currentPage);
      renderer.renderPage(currentPage, viewState);
    }
  }, [currentPage, viewState]);

  // 当事件上下文变化时，更新事件绑定
  useEffect(() => {
    const renderer = canvasRef.current?.getRenderer();
    if (renderer && isInitialized) {
      const canvas = renderer.getCanvas();

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
      };

      // 更新事件上下文
      globalEventManager.setContext(eventContext);
    }
  }, [isInitialized, viewState, currentPage]);

  // 窗口大小变化时重新渲染
  useEffect(() => {
    const handleResize = () => {
      canvasRef.current?.requestRender();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 清理函数
  useEffect(() => {
    return () => {
      const renderer = canvasRef.current?.getRenderer();
      if (renderer) {
        const canvas = renderer.getCanvas();
        globalEventManager.unbindCanvasEvents(canvas);
        renderer.clear();
      }
    };
  }, []);

  return (
    <div
      className="h-full bg-gray-100 border border-gray-300"
      style={{ position: "relative" }}
    >
      {/* 工具栏 */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 1000,
          background: "rgba(255,255,255,0.9)",
          padding: "8px",
          borderRadius: "4px",
          fontSize: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <div style={{ color: "#2ecc71", fontWeight: "bold" }}>
          ✅ Canvas组件系统 (类似Skia)
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

        {/* UI控制按钮 */}
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
          🎯 分层架构: 背景 → 内容 → UI
        </div>
      </div>

      {/* Canvas组件区域 */}
      <div style={{ height: "100%", position: "relative" }}>
        <Canvas
          ref={canvasRef}
          width={window.innerWidth}
          height={window.innerHeight}
          currentPage={currentPage}
          viewState={viewState}
          onRendererReady={handleRendererReady}
          style={{
            cursor: isDragging.current ? "grabbing" : "grab",
            display: "block",
          }}
        >
          {/* 背景 */}
          <Background visible={true} backgroundColor="#f8f9fa" zIndex={-20} />

          {/* 网格 */}
          <Grid
            visible={showGrid}
            gridSize={20}
            strokeStyle="#e0e0e0"
            lineWidth={1}
            zIndex={-10}
          />

          {/* 标尺 */}
          <Ruler
            visible={showRuler}
            rulerSize={25}
            backgroundColor="#f0f0f0"
            textColor="#333"
            strokeStyle="#ccc"
            zIndex={10}
          />
        </Canvas>
      </div>

      {/* 加载提示 */}
      {!isInitialized && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(52, 73, 94, 0.8)",
            color: "white",
            padding: "20px",
            borderRadius: "8px",
            fontSize: "16px",
            textAlign: "center",
          }}
        >
          🚀 正在初始化Canvas组件系统...
        </div>
      )}
    </div>
  );
};

export default CanvasContainer;
