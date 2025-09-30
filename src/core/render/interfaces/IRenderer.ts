/**
 * 渲染器统一接口
 * 为Canvas2D、CanvasKit、WebGL等提供统一的抽象层
 */

/**
 * 渲染节点 - 虚拟节点结构
 */
export interface RenderNode {
  type: string;
  props: Record<string, unknown>;
  children: RenderNode[];
}

/**
 * 视图状态
 */
export interface ViewState {
  /** 变换矩阵 */
  transform?: number[];
  /** 缩放比例 */
  scale?: number;
  /** 平移偏移 */
  translation?: { x: number; y: number };
  /** 视口大小 */
  viewport?: { width: number; height: number };
}

/**
 * 渲染器统一接口
 * 所有具体的渲染器（Canvas2D、WebGL等）都需要实现这个接口
 */
export interface IRenderer {
  /** 渲染器类型标识 */
  readonly type: string;

  /**
   * 创建元素
   * @param type 元素类型
   * @param props 元素属性
   */
  createElement(type: string, props: Record<string, unknown>): RenderNode;

  /**
   * 添加子节点
   * @param parent 父节点
   * @param child 子节点
   */
  appendChild(parent: RenderNode, child: RenderNode): void;

  /**
   * 移除子节点
   * @param parent 父节点
   * @param child 子节点
   */
  removeChild(parent: RenderNode, child: RenderNode): void;

  /**
   * 在指定位置插入子节点
   * @param parent 父节点
   * @param child 子节点
   * @param beforeChild 插入位置的参考节点
   */
  insertBefore(
    parent: RenderNode,
    child: RenderNode,
    beforeChild: RenderNode
  ): void;

  /**
   * 更新元素属性
   * @param instance 节点实例
   * @param oldProps 旧属性
   * @param newProps 新属性
   */
  updateElement(
    instance: RenderNode,
    oldProps: Record<string, unknown>,
    newProps: Record<string, unknown>
  ): void;

  /**
   * 渲染根节点
   * @param root 根节点
   * @param viewState 视图状态（可选）
   */
  renderRoot(root: RenderNode, viewState?: ViewState): void;

  /**
   * 清空画布
   */
  clear(): void;

  /**
   * 获取画布尺寸
   */
  getSize(): { width: number; height: number };
}

/**
 * React渲染器接口
 * 封装react-reconciler的复杂性，提供简单的React渲染接口
 */
export interface IReactRenderer {
  /**
   * 渲染React元素到容器
   * @param element React元素
   * @param container 容器（可选，默认使用内部根容器）
   * @param callback 渲染完成回调（可选）
   */
  render(
    element: React.ReactElement,
    container?: RenderNode,
    callback?: () => void
  ): void;

  /**
   * 卸载
   */
  unmount(): void;

  /**
   * 获取根容器
   */
  getRootContainer(): RenderNode;
}

/**
 * 渲染器工厂接口
 */
export interface IRendererFactory {
  /**
   * 创建指定类型的渲染器
   * @param type 渲染器类型
   * @param canvas Canvas元素或其他渲染目标
   * @param options 选项
   */
  createRenderer(
    type: string,
    canvas: HTMLCanvasElement,
    options?: Record<string, unknown>
  ): IRenderer;

  /**
   * 获取支持的渲染器类型
   */
  getSupportedTypes(): string[];

  /**
   * 检查是否支持指定类型
   */
  supports(type: string): boolean;
}
