import { CanvasGrid, CanvasRuler } from "../canvas/UiRenderElement/";
import { CanvasRect } from "../canvas/Element/CanvasRect";
import { CkPage } from "../canvas/Element/CkPage";
import { CanvasContainer, CanvasElement } from "../canvas/Element";

/**
 * Canvas元素类型定义
 */
export type CanvasElementType =
  | "canvas-container"
  | "canvas-grid"
  | "canvas-ruler"
  | "ckpage"
  | "canvas-rect"
  | "canvas-circle";

/**
 * Canvas元素属性类型
 */
export interface CanvasElementProps {
  // 通用属性
  id?: string;
  visible?: boolean;
  zIndex?: number;
  children?: unknown;

  // UI元素属性
  gridSize?: number;
  strokeStyle?: string;
  lineWidth?: number;
  rulerSize?: number;
  backgroundColor?: string;
  textColor?: string;

  // 节点元素属性
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  r?: number;
  fill?: string;
  radius?: number;

  [key: string]: unknown;
}

/**
 * Canvas元素创建函数
 */
export const createCanvasContainer = (
  canvas: HTMLCanvasElement,
  props: CanvasElementProps
): CanvasContainer => new CanvasContainer(canvas, props);

export const createCanvasGrid = (
  canvas: HTMLCanvasElement,
  props: CanvasElementProps
): CanvasGrid => new CanvasGrid(canvas, props);

export const createCanvasRuler = (
  canvas: HTMLCanvasElement,
  props: CanvasElementProps
): CanvasRuler => new CanvasRuler(canvas, props);

export const createCkPage = (
  canvas: HTMLCanvasElement,
  props: CanvasElementProps
): CkPage => new CkPage(canvas, props);

export const createCanvasRect = (
  canvas: HTMLCanvasElement,
  props: CanvasElementProps
): CanvasRect => new CanvasRect(canvas, props);

/**
 * Canvas元素创建器类型
 */
export type CanvasElementCreator<T extends CanvasElementType> = (
  canvas: HTMLCanvasElement,
  props: CanvasElementProps
) => CanvasElement;

/**
 * Canvas元素映射表（模仿Skia的CkElements）
 */
const CanvasElements: { [K in CanvasElementType]: CanvasElementCreator<K> } = {
  "canvas-container": createCanvasContainer,
  "canvas-grid": createCanvasGrid,
  "canvas-ruler": createCanvasRuler,
  ckpage: createCkPage,
  "canvas-rect": createCanvasRect,
  "canvas-circle": (canvas, props) => {
    // TODO: 实现CanvasCircle
    console.log("📝 canvas-circle暂未实现");
    return createCanvasContainer(canvas, props);
  },
};

export type CkElementType = keyof typeof CanvasElements;

export const getCkTypeByType = (type: string): CkElementType => {
  switch (type) {
    case "rectangle":
      return "canvas-rect";
    default:
      return "ckpage";
  }
};

/**
 * 创建Canvas元素（模仿Skia的createCkElement）
 */
export function createCanvasElement(
  type: CanvasElementType,
  canvas: HTMLCanvasElement,
  props: CanvasElementProps
): CanvasElement {
  console.log(`🏭 创建Canvas元素: ${type}`, props);

  const creator = CanvasElements[type];
  if (creator) {
    return creator(canvas, props);
  }

  throw new Error(`Unknown canvas element type: ${type}`);
}
