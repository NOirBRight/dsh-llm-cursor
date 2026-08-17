/**
 * Package-owned invariant companion for `dsh-llm-cursor`.
 * @module dsh-llm-cursor/invariant
 */
import type { Context } from '@deepseek-ai/cordis';
export declare const name = "llm-cursor-invariant";
export declare const inject: string[];
export declare const apply: (ctx: Context) => Promise<() => void>;
//# sourceMappingURL=invariant.d.ts.map