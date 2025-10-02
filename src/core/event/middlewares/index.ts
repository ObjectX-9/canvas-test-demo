import {
  EventMiddleware,
  BaseEvent,
  EventContext,
  EventResult,
  KeyboardEvent,
} from "../types";
import { toolStore } from "../../store/ToolStore";

/**
 * 键盘快捷键中间件
 * 拦截键盘事件处理快捷键
 */
export class KeyboardShortcutMiddleware implements EventMiddleware {
  name = "keyboard-shortcuts";

  async process(
    event: BaseEvent,
    context: EventContext,
    next: () => Promise<EventResult>
  ): Promise<EventResult> {
    if (event.type === "key.down") {
      const keyEvent = event as KeyboardEvent;
      const result = this.handleKeyboardShortcuts(keyEvent, context);

      if (result.handled) {
        return result;
      }
    }

    return next();
  }

  private handleKeyboardShortcuts(
    event: KeyboardEvent,
    context: EventContext
  ): EventResult {
    const { key, metaKey, ctrlKey, shiftKey } = event;
    const cmdOrCtrl = metaKey || ctrlKey;

    // 工具切换快捷键
    if (!cmdOrCtrl && !shiftKey) {
      switch (key) {
        case "v":
        case "V":
          toolStore.setCurrentTool("select");
          context.cursor.reset();
          return { handled: true, requestRender: false };

        case "r":
        case "R":
          toolStore.setCurrentTool("rectangle");
          context.cursor.set("crosshair");
          return { handled: true, requestRender: false };

        case "p":
        case "P":
          toolStore.setCurrentTool("pencil");
          context.cursor.set("crosshair");
          return { handled: true, requestRender: false };
      }
    }

    // 编辑快捷键
    if (cmdOrCtrl) {
      switch (key) {
        case "a":
        case "A":
          // 全选
          event.preventDefault();
          // TODO: 实现全选逻辑
          return { handled: true, requestRender: true };

        case "c":
        case "C":
          // 复制
          event.preventDefault();
          // TODO: 实现复制逻辑
          return { handled: true, requestRender: false };

        case "v":
        case "V":
          // 粘贴
          event.preventDefault();
          // TODO: 实现粘贴逻辑
          return { handled: true, requestRender: true };

        case "z":
        case "Z":
          // 撤销/重做
          event.preventDefault();
          if (shiftKey) {
            // 重做
            // TODO: 实现重做逻辑
          } else {
            // 撤销
            // TODO: 实现撤销逻辑
          }
          return { handled: true, requestRender: true };
      }
    }

    // Delete键
    if (key === "Delete" || key === "Backspace") {
      const selectedNodes = context.selection.getSelected();
      if (selectedNodes.length > 0) {
        selectedNodes.forEach((nodeId) => {
          context.nodes.delete(nodeId);
        });
        context.selection.clear();
        return { handled: true, requestRender: true };
      }
    }

    // Escape键
    if (key === "Escape") {
      context.selection.clear();
      toolStore.setCurrentTool("select");
      context.cursor.reset();
      return { handled: true, requestRender: true };
    }

    return { handled: false };
  }
}

/**
 * 性能优化中间件
 * 控制渲染频率，避免过度渲染
 */
export class PerformanceMiddleware implements EventMiddleware {
  name = "performance";

  private lastRenderTime = 0;
  private renderThrottle = 16; // 60fps
  private pendingRender = false;

  async process(
    event: BaseEvent,
    context: EventContext,
    next: () => Promise<EventResult>
  ): Promise<EventResult> {
    const result = await next();

    if (result.requestRender) {
      // 节流渲染请求
      this.throttleRender(() => {
        context.canvas.dispatchEvent(new CustomEvent("render:request"));
      });

      // 阻止直接的渲染请求
      return {
        ...result,
        requestRender: false,
      };
    }

    return result;
  }

  private throttleRender(callback: () => void): void {
    const now = Date.now();

    if (now - this.lastRenderTime >= this.renderThrottle) {
      this.lastRenderTime = now;
      callback();
    } else if (!this.pendingRender) {
      this.pendingRender = true;

      setTimeout(() => {
        this.lastRenderTime = Date.now();
        this.pendingRender = false;
        callback();
      }, this.renderThrottle - (now - this.lastRenderTime));
    }
  }
}

/**
 * 调试中间件
 * 记录事件处理的详细信息
 */
export class DebugMiddleware implements EventMiddleware {
  name = "debug";

  private isEnabled = import.meta.env.DEV;

  async process(
    event: BaseEvent,
    context: EventContext,
    next: () => Promise<EventResult>
  ): Promise<EventResult> {
    if (!this.isEnabled) {
      return next();
    }

    const startTime = performance.now();

    console.group(`🎯 处理事件: ${event.type}`);
    console.log("事件数据:", event);
    console.log("当前工具:", toolStore.getCurrentTool());
    console.log("交互状态:", context.interactionState);

    try {
      const result = await next();
      const endTime = performance.now();

      console.log("处理结果:", result);
      console.log(`处理时间: ${(endTime - startTime).toFixed(2)}ms`);

      return result;
    } catch (error) {
      console.error("事件处理错误:", error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }
}

/**
 * 状态验证中间件
 * 确保事件处理后的状态一致性
 */
export class StateValidationMiddleware implements EventMiddleware {
  name = "state-validation";

  async process(
    event: BaseEvent,
    context: EventContext,
    next: () => Promise<EventResult>
  ): Promise<EventResult> {
    // 记录处理前的状态
    const beforeState = {
      interactionState: context.interactionState,
      selectedNodes: context.selection.getSelected(),
      currentTool: toolStore.getCurrentTool(),
    };

    const result = await next();

    // 验证状态变化的合理性
    if (result.newState) {
      this.validateStateTransition(
        beforeState.interactionState,
        result.newState,
        event
      );
    }

    return result;
  }

  private validateStateTransition(
    from: string,
    to: string,
    event: BaseEvent
  ): void {
    // 定义合法的状态转换
    const validTransitions: Record<string, string[]> = {
      idle: ["selecting", "creating", "drawing", "hover"],
      hover: ["idle", "selecting", "creating", "drawing"],
      selecting: ["idle", "dragging", "resizing"],
      dragging: ["idle", "selecting"],
      creating: ["idle"],
      drawing: ["idle"],
      resizing: ["idle", "selecting"],
    };

    const allowedStates = validTransitions[from] || [];

    if (!allowedStates.includes(to)) {
      console.warn(
        `⚠️ 可能的无效状态转换: ${from} -> ${to} (事件: ${event.type})`
      );
    }
  }
}
