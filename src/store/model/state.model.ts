import {CompanyEnum, LangEnum, Theme} from '../../constant'
import {GeolocationType, GetInfoType} from '../../type'

export type StateModel = {
    lang: LangEnum
    theme: Theme
    geolocation?: GeolocationType
} & Partial<Record<CompanyEnum, GetInfoType[]>>
