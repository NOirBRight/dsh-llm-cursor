window.__ModuleLoader__.load({
	id: "dsh-llm-cursor",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		let react_dom = require("react-dom");
		//#region src/client-contract.ts
		/** Browser-safe constants and JSON decoders shared by the Host and client plugin faces. */
		/** Settings namespace owned by the Cursor plugin. */
		const CURSOR_SETTINGS_NAMESPACE = "llm-cursor";
		/** Private Connection RPC channel used by this package's Host and Web faces. */
		const CURSOR_RPC_CHANNEL = "/cursor";
		/** Begin a Host-owned Deep Control sign-in. */
		const CURSOR_AUTH_START_ENDPOINT = "auth/start";
		/** Cancel one Host-owned login attempt. */
		const CURSOR_AUTH_CANCEL_ENDPOINT = "auth/cancel";
		/** Secret-free login snapshot. */
		const CURSOR_AUTH_STATUS_ENDPOINT = "auth/status";
		/** Read the whitelist-decoded Cursor settings snapshot. */
		const CURSOR_SETTINGS_READ_ENDPOINT = "settings/read";
		/** Delete the Host session file. */
		const CURSOR_AUTH_LOGOUT_ENDPOINT = "auth/logout";
		/** Secret-free subscription-usage snapshot. */
		const CURSOR_USAGE_ENDPOINT = "usage/read";
		/** Account model list. */
		const CURSOR_MODELS_ENDPOINT = "models/list";
		/** Atomic settings-save endpoint inside {@link CURSOR_RPC_CHANNEL}. */
		const CURSOR_SAVE_ENDPOINT = "settings/save";
		/**
		* Offline fallback when the account catalog cannot be read.
		* Live ids come from GetUsableModels after sign-in.
		*/
		const CURSOR_CATALOG = Object.freeze([Object.freeze({
			id: "composer-2.5",
			name: "Composer 2.5",
			thinking: true,
			vision: true,
			contextWindow: 2e5
		})]);
		function isRecord(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}
		const TOKEN_FIELD = /^(?:accessToken|refreshToken|access_token|refresh_token|id_token|idToken|token)$/iu;
		function hasTokenFields(value) {
			return Object.keys(value).some((key) => TOKEN_FIELD.test(key));
		}
		function optionalNonEmptyString(value) {
			return value === void 0 || typeof value === "string" && value.length > 0;
		}
		const CURSOR_EFFORTS = /* @__PURE__ */ new Set([
			"none",
			"low",
			"medium",
			"high",
			"xhigh",
			"max"
		]);
		function decodeCursorCatalogModel(value) {
			if (!isRecord(value)) return void 0;
			const id = value["id"];
			if (typeof id !== "string" || id.length === 0) return void 0;
			const name = value["name"];
			const thinking = value["thinking"];
			const vision = value["vision"];
			const maxMode = value["maxMode"];
			const contextWindow = value["contextWindow"];
			const defaultEffort = value["defaultEffort"];
			const fast = value["fast"];
			const variants = value["variants"];
			const displayModelId = value["displayModelId"];
			if (name !== void 0 && (typeof name !== "string" || name.length === 0)) return void 0;
			if (thinking !== void 0 && typeof thinking !== "boolean") return void 0;
			if (vision !== void 0 && typeof vision !== "boolean") return void 0;
			if (maxMode !== void 0 && typeof maxMode !== "boolean") return void 0;
			if (contextWindow !== void 0 && (typeof contextWindow !== "number" || !Number.isInteger(contextWindow) || contextWindow <= 0)) return void 0;
			if (defaultEffort !== void 0 && (typeof defaultEffort !== "string" || !CURSOR_EFFORTS.has(defaultEffort))) return;
			if (fast !== void 0 && typeof fast !== "boolean") return void 0;
			if (displayModelId !== void 0 && (typeof displayModelId !== "string" || displayModelId.length === 0)) return;
			let decodedVariants;
			if (variants !== void 0) {
				if (!Array.isArray(variants)) return void 0;
				decodedVariants = [];
				for (const entry of variants) {
					const variant = decodeCursorModelVariant(entry);
					if (variant === void 0) return void 0;
					decodedVariants.push(variant);
				}
			}
			return {
				id,
				...name === void 0 ? {} : { name },
				...thinking === void 0 ? {} : { thinking },
				...vision === void 0 ? {} : { vision },
				...maxMode === void 0 ? {} : { maxMode },
				...contextWindow === void 0 ? {} : { contextWindow },
				...defaultEffort === void 0 ? {} : { defaultEffort },
				...decodedVariants === void 0 ? {} : { variants: decodedVariants },
				...displayModelId === void 0 ? {} : { displayModelId }
			};
		}
		function decodeCursorModelVariant(value) {
			if (!isRecord(value)) return void 0;
			const wireId = value["wireId"];
			if (typeof wireId !== "string" || wireId.length === 0) return void 0;
			const effort = value["effort"];
			const fast = value["fast"];
			const maxMode = value["maxMode"];
			if (effort !== void 0 && (typeof effort !== "string" || !CURSOR_EFFORTS.has(effort))) return;
			if (fast !== void 0 && typeof fast !== "boolean") return void 0;
			if (maxMode !== void 0 && typeof maxMode !== "boolean") return void 0;
			return {
				wireId,
				...effort === void 0 ? {} : { effort },
				...fast === void 0 ? {} : { fast },
				...maxMode === void 0 ? {} : { maxMode }
			};
		}
		function decodeCursorSettings(value) {
			if (!isRecord(value)) return void 0;
			const streamIdleTimeoutMs = value["streamIdleTimeoutMs"];
			if (typeof streamIdleTimeoutMs !== "number" || !Number.isFinite(streamIdleTimeoutMs) || streamIdleTimeoutMs <= 0) return;
			const models = value["models"];
			if (models !== void 0) {
				if (!Array.isArray(models)) return void 0;
				const decoded = [];
				for (const entry of models) {
					const model = decodeCursorCatalogModel(entry);
					if (model === void 0) return void 0;
					decoded.push(model);
				}
				return {
					streamIdleTimeoutMs,
					models: decoded
				};
			}
			return { streamIdleTimeoutMs };
		}
		function decodeCursorAuthStartReply(value) {
			if (!isRecord(value) || hasTokenFields(value) || typeof value["ok"] !== "boolean") return void 0;
			if (value["ok"] === true) {
				const attemptId = value["attemptId"];
				const authorizationUrl = value["authorizationUrl"];
				if (attemptId === void 0 && authorizationUrl === void 0) return { ok: true };
				if (typeof attemptId !== "string" || attemptId.length === 0 || typeof authorizationUrl !== "string" || authorizationUrl.length === 0) return void 0;
				return {
					ok: true,
					attemptId,
					authorizationUrl
				};
			}
			if (value["retryable"] !== true || typeof value["message"] !== "string" || value["message"].length === 0) return;
			return {
				ok: false,
				retryable: true,
				message: value["message"]
			};
		}
		function decodeCursorAuthStatus(value) {
			if (!isRecord(value) || hasTokenFields(value) || typeof value["loggedIn"] !== "boolean") return void 0;
			const attemptId = value["attemptId"];
			const attempt = value["attempt"];
			const email = value["email"];
			const expiresAt = value["expiresAt"];
			const message = value["message"];
			if (!optionalNonEmptyString(attemptId) || !optionalNonEmptyString(email) || !optionalNonEmptyString(expiresAt) || !optionalNonEmptyString(message)) return void 0;
			if (attempt !== void 0 && attempt !== "pending" && attempt !== "succeeded" && attempt !== "failed" && attempt !== "cancelled") return void 0;
			return {
				loggedIn: value["loggedIn"],
				...attemptId === void 0 ? {} : { attemptId },
				...attempt === void 0 ? {} : { attempt },
				...email === void 0 ? {} : { email },
				...expiresAt === void 0 ? {} : { expiresAt },
				...message === void 0 ? {} : { message }
			};
		}
		function decodeCursorAuthLogoutReply(value) {
			if (!isRecord(value) || hasTokenFields(value) || value["ok"] !== true) return void 0;
			return { ok: true };
		}
		function decodeCursorUsageView(value) {
			if (!isRecord(value) || hasTokenFields(value)) return void 0;
			const fetchedAt = value["fetchedAt"];
			const windows = value["windows"];
			if (typeof fetchedAt !== "string" || fetchedAt.length === 0) return void 0;
			if (!Array.isArray(windows) || windows.length === 0) return void 0;
			const decoded = [];
			for (const entry of windows) {
				if (!isRecord(entry)) return void 0;
				const id = entry["id"];
				const used = entry["used"];
				const limit = entry["limit"];
				const period = entry["period"];
				const unit = entry["unit"];
				if (typeof id !== "string" || id.length === 0) return void 0;
				if (typeof used !== "number" || !Number.isFinite(used) || used < 0) return void 0;
				if (typeof limit !== "number" || !Number.isFinite(limit) || limit < 0) return void 0;
				if (period !== void 0 && (typeof period !== "string" || period.length === 0)) return void 0;
				if (unit !== void 0 && unit !== "percent") return void 0;
				decoded.push({
					id,
					used,
					limit,
					...period === void 0 ? {} : { period },
					...unit === void 0 ? {} : { unit }
				});
			}
			const resetsAt = value["resetsAt"];
			if (resetsAt !== void 0 && (typeof resetsAt !== "string" || resetsAt.length === 0)) return void 0;
			return {
				fetchedAt,
				windows: decoded,
				...resetsAt === void 0 ? {} : { resetsAt }
			};
		}
		function decodeCursorUsageReply(value) {
			if (!isRecord(value) || hasTokenFields(value)) return void 0;
			const status = value["status"];
			if (status === "logged-out" || status === "unsupported") return { status };
			if (status !== "ok") return void 0;
			const usage = decodeCursorUsageView(value["usage"]);
			if (usage === void 0) return void 0;
			return {
				status: "ok",
				usage
			};
		}
		function decodeCursorModelsReply(value) {
			if (!isRecord(value) || hasTokenFields(value)) return void 0;
			const models = value["models"];
			if (!Array.isArray(models)) return void 0;
			const decoded = [];
			for (const entry of models) {
				const model = decodeCursorCatalogModel(entry);
				if (model === void 0) return void 0;
				decoded.push(model);
			}
			return { models: decoded };
		}
		function decodeCursorSaveResult(value) {
			if (!isRecord(value) || hasTokenFields(value) || !Number.isSafeInteger(value["revision"])) return void 0;
			const revision = value["revision"];
			if (revision < 0) return void 0;
			const settings = decodeCursorSettings(value["settings"]);
			if (settings === void 0) return void 0;
			return {
				settings,
				revision
			};
		}
		//#endregion
		//#region node_modules/.pnpm/dsh-llm-providers-ui@file+..+..+..+..+.dsh-lab+tmp+dsh-llm-providers-ui-0.1.12-preview._66f05e434ffcf633f8b828e8f535ff70/node_modules/dsh-llm-providers-ui/lib/usage-readers.js
		/** Bundle-safe quota decoders, RPC readers, and browser cache helpers; no ModuleLoader wrapper or reactive store. */
		/**
		* Wire error code the Host answers when the provider credential is missing or
		* unusable (mirrors `INVALID_CREDENTIAL_CODE` in `@deepseek-ai/dsh-llm`, which a
		* browser bundle cannot import). Mapped to `logged-out` so a provider without a
		* usable credential never keeps serving the previous account's quota.
		*/
		const INVALID_CREDENTIAL_CODE = "INVALID_CREDENTIAL";
		/** Whether one RPC failure means "this provider has no usable credential". */
		function credentialFailure(error) {
			return error.code === INVALID_CREDENTIAL_CODE;
		}
		/** Plain-object guard shared by the reader factories and the sidebar cache validator. */
		function recordUsageValue$1(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value) ? value : void 0;
		}
		const SECRET_KEY = /^(?:accessToken|refreshToken|access_token|refresh_token|id_token|idToken|token|apiKey|api_key)$/iu;
		/** Reject any secret-shaped field before a provider response enters UI state. */
		function secretFree(value) {
			if (Array.isArray(value)) return value.every(secretFree);
			const item = recordUsageValue$1(value);
			if (item === void 0) return true;
			return Object.entries(item).every(([key, child]) => !SECRET_KEY.test(key) && secretFree(child));
		}
		/** Non-empty string guard shared by the reader factories and the sidebar cache validator. */
		function nonEmptyString$1(value) {
			return typeof value === "string" && value.length > 0;
		}
		function finiteNumber$1(value) {
			return typeof value === "number" && Number.isFinite(value);
		}
		/** Non-negative finite number guard shared by the reader factories and the sidebar cache validator. */
		function nonNegativeNumber$1(value) {
			return finiteNumber$1(value) && value >= 0;
		}
		function displayNumber(value) {
			return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
		}
		function percentage(value) {
			return Math.round(Math.max(0, Math.min(100, value)));
		}
		function percentageText(value) {
			return displayNumber(percentage(value)) + "%";
		}
		const SHORT_LABELS = [
			[/five|5h|5-hour/u, "5h"],
			[/two-hour|2-hour|2h/u, "2h"],
			[/session/u, "S"],
			[/week/u, "W"],
			[/month/u, "M"],
			[/credit/u, "Cr"],
			[/agent/u, "A"],
			[/daily|day/u, "D"],
			[/local/u, "L"],
			[/other/u, "Oth"]
		];
		function shortLabel(value) {
			const normalized = value.toLowerCase();
			if (/^\d+h$/u.test(normalized)) return normalized;
			return SHORT_LABELS.find(([pattern]) => pattern.test(normalized))?.[1] ?? value.slice(0, 4);
		}
		function windowLabel(id, period) {
			return nonEmptyString$1(period) ? period : id;
		}
		function remainingWindow(input) {
			const remaining = input.limit === 0 ? void 0 : percentage(100 * (1 - input.used / input.limit));
			return {
				id: input.id,
				label: input.label,
				shortLabel: shortLabel(input.label),
				...remaining === void 0 ? { valueText: displayNumber(Math.max(0, input.limit - input.used)) + " / " + displayNumber(input.limit) } : {
					remainingPercent: remaining,
					valueText: percentageText(remaining)
				},
				...input.resetsAt === void 0 ? {} : { resetsAt: input.resetsAt }
			};
		}
		function usageResult(value, decode) {
			const response = recordUsageValue$1(value);
			if (response === void 0 || !secretFree(response)) return {
				status: "error",
				message: "malformed usage response"
			};
			if (response.status === "unsupported") return { status: "unsupported" };
			if (response.status === "logged-out") return { status: "logged-out" };
			if (response.status !== "ok") return {
				status: "error",
				message: "unknown usage status"
			};
			const usage = recordUsageValue$1(response.usage);
			const decoded = usage === void 0 ? void 0 : decode(usage);
			return decoded === void 0 ? {
				status: "error",
				message: "malformed usage response"
			} : {
				status: "ready",
				...decoded
			};
		}
		function decodePercentUsage(usage) {
			if (!nonEmptyString$1(usage.fetchedAt) || !Array.isArray(usage.windows) || usage.windows.length === 0) return void 0;
			const viewReset = usage.resetsAt;
			if (viewReset !== void 0 && !nonEmptyString$1(viewReset)) return void 0;
			const windows = [];
			for (const value of usage.windows) {
				const item = recordUsageValue$1(value);
				if (item === void 0 || !nonEmptyString$1(item.id) || !nonNegativeNumber$1(item.used) || !nonNegativeNumber$1(item.limit)) return void 0;
				if (item.period !== void 0 && !nonEmptyString$1(item.period)) return void 0;
				if (item.unit !== void 0 && item.unit !== "percent") return void 0;
				if (item.resetsAt !== void 0 && !nonEmptyString$1(item.resetsAt)) return void 0;
				const resetsAt = item.resetsAt ?? viewReset;
				windows.push(remainingWindow({
					id: item.id,
					label: windowLabel(item.id, item.period),
					used: item.used,
					limit: item.unit === "percent" ? 100 : item.limit,
					...resetsAt === void 0 ? {} : { resetsAt }
				}));
			}
			return {
				fetchedAt: usage.fetchedAt,
				windows
			};
		}
		async function readUsage(rpc, channel, payload, signal, decode) {
			const result = await rpc.call(channel, "usage/read", payload, signal);
			if (result.ok) return usageResult(result.value, decode);
			if (credentialFailure(result.error)) return { status: "logged-out" };
			return {
				status: "error",
				message: result.error.message
			};
		}
		/** Create the Cursor quota reader declared by the Cursor client plugin. */
		function createCursorUsageReader() {
			return {
				providerKey: "llm-cursor",
				name: "Cursor",
				read: async (rpc, refresh, signal) => {
					const first = await readUsage(rpc, "/cursor", refresh ? { refresh: true } : {}, signal, decodePercentUsage);
					if (first.status !== "unsupported") return first;
					return readUsage(rpc, "/cursor", { refresh: true }, signal, decodePercentUsage);
				}
			};
		}
		const USAGE_CACHE_KEY$1 = "dsh-llm-providers-ui:usage-cache";
		/**
		* Browser last-good usage cache shared across bundles: the sidebar store and
		* each provider Settings card bundle their own copy of this module, so the
		* module-level memory map below is per-bundle while storage is shared.
		* Readable storage is authoritative, including empty after invalidation; memory
		* is only a fallback while storage is unavailable. Stale status persists
		* honestly, and collapsed-header headlines never replace a full multi-window
		* summary (a later full read upgrades a headline).
		*/
		let memoryUsageCache$1 = /* @__PURE__ */ new Map();
		/** Whether a ready or stale summary retains displayable usage windows.
		* @param summary - Current or retained provider usage.
		* @returns Whether its windows can be displayed and persisted.
		*/
		function hasUsageData$1(summary) {
			return summary !== void 0 && summary.windows.length > 0 && (summary.status === "ready" || summary.status === "stale");
		}
		function cachedSummary$1(value) {
			const item = recordUsageValue$1(value);
			if (item === void 0 || !nonEmptyString$1(item.providerKey) || !nonEmptyString$1(item.name)) return void 0;
			const status = item.status;
			if (status !== "ready" && status !== "stale") return void 0;
			if (!Array.isArray(item.windows) || item.windows.length === 0) return void 0;
			const windows = [];
			for (const windowValue of item.windows) {
				const quotaWindow = recordUsageValue$1(windowValue);
				if (quotaWindow === void 0 || !nonEmptyString$1(quotaWindow.id) || !nonEmptyString$1(quotaWindow.label) || !nonEmptyString$1(quotaWindow.shortLabel) || !nonEmptyString$1(quotaWindow.valueText)) return void 0;
				if (quotaWindow.remainingPercent !== void 0 && (!nonNegativeNumber$1(quotaWindow.remainingPercent) || quotaWindow.remainingPercent > 100)) return void 0;
				if (quotaWindow.resetsAt !== void 0 && !nonEmptyString$1(quotaWindow.resetsAt)) return void 0;
				windows.push({
					id: quotaWindow.id,
					label: quotaWindow.label,
					shortLabel: quotaWindow.shortLabel,
					valueText: quotaWindow.valueText,
					...quotaWindow.remainingPercent === void 0 ? {} : { remainingPercent: quotaWindow.remainingPercent },
					...quotaWindow.resetsAt === void 0 ? {} : { resetsAt: quotaWindow.resetsAt }
				});
			}
			return {
				providerKey: item.providerKey,
				name: item.name,
				status,
				windows,
				...nonEmptyString$1(item.fetchedAt) ? { fetchedAt: item.fetchedAt } : {}
			};
		}
		/** Readable storage backends. A backend that throws on read is unusable and skipped. */
		function usageStorageBackends$1() {
			const backends = [];
			for (const name of ["localStorage", "sessionStorage"]) try {
				const backend = globalThis[name];
				if (backend === void 0 || backend === null) continue;
				backend.getItem(USAGE_CACHE_KEY$1);
				backends.push(backend);
			} catch {}
			return backends;
		}
		function storageRead$1() {
			const backends = usageStorageBackends$1();
			if (backends.length === 0) return {
				available: false,
				raw: null
			};
			for (const backend of backends) try {
				const raw = backend.getItem(USAGE_CACHE_KEY$1);
				if (raw !== null) return {
					available: true,
					raw
				};
			} catch {}
			return {
				available: true,
				raw: null
			};
		}
		function storageWrite$1(value) {
			for (const backend of usageStorageBackends$1()) try {
				backend.setItem(USAGE_CACHE_KEY$1, value);
			} catch {}
		}
		function parseUsageCache$1(raw) {
			const cached = /* @__PURE__ */ new Map();
			if (raw === null) return cached;
			try {
				const parsed = JSON.parse(raw);
				if (!Array.isArray(parsed)) return cached;
				for (const value of parsed) {
					const item = cachedSummary$1(value);
					if (item !== void 0) cached.set(item.providerKey, item);
				}
			} catch {}
			return cached;
		}
		/** Persistable copy: status stays ready/stale as the caller holds it, never laundered to ready. */
		function persistableUsage$1(summary) {
			return {
				providerKey: summary.providerKey,
				name: summary.name,
				status: summary.status,
				windows: summary.windows,
				...summary.fetchedAt === void 0 ? {} : { fetchedAt: summary.fetchedAt }
			};
		}
		/** A collapsed-header single window, never a full multi-window summary. */
		function isHeadlineOnly$1(summary) {
			return summary.windows.length === 1 && summary.windows[0]?.id === "headline";
		}
		function writeUsageCache$1(current) {
			const entries = [...current.values()].filter(hasUsageData$1);
			const { available, raw } = storageRead$1();
			if (!available) {
				for (const item of entries) memoryUsageCache$1.set(item.providerKey, persistableUsage$1(item));
				return;
			}
			const merged = parseUsageCache$1(raw);
			for (const item of entries) {
				const previous = merged.get(item.providerKey);
				if (previous !== void 0 && !isHeadlineOnly$1(previous) && isHeadlineOnly$1(item)) continue;
				merged.set(item.providerKey, persistableUsage$1(item));
			}
			memoryUsageCache$1 = new Map(merged);
			if (merged.size === 0) return;
			storageWrite$1(JSON.stringify([...merged.values()]));
		}
		function dropPersistedUsageKeys$1(keys) {
			const drop = new Set(keys);
			for (const key of drop) memoryUsageCache$1.delete(key);
			const { available, raw } = storageRead$1();
			if (!available || raw === null) return;
			let parsed;
			try {
				parsed = JSON.parse(raw);
			} catch {
				return;
			}
			if (!Array.isArray(parsed)) return;
			const kept = parsed.filter((value) => {
				const item = recordUsageValue$1(value);
				return item === void 0 || !nonEmptyString$1(item.providerKey) || !drop.has(item.providerKey);
			});
			if (kept.length === parsed.length) return;
			storageWrite$1(JSON.stringify(kept));
		}
		function rememberCachedUsage$1(summary) {
			if (!hasUsageData$1(summary)) return;
			writeUsageCache$1(/* @__PURE__ */ new Map([[summary.providerKey, summary]]));
		}
		/**
		* Collapsed-header last-good quota for first paint. Ignores headlines without
		* a finite in-range remaining percent so missing quota renders no meter, never
		* a zero bar. Never replaces a cached full multi-window summary, and records
		* no fetchedAt: a headline is display data, not a fetch, so freshness checks
		* treat it as expired and refetch.
		*/
		function rememberHeadlineQuota$1(providerKey, name, quota) {
			if (quota?.remainingPercent === void 0 || !Number.isFinite(quota.remainingPercent)) return;
			const remainingPercent = Math.round(quota.remainingPercent * 10) / 10;
			if (remainingPercent < 0 || remainingPercent > 100) return;
			const label = quota.label ?? "Quota";
			rememberCachedUsage$1({
				providerKey,
				name,
				status: "ready",
				windows: [{
					id: "headline",
					label,
					shortLabel: label,
					valueText: String(remainingPercent) + "%",
					remainingPercent
				}]
			});
		}
		/** Ordinary Cursor request budget. */
		const CURSOR_DEFAULT_CONTEXT_WINDOW = 2e5;
		/** Grok 4.5 / 4.6 default context. */
		const CURSOR_GROK_CONTEXT_WINDOW = 256e3;
		/** GPT-5.6 default context. */
		const CURSOR_GPT_56_CONTEXT_WINDOW = 272e3;
		/** Claude Fable 5 / Opus 5 default context. */
		const CURSOR_CLAUDE_5_CONTEXT_WINDOW = 3e5;
		/** DSH budget for Max rows. Cursor does not disclose the real ceiling. */
		const CURSOR_MAX_CONTEXT_WINDOW = 1e6;
		function isCursorMaxRow(id) {
			return id.endsWith("-1m") && id.length > 3;
		}
		/** Peel a trailing `-<n>k` / `-<n>m` context tier. Product names like `-max` stay. */
		function parseCursorContextSuffix(id) {
			const match = /-(\d+)(k|m)$/iu.exec(id);
			if (match === null || match.index === 0) return { base: id };
			const n = Number(match[1]);
			const unit = match[2].toLowerCase();
			return {
				base: id.slice(0, match.index),
				tokens: unit === "m" ? n * 1e6 : n * 1e3
			};
		}
		function isCursorContextRow(id) {
			return parseCursorContextSuffix(id).tokens !== void 0;
		}
		function cursorBaseFamilyId(id) {
			return parseCursorContextSuffix(id).base;
		}
		const CURSOR_EFFORT_ORDER = [
			"none",
			"low",
			"medium",
			"high",
			"xhigh",
			"max"
		];
		const CURSOR_EFFORT_LABELS = {
			none: "None",
			low: "Low",
			medium: "Medium",
			high: "High",
			xhigh: "Extra High",
			max: "Max"
		};
		const OTHER_EFFORTS = /* @__PURE__ */ new Set([
			"none",
			"low",
			"medium",
			"high",
			"xhigh"
		]);
		/** Effort tokens at the end of a wire id. `-extra-high` must precede `-high`. */
		const EFFORT_SUFFIXES = [
			{
				suffix: "-extra-high",
				effort: "xhigh"
			},
			{
				suffix: "-none",
				effort: "none"
			},
			{
				suffix: "-low",
				effort: "low"
			},
			{
				suffix: "-medium",
				effort: "medium"
			},
			{
				suffix: "-high",
				effort: "high"
			},
			{
				suffix: "-xhigh",
				effort: "xhigh"
			},
			{
				suffix: "-max",
				effort: "max"
			}
		];
		/** Strip `-thinking` (a Cursor parameter, not a family) and map `cursor-grok-*` to `grok-*`. */
		function canonicalizeFamilyId(family) {
			const next = family.replace(/-thinking(?=-|$)/gu, "");
			const fast = next.endsWith("-fast") && next.length > 5;
			const core = fast ? next.slice(0, -5) : next;
			const renamed = core.startsWith("cursor-grok-") ? `grok-${core.slice(12)}` : core;
			return fast ? `${renamed}-fast` : renamed;
		}
		/**
		* Peel Fast, then `-thinking` (before or after effort), then the effort token.
		* Live SKUs use both `family-thinking-high` and `family-high-thinking`.
		*/
		function splitCursorWireId(id) {
			let rest = id;
			let fast = false;
			if (rest.endsWith("-fast") && rest.length > 5) {
				fast = true;
				rest = rest.slice(0, -5);
			}
			rest = rest.replace(/-thinking(?=-|$)/gu, "");
			if (rest.length === 0) return {
				family: canonicalizeFamilyId(id),
				fast
			};
			for (const entry of EFFORT_SUFFIXES) {
				if (!rest.endsWith(entry.suffix) || rest.length <= entry.suffix.length) continue;
				const base = rest.slice(0, -entry.suffix.length);
				return {
					family: canonicalizeFamilyId(fast ? `${base}-fast` : base),
					effort: entry.effort,
					fast
				};
			}
			return {
				family: canonicalizeFamilyId(fast ? `${rest}-fast` : rest),
				fast
			};
		}
		function cleanFamilyName(name) {
			return name.replace(/\s+1M\b/giu, "").replace(/\s+Thinking\b/giu, "").replace(/\s+(?:None|Low|Medium|High|Extra High)\b/giu, "").replace(/\s+/gu, " ").trim();
		}
		/**
		* Use `displayModelId` as the family key only when it is a clean family id.
		* GetUsableModels often copies the suffix-encoded SKU into displayModelId;
		* treating that as a family would keep every thinking level as its own row
		* and produce `-fast-fast` ids.
		*/
		function pinnedFamilyFromDisplay(displayModelId, wire) {
			if (displayModelId === void 0 || displayModelId.length === 0) return void 0;
			const display = splitCursorWireId(displayModelId);
			if (display.effort !== void 0) return void 0;
			if (display.family === wire.family) return void 0;
			if (wire.fast) return canonicalizeFamilyId(`${clusterOf(display.family)}-fast`);
			return clusterOf(display.family);
		}
		function rawRowsOf(models) {
			const rows = [];
			for (const model of models) {
				if (model.variants !== void 0 && model.variants.length > 0) {
					for (const variant of model.variants) {
						const split = splitCursorWireId(variant.wireId);
						const effort = variant.effort ?? split.effort;
						const fast = variant.fast === true || split.fast;
						const pinned = pinnedFamilyFromDisplay(model.displayModelId, {
							...split,
							fast
						});
						const family = isCursorContextRow(model.id) ? model.id : pinned ?? split.family;
						rows.push({
							wireId: variant.wireId,
							name: model.name ?? model.id,
							thinking: model.thinking === true,
							maxMode: variant.maxMode === true,
							family,
							...effort === void 0 ? {} : { effort },
							fast,
							pinnedFamily: pinned !== void 0
						});
					}
					continue;
				}
				const split = splitCursorWireId(model.id);
				const pinned = pinnedFamilyFromDisplay(model.displayModelId, split);
				const family = pinned ?? split.family;
				rows.push({
					wireId: model.id,
					name: model.name ?? model.id,
					thinking: model.thinking === true,
					maxMode: model.maxMode === true,
					family,
					...split.effort === void 0 ? {} : { effort: split.effort },
					fast: split.fast,
					pinnedFamily: pinned !== void 0
				});
			}
			return refineMaxProductNames(rows);
		}
		function reattachMaxProduct(family) {
			return family.endsWith("-fast") ? `${family.slice(0, -5)}-max-fast` : `${family}-max`;
		}
		/** Keep `-max` as a product name unless the family also advertises other thinking levels. */
		function refineMaxProductNames(rows) {
			const byFamily = /* @__PURE__ */ new Map();
			for (const row of rows) {
				const list = byFamily.get(row.family) ?? [];
				list.push(row);
				byFamily.set(row.family, list);
			}
			const out = [];
			for (const [family, members] of byFamily) {
				if (members.some((member) => member.pinnedFamily)) {
					out.push(...members);
					continue;
				}
				const efforts = new Set(members.map((member) => member.effort).filter((effort) => effort !== void 0));
				if (![...OTHER_EFFORTS].some((effort) => efforts.has(effort)) && efforts.has("max")) {
					for (const member of members) {
						if (member.effort !== "max") {
							out.push(member);
							continue;
						}
						out.push({
							wireId: member.wireId,
							name: member.name,
							thinking: member.thinking,
							maxMode: member.maxMode,
							family: reattachMaxProduct(family),
							fast: member.fast,
							pinnedFamily: false
						});
					}
					continue;
				}
				out.push(...members);
			}
			return out;
		}
		function clusterOf(family) {
			const base = cursorBaseFamilyId(canonicalizeFamilyId(family));
			return base.endsWith("-fast") ? base.slice(0, -5) : base;
		}
		function wireHasThinking(wireId) {
			return /-thinking(?:-|$)/u.test(wireId);
		}
		const BRAND_RANK = {
			cursor: 1,
			openai: 2,
			anthropic: 3,
			google: 4,
			xai: 5,
			deepseek: 6,
			moonshot: 7,
			zhipu: 8,
			minimax: 9,
			mistral: 10,
			meta: 11,
			alibaba: 12,
			other: 99
		};
		function isCursorGrokId(id) {
			return id.startsWith("grok-4.5") || id.startsWith("grok-4.6") || id.startsWith("cursor-grok-");
		}
		/** Infer the lab / first-party brand from a family id and display name. */
		function brandOfCursorFamily(familyId, name = "") {
			const id = clusterOf(familyId).toLowerCase();
			const label = name.toLowerCase();
			if (id === "default" || id === "auto" || id.startsWith("composer") || id.startsWith("cursor-")) return "cursor";
			if (isCursorGrokId(id) || /\bcursor grok\b/u.test(label)) return "cursor";
			if (id.startsWith("grok") || /\bgrok\b/u.test(label)) return "xai";
			if (id.startsWith("gpt") || id.startsWith("chatgpt") || /^o[1-9]/u.test(id) || /\bgpt-/u.test(label)) return "openai";
			if (id.startsWith("claude") || label.includes("claude")) return "anthropic";
			if (id.startsWith("gemini") || label.includes("gemini")) return "google";
			if (id.startsWith("deepseek") || label.includes("deepseek")) return "deepseek";
			if (id.startsWith("kimi") || label.includes("kimi")) return "moonshot";
			if (id.startsWith("glm") || label.includes("glm")) return "zhipu";
			if (id.startsWith("minimax") || label.includes("minimax")) return "minimax";
			if (id.startsWith("mistral") || id.startsWith("codestral") || id.startsWith("devstral") || id.startsWith("magistral") || id.startsWith("pixtral")) return "mistral";
			if (id.startsWith("llama") || label.includes("llama")) return "meta";
			if (id.startsWith("qwen") || label.includes("qwen")) return "alibaba";
			return "other";
		}
		const CURSOR_BRAND_LABELS = {
			cursor: "Cursor",
			openai: "OpenAI",
			anthropic: "Anthropic",
			google: "Google",
			xai: "xAI",
			deepseek: "DeepSeek",
			moonshot: "Moonshot",
			zhipu: "Zhipu",
			minimax: "MiniMax",
			mistral: "Mistral",
			meta: "Meta",
			alibaba: "Alibaba",
			other: "Other"
		};
		/** Partition an already-sorted catalog into brand sections for the picker. */
		function cursorBrandSections(models) {
			const sections = [];
			const index = /* @__PURE__ */ new Map();
			for (const model of models) {
				const brand = brandOfCursorFamily(model.id, model.name ?? "");
				let section = index.get(brand);
				if (section === void 0) {
					section = {
						brand,
						label: CURSOR_BRAND_LABELS[brand],
						models: []
					};
					index.set(brand, section);
					sections.push(section);
				}
				section.models.push(model);
			}
			return sections;
		}
		function compareFamilyName(left, right) {
			return left.localeCompare(right, "en", {
				numeric: true,
				sensitivity: "base"
			});
		}
		function sortGroupedFamilies(grouped, firstIndex, sort) {
			const clusterRank = (id) => {
				const cluster = clusterOf(id);
				const standard = firstIndex.get(cluster) ?? Number.POSITIVE_INFINITY;
				const fast = firstIndex.get(`${cluster}-fast`) ?? Number.POSITIVE_INFINITY;
				return Math.min(standard, fast);
			};
			return [...grouped].sort((left, right) => {
				if (left.id === "default" || left.id === "auto") return -1;
				if (right.id === "default" || right.id === "auto") return 1;
				if (sort === "brand") {
					const brand = BRAND_RANK[brandOfCursorFamily(left.id, left.name ?? "")] - BRAND_RANK[brandOfCursorFamily(right.id, right.name ?? "")];
					if (brand !== 0) return brand;
					const family = compareFamilyName(clusterOf(left.id), clusterOf(right.id));
					if (family !== 0) return family;
				} else {
					const rank = clusterRank(left.id) - clusterRank(right.id);
					if (rank !== 0) return rank;
				}
				const leftFast = cursorBaseFamilyId(left.id).endsWith("-fast") ? 1 : 0;
				const rightFast = cursorBaseFamilyId(right.id).endsWith("-fast") ? 1 : 0;
				if (leftFast !== rightFast) return leftFast - rightFast;
				const leftMax = isCursorMaxRow(left.id) ? 1 : 0;
				const rightMax = isCursorMaxRow(right.id) ? 1 : 0;
				if (leftMax !== rightMax) return leftMax - rightMax;
				return compareFamilyName(left.name ?? left.id, right.name ?? right.id);
			});
		}
		/** Families Cursor actually offers a 1M / Max Context option for. */
		function familyHasExtendedContext(familyId, name = "") {
			if (/\b1M\b/iu.test(name)) return true;
			const id = clusterOf(familyId).toLowerCase();
			if (/^claude-fable-5/u.test(id)) return true;
			if (/^claude-(?:opus|sonnet)-5(?:-|$)/u.test(id)) return true;
			if (/^claude-4\.[5-9]/u.test(id)) return true;
			if (/^claude-(?:opus|sonnet|haiku)-4\.[5-9]/u.test(id)) return true;
			if (/^gemini-3\.1-pro/u.test(id) || /^gemini-3\.7-flash/u.test(id)) return true;
			if (/^gpt-5\.6-sol/u.test(id)) return true;
			if (/^gpt-5\.[45](?:-|$)/u.test(id) && !/-(?:mini|nano)(?:-|$)/u.test(id)) return true;
			if (/^kimi-k3$/u.test(id)) return true;
			return false;
		}
		/** Default DSH context budget for a non-Max family, matching Cursor's published defaults. */
		function defaultContextWindowForFamily(familyId) {
			const tier = parseCursorContextSuffix(familyId);
			if (tier.tokens !== void 0) return tier.tokens;
			const id = clusterOf(familyId).toLowerCase();
			if (id.includes("grok")) return CURSOR_GROK_CONTEXT_WINDOW;
			if (id.startsWith("gpt-5.6")) return CURSOR_GPT_56_CONTEXT_WINDOW;
			if (id.startsWith("claude-fable-5") || id.startsWith("claude-opus-5")) return CURSOR_CLAUDE_5_CONTEXT_WINDOW;
			return CURSOR_DEFAULT_CONTEXT_WINDOW;
		}
		function groupCursorModels(models, sort = "stable") {
			const rows = rawRowsOf(models);
			const families = /* @__PURE__ */ new Map();
			const firstIndex = /* @__PURE__ */ new Map();
			rows.forEach((row, index) => {
				const list = families.get(row.family) ?? [];
				list.push(row);
				families.set(row.family, list);
				if (!firstIndex.has(row.family)) firstIndex.set(row.family, index);
			});
			const grouped = [];
			for (const [family, members] of families) {
				const hasThinkingWire = members.some((member) => wireHasThinking(member.wireId));
				const hasExplicitEffort = members.some((member) => member.effort !== void 0);
				const variants = members.map((member) => {
					const effort = member.effort ?? (!hasThinkingWire && hasExplicitEffort ? "medium" : void 0);
					return {
						wireId: member.wireId,
						...effort === void 0 ? {} : { effort },
						...member.fast ? { fast: true } : {},
						...member.maxMode ? { maxMode: true } : {}
					};
				});
				const preferred = members.find((member) => member.effort === void 0 || member.effort === "medium") ?? members.find((member) => member.effort === "high") ?? members[0];
				const name = cleanFamilyName(preferred?.name ?? family) || family;
				const efforts = new Set(variants.map((variant) => variant.effort).filter((effort) => effort !== void 0));
				const thinking = members.some((member) => member.thinking) || hasThinkingWire || efforts.size > 1;
				const needsVariants = members.length > 1 || variants.some((variant) => variant.effort !== void 0);
				let incomingDefault;
				for (const model of models) {
					if (model.defaultEffort === void 0) continue;
					if (splitCursorWireId(model.id).family === family || model.id === family) {
						incomingDefault = model.defaultEffort;
						break;
					}
				}
				const defaultEffort = resolveCursorDefaultEffort({
					id: family,
					...incomingDefault === void 0 ? {} : { defaultEffort: incomingDefault },
					...needsVariants ? { variants } : {}
				});
				const alreadyMax = isCursorMaxRow(family);
				const hasSavedMaxRow = models.some((model) => model.id === family + "-1m");
				const displayName = alreadyMax ? name.endsWith(" Max") ? name : name + " Max" : name;
				const labeled = (family === "default" || family === "auto") && (preferred?.name === "Auto" || family === "auto") ? "Auto" : displayName;
				const row = (id, rowName, max) => ({
					id,
					name: rowName,
					thinking,
					vision: true,
					contextWindow: max ? CURSOR_MAX_CONTEXT_WINDOW : defaultContextWindowForFamily(id),
					...max ? { maxMode: true } : {},
					...defaultEffort === void 0 ? {} : { defaultEffort },
					...needsVariants ? { variants } : {}
				});
				grouped.push(row(family, labeled, alreadyMax));
				if (!isCursorContextRow(family) && !hasSavedMaxRow && sort === "brand" && familyHasExtendedContext(family, name)) grouped.push(row(family + "-1m", name + " Max", true));
			}
			return sortGroupedFamilies(grouped, firstIndex, sort);
		}
		function modelMatchesQuery(model, query) {
			const needle = query.trim().toLowerCase();
			if (needle.length === 0) return true;
			return [
				model.id,
				model.name ?? "",
				...model.variants?.map((variant) => variant.wireId) ?? []
			].some((field) => field.toLowerCase().includes(needle));
		}
		function effortsForCursorModel(model) {
			const efforts = /* @__PURE__ */ new Set();
			for (const variant of model.variants ?? []) if (variant.effort !== void 0) efforts.add(variant.effort);
			return CURSOR_EFFORT_ORDER.filter((effort) => efforts.has(effort));
		}
		/** Plugin default when the chat has not picked a thinking level. */
		function suggestedDefaultEffort(familyId, efforts) {
			if (efforts.length === 0) return void 0;
			const id = clusterOf(familyId).toLowerCase();
			const choose = (...wanted) => {
				for (const effort of wanted) if (efforts.includes(effort)) return effort;
			};
			if (id.startsWith("gpt-5.6-sol") || id.startsWith("gpt-5.6-terra") || id.startsWith("gpt-5.6-luna")) return choose("medium", "high", "low");
			if (id.startsWith("claude-fable-5")) return choose("high", "xhigh", "max");
			if (id.startsWith("claude-opus-5")) return choose("high", "xhigh", "max");
			if (id.includes("grok")) return choose("high", "medium", "low");
			if (id.startsWith("glm-5.2")) return choose("high", "max");
			return choose("high", "medium", "xhigh") ?? [...CURSOR_EFFORT_ORDER].filter((effort) => effort !== "none").reverse().find((effort) => efforts.includes(effort)) ?? efforts[0];
		}
		function resolveCursorDefaultEffort(model) {
			const efforts = effortsForCursorModel(model);
			if (efforts.length === 0) return void 0;
			if (model.defaultEffort !== void 0 && efforts.includes(model.defaultEffort)) return model.defaultEffort;
			return suggestedDefaultEffort(model.id, efforts);
		}
		//#endregion
		//#region src/client/BrandMark.tsx
		const PATH = "M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23";
		const SIZE = 18;
		/** Compact Cursor logo (currentColor, 18px). */
		function BrandMark() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: SIZE,
				height: SIZE,
				viewBox: "0 0 24 24",
				"aria-hidden": "true",
				style: { flex: "none" },
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					fill: "currentColor",
					d: PATH
				})
			});
		}
		//#endregion
		//#region node_modules/.pnpm/dsh-llm-providers-ui@file+..+..+..+..+.dsh-lab+tmp+dsh-llm-providers-ui-0.1.12-preview._66f05e434ffcf633f8b828e8f535ff70/node_modules/dsh-llm-providers-ui/lib/provider-ui.js
		/** Plain-object guard shared by the reader factories and the sidebar cache validator. */
		function recordUsageValue(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value) ? value : void 0;
		}
		/** Non-empty string guard shared by the reader factories and the sidebar cache validator. */
		function nonEmptyString(value) {
			return typeof value === "string" && value.length > 0;
		}
		function finiteNumber(value) {
			return typeof value === "number" && Number.isFinite(value);
		}
		/** Non-negative finite number guard shared by the reader factories and the sidebar cache validator. */
		function nonNegativeNumber(value) {
			return finiteNumber(value) && value >= 0;
		}
		const PERIOD_RANK = {
			M: 6,
			W: 5,
			D: 4,
			CURS: 3,
			S: 1,
			A: 0,
			L: 0,
			CR: -1
		};
		function periodRank(shortLabelValue) {
			const normalized = shortLabelValue.toUpperCase();
			return PERIOD_RANK[normalized] ?? (/^\d+H$/.test(normalized) ? 2 : 0);
		}
		/** Headline window: longest remaining-percent period. Text-only windows are skipped. */
		function pickPrimaryWindow(windows) {
			let best;
			for (const quotaWindow of windows) {
				if (quotaWindow.remainingPercent === void 0) continue;
				if (best === void 0 || periodRank(quotaWindow.shortLabel) > periodRank(best.shortLabel)) best = quotaWindow;
			}
			if (best !== void 0 && best.remainingPercent === 100 && !nonEmptyString(best.resetsAt)) {
				let fallback;
				for (const quotaWindow of windows) {
					if (quotaWindow === best || !nonEmptyString(quotaWindow.resetsAt) || quotaWindow.remainingPercent === void 0) continue;
					if (fallback === void 0 || periodRank(quotaWindow.shortLabel) > periodRank(fallback.shortLabel)) fallback = quotaWindow;
				}
				if (fallback !== void 0) return fallback;
			}
			return best;
		}
		function formatRemainingDuration(ms) {
			const rtf = new Intl.RelativeTimeFormat(void 0, { numeric: "always" });
			const days = Math.round(ms / 864e5);
			if (Math.abs(days) >= 1) return rtf.format(days, "day");
			const hours = Math.round(ms / 36e5);
			if (Math.abs(hours) >= 1) return rtf.format(hours, "hour");
			const minutes = Math.max(1, Math.round(Math.abs(ms) / 6e4));
			return rtf.format(ms < 0 ? -minutes : minutes, "minute");
		}
		function parseResetTime(resetsAt) {
			if (/^\d{4}-\d{2}-\d{2}/u.test(resetsAt)) {
				const iso = Date.parse(resetsAt);
				return Number.isFinite(iso) ? iso : void 0;
			}
			if (!/^\d{10,}$/u.test(resetsAt)) return void 0;
			const n = Number(resetsAt);
			if (!Number.isFinite(n) || n <= 0) return void 0;
			return n < 0xe8d4a51000 ? n * 1e3 : n;
		}
		/** System-zone instant for a reset ISO. Language copy stays in the UI. */
		function formatResetInstant(resetsAt) {
			if (!nonEmptyString(resetsAt)) return void 0;
			const time = parseResetTime(resetsAt);
			if (time === void 0) return void 0;
			const delta = time - Date.now();
			if (delta < -3456e7 || delta > 6912e7) return void 0;
			return {
				when: new Intl.DateTimeFormat(void 0, {
					dateStyle: "short",
					timeStyle: "short"
				}).format(new Date(time)),
				overdue: delta <= 0,
				relative: formatRemainingDuration(delta)
			};
		}
		const USAGE_CACHE_KEY = "dsh-llm-providers-ui:usage-cache";
		/**
		* Browser last-good usage cache shared across bundles: the sidebar store and
		* each provider Settings card bundle their own copy of this module, so the
		* module-level memory map below is per-bundle while storage is shared.
		* Readable storage is authoritative, including empty after invalidation; memory
		* is only a fallback while storage is unavailable. Stale status persists
		* honestly, and collapsed-header headlines never replace a full multi-window
		* summary (a later full read upgrades a headline).
		*/
		let memoryUsageCache = /* @__PURE__ */ new Map();
		/** Whether a ready or stale summary retains displayable usage windows.
		* @param summary - Current or retained provider usage.
		* @returns Whether its windows can be displayed and persisted.
		*/
		function hasUsageData(summary) {
			return summary !== void 0 && summary.windows.length > 0 && (summary.status === "ready" || summary.status === "stale");
		}
		function cachedSummary(value) {
			const item = recordUsageValue(value);
			if (item === void 0 || !nonEmptyString(item.providerKey) || !nonEmptyString(item.name)) return void 0;
			const status = item.status;
			if (status !== "ready" && status !== "stale") return void 0;
			if (!Array.isArray(item.windows) || item.windows.length === 0) return void 0;
			const windows = [];
			for (const windowValue of item.windows) {
				const quotaWindow = recordUsageValue(windowValue);
				if (quotaWindow === void 0 || !nonEmptyString(quotaWindow.id) || !nonEmptyString(quotaWindow.label) || !nonEmptyString(quotaWindow.shortLabel) || !nonEmptyString(quotaWindow.valueText)) return void 0;
				if (quotaWindow.remainingPercent !== void 0 && (!nonNegativeNumber(quotaWindow.remainingPercent) || quotaWindow.remainingPercent > 100)) return void 0;
				if (quotaWindow.resetsAt !== void 0 && !nonEmptyString(quotaWindow.resetsAt)) return void 0;
				windows.push({
					id: quotaWindow.id,
					label: quotaWindow.label,
					shortLabel: quotaWindow.shortLabel,
					valueText: quotaWindow.valueText,
					...quotaWindow.remainingPercent === void 0 ? {} : { remainingPercent: quotaWindow.remainingPercent },
					...quotaWindow.resetsAt === void 0 ? {} : { resetsAt: quotaWindow.resetsAt }
				});
			}
			return {
				providerKey: item.providerKey,
				name: item.name,
				status,
				windows,
				...nonEmptyString(item.fetchedAt) ? { fetchedAt: item.fetchedAt } : {}
			};
		}
		/** Readable storage backends. A backend that throws on read is unusable and skipped. */
		function usageStorageBackends() {
			const backends = [];
			for (const name of ["localStorage", "sessionStorage"]) try {
				const backend = globalThis[name];
				if (backend === void 0 || backend === null) continue;
				backend.getItem(USAGE_CACHE_KEY);
				backends.push(backend);
			} catch {}
			return backends;
		}
		function storageRead() {
			const backends = usageStorageBackends();
			if (backends.length === 0) return {
				available: false,
				raw: null
			};
			for (const backend of backends) try {
				const raw = backend.getItem(USAGE_CACHE_KEY);
				if (raw !== null) return {
					available: true,
					raw
				};
			} catch {}
			return {
				available: true,
				raw: null
			};
		}
		function storageWrite(value) {
			for (const backend of usageStorageBackends()) try {
				backend.setItem(USAGE_CACHE_KEY, value);
			} catch {}
		}
		function parseUsageCache(raw) {
			const cached = /* @__PURE__ */ new Map();
			if (raw === null) return cached;
			try {
				const parsed = JSON.parse(raw);
				if (!Array.isArray(parsed)) return cached;
				for (const value of parsed) {
					const item = cachedSummary(value);
					if (item !== void 0) cached.set(item.providerKey, item);
				}
			} catch {}
			return cached;
		}
		function readUsageCache() {
			const { available, raw } = storageRead();
			if (!available) return new Map(memoryUsageCache);
			const fromStorage = parseUsageCache(raw);
			memoryUsageCache = new Map(fromStorage);
			return fromStorage;
		}
		/** Persistable copy: status stays ready/stale as the caller holds it, never laundered to ready. */
		function persistableUsage(summary) {
			return {
				providerKey: summary.providerKey,
				name: summary.name,
				status: summary.status,
				windows: summary.windows,
				...summary.fetchedAt === void 0 ? {} : { fetchedAt: summary.fetchedAt }
			};
		}
		/** A collapsed-header single window, never a full multi-window summary. */
		function isHeadlineOnly(summary) {
			return summary.windows.length === 1 && summary.windows[0]?.id === "headline";
		}
		function writeUsageCache(current) {
			const entries = [...current.values()].filter(hasUsageData);
			const { available, raw } = storageRead();
			if (!available) {
				for (const item of entries) memoryUsageCache.set(item.providerKey, persistableUsage(item));
				return;
			}
			const merged = parseUsageCache(raw);
			for (const item of entries) {
				const previous = merged.get(item.providerKey);
				if (previous !== void 0 && !isHeadlineOnly(previous) && isHeadlineOnly(item)) continue;
				merged.set(item.providerKey, persistableUsage(item));
			}
			memoryUsageCache = new Map(merged);
			if (merged.size === 0) return;
			storageWrite(JSON.stringify([...merged.values()]));
		}
		function dropPersistedUsageKeys(keys) {
			const drop = new Set(keys);
			for (const key of drop) memoryUsageCache.delete(key);
			const { available, raw } = storageRead();
			if (!available || raw === null) return;
			let parsed;
			try {
				parsed = JSON.parse(raw);
			} catch {
				return;
			}
			if (!Array.isArray(parsed)) return;
			const kept = parsed.filter((value) => {
				const item = recordUsageValue(value);
				return item === void 0 || !nonEmptyString(item.providerKey) || !drop.has(item.providerKey);
			});
			if (kept.length === parsed.length) return;
			storageWrite(JSON.stringify(kept));
		}
		/** Last-good quota for a Provider card header, available on first paint. */
		function peekCachedUsage(providerKey) {
			return readUsageCache().get(providerKey);
		}
		function rememberCachedUsage(summary) {
			if (!hasUsageData(summary)) return;
			writeUsageCache(/* @__PURE__ */ new Map([[summary.providerKey, summary]]));
		}
		/**
		* Collapsed-header last-good quota for first paint. Ignores headlines without
		* a finite in-range remaining percent so missing quota renders no meter, never
		* a zero bar. Never replaces a cached full multi-window summary, and records
		* no fetchedAt: a headline is display data, not a fetch, so freshness checks
		* treat it as expired and refetch.
		*/
		function rememberHeadlineQuota(providerKey, name, quota) {
			if (quota?.remainingPercent === void 0 || !Number.isFinite(quota.remainingPercent)) return;
			const remainingPercent = Math.round(quota.remainingPercent * 10) / 10;
			if (remainingPercent < 0 || remainingPercent > 100) return;
			const label = quota.label ?? "Quota";
			rememberCachedUsage({
				providerKey,
				name,
				status: "ready",
				windows: [{
					id: "headline",
					label,
					shortLabel: label,
					valueText: String(remainingPercent) + "%",
					remainingPercent
				}]
			});
		}
		function headerQuotaFromCache(summary) {
			if (summary === void 0) return void 0;
			const quotaWindow = pickPrimaryWindow(summary.windows);
			if (quotaWindow === void 0) return void 0;
			const instant = formatResetInstant(quotaWindow.resetsAt);
			const detail = instant === void 0 ? void 0 : instant.when;
			return {
				label: quotaWindow.shortLabel || quotaWindow.label,
				...quotaWindow.remainingPercent === void 0 ? {} : { remainingPercent: quotaWindow.remainingPercent },
				...detail === void 0 ? {} : { detail }
			};
		}
		/**
		* Normalize remaining quota to a 0-100 percent value.
		* Valid readings keep their precision (99.9 stays 99.9, never rounds to 100).
		* NaN, Infinity, and out-of-range readings are unavailable, not clamped:
		* clamping would fabricate a full or empty bar from bad data.
		* @param input - percent and/or fraction quota reading.
		* @returns the 0-100 remaining value, or undefined when unavailable.
		*/
		function normalizeQuotaRemaining(input) {
			const percent = input.remainingPercent;
			if (percent !== void 0) return Number.isFinite(percent) && percent >= 0 && percent <= 100 ? percent : void 0;
			const fraction = input.remainingFraction;
			if (fraction !== void 0) return Number.isFinite(fraction) && fraction >= 0 && fraction <= 1 ? fraction * 100 : void 0;
		}
		/**
		* Remaining quota for a provider card header, from one cache shared with the
		* Provider Usage sidebar. The first frame paints the cached entry, a live answer
		* wins and is written back, and a known sign-out drops the entry rather than
		* leaving another account's quota behind.
		* @param providerKey - usage cache key, identical to the sidebar reader's key.
		* @param providerName - display name recorded with the cached quota.
		* @param quota - the live answer, or null while none has arrived. Only the label and
		* the remaining percent are persisted, because that is all a stored headline holds.
		* @param auth - settled state of the account read.
		* @returns the live quota, else the cached one; null when withheld or when neither is displayable.
		*/
		function useProviderQuotaCache(providerKey, providerName, quota, auth) {
			const { answered, signedOut, withheld } = auth;
			(0, react.useEffect)(() => {
				if (signedOut) {
					if (answered) dropPersistedUsageKeys([providerKey]);
					return;
				}
				if (withheld === true) return;
				if (quota !== null) rememberHeadlineQuota(providerKey, providerName, quota);
			}, [
				answered,
				signedOut,
				withheld,
				providerKey,
				providerName,
				quota?.remainingPercent,
				quota?.label
			]);
			const cached = (0, react.useMemo)(() => answered && signedOut ? void 0 : headerQuotaFromCache(peekCachedUsage(providerKey)), [
				answered,
				signedOut,
				providerKey
			]);
			return withheld === true ? null : quota ?? cached ?? null;
		}
		/**
		* Header props for a provider card: the meter when quota is known, otherwise a
		* labelled unavailable dash once the provider's query settled without usable
		* quota, and nothing at all while that query is still outstanding.
		* @param quota - resolved quota, or null when withheld or unknown.
		* @param options - `dashLabel` names the unavailable dash; `settled` is true when the query finished without usable quota.
		* @returns props to spread into {@link ProviderCardHeader}.
		*/
		function providerQuotaHeaderProps(quota, options) {
			if (quota !== null) return { quota };
			return options.settled ? { quota: { label: options.dashLabel } } : {};
		}
		const meterWrapStyle = {
			display: "flex",
			flexDirection: "column",
			gap: 5,
			minWidth: 0
		};
		const meterTopStyle = {
			display: "flex",
			alignItems: "baseline",
			justifyContent: "space-between",
			gap: 8
		};
		const meterLabelStyle = {
			minWidth: 0,
			overflow: "hidden",
			textOverflow: "ellipsis",
			whiteSpace: "nowrap",
			color: "var(--dsw-alias-label-secondary)",
			fontSize: 12,
			lineHeight: "18px"
		};
		const meterValueStyle = {
			flex: "none",
			fontVariantNumeric: "tabular-nums",
			fontWeight: 500,
			fontSize: 12,
			lineHeight: "18px",
			color: "var(--dsw-alias-label-primary)"
		};
		const meterTrackStyle = {
			display: "block",
			width: "100%",
			height: 6,
			overflow: "hidden",
			border: 0,
			borderRadius: 2,
			background: "color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent)",
			position: "relative"
		};
		const meterFillBase = {
			display: "block",
			height: "100%",
			borderRadius: 2,
			position: "relative",
			background: "color-mix(in srgb, var(--dsw-alias-label-primary) 55%, var(--dsw-alias-label-secondary))"
		};
		const meterKnobStyle = {
			position: "absolute",
			right: 0,
			top: 0,
			bottom: 0,
			width: 2,
			background: "var(--dsw-alias-label-primary)"
		};
		const meterSegmentsStyle = {
			position: "absolute",
			inset: 0,
			pointerEvents: "none",
			background: "repeating-linear-gradient(to right, transparent 0, transparent calc(10% - 1px), var(--dsw-alias-bg-layer-1) calc(10% - 1px), var(--dsw-alias-bg-layer-1) 10%)"
		};
		/** Approved A low-quota fill: amber only, no red tier, no hardcoded hue. */
		const meterWarnFill = { background: "var(--dsw-alias-state-warn-primary)" };
		const meterDetailStyle = {
			color: "var(--dsw-alias-label-tertiary)",
			fontSize: 11,
			lineHeight: "16px"
		};
		const meterMissingStyle = {
			color: "var(--dsw-alias-label-tertiary)",
			fontSize: 12,
			lineHeight: "18px"
		};
		/** Segmented remaining-quota meter. Unavailable quota renders a placeholder, never a zero bar. */
		function ProviderQuotaMeter(props) {
			const remaining = normalizeQuotaRemaining(props);
			const label = props.label ?? "Quota";
			if (remaining === void 0) return (0, react_jsx_runtime.jsx)("span", {
				"data-provider-quota-missing": "",
				style: meterMissingStyle,
				children: props.emptyLabel ?? "—"
			});
			const warn = remaining < 20;
			const text = String(remaining);
			return (0, react_jsx_runtime.jsxs)("span", {
				"data-provider-quota": "",
				style: meterWrapStyle,
				...props.id === void 0 ? {} : { id: props.id },
				children: [
					(0, react_jsx_runtime.jsxs)("span", {
						style: meterTopStyle,
						children: [(0, react_jsx_runtime.jsx)("span", {
							style: meterLabelStyle,
							children: label
						}), (0, react_jsx_runtime.jsx)("span", {
							style: meterValueStyle,
							children: text + "%"
						})]
					}),
					(0, react_jsx_runtime.jsxs)("span", {
						"data-provider-quota-meter": "",
						role: "meter",
						"aria-label": label,
						"aria-valuemin": 0,
						"aria-valuemax": 100,
						"aria-valuenow": remaining,
						style: meterTrackStyle,
						children: [(0, react_jsx_runtime.jsx)("span", {
							style: {
								...meterFillBase,
								...warn ? meterWarnFill : {},
								width: text + "%"
							},
							children: (0, react_jsx_runtime.jsx)("span", { style: meterKnobStyle })
						}), (0, react_jsx_runtime.jsx)("span", {
							"aria-hidden": "true",
							style: meterSegmentsStyle
						})]
					}),
					props.detail === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
						style: meterDetailStyle,
						children: props.detail
					})
				]
			});
		}
		const headerMainStyle = {
			display: "flex",
			alignItems: "center",
			gap: 14,
			minWidth: 0,
			flex: 1
		};
		const headerIdentityStyle = {
			display: "flex",
			alignItems: "center",
			gap: 12,
			minWidth: 0,
			flex: 1
		};
		const headerMarkStyle = {
			width: 28,
			height: 28,
			flex: "none",
			display: "grid",
			placeItems: "center",
			overflow: "visible"
		};
		const headerTitleColStyle = {
			display: "flex",
			flexDirection: "column",
			minWidth: 0,
			flex: 1
		};
		const headerTitleStyle = {
			display: "inline-flex",
			alignItems: "center",
			gap: 8,
			fontSize: 14,
			fontWeight: 600,
			lineHeight: "20px"
		};
		const headerBadgeBase = {
			display: "inline-flex",
			alignItems: "center",
			gap: 4,
			whiteSpace: "nowrap",
			fontSize: 10,
			fontWeight: 500,
			lineHeight: "16px",
			padding: "0 5px",
			borderRadius: 3,
			border: "1px solid transparent"
		};
		const headerBadgeLlm = {
			color: "var(--dsw-alias-label-secondary)",
			borderColor: "var(--dsw-alias-border-l2)",
			background: "transparent"
		};
		const headerBadgeAgent = {
			color: "var(--dsw-alias-bg-layer-1)",
			borderColor: "var(--dsw-alias-label-primary)",
			background: "var(--dsw-alias-label-primary)"
		};
		const headerSummaryStyle = {
			fontSize: 11,
			lineHeight: "16px",
			color: "var(--dsw-alias-label-tertiary)",
			whiteSpace: "nowrap",
			overflow: "hidden",
			textOverflow: "ellipsis"
		};
		const headerMiniStyle = {
			width: 172,
			flex: "none",
			minWidth: 0
		};
		const headerStatusStyle = {
			width: 96,
			flex: "none",
			textAlign: "right",
			fontSize: 11,
			lineHeight: "16px",
			color: "var(--dsw-alias-label-tertiary)",
			whiteSpace: "nowrap",
			overflow: "hidden",
			textOverflow: "ellipsis"
		};
		const headerSideStyle = {
			display: "inline-flex",
			alignItems: "center",
			gap: 10,
			flex: "none"
		};
		const headerUnsavedStyle = {
			fontSize: 12,
			color: "var(--dsw-alias-label-tertiary)"
		};
		const headerChevronStyle = {
			width: 15,
			fontSize: 20,
			lineHeight: 1,
			textAlign: "center",
			color: "var(--dsw-alias-label-tertiary)"
		};
		/**
		* Monochrome role badge: outlined message glyph for LLM, filled terminal glyph
		* for Agent. Shared by migrated card headers and the shell legacy fallback.
		*/
		function ProviderRoleBadge(props) {
			const agent = (props.role ?? "llm") === "agent";
			return (0, react_jsx_runtime.jsxs)("span", {
				"data-provider-role-badge": agent ? "agent" : "llm",
				style: {
					...headerBadgeBase,
					...agent ? headerBadgeAgent : headerBadgeLlm
				},
				children: [(0, react_jsx_runtime.jsx)("svg", {
					viewBox: "0 0 16 16",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: 1.4,
					"aria-hidden": "true",
					children: agent ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("rect", {
						x: "1.5",
						y: "2",
						width: "13",
						height: "12",
						rx: "2"
					}), (0, react_jsx_runtime.jsx)("path", { d: "m4 5 3 3-3 3m5 0h3" })] }) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("rect", {
						x: "2",
						y: "2",
						width: "12",
						height: "9",
						rx: "3"
					}), (0, react_jsx_runtime.jsx)("path", { d: "m5 11-1 3 5-3M5 6h6" })] })
				}), agent ? "Agent" : "LLM"]
			});
		}
		/**
		* Approved A header geometry in one row: identity (mark beside title, badge,
		* and count) on the left, headline quota at the right, caller status, and the
		* chevron. Narrow screens stack identity plus chevron over quota plus status.
		* Renders a fragment for the caller-owned header button; props keep the legacy
		* codex provider-chrome signature so existing call sites keep working.
		*/
		function ProviderCardHeader(props) {
			const quota = props.quota === void 0 || props.quota === null ? void 0 : {
				...props.quota.remainingPercent === void 0 ? {} : { remainingPercent: props.quota.remainingPercent },
				...props.quota.remainingFraction === void 0 ? {} : { remainingFraction: props.quota.remainingFraction },
				...props.quota.label === void 0 ? {} : { label: props.quota.label },
				...props.quota.detail === void 0 ? {} : { detail: props.quota.detail }
			};
			return (0, react_jsx_runtime.jsxs)("span", {
				"data-provider-header-main": "",
				style: headerMainStyle,
				children: [
					(0, react_jsx_runtime.jsxs)("span", {
						"data-provider-header-identity": "",
						style: headerIdentityStyle,
						children: [(0, react_jsx_runtime.jsx)("span", {
							"data-provider-header-mark": "",
							style: headerMarkStyle,
							children: props.mark
						}), (0, react_jsx_runtime.jsxs)("span", {
							style: headerTitleColStyle,
							children: [(0, react_jsx_runtime.jsxs)("span", {
								style: headerTitleStyle,
								children: [(0, react_jsx_runtime.jsx)("span", { children: props.title }), (0, react_jsx_runtime.jsx)(ProviderRoleBadge, { ...props.role === void 0 ? {} : { role: props.role } })]
							}), (0, react_jsx_runtime.jsx)("span", {
								"data-provider-header-summary": "",
								style: headerSummaryStyle,
								children: props.summary
							})]
						})]
					}),
					quota === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
						"data-provider-quota-mini": "",
						style: headerMiniStyle,
						children: (0, react_jsx_runtime.jsx)(ProviderQuotaMeter, { ...quota })
					}),
					props.status === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
						"data-provider-header-status": "",
						style: headerStatusStyle,
						children: props.status
					}),
					(0, react_jsx_runtime.jsxs)("span", {
						"data-provider-header-side": "",
						style: headerSideStyle,
						children: [props.unsaved === true && props.unsavedLabel !== void 0 ? (0, react_jsx_runtime.jsx)("span", {
							style: headerUnsavedStyle,
							children: props.unsavedLabel
						}) : null, (0, react_jsx_runtime.jsx)("span", {
							"data-provider-header-chevron": "",
							"aria-hidden": "true",
							style: {
								...headerChevronStyle,
								transform: props.open ? "rotate(180deg)" : "none"
							},
							children: "⌄"
						})]
					})
				]
			});
		}
		/**
		* Scoped provider chrome CSS: plain card reset, header button layout, body and
		* model rows, quota meter responsive rules, and coarse-pointer touch targets.
		* The shell injects it once per page; provider cards may also inject it once
		* for standalone use. Duplicate style tags are harmless: every rule is scoped
		* to a data-provider-* attribute; shared geometry overrides legacy inline layout styles.
		*/
		const providerUiCss = [
			"[data-provider-card]{box-sizing:border-box;width:100%;min-width:0;list-style:none;margin:0!important;border:0!important;border-radius:0!important;background:none!important;box-shadow:none!important;overflow:visible}",
			"[data-provider-card-header]{box-sizing:border-box;width:100%;min-height:76px!important;display:flex;align-items:center;justify-content:space-between;gap:16px;border:0;padding:12px 14px!important;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;text-align:left;cursor:pointer}",
			"[data-provider-body][hidden]{display:none!important}",
			"[data-provider-role-badge] svg{width:12px;height:12px}",
			"[data-provider-card-header]:hover{background:color-mix(in srgb, var(--dsw-alias-label-primary) 4%, transparent)}",
			"[data-provider-body]{display:flex;flex-direction:column;gap:18px;border-top:1px solid var(--dsw-alias-border-l2);padding:16px 14px 18px}",
			"[data-provider-model]{display:flex;align-items:center;gap:9px;min-height:40px}",
			"[data-provider-quota-mini]{display:block}",
			"[data-providers-list]{display:flex;flex-direction:column}",
			"[data-providers-list] [data-sortable-row]+[data-sortable-row]{border-top:1px solid var(--dsw-alias-border-l2)}",
			"[data-providers-section]{container-type:inline-size}",
			"@media (max-width:680px){[data-provider-card-header]{min-height:106px!important;padding:17px 4px!important}[data-provider-header-main]{display:grid!important;grid-template-columns:minmax(0,1fr) auto;gap:7px 9px!important;align-items:center}[data-provider-header-identity]{grid-column:1;grid-row:1;gap:9px!important}[data-provider-header-mark]{width:25px!important;height:25px!important}[data-provider-role-badge]{margin-left:4px;font-size:9px!important}[data-provider-role-badge] svg{width:11px!important;height:11px!important}[data-provider-header-side]{grid-column:2;grid-row:1;justify-self:end}[data-provider-header-side] [data-provider-header-chevron]{width:18px}[data-provider-quota-mini]{grid-column:1;grid-row:2;width:auto!important;max-width:none!important;text-align:left;padding-left:34px!important}[data-provider-header-status]{grid-column:2;grid-row:2;width:auto!important;max-width:100px}[data-provider-model]{min-height:48px}[data-provider-model] input[type=checkbox]{width:17px;height:17px}[data-providers-section] button,[data-provider-card] button{min-height:44px}}",
			"@container (max-width:540px){[data-provider-card-header]{min-height:106px!important;padding:17px 4px!important}[data-provider-header-main]{display:grid!important;grid-template-columns:minmax(0,1fr) auto;gap:7px 9px!important;align-items:center}[data-provider-header-identity]{grid-column:1;grid-row:1;gap:9px!important}[data-provider-header-mark]{width:25px!important;height:25px!important}[data-provider-role-badge]{margin-left:4px;font-size:9px!important}[data-provider-role-badge] svg{width:11px!important;height:11px!important}[data-provider-header-side]{grid-column:2;grid-row:1;justify-self:end}[data-provider-header-side] [data-provider-header-chevron]{width:18px}[data-provider-quota-mini]{grid-column:1;grid-row:2;width:auto!important;max-width:none!important;text-align:left;padding-left:34px!important}[data-provider-header-status]{grid-column:2;grid-row:2;width:auto!important;max-width:100px}[data-provider-model]{min-height:48px}[data-provider-model] input[type=checkbox]{width:17px;height:17px}[data-providers-section] button,[data-provider-card] button{min-height:44px}}",
			"@media (pointer:coarse){[data-sortable-handle],[data-sortable-move]{min-width:44px;min-height:44px}}"
		].join("\n");
		//#endregion
		//#region src/client/provider-chrome.tsx
		const REFRESH_PATH = "M1.272 6.21348C1.70645 3.08888 4.59169 0.908064 7.71634 1.34239C8.95495 1.51469 10.0438 2.07331 10.8814 2.87755L11.9458 1.81407C12.1347 1.6255 12.4572 1.75911 12.4575 2.02598V5.08751C12.4574 5.25303 12.3233 5.38731 12.1577 5.38731H9.0972C8.82993 5.38731 8.69629 5.06361 8.88528 4.87462L10.0327 3.72618C9.3732 3.09994 8.52006 2.66569 7.5513 2.53087C5.08313 2.18779 2.80376 3.91044 2.46048 6.37852C2.11747 8.84665 3.84009 11.1261 6.30814 11.4693C8.77612 11.8121 11.0557 10.0896 11.399 7.62169L11.9937 7.70372L12.5874 7.78673C12.153 10.9112 9.26756 13.0919 6.1431 12.6578C3.01854 12.2234 0.837738 9.33809 1.272 6.21348Z";
		function ensureMotionStyles() {
			if (typeof document === "undefined") return;
			if (document.getElementById("dsh-provider-motion") !== null) return;
			const style = document.createElement("style");
			style.id = "dsh-provider-motion";
			style.textContent = ["@keyframes dsh-provider-spin{to{transform:rotate(360deg)}}", "@keyframes dsh-provider-shimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}"].join("");
			document.head.appendChild(style);
		}
		const iconButtonStyle$1 = {
			boxSizing: "border-box",
			width: 28,
			height: 28,
			padding: 0,
			border: "1px solid var(--dsw-alias-border-l2)",
			borderRadius: 999,
			background: "transparent",
			color: "var(--dsw-alias-label-primary)",
			display: "inline-flex",
			alignItems: "center",
			justifyContent: "center",
			cursor: "pointer",
			flex: "none"
		};
		const authRowStyle = {
			display: "flex",
			alignItems: "center",
			justifyContent: "space-between",
			gap: 12
		};
		const trackStyle = {
			boxSizing: "border-box",
			height: 14,
			overflow: "hidden",
			borderRadius: 999,
			background: "color-mix(in srgb, var(--dsw-alias-label-primary) 14%, transparent)"
		};
		const shimmerStyle = {
			display: "block",
			width: "100%",
			height: "100%",
			background: "linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--dsw-alias-label-primary) 22%, transparent) 50%, transparent 100%)",
			backgroundSize: "200% 100%",
			animation: "dsh-provider-shimmer 1.25s ease-in-out infinite"
		};
		const chipStyle = {
			display: "inline-block",
			height: 12,
			borderRadius: 4,
			background: "linear-gradient(90deg, color-mix(in srgb, var(--dsw-alias-label-primary) 10%, transparent) 0%, color-mix(in srgb, var(--dsw-alias-label-primary) 22%, transparent) 50%, color-mix(in srgb, var(--dsw-alias-label-primary) 10%, transparent) 100%)",
			backgroundSize: "200% 100%",
			animation: "dsh-provider-shimmer 1.25s ease-in-out infinite"
		};
		/** Account status on the left, sign-in / sign-out on the right. */
		function AuthToolbar(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: authRowStyle,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					style: {
						minWidth: 0,
						flex: 1
					},
					children: props.status
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					style: { flex: "none" },
					children: props.action
				})]
			});
		}
		/** Official `ic_ds_refresh_outline_14` glyph; spins while refreshing. */
		function RefreshIcon(props) {
			ensureMotionStyles();
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: 14,
				height: 14,
				viewBox: "0 0 14 14",
				fill: "none",
				"aria-hidden": "true",
				style: props.spinning === true ? { animation: "dsh-provider-spin 0.8s linear infinite" } : void 0,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					fill: "currentColor",
					d: REFRESH_PATH
				})
			});
		}
		/** Icon-only refresh control used by every provider usage block. */
		function UsageRefreshButton(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				style: iconButtonStyle$1,
				disabled: props.disabled === true,
				"aria-label": props.spinning ? props.busyLabel : props.label,
				onClick: props.onClick,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RefreshIcon, { spinning: props.spinning })
			});
		}
		/** Quota chart skeleton: same 14px tracks as live bars, with a moving sheen. */
		function UsageSkeleton(props) {
			ensureMotionStyles();
			const rows = props.rows ?? 2;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				style: {
					display: "flex",
					flexDirection: "column",
					gap: 10
				},
				"aria-hidden": "true",
				children: Array.from({ length: rows }, (_, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						flexDirection: "column",
						gap: 6
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "baseline",
							justifyContent: "space-between",
							gap: 10
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { style: {
							...chipStyle,
							width: index === 0 ? 92 : 78
						} }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { style: {
							...chipStyle,
							width: 36
						} })]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: trackStyle,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { style: shimmerStyle })
					})]
				}, index))
			});
		}
		/**
		* Title + official refresh glyph used above usage bars.
		* @param props.title - localized usage heading.
		* @param props.spinning - whether a refresh is in flight.
		* @param props.disabled - when true, the refresh button is inert.
		* @param props.refreshLabel - idle aria-label.
		* @param props.busyLabel - aria-label while spinning.
		* @param props.onRefresh - fetch handler.
		* @param props.error - short failure hint shown left of the button.
		* @returns the usage block heading row.
		*/
		function UsageHeader(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: 10
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
					style: {
						margin: 0,
						fontSize: 13,
						fontWeight: 600,
						lineHeight: "18px"
					},
					children: props.title
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					style: {
						display: "inline-flex",
						alignItems: "center",
						gap: 8,
						flex: "none"
					},
					children: [props.error !== void 0 && props.error.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: {
							fontSize: 12,
							lineHeight: "18px",
							color: "var(--dsw-alias-state-error-primary)"
						},
						children: props.error
					}) : null, /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UsageRefreshButton, {
						spinning: props.spinning,
						disabled: props.disabled === true,
						label: props.refreshLabel,
						busyLabel: props.busyLabel,
						onClick: props.onRefresh
					})]
				})]
			});
		}
		/** Format a usage stamp as a compact local clock, e.g. "12:04". */
		function formatUsageClock(at) {
			return at.toLocaleTimeString(void 0, {
				hour: "2-digit",
				minute: "2-digit",
				hour12: false
			});
		}
		function interpolateCopy(template, params) {
			return template.replace(/\{(\w+)\}/gu, (_match, key) => String(params[key] ?? ""));
		}
		function chineseLocale(locales) {
			const locale = typeof locales === "string" ? locales : locales?.[0] ?? (typeof navigator === "undefined" ? void 0 : navigator.language);
			return typeof locale === "string" && /^zh\b/iu.test(locale);
		}
		function pad2(value) {
			return String(value).padStart(2, "0");
		}
		/** Official grok.com form: 2026年8月20日 11:35. English stays a short local datetime. */
		function formatResetStamp(iso, locales) {
			const at = new Date(iso);
			if (Number.isNaN(at.getTime())) return iso;
			if (chineseLocale(locales)) return String(at.getFullYear()) + "年" + String(at.getMonth() + 1) + "月" + String(at.getDate()) + "日 " + pad2(at.getHours()) + ":" + pad2(at.getMinutes());
			return new Intl.DateTimeFormat(locales, {
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				hour12: false
			}).format(at);
		}
		/** Official Cursor form: Sep 16 / 9月16日. */
		function formatResetDate(iso, locales) {
			const at = new Date(iso);
			if (Number.isNaN(at.getTime())) return iso;
			if (chineseLocale(locales)) return String(at.getMonth() + 1) + "月" + String(at.getDate()) + "日";
			return new Intl.DateTimeFormat(locales, {
				month: "short",
				day: "numeric"
			}).format(at);
		}
		/** Whole days until reset when at least one day remains; otherwise the datetime form is used. */
		function remainingResetDays(iso, now = Date.now()) {
			const at = Date.parse(iso);
			if (!Number.isFinite(at)) return void 0;
			const days = Math.round((at - now) / 864e5);
			return days >= 1 ? days : void 0;
		}
		/** Localized reset line matching official dashboards. */
		function resetLabelOf(iso, copy, now) {
			if (iso === void 0) return void 0;
			const locales = copy.at.includes("重置") ? "zh-CN" : "en";
			const days = remainingResetDays(iso, now);
			if (days !== void 0) return interpolateCopy(copy.atDays, {
				date: formatResetDate(iso, locales),
				count: days
			});
			return interpolateCopy(copy.at, { time: formatResetStamp(iso, locales) });
		}
		/** Official-style reset caption under a usage bar. */
		function UsageResetAt(props) {
			if (props.label === void 0 || props.label.length === 0) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				style: {
					margin: 0,
					fontSize: 12,
					lineHeight: "18px",
					color: "var(--dsw-alias-label-tertiary)"
				},
				children: props.label
			});
		}
		/**
		* Last successful usage read, right-aligned under the bars.
		* @param props.at - when the last successful snapshot arrived.
		* @param props.label - already-localized "12:04 已更新".
		* @returns the stamp, or nothing before the first success.
		*/
		function UsageUpdatedAt(props) {
			if (props.at === void 0) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				style: {
					margin: 0,
					textAlign: "right",
					fontSize: 12,
					lineHeight: "18px",
					color: "var(--dsw-alias-label-tertiary)"
				},
				children: props.label
			});
		}
		//#endregion
		//#region node_modules/.pnpm/dsh-llm-providers-ui@file+..+..+..+..+.dsh-lab+tmp+dsh-llm-providers-ui-0.1.12-preview._66f05e434ffcf633f8b828e8f535ff70/node_modules/dsh-llm-providers-ui/lib/sortable.js
		/** Pointer-driven sortable list with a floating ghost and animated live preview. */
		const listStyle$1 = {
			display: "flex",
			flexDirection: "column",
			gap: 8
		};
		const rowStyle$1 = {
			display: "grid",
			gridTemplateColumns: "30px minmax(0, 1fr)",
			alignItems: "stretch",
			overflow: "hidden",
			border: "1px solid var(--dsw-alias-border-l2)",
			borderRadius: 8,
			background: "var(--dsw-alias-bg-layer-1)",
			transition: "box-shadow 150ms ease, opacity 150ms ease, transform 150ms ease"
		};
		const handleStyle = {
			display: "inline-flex",
			alignItems: "center",
			justifyContent: "center",
			width: 30,
			minHeight: 42,
			alignSelf: "stretch",
			border: 0,
			borderRight: "1px solid var(--dsw-alias-border-l2)",
			padding: 0,
			flex: "none",
			touchAction: "none",
			userSelect: "none",
			background: "transparent",
			color: "var(--dsw-alias-label-tertiary)",
			position: "relative",
			zIndex: 2
		};
		const cardRowStyle = {
			...rowStyle$1,
			borderRadius: 10,
			background: "var(--dsw-alias-bg-module-platform)",
			overflow: "hidden"
		};
		const cardItemStyle = {
			minWidth: 0,
			display: "flex",
			flexDirection: "column"
		};
		const plainRowStyle = {
			display: "grid",
			alignItems: "stretch",
			background: "transparent"
		};
		const plainItemStyle = {
			minWidth: 0,
			display: "flex",
			flexDirection: "column",
			padding: "4px 0"
		};
		const moveButtonStyle = {
			display: "inline-flex",
			alignItems: "center",
			justifyContent: "center",
			minWidth: 34,
			minHeight: 34,
			alignSelf: "center",
			border: 0,
			padding: 0,
			flex: "none",
			background: "transparent",
			color: "var(--dsw-alias-label-tertiary)",
			fontSize: 16,
			cursor: "pointer"
		};
		const touchCss = "@media (pointer:coarse){[data-sortable-handle],[data-sortable-move]{min-width:44px;min-height:44px}}";
		const cardCss = "[data-sortable-card] [data-sortable-item] li,[data-sortable-ghost] [data-sortable-item] li{border:0!important;border-radius:0!important;background:transparent!important;overflow:visible!important;list-style:none;margin:0}";
		/** Grip glyph marking one row's pointer handle. */
		function IconGrip() {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: "10",
				height: "14",
				viewBox: "0 0 10 14",
				fill: "currentColor",
				"aria-hidden": true,
				children: [
					(0, react_jsx_runtime.jsx)("circle", {
						cx: "2.5",
						cy: "2.5",
						r: "1.2"
					}),
					(0, react_jsx_runtime.jsx)("circle", {
						cx: "7.5",
						cy: "2.5",
						r: "1.2"
					}),
					(0, react_jsx_runtime.jsx)("circle", {
						cx: "2.5",
						cy: "7",
						r: "1.2"
					}),
					(0, react_jsx_runtime.jsx)("circle", {
						cx: "7.5",
						cy: "7",
						r: "1.2"
					}),
					(0, react_jsx_runtime.jsx)("circle", {
						cx: "2.5",
						cy: "11.5",
						r: "1.2"
					}),
					(0, react_jsx_runtime.jsx)("circle", {
						cx: "7.5",
						cy: "11.5",
						r: "1.2"
					})
				]
			});
		}
		/**
		* Pointer-driven sortable list: an in-tree floating ghost follows the pointer,
		* a preview array records the prospective order, and FLIP animations move
		* sibling rows. The ghost stays inside the list ancestry so ancestor-scoped
		* row styles keep matching it while it floats (position:fixed escapes
		* overflow clipping without leaving the scope). Constraint: no
		* transform/filter/perspective on list ancestors, which would re-anchor
		* the fixed ghost to that ancestor instead of the viewport.
		*/
		function SortableList({ items, getId, renderItem, dragLabel, onReorder, disabled = false, chrome = "row", sorting = true, moveButtons = false, moveUpLabel, moveDownLabel }) {
			const card = chrome === "card";
			const plain = chrome === "plain";
			const interactive = sorting && !disabled;
			const showHandle = sorting;
			const upLabel = moveUpLabel ?? (() => "Move up");
			const downLabel = moveDownLabel ?? (() => "Move down");
			/** Commit a durable reorder moving one row by an offset. Pointer preview stays untouched. */
			const moveBy = (id, offset) => {
				if (!interactive || draggedId !== null) return;
				const from = items.findIndex((item) => getId(item) === id);
				if (from < 0) return;
				const to = from + offset;
				if (to < 0 || to >= items.length) return;
				const next = [...items];
				const moved = next.splice(from, 1)[0];
				if (moved === void 0) return;
				next.splice(to, 0, moved);
				onReorder(next);
			};
			/** Arrow keys on a handle commit the same reorder as a pointer drag. */
			const handleKeyDown = (event, id) => {
				if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
				event.preventDefault();
				moveBy(id, event.key === "ArrowUp" ? -1 : 1);
			};
			const [draggedId, setDraggedId] = (0, react.useState)(null);
			const [dropTargetId, setDropTargetId] = (0, react.useState)(null);
			const [previewItems, setPreviewItems] = (0, react.useState)(null);
			const [dragGhost, setDragGhost] = (0, react.useState)(null);
			const rowRefs = (0, react.useRef)(/* @__PURE__ */ new Map());
			const previousRects = (0, react.useRef)(null);
			const previewRef = (0, react.useRef)(null);
			const dragGhostRef = (0, react.useRef)(null);
			const renderedItems = previewItems ?? items;
			const draggedItem = draggedId === null ? void 0 : renderedItems.find((item) => getId(item) === draggedId) ?? items.find((item) => getId(item) === draggedId);
			(0, react.useEffect)(() => {
				if (draggedId === null) return;
				const style = document.createElement("style");
				style.textContent = "html.providers-sortable-dragging, html.providers-sortable-dragging * { cursor: grabbing !important; user-select: none !important; }";
				const previousRootCursor = document.documentElement.style.cursor;
				const previousBodyCursor = document.body.style.cursor;
				document.head.appendChild(style);
				document.documentElement.classList.add("providers-sortable-dragging");
				document.documentElement.style.cursor = "grabbing";
				document.body.style.cursor = "grabbing";
				return () => {
					document.documentElement.classList.remove("providers-sortable-dragging");
					style.remove();
					document.documentElement.style.cursor = previousRootCursor;
					document.body.style.cursor = previousBodyCursor;
				};
			}, [draggedId]);
			(0, react.useEffect)(() => {
				if (draggedId === null) return;
				const handlePointerMove = (event) => {
					const currentGhost = dragGhostRef.current;
					if (currentGhost === null) return;
					event.preventDefault();
					const nextGhost = {
						...currentGhost,
						x: event.clientX - currentGhost.offsetX,
						y: event.clientY - currentGhost.offsetY
					};
					dragGhostRef.current = nextGhost;
					setDragGhost(nextGhost);
					movePreviewFromPointer(nextGhost.y + nextGhost.height / 2);
				};
				const handlePointerUp = (event) => {
					event.preventDefault();
					finishDrag(true);
				};
				const handlePointerCancel = (event) => {
					event.preventDefault();
					finishDrag(false);
				};
				const handleKeyDown = (event) => {
					if (event.key !== "Escape") return;
					event.preventDefault();
					finishDrag(false);
				};
				window.addEventListener("pointermove", handlePointerMove, { passive: false });
				window.addEventListener("pointerup", handlePointerUp, { passive: false });
				window.addEventListener("pointercancel", handlePointerCancel, { passive: false });
				window.addEventListener("keydown", handleKeyDown);
				return () => {
					window.removeEventListener("pointermove", handlePointerMove);
					window.removeEventListener("pointerup", handlePointerUp);
					window.removeEventListener("pointercancel", handlePointerCancel);
					window.removeEventListener("keydown", handleKeyDown);
				};
			}, [draggedId]);
			(0, react.useLayoutEffect)(() => {
				const rects = previousRects.current;
				if (rects === null) return;
				previousRects.current = null;
				rowRefs.current.forEach((node, id) => {
					const previous = rects.get(id);
					if (previous === void 0) return;
					const next = node.getBoundingClientRect();
					const deltaX = previous.left - next.left;
					const deltaY = previous.top - next.top;
					if (deltaX === 0 && deltaY === 0 || typeof node.animate !== "function") return;
					node.animate([{ transform: "translate(" + String(deltaX) + "px, " + String(deltaY) + "px)" }, { transform: "translate(0, 0)" }], {
						duration: 160,
						easing: "cubic-bezier(0.2, 0, 0, 1)"
					});
				});
			}, [renderedItems]);
			const startDrag = (event, id) => {
				if (!interactive || dragGhostRef.current !== null) return;
				if (event.pointerType === "mouse" && event.button !== 0) return;
				const row = event.currentTarget.closest("[data-sortable-row=\"true\"]");
				if (!(row instanceof HTMLElement)) return;
				event.preventDefault();
				if (typeof event.currentTarget.focus === "function") event.currentTarget.focus();
				try {
					event.currentTarget.setPointerCapture(event.pointerId);
				} catch {}
				const rect = row.getBoundingClientRect();
				const nextGhost = {
					id,
					x: rect.left,
					y: rect.top,
					width: rect.width,
					height: rect.height,
					offsetX: event.clientX - rect.left,
					offsetY: event.clientY - rect.top
				};
				dragGhostRef.current = nextGhost;
				const initial = [...items];
				previewRef.current = initial;
				setPreviewItems(initial);
				setDragGhost(nextGhost);
				setDraggedId(id);
			};
			const finishDrag = (commit) => {
				const next = previewRef.current;
				if (commit && next !== null && !sameOrder(next, items, getId)) onReorder(next);
				previewRef.current = null;
				dragGhostRef.current = null;
				setPreviewItems(null);
				setDragGhost(null);
				setDraggedId(null);
				setDropTargetId(null);
			};
			const captureRects = () => {
				previousRects.current = new Map(Array.from(rowRefs.current.entries()).map(([id, node]) => [id, node.getBoundingClientRect()]));
			};
			const setRowRef = (id, node) => {
				if (node === null) rowRefs.current.delete(id);
				else rowRefs.current.set(id, node);
			};
			/** The ghost clones live row controls: keep the copy unfocusable. React 18 types no inert prop, so set the DOM flag behind a support guard. */
			const setGhostInert = (node) => {
				if (node !== null && "inert" in node) node.inert = true;
			};
			const movePreviewFromPointer = (pointerY) => {
				if (draggedId === null) return;
				const current = previewRef.current ?? [...items];
				const from = current.findIndex((item) => getId(item) === draggedId);
				if (from < 0) return;
				const dragged = current[from];
				if (dragged === void 0) return;
				const remaining = current.filter((item) => getId(item) !== draggedId);
				let insertionIndex = remaining.length;
				let nextDropTargetId = remaining.length === 0 ? null : getId(remaining[remaining.length - 1]);
				for (let index = 0; index < remaining.length; index += 1) {
					const item = remaining[index];
					if (item === void 0) continue;
					const id = getId(item);
					const node = rowRefs.current.get(id);
					if (node === void 0) continue;
					const rect = node.getBoundingClientRect();
					if (pointerY < rect.top + rect.height / 2) {
						insertionIndex = index;
						nextDropTargetId = id;
						break;
					}
				}
				const next = [
					...remaining.slice(0, insertionIndex),
					dragged,
					...remaining.slice(insertionIndex)
				];
				setDropTargetId(nextDropTargetId);
				if (sameOrder(next, current, getId)) return;
				captureRects();
				previewRef.current = next;
				setPreviewItems(next);
			};
			const rowChromeStyle = plain ? plainRowStyle : card ? cardRowStyle : rowStyle$1;
			const rowGridColumns = (showHandle ? "44px " : "") + "minmax(0,1fr)" + (moveButtons && showHandle ? " auto auto" : "");
			const rowItemStyle = plain ? plainItemStyle : card ? cardItemStyle : { minWidth: 0 };
			return (0, react_jsx_runtime.jsxs)("div", {
				"data-sortable-card": card ? "" : void 0,
				"data-sortable-plain": plain ? "" : void 0,
				style: {
					...listStyle$1,
					...card ? { gap: 12 } : {},
					...plain ? { gap: 0 } : {}
				},
				children: [
					card ? (0, react_jsx_runtime.jsx)("style", { children: cardCss }) : null,
					plain || moveButtons ? (0, react_jsx_runtime.jsx)("style", { children: touchCss }) : null,
					renderedItems.map((item, index) => {
						const id = getId(item);
						const dragging = draggedId === id;
						const targeted = dropTargetId === id && draggedId !== id;
						return (0, react_jsx_runtime.jsxs)("div", {
							ref: (node) => {
								setRowRef(id, node);
							},
							"data-sortable-row": "true",
							style: {
								...rowChromeStyle,
								gridTemplateColumns: rowGridColumns,
								visibility: dragging ? "hidden" : "visible",
								pointerEvents: dragging ? "none" : "auto",
								borderColor: dragging ? "transparent" : "var(--dsw-alias-border-l2)",
								boxShadow: targeted ? "0 0 0 2px color-mix(in srgb, var(--dsw-alias-state-business-primary) 20%, transparent)" : "none"
							},
							onPointerDown: (event) => {
								const target = event.target;
								if (target instanceof Element && target.closest("a, input, select, textarea, label, button:not([data-sortable-handle])") !== null) return;
								startDrag(event, id);
							},
							children: [
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									"data-sortable-handle": "",
									style: {
										...handleStyle,
										display: showHandle ? "flex" : "none",
										...plain ? { borderRight: 0 } : {},
										cursor: disabled ? "default" : draggedId === null ? "grab" : "grabbing"
									},
									"aria-label": dragLabel(item, index),
									"aria-grabbed": dragging,
									title: dragLabel(item, index),
									disabled,
									hidden: !showHandle,
									onDragStart: (event) => {
										event.preventDefault();
									},
									onPointerDown: (event) => {
										startDrag(event, id);
									},
									onKeyDown: (event) => {
										handleKeyDown(event, id);
									},
									children: (0, react_jsx_runtime.jsx)(IconGrip, {})
								}),
								(0, react_jsx_runtime.jsx)("div", {
									"data-sortable-item": "",
									style: rowItemStyle,
									children: renderItem(item, index)
								}),
								moveButtons ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									"data-sortable-move": "up",
									style: {
										...moveButtonStyle,
										display: showHandle ? "inline-flex" : "none"
									},
									"aria-label": upLabel(item, index),
									title: upLabel(item, index),
									disabled: !interactive || index === 0,
									hidden: !showHandle,
									onClick: () => {
										moveBy(id, -1);
									},
									children: "↑"
								}), (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									"data-sortable-move": "down",
									style: {
										...moveButtonStyle,
										display: showHandle ? "inline-flex" : "none"
									},
									"aria-label": downLabel(item, index),
									title: downLabel(item, index),
									disabled: !interactive || index === renderedItems.length - 1,
									hidden: !showHandle,
									onClick: () => {
										moveBy(id, 1);
									},
									children: "↓"
								})] }) : null
							]
						}, id);
					}),
					dragGhost !== null && draggedItem !== void 0 ? (0, react_jsx_runtime.jsxs)("div", {
						"data-sortable-row": "true",
						"data-sortable-ghost": "true",
						"aria-hidden": "true",
						ref: setGhostInert,
						style: {
							...rowChromeStyle,
							gridTemplateColumns: rowGridColumns,
							position: "fixed",
							boxSizing: "border-box",
							left: dragGhost.x,
							top: dragGhost.y,
							width: dragGhost.width,
							minHeight: dragGhost.height,
							zIndex: 1e4,
							pointerEvents: "none",
							opacity: .96,
							boxShadow: "var(--dsw-shadow-lv2, 0 10px 30px rgba(0, 0, 0, 0.18))",
							outline: "2px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 22%, transparent)"
						},
						children: [
							(0, react_jsx_runtime.jsx)("div", {
								"data-sortable-handle": "",
								style: {
									...handleStyle,
									display: showHandle ? "flex" : "none",
									...plain ? { borderRight: 0 } : {},
									cursor: "grabbing"
								},
								children: (0, react_jsx_runtime.jsx)(IconGrip, {})
							}),
							(0, react_jsx_runtime.jsx)("div", {
								"data-sortable-item": "",
								style: rowItemStyle,
								children: renderItem(draggedItem, renderedItems.findIndex((item) => getId(item) === draggedId))
							}),
							moveButtons && showHandle ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
								"aria-hidden": "true",
								style: {
									...moveButtonStyle,
									visibility: "hidden"
								},
								children: "↑"
							}), (0, react_jsx_runtime.jsx)("span", {
								"aria-hidden": "true",
								style: {
									...moveButtonStyle,
									visibility: "hidden"
								},
								children: "↓"
							})] }) : null
						]
					}) : null
				]
			});
		}
		function sameOrder(left, right, getId) {
			return left.length === right.length && left.every((item, index) => {
				const other = right[index];
				return other !== void 0 && getId(item) === getId(other);
			});
		}
		//#endregion
		//#region src/client/model-catalog-ui.tsx
		const inputStyle = {
			boxSizing: "border-box",
			width: "100%",
			minHeight: 36,
			border: "1px solid var(--dsw-alias-border-l2)",
			borderRadius: 8,
			padding: "7px 10px",
			background: "var(--dsw-alias-bg-layer-1)",
			color: "var(--dsw-alias-label-primary)",
			font: "inherit"
		};
		const rowInputStyle = {
			...inputStyle,
			minHeight: 32,
			padding: "4px 10px"
		};
		const selectStyle = {
			boxSizing: "border-box",
			minHeight: 32,
			border: "1px solid var(--dsw-alias-border-l2)",
			borderRadius: 8,
			padding: "4px 28px 4px 10px",
			backgroundColor: "var(--dsw-alias-bg-layer-1)",
			color: "var(--dsw-alias-label-primary)",
			font: "inherit",
			appearance: "none",
			backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 6l4 4 4-4' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
			backgroundRepeat: "no-repeat",
			backgroundPosition: "right 8px center"
		};
		const rowStyle = {
			display: "grid",
			gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
			gap: 10
		};
		const modelContentStyle = {
			display: "grid",
			gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr) auto auto",
			alignItems: "center",
			gap: 6,
			padding: "6px 8px"
		};
		const modelDetailStyle = {
			display: "flex",
			flexDirection: "column",
			gap: 10,
			borderTop: "1px solid var(--dsw-alias-border-l2)",
			padding: "10px 4px 4px"
		};
		const capabilitiesStyle = {
			display: "flex",
			alignItems: "center",
			flexWrap: "wrap",
			gap: 14
		};
		const fieldStyle = {
			display: "flex",
			flexDirection: "column",
			gap: 6
		};
		const labelStyle = {
			fontSize: 13,
			color: "var(--dsw-alias-label-secondary)"
		};
		/** Small interface that hides the shared styles behind layout components. */
		function ModelCatalogDetails({ children }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				style: {
					...modelDetailStyle,
					gridColumn: "1 / -1"
				},
				children
			});
		}
		function ModelCatalogRow({ children }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				style: rowStyle,
				children
			});
		}
		function ModelCatalogCapabilities({ children }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				style: capabilitiesStyle,
				children
			});
		}
		//#endregion
		//#region src/client/CursorPluginCard.tsx
		/** Cursor Plugin configuration card: Host-owned login, usage, and an editable catalog. */
		/** Display name recorded with the cached headline quota. */
		const USAGE_PROVIDER_NAME = "Cursor";
		const cardStyle = { overflow: "visible" };
		const bodyStyle = {
			display: "flex",
			flexDirection: "column",
			gap: 18,
			borderTop: "1px solid var(--dsw-alias-border-l2)",
			padding: "16px 14px 18px"
		};
		const sectionStyle = {
			display: "flex",
			flexDirection: "column",
			gap: 12
		};
		const sectionTitleStyle = {
			margin: 0,
			fontSize: 14,
			lineHeight: "20px",
			fontWeight: 600,
			color: "var(--dsw-alias-label-primary)"
		};
		const hintStyle = {
			margin: 0,
			fontSize: 12,
			color: "var(--dsw-alias-label-tertiary)"
		};
		const statusStyle$1 = {
			margin: 0,
			fontSize: 13,
			color: "var(--dsw-alias-label-secondary)"
		};
		const errorStyle$1 = {
			...statusStyle$1,
			color: "var(--dsw-alias-state-error-primary)"
		};
		const buttonStyle = {
			alignSelf: "flex-start",
			minHeight: 34,
			border: "1px solid var(--dsw-alias-border-l2)",
			borderRadius: 18,
			padding: "6px 14px",
			background: "var(--dsw-alias-bg-layer-1)",
			color: "var(--dsw-alias-label-primary)",
			font: "inherit",
			cursor: "pointer"
		};
		const primaryButtonStyle = {
			...buttonStyle,
			borderColor: "var(--dsw-alias-button-primary-fill)",
			background: "var(--dsw-alias-button-primary-fill)",
			color: "var(--dsw-alias-label-primary-foreground)"
		};
		const actionsStyle = {
			display: "flex",
			alignItems: "center",
			justifyContent: "flex-end",
			gap: 10
		};
		const iconButtonStyle = {
			boxSizing: "border-box",
			width: 28,
			height: 28,
			display: "inline-flex",
			alignItems: "center",
			justifyContent: "center",
			flex: "none",
			border: 0,
			borderRadius: 6,
			padding: 0,
			background: "transparent",
			color: "var(--dsw-alias-label-tertiary)",
			font: "inherit",
			cursor: "pointer"
		};
		const disclosureStyle = {
			display: "inline-flex",
			alignItems: "center",
			gap: 8,
			minWidth: 0,
			border: 0,
			padding: 0,
			background: "transparent",
			color: "var(--dsw-alias-label-primary)",
			font: "inherit",
			textAlign: "left",
			cursor: "pointer"
		};
		let nextModelRow = 0;
		function newModelRowId() {
			nextModelRow += 1;
			return "cursor-model-row-" + String(nextModelRow);
		}
		function integerOf(text) {
			const trimmed = text.trim();
			if (trimmed.length === 0) return void 0;
			if (!/^[1-9]\d*$/u.test(trimmed)) return NaN;
			return Number(trimmed);
		}
		function modelDraftOf(model) {
			const thinking = model.thinking;
			const defaultEffort = thinking === false ? void 0 : model.defaultEffort;
			return {
				rowId: newModelRowId(),
				id: model.id,
				contextWindow: model.contextWindow === void 0 ? "" : String(model.contextWindow),
				...model.name === void 0 ? {} : { name: model.name },
				...thinking === void 0 ? {} : { thinking },
				...model.vision === void 0 ? {} : { vision: model.vision },
				...model.maxMode === void 0 ? {} : { maxMode: model.maxMode },
				...defaultEffort === void 0 ? {} : { defaultEffort },
				...model.variants === void 0 ? {} : { variants: model.variants }
			};
		}
		function draftOf(settings) {
			return { models: groupCursorModels(settings.models ?? CURSOR_CATALOG).map(modelDraftOf) };
		}
		function sameDraft(left, right) {
			return JSON.stringify(left) === JSON.stringify(right);
		}
		function modelSettingsOf(draft) {
			const contextWindow = integerOf(draft.contextWindow);
			const thinking = draft.thinking;
			const defaultEffort = thinking === false ? void 0 : draft.defaultEffort;
			return {
				id: draft.id.trim(),
				...draft.name === void 0 || draft.name.trim().length === 0 ? {} : { name: draft.name.trim() },
				...thinking === void 0 ? {} : { thinking },
				...draft.vision === void 0 ? {} : { vision: draft.vision },
				...draft.maxMode === void 0 ? {} : { maxMode: draft.maxMode },
				...defaultEffort === void 0 ? {} : { defaultEffort },
				...contextWindow === void 0 || Number.isNaN(contextWindow) ? {} : { contextWindow },
				...draft.variants === void 0 || draft.variants.length === 0 ? {} : { variants: [...draft.variants] }
			};
		}
		function settingsOf(draft, current) {
			return {
				...current,
				models: draft.models.map(modelSettingsOf)
			};
		}
		function modelFailure(models) {
			const ids = /* @__PURE__ */ new Set();
			for (const model of models) {
				const id = model.id.trim();
				if (id.length === 0 || ids.has(id)) return true;
				if (Number.isNaN(integerOf(model.contextWindow))) return true;
				ids.add(id);
			}
			return false;
		}
		function formatSignedIn(t, email) {
			if (email === void 0) return t("signedInNoEmail");
			return t("signedInAs").replace("{email}", email);
		}
		function messageOf(error, fallback) {
			return error instanceof Error && error.message.length > 0 ? error.message : fallback;
		}
		function Capability({ label, checked, disabled, onChange }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
				style: {
					...labelStyle,
					display: "inline-flex",
					alignItems: "center",
					gap: 6
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked,
					disabled,
					onChange: (event) => {
						onChange(event.target.checked);
					}
				}), label]
			});
		}
		function IconChevron({ open }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: "12",
				height: "12",
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": true,
				style: {
					flex: "none",
					transform: open ? "rotate(90deg)" : "none",
					transition: "transform 120ms ease"
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M6 3.5L10.5 8L6 12.5",
					stroke: "currentColor",
					strokeWidth: "1.5",
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})
			});
		}
		function IconTrash() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: "14",
				height: "14",
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": true,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M2.5 4h11M6.5 4V2.5h3V4M4 4l.7 9a1 1 0 001 .9h4.6a1 1 0 001-.9L12 4M6.5 6.8v4.4M9.5 6.8v4.4",
					stroke: "currentColor",
					strokeWidth: "1.3",
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})
			});
		}
		function UsageBar({ usedText, unlimitedText, window: quota }) {
			const label = quota.period === void 0 ? quota.id : `${quota.id} (${quota.period})`;
			if (quota.limit <= 0 && quota.unit !== "percent") return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					alignItems: "baseline",
					justifyContent: "space-between",
					gap: 10
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					style: labelStyle,
					children: label
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					style: hintStyle,
					children: `${usedText} ${String(quota.used)} / ${unlimitedText}`
				})]
			});
			const remaining = quota.unit === "percent" ? 100 - quota.used : 100 * (1 - quota.used / quota.limit);
			if (!Number.isFinite(remaining) || remaining < 0 || remaining > 100) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					alignItems: "baseline",
					justifyContent: "space-between",
					gap: 10
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					style: labelStyle,
					children: label
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					style: hintStyle,
					children: `${usedText} ${String(quota.used)} / ${String(quota.limit)}`
				})]
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ProviderQuotaMeter, {
				remainingPercent: Math.round(remaining * 10) / 10,
				label
			});
		}
		/** Headline remaining quota from real auth values; missing renders no meter, never zero. */
		function headlineQuotaOf(view, detail) {
			const windows = view?.windows ?? [];
			for (const window of windows) {
				if (window.limit <= 0) continue;
				const remaining = window.unit === "percent" ? 100 - window.used : 100 * (1 - window.used / window.limit);
				if (!Number.isFinite(remaining) || remaining < 0 || remaining > 100) continue;
				return {
					remainingPercent: Math.round(remaining * 10) / 10,
					label: window.period ?? window.id,
					...detail === void 0 ? {} : { detail }
				};
			}
		}
		function CursorPluginCard(props) {
			const { t, startAuth, cancelAuth, readAuthStatus, logout, fetchUsage, discoverModels } = props;
			const snapshot = props.useCursorSettings((value) => value);
			const [open, setOpen] = (0, react.useState)(false);
			const initial = (0, react.useMemo)(() => snapshot.value === void 0 ? void 0 : draftOf(snapshot.value), [snapshot.value]);
			const [source, setSource] = (0, react.useState)(initial);
			const [draft, setDraft] = (0, react.useState)(initial);
			const [sourceRevision, setSourceRevision] = (0, react.useState)(snapshot.revision);
			const [auth, setAuth] = (0, react.useState)({ kind: "unknown" });
			const [authAttemptId, setAuthAttemptId] = (0, react.useState)();
			const [usage, setUsage] = (0, react.useState)({ status: "idle" });
			const [lastUsage, setLastUsage] = (0, react.useState)(void 0);
			const [usageUpdatedAt, setUsageUpdatedAt] = (0, react.useState)(void 0);
			/** Drops late usage reads mid-flight across account change and unmount. */
			const usageEpoch = (0, react.useRef)(0);
			/** Parked usage state and in-flight reads belong to the previous account: drop both. */
			const noteAccountChange = () => {
				usageEpoch.current += 1;
				setLastUsage(void 0);
				setUsageUpdatedAt(void 0);
				setUsage({ status: "idle" });
			};
			const [busy, setBusy] = (0, react.useState)(false);
			const [fetching, setFetching] = (0, react.useState)(false);
			const [failure, setFailure] = (0, react.useState)(void 0);
			const [notice, setNotice] = (0, react.useState)(void 0);
			const [catalogOpen, setCatalogOpen] = (0, react.useState)(false);
			const [modelSorting, setModelSorting] = (0, react.useState)(false);
			const [expandedModels, setExpandedModels] = (0, react.useState)(/* @__PURE__ */ new Set());
			const dirty = source !== void 0 && draft !== void 0 && !sameDraft(source, draft);
			const title = t("title");
			(0, react.useEffect)(() => {
				if (snapshot.status !== "ready" || snapshot.value === void 0) return;
				if (snapshot.revision === sourceRevision) return;
				if (dirty) return;
				const next = draftOf(snapshot.value);
				setSource(next);
				setDraft(next);
				setSourceRevision(snapshot.revision);
			}, [
				dirty,
				snapshot.revision,
				snapshot.status,
				snapshot.value,
				sourceRevision
			]);
			(0, react.useEffect)(() => () => {
				props.closeModelPicker();
			}, [props.closeModelPicker]);
			(0, react.useEffect)(() => () => {
				usageEpoch.current += 1;
			}, []);
			const loadUsage = async (refresh = false) => {
				const request = usageEpoch.current;
				setUsage({ status: "loading" });
				try {
					const read = await fetchUsage(refresh);
					if (request !== usageEpoch.current) return;
					if (read.status === "logged-out") {
						noteAccountChange();
						setAuth({ kind: "signed-out" });
						return;
					}
					if (read.status === "unsupported") {
						setUsage({ status: "unsupported" });
						return;
					}
					setLastUsage(read.usage);
					setUsageUpdatedAt(/* @__PURE__ */ new Date());
					setUsage({
						status: "ready",
						usage: read.usage
					});
					rememberHeadlineQuota$1("llm-cursor", "Cursor", headlineQuotaOf(read.usage, void 0));
				} catch (error) {
					if (request !== usageEpoch.current) return;
					setUsage({
						status: "error",
						message: messageOf(error, t("usageFailed"))
					});
				}
			};
			(0, react.useEffect)(() => {
				let cancelled = false;
				const request = usageEpoch.current;
				readAuthStatus().then((status) => {
					if (cancelled || request !== usageEpoch.current) return;
					if (status.loggedIn) {
						setAuth({
							kind: "signed-in",
							...status.email === void 0 ? {} : { email: status.email }
						});
						return;
					}
					setAuth({ kind: "signed-out" });
					noteAccountChange();
				}).catch(() => {
					if (!cancelled && request === usageEpoch.current) {
						setAuth({
							kind: "unknown",
							message: t("statusFailed")
						});
						setUsage({ status: "idle" });
					}
				});
				return () => {
					cancelled = true;
				};
			}, [readAuthStatus, t]);
			(0, react.useEffect)(() => {
				if (authAttemptId === void 0) return;
				let cancelled = false;
				let timer;
				const poll = async () => {
					try {
						const status = await readAuthStatus(authAttemptId);
						if (cancelled) return;
						if (status.loggedIn || status.attempt === "succeeded") {
							setAuthAttemptId(void 0);
							setAuth({
								kind: "signed-in",
								...status.email === void 0 ? {} : { email: status.email }
							});
							noteAccountChange();
							return;
						}
						if (status.attempt === "failed" || status.attempt === "cancelled") {
							setAuthAttemptId(void 0);
							setAuth({
								kind: "signed-out",
								message: status.message ?? t("signInFailed")
							});
							return;
						}
						timer = setTimeout(() => {
							poll();
						}, 1e3);
					} catch {
						if (!cancelled) timer = setTimeout(() => {
							poll();
						}, 1e3);
					}
				};
				window.addEventListener("focus", poll);
				document.addEventListener("visibilitychange", poll);
				poll();
				return () => {
					cancelled = true;
					window.removeEventListener("focus", poll);
					document.removeEventListener("visibilitychange", poll);
					if (timer !== void 0) clearTimeout(timer);
				};
			}, [
				authAttemptId,
				readAuthStatus,
				t
			]);
			(0, react.useEffect)(() => {
				if (auth.kind !== "signed-in" || usage.status !== "idle") return;
				loadUsage();
			}, [auth.kind, usage.status]);
			if (snapshot.status === "unavailable") return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
				style: cardStyle,
				"data-provider-card": "",
				"data-provider-role": "llm",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("style", { children: providerUiCss }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						"data-provider-card-header": "",
						"aria-expanded": open,
						"aria-label": t(open ? "collapse" : "expand") + ": " + title,
						onClick: () => {
							setOpen(!open);
						},
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ProviderCardHeader, {
							title,
							mark: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BrandMark, {}),
							summary: t("summaryModels").replace("{count}", "0"),
							status: t("summaryOff"),
							open,
							role: "llm"
						})
					}),
					open ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: bodyStyle,
						"data-provider-body": "",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							style: statusStyle$1,
							role: "status",
							children: t("settingsUnavailable")
						})
					}) : null
				]
			});
			const disabled = snapshot.status !== "ready" || !snapshot.writable || busy || auth.kind === "signing-in";
			const customModels = snapshot.user !== void 0 && Object.prototype.hasOwnProperty.call(snapshot.user, "models");
			const invalid = draft !== void 0 && modelFailure(draft.models);
			const patchDraft = (next) => {
				setDraft((current) => current === void 0 ? current : {
					...current,
					...next
				});
				setFailure(void 0);
				setNotice(void 0);
			};
			const patchModel = (index, patch) => {
				if (draft === void 0) return;
				patchDraft({ models: draft.models.map((model, at) => {
					if (at !== index) return model;
					const next = { ...model };
					if (patch.id !== void 0) next.id = patch.id;
					if ("name" in patch) {
						if (patch.name === void 0) delete next.name;
						else next.name = patch.name;
					}
					if ("thinking" in patch) {
						if (patch.thinking === void 0) delete next.thinking;
						else next.thinking = patch.thinking;
						if (patch.thinking === false) delete next.defaultEffort;
					}
					if ("vision" in patch) {
						if (patch.vision === void 0) delete next.vision;
						else next.vision = patch.vision;
					}
					if ("maxMode" in patch) {
						if (patch.maxMode === void 0) delete next.maxMode;
						else next.maxMode = patch.maxMode;
					}
					if ("defaultEffort" in patch) {
						if (patch.defaultEffort === void 0) delete next.defaultEffort;
						else next.defaultEffort = patch.defaultEffort;
					}
					return next;
				}) });
			};
			const removeModel = (index) => {
				if (draft === void 0) return;
				patchDraft({ models: draft.models.filter((_, at) => at !== index) });
			};
			const toggleModel = (key) => {
				setExpandedModels((current) => {
					const next = new Set(current);
					if (!next.delete(key)) next.add(key);
					return next;
				});
			};
			/** Provider-specific fields for one expanded model row; shared by both layouts. */
			const modelExtra = (model, index) => {
				const label = model.id.trim().length > 0 ? model.id.trim() : String(index + 1);
				const efforts = effortsForCursorModel(modelSettingsOf(model));
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(ModelCatalogDetails, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ModelCatalogRow, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
					style: fieldStyle,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: labelStyle,
						children: t("contextWindow")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						style: inputStyle,
						inputMode: "numeric",
						placeholder: t("contextWindowDefault"),
						value: model.contextWindow,
						disabled,
						"aria-label": t("contextWindow"),
						onChange: (event) => {
							patchModel(index, { contextWindow: event.target.value });
						}
					})]
				}) }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(ModelCatalogCapabilities, { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Capability, {
						label: t("vision"),
						checked: model.vision === true,
						disabled,
						onChange: (vision) => {
							patchModel(index, { vision });
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Capability, {
						label: t("thinking"),
						checked: model.thinking === true,
						disabled,
						onChange: (thinking) => {
							patchModel(index, { thinking });
						}
					}),
					efforts.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						style: {
							...labelStyle,
							display: "inline-flex",
							alignItems: "center",
							gap: 6
						},
						children: [t("defaultEffort"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
							style: selectStyle,
							value: model.defaultEffort ?? efforts[0] ?? "",
							disabled: disabled || model.thinking === false,
							"aria-label": t("defaultEffort") + " " + label,
							onChange: (event) => {
								const value = event.target.value;
								const effort = efforts.find((entry) => entry === value);
								patchModel(index, { defaultEffort: effort });
							},
							children: efforts.map((effort) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: effort,
								children: CURSOR_EFFORT_LABELS[effort]
							}, effort))
						})]
					}) : null
				] })] });
			};
			const onSignIn = async () => {
				setAuth({ kind: "signing-in" });
				noteAccountChange();
				try {
					const started = await startAuth();
					if (!started.ok) {
						setAuth({
							kind: "signed-out",
							message: started.message || t("signInFailed"),
							...started.fallbackUrl === void 0 ? {} : { fallbackUrl: started.fallbackUrl }
						});
						return;
					}
					if ("attemptId" in started) {
						setAuthAttemptId(started.attemptId);
						setAuth({
							kind: "signing-in",
							...started.popupBlocked && started.fallbackUrl !== void 0 ? { fallbackUrl: started.fallbackUrl } : {}
						});
						return;
					}
					const status = await readAuthStatus();
					if (status.loggedIn) noteAccountChange();
					setAuth(status.loggedIn ? {
						kind: "signed-in",
						...status.email === void 0 ? {} : { email: status.email }
					} : {
						kind: "signed-out",
						message: t("signInFailed")
					});
				} catch {
					setAuth({
						kind: "signed-out",
						message: t("signInFailed")
					});
				}
			};
			const onCancelSignIn = async () => {
				if (authAttemptId === void 0) return;
				try {
					await cancelAuth(authAttemptId);
				} catch {}
				setAuthAttemptId(void 0);
				setAuth({ kind: "signed-out" });
			};
			const onSignOut = async () => {
				try {
					await logout();
					setAuth({ kind: "signed-out" });
					noteAccountChange();
				} catch {
					setAuth((current) => current.kind === "signed-in" ? current : {
						kind: "signed-out",
						message: t("signOutFailed")
					});
				}
			};
			const fetchModels = async () => {
				if (draft === void 0) return;
				if (auth.kind !== "signed-in") {
					setFailure(t("fetchNeedsSignIn"));
					return;
				}
				const currentModels = draft.models.map(modelSettingsOf);
				const initiallyPicked = /* @__PURE__ */ new Set();
				for (const model of currentModels) {
					initiallyPicked.add(model.id);
					for (const variant of model.variants ?? []) initiallyPicked.add(variant.wireId);
				}
				setFetching(true);
				setFailure(void 0);
				setNotice(void 0);
				props.beginModelPicker(initiallyPicked, (selected) => {
					setDraft((current) => {
						if (current === void 0) return current;
						const currentById = new Map(current.models.map((model) => [model.id.trim(), model]));
						const next = /* @__PURE__ */ new Map();
						for (const candidate of selected) {
							const existing = currentById.get(candidate.id);
							const discovered = modelDraftOf(candidate);
							const efforts = effortsForCursorModel(candidate);
							const kept = existing?.defaultEffort !== void 0 && efforts.includes(existing.defaultEffort) ? existing.defaultEffort : discovered.defaultEffort;
							next.set(candidate.id, existing === void 0 ? discovered : {
								...existing,
								...discovered,
								rowId: existing.rowId,
								...kept === void 0 ? {} : { defaultEffort: kept }
							});
						}
						return {
							...current,
							models: [...next.values()]
						};
					});
					setCatalogOpen(true);
					setFailure(void 0);
					setNotice(void 0);
				});
				try {
					const found = await discoverModels();
					if (found.length === 0) {
						const message = t("fetchEmpty");
						props.failModelPicker(message);
						setFailure(message);
						return;
					}
					const foundWires = new Set(found.flatMap((model) => [model.id, ...model.variants?.map((variant) => variant.wireId) ?? []]));
					const currentOnly = currentModels.filter((model) => !foundWires.has(model.id) && !(model.variants?.some((variant) => foundWires.has(variant.wireId)) ?? false));
					props.completeModelPicker(groupCursorModels([...found, ...currentOnly], "brand"));
				} catch (error) {
					const message = messageOf(error, t("requestFailed"));
					props.failModelPicker(message);
					setFailure(message);
				} finally {
					setFetching(false);
				}
			};
			const discard = () => {
				if (source !== void 0) setDraft(structuredClone(source));
				setFailure(void 0);
				setNotice(void 0);
			};
			const save = async () => {
				if (draft === void 0 || snapshot.value === void 0 || invalid) return;
				setBusy(true);
				setFailure(void 0);
				setNotice(void 0);
				try {
					const accepted = await props.saveConfiguration(settingsOf(draft, snapshot.value));
					const next = draftOf(accepted.settings);
					setSource(next);
					setDraft(next);
					setSourceRevision(accepted.revision);
					setNotice(t("saved"));
				} catch (error) {
					setFailure(messageOf(error, t("requestFailed")));
				} finally {
					setBusy(false);
				}
			};
			const statusLabel = auth.kind === "unknown" ? auth.message ?? t("loading") : auth.kind === "signing-in" ? t("signingIn") : auth.kind === "signed-in" ? formatSignedIn(t, auth.email) : auth.message ?? t("signedOut");
			const modelCount = draft?.models.length ?? snapshot.value?.models?.length ?? 0;
			const headerCount = t("summaryModels").replace("{count}", String(modelCount));
			const usageView = usage.status === "ready" ? usage.usage : lastUsage;
			const liveQuota = auth.kind === "signed-in" ? headlineQuotaOf(usageView, resetLabelOf(usageView?.resetsAt, {
				at: t("usageResetAt"),
				atDays: t("usageResetAtDays")
			})) : void 0;
			const withheld = auth.kind === "signed-out" || auth.kind === "signing-in" || usage.status === "error" || usage.status === "unsupported";
			const headerQuota = useProviderQuotaCache(CURSOR_SETTINGS_NAMESPACE, USAGE_PROVIDER_NAME, liveQuota ?? null, {
				answered: auth.kind !== "unknown",
				signedOut: auth.kind === "signed-out",
				withheld
			});
			const modelsList = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SortableList, {
				items: draft?.models ?? [],
				getId: (model) => model.rowId,
				disabled,
				sorting: modelSorting,
				dragLabel: (model, index) => {
					const label = model.id.trim().length > 0 ? model.id.trim() : String(index + 1);
					return t("dragModel") + ": " + label;
				},
				moveButtons: true,
				moveUpLabel: (model, index) => {
					const label = model.id.trim().length > 0 ? model.id.trim() : String(index + 1);
					return t("moveUp") + ": " + label;
				},
				moveDownLabel: (model, index) => {
					const label = model.id.trim().length > 0 ? model.id.trim() : String(index + 1);
					return t("moveDown") + ": " + label;
				},
				onReorder: (models) => {
					patchDraft({ models });
				},
				renderItem: (model, index) => {
					const expanded = expandedModels.has(model.rowId);
					const label = model.id.trim().length > 0 ? model.id.trim() : String(index + 1);
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						"data-model-row": label,
						"data-provider-model": "",
						style: modelContentStyle,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								style: rowInputStyle,
								value: model.id,
								placeholder: t("modelId"),
								"aria-label": t("modelId") + " " + String(index + 1),
								disabled,
								onChange: (event) => {
									patchModel(index, { id: event.target.value });
								}
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								style: rowInputStyle,
								value: model.name ?? "",
								placeholder: t("modelName"),
								"aria-label": t("modelName") + " " + String(index + 1),
								disabled,
								onChange: (event) => {
									patchModel(index, { name: event.target.value || void 0 });
								}
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: iconButtonStyle,
								"aria-label": t("modelDetails") + ": " + label,
								"aria-expanded": expanded,
								title: t("modelDetails"),
								onClick: () => {
									toggleModel(model.rowId);
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevron, { open: expanded })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: iconButtonStyle,
								"aria-label": t("remove") + " " + label,
								title: t("remove"),
								disabled,
								onClick: () => {
									removeModel(index);
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconTrash, {})
							}),
							expanded ? modelExtra(model, index) : null
						]
					});
				}
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				style: {
					...buttonStyle,
					alignSelf: "flex-start"
				},
				disabled,
				onClick: () => {
					const model = {
						rowId: newModelRowId(),
						id: "",
						contextWindow: ""
					};
					patchDraft({ models: [...draft?.models ?? [], model] });
					setExpandedModels((current) => new Set(current).add(model.rowId));
				},
				children: t("addModel")
			})] });
			const draftBlock = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				invalid ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					style: errorStyle$1,
					children: t("invalidModel")
				}) : null,
				failure === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					style: errorStyle$1,
					children: failure
				}),
				notice === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					style: statusStyle$1,
					children: notice
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: actionsStyle,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						style: buttonStyle,
						disabled: !dirty || busy,
						onClick: discard,
						children: t("discard")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						style: primaryButtonStyle,
						disabled: !dirty || invalid || disabled,
						onClick: () => {
							save();
						},
						children: t(busy ? "saving" : "save")
					})]
				})
			] });
			const SharedDetail = props.template;
			const detailCopy = props.copy;
			if (props.mode === "detail" && SharedDetail !== void 0 && detailCopy !== void 0 && draft !== void 0) {
				const accountActions = auth.kind === "signed-in" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					style: buttonStyle,
					disabled: busy,
					onClick: () => {
						onSignOut();
					},
					children: t("signOut")
				}) : auth.kind === "signing-in" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					style: buttonStyle,
					onClick: () => {
						onCancelSignIn();
					},
					children: t("cancel")
				}) }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					style: buttonStyle,
					disabled: busy,
					onClick: () => {
						onSignIn();
					},
					children: t("signIn")
				});
				return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", {
					style: cardStyle,
					"data-provider-card": "",
					"data-provider-role": "llm",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SharedDetail, {
						name: title,
						role: "llm",
						copy: detailCopy,
						notice: t("description"),
						account: {
							state: auth.kind === "signed-in" ? "connected" : "unconnected",
							label: statusLabel,
							actions: accountActions
						},
						quota: {
							status: props.usage?.status ?? "loading",
							windows: props.usage?.windows ?? [],
							...props.onRefresh === void 0 ? {} : { onRefresh: props.onRefresh }
						},
						models: {
							count: draft.models.length,
							allOpen: catalogOpen,
							onToggleAll: () => {
								setCatalogOpen((value) => !value);
							},
							sorting: modelSorting,
							onToggleSorting: () => {
								setModelSorting((value) => !value);
							},
							onChooseFromAccount: () => {
								fetchModels();
							},
							chooseDisabled: fetching || snapshot.status !== "ready" || auth.kind !== "signed-in",
							items: draft.models.map((model) => ({
								rowId: model.rowId,
								id: model.id,
								...model.name === void 0 ? {} : { name: model.name }
							})),
							expanded: [...expandedModels],
							onPatch: (rowId, patch) => {
								const index = draft.models.findIndex((model) => model.rowId === rowId);
								if (index >= 0) patchModel(index, patch);
							},
							onRemove: (rowId) => {
								const index = draft.models.findIndex((model) => model.rowId === rowId);
								if (index >= 0) removeModel(index);
							},
							onToggle: (rowId) => {
								toggleModel(rowId);
							},
							onReorder: (rowIds) => {
								const byId = new Map(draft.models.map((model) => [model.rowId, model]));
								const next = rowIds.map((rowId) => byId.get(rowId)).filter((model) => model !== void 0);
								if (next.length === draft.models.length) patchDraft({ models: next });
							},
							onAdd: () => {
								const model = {
									rowId: newModelRowId(),
									id: "",
									contextWindow: ""
								};
								patchDraft({ models: [...draft.models, model] });
								setExpandedModels((current) => new Set(current).add(model.rowId));
							},
							addDisabled: disabled,
							extra: (row) => {
								const index = draft.models.findIndex((model) => model.rowId === row.rowId);
								const model = draft.models[index];
								return index < 0 || model === void 0 ? null : modelExtra(model, index);
							}
						},
						draft: draftBlock
					})
				});
			}
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
				style: cardStyle,
				"data-provider-card": "",
				"data-provider-role": "llm",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("style", { children: providerUiCss }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						"data-provider-card-header": "",
						"aria-expanded": open,
						"aria-label": t(open ? "collapse" : "expand") + ": " + title,
						onClick: () => {
							setOpen(!open);
						},
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ProviderCardHeader, {
							title,
							mark: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BrandMark, {}),
							summary: headerCount,
							status: statusLabel,
							open,
							unsaved: dirty,
							unsavedLabel: t("unsaved"),
							role: "llm",
							...providerQuotaHeaderProps(headerQuota, {
								dashLabel: t("usage"),
								settled: auth.kind === "signed-in" && (usage.status === "error" || usage.status === "unsupported")
							})
						})
					}),
					open ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: bodyStyle,
						"data-provider-body": "",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								style: hintStyle,
								children: t("description")
							}),
							snapshot.status === "loading" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								style: statusStyle$1,
								children: t("loading")
							}) : null,
							snapshot.status === "ready" && !snapshot.writable ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								style: statusStyle$1,
								children: t("readOnly")
							}) : null,
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
								style: sectionStyle,
								"aria-label": statusLabel,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AuthToolbar, {
									status: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										style: {
											...statusStyle$1,
											margin: 0
										},
										children: statusLabel
									}),
									action: auth.kind === "signed-in" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										style: buttonStyle,
										disabled: busy,
										onClick: () => {
											onSignOut();
										},
										children: t("signOut")
									}) : auth.kind === "signing-in" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [auth.fallbackUrl !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										style: buttonStyle,
										onClick: () => {
											window.open(auth.fallbackUrl, "_blank");
										},
										children: t("signIn")
									}) : null, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										style: buttonStyle,
										onClick: () => {
											onCancelSignIn();
										},
										children: t("cancel")
									})] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										style: buttonStyle,
										disabled: busy,
										onClick: () => {
											onSignIn();
										},
										children: t("signIn")
									})
								}), auth.kind === "signed-out" && auth.fallbackUrl !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									style: buttonStyle,
									onClick: () => {
										window.open(auth.fallbackUrl, "_blank");
									},
									children: t("signIn")
								}) : null]
							}),
							auth.kind === "signed-in" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
								style: sectionStyle,
								"aria-label": t("usage"),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(UsageHeader, {
										title: t("usage"),
										spinning: usage.status === "loading" || usage.status === "idle",
										disabled: usage.status === "loading",
										refreshLabel: t("usageRefresh"),
										busyLabel: t("usageLoading"),
										...usage.status === "error" ? { error: t("usageRefreshFailed") } : {},
										onRefresh: () => {
											loadUsage(true);
										}
									}),
									(() => {
										if (usage.status === "loading" || usage.status === "idle") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UsageSkeleton, { rows: lastUsage?.windows.length ?? 2 });
										const bars = usage.status === "ready" ? usage.usage : lastUsage;
										if (bars !== void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [bars.windows.map((window, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UsageBar, {
											usedText: t("usageUsed"),
											unlimitedText: t("usageUnlimited"),
											window
										}, window.id + ":" + String(index))), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UsageResetAt, { label: resetLabelOf(bars.resetsAt, {
											at: t("usageResetAt"),
											atDays: t("usageResetAtDays")
										}) })] });
										if (usage.status === "unsupported") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
											style: hintStyle,
											children: t("usageUnsupported")
										});
										if (usage.status === "error") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
											style: errorStyle$1,
											children: usage.message
										});
										return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UsageSkeleton, { rows: 2 });
									})(),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(UsageUpdatedAt, {
										at: usageUpdatedAt,
										label: usageUpdatedAt === void 0 ? "" : t("usageUpdatedAt").replace("{time}", formatUsageClock(usageUpdatedAt))
									})
								]
							}) : null,
							draft === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
								style: sectionStyle,
								"aria-label": t("models"),
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										gap: 10
									},
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										style: disclosureStyle,
										"aria-expanded": catalogOpen,
										"aria-label": t("models"),
										onClick: () => {
											setCatalogOpen(!catalogOpen);
										},
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevron, { open: catalogOpen }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												style: sectionTitleStyle,
												children: t("models")
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												style: hintStyle,
												children: customModels ? t("customized") : t("inherited")
											})
										]
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										style: {
											display: "inline-flex",
											gap: 8
										},
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											style: buttonStyle,
											"aria-pressed": modelSorting,
											disabled: disabled || draft.models.length < 2,
											onClick: () => {
												setModelSorting((current) => !current);
											},
											children: t(modelSorting ? "doneSorting" : "sortModels")
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											style: buttonStyle,
											disabled: fetching || snapshot.status !== "ready" || auth.kind !== "signed-in",
											onClick: () => {
												fetchModels();
											},
											children: t(fetching ? "fetchingModels" : "fetchModels")
										})]
									})]
								}), catalogOpen ? modelsList : null]
							}),
							draftBlock
						]
					}) : null
				]
			});
		}
		//#endregion
		//#region src/client/CursorModelPicker.tsx
		/** Frame-level model selection overlay opened by the Cursor settings card. */
		var CursorModelPickerController = class {
			snapshot = {
				open: false,
				loading: false,
				candidates: [],
				picked: /* @__PURE__ */ new Set()
			};
			listeners = /* @__PURE__ */ new Set();
			onAdopt;
			getSnapshot = () => this.snapshot;
			subscribe = (listener) => {
				this.listeners.add(listener);
				return () => {
					this.listeners.delete(listener);
				};
			};
			begin(onAdopt, initiallyPicked = /* @__PURE__ */ new Set()) {
				this.onAdopt = onAdopt;
				this.publish({
					open: true,
					loading: true,
					candidates: [],
					picked: new Set(initiallyPicked)
				});
			}
			complete(candidates) {
				if (!this.snapshot.open || !this.snapshot.loading) return;
				const picked = /* @__PURE__ */ new Set();
				for (const candidate of candidates) {
					if (this.snapshot.picked.has(candidate.id)) {
						picked.add(candidate.id);
						continue;
					}
					if (candidate.variants?.some((variant) => this.snapshot.picked.has(variant.wireId))) picked.add(candidate.id);
				}
				this.publish({
					open: true,
					loading: false,
					candidates: [...candidates],
					picked
				});
			}
			fail(message) {
				if (!this.snapshot.open || !this.snapshot.loading) return;
				this.publish({
					open: true,
					loading: false,
					candidates: [],
					picked: /* @__PURE__ */ new Set(),
					error: message
				});
			}
			close = () => {
				this.onAdopt = void 0;
				this.publish({
					open: false,
					loading: false,
					candidates: [],
					picked: /* @__PURE__ */ new Set()
				});
			};
			toggle = (id) => {
				const picked = new Set(this.snapshot.picked);
				if (picked.has(id)) picked.delete(id);
				else picked.add(id);
				this.publish({
					...this.snapshot,
					picked
				});
			};
			adopt = () => {
				if (this.snapshot.loading || this.snapshot.error !== void 0) return;
				const callback = this.onAdopt;
				const selected = this.snapshot.candidates.filter((model) => this.snapshot.picked.has(model.id));
				this.close();
				callback?.(selected);
			};
			publish(snapshot) {
				this.snapshot = snapshot;
				for (const listener of this.listeners) listener();
			}
		};
		const rootStyle = {
			position: "fixed",
			inset: 0,
			zIndex: 1e3,
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			boxSizing: "border-box",
			padding: 24
		};
		const maskStyle = {
			position: "absolute",
			inset: 0,
			background: "var(--dsw-alias-bg-mask-1)",
			backdropFilter: "var(--dsw-mask-blur)"
		};
		const dialogStyle = {
			position: "relative",
			zIndex: 1,
			display: "flex",
			flexDirection: "column",
			width: "min(520px, 100%)",
			maxHeight: "min(680px, calc(100vh - 48px))",
			overflow: "hidden",
			border: "1px solid var(--dsw-alias-border-inverted)",
			borderRadius: 24,
			background: "var(--dsw-alias-bg-layer-2)",
			boxShadow: "var(--dsw-shadow-lv3)",
			color: "var(--dsw-alias-label-primary)"
		};
		const headerStyle = {
			display: "flex",
			alignItems: "center",
			justifyContent: "space-between",
			gap: 8,
			padding: "22px 14px 12px 24px"
		};
		const titleStyle = {
			margin: 0,
			fontSize: 16,
			lineHeight: "24px",
			fontWeight: 500
		};
		const closeStyle = {
			display: "inline-flex",
			alignItems: "center",
			justifyContent: "center",
			width: 28,
			height: 28,
			border: 0,
			borderRadius: 8,
			background: "transparent",
			color: "var(--dsw-alias-label-secondary)",
			cursor: "pointer",
			fontSize: 22
		};
		const descriptionStyle = {
			margin: 0,
			padding: "0 24px",
			fontSize: 14,
			lineHeight: "22px",
			color: "var(--dsw-alias-label-primary)"
		};
		const searchStyle = {
			boxSizing: "border-box",
			width: "calc(100% - 48px)",
			minHeight: 36,
			margin: "16px 24px 0",
			border: "1px solid var(--dsw-alias-border-l2)",
			borderRadius: 8,
			padding: "7px 10px",
			background: "var(--dsw-alias-bg-layer-1)",
			color: "var(--dsw-alias-label-primary)",
			font: "inherit"
		};
		const listStyle = {
			display: "flex",
			flexDirection: "column",
			gap: 16,
			minHeight: 0,
			margin: "12px 24px 20px",
			padding: 0,
			overflowY: "auto",
			listStyle: "none"
		};
		const brandHeaderStyle = {
			padding: "2px 0 0",
			fontSize: 12,
			lineHeight: "18px",
			fontWeight: 600,
			color: "var(--dsw-alias-label-tertiary)"
		};
		const brandListStyle = {
			display: "flex",
			flexDirection: "column",
			gap: 10,
			margin: 0,
			padding: 0,
			listStyle: "none"
		};
		const candidateStyle = {
			display: "flex",
			alignItems: "center",
			gap: 10,
			fontSize: 14,
			lineHeight: "22px",
			cursor: "pointer"
		};
		const statusStyle = {
			display: "flex",
			alignItems: "center",
			minHeight: 96,
			margin: "20px 24px",
			fontSize: 14,
			lineHeight: "22px",
			color: "var(--dsw-alias-label-secondary)"
		};
		const errorStyle = {
			...statusStyle,
			color: "var(--dsw-alias-state-error-primary)"
		};
		const footerStyle = {
			display: "flex",
			alignItems: "center",
			justifyContent: "flex-end",
			gap: 8,
			padding: "0 24px 24px"
		};
		const outlineButtonStyle = {
			height: 36,
			padding: "0 14px",
			border: "1px solid var(--dsw-alias-border-l2)",
			borderRadius: 18,
			background: "transparent",
			color: "var(--dsw-alias-label-primary)",
			cursor: "pointer",
			fontSize: 14
		};
		function CursorModelPicker(props) {
			const { t } = props;
			const snapshot = props.useCursorModelPicker((value) => value);
			const [query, setQuery] = (0, react.useState)("");
			const searchRef = (0, react.useRef)(null);
			const visible = (0, react.useMemo)(() => snapshot.candidates.filter((model) => modelMatchesQuery(model, query)), [snapshot.candidates, query]);
			const sections = (0, react.useMemo)(() => cursorBrandSections(visible), [visible]);
			(0, react.useEffect)(() => {
				if (!snapshot.open) setQuery("");
			}, [snapshot.open]);
			(0, react.useEffect)(() => {
				if (!snapshot.open) return;
				const onKeyDown = (event) => {
					if (event.key === "Escape") props.closePicker();
				};
				document.addEventListener("keydown", onKeyDown);
				return () => {
					document.removeEventListener("keydown", onKeyDown);
				};
			}, [snapshot.open, props.closePicker]);
			(0, react.useEffect)(() => {
				if (!snapshot.open || snapshot.loading || snapshot.error !== void 0) return;
				searchRef.current?.focus();
			}, [
				snapshot.open,
				snapshot.loading,
				snapshot.error
			]);
			if (!snapshot.open) return null;
			return (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: rootStyle,
				role: "presentation",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					style: maskStyle,
					"aria-hidden": "true",
					onClick: props.closePicker
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					style: dialogStyle,
					role: "dialog",
					"aria-modal": "true",
					"aria-label": t("pickerTitle"),
					"aria-busy": snapshot.loading,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: headerStyle,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
								style: titleStyle,
								children: t("pickerTitle")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: closeStyle,
								"aria-label": t("close"),
								onClick: props.closePicker,
								children: "×"
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							style: descriptionStyle,
							children: t("pickerDescription")
						}),
						snapshot.loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							style: statusStyle,
							role: "status",
							children: t("pickerLoading")
						}) : snapshot.error !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							style: errorStyle,
							role: "alert",
							children: snapshot.error
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							ref: searchRef,
							style: searchStyle,
							type: "search",
							value: query,
							placeholder: t("pickerSearch"),
							"aria-label": t("pickerSearch"),
							onChange: (event) => {
								setQuery(event.target.value);
							}
						}), visible.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							style: statusStyle,
							role: "status",
							children: t("pickerEmpty")
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
							style: listStyle,
							children: sections.map((section) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								style: brandHeaderStyle,
								children: section.brand === "other" ? t("pickerBrandOther") : section.label
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
								style: brandListStyle,
								children: section.models.map((model) => {
									const efforts = effortsForCursorModel(model);
									return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
										style: candidateStyle,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: snapshot.picked.has(model.id),
											onChange: () => {
												props.togglePickerModel(model.id);
											}
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
											style: {
												display: "flex",
												flexDirection: "column",
												gap: 2
											},
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [model.name ?? model.id, model.name !== void 0 && model.name !== model.id ? ` (${model.id})` : ""] }), model.id === "default" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												style: {
													fontSize: 12,
													color: "var(--dsw-alias-label-tertiary)"
												},
												children: t("autoModelHint")
											}) : efforts.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												style: {
													fontSize: 12,
													color: "var(--dsw-alias-label-tertiary)"
												},
												children: t("thinkingLevels").replace("{count}", String(efforts.length))
											}) : null]
										})]
									}) }, model.id);
								})
							})] }, section.brand))
						})] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: footerStyle,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: outlineButtonStyle,
								onClick: props.closePicker,
								children: t("cancel")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: {
									...outlineButtonStyle,
									...snapshot.loading || snapshot.error !== void 0 ? {
										cursor: "not-allowed",
										opacity: .4
									} : {}
								},
								disabled: snapshot.loading || snapshot.error !== void 0,
								onClick: props.adoptPickerModels,
								children: t("applySelected")
							})]
						})
					]
				})]
			}), document.body);
		}
		//#endregion
		//#region src/client/locales.ts
		/** Localized copy for the Cursor Plugin configuration card. */
		const en = {
			title: "Cursor",
			description: "Unofficial. Uses private Cursor CLI session endpoints. Cursor staff treat this as against ToS; your account can be banned.",
			expand: "Expand settings",
			collapse: "Collapse settings",
			loading: "Loading plugin settings…",
			settingsUnavailable: "Plugin settings are unavailable in this profile.",
			readOnly: "This profile’s settings document is read-only.",
			signedOut: "Not signed in.",
			signedInAs: "Signed in as {email}.",
			signedInNoEmail: "Signed in.",
			signIn: "Sign in with Cursor",
			signOut: "Sign out",
			signingIn: "Waiting for browser sign-in…",
			signInFailed: "Sign-in did not complete. You can try again.",
			signOutFailed: "Could not sign out. Try again.",
			statusFailed: "Could not read sign-in status.",
			models: "Model catalog",
			summaryModels: "{count} models",
			summaryOn: "Signed in",
			summaryOff: "Not signed in",
			modelDetails: "Details",
			dragModel: "Drag to reorder",
			sortModels: "Sort",
			doneSorting: "Done",
			moveUp: "Move up",
			moveDown: "Move down",
			fetchModels: "Fetch available models",
			fetchingModels: "Fetching models…",
			fetchEmpty: "Cursor returned no models.",
			fetchNeedsSignIn: "Sign in to fetch the account model list.",
			pickerTitle: "Select model catalog",
			pickerDescription: "Select the models to keep in this catalog. Thinking level is chosen in the chat, not here.",
			pickerLoading: "Fetching model metadata…",
			autoModelHint: "Cursor chooses a model for each turn. The wire id is default.",
			thinkingLevels: "{count} thinking levels",
			pickerSearch: "Search models",
			pickerEmpty: "No models match this search.",
			pickerBrandOther: "Other",
			applySelected: "Apply selected",
			cancel: "Cancel",
			close: "Close",
			addModel: "Add model manually",
			modelId: "Model ID",
			modelName: "Display name",
			thinking: "Reasoning",
			defaultEffort: "Default thinking",
			vision: "Vision",
			maxMode: "Max mode",
			contextWindow: "Context window",
			contextWindowDefault: "200000",
			remove: "Remove",
			inherited: "Using the default catalog",
			customized: "Custom catalog",
			unsaved: "Unsaved changes",
			discard: "Discard",
			save: "Save",
			saving: "Saving…",
			saved: "Saved",
			invalidModel: "Every model needs a unique ID.",
			requestFailed: "Request failed.",
			usage: "Subscription usage",
			usageRefresh: "Refresh",
			usageLoading: "Reading usage…",
			usageUsed: "Used",
			usageUnlimited: "Unlimited",
			usageUnsupported: "This subscription does not report usage.",
			usageFailed: "Could not read usage.",
			usageRefreshFailed: "Refresh failed",
			usageUpdatedAt: "Updated {time}",
			usageResetAt: "Resets {time}",
			usageResetAtDays: "Usage limits reset on {date} ({count} days left)"
		};
		const zh = {
			title: "Cursor",
			description: "非官方。走 Cursor CLI 私有会话入口。Cursor 员工认定此类用法违反 ToS，账号可能被封。",
			expand: "展开设置",
			collapse: "折叠设置",
			loading: "正在加载插件设置…",
			settingsUnavailable: "此 profile 中的插件设置不可用。",
			readOnly: "此 profile 的设置文件为只读。",
			signedOut: "尚未登录。",
			signedInAs: "已登录为 {email}。",
			signedInNoEmail: "已登录。",
			signIn: "用 Cursor 登录",
			signOut: "退出登录",
			signingIn: "正在等待浏览器登录…",
			signInFailed: "登录未完成。可以重试。",
			signOutFailed: "无法退出登录。请重试。",
			statusFailed: "无法读取登录状态。",
			models: "模型目录",
			summaryModels: "{count} 个模型",
			summaryOn: "已登录",
			summaryOff: "未登录",
			modelDetails: "详细设置",
			dragModel: "拖动调整顺序",
			sortModels: "排序",
			doneSorting: "完成排序",
			moveUp: "上移",
			moveDown: "下移",
			fetchModels: "获取可用模型",
			fetchingModels: "正在获取模型…",
			fetchEmpty: "Cursor 没有返回任何模型。",
			fetchNeedsSignIn: "登录后才能获取账号模型列表。",
			pickerTitle: "选择模型目录",
			pickerDescription: "选择要保留在此目录中的模型。思考等级在对话里选择，不在这里。",
			pickerLoading: "正在获取模型元数据…",
			autoModelHint: "每轮由 Cursor 选模型。请求里的 id 是 default。",
			thinkingLevels: "{count} 个思考等级",
			pickerSearch: "搜索模型",
			pickerEmpty: "没有匹配的模型。",
			pickerBrandOther: "其他",
			applySelected: "应用所选",
			cancel: "取消",
			close: "关闭",
			addModel: "手动添加模型",
			modelId: "模型 ID",
			modelName: "显示名称",
			thinking: "推理",
			defaultEffort: "默认思考等级",
			vision: "视觉",
			maxMode: "Max 模式",
			contextWindow: "上下文窗口",
			contextWindowDefault: "200000",
			remove: "删除",
			inherited: "正在使用默认模型目录",
			customized: "自定义模型目录",
			unsaved: "有未保存更改",
			discard: "放弃更改",
			save: "保存",
			saving: "保存中…",
			saved: "已保存",
			invalidModel: "每个模型必须有唯一 ID。",
			requestFailed: "请求失败。",
			usage: "订阅额度",
			usageRefresh: "刷新",
			usageLoading: "正在读取额度…",
			usageUsed: "已用",
			usageUnlimited: "不限",
			usageUnsupported: "此订阅不提供额度信息。",
			usageFailed: "无法读取额度。",
			usageRefreshFailed: "刷新失败",
			usageUpdatedAt: "{time} 已更新",
			usageResetAt: "重置时间：{time}",
			usageResetAtDays: "重置时间：{date}（还剩 {count} 天）"
		};
		//#endregion
		//#region src/client/index.ts
		const name = "dsh-llm-cursor-client";
		const inject = [
			"slots",
			"locale",
			"connection",
			"settingsScope"
		];
		/** How long the missing-owner diagnostic waits for the Providers UI owner to register its page. */
		const MISSING_OWNER_GRACE_MS = 15e3;
		function apply(ctx) {
			const localeNamespace = "settings.cursor";
			ctx.effect(() => ctx.locale.register(localeNamespace, {
				zh,
				en
			}), "dsh-llm-cursor: Plugin configuration copy");
			const t = ctx.locale.bind(localeNamespace);
			const localScope = ctx.settingsScope.bind({
				namespace: CURSOR_SETTINGS_NAMESPACE,
				decode: decodeCursorSettings
			});
			const connection = ctx.get("connection");
			const { rpc } = connection;
			let remoteSnapshot = {
				status: "loading",
				value: void 0,
				base: void 0,
				user: void 0,
				revision: void 0,
				writable: true,
				mode: "host"
			};
			const remoteListeners = /* @__PURE__ */ new Set();
			const remoteScope = {
				getSnapshot: () => remoteSnapshot,
				subscribe: (listener) => {
					remoteListeners.add(listener);
					return () => {
						remoteListeners.delete(listener);
					};
				},
				mutate: async () => {
					throw new Error("Use the provider save action");
				},
				set: async () => {
					throw new Error("Use the provider save action");
				},
				unset: async () => {
					throw new Error("Use the provider save action");
				}
			};
			const publishRemoteSettings = (settings, revision) => {
				remoteSnapshot = {
					status: "ready",
					value: settings,
					base: void 0,
					user: settings,
					revision,
					writable: true,
					mode: "host"
				};
				for (const listener of remoteListeners) listener();
			};
			if (!connection.isLoopback) rpc.call(CURSOR_RPC_CHANNEL, CURSOR_SETTINGS_READ_ENDPOINT, {}).then((result) => {
				if (!result.ok) return;
				const value = result.value;
				const settings = decodeCursorSettings(value.settings);
				if (settings === void 0 || !Number.isSafeInteger(value.revision)) return;
				publishRemoteSettings(settings, value.revision);
			});
			const scope = connection.isLoopback ? localScope : remoteScope;
			const picker = new CursorModelPickerController();
			const startAuth = async () => {
				const popup = window.open("about:blank", "_blank");
				if (popup !== null) popup.opener = null;
				const result = await rpc.call(CURSOR_RPC_CHANNEL, CURSOR_AUTH_START_ENDPOINT, {});
				if (!result.ok) {
					popup?.close();
					return {
						ok: false,
						retryable: true,
						message: result.error.message
					};
				}
				const decoded = decodeCursorAuthStartReply(result.value);
				if (decoded === void 0) {
					popup?.close();
					return {
						ok: false,
						retryable: true,
						message: t("signInFailed")
					};
				}
				if (decoded.ok && "authorizationUrl" in decoded) {
					if (popup === null) return {
						ok: true,
						attemptId: decoded.attemptId,
						authorizationUrl: decoded.authorizationUrl,
						popupBlocked: true,
						fallbackUrl: decoded.authorizationUrl
					};
					else popup.location.href = decoded.authorizationUrl;
				} else popup?.close();
				return decoded;
			};
			const cancelAuth = async (attemptId) => {
				const result = await rpc.call(CURSOR_RPC_CHANNEL, CURSOR_AUTH_CANCEL_ENDPOINT, { attemptId });
				if (!result.ok) throw new Error(result.error.message);
			};
			let authGeneration = 0;
			/** Purge every bundle copy, even without providerDirectory. Stale reads check currency first. */
			const invalidateUsageCache = () => {
				dropPersistedUsageKeys$1([CURSOR_SETTINGS_NAMESPACE]);
				try {
					ctx.get("providerDirectory")?.invalidateUsage(CURSOR_SETTINGS_NAMESPACE);
				} catch {}
			};
			const readAuthStatus = async (attemptId) => {
				const generation = authGeneration;
				const result = await rpc.call(CURSOR_RPC_CHANNEL, CURSOR_AUTH_STATUS_ENDPOINT, attemptId === void 0 ? {} : { attemptId });
				if (!result.ok) throw new Error(result.error.message);
				const decoded = decodeCursorAuthStatus(result.value);
				if (decoded === void 0) throw new Error(t("statusFailed"));
				if (decoded.attempt === "succeeded") {
					authGeneration += 1;
					invalidateUsageCache();
				}
				if (decoded.loggedIn === false && generation === authGeneration) invalidateUsageCache();
				return decoded;
			};
			const logout = async () => {
				const result = await rpc.call(CURSOR_RPC_CHANNEL, CURSOR_AUTH_LOGOUT_ENDPOINT, {});
				if (!result.ok) throw new Error(result.error.message);
				if (decodeCursorAuthLogoutReply(result.value) === void 0) throw new Error(t("signOutFailed"));
				authGeneration += 1;
				invalidateUsageCache();
			};
			const discoverModels = async () => {
				const result = await rpc.call(CURSOR_RPC_CHANNEL, CURSOR_MODELS_ENDPOINT, {});
				if (!result.ok) throw new Error(result.error.message);
				const decoded = decodeCursorModelsReply(result.value);
				if (decoded === void 0) throw new Error(t("statusFailed"));
				return decoded.models;
			};
			const fetchUsage = async (refresh = false) => {
				const generation = authGeneration;
				const result = await rpc.call(CURSOR_RPC_CHANNEL, CURSOR_USAGE_ENDPOINT, refresh ? { refresh: true } : {});
				if (!result.ok) throw new Error(result.error.message);
				const decoded = decodeCursorUsageReply(result.value);
				if (decoded === void 0) throw new Error(t("usageFailed"));
				if (decoded.status === "logged-out" && generation === authGeneration) invalidateUsageCache();
				return decoded;
			};
			const saveConfiguration = async (settings) => {
				const snapshot = scope.getSnapshot();
				if (snapshot.revision === void 0) throw new Error(t("requestFailed"));
				const saved = await rpc.call(CURSOR_RPC_CHANNEL, CURSOR_SAVE_ENDPOINT, {
					models: settings.models ?? [],
					expectedRevision: snapshot.revision
				});
				if (!saved.ok) throw new Error(saved.error.message);
				const accepted = decodeCursorSaveResult(saved.value);
				if (accepted === void 0) throw new Error(t("requestFailed"));
				if (!connection.isLoopback) publishRemoteSettings(accepted.settings, accepted.revision);
				return accepted;
			};
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "cursor-model-picker",
				order: 101,
				inject: () => ({
					t,
					hooks: { cursorModelPicker: picker },
					closePicker: picker.close,
					togglePickerModel: picker.toggle,
					adoptPickerModels: picker.adopt
				})
			}, CursorModelPicker));
			ctx.slots.inject("settings.provider.item", () => ctx.slots.register({
				name: "settings.provider.item",
				key: CURSOR_SETTINGS_NAMESPACE,
				locale: localeNamespace,
				inject: () => ({
					t,
					hooks: { cursorSettings: scope },
					startAuth,
					cancelAuth,
					readAuthStatus,
					logout,
					fetchUsage,
					discoverModels,
					saveConfiguration,
					beginModelPicker: (initiallyPicked, onAdopt) => {
						picker.begin(onAdopt, initiallyPicked);
					},
					completeModelPicker: (candidates) => {
						picker.complete(candidates);
					},
					failModelPicker: (message) => {
						picker.fail(message);
					},
					closeModelPicker: picker.close
				})
			}, CursorPluginCard));
			ctx.inject(["providerDirectory"], (ctx) => {
				ctx.effect(() => ctx.providerDirectory.register({
					key: CURSOR_SETTINGS_NAMESPACE,
					name: "Cursor",
					role: "llm",
					header: "shared",
					detail: "shared",
					usage: createCursorUsageReader(),
					modelCount: () => {
						return (scope?.getSnapshot())?.value?.models?.length;
					}
				}), "dsh-llm-cursor: provider directory");
			});
			ctx.effect(() => {
				let warned = false;
				const hasProvidersSection = () => ctx.slots.entries("settings.section").some((entry) => entry.options.id === "providers");
				const check = () => {
					if (hasProvidersSection() || warned) return;
					warned = true;
					console.warn(`[dsh-llm-providers-ui] LLM Providers page missing for card llm-cursor: install dsh-llm-providers-ui to show the card. Host route remains active.`);
				};
				const timer = setTimeout(check, MISSING_OWNER_GRACE_MS);
				const stop = ctx.slots.subscribe("settings.section", () => {
					if (!hasProvidersSection()) return;
					clearTimeout(timer);
					warned = true;
				});
				return () => {
					clearTimeout(timer);
					stop();
				};
			}, "dsh-llm-providers-ui: missing owner diagnostic");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		exports.name = name;
		return module.exports;
	}
});
