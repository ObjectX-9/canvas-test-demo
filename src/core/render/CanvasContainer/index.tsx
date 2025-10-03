import { useEffect, useRef, useCallback } from "react";
import { SkiaLikeRenderer } from "..";
import { initRenderingEngine } from "../init";
import { EventSystemInitializer } from "../../event";

interface CanvasContainerProps {
  eventSystemInitializer: EventSystemInitializer;
}

/**
 * 画布容器
 * 使用依赖注入方式接收事件系统初始化器，实现解耦设计
 */
const CanvasContainer = ({ eventSystemInitializer }: CanvasContainerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<SkiaLikeRenderer | null>(null);

  // 渲染Skia风格UI层
  const renderSkiaLikeUIRef = useRef<() => void>();

  renderSkiaLikeUIRef.current = () => {
    if (rendererRef.current) {
      rendererRef.current.render(
        <>
          <canvas-grid></canvas-grid>
          <canvas-page></canvas-page>
          <canvas-ruler></canvas-ruler>
        </>
      );
    }
  };

  const renderSkiaLikeUI = useCallback(() => {
    renderSkiaLikeUIRef.current?.();
  }, []);

  // 初始化渲染器和事件系统
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && !rendererRef.current) {
      try {
        const renderer = initRenderingEngine(canvas);
        const width = window.innerWidth;
        const height = window.innerHeight;

        renderer.setCanvasSize(width, height);
        rendererRef.current = renderer;

        // 初始化新的事件系统
        eventSystemInitializer.initialize(canvas);

        // 监听渲染请求
        const eventSystem = eventSystemInitializer.getEventSystem();
        eventSystem.getEventEmitter().on("render:request", renderSkiaLikeUI);

        // 渲染初始UI
        renderSkiaLikeUI();
      } catch (error) {
        console.error("❌ 渲染器或事件系统初始化失败:", error);
      }
    }
  }, []); // 空依赖数组，只在组件挂载时执行一次

  // 监听UI变化
  useEffect(() => {
    renderSkiaLikeUI();
  }, [renderSkiaLikeUI]);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      if (rendererRef.current && canvasRef.current) {
        const width = window.innerWidth;
        const height = window.innerHeight;

        rendererRef.current.setCanvasSize(width, height);
        renderSkiaLikeUI();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [renderSkiaLikeUI]);

  // 清理 - 只清理渲染器，不管理事件系统
  useEffect(() => {
    return () => {
      console.log("🧹 清理Canvas容器...");

      // 只清理渲染器，事件系统由自己管理生命周期
      if (rendererRef.current) {
        rendererRef.current.clear();
      }

      console.log("✅ Canvas容器清理完成");
    };
  }, []); // 空依赖数组，只在组件卸载时执行

  return (
    <div className="canvas-container-wrapper" style={{ position: "relative" }}>
      {/* Canvas区域 */}
      <div style={{ height: "100%", position: "relative" }}>
        <canvas
          ref={canvasRef}
          width={window.innerWidth}
          height={window.innerHeight}
          style={{
            display: "block",
            width: `${window.innerWidth}px`,
            height: `${window.innerHeight}px`,
          }}
        />
      </div>
    </div>
  );
};

export default CanvasContainer;
