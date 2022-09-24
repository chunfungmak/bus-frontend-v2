import {CompanyEnum, LangEnum, Theme} from '../../constant'
import {GeolocationType, GetInfoType} from '../../type'

export interface StateModel {
  lang: LangEnum
  theme: Theme
  geolocation?: GeolocationType
  data: {
    info: Partial<Record<CompanyEnum, GetInfoType[]>>
  }
}
