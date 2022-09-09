// eslint-disable-next-line @typescript-eslint/no-extraneous-class
import { DataServiceBase } from './data.service.base'
import {
  GetETAType,
  GetInfoType,
  KmbGinericResponseType,
  KmbNameResponseDataType,
  KmbRoutesResponseDataType,
  KmbStopsResponseDataType,
  StopSeqType,
  StopType
} from '../../type'
import axios from 'axios'
import { ApiConfig } from '../../config'
import { CompanyEnum } from '../../constant'
import { KmbEtaResponseDataType } from '../../type/response/eta'

export class KmbDataService implements DataServiceBase {
  private readonly CO: CompanyEnum = CompanyEnum.KMB

  public async getInfo (): Promise<GetInfoType[]> {
    const stopList: Record<string, StopType> = Object.fromEntries(await Promise.all((await axios.get<KmbGinericResponseType<KmbStopsResponseDataType[]>>(ApiConfig.kmb.stops)).data.data.map(stop => {
      const payload: StopType = {
        stopId: stop.stop,
        lat: Number(stop.lat),
        long: Number(stop.long),
        name: {
          en_US: stop.name_en,
          zh_CN: stop.name_sc,
          zh_TW: stop.name_tc
        }
      }
      return [stop.stop, payload]
    })))

    const nameList = (await axios.get<KmbGinericResponseType<KmbNameResponseDataType[]>>(ApiConfig.kmb.name)).data.data

    return (await axios.get<KmbGinericResponseType<KmbRoutesResponseDataType[]>>(ApiConfig.kmb.routes)).data.data.map(result => {
      const payload: GetInfoType = {
        bound: result.bound,
        co: this.CO,
        dest: {
          en_US: result.dest_en,
          zh_CN: result.dest_sc,
          zh_TW: result.dest_tc
        },
        orig: {
          en_US: result.orig_en,
          zh_CN: result.orig_sc,
          zh_TW: result.orig_tc
        },
        route: result.route,
        service_type: result.service_type,
        stops: nameList
          ?.filter(name => name.route === result.route && name.bound === result.bound && name.service_type === result.service_type)
          ?.map(name => {
            const stopSeqPayload: StopSeqType = {
              seq: Number(name.seq),
              ...stopList[name.stop]
            }
            return stopSeqPayload
          }) ?? []
      }
      return payload
    })
  }

  public async getEta (stopId: string, route: string, serviceType?: string): Promise<GetETAType[]> {
    const { data } = (await axios.get<KmbGinericResponseType<KmbEtaResponseDataType[]>>(ApiConfig.kmb.eta + `${stopId}/${route}/${serviceType}`)).data
    return data.map(e => {
      const payload: GetETAType = {
        eta: e.eta,
        seq: e.eta_seq,
        rmk: {
          en_US: e.rmk_en,
          zh_CN: e.rmk_sc,
          zh_TW: e.rmk_tc
        }
      }
      return payload
    })
  }
}
