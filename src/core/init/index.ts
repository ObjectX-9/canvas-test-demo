import { initNodeTree } from "./initNodeTree";
import { initState } from "./initState";

export const initEditor = () => {
  console.log("🚀 开始初始化编辑器核心数据...");

  // 初始化state
  initState({});

  // 初始化节点树
  initNodeTree();

  console.log("✅ 编辑器核心数据初始化完成");

  // 注意：事件系统采用懒加载模式，会在Canvas创建时自动初始化
};
