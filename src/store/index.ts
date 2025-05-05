import { combineReducers, configureStore } from '@reduxjs/toolkit';
import websocketSlice from '@/store/slices/websocket-slice.ts';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';


const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
};

const rootReducer = combineReducers({
  websocket: websocketSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);


export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch