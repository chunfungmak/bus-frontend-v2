import i18n from 'i18next'
import Backend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

import { store } from '../store'
import { LangEnum } from '../constant'

const state = store.getState()
export const langList = Object.values(LangEnum)

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: '/locale/{{lng}}.json'
    },
    fallbackLng: 'zh_TW',
    supportedLngs: langList,
    preload: langList,
    lng: state.lang,
    interpolation: {
      escapeValue: false
    }
  })

export default i18n
