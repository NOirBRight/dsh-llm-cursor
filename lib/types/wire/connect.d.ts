/** Connect protocol framing for Cursor AgentService streams. */
export declare const CONNECT_END_STREAM_FLAG = 2;
/** A structured Connect or gRPC status received from Cursor. */
export declare class CursorWireError extends Error {
    /** Connect code name or gRPC numeric status. */
    readonly wireCode: string;
    constructor(
    /** Connect code name or gRPC numeric status. */
    wireCode: string, message: string);
}
export declare function frameConnectMessage(data: Uint8Array, flags?: number): Buffer;
export declare function parseConnectEndStream(data: Uint8Array): Error | null;
export interface ConnectFrame {
    flags: number;
    payload: Uint8Array;
}
/** Pull complete Connect frames from a rolling buffer. */
export declare function takeConnectFrames(buffer: Buffer): {
    frames: ConnectFrame[];
    rest: Buffer;
};
//# sourceMappingURL=connect.d.ts.map