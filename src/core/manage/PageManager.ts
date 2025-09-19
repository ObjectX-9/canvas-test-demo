import { PageState } from "../types/nodes/page";
import { Page } from "../nodeTree/node/page";
import { nodeTree } from "../nodeTree";
import { Rectangle } from "../nodeTree/node/rectangle";
import { mockPageData } from "../../mock/page";
import { getMockRectangleById } from "../../mock/element";

export class PageManager {
  private pages: Map<string, Page> = new Map();
  private currentPageId: string | null = null;

  constructor() {
    // 使用模拟数据初始化页面
    this.initializeMockPages();
  }

  // 创建新页面
  createPage(options: Partial<PageState> = {}): Page {
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

    const page = new Page(defaultPageState);
    this.pages.set(page.id, page);

    // 添加到节点树
    nodeTree.addNode(page);

    // 如果是第一个页面，设为当前页面
    if (this.pages.size === 1) {
      this.switchToPage(page.id);
    }

    return page;
  }

  // 使用模拟数据初始化页面
  private initializeMockPages(): void {
    // 创建所有模拟页面
    let activePageId: string | null = null;

    mockPageData.forEach((pageData) => {
      const page = this.createPage(pageData);

      // 为页面创建子节点
      this.createPageChildren(page, pageData.children);

      // 记录活跃页面ID
      if (pageData.isActive) {
        activePageId = page.id;
      }
    });

    // 如果有活跃页面，切换到它
    if (activePageId) {
      this.switchToPage(activePageId);
    }
  }

  // 为页面创建子节点
  private createPageChildren(page: Page, childrenIds: string[]): void {
    childrenIds.forEach((childId) => {
      // 根据ID获取矩形数据
      const rectData = getMockRectangleById(childId);

      if (rectData) {
        // 创建矩形节点
        const rectangle = new Rectangle(rectData);

        // 添加到节点树
        nodeTree.addNode(rectangle);

        // 添加为页面子节点
        page.addChild(childId);

        console.log(`已为页面 ${page.name} 添加子节点: ${childId}`);
      } else {
        console.warn(`找不到ID为 ${childId} 的矩形数据`);
      }
    });
  }

  // 切换到指定页面
  switchToPage(pageId: string): boolean {
    const targetPage = this.pages.get(pageId);
    if (!targetPage) {
      console.warn(`页面 ${pageId} 不存在`);
      return false;
    }

    // 将所有页面设为非活动状态
    this.pages.forEach((page) => {
      page.isActive = false;
    });

    // 设置目标页面为活动状态
    targetPage.isActive = true;
    this.currentPageId = pageId;

    console.log(`已切换到页面: ${targetPage.name} (${pageId})`);
    return true;
  }

  // 获取当前页面
  getCurrentPage(): Page | null {
    if (!this.currentPageId) return null;
    return this.pages.get(this.currentPageId) || null;
  }

  // 获取所有页面
  getAllPages(): Page[] {
    return Array.from(this.pages.values());
  }

  // 删除页面
  deletePage(pageId: string): boolean {
    const page = this.pages.get(pageId);
    if (!page) {
      console.warn(`页面 ${pageId} 不存在`);
      return false;
    }

    // 不能删除最后一个页面
    if (this.pages.size <= 1) {
      console.warn("不能删除最后一个页面");
      return false;
    }

    // 如果删除的是当前页面，切换到其他页面
    if (this.currentPageId === pageId) {
      const otherPages = Array.from(this.pages.keys()).filter(
        (id) => id !== pageId
      );
      if (otherPages.length > 0) {
        this.switchToPage(otherPages[0]);
      }
    }

    // 从节点树中移除
    nodeTree.removeNode(pageId);

    // 从页面管理器中移除
    this.pages.delete(pageId);

    console.log(`已删除页面: ${page.name} (${pageId})`);
    return true;
  }

  // 复制页面
  duplicatePage(pageId: string): Page | null {
    const sourcePage = this.pages.get(pageId);
    if (!sourcePage) {
      console.warn(`页面 ${pageId} 不存在`);
      return null;
    }

    const newPage = this.createPage({
      name: `${sourcePage.name} 副本`,
      backgroundColor: sourcePage.backgroundColor,
      width: sourcePage.width,
      height: sourcePage.height,
      zoom: sourcePage.zoom,
      panX: sourcePage.panX,
      panY: sourcePage.panY,
      // 注意：这里没有复制children，因为需要深度复制所有子节点
      children: [],
    });

    return newPage;
  }

  // 重命名页面
  renamePage(pageId: string, newName: string): boolean {
    const page = this.pages.get(pageId);
    if (!page) {
      console.warn(`页面 ${pageId} 不存在`);
      return false;
    }

    page.name = newName;
    console.log(`页面已重命名为: ${newName}`);
    return true;
  }

  // 获取页面数量
  getPageCount(): number {
    return this.pages.size;
  }

  // 检查页面是否存在
  hasPage(pageId: string): boolean {
    return this.pages.has(pageId);
  }
}

// 导出单例实例
export const pageManager = new PageManager();
