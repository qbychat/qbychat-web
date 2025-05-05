import { configureStore } from '@reduxjs/toolkit';
import websocketSlice from '@/store/slices/websocket-slice.ts';

const store = configureStore({
  reducer: {
    websocket: websocketSlice.reducer
  }
});

export default store;