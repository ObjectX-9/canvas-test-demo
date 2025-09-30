import { useEffect, useRef, useState, useCallback } from "react";
import {
  coordinateSystemManager,
  pageManager,
  viewManager,
} from "../../core/manage";

import { PageNode } from "../../core/nodeTree/node/pageNode";
import { globalEventManager, initializeEventSystem } from "../../core/event";
import { selectionStore } from "../../core/store/SelectionStore";

// 导入新的React自定义渲染器
import {
  createCanvas2DRenderer,
  Rect,
  Circle,
  Text,
  Container,
} from "../../core/render";
import type { ReactRenderer } from "../../core/render/react/ReactRenderer";
import React from "react";

let reactRenderer: ReactRenderer | null = null;

// 导入ViewInfo类型
import { ViewInfo } from "../../core/types/view";

// React Canvas场景组件
const CanvasScene: React.FC<{
  viewState?: ViewInfo;
  currentPage?: PageNode | null;
}> = ({ viewState, currentPage }) => {
  const [time, setTime] = useState(0);

  // 简单的动画效果
  useEffect(() => {
    const timer = setInterval(() => {
      setTime((t) => t + 0.05);
    }, 16);

    return () => clearInterval(timer);
  }, []);

  // 动态位置计算
  const rect1X = 100 + Math.sin(time) * 50;
  const rect2X = 300 + Math.cos(time * 1.2) * 30;
  const rect1Color = `hsl(${(time * 30) % 360}, 70%, 60%)`;
  const rect2Color = `hsl(${(time * 50 + 120) % 360}, 70%, 60%)`;

  return (
    <Container>
      {/* 背景 */}
      <Rect
        x={0}
        y={0}
        width={window.innerWidth}
        height={window.innerHeight}
        fill="#f8f9fa"
      />

      {/* 标题 */}
      <Text
        x={window.innerWidth / 2}
        y={50}
        text="React 自定义渲染器 + 现有系统集成"
        fontSize={24}
        fontFamily="Arial"
        fill="#2c3e50"
        textAlign="center"
      />

      {/* 第一个矩形 - 动态位置和颜色 */}
      <Rect
        x={rect1X}
        y={150}
        width={120}
        height={80}
        fill={rect1Color}
        stroke="#2c3e50"
        strokeWidth={2}
      />

      {/* 第二个矩形 - 动态位置和颜色 */}
      <Rect
        x={rect2X}
        y={300}
        width={100}
        height={100}
        fill={rect2Color}
        stroke="#34495e"
        strokeWidth={3}
      />

      {/* 装饰圆形 */}
      <Circle
        x={200}
        y={450}
        r={25}
        fill="#e74c3c"
        stroke="#c0392b"
        strokeWidth={2}
      />

      {/* 系统信息显示 */}
      {viewState && (
        <Text
          x={20}
          y={30}
          text={`视图状态: 已加载 | 页面: ${currentPage?.name || "无"}`}
          fontSize={14}
          fill="#7f8c8d"
        />
      )}

      {/* 动态信息 */}
      <Text
        x={20}
        y={window.innerHeight - 30}
        text={`React渲染器集成成功 | 时间: ${time.toFixed(1)}s`}
        fontSize={12}
        fill="#95a5a6"
      />
    </Container>
  );
};

/**
 * 画布容器
 * 负责初始化画布、事件系统
 * 现已完全使用React自定义渲染器
 */
const CanvasContainer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewState, setViewState] = useState(
    coordinateSystemManager.getViewState()
  );
  const [currentPage, setCurrentPage] = useState<PageNode | null>(
    pageManager.getCurrentPage()
  );
  console.log("✅ ~ currentPage:", currentPage);
  const isDragging = useRef(false);
  const lastMousePosition = useRef({ x: 0, y: 0 });
  const [isInitialized, setIsInitialized] = useState(false);

  // React渲染器渲染函数
  const renderReactScene = useCallback(() => {
    if (reactRenderer) {
      try {
        console.log("🎨 使用React渲染器渲染场景");

        // 渲染React场景
        reactRenderer.render(
          <CanvasScene viewState={viewState} currentPage={currentPage} />
        );

        console.log("✅ React渲染器渲染完成");
      } catch (error) {
        console.error("❌ React渲染器渲染失败:", error);
      }
    }
  }, [viewState, currentPage]);

  // 初始化React渲染器
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && !reactRenderer) {
      try {
        console.log("🚀 初始化React Canvas渲染器");

        reactRenderer = createCanvas2DRenderer(canvas);

        // 渲染初始场景
        reactRenderer.render(
          <CanvasScene viewState={viewState} currentPage={currentPage} />
        );

        setIsInitialized(true);
        console.log("✅ React Canvas渲染器初始化完成");
      } catch (error) {
        console.error("❌ React Canvas渲染器初始化失败:", error);
      }
    }
  }, [viewState, currentPage]);

  // Canvas事件监听器
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && isInitialized) {
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
  }, [isInitialized, viewState, currentPage]);

  // 初始化页面视图状态
  useEffect(() => {
    // 页面和子节点数据在PageManager中自动初始化
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

  // 当数据变更时重新渲染
  useEffect(() => {
    if (isInitialized) {
      renderReactScene();
    }
  }, [viewState, currentPage, isInitialized, renderReactScene]);

  // 清理函数
  useEffect(() => {
    return () => {
      if (reactRenderer) {
        reactRenderer.unmount();
        reactRenderer = null;
      }
    };
  }, []);

  return (
    <div
      className="h-full bg-gray-100 border border-gray-300"
      style={{ position: "relative" }}
    >
      {/* 状态信息面板 */}
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
        }}
      >
        <div style={{ color: "#2ecc71", fontWeight: "bold" }}>
          ✅ React自定义渲染器
        </div>
        <div style={{ fontSize: "10px", color: "#666", marginTop: "2px" }}>
          状态: {isInitialized ? "已初始化" : "初始化中..."}
        </div>
        <div style={{ fontSize: "10px", color: "#666" }}>
          页面: {currentPage?.name || "无"}
        </div>
      </div>

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
          🚀 正在初始化React Canvas渲染器...
        </div>
      )}
    </div>
  );
};

export default CanvasContainer;
