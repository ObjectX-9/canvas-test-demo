import { useEffect, useRef, useCallback } from "react";
import { SkiaLikeRenderer } from "..";
import { initRenderingEngine } from "../init";

/**
 * 画布容器
 * 使用Skia风格的JSX元素渲染：<canvas-grid>, <canvas-ruler>等
 */
const CanvasContainer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<SkiaLikeRenderer | null>(null);

  // 渲染Skia风格UI层
  const renderSkiaLikeUI = useCallback(() => {
    if (rendererRef.current) {
      rendererRef.current.render(
        <>
          <canvas-page></canvas-page>
        </>
      );
    }
  }, []);

  // 初始化Skia风格渲染器
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && !rendererRef.current) {
      try {
        const renderer = initRenderingEngine(canvas);
        renderer.setCanvasSize(window.innerWidth, window.innerHeight);

        rendererRef.current = renderer;

        // 渲染Skia风格UI层
        renderSkiaLikeUI();
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
