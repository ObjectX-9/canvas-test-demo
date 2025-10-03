import {
  EventHandler,
  EventResult,
  EventContext,
  BaseEvent,
  MouseEvent,
  KeyboardEvent,
  GestureEvent,
  TouchEvent,
  InteractionState,
} from "../types";
import { coordinateSystemManager } from "../../manage/CoordinateSystemManager";

/**
 * 画布缩放处理器
 * 支持鼠标滚轮缩放、触控板缩放、键盘快捷键缩放
 */
export class CanvasZoomHandler implements EventHandler {
  name = "canvas-zoom";
  priority = 100; // 优先级设置为中等

  // 缩放配置
  private readonly ZOOM_CONFIG = {
    // 最小缩放倍数
    MIN_SCALE: 0.1,
    // 最大缩放倍数
    MAX_SCALE: 10.0,
    // 触控板缩放因子（精密滚动）
    TOUCHPAD_ZOOM_FACTOR: 0.008,
    // 鼠标滚轮缩放因子（离散滚动）
    WHEEL_ZOOM_FACTOR: 0.15,
    // 键盘缩放步长
    KEYBOARD_ZOOM_STEP: 0.2,
  };

  // 键盘状态追踪
  private keyState = {
    metaKey: false,
    ctrlKey: false,
  };

  // 手势状态追踪
  private gestureState = {
    isGesturing: false,
    initialScale: 1,
    lastScale: 1,
  };

  // 触摸状态追踪
  private touchState = {
    isTouching: false,
    initialDistance: 0,
    lastDistance: 0,
    centerPoint: { x: 0, y: 0 },
  };

  // 最后的鼠标位置（用于键盘缩放时的中心点）
  private lastMousePosition: { x: number; y: number } | null = null;

  canHandle(event: BaseEvent, _state: InteractionState): boolean {
    // 处理滚轮事件（包括触控板缩放）
    if (event.type === "mouse.wheel") {
      return true;
    }

    // 处理鼠标移动事件（用于更新鼠标位置记录）
    if (event.type === "mouse.move") {
      return true;
    }

    // 处理手势事件（Safari触控板）
    if (
      event.type === "gesture.start" ||
      event.type === "gesture.change" ||
      event.type === "gesture.end"
    ) {
      return true;
    }

    // 处理触摸事件（多点触控缩放）
    if (
      event.type === "touch.start" ||
      event.type === "touch.move" ||
      event.type === "touch.end"
    ) {
      const touchEvent = event as TouchEvent;
      return touchEvent.touches.length >= 2;
    }

    // 处理键盘缩放快捷键
    if (event.type === "key.down" || event.type === "key.up") {
      return true; // 让键盘事件进入处理逻辑，在handleKeyDown中再做详细判断
    }

    return false;
  }

  async handle(event: BaseEvent, context: EventContext): Promise<EventResult> {
    switch (event.type) {
      case "mouse.wheel":
        return this.handleWheelZoom(event as MouseEvent, context);
      case "mouse.move":
        return this.handleMouseMove(event as MouseEvent, context);
      case "gesture.start":
      case "gesture.change":
      case "gesture.end":
        return this.handleGestureZoom(event as GestureEvent, context);
      case "touch.start":
      case "touch.move":
      case "touch.end":
        return this.handleTouchZoom(event as TouchEvent, context);
      case "key.down":
        return this.handleKeyDown(event as KeyboardEvent, context);
      case "key.up":
        return this.handleKeyUp(event as KeyboardEvent, context);
      default:
        return { handled: false };
    }
  }

