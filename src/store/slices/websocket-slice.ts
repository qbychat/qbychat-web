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
    connect: (state, action: PayloadAction<string>) => {
      state.service = new WebSocketService(action.payload);
      // connect to websocket
      state.service.connect();
    },

    disconnect: (state) => {
      // close client
      state.service?.close();
      state.service = null;
    }
  },
});

export const { connect, disconnect } = websocketSlice.actions;

export default websocketSlice;