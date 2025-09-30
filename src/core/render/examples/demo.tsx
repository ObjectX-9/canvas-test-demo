import React from "react";
import { createCanvas2DRenderer } from "../index";
import { Rect, Circle, Text, Container } from "../components";

/**
 * 演示如何使用新的React自定义渲染器
 */

// 简单的示例应用
const DemoApp: React.FC = () => {
  return (
    <Container>
      {/* 背景 */}
      <Rect x={0} y={0} width={400} height={300} fill="#f8f9fa" />

      {/* 标题 */}
      <Text
        x={200}
        y={30}
        text="React Canvas 渲染器演示"
        fontSize={18}
        fill="#212529"
        textAlign="center"
      />

      {/* 图形示例 */}
      <Rect
        x={50}
        y={80}
        width={80}
        height={60}
        fill="#ff6b6b"
        stroke="#c92a2a"
        strokeWidth={2}
      />
      <Circle
        x={180}
        y={110}
        r={30}
        fill="#4ecdc4"
        stroke="#2ca39f"
        strokeWidth={2}
      />
      <Rect
        x={270}
        y={80}
        width={80}
        height={60}
        fill="#45b7d1"
        stroke="#1c7ed6"
        strokeWidth={2}
      />

      {/* 说明文本 */}
      <Text
        x={90}
        y={160}
        text="矩形"
        fontSize={14}
        fill="#666"
        textAlign="center"
      />
      <Text
        x={180}
        y={160}
        text="圆形"
        fontSize={14}
        fill="#666"
        textAlign="center"
      />
      <Text
        x={310}
        y={160}
        text="矩形"
        fontSize={14}
        fill="#666"
        textAlign="center"
      />

      {/* 底部信息 */}
      <Text
        x={200}
        y={250}
        text="支持 React Hooks、状态管理和组件生命周期"
        fontSize={12}
        fill="#868e96"
        textAlign="center"
      />
    </Container>
  );
};

/**
 * 运行演示
 */
export function runDemo(canvasId: string = "demo-canvas"): void {
  // 获取或创建 Canvas 元素
  let canvas = document.getElementById(canvasId) as HTMLCanvasElement;

  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = canvasId;
    canvas.width = 400;
    canvas.height = 300;
    canvas.style.border = "1px solid #dee2e6";
    canvas.style.borderRadius = "4px";
    document.body.appendChild(canvas);
  }

  console.log("🚀 启动React Canvas渲染器演示");

  try {
    // 创建渲染器
    const renderer = createCanvas2DRenderer(canvas);

    // 渲染应用
    renderer.render(<DemoApp />);

    console.log("✅ 演示启动成功");

    // 可选：返回渲染器实例以便进一步操作
    (window as { __demoRenderer?: unknown }).__demoRenderer = renderer;
  } catch (error) {
    console.error("❌ 演示启动失败:", error);
  }
}

// 如果在浏览器环境中直接运行，自动启动演示
if (typeof window !== "undefined" && document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => runDemo());
} else if (typeof window !== "undefined") {
  // 页面已加载，直接运行
  runDemo();
}

export default DemoApp;
