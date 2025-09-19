export type RenderCallback = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
) => void;

export class RenderLoop {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId: number | null = null;
  private renderCallback: RenderCallback | null = null;
  private needsRender = true;
  private isRunning = false;

  // 数据版本号，用于检测变更
  private dataVersion = 0;
  private lastRenderVersion = -1;

  // 性能监控
  private frameCount = 0;
  private lastFpsTime = performance.now();
  private currentFps = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("无法获取2D渲染上下文");
    }
    this.ctx = ctx;
  }

  // 设置渲染回调函数
  setRenderCallback(callback: RenderCallback) {
    this.renderCallback = callback;
  }

  // 标记需要重新渲染
  markNeedsRender() {
    this.needsRender = true;
    this.dataVersion++;
  }

  // 启动渲染循环
  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastFpsTime = performance.now();
    this.frameCount = 0;
    this.loop();
  }

  // 停止渲染循环
  stop() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.isRunning = false;
  }

  // 主渲染循环
  private loop = () => {
    if (!this.isRunning) return;

    const now = performance.now();

    // 计算FPS
    this.frameCount++;
    if (now - this.lastFpsTime >= 1000) {
      this.currentFps = Math.round(
        (this.frameCount * 1000) / (now - this.lastFpsTime)
      );
      this.frameCount = 0;
      this.lastFpsTime = now;
    }

    // 检查是否需要渲染
    if (this.needsRender || this.dataVersion !== this.lastRenderVersion) {
      this.render();
      this.needsRender = false;
      this.lastRenderVersion = this.dataVersion;
    }

    // 继续下一帧
    this.animationId = requestAnimationFrame(this.loop);
  };

  // 执行渲染
  private render() {
    if (this.renderCallback) {
      try {
        this.renderCallback(this.ctx, this.canvas);
      } catch (error) {
        console.error("渲染错误:", error);
      }
    }
  }

  // 获取当前FPS
  getFPS(): number {
    return this.currentFps;
  }

  // 获取渲染状态
  isActive(): boolean {
    return this.isRunning;
  }

  // 强制渲染一帧
  forceRender() {
    this.markNeedsRender();
  }

  // 销毁渲染循环
  destroy() {
    this.stop();
    this.renderCallback = null;
  }
}
