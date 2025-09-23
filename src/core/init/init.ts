import { getBasicElement } from "../../mock/element";
import { getBasicView } from "../../mock/view";
import { nodeTree } from "../nodeTree";
import { elementStore } from "../store/ElementStore";
import { coordinateSystemManager } from "../manage";
import { ElementCollections, ViewMatrix } from "../types";
import { Page } from "../nodeTree/node/page";

type State = {
  element?: ElementCollections;
  page?: Record<string, Page>;
  view?: ViewMatrix;
};
export function initState(state: State) {
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
  // 初始化坐标系统管理器
  coordinateSystemManager.setViewState(state.view as ViewMatrix);
  // 创建节点树
  nodeTree.createAllElements(state.element as ElementCollections);
}
