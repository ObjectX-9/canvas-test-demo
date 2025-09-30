import React from "react";

/**
 * Canvas React组件库
 * 提供与Canvas渲染器对应的React组件
 */

export interface BaseProps {
  children?: React.ReactNode;
}

export interface GeometryProps extends BaseProps {
  x?: number;
  y?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
}

export interface RectProps extends GeometryProps {
  width?: number;
  height?: number;
  rx?: number; // 圆角半径
  ry?: number;
}

export interface CircleProps extends GeometryProps {
  r?: number;
  radius?: number;
}

export interface EllipseProps extends GeometryProps {
  rx?: number;
  ry?: number;
}

export interface LineProps extends GeometryProps {
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}

export interface PathProps extends GeometryProps {
  d?: string; // SVG路径数据
}

export interface TextProps extends GeometryProps {
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: "left" | "center" | "right" | "start" | "end";
  textBaseline?:
    | "alphabetic"
    | "top"
    | "hanging"
    | "middle"
    | "ideographic"
    | "bottom";
}

export interface ImageProps extends GeometryProps {
  src?: string;
  width?: number;
  height?: number;
}

export interface GroupProps extends BaseProps {
  transform?: string;
}

/**
 * 矩形组件
 */
export const Rect: React.FC<RectProps> = (props) => {
  return React.createElement("rect", props);
};

/**
 * 圆形组件
 */
export const Circle: React.FC<CircleProps> = (props) => {
  return React.createElement("circle", props);
};

/**
 * 椭圆组件
 */
export const Ellipse: React.FC<EllipseProps> = (props) => {
  return React.createElement("ellipse", props);
};

/**
 * 线条组件
 */
export const Line: React.FC<LineProps> = (props) => {
  return React.createElement("line", props);
};

/**
 * 路径组件
 */
export const Path: React.FC<PathProps> = (props) => {
  return React.createElement("path", props);
};

/**
 * 文本组件
 */
export const Text: React.FC<TextProps> = ({ children, text, ...props }) => {
  const textContent = text || children;
  return React.createElement("text", { ...props, children: textContent });
};

/**
 * 图片组件
 */
export const Image: React.FC<ImageProps> = (props) => {
  return React.createElement("image", props);
};

/**
 * 分组组件
 */
export const Group: React.FC<GroupProps> = (props) => {
  return React.createElement("group", props);
};

/**
 * 容器组件
 */
export const Container: React.FC<BaseProps> = (props) => {
  return React.createElement("container", props);
};
