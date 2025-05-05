import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import WebsocketClient from '@/services/websocket/websocket-client.ts';

interface CounterState {
  client: WebsocketClient | null;
}

const initialState: CounterState = {
  client: null,
};

const websocketSlice = createSlice({
  name: 'websocket',
  initialState: initialState,
  reducers: {
    connect: (state, action: PayloadAction<string>) => {
      state.client = new WebsocketClient(action.payload);
      // connect to websocket
      state.client.connect();
    },

    disconnect: (state) => {
      // close client
      state.client?.close();
      state.client = null;
    }
  },
});

export const { connect, disconnect } = websocketSlice.actions;

export default websocketSlice;