import { CanvasElement } from "../canvasElement/Element/CanvasBaseElement";
import {
  createCanvasElement,
  CanvasElementType,
  CanvasElementProps,
} from "./CanvasElementFactory";

/**
 * 简化的SkiaLike HostConfig
 */
export function createSkiaLikeHostConfig(renderer: {
  getCanvas(): HTMLCanvasElement;
  requestRender(): void;
}) {
  const canvas = renderer.getCanvas();

  return {
    supportsMutation: true,
    supportsPersistence: false,
    supportsHydration: false,
    isPrimaryRenderer: true,

    noTimeout: -1,
    scheduleTimeout: setTimeout,
    cancelTimeout: clearTimeout,

    // 创建实例
    createInstance(type: string, props: CanvasElementProps): CanvasElement {
      const canvasType = type as CanvasElementType;
      return createCanvasElement(canvasType, canvas, props);
    },

    // 创建文本实例
    createTextInstance(text: string): CanvasElement {
      return createCanvasElement("canvas-page", canvas, {
        children: text,
      });
    },

    // 添加子节点
    appendChild(parent: CanvasElement, child: CanvasElement): void {
      parent.appendChild(child);
    },

    appendInitialChild(parent: CanvasElement, child: CanvasElement): void {
      parent.appendChild(child);
    },

    // 移除子节点
    removeChild(parent: CanvasElement, child: CanvasElement): void {
      parent.removeChild(child);
    },

    insertBefore(
      parent: CanvasElement,
      child: CanvasElement,
      _beforeChild: CanvasElement
    ): void {
      parent.removeChild(child);
      parent.appendChild(child);
    },

    finalizeInitialChildren(): boolean {
      return false;
    },

    // 更新
    prepareUpdate(
      _instance: CanvasElement,
      _type: string,
      oldProps: CanvasElementProps,
      newProps: CanvasElementProps
    ): boolean {
      return JSON.stringify(oldProps) !== JSON.stringify(newProps);
    },

    commitUpdate(
      instance: CanvasElement,
      updatePayload: boolean,
      _type: string,
      _oldProps: CanvasElementProps,
      newProps: CanvasElementProps
    ): void {
      if (updatePayload) {
        instance.updateProps(newProps);
      }
    },

    commitTextUpdate(
      textInstance: CanvasElement,
      _oldText: string,
      newText: string
    ): void {
      textInstance.updateProps({ children: newText });
    },

    // 容器操作
    appendChildToContainer(
      container: CanvasElement,
      child: CanvasElement
    ): void {
      container.appendChild(child);
    },

    removeChildFromContainer(
      container: CanvasElement,
      child: CanvasElement
    ): void {
      container.removeChild(child);
    },

    insertInContainerBefore(
      container: CanvasElement,
      child: CanvasElement,
      _beforeChild: CanvasElement
    ): void {
      container.removeChild(child);
      container.appendChild(child);
    },

    // 上下文
    getRootHostContext(): Record<string, unknown> {
      return {};
    },

    getChildHostContext(
      parentContext: Record<string, unknown>,
      _type: string
    ): Record<string, unknown> {
      return parentContext;
    },

    getPublicInstance(instance: CanvasElement): CanvasElement {
      return instance;
    },

    shouldSetTextContent(): boolean {
      return false;
    },

    getCurrentEventPriority(): number {
      return 16;
    },

    // 渲染生命周期
    prepareForCommit(): null {
      return null;
    },

    resetAfterCommit(_containerInfo: CanvasElement): void {
      // 提交后触发渲染
      renderer.requestRender();
    },

    clearContainer(container: CanvasElement): void {
      container.children.forEach((child) => child.destroy());
      container.children = [];
    },

    // 其他必需方法
    getInstanceFromNode(): null {
      return null;
    },
    beforeActiveInstanceBlur(): void {},
    afterActiveInstanceBlur(): void {},
    prepareScopeUpdate(): void {},
    getInstanceFromScope(): null {
      return null;
    },
    detachDeletedInstance(): void {},
    hideInstance(): void {},
    hideTextInstance(): void {},
    unhideInstance(): void {},
    unhideTextInstance(): void {},
    preparePortalMount(): void {},
    errorHydratingContainer(): void {
      throw new Error("Hydration not supported");
    },
  };
}
