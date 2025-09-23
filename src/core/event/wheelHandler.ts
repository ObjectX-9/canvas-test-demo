import { IEventHandler, EventContext } from "../manage/EventManager";
import { coordinateSystemManager } from "../manage";
import { ViewUtils } from "../types";

export class WheelHandler implements IEventHandler {
  readonly type = "zoom";
  readonly nativeEventType = "wheel";

  canHandle(event: Event): boolean {
    return event.type === this.nativeEventType;
  }

  handle(event: Event, context: EventContext): void {
    console.log("✅ ~  wheel event:", event);
    const wheelEvent = event as WheelEvent;
    const { currentPage, setViewState, setZoomIndicator } = context;

    // 阻止默认的滚动行为
    wheelEvent.preventDefault();

    const currentView = coordinateSystemManager.getViewState();
    const currentScale = ViewUtils.getScale(currentView);
    const zoomFactor = 0.01; // 缩放速率调整为0.01
    const scaleChange = wheelEvent.deltaY > 0 ? 1 - zoomFactor : 1 + zoomFactor;
    const newScale = Math.min(Math.max(0.1, currentScale * scaleChange), 5); // 确保缩放比例不会小于0.1

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
      const translation = ViewUtils.getTranslation(updatedView);
      currentPage.panX = translation.pageX;
      currentPage.panY = translation.pageY;
    }

    // 防止事件冒泡
    wheelEvent.stopPropagation();
  }
}
