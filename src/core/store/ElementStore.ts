/* eslint-disable */
import { ElementCollections } from "../types";
import { BaseState } from "../types/nodes/baseState";

class ElementStore {
  private state: ElementCollections = {};

  constructor(elementState: ElementCollections) {
    this.state = elementState;
  }

  setElement(elementState: ElementCollections) {
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
    return this.state[_id];
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
    this.state[id] = elementState as BaseState;
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

  static instanceStore() {}
}

// 创建一个store

export const elementStore = new ElementStore({});