export type DataChangeCallback = () => void;

export class DataObserver {
  private callbacks: Set<DataChangeCallback> = new Set();

  // 订阅数据变更
  subscribe(callback: DataChangeCallback) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  // 通知所有订阅者数据已变更
  notify() {
    this.callbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error("数据变更回调执行错误:", error);
      }
    });
  }

  // 手动触发变更通知
  markChanged() {
    this.notify();
  }

  // 清除所有订阅
  clear() {
    this.callbacks.clear();
  }

  // 获取订阅者数量
  getSubscriberCount(): number {
    return this.callbacks.size;
  }
}

// 全局数据观察者实例
export const globalDataObserver = new DataObserver();
