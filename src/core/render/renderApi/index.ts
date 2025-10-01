import logger from "@/core/utils/logerHelper";
import { RenderEngineType, renderingEngine } from "../store/RenderingEngine";
import CanvasRenderApi from "./canvas";

export const getRenderApi = (canvas: HTMLCanvasElement) => {
  if (!canvas) {
    logger.error("Canvas is not found");
    throw new Error("Canvas is not found");
  }
  const renderEngine = renderingEngine.getCurRenderEngine();
  if (renderEngine === RenderEngineType.CANVAS) {
    return new CanvasRenderApi(canvas);
  }
};
