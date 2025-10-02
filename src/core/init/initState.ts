import { getBasicPage } from "@/mock/page";
import { getBasicElement } from "../../mock/element";
import { elementStore } from "../store/ElementStore";
import { BaseState, PageState } from "../types";
import { FileState } from "../types/nodes/fileState";
import { getBasicFile } from "@/mock/file";
import { fileStore } from "../store/FileStore";
import { pageStore } from "../store/PageStore";

type State = {
  // 节点map
  element?: Record<string, BaseState>;
  // 页面map
  page?: Record<string, PageState>;
  // 文件信息
  file?: FileState;
};

// 初始化state结构
export function initState(state: State) {
  if (Object.keys(state).length === 0) {
    const baseElements = getBasicElement();
    const basePages = getBasicPage();
    const baseFile = getBasicFile();
    state.element = baseElements;
    state.page = basePages;
    state.file = baseFile;
  }

  // 文件数据
  fileStore.setFile(state.file as FileState);
  // 页面数据
  pageStore.setPage(state.page as Record<string, PageState>);
  // 节点数据
  elementStore.setElement(state.element as Record<string, BaseState>);
}
