import { CanvasGrid, CanvasRuler, CanvasSelection } from "../canvasElement/UiRenderElement";
import { CanvasRect } from "../canvasElement/Element/CanvasRect";
import { CanvasPage } from "../canvasElement/Element/CanvasPage";
import { Rectangle } from "@/core/nodeTree/node/rectangle";
import { PageNode } from "@/core/nodeTree/node/pageNode";
import { BaseNode } from "@/core/nodeTree/node/baseNode";

/**
 * Canvas元素类型定义
 */
export type CanvasElementType =
  | "canvas-grid"
  | "canvas-ruler"
  | "canvas-selection"
  | "canvas-page"
  | "canvas-rect";

/**
 * Canvas元素基础属性（所有元素共有的属性）
 */
export interface BaseCanvasElementProps {
  id?: string;
  visible?: boolean;
  zIndex?: number;
  children?: unknown;
  [key: string]: unknown;
}

/**
 * Canvas网格元素属性
 */
export interface CanvasGridProps extends BaseCanvasElementProps {
  gridSize?: number;
  strokeStyle?: string;
  lineWidth?: number;
  jsNode?: BaseNode;
}

/**
 * Canvas标尺元素属性
 */
export interface CanvasRulerProps extends BaseCanvasElementProps {
  rulerSize?: number;
  backgroundColor?: string;
  textColor?: string;
  strokeStyle?: string;
  jsNode?: BaseNode;
}

/**
 * Canvas选择框元素属性
 */
export interface CanvasSelectionProps extends BaseCanvasElementProps {
  strokeStyle?: string;
  fillStyle?: string;
  lineWidth?: number;  
  lineDash?: number[];
  selectedStrokeStyle?: string;
  selectedLineWidth?: number;
}

/**
 * Canvas页面元素属性
 */
export interface CanvasPageProps extends BaseCanvasElementProps {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  jsNode?: PageNode;
}

/**
 * Canvas矩形元素属性
 */
export interface CanvasRectProps extends BaseCanvasElementProps {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  fill?: string;
  radius?: number;
  jsNode?: Rectangle;
}

/**
 * 通用Canvas元素属性类型（兼容旧代码）
 */
export type CanvasElementProps =
  | CanvasGridProps
  | CanvasRulerProps
  | CanvasSelectionProps
  | CanvasPageProps
  | CanvasRectProps;

export const createCanvasGrid = (
  canvas: HTMLCanvasElement,
  props: CanvasGridProps
): CanvasGrid => new CanvasGrid(canvas, props);

export const createCanvasRuler = (
  canvas: HTMLCanvasElement,
  props: CanvasRulerProps
): CanvasRuler => new CanvasRuler(canvas, props);

export const createCanvasSelection = (
  canvas: HTMLCanvasElement,
  props: CanvasSelectionProps
): CanvasSelection => new CanvasSelection(canvas, props);

export const createCkPage = (
  canvas: HTMLCanvasElement,
  props: CanvasPageProps
): CanvasPage => new CanvasPage(canvas, props);

export const createCanvasRect = (
  canvas: HTMLCanvasElement,
  props: CanvasRectProps
): CanvasRect => new CanvasRect(canvas, props);

/**
 * Canvas元素创建器类型映射
 */
export type CanvasElementCreatorMap = {
  "canvas-grid": (
    canvas: HTMLCanvasElement,
    props: CanvasGridProps
  ) => CanvasGrid;
  "canvas-ruler": (
    canvas: HTMLCanvasElement,
    props: CanvasRulerProps
  ) => CanvasRuler;
  "canvas-selection": (
    canvas: HTMLCanvasElement,
    props: CanvasSelectionProps
  ) => CanvasSelection;
  "canvas-page": (
    canvas: HTMLCanvasElement,
    props: CanvasPageProps
  ) => CanvasPage;
  "canvas-rect": (
    canvas: HTMLCanvasElement,
    props: CanvasRectProps
  ) => CanvasRect;
};

/**
 * Canvas元素属性类型映射
 */
export type CanvasElementPropsMap = {
  "canvas-grid": CanvasGridProps;
  "canvas-ruler": CanvasRulerProps;
  "canvas-selection": CanvasSelectionProps;
  "canvas-page": CanvasPageProps;
  "canvas-rect": CanvasRectProps;
};

/**
 * Canvas元素映射表（模仿Skia的CkElements）
 */
const CanvasElements: CanvasElementCreatorMap = {
  "canvas-grid": createCanvasGrid,
  "canvas-ruler": createCanvasRuler,
  "canvas-selection": createCanvasSelection,
  "canvas-page": createCkPage,
  "canvas-rect": createCanvasRect,
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
export function createCanvasElement<T extends CanvasElementType>(
  type: T,
  canvas: HTMLCanvasElement,
  props: CanvasElementPropsMap[T]
): ReturnType<CanvasElementCreatorMap[T]> {
  const creator = CanvasElements[type];
  if (creator) {
    return creator(
      canvas,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      props as any
    ) as ReturnType<CanvasElementCreatorMap[T]>;
  }

  throw new Error(`Unknown canvas element type: ${type}`);
}