  /**
   * 处理滚轮缩放事件
   */
  private handleWheelZoom(
    event: MouseEvent,
    _context: EventContext
  ): EventResult {
    // 更新最后的鼠标位置
    this.lastMousePosition = { ...event.mousePoint };

    const nativeEvent = event.nativeEvent as WheelEvent;

    if (!nativeEvent) {
      console.log("🔍 CanvasZoomHandler - 没有原生事件，跳过");
      return { handled: false };
    }

    // 检查是否是触控板缩放手势或键盘修饰键缩放
    const isTouchpadZoom = nativeEvent.ctrlKey; // Mac触控板双指滑动会自动设置ctrlKey
    const isModifierKeyZoom = this.keyState.metaKey || this.keyState.ctrlKey;

    // 只处理以下情况：
    // 1. 触控板缩放（ctrlKey自动设置）
    // 2. 手动按下修饰键的鼠标滚轮缩放
    if (!isTouchpadZoom && !isModifierKeyZoom) {
      console.log("🔍 CanvasZoomHandler - 无修饰键，跳过缩放");
      return { handled: false };
    }

    console.log("🔍 CanvasZoomHandler - 检测到缩放事件:", {
      isTouchpadZoom,
      isModifierKeyZoom,
      ctrlKey: nativeEvent.ctrlKey,
      deltaY: nativeEvent.deltaY,
      mousePoint: event.mousePoint,
      keyState: this.keyState,
    });

    // 阻止浏览器默认的缩放和滚动行为
    event.preventDefault();
    nativeEvent.preventDefault();

    // 阻止事件冒泡，防止浏览器处理
    if (nativeEvent.stopPropagation) {
      nativeEvent.stopPropagation();
    }

    // 计算缩放因子
    const delta = -nativeEvent.deltaY;

    // 区分触控板的精密滚动和鼠标滚轮的离散滚动
    let scaleFactor: number;

    if (isTouchpadZoom || Math.abs(nativeEvent.deltaY) < 50) {
      // 触控板精密滚动 - 使用专门的触控板缩放因子
      scaleFactor = 1 + delta * this.ZOOM_CONFIG.TOUCHPAD_ZOOM_FACTOR;
    } else {
      // 鼠标滚轮离散滚动 - 使用更快的缩放速率
      const zoomMultiplier = 1 + this.ZOOM_CONFIG.WHEEL_ZOOM_FACTOR;
      scaleFactor = delta > 0 ? zoomMultiplier : 1 / zoomMultiplier;
    }

    // 获取当前缩放比例
    const currentScale = coordinateSystemManager.getViewState().matrix
      ? Math.sqrt(
          coordinateSystemManager.getViewState().matrix[0] ** 2 +
            coordinateSystemManager.getViewState().matrix[1] ** 2
        )
      : 1;

    // 计算新的缩放比例
    const newScale = this.clampScale(currentScale * scaleFactor);

    // 如果缩放比例没有变化，则不处理
    if (Math.abs(newScale - currentScale) < 0.001) {
      return { handled: true, requestRender: false };
    }

    // 以鼠标位置为中心进行缩放
    coordinateSystemManager.updateViewScale(
      newScale,
      event.mousePoint.x,
      event.mousePoint.y
    );

    const zoomType = isTouchpadZoom ? "触控板" : "鼠标滚轮";
    console.log(
      `🔍 CanvasZoomHandler - ${zoomType}缩放: ${currentScale.toFixed(
        2
      )} → ${newScale.toFixed(2)}`,
      `中心点: (${event.mousePoint.x}, ${event.mousePoint.y})`,
      `deltaY: ${nativeEvent.deltaY}`
    );

    return {
      handled: true,
      requestRender: true,
      newState: "idle",
    };
  }

  /**
   * 处理鼠标移动事件（仅用于记录鼠标位置）
   */
  private handleMouseMove(
    event: MouseEvent,
    _context: EventContext
  ): EventResult {
    // 更新最后的鼠标位置
    this.lastMousePosition = { ...event.mousePoint };

    // 不处理这个事件，让其他处理器处理
    return { handled: false };
  }

  /**
   * 处理手势缩放事件（Safari触控板）
   */
  private handleGestureZoom(
    event: GestureEvent,
    _context: EventContext
  ): EventResult {
    event.preventDefault();

    switch (event.type) {
      case "gesture.start":
        this.gestureState.isGesturing = true;
        this.gestureState.initialScale = this.getCurrentScale();
        this.gestureState.lastScale = event.scale;
        break;

      case "gesture.change": {
        if (!this.gestureState.isGesturing) return { handled: false };

        const scaleDelta = event.scale / this.gestureState.lastScale;
        const currentScale = this.getCurrentScale();
        const newScale = this.clampScale(currentScale * scaleDelta);

        if (Math.abs(newScale - currentScale) > 0.001) {
          coordinateSystemManager.updateViewScale(
            newScale,
            event.centerPoint.x,
            event.centerPoint.y
          );
        }

        this.gestureState.lastScale = event.scale;
        break;
      }

      case "gesture.end":
        this.gestureState.isGesturing = false;
        this.gestureState.initialScale = 1;
        this.gestureState.lastScale = 1;
        break;
    }

    console.log(
      `📱 CanvasZoomHandler - 手势缩放: ${
        event.type
      }, 缩放比例: ${event.scale.toFixed(2)}`
    );

    return {
      handled: true,
      requestRender: event.type === "gesture.change",
      newState: "idle",
    };
  }

