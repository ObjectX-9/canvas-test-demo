/**
 * 渲染节点接口定义
 * 描述了渲染树中节点的基本结构
 */

/**
 * 渲染节点属性类型
 */
export interface RenderNodeProps {
  // 基础属性
  id?: string;
  key?: string | number;

  // 几何属性
  x?: number;
  y?: number;
  width?: number;
  height?: number;

  // 样式属性
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;

  // 变换属性
  transform?: string;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;

  // 事件属性
  onClick?: (event: Event) => void;
  onMouseDown?: (event: MouseEvent) => void;
  onMouseUp?: (event: MouseEvent) => void;
  onMouseMove?: (event: MouseEvent) => void;

  // 其他自定义属性
  [key: string]: unknown;
}

/**
 * 渲染节点实例接口
 */
export interface IRenderNode {
  /** 节点类型 */
  readonly type: string;

  /** 节点属性 */
  props: RenderNodeProps;

  /** 子节点列表 */
  children: IRenderNode[];

  /** 父节点引用 */
  parent?: IRenderNode | null;

  /** 节点唯一标识 */
  id: string;

  /** 是否可见 */
  visible: boolean;

  /** 内部渲染数据（由具体渲染器使用） */
  _renderData?: unknown;
}

/**
 * 创建渲染节点的工厂函数
 */
export function createRenderNode(
  type: string,
  props: RenderNodeProps = {},
  children: IRenderNode[] = []
): IRenderNode {
  return {
    type,
    props: { ...props },
    children: [...children],
    parent: null,
    id: props.id || `node_${Math.random().toString(36).substr(2, 9)}`,
    visible: true,
    _renderData: undefined,
  };
}

/**
 * 节点树操作工具函数
 */
export class RenderNodeUtils {
  /**
   * 添加子节点
   */
  static appendChild(parent: IRenderNode, child: IRenderNode): void {
    if (child.parent) {
      RenderNodeUtils.removeChild(child.parent, child);
    }

    parent.children.push(child);
    child.parent = parent;
  }

  /**
   * 移除子节点
   */
  static removeChild(parent: IRenderNode, child: IRenderNode): boolean {
    const index = parent.children.indexOf(child);
    if (index === -1) return false;

    parent.children.splice(index, 1);
    child.parent = null;
    return true;
  }

  /**
   * 在指定位置插入子节点
   */
  static insertBefore(
    parent: IRenderNode,
    child: IRenderNode,
    beforeChild: IRenderNode
  ): boolean {
    const index = parent.children.indexOf(beforeChild);
    if (index === -1) return false;

    if (child.parent) {
      RenderNodeUtils.removeChild(child.parent, child);
    }

    parent.children.splice(index, 0, child);
    child.parent = parent;
    return true;
  }

  /**
   * 深度优先遍历节点树
   */
  static traverse(
    node: IRenderNode,
    callback: (node: IRenderNode) => void | boolean
  ): void {
    const result = callback(node);
    if (result === false) return; // 停止遍历

    for (const child of node.children) {
      RenderNodeUtils.traverse(child, callback);
    }
  }

  /**
   * 查找节点
   */
  static findNode(
    root: IRenderNode,
    predicate: (node: IRenderNode) => boolean
  ): IRenderNode | null {
    let found: IRenderNode | null = null;

    RenderNodeUtils.traverse(root, (node) => {
      if (predicate(node)) {
        found = node;
        return false; // 停止遍历
      }
    });

    return found;
  }

  /**
   * 通过ID查找节点
   */
  static findNodeById(root: IRenderNode, id: string): IRenderNode | null {
    return RenderNodeUtils.findNode(root, (node) => node.id === id);
  }
}
