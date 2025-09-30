import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useContext,
} from "react";
import { NodeTreeCanvasRenderer } from "./NodeTreeCanvasRenderer";
import {
  UIRenderElement,
  GridRenderElement,
  RulerRenderElement,
  BackgroundRenderElement,
} from "./UIRenderElement";
import { PageNode } from "../../nodeTree/node/pageNode";
import { ViewInfo } from "../../types/view";

/**
 * Canvas组件的属性接口
 */
export interface CanvasComponentProps {
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  currentPage?: PageNode | null;
  viewState?: ViewInfo;
  children?: React.ReactNode;
  onRendererReady?: (renderer: NodeTreeCanvasRenderer) => void;
}

/**
 * Canvas组件的引用接口
 */
export interface CanvasComponentRef {
  getRenderer(): NodeTreeCanvasRenderer | null;
  addUIElement(element: UIRenderElement): void;
  removeUIElement(element: UIRenderElement): void;
  clearUIElements(): void;
  requestRender(): void;
}

/**
 * Grid组件属性
 */
export interface GridProps {
  visible?: boolean;
  gridSize?: number;
  strokeStyle?: string;
  lineWidth?: number;
  zIndex?: number;
}

/**
 * Ruler组件属性
 */
export interface RulerProps {
  visible?: boolean;
  rulerSize?: number;
  backgroundColor?: string;
  textColor?: string;
  strokeStyle?: string;
  zIndex?: number;
}

/**
 * Background组件属性
 */
export interface BackgroundProps {
  visible?: boolean;
  backgroundColor?: string;
  zIndex?: number;
}

/**
 * Canvas组件上下文
 */
const CanvasContext = React.createContext<{
  renderer: NodeTreeCanvasRenderer | null;
  addUIElement: (element: UIRenderElement) => void;
  removeUIElement: (element: UIRenderElement) => void;
}>({
  renderer: null,
  addUIElement: () => {},
  removeUIElement: () => {},
});

/**
 * 主Canvas组件
 * 类似Skia的ck-canvas，支持声明式UI组件
 */
export const Canvas = forwardRef<CanvasComponentRef, CanvasComponentProps>(
  (props, ref) => {
    const {
      width = window.innerWidth,
      height = window.innerHeight,
      style,
      currentPage,
      viewState,
      children,
      onRendererReady,
    } = props;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<NodeTreeCanvasRenderer | null>(null);

    // 初始化渲染器
    useEffect(() => {
      const canvas = canvasRef.current;
      if (canvas && !rendererRef.current) {
        try {
          console.log("🚀 初始化Canvas组件渲染器");

          const renderer = new NodeTreeCanvasRenderer(canvas);
          renderer.setCanvasSize(width, height);

          rendererRef.current = renderer;
          onRendererReady?.(renderer);

          console.log("✅ Canvas组件渲染器初始化完成");
        } catch (error) {
          console.error("❌ Canvas组件渲染器初始化失败:", error);
        }
      }
    }, [width, height, onRendererReady]);

    // 处理尺寸变化
    useEffect(() => {
      if (rendererRef.current) {
        rendererRef.current.setCanvasSize(width, height);
      }
    }, [width, height]);

    // 渲染页面内容
    useEffect(() => {
      if (rendererRef.current && currentPage) {
        rendererRef.current.rebuildContentRenderTree(currentPage);
        rendererRef.current.renderPage(currentPage, viewState);
      }
    }, [currentPage, viewState]);

    // 暴露方法给父组件
    useImperativeHandle(
      ref,
      () => ({
        getRenderer: () => rendererRef.current,
        addUIElement: (element: UIRenderElement) => {
          rendererRef.current?.addUIElement(element);
        },
        removeUIElement: (element: UIRenderElement) => {
          rendererRef.current?.removeUIElement(element);
        },
        clearUIElements: () => {
          rendererRef.current?.clearUIElements();
        },
        requestRender: () => {
          if (rendererRef.current && currentPage) {
            rendererRef.current.renderPage(currentPage, viewState);
          }
        },
      }),
      [currentPage, viewState]
    );

    // Canvas上下文值
    const contextValue = {
      renderer: rendererRef.current,
      addUIElement: (element: UIRenderElement) => {
        rendererRef.current?.addUIElement(element);
      },
      removeUIElement: (element: UIRenderElement) => {
        rendererRef.current?.removeUIElement(element);
      },
    };

    return (
      <CanvasContext.Provider value={contextValue}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            ...style,
          }}
        />
        {children}
      </CanvasContext.Provider>
    );
  }
);

