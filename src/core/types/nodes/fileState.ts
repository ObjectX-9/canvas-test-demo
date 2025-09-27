// 文件的数据结构
export interface FileState {
  id: string;
  // 文件名
  name: string;
  // 文件创建时间
  createdAt: string;
  // 文件更新时间
  updatedAt: string;
  // pages
  pages: string[];
}
