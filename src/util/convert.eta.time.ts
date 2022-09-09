export const convertEtaTime = (time: string, dummy: any): string => {
  let eta = new Date(time).getTime() - new Date().getTime()
  const message = eta < 0 ? '可能已經離開 ' : eta < 60000 ? '即將到達 ' : ''
  const sign = eta >= 0 ? '' : '-'
  eta = Math.abs(eta) / 1000 / 60
  const mm = Math.floor(eta)
  const ss = `${Math.floor((eta - mm) * 60)}`.padStart(2, '0')
  return `${message}${sign}${mm}:${ss}`
}
