import {ActionModel} from '../model/action.model'
import {StateModel} from '../model/state.model'
import {LangEnum, Theme} from '../../constant'

const initState: StateModel = {
    lang: LangEnum.zh_HK,
    theme: Theme.DARK,
}

export enum StateAction {
    SET_THEME,
    SET_GEOLOCATION,
    SET_DATA_INFO
}

export const reducer = (state: StateModel = initState, action: ActionModel): StateModel => {
    switch (action.type) {
        case StateAction.SET_THEME:
            return Object.assign({}, state, {
                theme: action.data
            })
        case StateAction.SET_GEOLOCATION:
            return Object.assign({}, state, {
                geolocation: action.data
            })
        case StateAction.SET_DATA_INFO:
            const [key, value] = Object.entries(action.data)[0]
            return Object.assign({}, state, {
                [key]: value
            })
        default:
            return state
    }
}
