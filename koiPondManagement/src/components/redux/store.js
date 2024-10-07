import storage from 'redux-persist/lib/storage'
import { persistStore, persistReducer } from 'redux-persist'
import { rootReducer } from './features/rootReducer'
import { configureStore } from '@reduxjs/toolkit'

const persistConfig = {
    key: 'root',
    storage,
  }
const persistedReducer = persistReducer(persistConfig, rootReducer)

  export const store = configureStore({
    reducer: persistedReducer,
  });

  export const persistor = persistStore(store);