Canvas.displayName = "Canvas";

/**
 * Grid组件 - 渲染网格
 */
export const Grid: React.FC<GridProps> = (props) => {
  const { renderer, addUIElement, removeUIElement } =
    React.useContext(CanvasContext);
  const elementRef = useRef<GridRenderElement | null>(null);

  useEffect(() => {
    if (renderer) {
      // 创建网格元素
      const gridElement = new GridRenderElement({
        visible: props.visible,
        zIndex: props.zIndex || -10, // 网格通常在背景层
        gridSize: props.gridSize,
        strokeStyle: props.strokeStyle,
        lineWidth: props.lineWidth,
      });

      elementRef.current = gridElement;
      addUIElement(gridElement);

      return () => {
        if (elementRef.current) {
          removeUIElement(elementRef.current);
        }
      };
    }
  }, [renderer, addUIElement, removeUIElement]);

  // 更新属性
  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.updateProps({
        visible: props.visible,
        zIndex: props.zIndex || -10,
      });

      if (props.gridSize !== undefined) {
        elementRef.current.setGridSize(props.gridSize);
      }

      if (props.strokeStyle || props.lineWidth !== undefined) {
        elementRef.current.setStyle(
          props.strokeStyle || "#e0e0e0",
          props.lineWidth || 1
        );
      }
    }
  }, [
    props.visible,
    props.zIndex,
    props.gridSize,
    props.strokeStyle,
    props.lineWidth,
  ]);

  return null; // 不渲染DOM元素
};

/**
 * Ruler组件 - 渲染标尺
 */
export const Ruler: React.FC<RulerProps> = (props) => {
  const { renderer, addUIElement, removeUIElement } =
    React.useContext(CanvasContext);
  const elementRef = useRef<RulerRenderElement | null>(null);

  useEffect(() => {
    if (renderer) {
      // 创建标尺元素
      const rulerElement = new RulerRenderElement({
        visible: props.visible,
        zIndex: props.zIndex || 10, // 标尺通常在前景层
        rulerSize: props.rulerSize,
        backgroundColor: props.backgroundColor,
        textColor: props.textColor,
        strokeStyle: props.strokeStyle,
      });

      elementRef.current = rulerElement;
      addUIElement(rulerElement);

      return () => {
        if (elementRef.current) {
          removeUIElement(elementRef.current);
        }
      };
    }
  }, [renderer, addUIElement, removeUIElement]);

  // 更新属性
  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.updateProps({
        visible: props.visible,
        zIndex: props.zIndex || 10,
      });
    }
  }, [props.visible, props.zIndex]);

  return null; // 不渲染DOM元素
};

/**
 * Background组件 - 渲染背景
 */
export const Background: React.FC<BackgroundProps> = (props) => {
  const { renderer, addUIElement, removeUIElement } =
    React.useContext(CanvasContext);
  const elementRef = useRef<BackgroundRenderElement | null>(null);

  useEffect(() => {
    if (renderer) {
      // 创建背景元素
      const backgroundElement = new BackgroundRenderElement({
        visible: props.visible,
        zIndex: props.zIndex || -20, // 背景在最底层
        backgroundColor: props.backgroundColor,
      });

      elementRef.current = backgroundElement;
      addUIElement(backgroundElement);

      return () => {
        if (elementRef.current) {
          removeUIElement(elementRef.current);
        }
      };
    }
  }, [renderer, addUIElement, removeUIElement]);

  // 更新属性
  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.updateProps({
        visible: props.visible,
        zIndex: props.zIndex || -20,
      });

      if (props.backgroundColor) {
        elementRef.current.setBackgroundColor(props.backgroundColor);
      }
    }
  }, [props.visible, props.zIndex, props.backgroundColor]);

  return null; // 不渲染DOM元素
};
