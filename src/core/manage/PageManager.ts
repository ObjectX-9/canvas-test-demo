import { PageState } from "../types/nodes/pageState";
import { PageNode } from "../nodeTree/node/pageNode";
import { nodeTree } from "../nodeTree";
import { pageStore } from "../store/PageStore";

export class PageManager {
  private currentPageId: string | null = null;

  constructor() {}

  // 创建新页面
  createPage(options: Partial<PageState> = {}): PageNode {
    const defaultPageState: PageState = {
      id: options.id || `page_${Date.now()}`,
      type: "page",
      name: options.name || "新页面",
      backgroundColor: options.backgroundColor || "#ffffff",
      width: options.width || 1920,
      height: options.height || 1080,
      children: options.children || [],
      isActive: false,
      zoom: options.zoom || 1,
      panX: options.panX || 0,
      panY: options.panY || 0,
      fill: options.fill || "#ffffff",
      x: options.x || 0,
      y: options.y || 0,
      w: options.w || 1920,
      h: options.h || 1080,
      rotation: options.rotation || 0,
    };

    // 添加到节点树
    nodeTree.addNode(defaultPageState);

    // 如果是第一个页面，设为当前页面
    if (Object.keys(pageStore.getPage()).length === 1) {
      this.switchToPage(defaultPageState.id);
    }

    return nodeTree.getNodeById(defaultPageState.id) as PageNode;
  }

  // 切换到指定页面
  switchToPage(pageId: string): boolean {
    const targetPage = nodeTree.getNodeById(pageId);
    if (!targetPage) {
      return false;
    }

    // 将所有页面设为非活动状态
    Object.values(pageStore.getPage()).forEach((page) => {
      page.isActive = false;
    });

    // 设置目标页面为活动状态
    (targetPage as PageNode).isActive = true;
    this.currentPageId = pageId;
    return true;
  }

  // 获取当前页面
  getCurrentPage(): PageNode | null {
    if (!this.currentPageId) return null;
    return (nodeTree.getNodeById(this.currentPageId) as PageNode) || null;
  }

  // 获取所有页面
  getAllPages(): PageNode[] {
    return Array.from(nodeTree.getAllNodes().values()).filter(
      (node) => node.type === "page"
    ) as PageNode[];
  }

  // 删除页面
  deletePage(pageId: string): boolean {
    const page = nodeTree.getNodeById(pageId);
    if (!page) {
      return false;
    }

    // 不能删除最后一个页面
    if (Object.keys(pageStore.getPage()).length <= 1) {
      return false;
    }

    // 如果删除的是当前页面，切换到其他页面
    if (this.currentPageId === pageId) {
      const otherPages = Object.keys(pageStore.getPage()).filter(
        (id) => id !== pageId
      );
      if (otherPages.length > 0) {
        this.switchToPage(otherPages[0]);
      }
    }

    // 从节点树中移除
    nodeTree.removeNode(pageId);

    // 从页面管理器中移除
    pageStore.removePage(pageId);

    return true;
  }
}

// 导出单例实例
export const pageManager = new PageManager();
