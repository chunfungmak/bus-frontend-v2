import React, { useEffect } from 'react'
import './App.css'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { useSelector } from 'react-redux'
import { StateModel } from '../store/model/state.model'
import { Theme } from '../constant'
import { TabView } from './pages/tab.view'
import { store } from '../store'
import { StateAction } from '../store/reducer'

export function App (): JSX.Element {
  const state = useSelector((state: StateModel) => state)

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

  return <>
    <ThemeProvider theme={createTheme({
      palette: {
        mode: state.theme === Theme.DARK ? 'dark' : 'light'
      }
    })}>
      <CssBaseline />
      <TabView />
    </ThemeProvider>
  </>
}
