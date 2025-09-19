import { getBasicElement } from "../../mock/element";
import { getBasicView } from "../../mock/view";
import { nodeTree } from "../nodeTree";
import { elementStore } from "../store/ElementStore";
import { viewStore } from "../store/ViewStore";
import { coordinateSystemManager } from "../manage";
import { ElementCollections, ViewType } from "../types";

type State = {
  element?: ElementCollections;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  page?: Record<string, any>;
  view?: ViewType;
};
export function initJsdState(state: State) {
  if (Object.keys(state).length === 0) {
    const basicView = getBasicView();
    const baseElements = getBasicElement();
    state.view = basicView;
    // state.page = { [basicPage.id]: basicPage };
    state.element = baseElements;
  }
  // 初始化 store 数据
  // pageStore.setPage(state.page);
  elementStore.setElement(state.element as ElementCollections);
  viewStore.setView(state.view as ViewType);

  // 初始化坐标系统管理器
  coordinateSystemManager.setViewState(state.view as ViewType);
  // JsNodeTree.createProjectNode();

  // 创建节点树
  nodeTree.createAllElements(state.element as ElementCollections);

  console.log("节点树", nodeTree.getAllNodes());
  console.log("坐标系统管理器已初始化", coordinateSystemManager.getViewState());
}
