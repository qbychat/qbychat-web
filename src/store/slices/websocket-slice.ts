import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import WebSocketService from '@/services/websocket/websocket-service.ts';

interface CounterState {
  service: WebSocketService | null;
}

const initialState: CounterState = {
  service: null,
};

const websocketSlice = createSlice({
  name: 'websocket',
  initialState: initialState,
  reducers: {
    connectServer: (state, action: PayloadAction<string>) => {
      if (state.service) {
        // disconnect current service
        state.service.close();
      }
      state.service = new WebSocketService(action.payload);
      // connect to websocket
      state.service.connect();
    },

    disconnectServer: (state) => {
      // close client
      state.service?.close();
      state.service = null;
    },
  },
});

export const { connectServer, disconnectServer } = websocketSlice.actions;

export default websocketSlice;