/**
 * 新的事件系统核心类型定义
 * 基于Figma的设计思路，与渲染层完全解耦
 */

// 基础事件类型
export interface BaseEvent {
  // 事件类型
  type: string;
  // 时间戳
  timestamp: number;
  // 阻止默认行为
  preventDefault: () => void;
  // 阻止事件冒泡
  stopPropagation: () => void;
  // 是否取消
  canceled: boolean;
  // 是否停止冒泡
  propagationStopped: boolean;
  // 原生DOM事件引用
  nativeEvent?: Event;
}

// 鼠标事件
export interface MouseEvent extends BaseEvent {
  // 事件类型
  type: "mouse.down" | "mouse.move" | "mouse.up" | "mouse.wheel";
  // 鼠标位置
  mousePoint: { x: number; y: number };
  // 原生事件引用 (继承自BaseEvent，这里可以更具体化类型)
  nativeEvent?: globalThis.MouseEvent | WheelEvent;
}

// 手势事件（Safari触控板缩放）
export interface GestureEvent extends BaseEvent {
  type: "gesture.start" | "gesture.change" | "gesture.end";
  // 缩放比例
  scale: number;
  // 中心点
  centerPoint: { x: number; y: number };
  // 原生事件引用 (继承自BaseEvent，这里可以更具体化类型)
  nativeEvent?: Event;
}

// 触摸事件（多点触控）
export interface TouchEvent extends BaseEvent {
  type: "touch.start" | "touch.move" | "touch.end";
  // 触摸点
  touches: Array<{ x: number; y: number; identifier: number }>;
  // 原生事件引用 (继承自BaseEvent，这里可以更具体化类型)
  nativeEvent?: globalThis.TouchEvent;
}

// 键盘事件
export interface KeyboardEvent extends BaseEvent {
  type: "key.down" | "key.up";
  // 按键
  key: string;
  // 按键代码
  code: string;
  // 原生事件引用 (继承自BaseEvent，这里可以更具体化类型)
  nativeEvent?: globalThis.KeyboardEvent;
}

// 交互状态
export type InteractionState =
  // 空闲状态
  | "idle"
  // 悬停状态
  | "hover"
  // 选择状态
  | "selecting"
  // 拖拽状态
  | "dragging"
  // 创建状态
  | "creating"
  // 绘制状态
  | "drawing"
  // 缩放状态
  | "resizing"
  // 平移状态
  | "panning";

// 事件处理器接口
export interface EventHandler {
  // 处理器名称
  name: string;
  // 处理器优先级
  priority: number;
  // 是否可以处理事件
  canHandle(event: BaseEvent, state: InteractionState): boolean;
  // 处理事件
  handle(
    event: BaseEvent,
    context: EventContext
  ): Promise<EventResult> | EventResult;
}

// 事件处理结果
export interface EventResult {
  // 是否处理
  handled: boolean;
  // 新状态
  newState?: InteractionState;
  // 是否重新渲染
  requestRender?: boolean;
  // 数据
  data?: Record<string, unknown>;
}

// 事件上下文
export interface EventContext {
  // 画布
  canvas: HTMLCanvasElement;
  // 交互状态
  interactionState: InteractionState;
  // 当前工具
  currentTool: string;
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
