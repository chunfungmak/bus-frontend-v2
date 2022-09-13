import './i18n'

import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { App } from './view/App'
import { persistor, store } from './store'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)
root.render(
    <Provider store={store} key='Provider'>
        <PersistGate loading={<></>} persistor={persistor} key='PersistGate'>
            <App key='App'/>
        </PersistGate>
    </Provider>
)
