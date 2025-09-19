import { useEffect, useRef, useState, useCallback } from "react";
import { DirectKey } from "../../core/utils/uniformScale";
import { coordinateSystemManager, pageManager } from "../../core/manage";
import { nodeTree } from "../../core/nodeTree";

import { Page } from "../../core/nodeTree/node/page";
import { PagePanel } from "./PagePanel";
import { mockElementData } from "../../mock/element";
import { RenderLoop } from "../../core/render/RenderLoop";
import { globalDataObserver } from "../../core/render/DataObserver";
import { globalCanvasRenderEngine } from "../../core/render/canvas";
import { globalEventManager, initializeEventSystem } from "../../core/event";

let canvas2DContext: CanvasRenderingContext2D;
let renderLoop: RenderLoop;

export const getCanvas2D = () => {
  return canvas2DContext;
};

// getRenderManager已移除 - 使用新的Canvas渲染架构

const CanvasContainer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewState, setViewState] = useState(
    coordinateSystemManager.getViewState()
  );
  const [zoomIndicator, setZoomIndicator] = useState(
    `${Math.round(viewState.scale * 100)}%`
  ); // 缩放标识
  const [ratio, setRatio] = useState(1); // 比例尺
  const [scaleCenter, setScaleCenter] = useState<DirectKey>("CC"); // 缩放中心
  const [currentPage, setCurrentPage] = useState<Page | null>(
    pageManager.getCurrentPage()
  );
  const [showPagePanel, setShowPagePanel] = useState(false);
  const [fps, setFps] = useState(0); // FPS显示
  const isDragging = useRef(false);
  const lastMousePosition = useRef({ x: 0, y: 0 });

  // 处理页面切换
  const handlePageSwitch = (page: Page) => {
    setCurrentPage(page);

    // 同步页面的视图状态到坐标系统管理器
    coordinateSystemManager.setViewState({
      pageX: page.panX,
      pageY: page.panY,
      scale: page.zoom,
    });
    setViewState(coordinateSystemManager.getViewState());
    setZoomIndicator(`${Math.round(page.zoom * 100)}%`);

    // 通知数据变更
    globalDataObserver.markChanged();
  };

  // 渲染场景的回调函数
  const drawScene = useCallback(
    (_ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      if (currentPage) {
        globalCanvasRenderEngine.initializeCanvas(canvas);
        globalCanvasRenderEngine.renderCanvasPage(currentPage, {
          renderRulers: true,
          renderGrid: true,
        });
      }
    },
    [currentPage]
  );

  // Canvas事件监听器
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && canvas.getContext) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas2DContext = ctx;

        // 初始化事件系统（只在首次渲染时）
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
          setViewState,
          setZoomIndicator,
        };

        // 设置事件上下文
        globalEventManager.setContext(eventContext);

        // 绑定画布事件
        globalEventManager.bindCanvasEvents(canvas);

        return () => {
          // 解绑画布事件
          globalEventManager.unbindCanvasEvents(canvas);
        };
      }
    }
  }, []);

  // 初始化渲染循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 创建渲染循环
    renderLoop = new RenderLoop(canvas);
    renderLoop.setRenderCallback(drawScene);

    // 订阅数据变更
    const unsubscribe = globalDataObserver.subscribe(() => {
      renderLoop.markNeedsRender();
    });

    // 启动渲染循环
    renderLoop.start();

    // FPS监控
    const fpsInterval = setInterval(() => {
      setFps(renderLoop.getFPS());
    }, 1000);

    return () => {
      clearInterval(fpsInterval);
      unsubscribe();
      renderLoop.destroy();
    };
  }, [drawScene]);

  // Canvas初始化
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      canvas2DContext = ctx;
    }
  }, []);

  // 初始化页面视图状态和mock数据
  useEffect(() => {
    // 旧版本的mock元素数据（保留备用）
    nodeTree.createAllElements(mockElementData);
    // 页面和子节点数据现在在PageManager中自动初始化

    const initialPage = pageManager.getCurrentPage();
    if (initialPage) {
      setCurrentPage(initialPage);
      // 同步初始页面的视图状态
      coordinateSystemManager.setViewState({
        pageX: initialPage.panX,
        pageY: initialPage.panY,
        scale: initialPage.zoom,
      });
      setViewState(coordinateSystemManager.getViewState());
      setZoomIndicator(`${Math.round(initialPage.zoom * 100)}%`);
    }
  }, []);

  // 当数据变更时通知渲染循环
  useEffect(() => {
    globalDataObserver.markChanged();
  }, [viewState, ratio, scaleCenter, currentPage]);

  return (
    <div style={{ position: "relative" }}>
      {/* 页面管理面板 */}
      <PagePanel
        isVisible={showPagePanel}
        onClose={() => setShowPagePanel(false)}
        onPageSwitch={handlePageSwitch}
        currentPage={currentPage}
      />

      {/* 页面切换按钮 */}
      <button
        onClick={() => setShowPagePanel(!showPagePanel)}
        style={{
          position: "absolute",
          left: showPagePanel ? 260 : 10,
          top: 10,
          padding: "10px 15px",
          backgroundColor: "rgba(0,0,0,0.8)",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          zIndex: 1001,
          transition: "all 0.3s ease",
          fontSize: "14px",
          fontWeight: "500",
        }}
      >
        {showPagePanel ? "◀" : "▶"} 页面
      </button>

      <canvas
        ref={canvasRef}
        id="canvasContainer"
        height={window.innerHeight}
        width={window.innerWidth}
        style={{ cursor: isDragging.current ? "grabbing" : "grab" }}
      ></canvas>
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          backgroundColor: "rgba(0,0,0,0.8)",
          color: "#fff",
          padding: "12px 16px",
          borderRadius: "6px",
          fontSize: "14px",
        }}
      >
        <div style={{ fontWeight: "600", marginBottom: "4px" }}>
          当前页面: {currentPage?.name || "无"}
        </div>
        <div style={{ marginBottom: "4px" }}>缩放: {zoomIndicator}</div>
        <div style={{ fontSize: "12px", color: "#ccc", marginBottom: "4px" }}>
          画布: {currentPage?.width || 0} × {currentPage?.height || 0}
        </div>
        <div style={{ fontSize: "11px", color: "#888" }}>FPS: {fps}</div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 10,
          right: 10,
          backgroundColor: "rgba(0,0,0,0.5)",
          color: "#fff",
          padding: "10px",
          borderRadius: "5px",
        }}
      >
        <div>
          <label htmlFor="ratio">比例尺: </label>
          <input
            type="range"
            id="ratio"
            min="0.1"
            max="5"
            step="0.1"
            value={ratio}
            onChange={(e) => setRatio(parseFloat(e.target.value))}
          />
          {ratio}
        </div>
        <div>
          <label htmlFor="scaleCenter">缩放中心: </label>
          <select
            id="scaleCenter"
            value={scaleCenter}
            onChange={(e) => {
              return setScaleCenter(e.target.value as DirectKey);
            }}
          >
            <option value="LT">左上</option>
            <option value="RT">右上</option>
            <option value="RB">右下</option>
            <option value="LB">左下</option>
            <option value="TC">上</option>
            <option value="BC">下</option>
            <option value="LC">左</option>
            <option value="RC">右</option>
            <option value="CC">中</option>
          </select>
        </div>
        <div>
          <label htmlFor="toggleRuler">标尺显示: </label>
          <input
            type="checkbox"
            id="toggleRuler"
            defaultChecked={true}
            onChange={(e) => {
              globalCanvasRenderEngine.toggleRuler(e.target.checked);
              globalDataObserver.markChanged();
            }}
          />
        </div>
        <div>
          <label htmlFor="rulerTheme">标尺主题: </label>
          <select
            id="rulerTheme"
            defaultValue="light"
            onChange={(e) => {
              globalCanvasRenderEngine.setRulerTheme(
                e.target.value as "light" | "dark"
              );
              globalDataObserver.markChanged();
            }}
          >
            <option value="light">浅色</option>
            <option value="dark">深色</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default CanvasContainer;
