/**
 * 多宿主渲染器统一接口
 * 支持Canvas2D、CanvasKit、WebGL等多种渲染后端
 */

import { IRenderNode, RenderNodeProps } from "./IRenderNode";

/**
 * 视图状态接口
 * 描述当前视图的变换状态
 */
export interface ViewState {
  /** 变换矩阵 [a, b, c, d, e, f] */
  transform: number[];
  /** 缩放比例 */
  scale: number;
  /** 平移偏移 */
  translation: { x: number; y: number };
  /** 视口大小 */
  viewport: { width: number; height: number };
}

/**
 * 渲染器初始化选项
 */
export interface RendererOptions {
  /** 是否启用高DPI支持 */
  enableHighDPI?: boolean;
  /** 背景颜色 */
  backgroundColor?: string;
  /** 是否启用透明背景 */
  transparent?: boolean;
  /** 抗锯齿设置 */
  antialias?: boolean;
  /** 自定义选项 */
  [key: string]: unknown;
}

/**
 * 渲染器事件接口
 */
export interface RendererEventHandlers {
  onReady?: () => void;
  onError?: (error: Error) => void;
  onResize?: (width: number, height: number) => void;
  onRender?: (frameTime: number) => void;
}

/**
 * 宿主渲染器抽象接口
 * 定义了跨宿主环境的统一渲染操作
 */
export interface IHostRenderer {
  /**
   * 渲染器类型标识
   */
  readonly type: "canvas2d" | "canvaskit" | "webgl" | "svg";

  /**
   * 渲染器名称
   */
  readonly name: string;

  /**
   * 是否已初始化
   */
  readonly isInitialized: boolean;

  /**
   * 初始化渲染器
   * @param container 渲染容器
   * @param options 初始化选项
   */
  initialize(
    container: HTMLElement,
    options?: RendererOptions
  ): Promise<void> | void;

  /**
   * 创建渲染节点实例
   * @param type 节点类型
   * @param props 节点属性
   * @returns 渲染节点实例
   */
  createElement(type: string, props: RenderNodeProps): IRenderNode;

  /**
   * 添加子节点
   * @param parent 父节点
   * @param child 子节点
   */
  appendChild(parent: IRenderNode, child: IRenderNode): void;

  /**
   * 移除子节点
   * @param parent 父节点
   * @param child 子节点
   */
  removeChild(parent: IRenderNode, child: IRenderNode): void;

  /**
   * 在指定位置插入子节点
   * @param parent 父节点
   * @param child 子节点
   * @param beforeChild 插入位置的参考节点
   */
  insertBefore(
    parent: IRenderNode,
    child: IRenderNode,
    beforeChild: IRenderNode
  ): void;

  /**
   * 更新节点属性
   * @param node 要更新的节点
   * @param oldProps 旧属性
   * @param newProps 新属性
   */
  updateElement(
    node: IRenderNode,
    oldProps: RenderNodeProps,
    newProps: RenderNodeProps
  ): void;

  /**
   * 渲染根节点到宿主环境
   * @param root 根节点
   * @param viewState 视图状态
   */
  render(root: IRenderNode, viewState?: ViewState): void;

  /**
   * 清空画布/容器
   */
  clear(): void;

  /**
   * 销毁渲染器
   */
  destroy(): void;

  /**
   * 获取容器尺寸
   */
  getSize(): { width: number; height: number };

  /**
   * 设置容器尺寸
   */
  setSize(width: number, height: number): void;

  /**
   * 设置视图状态
   */
  setViewState(viewState: ViewState): void;

  /**
   * 获取当前视图状态
   */
  getViewState(): ViewState;

  /**
   * 设置事件处理器
   */
  setEventHandlers(handlers: RendererEventHandlers): void;

  /**
   * 坐标转换：屏幕坐标转世界坐标
   */
  screenToWorld(screenX: number, screenY: number): { x: number; y: number };

  /**
   * 坐标转换：世界坐标转屏幕坐标
   */
  worldToScreen(worldX: number, worldY: number): { x: number; y: number };

  /**
   * 命中测试
   * @param x 屏幕X坐标
   * @param y 屏幕Y坐标
   * @param root 根节点
   */
  hitTest(x: number, y: number, root: IRenderNode): IRenderNode | null;
}

/**
 * 渲染器工厂接口
 */
export interface IRendererFactory {
  /**
   * 创建指定类型的渲染器
   * @param type 渲染器类型
   * @param container 容器元素
   * @param options 选项
   */
  createRenderer(
    type: IHostRenderer["type"],
    container: HTMLElement,
    options?: RendererOptions
  ): Promise<IHostRenderer> | IHostRenderer;

  /**
   * 获取支持的渲染器类型
   */
  getSupportedTypes(): IHostRenderer["type"][];

  /**
   * 检查是否支持指定类型
   */
  supports(type: IHostRenderer["type"]): boolean;

  /**
   * 注册新的渲染器类型
   */
  register(
    type: IHostRenderer["type"],
    factory: (
      container: HTMLElement,
      options?: RendererOptions
    ) => IHostRenderer
  ): void;
}
