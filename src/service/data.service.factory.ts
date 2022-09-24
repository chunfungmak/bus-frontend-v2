import {DataServiceBase, KmbDataService, NwfbDataService} from './data.service'
import {GetAllInfoType, GetETAType} from '../type'
import { CompanyEnum } from '../constant'

export class DataServiceFactory {
  private readonly dataServices: Partial<Record<CompanyEnum, DataServiceBase>>

  constructor () {
    this.dataServices = {
      kmb: new KmbDataService(),
      nwfb: new NwfbDataService(),
      // ctb: new NwfbDataService(),
      // mtr: new MtrDataService()
    }
  }

  public async getAllInfo (): Promise<GetAllInfoType> {
    return Object.fromEntries(await Promise.all(Object.entries(this.dataServices).map(async ([company, dataService]) => {
      const result = await dataService.getInfo()
      return [company, result]
    })))
  }

  public async getETA (company: CompanyEnum, stopId: string, route: string, serviceType?: string): Promise<GetETAType[]> {
    return await this.dataServices[company]?.getEta(stopId, route, serviceType) ?? []
  }
}
