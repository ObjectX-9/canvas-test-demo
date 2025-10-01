import logger from "@/core/utils/logerHelper";
import { createSkiaLikeRenderer } from "..";
import { getRenderApi } from "../renderApi";
import { RenderEngineType, renderingEngine } from "../store/RenderingEngine";

export function initRenderingEngine(canvas: HTMLCanvasElement) {
  // 设置当前渲染引擎
  renderingEngine.setCurRenderEngine(RenderEngineType.CANVAS);
  // 获取渲染api
  const renderApi = getRenderApi(canvas);

  if (!renderApi) {
    logger.error("无法获取渲染api");
    throw new Error("无法获取渲染api");
  }

  // 初始化渲染器
  const renderer = createSkiaLikeRenderer(canvas, renderApi);

  return renderer;
}
