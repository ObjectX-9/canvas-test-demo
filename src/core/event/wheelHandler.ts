import { IEventHandler, EventContext } from "./EventManager";
import { coordinateSystemManager } from "../manage";
import { globalDataObserver } from "../render";

/**
 * 滚轮事件处理器
 */
export class WheelHandler implements IEventHandler {
  readonly type = "wheel";

  canHandle(event: Event): boolean {
    return event.type === "wheel";
  }

  handle(event: Event, context: EventContext): void {
    const wheelEvent = event as WheelEvent;
    const { currentPage, setViewState, setZoomIndicator } = context;

    wheelEvent.preventDefault();

    const currentView = coordinateSystemManager.getViewState();
    const zoomFactor = 0.01; // 缩放速率调整为0.01
    const scaleChange = wheelEvent.deltaY > 0 ? 1 - zoomFactor : 1 + zoomFactor;
    const newScale = Math.min(
      Math.max(0.1, currentView.scale * scaleChange),
      5
    ); // 确保缩放比例不会小于0.1

    const mouseX = wheelEvent.clientX;
    const mouseY = wheelEvent.clientY;

    // 使用坐标系统管理器进行以鼠标位置为中心的缩放
    coordinateSystemManager.updateViewScale(newScale, mouseX, mouseY);

    const updatedView = coordinateSystemManager.getViewState();
    setViewState(updatedView);
    setZoomIndicator(`${Math.round(newScale * 100)}%`);

    // 同步视图状态到当前页面
    if (currentPage) {
      currentPage.zoom = newScale;
      currentPage.panX = updatedView.pageX;
      currentPage.panY = updatedView.pageY;
    }

    // 通知数据变更
    globalDataObserver.markChanged();
  }
}
