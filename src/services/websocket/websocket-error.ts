import { RPCResponse_Status } from '@/proto/qbychat/websocket/protocol/v1/common.ts';

export class RPCError extends Error {
  status: RPCResponse_Status;

  constructor(status: RPCResponse_Status, message: string | undefined) {
    super(message);
    this.name = "RPCError";
    this.status = status;
  }
}
