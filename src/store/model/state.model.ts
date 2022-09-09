import { Theme } from '../../constant'
import { GeolocationType } from '../../type'

export interface StateModel {
  theme: Theme
  geolocation?: GeolocationType
}
