import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import localforage from 'localforage'
import { reducer } from './reducer/reducer'

const persistConfig = {
  key: 'bus-frontend-v2',
  storage: localforage
}

const persistedReducer = persistReducer(persistConfig, reducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false
  })
})
export const persistor = persistStore(store)
