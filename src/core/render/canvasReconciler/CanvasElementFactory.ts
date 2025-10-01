import { CanvasGrid, CanvasRuler } from "../canvasElement/UiRenderElement";
import { CanvasRect } from "../canvasElement/Element/CanvasRect";
import { CanvasPage } from "../canvasElement/Element/CanvasPage";
import { CanvasContainer, CanvasElement } from "../canvasElement/Element";

/**
 * Canvas元素类型定义
 */
export type CanvasElementType =
  | "canvas-container"
  | "canvas-grid"
  | "canvas-ruler"
  | "canvas-page"
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
): CanvasPage => new CanvasPage(canvas, props);

export const createCanvasRect = (
  canvas: HTMLCanvasElement,
  props: CanvasElementProps
): CanvasRect => new CanvasRect(canvas, props);

/**
 * Canvas元素创建器类型
 */
export type CanvasElementCreator = (
  canvas: HTMLCanvasElement,
  props: CanvasElementProps
) => CanvasElement;

/**
 * Canvas元素映射表（模仿Skia的CkElements）
 */
const CanvasElements: { [K in CanvasElementType]: CanvasElementCreator } = {
  "canvas-container": createCanvasContainer,
  "canvas-grid": createCanvasGrid,
  "canvas-ruler": createCanvasRuler,
  "canvas-page": createCkPage,
  "canvas-rect": createCanvasRect,
  "canvas-circle": (canvas, props) => {
    return createCanvasContainer(canvas, props);
  },
};

export type CkElementType = keyof typeof CanvasElements;

export const getCkTypeByType = (type: string): CkElementType => {
  switch (type) {
    case "rectangle":
      return "canvas-rect";
    default:
      return "canvas-page";
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
  const creator = CanvasElements[type];
  if (creator) {
    return creator(canvas, props);
  }

  throw new Error(`Unknown canvas element type: ${type}`);
}
