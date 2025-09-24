import { useEffect, useRef, useState, useCallback } from "react";
import { coordinateSystemManager, pageManager } from "../../core/manage";
import { ViewUtils } from "../../core/types";

import { Page } from "../../core/nodeTree/node/page";
import { RenderLoop } from "../../core/render/RenderLoop";
import { globalDataObserver } from "../../core/render/DataObserver";
import { globalCanvasRenderEngine } from "../../core/render/canvas";
import { globalEventManager, initializeEventSystem } from "../../core/event";
import { selectionStore } from "../../core/store/SelectionStore";

let renderLoop: RenderLoop;
/**
 * 画布容器
 * 负责初始化画布、事件系统、渲染循环等
 * 不负责渲染逻辑，只负责初始化
 * 渲染逻辑在CanvasRenderEngine中实现
 */
const CanvasContainer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewState, setViewState] = useState(
    coordinateSystemManager.getViewState()
  );
  const [currentPage, setCurrentPage] = useState<Page | null>(
    pageManager.getCurrentPage()
  );
  const isDragging = useRef(false);
  const lastMousePosition = useRef({ x: 0, y: 0 });

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
    if (canvas) {
      // 初始化Canvas渲染系统
      globalCanvasRenderEngine.initializeCanvas(canvas);

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
        selectionStore,
        coordinateSystemManager,
        setViewState,
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

    return () => {
      unsubscribe();
      renderLoop.destroy();
    };
  }, [drawScene]);

  // 初始化页面视图状态
  useEffect(() => {
    // 页面和子节点数据在PageManager中自动初始化
    const initialPage = pageManager.getCurrentPage();
    if (initialPage) {
      setCurrentPage(initialPage);
      // 同步初始页面的视图状态
      const initialViewState = ViewUtils.create(
        initialPage.panX,
        initialPage.panY,
        initialPage.zoom
      );
      coordinateSystemManager.setViewState(initialViewState);
      setViewState(coordinateSystemManager.getViewState());
    }
  }, []);

  // 当数据变更时通知渲染循环
  useEffect(() => {
    globalDataObserver.markChanged();
  }, [viewState, currentPage]);

  return (
    <div
      className="h-full bg-gray-100 border border-gray-300"
      style={{ position: "relative" }}
    >
      {/* 画布区域 */}
      <div style={{ height: "100%", position: "relative" }}>
        <canvas
          ref={canvasRef}
          id="canvasContainer"
          height={window.innerHeight}
          width={window.innerWidth}
          style={{ cursor: isDragging.current ? "grabbing" : "grab" }}
        ></canvas>
      </div>
    </div>
  );
};

export default CanvasContainer;
