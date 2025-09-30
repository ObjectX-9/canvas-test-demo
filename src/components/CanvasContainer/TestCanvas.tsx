import React, { useRef, useEffect, useState } from "react";
import { createCanvas2DRenderer } from "../../core/render";
import { Rect, Circle, Text, Container } from "../../core/render/components";
import type { ReactRenderer } from "../../core/render/react/ReactRenderer";

/**
 * 测试Canvas组件
 * 演示如何在现有系统中集成新的React自定义渲染器
 */

const TestCanvasScene: React.FC = () => {
  const [time, setTime] = useState(0);

  // 简单的动画循环
  useEffect(() => {
    const timer = setInterval(() => {
      setTime((t) => t + 0.1);
    }, 50);

    return () => clearInterval(timer);
  }, []);

  const x = 200 + Math.sin(time) * 100;
  const y = 150 + Math.cos(time) * 50;
  const color = `hsl(${(time * 50) % 360}, 70%, 50%)`;

  return (
    <Container>
      {/* 背景 */}
      <Rect x={0} y={0} width={400} height={300} fill="#2c3e50" />

      {/* 标题 */}
      <Text
        x={200}
        y={30}
        text="React 自定义渲染器测试"
        fontSize={16}
        fill="#ecf0f1"
        textAlign="center"
      />

      {/* 动画圆形 */}
      <Circle
        x={x}
        y={y}
        r={20}
        fill={color}
        stroke="#ecf0f1"
        strokeWidth={2}
      />

      {/* 静态装饰 */}
      <Rect x={50} y={250} width={300} height={2} fill="#34495e" />

      {/* 信息文本 */}
      <Text
        x={200}
        y={280}
        text={`时间: ${time.toFixed(1)}s`}
        fontSize={12}
        fill="#95a5a6"
        textAlign="center"
      />
    </Container>
  );
};

interface TestCanvasProps {
  width?: number;
  height?: number;
  className?: string;
}

export const TestCanvas: React.FC<TestCanvasProps> = ({
  width = 400,
  height = 300,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<ReactRenderer | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化渲染器
  useEffect(() => {
    if (canvasRef.current && !rendererRef.current) {
      try {
        console.log("🎨 初始化测试Canvas渲染器");

        const renderer = createCanvas2DRenderer(canvasRef.current);
        rendererRef.current = renderer;

        // 渲染初始场景
        renderer.render(<TestCanvasScene />);

        setIsInitialized(true);
        console.log("✅ 测试Canvas渲染器初始化成功");
      } catch (error) {
        console.error("❌ 测试Canvas渲染器初始化失败:", error);
      }
    }
  }, []);

  // 重新渲染场景
  useEffect(() => {
    if (rendererRef.current && isInitialized) {
      rendererRef.current.render(<TestCanvasScene />);
    }
  });

  // 清理
  useEffect(() => {
    return () => {
      if (rendererRef.current) {
        rendererRef.current.unmount();
        rendererRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`test-canvas-container ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          border: "1px solid #bdc3c7",
          borderRadius: "4px",
          backgroundColor: "#ecf0f1",
        }}
      />
      {!isInitialized && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "#7f8c8d",
            fontSize: "14px",
          }}
        >
          初始化中...
        </div>
      )}
    </div>
  );
};

export default TestCanvas;
