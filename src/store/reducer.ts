import { ActionModel } from './model/action.model'
import { StateModel } from './model/state.model'
import { LangEnum, Theme } from '../constant'

const initState: StateModel = {
  lang: LangEnum.zh_HK,
  theme: Theme.DARK
}

export enum StateAction {
  SET_THEME,
  SET_GEOLOCATION
}

export const reducer = (state: StateModel = initState, action: ActionModel): StateModel => {
  switch (action.type) {
    case StateAction.SET_THEME:
      return { ...state, theme: action.data }
    case StateAction.SET_GEOLOCATION:
      return { ...state, geolocation: action.data }
    default:
      return state
  }
}
