/**
 * 新的事件系统核心类型定义
 * 基于Figma的设计思路，与渲染层完全解耦
 */

// 基础事件类型
export interface BaseEvent {
  type: string;
  timestamp: number;
  preventDefault: () => void;
  stopPropagation: () => void;
  canceled: boolean;
  propagationStopped: boolean;
}

// 鼠标事件
export interface MouseEvent extends BaseEvent {
  type: "mouse.down" | "mouse.move" | "mouse.up" | "mouse.wheel";
  point: { x: number; y: number };
  canvasPoint: { x: number; y: number };
  button: number;
  buttons: number;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}

// 键盘事件
export interface KeyboardEvent extends BaseEvent {
  type: "key.down" | "key.up";
  key: string;
  code: string;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}

// 交互状态
export type InteractionState =
  | "idle"
  | "hover"
  | "selecting"
  | "dragging"
  | "creating"
  | "drawing"
  | "resizing";

// 事件处理器接口
export interface EventHandler {
  name: string;
  priority: number;
  canHandle(event: BaseEvent, state: InteractionState): boolean;
  handle(
    event: BaseEvent,
    context: EventContext
  ): Promise<EventResult> | EventResult;
}

// 事件处理结果
export interface EventResult {
  handled: boolean;
  newState?: InteractionState;
  requestRender?: boolean;
  data?: Record<string, unknown>;
}

// 事件上下文
export interface EventContext {
  canvas: HTMLCanvasElement;
  interactionState: InteractionState;
  currentTool: string;
  hitTest: (point: { x: number; y: number }) => HitTestResult | null;
  transform: {
    screenToCanvas: (point: { x: number; y: number }) => {
      x: number;
      y: number;
    };
    canvasToScreen: (point: { x: number; y: number }) => {
      x: number;
      y: number;
    };
  };
  selection: {
    getSelected: () => string[];
    select: (ids: string[]) => void;
    clear: () => void;
  };
  nodes: {
    create: (type: string, data: Record<string, unknown>) => string;
    update: (id: string, data: Record<string, unknown>) => void;
    delete: (id: string) => void;
    get: (id: string) => Record<string, unknown> | null;
  };
  cursor: {
    set: (cursor: string) => void;
    reset: () => void;
  };
}

// 碰撞检测结果
export interface HitTestResult {
  nodeId: string;
  type: "node" | "handle" | "edge";
  distance: number;
  point: { x: number; y: number };
}

// 中间件接口
export interface EventMiddleware {
  name: string;
  process(
    event: BaseEvent,
    context: EventContext,
    next: () => Promise<EventResult>
  ): Promise<EventResult>;
}

export default {};
