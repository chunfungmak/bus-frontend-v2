import { LangEnum, Theme } from '../../constant'
import { GeolocationType } from '../../type'

export interface StateModel {
  lang: LangEnum
  theme: Theme
  geolocation?: GeolocationType
}
