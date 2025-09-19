import { useState, useEffect } from "react";
import { pageManager } from "../../../core/manage";
import { Page } from "../../../core/nodeTree/node/page";
import styles from "./style.module.less";

interface PagePanelProps {
  isVisible: boolean;
  onClose: () => void;
  onPageSwitch: (page: Page) => void;
  currentPage: Page | null;
}

export const PagePanel = ({
  isVisible,
  onClose,
  onPageSwitch,
  currentPage,
}: PagePanelProps) => {
  const [allPages, setAllPages] = useState<Page[]>(pageManager.getAllPages());

  // 刷新页面列表
  const refreshPages = () => {
    setAllPages(pageManager.getAllPages());
  };

  // 创建新页面
  const handleCreatePage = () => {
    const newPage = pageManager.createPage({
      name: `页面 ${pageManager.getPageCount() + 1}`,
    });
    refreshPages();
    onPageSwitch(newPage);
  };

  // 切换页面
  const handlePageSwitch = (pageId: string) => {
    const success = pageManager.switchToPage(pageId);
    if (success) {
      const newCurrentPage = pageManager.getCurrentPage();
      if (newCurrentPage) {
        onPageSwitch(newCurrentPage);
      }
    }
  };

  // 删除页面
  const handleDeletePage = (pageId: string) => {
    const success = pageManager.deletePage(pageId);
    if (success) {
      refreshPages();
      const newCurrentPage = pageManager.getCurrentPage();
      if (newCurrentPage) {
        onPageSwitch(newCurrentPage);
      }
    }
  };

  // 重命名页面
  const handleRenamePage = (pageId: string, newName: string) => {
    pageManager.renamePage(pageId, newName);
    refreshPages();
  };

  // 监听页面管理器变化
  useEffect(() => {
    refreshPages();
  }, [currentPage]);

  return (
    <>
      {/* 左侧页面切换面板 */}
      <div className={styles.pagePanel} style={{ left: isVisible ? 0 : -250 }}>
        <div className={styles.panelHeader}>
          <h3>页面管理</h3>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>

        <button onClick={handleCreatePage} className={styles.createButton}>
          + 新建页面
        </button>

        <div className={styles.pageList}>
          <h4>页面列表 ({allPages.length})</h4>
          {allPages.map((page) => (
            <div
              key={page.id}
              className={`${styles.pageItem} ${
                page.isActive ? styles.active : ""
              }`}
              onClick={() => handlePageSwitch(page.id)}
            >
              <div className={styles.pageItemContent}>
                <div className={styles.pageInfo}>
                  <div
                    className={styles.pageName}
                    onDoubleClick={() => {
                      const newName = prompt("输入新的页面名称:", page.name);
                      if (newName && newName.trim()) {
                        handleRenamePage(page.id, newName.trim());
                      }
                    }}
                  >
                    {page.name}
                  </div>
                  <div className={styles.pageSize}>
                    {page.width} × {page.height}
                  </div>
                  <div className={styles.pageZoom}>
                    缩放: {Math.round(page.zoom * 100)}%
                  </div>
                </div>
                {allPages.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`确定要删除页面 "${page.name}" 吗？`)) {
                        handleDeletePage(page.id);
                      }
                    }}
                    className={styles.deleteButton}
                  >
                    删除
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
