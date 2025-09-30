import Reconciler from "react-reconciler";
import { IRenderer, RenderNode } from "../interfaces/IRenderer";

/**
 * 比较属性是否发生变化（避免循环引用问题）
 */
function propsChanged(
  oldProps: Record<string, unknown>,
  newProps: Record<string, unknown>
): boolean {
  // 先检查引用是否相同
  if (oldProps === newProps) {
    return false;
  }

  // 检查基本属性的数量
  const oldKeys = Object.keys(oldProps);
  const newKeys = Object.keys(newProps);

  if (oldKeys.length !== newKeys.length) {
    return true;
  }

  // 逐一比较属性值（跳过React内部属性）
  for (const key of newKeys) {
    // 跳过React内部属性
    if (key.startsWith("_") || key === "children") {
      continue;
    }

    if (oldProps[key] !== newProps[key]) {
      return true;
    }
  }

  // 单独处理children属性
  const oldChildren = oldProps.children;
  const newChildren = newProps.children;

  if (oldChildren !== newChildren) {
    // 对于字符串children，直接比较
    if (typeof oldChildren === "string" && typeof newChildren === "string") {
      return oldChildren !== newChildren;
    }
    // 对于其他情况，假设发生了变化
    return true;
  }

  return false;
}

/**
 * 创建HostConfig，将React reconciler桥接到我们的渲染器抽象
 * 这样可以轻松支持多种渲染后端
 */
export function createHostConfig(renderer: IRenderer) {
  return {
    // 支持的功能
    supportsMutation: true,
    supportsPersistence: false,
    supportsHydration: false,
    isPrimaryRenderer: true,

    // 超时处理
    noTimeout: -1,
    scheduleTimeout: setTimeout,
    cancelTimeout: clearTimeout,

    // 创建实例
    createInstance(type: string, props: Record<string, unknown>): RenderNode {
      console.log("🎨 创建实例:", type, props);
      return renderer.createElement(type, props);
    },

    // 创建文本实例
    createTextInstance(text: string): RenderNode {
      console.log("📝 创建文本实例:", text);
      return renderer.createElement("text", { children: text });
    },

    // 添加子节点
    appendChild(parent: RenderNode, child: RenderNode): void {
      renderer.appendChild(parent, child);
    },

    // 添加初始子节点
    appendInitialChild(parent: RenderNode, child: RenderNode): void {
      renderer.appendChild(parent, child);
    },

    // 移除子节点
    removeChild(parent: RenderNode, child: RenderNode): void {
      renderer.removeChild(parent, child);
    },

    // 在指定位置插入
    insertBefore(
      parent: RenderNode,
      child: RenderNode,
      beforeChild: RenderNode
    ): void {
      renderer.insertBefore(parent, child, beforeChild);
    },

    // 完成初始子节点
    finalizeInitialChildren(): boolean {
      return false;
    },

    // 准备更新
    prepareUpdate(
      instance: RenderNode,
      type: string,
      oldProps: Record<string, unknown>,
      newProps: Record<string, unknown>
    ): boolean {
      // 避免JSON.stringify的循环引用问题，使用简单的属性比较
      return propsChanged(oldProps, newProps);
    },

    // 提交更新
    commitUpdate(
      instance: RenderNode,
      updatePayload: boolean,
      type: string,
      oldProps: Record<string, unknown>,
      newProps: Record<string, unknown>
    ): void {
      if (updatePayload) {
        renderer.updateElement(instance, oldProps, newProps);
      }
    },

    // 提交文本更新
    commitTextUpdate(
      textInstance: RenderNode,
      oldText: string,
      newText: string
    ): void {
      renderer.updateElement(
        textInstance,
        { children: oldText },
        { children: newText }
      );
    },

    // 容器操作
    appendChildToContainer(container: RenderNode, child: RenderNode): void {
      renderer.appendChild(container, child);
    },

    removeChildFromContainer(container: RenderNode, child: RenderNode): void {
      renderer.removeChild(container, child);
    },

    insertInContainerBefore(
      container: RenderNode,
      child: RenderNode,
      beforeChild: RenderNode
    ): void {
      renderer.insertBefore(container, child, beforeChild);
    },

    // 上下文
    getRootHostContext() {
      return {};
    },

    getChildHostContext(parentContext: Record<string, unknown>, type: string) {
      return parentContext;
    },

    // 公共实例
    getPublicInstance(instance: RenderNode) {
      return instance;
    },

    // 文本内容检查
    shouldSetTextContent(
      type: string,
      props: Record<string, unknown>
    ): boolean {
      return false; // 我们通过创建text实例来处理文本
    },

    // 当前事件优先级
    getCurrentEventPriority() {
      return 16;
    },

    // ========== 必需的生命周期方法 ==========

    /**
     * 准备提交前的操作
     */
    prepareForCommit(
      containerInfo: RenderNode
    ): Record<string, unknown> | null {
      return null;
    },

    /**
     * 重置提交后的状态
     */
    resetAfterCommit(containerInfo: RenderNode): void {
      // 触发重新渲染
      renderer.renderRoot(containerInfo);
    },

    /**
     * 清除容器内容
     */
    clearContainer(container: RenderNode): void {
      container.children = [];
    },

    // ========== 其他必需方法 ==========

    getInstanceFromNode() {
      return null;
    },
    beforeActiveInstanceBlur() {},
    afterActiveInstanceBlur() {},
    prepareScopeUpdate() {},
    getInstanceFromScope() {
      return null;
    },
    detachDeletedInstance() {},

    // 显示/隐藏
    hideInstance(instance: RenderNode): void {
      // 暂时通过属性标记隐藏
      (instance as RenderNode & { _hidden?: boolean })._hidden = true;
    },

    hideTextInstance(textInstance: RenderNode): void {
      (textInstance as RenderNode & { _hidden?: boolean })._hidden = true;
    },

    unhideInstance(instance: RenderNode, props: Record<string, unknown>): void {
      delete (instance as RenderNode & { _hidden?: boolean })._hidden;
    },

    unhideTextInstance(textInstance: RenderNode, text: string): void {
      delete (textInstance as RenderNode & { _hidden?: boolean })._hidden;
    },

    // Portal支持（暂不实现）
    preparePortalMount(containerInfo: RenderNode): void {
      // 暂不支持Portal
    },

    // 错误处理
    errorHydratingContainer(parentContainer: RenderNode): void {
      throw new Error("Hydration not supported");
    },
  };
}

/**
 * 创建React渲染器
 * @param renderer 底层渲染器实现
 */
export function createReactRenderer(renderer: IRenderer) {
  const hostConfig = createHostConfig(renderer);
  return Reconciler(hostConfig);
}