  /**
   * 处理触摸缩放事件（多点触控）
   */
  private handleTouchZoom(
    event: TouchEvent,
    _context: EventContext
  ): EventResult {
    event.preventDefault();

    if (event.touches.length < 2) {
      this.touchState.isTouching = false;
      return { handled: false };
    }

    const touch1 = event.touches[0];
    const touch2 = event.touches[1];

    // 计算两点间距离
    const distance = Math.sqrt(
      Math.pow(touch2.x - touch1.x, 2) + Math.pow(touch2.y - touch1.y, 2)
    );

    // 计算中心点
    const centerX = (touch1.x + touch2.x) / 2;
    const centerY = (touch1.y + touch2.y) / 2;

    switch (event.type) {
      case "touch.start":
        this.touchState.isTouching = true;
        this.touchState.initialDistance = distance;
        this.touchState.lastDistance = distance;
        this.touchState.centerPoint = { x: centerX, y: centerY };
        break;

      case "touch.move": {
        if (!this.touchState.isTouching || this.touchState.lastDistance === 0) {
          return { handled: false };
        }

        const scaleFactor = distance / this.touchState.lastDistance;
        const currentScale = this.getCurrentScale();
        const newScale = this.clampScale(currentScale * scaleFactor);

        if (Math.abs(newScale - currentScale) > 0.001) {
          coordinateSystemManager.updateViewScale(newScale, centerX, centerY);
        }

        this.touchState.lastDistance = distance;
        this.touchState.centerPoint = { x: centerX, y: centerY };
        break;
      }

      case "touch.end":
        this.touchState.isTouching = false;
        this.touchState.initialDistance = 0;
        this.touchState.lastDistance = 0;
        break;
    }

    console.log(
      `👆 CanvasZoomHandler - 触摸缩放: ${event.type}, 距离: ${distance.toFixed(
        0
      )}`
    );

    return {
      handled: true,
      requestRender: event.type === "touch.move",
      newState: "idle",
    };
  }

  /**
   * 处理按键按下事件
   */
  private handleKeyDown(
    event: KeyboardEvent,
    context: EventContext
  ): EventResult {
    // 更新修饰键状态
    this.updateModifierKeys(event, true);

    // 检查是否是缩放快捷键
    if (!this.isZoomShortcut(event)) {
      return { handled: false };
    }

    // 阻止浏览器默认的缩放行为
    event.preventDefault();
    const nativeEvent = event.nativeEvent;

    if (nativeEvent) {
      nativeEvent.preventDefault?.();
      nativeEvent.stopPropagation?.();
    }

    const currentScale = coordinateSystemManager.getViewState().matrix
      ? Math.sqrt(
          coordinateSystemManager.getViewState().matrix[0] ** 2 +
            coordinateSystemManager.getViewState().matrix[1] ** 2
        )
      : 1;

    let newScale: number;

    switch (event.key) {
      case "=":
      case "+":
        // 放大
        newScale = this.clampScale(
          currentScale + this.ZOOM_CONFIG.KEYBOARD_ZOOM_STEP
        );
        break;
      case "-":
        // 缩小
        newScale = this.clampScale(
          currentScale - this.ZOOM_CONFIG.KEYBOARD_ZOOM_STEP
        );
        break;
      case "0":
        // 重置为100%
        newScale = 1.0;
        break;
      default:
        return { handled: false };
    }

    // 如果缩放比例没有变化，则不处理
    if (Math.abs(newScale - currentScale) < 0.001) {
      return { handled: true, requestRender: false };
    }

    // 获取当前鼠标位置，如果没有则使用画布中心
    let centerX: number, centerY: number;

    // 尝试从事件系统获取最后的鼠标位置
    const lastMousePosition = this.getLastMousePosition(context);
    if (lastMousePosition) {
      centerX = lastMousePosition.x;
      centerY = lastMousePosition.y;
      console.log(
        `⌨️ CanvasZoomHandler - 使用最后鼠标位置: (${centerX}, ${centerY})`
      );
    } else {
      // 如果没有鼠标位置信息，则使用画布中心
      const canvas = context.canvas;
      centerX = canvas.width / 2;
      centerY = canvas.height / 2;
      console.log(
        `⌨️ CanvasZoomHandler - 使用画布中心: (${centerX}, ${centerY})`
      );
    }

    coordinateSystemManager.updateViewScale(newScale, centerX, centerY);

    console.log(
      `⌨️ CanvasZoomHandler - 键盘缩放: ${currentScale.toFixed(
        2
      )} → ${newScale.toFixed(2)}`
    );

    return {
      handled: true,
      requestRender: true,
      newState: "idle",
    };
  }

