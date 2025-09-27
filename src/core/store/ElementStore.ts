import { BaseState } from "../types/nodes/baseState";

// 用于存储需要保存在文件中的数据{element: Record<string, BaseState>}
class ElementStore {
  private state: Record<string, BaseState> = {};

  constructor(elementState: Record<string, BaseState>) {
    this.state = elementState;
  }

  setElement(elementState: Record<string, BaseState>) {
    this.state = elementState;
  }

  /**
   * [获取项目的所有的组件Map]
   *
   * @returns
   * @memberof ElementStoreStatic
   */
  getElement() {
    return this.state;
  }

  /**
   * [获取单个组件]
   *
   * @param {string} _id
   * @returns
   * @memberof ElementStoreStatic
   */
  getOneElement(_id: string) {
    const element = this.state[_id];
    console.log(`ElementStore.getOneElement(${_id}):`, element);
    return element;
  }

  /**
   * [ 添加单个组件 ]
   *
   * @param {*} _id
   * @param {*} _element
   * @param {boolean} [_noEmit=false]
   * @memberof ElementStoreStatic
   */
  addElement(id: string, elementState: BaseState) {
    console.log("ElementStore.addElement 被调用:", id, elementState);
    this.state[id] = elementState as BaseState;
    console.log("ElementStore 当前状态:", this.state);
  }
  /**
   * [ 删除单个组件 ]
   *
   * @param {*} id
   * @param {boolean} [_noEmit=false]
   * @memberof ElementStoreStatic
   */
  removeElement(id: string) {
    const element = this.getOneElement(id);
    if (element) {
      delete this.state[id];
    }
  }
}

// 创建一个store

export const elementStore = new ElementStore({});
