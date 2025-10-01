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

  // 渲染Skia风格UI层
  const renderSkiaLikeUI = useCallback(() => {
    if (rendererRef.current) {
      rendererRef.current.render(
        <>
          <canvas-rect x={100} y={100} w={100} h={100} fill="green" />
          <ckpage></ckpage>
        </>
      );
    }
  }, [showGrid, showRuler, currentPage]);

  // 初始化Skia风格渲染器
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && !rendererRef.current) {
      try {
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
      } catch (error) {
        //
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