  /**
   * 处理按键释放事件
   */
  private handleKeyUp(
    event: KeyboardEvent,
    _context: EventContext
  ): EventResult {
    // 更新修饰键状态
    this.updateModifierKeys(event, false);
    return { handled: false };
  }

  /**
   * 更新修饰键状态
   */
  private updateModifierKeys(event: KeyboardEvent, isDown: boolean): void {
    const nativeEvent = event.nativeEvent;

    // 更新按键状态
    if (
      event.key === "Meta" ||
      event.code === "MetaLeft" ||
      event.code === "MetaRight"
    ) {
      this.keyState.metaKey = isDown;
    }

    if (
      event.key === "Control" ||
      event.code === "ControlLeft" ||
      event.code === "ControlRight"
    ) {
      this.keyState.ctrlKey = isDown;
    }

    // 同时也从原生事件中获取当前状态
    if (nativeEvent) {
      this.keyState.metaKey =
        this.keyState.metaKey || nativeEvent.metaKey || false;
      this.keyState.ctrlKey =
        this.keyState.ctrlKey || nativeEvent.ctrlKey || false;
    }

    console.log("⌨️ CanvasZoomHandler - 修饰键状态更新:", {
      key: event.key,
      isDown,
      keyState: this.keyState,
    });
  }

  /**
   * 检查是否是缩放快捷键
   */
  private isZoomShortcut(event: KeyboardEvent): boolean {
    return (
      (this.keyState.metaKey || this.keyState.ctrlKey) &&
      (event.key === "=" ||
        event.key === "+" ||
        event.key === "-" ||
        event.key === "0")
    );
  }

  /**
   * 限制缩放比例在合理范围内
   */
  private clampScale(scale: number): number {
    return Math.max(
      this.ZOOM_CONFIG.MIN_SCALE,
      Math.min(this.ZOOM_CONFIG.MAX_SCALE, scale)
    );
  }

  /**
   * 获取当前缩放比例
   */
  getCurrentScale(): number {
    const viewState = coordinateSystemManager.getViewState();
    if (!viewState.matrix) return 1;

    return Math.sqrt(viewState.matrix[0] ** 2 + viewState.matrix[1] ** 2);
  }

  /**
   * 设置缩放比例
   */
  setScale(scale: number, centerX?: number, centerY?: number): void {
    const clampedScale = this.clampScale(scale);
    coordinateSystemManager.updateViewScale(clampedScale, centerX, centerY);
  }

  /**
   * 重置缩放到100%
   */
  resetZoom(): void {
    this.setScale(1.0);
  }

  /**
   * 适应画布大小
   */
  fitToCanvas(_canvas: HTMLCanvasElement): void {
    // 这里可以根据具体需求实现适应画布的逻辑
    // 例如：计算内容边界，然后调整缩放和位置使内容完全可见
    this.resetZoom();
  }

  /**
   * 获取最后的鼠标位置
   */
  private getLastMousePosition(
    _context: EventContext
  ): { x: number; y: number } | null {
    // 如果有记录的鼠标位置，返回它
    if (this.lastMousePosition) {
      return this.lastMousePosition;
    }

    // 否则返回null，调用方会使用画布中心
    return null;
  }
}
