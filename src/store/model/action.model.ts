import { StateAction } from '../reducer/reducer'

export interface ActionModel<T = any> {
  type: StateAction
  data?: T
}
