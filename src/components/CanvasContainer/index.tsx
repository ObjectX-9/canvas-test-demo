import { useEffect, useRef, useState } from "react";
import { initJsdState } from "../../core/init/init";
import { viewStore } from "../../core/store/ViewStore";

let canvas2DContext: CanvasRenderingContext2D;

export const getCanvas2D = () => {
  return canvas2DContext;
};

const CanvasContainer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1); // 缩放比例
  const [offset, setOffset] = useState({ x: viewStore.getView().pageX, y: viewStore.getView().pageY }); // 画布平移偏移量
  console.log("✅ ✅ ✅ ~  offset:", offset);
  const [zoomIndicator, setZoomIndicator] = useState("100%"); // 缩放标识
  const isDragging = useRef(false);
  const lastMousePosition = useRef({ x: 0, y: 0 });

  // 处理缩放
  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();

    const zoomFactor = 0.01; // 缩放速率调整为0.01
    const scaleChange = event.deltaY > 0 ? 1 - zoomFactor : 1 + zoomFactor;
    const newScale = Math.min(Math.max(0.1, scale * scaleChange), 5); // 确保缩放比例不会小于0.1

    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const sceneX = (mouseX - offset.x) / scale;
    const sceneY = (mouseY - offset.y) / scale;

    setScale(newScale);
    setOffset({
      x: mouseX - sceneX * newScale,
      y: mouseY - sceneY * newScale,
    });

    setZoomIndicator(`${Math.round(newScale * 100)}%`);
  };

  const handleMouseDownCanvas = (event: MouseEvent) => {
    isDragging.current = true;
    lastMousePosition.current = { x: event.clientX, y: event.clientY };
  };

  const handleMouseMoveCanvas = (event: MouseEvent) => {
    if (isDragging.current) {
      const deltaX = event.clientX - lastMousePosition.current.x;
      const deltaY = event.clientY - lastMousePosition.current.y;

      setOffset((prevOffset) => ({
        x: prevOffset.x + deltaX,
        y: prevOffset.y + deltaY,
      }));

      lastMousePosition.current = { x: event.clientX, y: event.clientY };
    }
  };

  const handleMouseUpCanvas = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && canvas.getContext) {
      const ctx = canvas.getContext("2d");
      console.log("✅ ~ ctx:", ctx);
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
  }, [scale, offset]);

  useEffect(() => {
    const ctx = getCanvas2D();
    const canvas = canvasRef.current as HTMLCanvasElement;

    const drawScene = () => {
      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 保存当前状态并应用缩放和平移
      ctx.save();
      ctx.translate(offset.x, offset.y);
      ctx.scale(scale, scale);

      // 绘制网格
      const step = 25; // 网格间隔
      ctx.strokeStyle = "#ddd";
      ctx.lineWidth = 1 / scale;

      // 获取当前视口范围
      const viewportWidth = canvas.width / scale;
      const viewportHeight = canvas.height / scale;

      const startX = Math.floor(-offset.x / scale / step) * step;
      const startY = Math.floor(-offset.y / scale / step) * step;
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

      // 绘制矩形在逻辑坐标 (200, 200) 位置
      const rectX = 200;
      const rectY = 200;
      const rectWidth = 100;
      const rectHeight = 50;
      ctx.strokeStyle = "#ff0000";
      ctx.lineWidth = 2 / scale;
      ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

      ctx.restore();

      // 绘制标尺
      drawRulers();
    };

    const drawRulers = () => {
      // 计算标尺步长，确保步长为10的倍数
      let rulerStep = 10;
      while (rulerStep * scale < 50) {
        rulerStep *= 2;
      }

      ctx.strokeStyle = "#000";
      ctx.font = `12px Arial`; // 固定字体大小
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // 获取当前视口范围
      const viewportWidth = canvas.width;
      const viewportHeight = canvas.height;

      // 顶部标尺
      const startX = Math.floor(-offset.x / scale / rulerStep) * rulerStep;
      const endX = startX + viewportWidth / scale + rulerStep;
      for (let x = startX; x <= endX; x += rulerStep) {
        const screenX = x * scale + offset.x;
        const sceneX = Math.round(x);
        ctx.beginPath();
        ctx.moveTo(screenX, 0);
        ctx.lineTo(screenX, 10); // 标尺高度为10像素
        ctx.stroke();
        ctx.fillText(`${sceneX}`, screenX, 20); // 显示刻度数值
      }

      // 左侧标尺
      const startY = Math.floor(-offset.y / scale / rulerStep) * rulerStep;
      const endY = startY + viewportHeight / scale + rulerStep;
      for (let y = startY; y <= endY; y += rulerStep) {
        const screenY = y * scale + offset.y;
        const sceneY = Math.round(y);
        ctx.beginPath();
        ctx.moveTo(0, screenY);
        ctx.lineTo(10, screenY); // 标尺高度为10像素
        ctx.stroke();
        ctx.fillText(`${sceneY}`, 20, screenY); // 显示刻度数值
      }
    };

    drawScene();
  }, [scale, offset]);

  return (
    <div style={{ position: "relative" }}>
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
          backgroundColor: "rgba(0,0,0,0.5)",
          color: "#fff",
          padding: "5px 10px",
          borderRadius: "5px",
        }}
      >
        缩放: {zoomIndicator}
      </div>
    </div>
  );
};

export default CanvasContainer;
