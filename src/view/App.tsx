import React, { useEffect } from 'react'
import './App.css'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { useSelector } from 'react-redux'
import { StateModel } from '../store/model/state.model'
import { TabView } from './pages/tab.view'
import { store } from '../store'
import { StateAction } from '../store/reducer'
import { useTranslation } from 'react-i18next'

export function App (): JSX.Element {
  const state = useSelector((state: StateModel) => state)
  const { i18n } = useTranslation()

  useEffect(() => {
    store.dispatch({
      type: StateAction.SET_GEOLOCATION,
      data: null
    })

    const watchID = navigator.geolocation.watchPosition(function (position) {
      store.dispatch({
        type: StateAction.SET_GEOLOCATION,
        data: { lat: position.coords.latitude, long: position.coords.longitude }
      })
    })

    return () => {
      navigator.geolocation.clearWatch(watchID)
    }
  }, [])

  useEffect(() => {
    void i18n.changeLanguage(state.lang)
  }, [state.lang])

  return <>
    <ThemeProvider theme={createTheme({
      palette: {
        mode: state.theme
      }
    })}>
      <CssBaseline />
      <TabView />
    </ThemeProvider>
  </>
}
