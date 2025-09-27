import { BaseState } from "./baseState";

export interface ContainerState extends BaseState {
  children: string[];
}
