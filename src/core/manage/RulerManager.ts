import { coordinateSystemManager } from "./index";

export interface RulerConfig {
  // 标尺样式配置
  strokeColor: string;
  textColor: string;
  font: string;
  rulerHeight: number;
  textOffset: number;

  // 步长配置
  minStepPixels: number;
  baseStep: number;

  // 显示配置
  showNumbers: boolean;
  showTicks: boolean;
}

export class RulerManager {
  private config: RulerConfig;

  constructor(config?: Partial<RulerConfig>) {
    // 默认配置
    this.config = {
      strokeColor: "#000",
      textColor: "#000",
      font: "12px Arial",
      rulerHeight: 10,
      textOffset: 20,
      minStepPixels: 50,
      baseStep: 10,
      showNumbers: true,
      showTicks: true,
      ...config,
    };
  }

  /**
   * 更新标尺配置
   */
  updateConfig(config: Partial<RulerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  getConfig(): RulerConfig {
    return { ...this.config };
  }

  /**
   * 计算合适的标尺步长
   */
  private calculateStep(scale: number): number {
    let step = this.config.baseStep;
    while (step * scale < this.config.minStepPixels) {
      step *= 2;
    }
    return step;
  }

  /**
   * 绘制水平标尺
   */
  private drawHorizontalRuler(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    step: number
  ): void {
    const currentView = coordinateSystemManager.getViewState();
    const viewportWidth = canvas.width;

    const startX =
      Math.floor(-currentView.pageX / currentView.scale / step) * step;
    const endX = startX + viewportWidth / currentView.scale + step;

    for (let x = startX; x <= endX; x += step) {
      const screenX = x * currentView.scale + currentView.pageX;
      const sceneX = Math.round(x);

      // 绘制刻度线
      if (this.config.showTicks) {
        ctx.beginPath();
        ctx.moveTo(screenX, 0);
        ctx.lineTo(screenX, this.config.rulerHeight);
        ctx.stroke();
      }

      // 绘制数字
      if (this.config.showNumbers) {
        ctx.fillText(`${sceneX}`, screenX, this.config.textOffset);
      }
    }
  }

  /**
   * 绘制垂直标尺
   */
  private drawVerticalRuler(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    step: number
  ): void {
    const currentView = coordinateSystemManager.getViewState();
    const viewportHeight = canvas.height;

    const startY =
      Math.floor(-currentView.pageY / currentView.scale / step) * step;
    const endY = startY + viewportHeight / currentView.scale + step;

    for (let y = startY; y <= endY; y += step) {
      const screenY = y * currentView.scale + currentView.pageY;
      const sceneY = Math.round(y);

      // 绘制刻度线
      if (this.config.showTicks) {
        ctx.beginPath();
        ctx.moveTo(0, screenY);
        ctx.lineTo(this.config.rulerHeight, screenY);
        ctx.stroke();
      }

      // 绘制数字
      if (this.config.showNumbers) {
        ctx.fillText(`${sceneY}`, this.config.textOffset, screenY);
      }
    }
  }

  /**
   * 绘制标尺
   */
  render(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    const currentView = coordinateSystemManager.getViewState();
    const step = this.calculateStep(currentView.scale);

    // 保存当前上下文状态
    ctx.save();

    // 设置标尺样式
    ctx.strokeStyle = this.config.strokeColor;
    ctx.fillStyle = this.config.textColor;
    ctx.font = this.config.font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 绘制水平和垂直标尺
    this.drawHorizontalRuler(ctx, canvas, step);
    this.drawVerticalRuler(ctx, canvas, step);

    // 恢复上下文状态
    ctx.restore();
  }

  /**
   * 切换标尺显示
   */
  toggle(visible: boolean): void {
    this.config.showTicks = visible;
    this.config.showNumbers = visible;
  }

  /**
   * 设置标尺主题
   */
  setTheme(theme: "light" | "dark"): void {
    switch (theme) {
      case "light":
        this.updateConfig({
          strokeColor: "#000",
          textColor: "#000",
        });
        break;
      case "dark":
        this.updateConfig({
          strokeColor: "#fff",
          textColor: "#fff",
        });
        break;
    }
  }
}

// 导出单例实例
export const rulerManager = new RulerManager();
