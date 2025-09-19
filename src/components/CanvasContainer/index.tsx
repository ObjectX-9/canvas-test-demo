import { useEffect, useRef, useState, useCallback } from "react";
import { DirectKey } from "../../core/utils/uniformScale";
import {
  coordinateSystemManager,
  pageManager,
  rulerManager,
} from "../../core/manage";
import { nodeTree } from "../../core/nodeTree";
import { Rectangle } from "../../core/nodeTree/node/rectangle";
import { BaseNode } from "../../core/nodeTree/node/baseNode";
import { Page } from "../../core/nodeTree/node/page";
import { PagePanel } from "./PagePanel";
import { mockElementData, initializeMockData } from "../../mock/element";
import { RenderLoop } from "../../core/render/RenderLoop";
import { globalDataObserver } from "../../core/render/DataObserver";

let canvas2DContext: CanvasRenderingContext2D;
let renderLoop: RenderLoop;

export const getCanvas2D = () => {
  return canvas2DContext;
};

export const getRenderManager = () => {
  return null; // 不再使用RenderManager
};

let hoveredNode: BaseNode | undefined;

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

  // 处理缩放
  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();

    const currentView = coordinateSystemManager.getViewState();
    const zoomFactor = 0.01; // 缩放速率调整为0.01
    const scaleChange = event.deltaY > 0 ? 1 - zoomFactor : 1 + zoomFactor;
    const newScale = Math.min(
      Math.max(0.1, currentView.scale * scaleChange),
      5
    ); // 确保缩放比例不会小于0.1

    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // 使用坐标系统管理器进行以鼠标位置为中心的缩放
    coordinateSystemManager.updateViewScale(newScale, mouseX, mouseY);

    const updatedView = coordinateSystemManager.getViewState();
    setViewState(updatedView);
    setZoomIndicator(`${Math.round(newScale * 100)}%`);

    // 同步视图状态到当前页面
    if (currentPage) {
      currentPage.zoom = newScale;
      currentPage.panX = updatedView.pageX;
      currentPage.panY = updatedView.pageY;
    }

    // 通知数据变更
    globalDataObserver.markChanged();
  };

  const handleMouseDownCanvas = (event: MouseEvent) => {
    isDragging.current = true;
    lastMousePosition.current = { x: event.clientX, y: event.clientY };
  };

  const handleMouseMoveCanvas = (event: MouseEvent) => {
    if (isDragging.current) {
      const deltaX = event.clientX - lastMousePosition.current.x;
      const deltaY = event.clientY - lastMousePosition.current.y;

      // 使用坐标系统管理器更新视图位置
      coordinateSystemManager.updateViewPosition(deltaX, deltaY);
      const updatedView = coordinateSystemManager.getViewState();
      setViewState(updatedView);

      // 同步视图状态到当前页面
      if (currentPage) {
        currentPage.panX = updatedView.pageX;
        currentPage.panY = updatedView.pageY;
      }

      // 通知数据变更
      globalDataObserver.markChanged();

      lastMousePosition.current = { x: event.clientX, y: event.clientY };
    }

    const allNodes = nodeTree.getAllNodes();
    // 使用坐标系统管理器进行屏幕坐标转世界坐标
    const worldPoint = coordinateSystemManager.screenToWorld(
      event.clientX,
      event.clientY
    );
    const canvasX = worldPoint.x;
    const canvasY = worldPoint.y;

    // 判断鼠标是否在节点上
    const isPointerInsideNode = (node: BaseNode, x: number, y: number) => {
      return (
        x >= node.x &&
        x <= node.x + node.w &&
        y >= node.y &&
        y <= node.y + node.h
      );
    };

    for (const node of allNodes) {
      if (
        (!hoveredNode || hoveredNode.id !== node.id) &&
        isPointerInsideNode(node, canvasX, canvasY)
      ) {
        console.log("鼠标在节点上:", hoveredNode);

        hoveredNode = node;
        hoveredNode.changeFills();
        break;
      }
    }
    console.log("画布位置", canvasX, canvasY);
  };

  const handleMouseUpCanvas = () => {
    isDragging.current = false;
  };

  // 直接绘制矩形的函数
  const drawRectangle = (ctx: CanvasRenderingContext2D, node: Rectangle) => {
    if (!node) return;

    const { x, y, w, h, fill, id } = node;

    // 绘制矩形
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);

    // 绘制边框
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    // 绘制ID文本
    ctx.fillStyle = "#000";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(id, x + w / 2, y + h / 2);
  };

  // 渲染场景的回调函数
  const drawScene = useCallback(
    (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 绘制页面背景色
      if (currentPage) {
        ctx.fillStyle = currentPage.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 绘制标尺（在坐标变换之前）
      rulerManager.render(ctx, canvas);

      // 保存当前状态并应用缩放和平移
      ctx.save();

      // 使用坐标系统管理器获取视图变换矩阵
      const viewMatrix = coordinateSystemManager.getViewTransformMatrix();
      ctx.setTransform(
        viewMatrix[0], // a (缩放 x)
        viewMatrix[1], // b (倾斜 y)
        viewMatrix[3], // c (倾斜 x)
        viewMatrix[4], // d (缩放 y)
        viewMatrix[6], // e (平移 x 轴)
        viewMatrix[7] // f (平移 y 轴)
      );

      // 绘制网格
      const currentView = coordinateSystemManager.getViewState();
      const step = 25; // 网格间隔
      ctx.strokeStyle = "#ddd";
      ctx.lineWidth = 1 / currentView.scale;

      // 获取当前视口范围
      const viewportWidth = canvas.width / currentView.scale;
      const viewportHeight = canvas.height / currentView.scale;

      const startX =
        Math.floor(-currentView.pageX / currentView.scale / step) * step;
      const startY =
        Math.floor(-currentView.pageY / currentView.scale / step) * step;
      const endX = startX + viewportWidth + step;
      const endY = startY + viewportHeight + step;

      // 绘制水平和垂直线
      for (let x = startX; x <= endX; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
      }

      for (let y = startY; y <= endY; y += step) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
      }

      // 渲染页面子节点（在坐标变换内）
      if (currentPage) {
        const pageChildren = currentPage.children;
        pageChildren.forEach((nodeId) => {
          const nodeState = nodeTree.getNodeById(nodeId);
          if (nodeState) {
            switch (nodeState.type) {
              case "rectangle": {
                drawRectangle(ctx, nodeState as Rectangle);
                break;
              }
            }
          }
        });
      }

      // 恢复坐标变换
      ctx.restore();
    },
    [currentPage, drawRectangle]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && canvas.getContext) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas2DContext = ctx;
        canvas.addEventListener("mousedown", handleMouseDownCanvas);
        canvas.addEventListener("mousemove", handleMouseMoveCanvas);
        canvas.addEventListener("mouseup", handleMouseUpCanvas);
        canvas.addEventListener("wheel", handleWheel);

        return () => {
          canvas.removeEventListener("mousedown", handleMouseDownCanvas);
          canvas.removeEventListener("mousemove", handleMouseMoveCanvas);
          canvas.removeEventListener("mouseup", handleMouseUpCanvas);
          canvas.removeEventListener("wheel", handleWheel);
        };
      }
    }
  }, [viewState]);

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
    // 初始化mock元素数据
    nodeTree.createAllElements(mockElementData);
    initializeMockData();

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
              rulerManager.toggle(e.target.checked);
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
              rulerManager.setTheme(e.target.value as "light" | "dark");
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
