import { FileState } from "@/core/types";

export const mockFileData: FileState = {
  id: "file_001",
  name: "文件1",
  pages: ["page_001"],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function getBasicFile(): typeof mockFileData {
  return mockFileData;
}
