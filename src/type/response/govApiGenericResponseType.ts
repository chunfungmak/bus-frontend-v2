export interface GovApiGenericResponseType<T> {
  data: T
  generated_timestamp: Date
  type: string
  version: string
}
