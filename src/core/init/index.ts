import { initNodeTree } from "./initNodeTree";
import { initState } from "./initState";

export const initEditor = () => {
  // 初始化state
  initState({});
  // 初始化节点树
  initNodeTree();
};
