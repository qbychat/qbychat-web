import { combineReducers, configureStore } from '@reduxjs/toolkit';
import websocketSlice from '@/store/slices/websocket-slice.ts';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import settingsSlice from '@/store/slices/settings-slice.ts';


const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['settings'],
};

const rootReducer = combineReducers({
  settings: settingsSlice.reducer,
  websocket: websocketSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);


export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch