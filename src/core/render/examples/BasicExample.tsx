import React, { useEffect, useState } from "react";
import { createCanvas2DRenderer } from "../index";
import { Rect, Circle, Text, Group, Container } from "../components";
import type { ReactRenderer } from "../react/ReactRenderer";

/**
 * 基础使用示例
 * 演示如何使用React自定义渲染器绘制Canvas内容
 */

interface ExampleAppProps {
  title?: string;
}

const ExampleApp: React.FC<ExampleAppProps> = ({
  title = "Canvas React 示例",
}) => {
  const [count, setCount] = useState(0);

  // 模拟动画效果
  useEffect(() => {
    const timer = setInterval(() => {
      setCount((c) => c + 1);
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const rotation = (count * 2) % 360;
  const scale = Math.sin(count * 0.05) * 0.3 + 1;

  return (
    <Container>
      {/* 背景 */}
      <Rect x={0} y={0} width={800} height={600} fill="#f0f0f0" />

      {/* 标题文本 */}
      <Text
        x={400}
        y={50}
        text={title}
        fontSize={24}
        fontFamily="Arial"
        fill="#333"
        textAlign="center"
      />

      {/* 动态圆形 */}
      <Circle
        x={200}
        y={200}
        r={50}
        fill="#ff6b6b"
        stroke="#c92a2a"
        strokeWidth={3}
      />

      {/* 动态矩形 */}
      <Group
        transform={`translate(400, 200) rotate(${rotation}) scale(${scale})`}
      >
        <Rect
          x={-30}
          y={-30}
          width={60}
          height={60}
          fill="#4ecdc4"
          stroke="#2ca39f"
          strokeWidth={2}
        />
      </Group>

      {/* 动态文本 */}
      <Text
        x={600}
        y={200}
        text={`Count: ${count}`}
        fontSize={18}
        fill="#6c5ce7"
        textAlign="center"
      />

      {/* 线条装饰 */}
      {Array.from({ length: 5 }).map((_, i) => (
        <Rect
          key={i}
          x={50 + i * 30}
          y={400}
          width={20}
          height={Math.sin(count * 0.1 + i) * 20 + 50}
          fill={`hsl(${(count + i * 60) % 360}, 70%, 60%)`}
        />
      ))}
    </Container>
  );
};

/**
 * 示例使用函数
 */
export function runBasicExample(canvas: HTMLCanvasElement): ReactRenderer {
  console.log("🚀 启动基础示例");

  // 创建React渲染器
  const reactRenderer = createCanvas2DRenderer(canvas);

  // 渲染示例应用
  reactRenderer.render(<ExampleApp />);

  console.log("✅ 基础示例启动完成");
  return reactRenderer;
}

/**
 * 创建Canvas并运行示例
 */
export function createCanvasAndRunExample(
  container: HTMLElement
): ReactRenderer {
  // 创建Canvas元素
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 600;
  canvas.style.border = "1px solid #ccc";

  // 添加到容器
  container.appendChild(canvas);

  // 运行示例
  return runBasicExample(canvas);
}

export default ExampleApp;
