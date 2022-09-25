// eslint-disable-next-line @typescript-eslint/no-extraneous-class
import {DataServiceBase} from './data.service.base'
import {CompanyEnum} from "../../constant";
import {
    GetETAType,
    GetInfoType,
    GovApiGenericResponseType, GovApiEtaResponseDataType, LangType,
    NwfbNameResponseDataType,
    NwfbRoutesResponseDataType,
    NwfbStopsResponseDataType, StopSeqType
} from "../../type";
import axios from "axios";
import {ApiConfig} from "../../config";
import {merge} from "../../util";
import pLimit from 'p-limit'
import {store} from "../../store";
import {StateModel} from "../../store/model/state.model";
import {StateAction} from "../../store/reducer/reducer";

const BOUND_MAP = {
    I: "inbound",
    O: "outbound"
}

export class NwfbDataService implements DataServiceBase {
    private readonly CO: CompanyEnum.NWFB | CompanyEnum.CTB

    private stopList: Record<string, NwfbNameResponseDataType> = {}

    constructor(co: CompanyEnum.NWFB | CompanyEnum.CTB = CompanyEnum.NWFB) {
        this.CO = co
    }

    public async getInfo(): Promise<GetInfoType[]> {
        const memoryInfo = store.getState()[this.CO]
        if (memoryInfo != null) return Object.assign([], memoryInfo)

        const outBoundRouteList = await Promise.all((await axios.get<GovApiGenericResponseType<NwfbRoutesResponseDataType[]>>(ApiConfig[this.CO].routes)).data.data.map(async result => {
            const payload: GetInfoType = {
                bound: 'O',
                co: this.CO,
                dest: {
                    en_US: result.dest_en,
                    zh_CN: result.dest_sc,
                    zh_HK: result.dest_tc
                },
                orig: {
                    en_US: result.orig_en,
                    zh_CN: result.orig_sc,
                    zh_HK: result.orig_tc
                },
                route: result.route,
                service_type: "1",
                stops: []
            }
            return payload
        }))

        const fullRouteList = merge<GetInfoType>(outBoundRouteList, outBoundRouteList.map(el => {
            return {
                ...el,
                bound: 'I',
                dest: el.orig,
                orig: el.dest
            }
        }))

        const limit1 = pLimit(50);
        const limit2 = pLimit(50);
        const resultPayload = await Promise.all(fullRouteList.map(async (el) => {
            return limit1(async () => {
                const stops = await Promise.all(((await axios.get<GovApiGenericResponseType<NwfbStopsResponseDataType[]>>(ApiConfig[this.CO].stop + `${el.route}/${BOUND_MAP[el.bound]}`)).data.data).map(async (el2) => {
                    return limit2(async () => {
                        const stopName = await this.getStopName(el2.stop)
                        const payload: StopSeqType = {
                            seq: Number(el2.seq),
                            stopId: el2.stop,
                            lat: Number(stopName.lat),
                            long: Number(stopName.long),
                            name: {
                                en_US: stopName.name_en,
                                zh_CN: stopName.name_sc,
                                zh_HK: stopName.name_tc
                            }
                        }
                        return payload
                    })
                }))
                return {
                    ...el,
                    stops
                }
            })
        }))

        store.dispatch({
            type: StateAction.SET_DATA_INFO,
            data: {
                [this.CO]: resultPayload
            }
        })
        return resultPayload
    }

    public async getEta(stopId: string, route: string): Promise<GetETAType[]> {
        const {data} = (await axios.get<GovApiGenericResponseType<GovApiEtaResponseDataType[]>>(ApiConfig[this.CO].eta + `${stopId}/${route}`)).data
        return data.map(e => {
            const payload: GetETAType = {
                eta: e.eta,
                seq: e.eta_seq,
                rmk: {
                    en_US: e.rmk_en,
                    zh_CN: e.rmk_sc,
                    zh_HK: e.rmk_tc
                }
            }
            return payload
        })
    }

    private async getStopName(stopId: string): Promise<NwfbNameResponseDataType> {
        const memory = this.stopList[stopId]
        if (memory != null) return memory

        const result = (await axios.get<GovApiGenericResponseType<NwfbNameResponseDataType>>(ApiConfig[this.CO].name + stopId)).data.data
        this.stopList[stopId] = result
        return result
    }
}
