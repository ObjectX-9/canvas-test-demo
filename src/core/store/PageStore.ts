import { PageState } from "../types";
// 用于存储页面数据{page: Record<string, PageState>}
class PageStore {
  private state: Record<string, PageState> = {};

  constructor(pageState: Record<string, PageState>) {
    this.state = pageState;
  }

  setPage(pageState: Record<string, PageState>) {
    this.state = pageState;
  }

  getPage() {
    return this.state;
  }

  getOnePage(id: string) {
    return this.state[id];
  }

  addPage(id: string, pageState: PageState) {
    this.state[id] = pageState;
  }

  removePage(id: string) {
    delete this.state[id];
  }
}

export const pageStore: PageStore = new PageStore({});
