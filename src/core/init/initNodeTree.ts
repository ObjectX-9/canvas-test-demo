import { pageManager } from "../manage";
import { nodeTree } from "../nodeTree";
import { elementStore } from "../store/ElementStore";
import { pageStore } from "../store/PageStore";

// 实际上我们的存储结构是map，为了方便获取
// 树形结构是通过id关联的
export const initNodeTree = () => {
  // 添加page
  const pages = pageStore.getPage();
  nodeTree.createAllElements(pages);

  // 设置当前页
  pageManager.switchToPage(Object.keys(pages)[0]);

  // 添加element
  const elements = elementStore.getElement();
  nodeTree.createAllElements(elements);
};
