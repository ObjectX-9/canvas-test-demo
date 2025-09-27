import { FileState } from "../types";

class FileStore {
  private state: FileState | null = null;

  constructor() {
    this.state = null;
  }

  setFile(fileState: FileState) {
    this.state = fileState;
  }

  getFile() {
    return this.state;
  }
}

export const fileStore: FileStore = new FileStore();
