/**
 * HTTP/2 Connect+proto client for AgentService.
 */
import type { ClientHttp2Session, ClientHttp2Stream } from 'node:http2';
export declare const RUN_PATH = "/agent.v1.AgentService/Run";
export interface ConnectStream {
    session: ClientHttp2Session;
    stream: ClientHttp2Stream;
    trailers: Record<string, string>;
    push: (chunk: Buffer) => void;
    waitChunk: () => Promise<Buffer | undefined>;
}
export declare function openConnectSession(origin: string): ClientHttp2Session;
export declare function attachConnectReader(stream: ClientHttp2Stream): {
    trailers: Record<string, string>;
    push: (chunk: Buffer) => void;
    waitChunk: () => Promise<Buffer | undefined>;
};
export declare function openConnectStream(origin: string, path: string, headers: Record<string, string>): ConnectStream;
export declare function readConnectPayloads(waitChunk: () => Promise<Buffer | undefined>, onFrame: (payload: Uint8Array) => void): Promise<void>;
export declare function connectUnary(options: {
    origin: string;
    path: string;
    headers: Record<string, string>;
    body: Uint8Array;
    signal?: AbortSignal;
}): Promise<Uint8Array>;
export declare function grpcStatusError(trailers: Record<string, string>): Error | undefined;
export declare function isResourceExhausted(error: unknown): boolean;
//# sourceMappingURL=http2.d.ts.map