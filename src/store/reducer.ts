import {ActionModel} from './model/action.model'
import {StateModel} from './model/state.model'
import {LangEnum, Theme} from '../constant'

const initState: StateModel = {
    lang: LangEnum.zh_HK,
    theme: Theme.DARK,
    data: {
        info: {}
    }
}

export enum StateAction {
    SET_THEME,
    SET_GEOLOCATION,
    SET_DATA_INFO
}

export const reducer = (state: StateModel = initState, action: ActionModel): StateModel => {
    switch (action.type) {
        case StateAction.SET_THEME:
            return {...state, theme: action.data}
        case StateAction.SET_GEOLOCATION:
            return {...state, geolocation: action.data}
        case StateAction.SET_DATA_INFO:
            return {...state, data: {...state.data, info: {...state.data.info, ...action.data}}}
        default:
            return state
    }
}
