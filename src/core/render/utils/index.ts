/**
 * 渲染器工具函数
 */

/**
 * 颜色工具
 */
export const colorUtils = {
  /**
   * HSL转RGB
   */
  hslToRgb(h: number, s: number, l: number): [number, number, number] {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
    const g = Math.round(hue2rgb(p, q, h) * 255);
    const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);

    return [r, g, b];
  },

  /**
   * RGB转十六进制
   */
  rgbToHex(r: number, g: number, b: number): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  },

  /**
   * HSL转十六进制
   */
  hslToHex(h: number, s: number, l: number): string {
    const [r, g, b] = this.hslToRgb(h, s, l);
    return this.rgbToHex(r, g, b);
  },
};

/**
 * 数学工具
 */
export const mathUtils = {
  /**
   * 线性插值
   */
  lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  },

  /**
   * 限制数值范围
   */
  clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  },

  /**
   * 度转弧度
   */
  degToRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  },

  /**
   * 弧度转度
   */
  radToDeg(radians: number): number {
    return (radians * 180) / Math.PI;
  },

  /**
   * 计算两点距离
   */
  distance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },
};

/**
 * 动画工具
 */
export const animationUtils = {
  /**
   * 缓动函数
   */
  easing: {
    linear: (t: number) => t,
    easeInQuad: (t: number) => t * t,
    easeOutQuad: (t: number) => t * (2 - t),
    easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    easeInCubic: (t: number) => t * t * t,
    easeOutCubic: (t: number) => --t * t * t + 1,
    easeInOutCubic: (t: number) =>
      t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  },

  /**
   * 简单的动画循环
   */
  createAnimationLoop(callback: (time: number) => void): () => void {
    let isRunning = true;
    let startTime: number | null = null;

    const frame = (currentTime: number) => {
      if (!isRunning) return;

      if (startTime === null) {
        startTime = currentTime;
      }

      const elapsed = (currentTime - startTime) / 1000; // 转换为秒
      callback(elapsed);

      requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);

    // 返回停止函数
    return () => {
      isRunning = false;
    };
  },
};

/**
 * Canvas工具
 */
export const canvasUtils = {
  /**
   * 获取高DPI画布上下文
   */
  getHighDPIContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("无法获取2D渲染上下文");
    }

    const devicePixelRatio = window.devicePixelRatio || 1;
    const backingStoreRatio = 1; // 现代浏览器通常为1

    const ratio = devicePixelRatio / backingStoreRatio;

    if (ratio !== 1) {
      const oldWidth = canvas.width;
      const oldHeight = canvas.height;

      canvas.width = oldWidth * ratio;
      canvas.height = oldHeight * ratio;
      canvas.style.width = oldWidth + "px";
      canvas.style.height = oldHeight + "px";

      ctx.scale(ratio, ratio);
    }

    return ctx;
  },

  /**
   * 清空画布
   */
  clearCanvas(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  },
};

/**
 * 性能监控工具
 */
export const performanceUtils = {
  /**
   * 测量函数执行时间
   */
  measure<T>(fn: () => T, label?: string): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();

    if (label) {
      console.log(`${label}: ${(end - start).toFixed(2)}ms`);
    }

    return result;
  },

  /**
   * 创建FPS监控器
   */
  createFPSMonitor(): { getFPS: () => number; update: () => void } {
    let fps = 0;
    let frameCount = 0;
    let lastTime = performance.now();

    return {
      getFPS: () => fps,
      update: () => {
        frameCount++;
        const currentTime = performance.now();

        if (currentTime - lastTime >= 1000) {
          fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
          frameCount = 0;
          lastTime = currentTime;
        }
      },
    };
  },
};
