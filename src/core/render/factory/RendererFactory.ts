import { IRenderer, IRendererFactory } from "../interfaces/IRenderer";
import { Canvas2DRenderer } from "../renderers/Canvas2DRenderer";

/**
 * 渲染器工厂实现
 * 支持创建多种类型的渲染器
 */
export class RendererFactory implements IRendererFactory {
  private static instance: RendererFactory;
  private rendererFactories = new Map<
    string,
    (canvas: HTMLCanvasElement, options?: Record<string, unknown>) => IRenderer
  >();

  constructor() {
    // 注册内置渲染器
    this.registerBuiltinRenderers();
  }

  static getInstance(): RendererFactory {
    if (!RendererFactory.instance) {
      RendererFactory.instance = new RendererFactory();
    }
    return RendererFactory.instance;
  }

  /**
   * 注册内置渲染器
   */
  private registerBuiltinRenderers(): void {
    // 注册Canvas2D渲染器
    this.rendererFactories.set(
      "canvas2d",
      (canvas: HTMLCanvasElement, options?: Record<string, unknown>) => {
        return new Canvas2DRenderer(canvas);
      }
    );

    // 未来可以在这里添加更多渲染器：
    // this.rendererFactories.set('webgl', (canvas, options) => new WebGLRenderer(canvas, options));
    // this.rendererFactories.set('canvaskit', (canvas, options) => new CanvasKitRenderer(canvas, options));
    // this.rendererFactories.set('svg', (canvas, options) => new SVGRenderer(canvas, options));
  }

  createRenderer(
    type: string,
    canvas: HTMLCanvasElement,
    options?: Record<string, unknown>
  ): IRenderer {
    const factory = this.rendererFactories.get(type);
    if (!factory) {
      throw new Error(
        `不支持的渲染器类型: ${type}. 支持的类型: ${this.getSupportedTypes().join(
          ", "
        )}`
      );
    }

    try {
      const renderer = factory(canvas, options);
      console.log(`✅ 创建${type}渲染器成功`);
      return renderer;
    } catch (error) {
      console.error(`❌ 创建${type}渲染器失败:`, error);
      throw error;
    }
  }

  getSupportedTypes(): string[] {
    return Array.from(this.rendererFactories.keys());
  }

  supports(type: string): boolean {
    return this.rendererFactories.has(type);
  }

  /**
   * 注册自定义渲染器
   */
  register(
    type: string,
    factory: (
      canvas: HTMLCanvasElement,
      options?: Record<string, unknown>
    ) => IRenderer
  ): void {
    if (this.rendererFactories.has(type)) {
      console.warn(`渲染器类型 ${type} 已存在，将被覆盖`);
    }

    this.rendererFactories.set(type, factory);
    console.log(`✅ 注册自定义渲染器: ${type}`);
  }

  /**
   * 取消注册渲染器
   */
  unregister(type: string): boolean {
    return this.rendererFactories.delete(type);
  }

  /**
   * 清空所有渲染器
   */
  clear(): void {
    this.rendererFactories.clear();
    this.registerBuiltinRenderers();
  }
}

// 导出单例实例
export const rendererFactory = RendererFactory.getInstance();
