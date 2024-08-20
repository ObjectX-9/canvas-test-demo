import { getBasicView } from "../../mock/view";
import { viewStore } from "../store/ViewStore";
import { ViewType } from "../types";

type State = {
  element?: Record<string, any>,
  page?: Record<string, any>,
  view?: ViewType,
}
export function initJsdState(state: State) {
  if (Object.keys(state).length === 0) {
    const basicView = getBasicView();
    state.view = basicView;
    // state.page = { [basicPage.id]: basicPage };
    // state.element = {};
  }
  // 初始化 store 数据
  // pageStore.setPage(state.page);
  // elementStore.setElement(state.element);
  viewStore.setView(state.view as ViewType);
  // JsNodeTree.createProjectNode();
  console.log("✅ ✅ ✅ ~  state:", state);
}
