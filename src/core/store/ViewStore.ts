/* eslint-disable */

import { ViewType } from "../types";

class ViewStore {
  private state: ViewType;

  constructor(viewState: ViewType) {
    this.state = viewState
  }

  setView(viewState: ViewType) {
    this.state = viewState
  }

  getView() {
    return this.state;
  }


  initViewStore() {

  }

}

// 创建一个store
export let viewStore: ViewStore = new ViewStore({} as ViewType);

