import { EventSystem } from "./EventSystem";
import {
  SelectionHandler,
  RectangleCreationHandler,
  PencilHandler,
} from "./handlers/ToolHandlers";
import {
  KeyboardShortcutMiddleware,
  PerformanceMiddleware,
  DebugMiddleware,
  StateValidationMiddleware,
} from "./middlewares";
import { EventContext } from "./types";
import { coordinateSystemManager } from "../manage";
import { selectionStore } from "../store/SelectionStore";

/**
 * 事件系统初始化器
 * 负责设置和配置整个事件系统
 */
export class EventSystemInitializer {
  private eventSystem: EventSystem;
  private isInitialized = false;

  constructor() {
    this.eventSystem = EventSystem.getInstance();
  }

  /**
   * 初始化事件系统
   */
  initialize(canvas: HTMLCanvasElement): void {
    if (this.isInitialized) {
      console.log("⚠️ 事件系统已初始化，跳过重复初始化");
      return;
    }

    console.log("🚀 开始初始化新事件系统V2");

    // 注册中间件（按执行顺序）
    this.registerMiddlewares();

    // 注册事件处理器
    this.registerHandlers();

    // 构建事件上下文
    const context = this.buildEventContext(canvas);

    // 初始化事件系统
    this.eventSystem.initialize(context);

    this.isInitialized = true;
    console.log("✅ 新事件系统V2初始化完成");
  }

  /**
   * 注册中间件
   */
  private registerMiddlewares(): void {
    console.log("🔌 注册事件中间件...");

    // 中间件执行顺序很重要
    this.eventSystem.registerMiddleware(new DebugMiddleware());
    this.eventSystem.registerMiddleware(new StateValidationMiddleware());
    this.eventSystem.registerMiddleware(new KeyboardShortcutMiddleware());
    this.eventSystem.registerMiddleware(new PerformanceMiddleware());
  }

  /**
   * 注册事件处理器
   */
  private registerHandlers(): void {
    console.log("🎯 注册事件处理器...");

    // 按优先级注册处理器
    this.eventSystem.registerHandler(new SelectionHandler());
    this.eventSystem.registerHandler(new RectangleCreationHandler());
    this.eventSystem.registerHandler(new PencilHandler());
  }

  /**
   * 构建事件上下文
   */
  private buildEventContext(canvas: HTMLCanvasElement): EventContext {
    console.log("🔧 构建事件上下文...");

    return {
      canvas,
      interactionState: "idle",
      currentTool: "select",

      // 碰撞检测
      hitTest: (point: { x: number; y: number }) => {
        // TODO: 实现真正的碰撞检测
        // 这里应该调用渲染系统提供的碰撞检测API
        return null;
      },

      // 坐标转换
      transform: {
        screenToCanvas: (point: { x: number; y: number }) => {
          const viewState = coordinateSystemManager.getViewState();
          // TODO: 使用正确的矩阵变换逻辑
          // 目前简化处理，后续需要根据实际的ViewInfo结构进行矩阵计算
          return {
            x: point.x,
            y: point.y,
          };
        },
        canvasToScreen: (point: { x: number; y: number }) => {
          const viewState = coordinateSystemManager.getViewState();
          // TODO: 使用正确的矩阵变换逻辑
          // 目前简化处理，后续需要根据实际的ViewInfo结构进行矩阵计算
          return {
            x: point.x,
            y: point.y,
          };
        },
      },

      // 选择管理
      selection: {
        getSelected: () => selectionStore.getSelectedNodeIds(),
        select: (ids: string[]) => {
          if (ids.length === 0) {
            selectionStore.clearSelection();
          } else if (ids.length === 1) {
            selectionStore.selectNode(ids[0]);
          } else {
            selectionStore.clearSelection();
            ids.forEach((id) => selectionStore.addToSelection(id));
          }
        },
        clear: () => selectionStore.clearSelection(),
      },

      // 节点管理
      nodes: {
        create: (type: string, data: Record<string, unknown>) => {
          // TODO: 调用节点创建API
          const nodeId = `${type}_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2)}`;
          console.log(`创建节点: ${nodeId}`, { type, data });
          return nodeId;
        },
        update: (id: string, data: Record<string, unknown>) => {
          // TODO: 调用节点更新API
          console.log(`更新节点: ${id}`, data);
        },
        delete: (id: string) => {
          // TODO: 调用节点删除API
          console.log(`删除节点: ${id}`);
        },
        get: (id: string) => {
          // TODO: 调用节点获取API
          console.log(`获取节点: ${id}`);
          return null;
        },
      },

      // 光标管理
      cursor: {
        set: (cursor: string) => {
          canvas.style.cursor = cursor;
        },
        reset: () => {
          canvas.style.cursor = "default";
        },
      },
    };
  }

  /**
   * 获取事件系统实例
   */
  getEventSystem(): EventSystem {
    return this.eventSystem;
  }

  /**
   * 销毁事件系统
   */
  destroy(): void {
    console.log("💥 销毁事件系统V2");
    this.eventSystem.destroy();
    this.isInitialized = false;
  }
}
