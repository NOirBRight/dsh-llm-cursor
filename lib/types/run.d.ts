/**
 * One DSH GenerateOptions turn: start or resume a Cursor AgentService/Run.
 */
import type { GenerateOptions, StreamChunk } from '@deepseek-ai/dsh-llm';
import type { CursorCatalogModel } from './client-contract.ts';
import { type CursorImageBytes } from './history.ts';
import { type ParkedRun } from './park.ts';
import { CursorRunRegistry } from './run-registry.ts';
export declare const DEFAULT_HEARTBEAT_INTERVAL_MS: number;
export interface CursorRunOptions {
    apiURL: string;
    accessToken: string;
    catalog: readonly CursorCatalogModel[];
    streamIdleTimeoutMs: number;
    images?: CursorImageBytes;
    debug?: (message: string) => void;
}
/**
 * Start or atomically resume one Cursor provider Run for a DSH model request.
 * @param options - immutable model request and optional cancellation signal.
 * @param runtime - request-scoped endpoint, credential, catalog, and timeout values.
 * @param registry - adapter-owned lifecycle registry shared by its requests.
 * @returns streamed DSH chunks ending in a stop or tool-calls finish.
 */
export declare function runCursorTurn(options: GenerateOptions, runtime: CursorRunOptions, registry: CursorRunRegistry<ParkedRun>): AsyncGenerator<StreamChunk>;
//# sourceMappingURL=run.d.ts.map