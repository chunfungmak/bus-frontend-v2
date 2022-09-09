import { CompanyEnum } from '../constant'
import { LangType } from './lang.type'

export interface StopType {
  stopId: string
  lat: number
  long: number
  name: LangType
}

export interface StopSeqType extends StopType{
  seq: number
}

export interface GetInfoType {
  bound: 'I' | 'O'
  co: CompanyEnum
  dest: LangType
  orig: LangType
  route: string
  service_type: string
  stops: StopSeqType[]
}

export interface GetETAType {
  eta: string
  seq: number
  rmk?: LangType
}

export type GetAllInfoType = Record<CompanyEnum, GetInfoType[]>
