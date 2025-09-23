import { ViewMatrix, ViewUtils } from "../types";
// 视图状态存储器
class ViewStore {
  private state: ViewMatrix;

  constructor(viewState: ViewMatrix) {
    this.state = viewState;
  }

  setView(viewState: ViewMatrix) {
    this.state = viewState;
  }

  getView() {
    return this.state;
  }

  initViewStore() {}
}

// 创建一个store，使用默认的视图状态
export const viewStore: ViewStore = new ViewStore(ViewUtils.createIdentity());
