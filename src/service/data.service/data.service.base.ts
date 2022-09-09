// eslint-disable-next-line @typescript-eslint/no-extraneous-class
import {GetETAType, GetInfoType} from '../../type'

export interface DataServiceBase {
  getInfo: () => GetInfoType[] | Promise<GetInfoType[]>
  getEta: (stopId: string, route: string, serviceType?: string) => GetETAType[] | Promise<GetETAType[]>
}
