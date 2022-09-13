enum EtaStage {
  ALMOST = '即將到達',
  GONE = '可能已經離開',
  NO_BUS = 'No Bus'
}

export const convertEtaTime = (_time: string, dummy: any): {
  time?: string
  message?: string
} => {
  const eta = new Date(_time).getTime() - new Date().getTime()

  const sign = eta >= 0 ? '' : '-'
  const etaMin = Math.abs(eta) / 1000 / 60
  const mm = Math.floor(etaMin)
  const ss = `${Math.floor((etaMin - mm) * 60)}`.padStart(2, '0')

  const message = eta < -600000 ? EtaStage.NO_BUS : (eta < 0 ? EtaStage.GONE : (eta < 60000 ? EtaStage.ALMOST : undefined))
  const time = message !== EtaStage.NO_BUS ? `${sign}${mm}:${ss}` : undefined
  return {
    time,
    message
  }
}
