import React from "react";

// 扩展JSX命名空间，支持canvas自定义元素
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "canvas-container": {
        children?: React.ReactNode;
      };

      // UI元素
      "canvas-grid": {
        visible?: boolean;
        gridSize?: number;
        strokeStyle?: string;
        lineWidth?: number;
        zIndex?: number;
        children?: React.ReactNode;
      };

      "canvas-ruler": {
        visible?: boolean;
        rulerSize?: number;
        backgroundColor?: string;
        textColor?: string;
        strokeStyle?: string;
        zIndex?: number;
        children?: React.ReactNode;
      };

      "canvas-page-background": {
        visible?: boolean;
        zIndex?: number;
        children?: React.ReactNode;
      };

      // 页面容器（模仿Skia的ck-pageElement）
      "canvas-page": {
        visible?: boolean;
        zIndex?: number;
        children?: React.ReactNode;
      };

      // 节点元素（模仿ck-rect, ck-circle）
      "canvas-rect": {
        id?: string;
        x?: number;
        y?: number;
        w?: number;
        h?: number;
        fill?: string;
        radius?: number;
        visible?: boolean;
        children?: React.ReactNode;
      };

      "canvas-circle": {
        id?: string;
        x?: number;
        y?: number;
        r?: number;
        fill?: string;
        visible?: boolean;
        children?: React.ReactNode;
      };

      "canvas-selection": {
        visible?: boolean;
        children?: React.ReactNode;
      };
    }
  }
}

export {};
