import { createRequire } from "node:module";
import z from "@deepseek-ai/schemastery";
import { CallId, LlmAdapter, LlmError, ReasoningEffortId, RetryPolicySchema, attributionHeaders, resolveRetryPolicy } from "@deepseek-ai/dsh-llm";
import { deepEqualJson, installSettingsSection, settingsNamespace } from "@deepseek-ai/dsh-settings";
import { MAX_TIMER_DELAY_MS } from "@deepseek-ai/dsh-timeout";
import { create, fromBinary, fromJson, toBinary } from "@bufbuild/protobuf";
import { connect, constants } from "node:http2";
import { fileDesc, messageDesc } from "@bufbuild/protobuf/codegenv2";
import { createHash, randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { chmod, mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { launchEnvironmentOf } from "@deepseek-ai/dsh-launch-environment";
import { ValueSchema } from "@bufbuild/protobuf/wkt";
//#region lib/types/client-contract.js
/** Browser-safe constants and JSON decoders shared by the Host and client plugin faces. */
/** Settings namespace owned by the Cursor plugin. */
const CURSOR_SETTINGS_NAMESPACE = "llm-cursor";
/** Provider route owned by this plugin. */
const CURSOR_PROVIDER = "cursor";
/** Default maximum idle interval while a stream read is outstanding. */
const CURSOR_DEFAULT_STREAM_IDLE_TIMEOUT_MS = 3e5;
/** Private Connection RPC channel used by this package's Host and Web faces. */
const CURSOR_RPC_CHANNEL = "/cursor";
/** Begin a Host-owned Deep Control sign-in. */
const CURSOR_AUTH_START_ENDPOINT = "auth/start";
/** Secret-free login snapshot. */
const CURSOR_AUTH_STATUS_ENDPOINT = "auth/status";
/** Delete the Host session file. */
const CURSOR_AUTH_LOGOUT_ENDPOINT = "auth/logout";
/** Secret-free subscription-usage snapshot. */
const CURSOR_USAGE_ENDPOINT = "usage/read";
/** Account model list. */
const CURSOR_MODELS_ENDPOINT = "models/list";
/** Atomic settings-save endpoint inside {@link CURSOR_RPC_CHANNEL}. */
const CURSOR_SAVE_ENDPOINT = "settings/save";
/** MCP / history provider identifier; must match on advertise and replay. */
const CURSOR_MCP_PROVIDER_ID = "dsh-llm-cursor";
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
function isRecord$3(value) {
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
	if (!isRecord$3(value)) return void 0;
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
	if (!isRecord$3(value)) return void 0;
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
	if (!isRecord$3(value)) return void 0;
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
function decodeCursorEmptyRequest(value) {
	if (value === void 0 || value === null) return {};
	if (!isRecord$3(value) || hasTokenFields(value)) return void 0;
	return {};
}
function decodeCursorAuthStartReply(value) {
	if (!isRecord$3(value) || hasTokenFields(value) || typeof value["ok"] !== "boolean") return void 0;
	if (value["ok"] === true) return { ok: true };
	if (value["retryable"] !== true || typeof value["message"] !== "string" || value["message"].length === 0) return;
	return {
		ok: false,
		retryable: true,
		message: value["message"]
	};
}
function decodeCursorAuthStatus(value) {
	if (!isRecord$3(value) || hasTokenFields(value) || typeof value["loggedIn"] !== "boolean") return void 0;
	const email = value["email"];
	const expiresAt = value["expiresAt"];
	if (!optionalNonEmptyString(email) || !optionalNonEmptyString(expiresAt)) return void 0;
	return {
		loggedIn: value["loggedIn"],
		...email === void 0 ? {} : { email },
		...expiresAt === void 0 ? {} : { expiresAt }
	};
}
function decodeCursorAuthLogoutReply(value) {
	if (!isRecord$3(value) || hasTokenFields(value) || value["ok"] !== true) return void 0;
	return { ok: true };
}
function decodeCursorUsageView(value) {
	if (!isRecord$3(value) || hasTokenFields(value)) return void 0;
	const fetchedAt = value["fetchedAt"];
	const windows = value["windows"];
	if (typeof fetchedAt !== "string" || fetchedAt.length === 0) return void 0;
	if (!Array.isArray(windows) || windows.length === 0) return void 0;
	const decoded = [];
	for (const entry of windows) {
		if (!isRecord$3(entry)) return void 0;
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
	if (!isRecord$3(value) || hasTokenFields(value)) return void 0;
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
	if (!isRecord$3(value) || hasTokenFields(value)) return void 0;
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
function decodeCursorSaveRequest(value) {
	if (!isRecord$3(value) || hasTokenFields(value) || !Array.isArray(value["models"])) return void 0;
	if (!Number.isSafeInteger(value["expectedRevision"])) return void 0;
	const expectedRevision = value["expectedRevision"];
	if (expectedRevision < 0) return void 0;
	const models = [];
	for (const entry of value["models"]) {
		const model = decodeCursorCatalogModel(entry);
		if (model === void 0) return void 0;
		models.push(model);
	}
	return {
		models,
		expectedRevision
	};
}
function decodeCursorSaveResult(value) {
	if (!isRecord$3(value) || hasTokenFields(value) || !Number.isSafeInteger(value["revision"])) return void 0;
	const revision = value["revision"];
	if (revision < 0) return void 0;
	const settings = decodeCursorSettings(value["settings"]);
	if (settings === void 0) return void 0;
	return {
		settings,
		revision
	};
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
function cursorBaseFamilyId(id) {
	return isCursorMaxRow(id) ? id.slice(0, -3) : id;
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
				const family = isCursorMaxRow(model.id) ? model.id : pinned ?? split.family;
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
	if (isCursorMaxRow(familyId)) return CURSOR_MAX_CONTEXT_WINDOW;
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
		if (!alreadyMax && !hasSavedMaxRow && sort === "brand" && familyHasExtendedContext(family, name)) grouped.push(row(family + "-1m", name + " Max", true));
	}
	return sortGroupedFamilies(grouped, firstIndex, sort);
}
function findCatalogModel(catalog, id) {
	return catalog.find((model) => model.id === id) ?? catalog.find((model) => model.variants?.some((variant) => variant.wireId === id)) ?? catalog.find((model) => model.id === splitCursorWireId(id).family);
}
function effortsForCursorModel(model) {
	const efforts = /* @__PURE__ */ new Set();
	for (const variant of model.variants ?? []) if (variant.effort !== void 0) efforts.add(variant.effort);
	return CURSOR_EFFORT_ORDER.filter((effort) => efforts.has(effort));
}
function resolveCursorWireId(model, effort) {
	const variants = model.variants;
	const fallback = cursorBaseFamilyId(model.id);
	if (variants === void 0 || variants.length === 0) return fallback;
	const wanted = asEffort(effort) ?? resolveCursorDefaultEffort(model) ?? "medium";
	const matching = variants.filter((variant) => (variant.effort ?? "medium") === wanted);
	return cursorBaseFamilyId((matching.find((variant) => wireHasThinking(variant.wireId)) ?? matching[0])?.wireId ?? variants[0]?.wireId ?? fallback);
}
function variantMaxMode(model, _effort) {
	return isCursorMaxRow(model.id) || model.maxMode === true;
}
function asEffort(value) {
	if (value === void 0) return void 0;
	return CURSOR_EFFORT_ORDER.find((effort) => effort === value);
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
//#region lib/types/identity.js
const { name: PACKAGE_NAME, version: PACKAGE_VERSION } = createRequire(import.meta.url)("../package.json");
/** Chat API origin used by the Cursor CLI session entry. */
const CURSOR_API_URL = "https://api2.cursor.sh";
/** Pinned CLI version the session entry currently accepts. Bump in changelog when it breaks. */
const CURSOR_CLIENT_VERSION = "cli-2026.01.09-231024f";
/** Plugin identity sent beside the required CLI compatibility headers. */
const CURSOR_PLUGIN_IDENTITY_HEADER = `${PACKAGE_NAME}/${PACKAGE_VERSION}`;
function cursorRequestHeaders(accessToken) {
	return {
		...attributionHeaders(),
		authorization: `Bearer ${accessToken}`,
		"x-ghost-mode": "true",
		"x-cursor-client-version": CURSOR_CLIENT_VERSION,
		"x-cursor-client-type": "cli",
		"x-dsh-plugin": CURSOR_PLUGIN_IDENTITY_HEADER,
		"x-request-id": crypto.randomUUID()
	};
}
//#endregion
//#region lib/types/wire/connect.js
/** A structured Connect or gRPC status received from Cursor. */
var CursorWireError = class extends Error {
	wireCode;
	constructor(wireCode, message) {
		super(message);
		this.wireCode = wireCode;
		this.name = "CursorWireError";
	}
};
function frameConnectMessage(data, flags = 0) {
	const frame = Buffer.alloc(5 + data.length);
	frame[0] = flags;
	frame.writeUInt32BE(data.length, 1);
	frame.set(data, 5);
	return frame;
}
function parseConnectEndStream(data) {
	try {
		const error = JSON.parse(new TextDecoder().decode(data)).error;
		if (error) {
			const code = typeof error.code === "string" ? error.code : "unknown";
			return new CursorWireError(code, `Connect error ${code}: ${typeof error.message === "string" ? error.message : "Unknown error"}`);
		}
		return null;
	} catch {
		return /* @__PURE__ */ new Error("Failed to parse Connect end stream");
	}
}
/** Pull complete Connect frames from a rolling buffer. */
function takeConnectFrames(buffer) {
	const frames = [];
	let rest = buffer;
	while (rest.length >= 5) {
		const flags = rest[0] ?? 0;
		const msgLen = rest.readUInt32BE(1);
		if (rest.length < 5 + msgLen) break;
		frames.push({
			flags,
			payload: rest.subarray(5, 5 + msgLen)
		});
		rest = rest.subarray(5 + msgLen);
	}
	return {
		frames,
		rest
	};
}
//#endregion
//#region lib/types/wire/http2.js
/**
* HTTP/2 Connect+proto client for AgentService.
*/
const RUN_PATH = "/agent.v1.AgentService/Run";
function headerRecord(headers) {
	const out = {};
	for (const [key, value] of Object.entries(headers)) if (typeof value === "string") out[key] = value;
	else if (Array.isArray(value) && value[0] !== void 0) out[key] = value[0];
	return out;
}
function transportError(error) {
	const message = error instanceof Error && error.message.length > 0 ? error.message : "HTTP/2 connection failed";
	return new LlmError(`llm-cursor: HTTP/2 to the Cursor session entry failed (${message}). The chat path requires HTTP/2 to api2.cursor.sh.`, "TRANSPORT");
}
function openConnectSession(origin) {
	try {
		return connect(origin);
	} catch (error) {
		throw transportError(error);
	}
}
function requestHeaders(path, extra) {
	return {
		":method": "POST",
		":path": path,
		"content-type": "application/connect+proto",
		"connect-protocol-version": "1",
		...extra
	};
}
function attachConnectReader(stream) {
	const trailers = {};
	const queue = [];
	const waiters = [];
	let ended = false;
	let failure;
	let httpStatus = 0;
	const push = (chunk) => {
		const waiter = waiters.shift();
		if (waiter !== void 0) waiter.resolve(chunk);
		else queue.push(chunk);
	};
	const finish = (error) => {
		ended = true;
		if (error !== void 0) failure = transportError(error);
		while (waiters.length > 0) {
			const waiter = waiters.shift();
			if (waiter === void 0) continue;
			if (failure !== void 0) waiter.reject(failure);
			else waiter.resolve(void 0);
		}
	};
	stream.on("response", (headers) => {
		httpStatus = Number(headers[":status"] ?? 0);
	});
	stream.on("data", (chunk) => {
		push(chunk);
	});
	stream.on("trailers", (headers) => {
		Object.assign(trailers, headerRecord(headers));
	});
	stream.on("end", () => {
		finish();
	});
	stream.on("close", () => {
		finish();
	});
	stream.on("error", (error) => {
		finish(error);
	});
	return {
		trailers,
		getHttpStatus: () => httpStatus,
		push,
		waitChunk: () => {
			if (queue.length > 0) return Promise.resolve(queue.shift());
			if (failure !== void 0) return Promise.reject(failure);
			if (ended) return Promise.resolve(void 0);
			return new Promise((resolve, reject) => {
				waiters.push({
					resolve,
					reject
				});
			});
		}
	};
}
function openConnectStream(origin, path, headers) {
	const session = openConnectSession(origin);
	const stream = session.request(requestHeaders(path, headers));
	const reader = attachConnectReader(stream);
	session.on("error", () => {});
	return {
		session,
		stream,
		...reader
	};
}
/**
* Unary HTTP/2 call using raw protobuf (`application/proto`).
* GetUsableModels rejects Connect (`application/connect+proto`) with 415.
*/
async function connectUnaryProto(options) {
	const session = openConnectSession(options.origin);
	const stream = session.request({
		":method": "POST",
		":path": options.path,
		"content-type": "application/proto",
		te: "trailers",
		...options.headers
	});
	const onAbort = () => {
		try {
			stream.close(constants.NGHTTP2_CANCEL);
		} catch {}
		try {
			session.close();
		} catch {}
	};
	options.signal?.addEventListener("abort", onAbort, { once: true });
	try {
		const chunks = [];
		let status = 0;
		const done = new Promise((resolve, reject) => {
			stream.on("response", (headers) => {
				status = Number(headers[":status"] ?? 0);
			});
			stream.on("data", (chunk) => {
				chunks.push(chunk);
			});
			stream.on("end", () => {
				resolve(Buffer.concat(chunks));
			});
			stream.on("error", reject);
		});
		stream.end(Buffer.from(options.body));
		const payload = await done;
		if (status < 200 || status >= 300) throw new Error(`Cursor model catalog returned HTTP ${String(status)}`);
		if (payload.length === 0) throw new Error("Empty protobuf unary response");
		return payload;
	} catch (error) {
		if (error instanceof LlmError) throw error;
		if (error instanceof Error && error.message.startsWith("Cursor model catalog")) throw error;
		throw transportError(error);
	} finally {
		options.signal?.removeEventListener("abort", onAbort);
		try {
			session.close();
		} catch {}
	}
}
function grpcStatusError(trailers) {
	const status = trailers["grpc-status"];
	if (status === void 0 || status === "0") return void 0;
	return new CursorWireError(status, trailers["grpc-message"] ?? `gRPC status ${status}`);
}
function isResourceExhausted(error) {
	if (!(error instanceof Error)) return false;
	if (error instanceof CursorWireError && ["resource_exhausted", "8"].includes(error.wireCode)) return true;
	return /resource_exhausted/iu.test(error.message);
}
//#endregion
//#region lib/types/wire/vendor/agent_pb.js
/**
* Describes the file agent.proto.
*/
const file_agent = /*@__PURE__*/ fileDesc("CgthZ2VudC5wcm90bxIIYWdlbnQudjEicgoOR2xvYlRvb2xSZXN1bHQSLAoHc3VjY2VzcxgBIAEoCzIZLmFnZW50LnYxLkdsb2JUb29sU3VjY2Vzc0gAEigKBWVycm9yGAIgASgLMhcuYWdlbnQudjEuR2xvYlRvb2xFcnJvckgAQggKBnJlc3VsdCIeCg1HbG9iVG9vbEVycm9yEg0KBWVycm9yGAEgASgJIokBCg9HbG9iVG9vbFN1Y2Nlc3MSDwoHcGF0dGVybhgBIAEoCRIMCgRwYXRoGAIgASgJEg0KBWZpbGVzGAMgAygJEhMKC3RvdGFsX2ZpbGVzGAQgASgFEhgKEGNsaWVudF90cnVuY2F0ZWQYBSABKAgSGQoRcmlwZ3JlcF90cnVuY2F0ZWQYBiABKAgiRgoMR2xvYlRvb2xDYWxsEgwKBGFyZ3MYASABKAwSKAoGcmVzdWx0GAIgASgLMhguYWdlbnQudjEuR2xvYlRvb2xSZXN1bHQibQoRUmVhZExpbnRzVG9vbENhbGwSKQoEYXJncxgBIAEoCzIbLmFnZW50LnYxLlJlYWRMaW50c1Rvb2xBcmdzEi0KBnJlc3VsdBgCIAEoCzIdLmFnZW50LnYxLlJlYWRMaW50c1Rvb2xSZXN1bHQiIgoRUmVhZExpbnRzVG9vbEFyZ3MSDQoFcGF0aHMYASADKAkigQEKE1JlYWRMaW50c1Rvb2xSZXN1bHQSMQoHc3VjY2VzcxgBIAEoCzIeLmFnZW50LnYxLlJlYWRMaW50c1Rvb2xTdWNjZXNzSAASLQoFZXJyb3IYAiABKAsyHC5hZ2VudC52MS5SZWFkTGludHNUb29sRXJyb3JIAEIICgZyZXN1bHQiewoUUmVhZExpbnRzVG9vbFN1Y2Nlc3MSMwoQZmlsZV9kaWFnbm9zdGljcxgBIAMoCzIZLmFnZW50LnYxLkZpbGVEaWFnbm9zdGljcxITCgt0b3RhbF9maWxlcxgCIAEoBRIZChF0b3RhbF9kaWFnbm9zdGljcxgDIAEoBSJpCg9GaWxlRGlhZ25vc3RpY3MSDAoEcGF0aBgBIAEoCRItCgtkaWFnbm9zdGljcxgCIAMoCzIYLmFnZW50LnYxLkRpYWdub3N0aWNJdGVtEhkKEWRpYWdub3N0aWNzX2NvdW50GAMgASgFIqsBCg5EaWFnbm9zdGljSXRlbRIuCghzZXZlcml0eRgBIAEoDjIcLmFnZW50LnYxLkRpYWdub3N0aWNTZXZlcml0eRIoCgVyYW5nZRgCIAEoCzIZLmFnZW50LnYxLkRpYWdub3N0aWNSYW5nZRIPCgdtZXNzYWdlGAMgASgJEg4KBnNvdXJjZRgEIAEoCRIMCgRjb2RlGAUgASgJEhAKCGlzX3N0YWxlGAYgASgIIlUKD0RpYWdub3N0aWNSYW5nZRIhCgVzdGFydBgBIAEoCzISLmFnZW50LnYxLlBvc2l0aW9uEh8KA2VuZBgCIAEoCzISLmFnZW50LnYxLlBvc2l0aW9uIisKElJlYWRMaW50c1Rvb2xFcnJvchIVCg1lcnJvcl9tZXNzYWdlGAEgASgJIj0KDE1jcFRvb2xFcnJvchINCgVlcnJvchgBIAEoCRIeChZyZWFkX3Rvb2xfZGVmX3JlbWluZGVyGAIgASgJItIBCg1NY3BUb29sUmVzdWx0EicKB3N1Y2Nlc3MYASABKAsyFC5hZ2VudC52MS5NY3BTdWNjZXNzSAASJwoFZXJyb3IYAiABKAsyFi5hZ2VudC52MS5NY3BUb29sRXJyb3JIABIpCghyZWplY3RlZBgDIAEoCzIVLmFnZW50LnYxLk1jcFJlamVjdGVkSAASOgoRcGVybWlzc2lvbl9kZW5pZWQYBCABKAsyHS5hZ2VudC52MS5NY3BQZXJtaXNzaW9uRGVuaWVkSABCCAoGcmVzdWx0IoEBCgtNY3BUb29sQ2FsbBIfCgRhcmdzGAEgASgLMhEuYWdlbnQudjEuTWNwQXJncxInCgZyZXN1bHQYAiABKAsyFy5hZ2VudC52MS5NY3BUb29sUmVzdWx0EhgKC2Rlc2NyaXB0aW9uGAMgASgJSACIAQFCDgoMX2Rlc2NyaXB0aW9uIm0KEVNlbVNlYXJjaFRvb2xDYWxsEikKBGFyZ3MYASABKAsyGy5hZ2VudC52MS5TZW1TZWFyY2hUb29sQXJncxItCgZyZXN1bHQYAiABKAsyHS5hZ2VudC52MS5TZW1TZWFyY2hUb29sUmVzdWx0IlMKEVNlbVNlYXJjaFRvb2xBcmdzEg0KBXF1ZXJ5GAEgASgJEhoKEnRhcmdldF9kaXJlY3RvcmllcxgCIAMoCRITCgtleHBsYW5hdGlvbhgDIAEoCSKBAQoTU2VtU2VhcmNoVG9vbFJlc3VsdBIxCgdzdWNjZXNzGAEgASgLMh4uYWdlbnQudjEuU2VtU2VhcmNoVG9vbFN1Y2Nlc3NIABItCgVlcnJvchgCIAEoCzIcLmFnZW50LnYxLlNlbVNlYXJjaFRvb2xFcnJvckgAQggKBnJlc3VsdCI9ChRTZW1TZWFyY2hUb29sU3VjY2VzcxIPCgdyZXN1bHRzGAEgASgJEhQKDGNvZGVfcmVzdWx0cxgCIAMoDCIrChJTZW1TZWFyY2hUb29sRXJyb3ISFQoNZXJyb3JfbWVzc2FnZRgBIAEoCSKCAQoYTGlzdE1jcFJlc291cmNlc1Rvb2xDYWxsEjAKBGFyZ3MYASABKAsyIi5hZ2VudC52MS5MaXN0TWNwUmVzb3VyY2VzRXhlY0FyZ3MSNAoGcmVzdWx0GAIgASgLMiQuYWdlbnQudjEuTGlzdE1jcFJlc291cmNlc0V4ZWNSZXN1bHQifwoXUmVhZE1jcFJlc291cmNlVG9vbENhbGwSLwoEYXJncxgBIAEoCzIhLmFnZW50LnYxLlJlYWRNY3BSZXNvdXJjZUV4ZWNBcmdzEjMKBnJlc3VsdBgCIAEoCzIjLmFnZW50LnYxLlJlYWRNY3BSZXNvdXJjZUV4ZWNSZXN1bHQiWQoNRmV0Y2hUb29sQ2FsbBIhCgRhcmdzGAEgASgLMhMuYWdlbnQudjEuRmV0Y2hBcmdzEiUKBnJlc3VsdBgCIAEoCzIVLmFnZW50LnYxLkZldGNoUmVzdWx0Im4KFFJlY29yZFNjcmVlblRvb2xDYWxsEigKBGFyZ3MYASABKAsyGi5hZ2VudC52MS5SZWNvcmRTY3JlZW5BcmdzEiwKBnJlc3VsdBgCIAEoCzIcLmFnZW50LnYxLlJlY29yZFNjcmVlblJlc3VsdCJ3ChdXcml0ZVNoZWxsU3RkaW5Ub29sQ2FsbBIrCgRhcmdzGAEgASgLMh0uYWdlbnQudjEuV3JpdGVTaGVsbFN0ZGluQXJncxIvCgZyZXN1bHQYAiABKAsyHy5hZ2VudC52MS5Xcml0ZVNoZWxsU3RkaW5SZXN1bHQisQEKC1JlZmxlY3RBcmdzEiIKGnVuZXhwZWN0ZWRfYWN0aW9uX291dGNvbWVzGAEgASgJEh0KFXJlbGV2YW50X2luc3RydWN0aW9ucxgCIAEoCRIZChFzY2VuYXJpb19hbmFseXNpcxgDIAEoCRIaChJjcml0aWNhbF9zeW50aGVzaXMYBCABKAkSEgoKbmV4dF9zdGVwcxgFIAEoCRIUCgx0b29sX2NhbGxfaWQYBiABKAkibwoNUmVmbGVjdFJlc3VsdBIrCgdzdWNjZXNzGAEgASgLMhguYWdlbnQudjEuUmVmbGVjdFN1Y2Nlc3NIABInCgVlcnJvchgCIAEoCzIWLmFnZW50LnYxLlJlZmxlY3RFcnJvckgAQggKBnJlc3VsdCIQCg5SZWZsZWN0U3VjY2VzcyIdCgxSZWZsZWN0RXJyb3ISDQoFZXJyb3IYASABKAkiXwoPUmVmbGVjdFRvb2xDYWxsEiMKBGFyZ3MYASABKAsyFS5hZ2VudC52MS5SZWZsZWN0QXJncxInCgZyZXN1bHQYAiABKAsyFy5hZ2VudC52MS5SZWZsZWN0UmVzdWx0IlkKF1N0YXJ0R3JpbmRFeGVjdXRpb25BcmdzEhgKC2V4cGxhbmF0aW9uGAEgASgJSACIAQESFAoMdG9vbF9jYWxsX2lkGAIgASgJQg4KDF9leHBsYW5hdGlvbiKTAQoZU3RhcnRHcmluZEV4ZWN1dGlvblJlc3VsdBI3CgdzdWNjZXNzGAEgASgLMiQuYWdlbnQudjEuU3RhcnRHcmluZEV4ZWN1dGlvblN1Y2Nlc3NIABIzCgVlcnJvchgCIAEoCzIiLmFnZW50LnYxLlN0YXJ0R3JpbmRFeGVjdXRpb25FcnJvckgAQggKBnJlc3VsdCIcChpTdGFydEdyaW5kRXhlY3V0aW9uU3VjY2VzcyIpChhTdGFydEdyaW5kRXhlY3V0aW9uRXJyb3ISDQoFZXJyb3IYASABKAkigwEKG1N0YXJ0R3JpbmRFeGVjdXRpb25Ub29sQ2FsbBIvCgRhcmdzGAEgASgLMiEuYWdlbnQudjEuU3RhcnRHcmluZEV4ZWN1dGlvbkFyZ3MSMwoGcmVzdWx0GAIgASgLMiMuYWdlbnQudjEuU3RhcnRHcmluZEV4ZWN1dGlvblJlc3VsdCJYChZTdGFydEdyaW5kUGxhbm5pbmdBcmdzEhgKC2V4cGxhbmF0aW9uGAEgASgJSACIAQESFAoMdG9vbF9jYWxsX2lkGAIgASgJQg4KDF9leHBsYW5hdGlvbiKQAQoYU3RhcnRHcmluZFBsYW5uaW5nUmVzdWx0EjYKB3N1Y2Nlc3MYASABKAsyIy5hZ2VudC52MS5TdGFydEdyaW5kUGxhbm5pbmdTdWNjZXNzSAASMgoFZXJyb3IYAiABKAsyIS5hZ2VudC52MS5TdGFydEdyaW5kUGxhbm5pbmdFcnJvckgAQggKBnJlc3VsdCIbChlTdGFydEdyaW5kUGxhbm5pbmdTdWNjZXNzIigKF1N0YXJ0R3JpbmRQbGFubmluZ0Vycm9yEg0KBWVycm9yGAEgASgJIoABChpTdGFydEdyaW5kUGxhbm5pbmdUb29sQ2FsbBIuCgRhcmdzGAEgASgLMiAuYWdlbnQudjEuU3RhcnRHcmluZFBsYW5uaW5nQXJncxIyCgZyZXN1bHQYAiABKAsyIi5hZ2VudC52MS5TdGFydEdyaW5kUGxhbm5pbmdSZXN1bHQinAEKCFRhc2tBcmdzEhMKC2Rlc2NyaXB0aW9uGAEgASgJEg4KBnByb21wdBgCIAEoCRItCg1zdWJhZ2VudF90eXBlGAMgASgLMhYuYWdlbnQudjEuU3ViYWdlbnRUeXBlEhIKBW1vZGVsGAQgASgJSACIAQESEwoGcmVzdW1lGAUgASgJSAGIAQFCCAoGX21vZGVsQgkKB19yZXN1bWUiqgEKC1Rhc2tTdWNjZXNzEjYKEmNvbnZlcnNhdGlvbl9zdGVwcxgBIAMoCzIaLmFnZW50LnYxLkNvbnZlcnNhdGlvblN0ZXASFQoIYWdlbnRfaWQYAiABKAlIAIgBARIVCg1pc19iYWNrZ3JvdW5kGAMgASgIEhgKC2R1cmF0aW9uX21zGAQgASgESAGIAQFCCwoJX2FnZW50X2lkQg4KDF9kdXJhdGlvbl9tcyIaCglUYXNrRXJyb3ISDQoFZXJyb3IYASABKAkiZgoKVGFza1Jlc3VsdBIoCgdzdWNjZXNzGAEgASgLMhUuYWdlbnQudjEuVGFza1N1Y2Nlc3NIABIkCgVlcnJvchgCIAEoCzITLmFnZW50LnYxLlRhc2tFcnJvckgAQggKBnJlc3VsdCJWCgxUYXNrVG9vbENhbGwSIAoEYXJncxgBIAEoCzISLmFnZW50LnYxLlRhc2tBcmdzEiQKBnJlc3VsdBgCIAEoCzIULmFnZW50LnYxLlRhc2tSZXN1bHQiTAoRVGFza1Rvb2xDYWxsRGVsdGESNwoSaW50ZXJhY3Rpb25fdXBkYXRlGAEgASgLMhsuYWdlbnQudjEuSW50ZXJhY3Rpb25VcGRhdGUihhQKCFRvb2xDYWxsEjIKD3NoZWxsX3Rvb2xfY2FsbBgBIAEoCzIXLmFnZW50LnYxLlNoZWxsVG9vbENhbGxIABI0ChBkZWxldGVfdG9vbF9jYWxsGAMgASgLMhguYWdlbnQudjEuRGVsZXRlVG9vbENhbGxIABIwCg5nbG9iX3Rvb2xfY2FsbBgEIAEoCzIWLmFnZW50LnYxLkdsb2JUb29sQ2FsbEgAEjAKDmdyZXBfdG9vbF9jYWxsGAUgASgLMhYuYWdlbnQudjEuR3JlcFRvb2xDYWxsSAASMAoOcmVhZF90b29sX2NhbGwYCCABKAsyFi5hZ2VudC52MS5SZWFkVG9vbENhbGxIABI/ChZ1cGRhdGVfdG9kb3NfdG9vbF9jYWxsGAkgASgLMh0uYWdlbnQudjEuVXBkYXRlVG9kb3NUb29sQ2FsbEgAEjsKFHJlYWRfdG9kb3NfdG9vbF9jYWxsGAogASgLMhsuYWdlbnQudjEuUmVhZFRvZG9zVG9vbENhbGxIABIwCg5lZGl0X3Rvb2xfY2FsbBgMIAEoCzIWLmFnZW50LnYxLkVkaXRUb29sQ2FsbEgAEiwKDGxzX3Rvb2xfY2FsbBgNIAEoCzIULmFnZW50LnYxLkxzVG9vbENhbGxIABI7ChRyZWFkX2xpbnRzX3Rvb2xfY2FsbBgOIAEoCzIbLmFnZW50LnYxLlJlYWRMaW50c1Rvb2xDYWxsSAASLgoNbWNwX3Rvb2xfY2FsbBgPIAEoCzIVLmFnZW50LnYxLk1jcFRvb2xDYWxsSAASOwoUc2VtX3NlYXJjaF90b29sX2NhbGwYECABKAsyGy5hZ2VudC52MS5TZW1TZWFyY2hUb29sQ2FsbEgAEj0KFWNyZWF0ZV9wbGFuX3Rvb2xfY2FsbBgRIAEoCzIcLmFnZW50LnYxLkNyZWF0ZVBsYW5Ub29sQ2FsbEgAEjsKFHdlYl9zZWFyY2hfdG9vbF9jYWxsGBIgASgLMhsuYWdlbnQudjEuV2ViU2VhcmNoVG9vbENhbGxIABIwCg50YXNrX3Rvb2xfY2FsbBgTIAEoCzIWLmFnZW50LnYxLlRhc2tUb29sQ2FsbEgAEkoKHGxpc3RfbWNwX3Jlc291cmNlc190b29sX2NhbGwYFCABKAsyIi5hZ2VudC52MS5MaXN0TWNwUmVzb3VyY2VzVG9vbENhbGxIABJIChtyZWFkX21jcF9yZXNvdXJjZV90b29sX2NhbGwYFSABKAsyIS5hZ2VudC52MS5SZWFkTWNwUmVzb3VyY2VUb29sQ2FsbEgAEkYKGmFwcGx5X2FnZW50X2RpZmZfdG9vbF9jYWxsGBYgASgLMiAuYWdlbnQudjEuQXBwbHlBZ2VudERpZmZUb29sQ2FsbEgAEj8KFmFza19xdWVzdGlvbl90b29sX2NhbGwYFyABKAsyHS5hZ2VudC52MS5Bc2tRdWVzdGlvblRvb2xDYWxsSAASMgoPZmV0Y2hfdG9vbF9jYWxsGBggASgLMhcuYWdlbnQudjEuRmV0Y2hUb29sQ2FsbEgAEj0KFXN3aXRjaF9tb2RlX3Rvb2xfY2FsbBgZIAEoCzIcLmFnZW50LnYxLlN3aXRjaE1vZGVUb29sQ2FsbEgAEjsKFGV4YV9zZWFyY2hfdG9vbF9jYWxsGBogASgLMhsuYWdlbnQudjEuRXhhU2VhcmNoVG9vbENhbGxIABI5ChNleGFfZmV0Y2hfdG9vbF9jYWxsGBsgASgLMhouYWdlbnQudjEuRXhhRmV0Y2hUb29sQ2FsbEgAEkMKGGdlbmVyYXRlX2ltYWdlX3Rvb2xfY2FsbBgcIAEoCzIfLmFnZW50LnYxLkdlbmVyYXRlSW1hZ2VUb29sQ2FsbEgAEkEKF3JlY29yZF9zY3JlZW5fdG9vbF9jYWxsGB0gASgLMh4uYWdlbnQudjEuUmVjb3JkU2NyZWVuVG9vbENhbGxIABI/ChZjb21wdXRlcl91c2VfdG9vbF9jYWxsGB4gASgLMh0uYWdlbnQudjEuQ29tcHV0ZXJVc2VUb29sQ2FsbEgAEkgKG3dyaXRlX3NoZWxsX3N0ZGluX3Rvb2xfY2FsbBgfIAEoCzIhLmFnZW50LnYxLldyaXRlU2hlbGxTdGRpblRvb2xDYWxsSAASNgoRcmVmbGVjdF90b29sX2NhbGwYICABKAsyGS5hZ2VudC52MS5SZWZsZWN0VG9vbENhbGxIABJOCh5zZXR1cF92bV9lbnZpcm9ubWVudF90b29sX2NhbGwYISABKAsyJC5hZ2VudC52MS5TZXR1cFZtRW52aXJvbm1lbnRUb29sQ2FsbEgAEjoKE3RydW5jYXRlZF90b29sX2NhbGwYIiABKAsyGy5hZ2VudC52MS5UcnVuY2F0ZWRUb29sQ2FsbEgAElAKH3N0YXJ0X2dyaW5kX2V4ZWN1dGlvbl90b29sX2NhbGwYIyABKAsyJS5hZ2VudC52MS5TdGFydEdyaW5kRXhlY3V0aW9uVG9vbENhbGxIABJOCh5zdGFydF9ncmluZF9wbGFubmluZ190b29sX2NhbGwYJCABKAsyJC5hZ2VudC52MS5TdGFydEdyaW5kUGxhbm5pbmdUb29sQ2FsbEgAEjUKEXBpX3JlYWRfdG9vbF9jYWxsGD0gASgLMhguYWdlbnQudjEuUGlSZWFkVG9vbENhbGxIABI1ChFwaV9iYXNoX3Rvb2xfY2FsbBg+IAEoCzIYLmFnZW50LnYxLlBpQmFzaFRvb2xDYWxsSAASNQoRcGlfZWRpdF90b29sX2NhbGwYPyABKAsyGC5hZ2VudC52MS5QaUVkaXRUb29sQ2FsbEgAEjcKEnBpX3dyaXRlX3Rvb2xfY2FsbBhAIAEoCzIZLmFnZW50LnYxLlBpV3JpdGVUb29sQ2FsbEgAEjUKEXBpX2dyZXBfdG9vbF9jYWxsGEEgASgLMhguYWdlbnQudjEuUGlHcmVwVG9vbENhbGxIABI1ChFwaV9maW5kX3Rvb2xfY2FsbBhCIAEoCzIYLmFnZW50LnYxLlBpRmluZFRvb2xDYWxsSAASMQoPcGlfbHNfdG9vbF9jYWxsGEMgASgLMhYuYWdlbnQudjEuUGlMc1Rvb2xDYWxsSAASPQoVY29ubmVjdF9zY21fdG9vbF9jYWxsGEQgASgLMhwuYWdlbnQudjEuQ29ubmVjdFNjbVRvb2xDYWxsSAASTwoec2VhcmNoX2NvbnZlcnNhdGlvbnNfdG9vbF9jYWxsGEUgASgLMiUuYWdlbnQudjEuU2VhcmNoQ29udmVyc2F0aW9uc1Rvb2xDYWxsSAASGQoMdG9vbF9jYWxsX2lkGDkgASgJSAGIAQFCBgoEdG9vbEIPCg1fdG9vbF9jYWxsX2lkIhcKFVRydW5jYXRlZFRvb2xDYWxsQXJncyIaChhUcnVuY2F0ZWRUb29sQ2FsbFN1Y2Nlc3MiJwoWVHJ1bmNhdGVkVG9vbENhbGxFcnJvchINCgVlcnJvchgBIAEoCSKNAQoXVHJ1bmNhdGVkVG9vbENhbGxSZXN1bHQSNQoHc3VjY2VzcxgBIAEoCzIiLmFnZW50LnYxLlRydW5jYXRlZFRvb2xDYWxsU3VjY2Vzc0gAEjEKBWVycm9yGAIgASgLMiAuYWdlbnQudjEuVHJ1bmNhdGVkVG9vbENhbGxFcnJvckgAQggKBnJlc3VsdCKUAQoRVHJ1bmNhdGVkVG9vbENhbGwSHQoVb3JpZ2luYWxfc3RlcF9ibG9iX2lkGAEgASgMEi0KBGFyZ3MYAiABKAsyHy5hZ2VudC52MS5UcnVuY2F0ZWRUb29sQ2FsbEFyZ3MSMQoGcmVzdWx0GAMgASgLMiEuYWdlbnQudjEuVHJ1bmNhdGVkVG9vbENhbGxSZXN1bHQi0QEKDVRvb2xDYWxsRGVsdGESPQoVc2hlbGxfdG9vbF9jYWxsX2RlbHRhGAEgASgLMhwuYWdlbnQudjEuU2hlbGxUb29sQ2FsbERlbHRhSAASOwoUdGFza190b29sX2NhbGxfZGVsdGEYAiABKAsyGy5hZ2VudC52MS5UYXNrVG9vbENhbGxEZWx0YUgAEjsKFGVkaXRfdG9vbF9jYWxsX2RlbHRhGAMgASgLMhsuYWdlbnQudjEuRWRpdFRvb2xDYWxsRGVsdGFIAEIHCgVkZWx0YSK2AQoQQ29udmVyc2F0aW9uU3RlcBI3ChFhc3Npc3RhbnRfbWVzc2FnZRgBIAEoCzIaLmFnZW50LnYxLkFzc2lzdGFudE1lc3NhZ2VIABInCgl0b29sX2NhbGwYAiABKAsyEi5hZ2VudC52MS5Ub29sQ2FsbEgAEjUKEHRoaW5raW5nX21lc3NhZ2UYAyABKAsyGS5hZ2VudC52MS5UaGlua2luZ01lc3NhZ2VIAEIJCgdtZXNzYWdlIoEEChJDb252ZXJzYXRpb25BY3Rpb24SOgoTdXNlcl9tZXNzYWdlX2FjdGlvbhgBIAEoCzIbLmFnZW50LnYxLlVzZXJNZXNzYWdlQWN0aW9uSAASLwoNcmVzdW1lX2FjdGlvbhgCIAEoCzIWLmFnZW50LnYxLlJlc3VtZUFjdGlvbkgAEi8KDWNhbmNlbF9hY3Rpb24YAyABKAsyFi5hZ2VudC52MS5DYW5jZWxBY3Rpb25IABI1ChBzdW1tYXJpemVfYWN0aW9uGAQgASgLMhkuYWdlbnQudjEuU3VtbWFyaXplQWN0aW9uSAASPAoUc2hlbGxfY29tbWFuZF9hY3Rpb24YBSABKAsyHC5hZ2VudC52MS5TaGVsbENvbW1hbmRBY3Rpb25IABI2ChFzdGFydF9wbGFuX2FjdGlvbhgGIAEoCzIZLmFnZW50LnYxLlN0YXJ0UGxhbkFjdGlvbkgAEjoKE2V4ZWN1dGVfcGxhbl9hY3Rpb24YByABKAsyGy5hZ2VudC52MS5FeGVjdXRlUGxhbkFjdGlvbkgAEloKJGFzeW5jX2Fza19xdWVzdGlvbl9jb21wbGV0aW9uX2FjdGlvbhgIIAEoCzIqLmFnZW50LnYxLkFzeW5jQXNrUXVlc3Rpb25Db21wbGV0aW9uQWN0aW9uSABCCAoGYWN0aW9uIr8BChFVc2VyTWVzc2FnZUFjdGlvbhIrCgx1c2VyX21lc3NhZ2UYASABKAsyFS5hZ2VudC52MS5Vc2VyTWVzc2FnZRIxCg9yZXF1ZXN0X2NvbnRleHQYAiABKAsyGC5hZ2VudC52MS5SZXF1ZXN0Q29udGV4dBIpChxzZW5kX3RvX2ludGVyYWN0aW9uX2xpc3RlbmVyGAMgASgISACIAQFCHwodX3NlbmRfdG9faW50ZXJhY3Rpb25fbGlzdGVuZXIiDgoMQ2FuY2VsQWN0aW9uIkEKDFJlc3VtZUFjdGlvbhIxCg9yZXF1ZXN0X2NvbnRleHQYAiABKAsyGC5hZ2VudC52MS5SZXF1ZXN0Q29udGV4dCKgAQogQXN5bmNBc2tRdWVzdGlvbkNvbXBsZXRpb25BY3Rpb24SHQoVb3JpZ2luYWxfdG9vbF9jYWxsX2lkGAEgASgJEjAKDW9yaWdpbmFsX2FyZ3MYAiABKAsyGS5hZ2VudC52MS5Bc2tRdWVzdGlvbkFyZ3MSKwoGcmVzdWx0GAMgASgLMhsuYWdlbnQudjEuQXNrUXVlc3Rpb25SZXN1bHQiEQoPU3VtbWFyaXplQWN0aW9uIlQKElNoZWxsQ29tbWFuZEFjdGlvbhItCg1zaGVsbF9jb21tYW5kGAEgASgLMhYuYWdlbnQudjEuU2hlbGxDb21tYW5kEg8KB2V4ZWNfaWQYAiABKAkiggEKD1N0YXJ0UGxhbkFjdGlvbhIrCgx1c2VyX21lc3NhZ2UYASABKAsyFS5hZ2VudC52MS5Vc2VyTWVzc2FnZRIxCg9yZXF1ZXN0X2NvbnRleHQYAiABKAsyGC5hZ2VudC52MS5SZXF1ZXN0Q29udGV4dBIPCgdpc19zcGVjGAMgASgIIuIBChFFeGVjdXRlUGxhbkFjdGlvbhIxCg9yZXF1ZXN0X2NvbnRleHQYASABKAsyGC5hZ2VudC52MS5SZXF1ZXN0Q29udGV4dBItCgRwbGFuGAIgASgLMhouYWdlbnQudjEuQ29udmVyc2F0aW9uUGxhbkgAiAEBEhoKDXBsYW5fZmlsZV91cmkYAyABKAlIAYgBARIeChFwbGFuX2ZpbGVfY29udGVudBgEIAEoCUgCiAEBQgcKBV9wbGFuQhAKDl9wbGFuX2ZpbGVfdXJpQhQKEl9wbGFuX2ZpbGVfY29udGVudCLoAgoLVXNlck1lc3NhZ2USDAoEdGV4dBgBIAEoCRISCgptZXNzYWdlX2lkGAIgASgJEjgKEHNlbGVjdGVkX2NvbnRleHQYAyABKAsyGS5hZ2VudC52MS5TZWxlY3RlZENvbnRleHRIAIgBARIMCgRtb2RlGAQgASgFEh0KEGlzX3NpbXVsYXRlZF9tc2cYBSABKAhIAYgBARIfChJiZXN0X29mX25fZ3JvdXBfaWQYBiABKAlIAogBARIoCht0cnlfdXNlX2Jlc3Rfb2Zfbl9wcm9tb3Rpb24YByABKAhIA4gBARIWCglyaWNoX3RleHQYCCABKAlIBIgBAUITChFfc2VsZWN0ZWRfY29udGV4dEITChFfaXNfc2ltdWxhdGVkX21zZ0IVChNfYmVzdF9vZl9uX2dyb3VwX2lkQh4KHF90cnlfdXNlX2Jlc3Rfb2Zfbl9wcm9tb3Rpb25CDAoKX3JpY2hfdGV4dCIgChBBc3Npc3RhbnRNZXNzYWdlEgwKBHRleHQYASABKAkiNAoPVGhpbmtpbmdNZXNzYWdlEgwKBHRleHQYASABKAkSEwoLZHVyYXRpb25fbXMYAiABKA0iHwoMU2hlbGxDb21tYW5kEg8KB2NvbW1hbmQYASABKAkiQAoLU2hlbGxPdXRwdXQSDgoGc3Rkb3V0GAEgASgJEg4KBnN0ZGVychgCIAEoCRIRCglleGl0X2NvZGUYAyABKAUiogEKEENvbnZlcnNhdGlvblR1cm4SQgoXYWdlbnRfY29udmVyc2F0aW9uX3R1cm4YASABKAsyHy5hZ2VudC52MS5BZ2VudENvbnZlcnNhdGlvblR1cm5IABJCChdzaGVsbF9jb252ZXJzYXRpb25fdHVybhgCIAEoCzIfLmFnZW50LnYxLlNoZWxsQ29udmVyc2F0aW9uVHVybkgAQgYKBHR1cm4iIAoQQ29udmVyc2F0aW9uUGxhbhIMCgRwbGFuGAEgASgJIr0BChlDb252ZXJzYXRpb25UdXJuU3RydWN0dXJlEksKF2FnZW50X2NvbnZlcnNhdGlvbl90dXJuGAEgASgLMiguYWdlbnQudjEuQWdlbnRDb252ZXJzYXRpb25UdXJuU3RydWN0dXJlSAASSwoXc2hlbGxfY29udmVyc2F0aW9uX3R1cm4YAiABKAsyKC5hZ2VudC52MS5TaGVsbENvbnZlcnNhdGlvblR1cm5TdHJ1Y3R1cmVIAEIGCgR0dXJuIpcBChVBZ2VudENvbnZlcnNhdGlvblR1cm4SKwoMdXNlcl9tZXNzYWdlGAEgASgLMhUuYWdlbnQudjEuVXNlck1lc3NhZ2USKQoFc3RlcHMYAiADKAsyGi5hZ2VudC52MS5Db252ZXJzYXRpb25TdGVwEhcKCnJlcXVlc3RfaWQYAyABKAlIAIgBAUINCgtfcmVxdWVzdF9pZCJtCh5BZ2VudENvbnZlcnNhdGlvblR1cm5TdHJ1Y3R1cmUSFAoMdXNlcl9tZXNzYWdlGAEgASgMEg0KBXN0ZXBzGAIgAygMEhcKCnJlcXVlc3RfaWQYAyABKAlIAIgBAUINCgtfcmVxdWVzdF9pZCJzChVTaGVsbENvbnZlcnNhdGlvblR1cm4SLQoNc2hlbGxfY29tbWFuZBgBIAEoCzIWLmFnZW50LnYxLlNoZWxsQ29tbWFuZBIrCgxzaGVsbF9vdXRwdXQYAiABKAsyFS5hZ2VudC52MS5TaGVsbE91dHB1dCJNCh5TaGVsbENvbnZlcnNhdGlvblR1cm5TdHJ1Y3R1cmUSFQoNc2hlbGxfY29tbWFuZBgBIAEoDBIUCgxzaGVsbF9vdXRwdXQYAiABKAwiJgoTQ29udmVyc2F0aW9uU3VtbWFyeRIPCgdzdW1tYXJ5GAEgASgJIngKGkNvbnZlcnNhdGlvblN1bW1hcnlBcmNoaXZlEhsKE3N1bW1hcml6ZWRfbWVzc2FnZXMYASADKAwSDwoHc3VtbWFyeRgCIAEoCRITCgt3aW5kb3dfdGFpbBgDIAEoDRIXCg9zdW1tYXJ5X21lc3NhZ2UYBCABKAwiQwoYQ29udmVyc2F0aW9uVG9rZW5EZXRhaWxzEhMKC3VzZWRfdG9rZW5zGAEgASgNEhIKCm1heF90b2tlbnMYAiABKA0iXwoJRmlsZVN0YXRlEhQKB2NvbnRlbnQYASABKAlIAIgBARIcCg9pbml0aWFsX2NvbnRlbnQYAiABKAlIAYgBAUIKCghfY29udGVudEISChBfaW5pdGlhbF9jb250ZW50ImgKEkZpbGVTdGF0ZVN0cnVjdHVyZRIUCgdjb250ZW50GAEgASgMSACIAQESHAoPaW5pdGlhbF9jb250ZW50GAIgASgMSAGIAQFCCgoIX2NvbnRlbnRCEgoQX2luaXRpYWxfY29udGVudCI3CgpTdGVwVGltaW5nEhMKC2R1cmF0aW9uX21zGAEgASgEEhQKDHRpbWVzdGFtcF9tcxgCIAEoBCL2BAoRQ29udmVyc2F0aW9uU3RhdGUSIQoZcm9vdF9wcm9tcHRfbWVzc2FnZXNfanNvbhgBIAMoCRIpCgV0dXJucxgIIAMoCzIaLmFnZW50LnYxLkNvbnZlcnNhdGlvblR1cm4SIQoFdG9kb3MYAyADKAsyEi5hZ2VudC52MS5Ub2RvSXRlbRIaChJwZW5kaW5nX3Rvb2xfY2FsbHMYBCADKAkSOQoNdG9rZW5fZGV0YWlscxgFIAEoCzIiLmFnZW50LnYxLkNvbnZlcnNhdGlvblRva2VuRGV0YWlscxIzCgdzdW1tYXJ5GAYgASgLMh0uYWdlbnQudjEuQ29udmVyc2F0aW9uU3VtbWFyeUgAiAEBEi0KBHBsYW4YByABKAsyGi5hZ2VudC52MS5Db252ZXJzYXRpb25QbGFuSAGIAQESQgoPc3VtbWFyeV9hcmNoaXZlGAkgASgLMiQuYWdlbnQudjEuQ29udmVyc2F0aW9uU3VtbWFyeUFyY2hpdmVIAogBARJACgtmaWxlX3N0YXRlcxgKIAMoCzIrLmFnZW50LnYxLkNvbnZlcnNhdGlvblN0YXRlLkZpbGVTdGF0ZXNFbnRyeRI+ChBzdW1tYXJ5X2FyY2hpdmVzGAsgAygLMiQuYWdlbnQudjEuQ29udmVyc2F0aW9uU3VtbWFyeUFyY2hpdmUaRgoPRmlsZVN0YXRlc0VudHJ5EgsKA2tleRgBIAEoCRIiCgV2YWx1ZRgCIAEoCzITLmFnZW50LnYxLkZpbGVTdGF0ZToCOAFCCgoIX3N1bW1hcnlCBwoFX3BsYW5CEgoQX3N1bW1hcnlfYXJjaGl2ZSLHAQoWU3ViYWdlbnRQZXJzaXN0ZWRTdGF0ZRJAChJjb252ZXJzYXRpb25fc3RhdGUYASABKAsyJC5hZ2VudC52MS5Db252ZXJzYXRpb25TdGF0ZVN0cnVjdHVyZRIcChRjcmVhdGVkX3RpbWVzdGFtcF9tcxgCIAEoBBIeChZsYXN0X3VzZWRfdGltZXN0YW1wX21zGAMgASgEEi0KDXN1YmFnZW50X3R5cGUYBCABKAsyFi5hZ2VudC52MS5TdWJhZ2VudFR5cGUitwcKGkNvbnZlcnNhdGlvblN0YXRlU3RydWN0dXJlEhEKCXR1cm5zX29sZBgCIAMoDBIhChlyb290X3Byb21wdF9tZXNzYWdlc19qc29uGAEgAygMEg0KBXR1cm5zGAggAygMEg0KBXRvZG9zGAMgAygMEhoKEnBlbmRpbmdfdG9vbF9jYWxscxgEIAMoCRI5Cg10b2tlbl9kZXRhaWxzGAUgASgLMiIuYWdlbnQudjEuQ29udmVyc2F0aW9uVG9rZW5EZXRhaWxzEhQKB3N1bW1hcnkYBiABKAxIAIgBARIRCgRwbGFuGAcgASgMSAGIAQESHwoXcHJldmlvdXNfd29ya3NwYWNlX3VyaXMYCSADKAkSEQoEbW9kZRgKIAEoBUgCiAEBEhwKD3N1bW1hcnlfYXJjaGl2ZRgLIAEoDEgDiAEBEkkKC2ZpbGVfc3RhdGVzGAwgAygLMjQuYWdlbnQudjEuQ29udmVyc2F0aW9uU3RhdGVTdHJ1Y3R1cmUuRmlsZVN0YXRlc0VudHJ5Ek4KDmZpbGVfc3RhdGVzX3YyGA8gAygLMjYuYWdlbnQudjEuQ29udmVyc2F0aW9uU3RhdGVTdHJ1Y3R1cmUuRmlsZVN0YXRlc1YyRW50cnkSGAoQc3VtbWFyeV9hcmNoaXZlcxgNIAMoDBIqCgx0dXJuX3RpbWluZ3MYDiADKAsyFC5hZ2VudC52MS5TdGVwVGltaW5nElEKD3N1YmFnZW50X3N0YXRlcxgQIAMoCzI4LmFnZW50LnYxLkNvbnZlcnNhdGlvblN0YXRlU3RydWN0dXJlLlN1YmFnZW50U3RhdGVzRW50cnkSGgoSc2VsZl9zdW1tYXJ5X2NvdW50GBEgASgNEhIKCnJlYWRfcGF0aHMYEiADKAkaMQoPRmlsZVN0YXRlc0VudHJ5EgsKA2tleRgBIAEoCRINCgV2YWx1ZRgCIAEoDDoCOAEaUQoRRmlsZVN0YXRlc1YyRW50cnkSCwoDa2V5GAEgASgJEisKBXZhbHVlGAIgASgLMhwuYWdlbnQudjEuRmlsZVN0YXRlU3RydWN0dXJlOgI4ARpXChNTdWJhZ2VudFN0YXRlc0VudHJ5EgsKA2tleRgBIAEoCRIvCgV2YWx1ZRgCIAEoCzIgLmFnZW50LnYxLlN1YmFnZW50UGVyc2lzdGVkU3RhdGU6AjgBQgoKCF9zdW1tYXJ5QgcKBV9wbGFuQgcKBV9tb2RlQhIKEF9zdW1tYXJ5X2FyY2hpdmUiEQoPVGhpbmtpbmdEZXRhaWxzIkgKEUFwaUtleUNyZWRlbnRpYWxzEg8KB2FwaV9rZXkYASABKAkSFQoIYmFzZV91cmwYAiABKAlIAIgBAUILCglfYmFzZV91cmwiSQoQQXp1cmVDcmVkZW50aWFscxIPCgdhcGlfa2V5GAEgASgJEhAKCGJhc2VfdXJsGAIgASgJEhIKCmRlcGxveW1lbnQYAyABKAkiegoSQmVkcm9ja0NyZWRlbnRpYWxzEhIKCmFjY2Vzc19rZXkYASABKAkSEgoKc2VjcmV0X2tleRgCIAEoCRIOCgZyZWdpb24YAyABKAkSGgoNc2Vzc2lvbl90b2tlbhgEIAEoCUgAiAEBQhAKDl9zZXNzaW9uX3Rva2VuIrEDCgxNb2RlbERldGFpbHMSEAoIbW9kZWxfaWQYASABKAkSGAoQZGlzcGxheV9tb2RlbF9pZBgDIAEoCRIUCgxkaXNwbGF5X25hbWUYBCABKAkSGgoSZGlzcGxheV9uYW1lX3Nob3J0GAUgASgJEg8KB2FsaWFzZXMYBiADKAkSOAoQdGhpbmtpbmdfZGV0YWlscxgCIAEoCzIZLmFnZW50LnYxLlRoaW5raW5nRGV0YWlsc0gBiAEBEhUKCG1heF9tb2RlGAcgASgISAKIAQESOgoTYXBpX2tleV9jcmVkZW50aWFscxgIIAEoCzIbLmFnZW50LnYxLkFwaUtleUNyZWRlbnRpYWxzSAASNwoRYXp1cmVfY3JlZGVudGlhbHMYCSABKAsyGi5hZ2VudC52MS5BenVyZUNyZWRlbnRpYWxzSAASOwoTYmVkcm9ja19jcmVkZW50aWFscxgKIAEoCzIcLmFnZW50LnYxLkJlZHJvY2tDcmVkZW50aWFsc0gAQg0KC2NyZWRlbnRpYWxzQhMKEV90aGlua2luZ19kZXRhaWxzQgsKCV9tYXhfbW9kZSK3AgoOUmVxdWVzdGVkTW9kZWwSEAoIbW9kZWxfaWQYASABKAkSEAoIbWF4X21vZGUYAiABKAgSQAoKcGFyYW1ldGVycxgDIAMoCzIsLmFnZW50LnYxLlJlcXVlc3RlZE1vZGVsX01vZGVsUGFyYW1ldGVyYnl0ZXMSOgoTYXBpX2tleV9jcmVkZW50aWFscxgEIAEoCzIbLmFnZW50LnYxLkFwaUtleUNyZWRlbnRpYWxzSAASNwoRYXp1cmVfY3JlZGVudGlhbHMYBSABKAsyGi5hZ2VudC52MS5BenVyZUNyZWRlbnRpYWxzSAASOwoTYmVkcm9ja19jcmVkZW50aWFscxgGIAEoCzIcLmFnZW50LnYxLkJlZHJvY2tDcmVkZW50aWFsc0gAQg0KC2NyZWRlbnRpYWxzIj8KIlJlcXVlc3RlZE1vZGVsX01vZGVsUGFyYW1ldGVyYnl0ZXMSCgoCaWQYASABKAkSDQoFdmFsdWUYAiABKAkiuQQKD0FnZW50UnVuUmVxdWVzdBJAChJjb252ZXJzYXRpb25fc3RhdGUYASABKAsyJC5hZ2VudC52MS5Db252ZXJzYXRpb25TdGF0ZVN0cnVjdHVyZRIsCgZhY3Rpb24YAiABKAsyHC5hZ2VudC52MS5Db252ZXJzYXRpb25BY3Rpb24SLQoNbW9kZWxfZGV0YWlscxgDIAEoCzIWLmFnZW50LnYxLk1vZGVsRGV0YWlscxI2Cg9yZXF1ZXN0ZWRfbW9kZWwYCSABKAsyGC5hZ2VudC52MS5SZXF1ZXN0ZWRNb2RlbEgAiAEBEiUKCW1jcF90b29scxgEIAEoCzISLmFnZW50LnYxLk1jcFRvb2xzEhwKD2NvbnZlcnNhdGlvbl9pZBgFIAEoCUgBiAEBEkQKF21jcF9maWxlX3N5c3RlbV9vcHRpb25zGAYgASgLMh4uYWdlbnQudjEuTWNwRmlsZVN5c3RlbU9wdGlvbnNIAogBARIyCg1za2lsbF9vcHRpb25zGAcgASgLMhYuYWdlbnQudjEuU2tpbGxPcHRpb25zSAOIAQESIQoUY3VzdG9tX3N5c3RlbV9wcm9tcHQYCCABKAlIBIgBAUISChBfcmVxdWVzdGVkX21vZGVsQhIKEF9jb252ZXJzYXRpb25faWRCGgoYX21jcF9maWxlX3N5c3RlbV9vcHRpb25zQhAKDl9za2lsbF9vcHRpb25zQhcKFV9jdXN0b21fc3lzdGVtX3Byb21wdCIfCg9UZXh0RGVsdGFVcGRhdGUSDAoEdGV4dBgBIAEoCSJmChVUb29sQ2FsbFN0YXJ0ZWRVcGRhdGUSDwoHY2FsbF9pZBgBIAEoCRIlCgl0b29sX2NhbGwYAiABKAsyEi5hZ2VudC52MS5Ub29sQ2FsbBIVCg1tb2RlbF9jYWxsX2lkGAMgASgJImgKF1Rvb2xDYWxsQ29tcGxldGVkVXBkYXRlEg8KB2NhbGxfaWQYASABKAkSJQoJdG9vbF9jYWxsGAIgASgLMhIuYWdlbnQudjEuVG9vbENhbGwSFQoNbW9kZWxfY2FsbF9pZBgDIAEoCSJvChNUb29sQ2FsbERlbHRhVXBkYXRlEg8KB2NhbGxfaWQYASABKAkSMAoPdG9vbF9jYWxsX2RlbHRhGAIgASgLMhcuYWdlbnQudjEuVG9vbENhbGxEZWx0YRIVCg1tb2RlbF9jYWxsX2lkGAMgASgJIn8KFVBhcnRpYWxUb29sQ2FsbFVwZGF0ZRIPCgdjYWxsX2lkGAEgASgJEiUKCXRvb2xfY2FsbBgCIAEoCzISLmFnZW50LnYxLlRvb2xDYWxsEhcKD2FyZ3NfdGV4dF9kZWx0YRgDIAEoCRIVCg1tb2RlbF9jYWxsX2lkGAQgASgJIiMKE1RoaW5raW5nRGVsdGFVcGRhdGUSDAoEdGV4dBgBIAEoCSI3ChdUaGlua2luZ0NvbXBsZXRlZFVwZGF0ZRIcChR0aGlua2luZ19kdXJhdGlvbl9tcxgBIAEoBSIiChBUb2tlbkRlbHRhVXBkYXRlEg4KBnRva2VucxgBIAEoBSIgCg1TdW1tYXJ5VXBkYXRlEg8KB3N1bW1hcnkYASABKAkiFgoUU3VtbWFyeVN0YXJ0ZWRVcGRhdGUiEQoPSGVhcnRiZWF0VXBkYXRlIhgKFlN1bW1hcnlDb21wbGV0ZWRVcGRhdGUi1wEKFlNoZWxsT3V0cHV0RGVsdGFVcGRhdGUSLQoGc3Rkb3V0GAEgASgLMhsuYWdlbnQudjEuU2hlbGxTdHJlYW1TdGRvdXRIABItCgZzdGRlcnIYAiABKAsyGy5hZ2VudC52MS5TaGVsbFN0cmVhbVN0ZGVyckgAEikKBGV4aXQYAyABKAsyGS5hZ2VudC52MS5TaGVsbFN0cmVhbUV4aXRIABIrCgVzdGFydBgEIAEoCzIaLmFnZW50LnYxLlNoZWxsU3RyZWFtU3RhcnRIAEIHCgVldmVudCIRCg9UdXJuRW5kZWRVcGRhdGUiSAoZVXNlck1lc3NhZ2VBcHBlbmRlZFVwZGF0ZRIrCgx1c2VyX21lc3NhZ2UYASABKAsyFS5hZ2VudC52MS5Vc2VyTWVzc2FnZSIkChFTdGVwU3RhcnRlZFVwZGF0ZRIPCgdzdGVwX2lkGAEgASgEIkAKE1N0ZXBDb21wbGV0ZWRVcGRhdGUSDwoHc3RlcF9pZBgBIAEoBBIYChBzdGVwX2R1cmF0aW9uX21zGAIgASgDIu8HChFJbnRlcmFjdGlvblVwZGF0ZRIvCgp0ZXh0X2RlbHRhGAEgASgLMhkuYWdlbnQudjEuVGV4dERlbHRhVXBkYXRlSAASPAoRcGFydGlhbF90b29sX2NhbGwYByABKAsyHy5hZ2VudC52MS5QYXJ0aWFsVG9vbENhbGxVcGRhdGVIABI4Cg90b29sX2NhbGxfZGVsdGEYDyABKAsyHS5hZ2VudC52MS5Ub29sQ2FsbERlbHRhVXBkYXRlSAASPAoRdG9vbF9jYWxsX3N0YXJ0ZWQYAiABKAsyHy5hZ2VudC52MS5Ub29sQ2FsbFN0YXJ0ZWRVcGRhdGVIABJAChN0b29sX2NhbGxfY29tcGxldGVkGAMgASgLMiEuYWdlbnQudjEuVG9vbENhbGxDb21wbGV0ZWRVcGRhdGVIABI3Cg50aGlua2luZ19kZWx0YRgEIAEoCzIdLmFnZW50LnYxLlRoaW5raW5nRGVsdGFVcGRhdGVIABI/ChJ0aGlua2luZ19jb21wbGV0ZWQYBSABKAsyIS5hZ2VudC52MS5UaGlua2luZ0NvbXBsZXRlZFVwZGF0ZUgAEkQKFXVzZXJfbWVzc2FnZV9hcHBlbmRlZBgGIAEoCzIjLmFnZW50LnYxLlVzZXJNZXNzYWdlQXBwZW5kZWRVcGRhdGVIABIxCgt0b2tlbl9kZWx0YRgIIAEoCzIaLmFnZW50LnYxLlRva2VuRGVsdGFVcGRhdGVIABIqCgdzdW1tYXJ5GAkgASgLMhcuYWdlbnQudjEuU3VtbWFyeVVwZGF0ZUgAEjkKD3N1bW1hcnlfc3RhcnRlZBgKIAEoCzIeLmFnZW50LnYxLlN1bW1hcnlTdGFydGVkVXBkYXRlSAASPQoRc3VtbWFyeV9jb21wbGV0ZWQYCyABKAsyIC5hZ2VudC52MS5TdW1tYXJ5Q29tcGxldGVkVXBkYXRlSAASPgoSc2hlbGxfb3V0cHV0X2RlbHRhGAwgASgLMiAuYWdlbnQudjEuU2hlbGxPdXRwdXREZWx0YVVwZGF0ZUgAEi4KCWhlYXJ0YmVhdBgNIAEoCzIZLmFnZW50LnYxLkhlYXJ0YmVhdFVwZGF0ZUgAEi8KCnR1cm5fZW5kZWQYDiABKAsyGS5hZ2VudC52MS5UdXJuRW5kZWRVcGRhdGVIABIzCgxzdGVwX3N0YXJ0ZWQYECABKAsyGy5hZ2VudC52MS5TdGVwU3RhcnRlZFVwZGF0ZUgAEjcKDnN0ZXBfY29tcGxldGVkGBEgASgLMh0uYWdlbnQudjEuU3RlcENvbXBsZXRlZFVwZGF0ZUgAQgkKB21lc3NhZ2UimgQKEEludGVyYWN0aW9uUXVlcnkSCgoCaWQYASABKA0SQwoYd2ViX3NlYXJjaF9yZXF1ZXN0X3F1ZXJ5GAIgASgLMh8uYWdlbnQudjEuV2ViU2VhcmNoUmVxdWVzdFF1ZXJ5SAASTwoeYXNrX3F1ZXN0aW9uX2ludGVyYWN0aW9uX3F1ZXJ5GAMgASgLMiUuYWdlbnQudjEuQXNrUXVlc3Rpb25JbnRlcmFjdGlvblF1ZXJ5SAASRQoZc3dpdGNoX21vZGVfcmVxdWVzdF9xdWVyeRgEIAEoCzIgLmFnZW50LnYxLlN3aXRjaE1vZGVSZXF1ZXN0UXVlcnlIABJDChhleGFfc2VhcmNoX3JlcXVlc3RfcXVlcnkYBSABKAsyHy5hZ2VudC52MS5FeGFTZWFyY2hSZXF1ZXN0UXVlcnlIABJBChdleGFfZmV0Y2hfcmVxdWVzdF9xdWVyeRgGIAEoCzIeLmFnZW50LnYxLkV4YUZldGNoUmVxdWVzdFF1ZXJ5SAASRQoZY3JlYXRlX3BsYW5fcmVxdWVzdF9xdWVyeRgHIAEoCzIgLmFnZW50LnYxLkNyZWF0ZVBsYW5SZXF1ZXN0UXVlcnlIABJFChlzZXR1cF92bV9lbnZpcm9ubWVudF9hcmdzGAggASgLMiAuYWdlbnQudjEuU2V0dXBWbUVudmlyb25tZW50QXJnc0gAQgcKBXF1ZXJ5IsYEChNJbnRlcmFjdGlvblJlc3BvbnNlEgoKAmlkGAEgASgNEkkKG3dlYl9zZWFyY2hfcmVxdWVzdF9yZXNwb25zZRgCIAEoCzIiLmFnZW50LnYxLldlYlNlYXJjaFJlcXVlc3RSZXNwb25zZUgAElUKIWFza19xdWVzdGlvbl9pbnRlcmFjdGlvbl9yZXNwb25zZRgDIAEoCzIoLmFnZW50LnYxLkFza1F1ZXN0aW9uSW50ZXJhY3Rpb25SZXNwb25zZUgAEksKHHN3aXRjaF9tb2RlX3JlcXVlc3RfcmVzcG9uc2UYBCABKAsyIy5hZ2VudC52MS5Td2l0Y2hNb2RlUmVxdWVzdFJlc3BvbnNlSAASSQobZXhhX3NlYXJjaF9yZXF1ZXN0X3Jlc3BvbnNlGAUgASgLMiIuYWdlbnQudjEuRXhhU2VhcmNoUmVxdWVzdFJlc3BvbnNlSAASRwoaZXhhX2ZldGNoX3JlcXVlc3RfcmVzcG9uc2UYBiABKAsyIS5hZ2VudC52MS5FeGFGZXRjaFJlcXVlc3RSZXNwb25zZUgAEksKHGNyZWF0ZV9wbGFuX3JlcXVlc3RfcmVzcG9uc2UYByABKAsyIy5hZ2VudC52MS5DcmVhdGVQbGFuUmVxdWVzdFJlc3BvbnNlSAASSQobc2V0dXBfdm1fZW52aXJvbm1lbnRfcmVzdWx0GAggASgLMiIuYWdlbnQudjEuU2V0dXBWbUVudmlyb25tZW50UmVzdWx0SABCCAoGcmVzdWx0IlwKG0Fza1F1ZXN0aW9uSW50ZXJhY3Rpb25RdWVyeRInCgRhcmdzGAEgASgLMhkuYWdlbnQudjEuQXNrUXVlc3Rpb25BcmdzEhQKDHRvb2xfY2FsbF9pZBgCIAEoCSJNCh5Bc2tRdWVzdGlvbkludGVyYWN0aW9uUmVzcG9uc2USKwoGcmVzdWx0GAEgASgLMhsuYWdlbnQudjEuQXNrUXVlc3Rpb25SZXN1bHQiEQoPQ2xpZW50SGVhcnRiZWF0IsYECg5QcmV3YXJtUmVxdWVzdBItCg1tb2RlbF9kZXRhaWxzGAEgASgLMhYuYWdlbnQudjEuTW9kZWxEZXRhaWxzEjYKD3JlcXVlc3RlZF9tb2RlbBgJIAEoCzIYLmFnZW50LnYxLlJlcXVlc3RlZE1vZGVsSACIAQESHAoPY29udmVyc2F0aW9uX2lkGAIgASgJSAGIAQESQAoSY29udmVyc2F0aW9uX3N0YXRlGAMgASgLMiQuYWdlbnQudjEuQ29udmVyc2F0aW9uU3RhdGVTdHJ1Y3R1cmUSJQoJbWNwX3Rvb2xzGAQgASgLMhIuYWdlbnQudjEuTWNwVG9vbHMSRAoXbWNwX2ZpbGVfc3lzdGVtX29wdGlvbnMYBSABKAsyHi5hZ2VudC52MS5NY3BGaWxlU3lzdGVtT3B0aW9uc0gCiAEBEh8KEmJlc3Rfb2Zfbl9ncm91cF9pZBgGIAEoCUgDiAEBEigKG3RyeV91c2VfYmVzdF9vZl9uX3Byb21vdGlvbhgHIAEoCEgEiAEBEiEKFGN1c3RvbV9zeXN0ZW1fcHJvbXB0GAggASgJSAWIAQFCEgoQX3JlcXVlc3RlZF9tb2RlbEISChBfY29udmVyc2F0aW9uX2lkQhoKGF9tY3BfZmlsZV9zeXN0ZW1fb3B0aW9uc0IVChNfYmVzdF9vZl9uX2dyb3VwX2lkQh4KHF90cnlfdXNlX2Jlc3Rfb2Zfbl9wcm9tb3Rpb25CFwoVX2N1c3RvbV9zeXN0ZW1fcHJvbXB0Ih0KD0V4ZWNTZXJ2ZXJBYm9ydBIKCgJpZBgBIAEoDSJRChhFeGVjU2VydmVyQ29udHJvbE1lc3NhZ2USKgoFYWJvcnQYASABKAsyGS5hZ2VudC52MS5FeGVjU2VydmVyQWJvcnRIAEIJCgdtZXNzYWdlIvgDChJBZ2VudENsaWVudE1lc3NhZ2USMAoLcnVuX3JlcXVlc3QYASABKAsyGS5hZ2VudC52MS5BZ2VudFJ1blJlcXVlc3RIABI6ChNleGVjX2NsaWVudF9tZXNzYWdlGAIgASgLMhsuYWdlbnQudjEuRXhlY0NsaWVudE1lc3NhZ2VIABJJChtleGVjX2NsaWVudF9jb250cm9sX21lc3NhZ2UYBSABKAsyIi5hZ2VudC52MS5FeGVjQ2xpZW50Q29udHJvbE1lc3NhZ2VIABI2ChFrdl9jbGllbnRfbWVzc2FnZRgDIAEoCzIZLmFnZW50LnYxLkt2Q2xpZW50TWVzc2FnZUgAEjsKE2NvbnZlcnNhdGlvbl9hY3Rpb24YBCABKAsyHC5hZ2VudC52MS5Db252ZXJzYXRpb25BY3Rpb25IABI9ChRpbnRlcmFjdGlvbl9yZXNwb25zZRgGIAEoCzIdLmFnZW50LnYxLkludGVyYWN0aW9uUmVzcG9uc2VIABI1ChBjbGllbnRfaGVhcnRiZWF0GAcgASgLMhkuYWdlbnQudjEuQ2xpZW50SGVhcnRiZWF0SAASMwoPcHJld2FybV9yZXF1ZXN0GAggASgLMhguYWdlbnQudjEuUHJld2FybVJlcXVlc3RIAEIJCgdtZXNzYWdlIqIDChJBZ2VudFNlcnZlck1lc3NhZ2USOQoSaW50ZXJhY3Rpb25fdXBkYXRlGAEgASgLMhsuYWdlbnQudjEuSW50ZXJhY3Rpb25VcGRhdGVIABI6ChNleGVjX3NlcnZlcl9tZXNzYWdlGAIgASgLMhsuYWdlbnQudjEuRXhlY1NlcnZlck1lc3NhZ2VIABJJChtleGVjX3NlcnZlcl9jb250cm9sX21lc3NhZ2UYBSABKAsyIi5hZ2VudC52MS5FeGVjU2VydmVyQ29udHJvbE1lc3NhZ2VIABJOCh5jb252ZXJzYXRpb25fY2hlY2twb2ludF91cGRhdGUYAyABKAsyJC5hZ2VudC52MS5Db252ZXJzYXRpb25TdGF0ZVN0cnVjdHVyZUgAEjYKEWt2X3NlcnZlcl9tZXNzYWdlGAQgASgLMhkuYWdlbnQudjEuS3ZTZXJ2ZXJNZXNzYWdlSAASNwoRaW50ZXJhY3Rpb25fcXVlcnkYByABKAsyGi5hZ2VudC52MS5JbnRlcmFjdGlvblF1ZXJ5SABCCQoHbWVzc2FnZSIoChBOYW1lQWdlbnRSZXF1ZXN0EhQKDHVzZXJfbWVzc2FnZRgBIAEoCSIhChFOYW1lQWdlbnRSZXNwb25zZRIMCgRuYW1lGAEgASgJIjIKFkdldFVzYWJsZU1vZGVsc1JlcXVlc3QSGAoQY3VzdG9tX21vZGVsX2lkcxgBIAMoCSJBChdHZXRVc2FibGVNb2RlbHNSZXNwb25zZRImCgZtb2RlbHMYASADKAsyFi5hZ2VudC52MS5Nb2RlbERldGFpbHMiHgocR2V0RGVmYXVsdE1vZGVsRm9yQ2xpUmVxdWVzdCJGCh1HZXREZWZhdWx0TW9kZWxGb3JDbGlSZXNwb25zZRIlCgVtb2RlbBgBIAEoCzIWLmFnZW50LnYxLk1vZGVsRGV0YWlscyIfCh1HZXRBbGxvd2VkTW9kZWxJbnRlbnRzUmVxdWVzdCI3Ch5HZXRBbGxvd2VkTW9kZWxJbnRlbnRzUmVzcG9uc2USFQoNbW9kZWxfaW50ZW50cxgBIAMoCSKXAgoTSWRlRWRpdG9yc1N0YXRlRmlsZRIVCg1yZWxhdGl2ZV9wYXRoGAEgASgJEhUKDWFic29sdXRlX3BhdGgYAiABKAkSIQoUaXNfY3VycmVudGx5X2ZvY3VzZWQYAyABKAhIAIgBARIgChNjdXJyZW50X2xpbmVfbnVtYmVyGAQgASgFSAGIAQESHgoRY3VycmVudF9saW5lX3RleHQYBSABKAlIAogBARIXCgpsaW5lX2NvdW50GAYgASgFSAOIAQFCFwoVX2lzX2N1cnJlbnRseV9mb2N1c2VkQhYKFF9jdXJyZW50X2xpbmVfbnVtYmVyQhQKEl9jdXJyZW50X2xpbmVfdGV4dEINCgtfbGluZV9jb3VudCJTChNJZGVFZGl0b3JzU3RhdGVMaXRlEjwKFXJlY2VudGx5X3ZpZXdlZF9maWxlcxgBIAMoCzIdLmFnZW50LnYxLklkZUVkaXRvcnNTdGF0ZUZpbGUidAoWQXBwbHlBZ2VudERpZmZUb29sQ2FsbBIqCgRhcmdzGAEgASgLMhwuYWdlbnQudjEuQXBwbHlBZ2VudERpZmZBcmdzEi4KBnJlc3VsdBgCIAEoCzIeLmFnZW50LnYxLkFwcGx5QWdlbnREaWZmUmVzdWx0IiYKEkFwcGx5QWdlbnREaWZmQXJncxIQCghhZ2VudF9pZBgBIAEoCSKEAQoUQXBwbHlBZ2VudERpZmZSZXN1bHQSMgoHc3VjY2VzcxgBIAEoCzIfLmFnZW50LnYxLkFwcGx5QWdlbnREaWZmU3VjY2Vzc0gAEi4KBWVycm9yGAIgASgLMh0uYWdlbnQudjEuQXBwbHlBZ2VudERpZmZFcnJvckgAQggKBnJlc3VsdCJOChVBcHBseUFnZW50RGlmZlN1Y2Nlc3MSNQoPYXBwbGllZF9jaGFuZ2VzGAEgAygLMhwuYWdlbnQudjEuQXBwbGllZEFnZW50Q2hhbmdlIukBChJBcHBsaWVkQWdlbnRDaGFuZ2USDAoEcGF0aBgBIAEoCRITCgtjaGFuZ2VfdHlwZRgCIAEoBRIbCg5iZWZvcmVfY29udGVudBgDIAEoCUgAiAEBEhoKDWFmdGVyX2NvbnRlbnQYBCABKAlIAYgBARISCgVlcnJvchgFIAEoCUgCiAEBEh4KEW1lc3NhZ2VfZm9yX21vZGVsGAYgASgJSAOIAQFCEQoPX2JlZm9yZV9jb250ZW50QhAKDl9hZnRlcl9jb250ZW50QggKBl9lcnJvckIUChJfbWVzc2FnZV9mb3JfbW9kZWwiWwoTQXBwbHlBZ2VudERpZmZFcnJvchINCgVlcnJvchgBIAEoCRI1Cg9hcHBsaWVkX2NoYW5nZXMYAiADKAsyHC5hZ2VudC52MS5BcHBsaWVkQWdlbnRDaGFuZ2UiawoTQXNrUXVlc3Rpb25Ub29sQ2FsbBInCgRhcmdzGAEgASgLMhkuYWdlbnQudjEuQXNrUXVlc3Rpb25BcmdzEisKBnJlc3VsdBgCIAEoCzIbLmFnZW50LnYxLkFza1F1ZXN0aW9uUmVzdWx0Io8BCg9Bc2tRdWVzdGlvbkFyZ3MSDQoFdGl0bGUYASABKAkSNQoJcXVlc3Rpb25zGAIgAygLMiIuYWdlbnQudjEuQXNrUXVlc3Rpb25BcmdzX1F1ZXN0aW9uEhEKCXJ1bl9hc3luYxgFIAEoCBIjChthc3luY19vcmlnaW5hbF90b29sX2NhbGxfaWQYBiABKAkigQEKGEFza1F1ZXN0aW9uQXJnc19RdWVzdGlvbhIKCgJpZBgBIAEoCRIOCgZwcm9tcHQYAiABKAkSMQoHb3B0aW9ucxgDIAMoCzIgLmFnZW50LnYxLkFza1F1ZXN0aW9uQXJnc19PcHRpb24SFgoOYWxsb3dfbXVsdGlwbGUYBCABKAgiMwoWQXNrUXVlc3Rpb25BcmdzX09wdGlvbhIKCgJpZBgBIAEoCRINCgVsYWJlbBgCIAEoCSISChBBc2tRdWVzdGlvbkFzeW5jItsBChFBc2tRdWVzdGlvblJlc3VsdBIvCgdzdWNjZXNzGAEgASgLMhwuYWdlbnQudjEuQXNrUXVlc3Rpb25TdWNjZXNzSAASKwoFZXJyb3IYAiABKAsyGi5hZ2VudC52MS5Bc2tRdWVzdGlvbkVycm9ySAASMQoIcmVqZWN0ZWQYAyABKAsyHS5hZ2VudC52MS5Bc2tRdWVzdGlvblJlamVjdGVkSAASKwoFYXN5bmMYBCABKAsyGi5hZ2VudC52MS5Bc2tRdWVzdGlvbkFzeW5jSABCCAoGcmVzdWx0IkoKEkFza1F1ZXN0aW9uU3VjY2VzcxI0CgdhbnN3ZXJzGAEgAygLMiMuYWdlbnQudjEuQXNrUXVlc3Rpb25TdWNjZXNzX0Fuc3dlciJNChlBc2tRdWVzdGlvblN1Y2Nlc3NfQW5zd2VyEhMKC3F1ZXN0aW9uX2lkGAEgASgJEhsKE3NlbGVjdGVkX29wdGlvbl9pZHMYAiADKAkiKQoQQXNrUXVlc3Rpb25FcnJvchIVCg1lcnJvcl9tZXNzYWdlGAEgASgJIiUKE0Fza1F1ZXN0aW9uUmVqZWN0ZWQSDgoGcmVhc29uGAEgASgJIv0FChhCYWNrZ3JvdW5kU2hlbGxTcGF3bkFyZ3MSDwoHY29tbWFuZBgBIAEoCRIZChF3b3JraW5nX2RpcmVjdG9yeRgCIAEoCRIUCgx0b29sX2NhbGxfaWQYAyABKAkSOwoOcGFyc2luZ19yZXN1bHQYBCABKAsyIy5hZ2VudC52MS5TaGVsbENvbW1hbmRQYXJzaW5nUmVzdWx0EjQKDnNhbmRib3hfcG9saWN5GAUgASgLMhcuYWdlbnQudjEuU2FuZGJveFBvbGljeUgAiAEBEiUKHWVuYWJsZV93cml0ZV9zaGVsbF9zdGRpbl90b29sGAYgASgIEhgKC2Rlc2NyaXB0aW9uGAcgASgJSAGIAQESQQoRY2xhc3NpZmllcl9yZXN1bHQYCCABKAsyIS5hZ2VudC52MS5Db21tYW5kQ2xhc3NpZmllclJlc3VsdEgCiAEBEkkKE291dHB1dF9ub3RpZmljYXRpb24YCSABKAsyJy5hZ2VudC52MS5TaGVsbE91dHB1dE5vdGlmaWNhdGlvbkNvbmZpZ0gDiAEBEj0KE3NtYXJ0X21vZGVfYXBwcm92YWwYCiABKAsyGy5hZ2VudC52MS5TbWFydE1vZGVBcHByb3ZhbEgEiAEBEk4KGWhvb2tfYXBwcm92YWxfcmVxdWlyZW1lbnQYCyABKAsyJi5hZ2VudC52MS5TaGVsbEhvb2tBcHByb3ZhbFJlcXVpcmVtZW50SAWIAQESFQoNc2tpcF9hcHByb3ZhbBgMIAEoCBIcCg9jb252ZXJzYXRpb25faWQYDSABKAlIBogBAUIRCg9fc2FuZGJveF9wb2xpY3lCDgoMX2Rlc2NyaXB0aW9uQhQKEl9jbGFzc2lmaWVyX3Jlc3VsdEIWChRfb3V0cHV0X25vdGlmaWNhdGlvbkIWChRfc21hcnRfbW9kZV9hcHByb3ZhbEIcChpfaG9va19hcHByb3ZhbF9yZXF1aXJlbWVudEISChBfY29udmVyc2F0aW9uX2lkIoECChpCYWNrZ3JvdW5kU2hlbGxTcGF3blJlc3VsdBI4CgdzdWNjZXNzGAEgASgLMiUuYWdlbnQudjEuQmFja2dyb3VuZFNoZWxsU3Bhd25TdWNjZXNzSAASNAoFZXJyb3IYAiABKAsyIy5hZ2VudC52MS5CYWNrZ3JvdW5kU2hlbGxTcGF3bkVycm9ySAASKwoIcmVqZWN0ZWQYAyABKAsyFy5hZ2VudC52MS5TaGVsbFJlamVjdGVkSAASPAoRcGVybWlzc2lvbl9kZW5pZWQYBCABKAsyHy5hZ2VudC52MS5TaGVsbFBlcm1pc3Npb25EZW5pZWRIAEIICgZyZXN1bHQidQobQmFja2dyb3VuZFNoZWxsU3Bhd25TdWNjZXNzEhAKCHNoZWxsX2lkGAEgASgNEg8KB2NvbW1hbmQYAiABKAkSGQoRd29ya2luZ19kaXJlY3RvcnkYAyABKAkSEAoDcGlkGAQgASgNSACIAQFCBgoEX3BpZCJWChlCYWNrZ3JvdW5kU2hlbGxTcGF3bkVycm9yEg8KB2NvbW1hbmQYASABKAkSGQoRd29ya2luZ19kaXJlY3RvcnkYAiABKAkSDQoFZXJyb3IYAyABKAkiNgoTV3JpdGVTaGVsbFN0ZGluQXJncxIQCghzaGVsbF9pZBgBIAEoDRINCgVjaGFycxgCIAEoCSKHAQoVV3JpdGVTaGVsbFN0ZGluUmVzdWx0EjMKB3N1Y2Nlc3MYASABKAsyIC5hZ2VudC52MS5Xcml0ZVNoZWxsU3RkaW5TdWNjZXNzSAASLwoFZXJyb3IYAiABKAsyHi5hZ2VudC52MS5Xcml0ZVNoZWxsU3RkaW5FcnJvckgAQggKBnJlc3VsdCJdChZXcml0ZVNoZWxsU3RkaW5TdWNjZXNzEhAKCHNoZWxsX2lkGAEgASgNEjEKKXRlcm1pbmFsX2ZpbGVfbGVuZ3RoX2JlZm9yZV9pbnB1dF93cml0dGVuGAIgASgNIiUKFFdyaXRlU2hlbGxTdGRpbkVycm9yEg0KBWVycm9yGAEgASgJIiIKCkNvb3JkaW5hdGUSCQoBeBgBIAEoBRIJCgF5GAIgASgFIlUKD0NvbXB1dGVyVXNlQXJncxIUCgx0b29sX2NhbGxfaWQYASABKAkSLAoHYWN0aW9ucxgCIAMoCzIbLmFnZW50LnYxLkNvbXB1dGVyVXNlQWN0aW9uIoEEChFDb21wdXRlclVzZUFjdGlvbhIvCgptb3VzZV9tb3ZlGAEgASgLMhkuYWdlbnQudjEuTW91c2VNb3ZlQWN0aW9uSAASJgoFY2xpY2sYAiABKAsyFS5hZ2VudC52MS5DbGlja0FjdGlvbkgAEi8KCm1vdXNlX2Rvd24YAyABKAsyGS5hZ2VudC52MS5Nb3VzZURvd25BY3Rpb25IABIrCghtb3VzZV91cBgEIAEoCzIXLmFnZW50LnYxLk1vdXNlVXBBY3Rpb25IABIkCgRkcmFnGAUgASgLMhQuYWdlbnQudjEuRHJhZ0FjdGlvbkgAEigKBnNjcm9sbBgGIAEoCzIWLmFnZW50LnYxLlNjcm9sbEFjdGlvbkgAEiQKBHR5cGUYByABKAsyFC5hZ2VudC52MS5UeXBlQWN0aW9uSAASIgoDa2V5GAggASgLMhMuYWdlbnQudjEuS2V5QWN0aW9uSAASJAoEd2FpdBgJIAEoCzIULmFnZW50LnYxLldhaXRBY3Rpb25IABIwCgpzY3JlZW5zaG90GAogASgLMhouYWdlbnQudjEuU2NyZWVuc2hvdEFjdGlvbkgAEjkKD2N1cnNvcl9wb3NpdGlvbhgLIAEoCzIeLmFnZW50LnYxLkN1cnNvclBvc2l0aW9uQWN0aW9uSABCCAoGYWN0aW9uIjsKD01vdXNlTW92ZUFjdGlvbhIoCgpjb29yZGluYXRlGAEgASgLMhQuYWdlbnQudjEuQ29vcmRpbmF0ZSKYAQoLQ2xpY2tBY3Rpb24SLQoKY29vcmRpbmF0ZRgBIAEoCzIULmFnZW50LnYxLkNvb3JkaW5hdGVIAIgBARIOCgZidXR0b24YAiABKAUSDQoFY291bnQYAyABKAUSGgoNbW9kaWZpZXJfa2V5cxgEIAEoCUgBiAEBQg0KC19jb29yZGluYXRlQhAKDl9tb2RpZmllcl9rZXlzIiEKD01vdXNlRG93bkFjdGlvbhIOCgZidXR0b24YASABKAUiHwoNTW91c2VVcEFjdGlvbhIOCgZidXR0b24YASABKAUiQAoKRHJhZ0FjdGlvbhIiCgRwYXRoGAEgAygLMhQuYWdlbnQudjEuQ29vcmRpbmF0ZRIOCgZidXR0b24YAiABKAUinQEKDFNjcm9sbEFjdGlvbhItCgpjb29yZGluYXRlGAEgASgLMhQuYWdlbnQudjEuQ29vcmRpbmF0ZUgAiAEBEhEKCWRpcmVjdGlvbhgCIAEoBRIOCgZhbW91bnQYAyABKAUSGgoNbW9kaWZpZXJfa2V5cxgEIAEoCUgBiAEBQg0KC19jb29yZGluYXRlQhAKDl9tb2RpZmllcl9rZXlzIhoKClR5cGVBY3Rpb24SDAoEdGV4dBgBIAEoCSJMCglLZXlBY3Rpb24SCwoDa2V5GAEgASgJEh0KEGhvbGRfZHVyYXRpb25fbXMYAiABKAVIAIgBAUITChFfaG9sZF9kdXJhdGlvbl9tcyIhCgpXYWl0QWN0aW9uEhMKC2R1cmF0aW9uX21zGAEgASgFIhIKEFNjcmVlbnNob3RBY3Rpb24iFgoUQ3Vyc29yUG9zaXRpb25BY3Rpb24iewoRQ29tcHV0ZXJVc2VSZXN1bHQSLwoHc3VjY2VzcxgBIAEoCzIcLmFnZW50LnYxLkNvbXB1dGVyVXNlU3VjY2Vzc0gAEisKBWVycm9yGAIgASgLMhouYWdlbnQudjEuQ29tcHV0ZXJVc2VFcnJvckgAQggKBnJlc3VsdCL7AQoSQ29tcHV0ZXJVc2VTdWNjZXNzEhQKDGFjdGlvbl9jb3VudBgBIAEoBRITCgtkdXJhdGlvbl9tcxgCIAEoBRIXCgpzY3JlZW5zaG90GAMgASgJSACIAQESEAoDbG9nGAQgASgJSAGIAQESHAoPc2NyZWVuc2hvdF9wYXRoGAUgASgJSAKIAQESMgoPY3Vyc29yX3Bvc2l0aW9uGAYgASgLMhQuYWdlbnQudjEuQ29vcmRpbmF0ZUgDiAEBQg0KC19zY3JlZW5zaG90QgYKBF9sb2dCEgoQX3NjcmVlbnNob3RfcGF0aEISChBfY3Vyc29yX3Bvc2l0aW9uIsABChBDb21wdXRlclVzZUVycm9yEg0KBWVycm9yGAEgASgJEhQKDGFjdGlvbl9jb3VudBgCIAEoBRITCgtkdXJhdGlvbl9tcxgDIAEoBRIQCgNsb2cYBCABKAlIAIgBARIXCgpzY3JlZW5zaG90GAUgASgJSAGIAQESHAoPc2NyZWVuc2hvdF9wYXRoGAYgASgJSAKIAQFCBgoEX2xvZ0INCgtfc2NyZWVuc2hvdEISChBfc2NyZWVuc2hvdF9wYXRoImsKE0NvbXB1dGVyVXNlVG9vbENhbGwSJwoEYXJncxgBIAEoCzIZLmFnZW50LnYxLkNvbXB1dGVyVXNlQXJncxIrCgZyZXN1bHQYAiABKAsyGy5hZ2VudC52MS5Db21wdXRlclVzZVJlc3VsdCJoChJDcmVhdGVQbGFuVG9vbENhbGwSJgoEYXJncxgBIAEoCzIYLmFnZW50LnYxLkNyZWF0ZVBsYW5BcmdzEioKBnJlc3VsdBgCIAEoCzIaLmFnZW50LnYxLkNyZWF0ZVBsYW5SZXN1bHQiOAoFUGhhc2USDAoEbmFtZRgBIAEoCRIhCgV0b2RvcxgCIAMoCzISLmFnZW50LnYxLlRvZG9JdGVtIpYBCg5DcmVhdGVQbGFuQXJncxIMCgRwbGFuGAEgASgJEiEKBXRvZG9zGAIgAygLMhIuYWdlbnQudjEuVG9kb0l0ZW0SEAoIb3ZlcnZpZXcYAyABKAkSDAoEbmFtZRgEIAEoCRISCgppc19wcm9qZWN0GAUgASgIEh8KBnBoYXNlcxgGIAMoCzIPLmFnZW50LnYxLlBoYXNlIooBChBDcmVhdGVQbGFuUmVzdWx0EhAKCHBsYW5fdXJpGAMgASgJEi4KB3N1Y2Nlc3MYASABKAsyGy5hZ2VudC52MS5DcmVhdGVQbGFuU3VjY2Vzc0gAEioKBWVycm9yGAIgASgLMhkuYWdlbnQudjEuQ3JlYXRlUGxhbkVycm9ySABCCAoGcmVzdWx0IhMKEUNyZWF0ZVBsYW5TdWNjZXNzIiAKD0NyZWF0ZVBsYW5FcnJvchINCgVlcnJvchgBIAEoCSJWChZDcmVhdGVQbGFuUmVxdWVzdFF1ZXJ5EiYKBGFyZ3MYASABKAsyGC5hZ2VudC52MS5DcmVhdGVQbGFuQXJncxIUCgx0b29sX2NhbGxfaWQYAiABKAkiRwoZQ3JlYXRlUGxhblJlcXVlc3RSZXNwb25zZRIqCgZyZXN1bHQYASABKAsyGi5hZ2VudC52MS5DcmVhdGVQbGFuUmVzdWx0IhYKFEN1cnNvclJ1bGVUeXBlR2xvYmFsIigKF0N1cnNvclJ1bGVUeXBlRmlsZUdsb2JzEg0KBWdsb2JzGAEgAygJIjEKGkN1cnNvclJ1bGVUeXBlQWdlbnRGZXRjaGVkEhMKC2Rlc2NyaXB0aW9uGAEgASgJIiAKHkN1cnNvclJ1bGVUeXBlTWFudWFsbHlBdHRhY2hlZCKLAgoOQ3Vyc29yUnVsZVR5cGUSMAoGZ2xvYmFsGAEgASgLMh4uYWdlbnQudjEuQ3Vyc29yUnVsZVR5cGVHbG9iYWxIABI5CgxmaWxlX2dsb2JiZWQYAiABKAsyIS5hZ2VudC52MS5DdXJzb3JSdWxlVHlwZUZpbGVHbG9ic0gAEj0KDWFnZW50X2ZldGNoZWQYAyABKAsyJC5hZ2VudC52MS5DdXJzb3JSdWxlVHlwZUFnZW50RmV0Y2hlZEgAEkUKEW1hbnVhbGx5X2F0dGFjaGVkGAQgASgLMiguYWdlbnQudjEuQ3Vyc29yUnVsZVR5cGVNYW51YWxseUF0dGFjaGVkSABCBgoEdHlwZSLIAQoKQ3Vyc29yUnVsZRIRCglmdWxsX3BhdGgYASABKAkSDwoHY29udGVudBgCIAEoCRImCgR0eXBlGAMgASgLMhguYWdlbnQudjEuQ3Vyc29yUnVsZVR5cGUSDgoGc291cmNlGAQgASgFEh4KEWdpdF9yZW1vdGVfb3JpZ2luGAUgASgJSACIAQESGAoLcGFyc2VfZXJyb3IYBiABKAlIAYgBAUIUChJfZ2l0X3JlbW90ZV9vcmlnaW5CDgoMX3BhcnNlX2Vycm9yIjAKCkRlbGV0ZUFyZ3MSDAoEcGF0aBgBIAEoCRIUCgx0b29sX2NhbGxfaWQYAiABKAki7QIKDERlbGV0ZVJlc3VsdBIqCgdzdWNjZXNzGAEgASgLMhcuYWdlbnQudjEuRGVsZXRlU3VjY2Vzc0gAEjYKDmZpbGVfbm90X2ZvdW5kGAIgASgLMhwuYWdlbnQudjEuRGVsZXRlRmlsZU5vdEZvdW5kSAASKwoIbm90X2ZpbGUYAyABKAsyFy5hZ2VudC52MS5EZWxldGVOb3RGaWxlSAASPQoRcGVybWlzc2lvbl9kZW5pZWQYBCABKAsyIC5hZ2VudC52MS5EZWxldGVQZXJtaXNzaW9uRGVuaWVkSAASLQoJZmlsZV9idXN5GAUgASgLMhguYWdlbnQudjEuRGVsZXRlRmlsZUJ1c3lIABIsCghyZWplY3RlZBgGIAEoCzIYLmFnZW50LnYxLkRlbGV0ZVJlamVjdGVkSAASJgoFZXJyb3IYByABKAsyFS5hZ2VudC52MS5EZWxldGVFcnJvckgAQggKBnJlc3VsdCJcCg1EZWxldGVTdWNjZXNzEgwKBHBhdGgYASABKAkSFAoMZGVsZXRlZF9maWxlGAIgASgJEhEKCWZpbGVfc2l6ZRgDIAEoAxIUCgxwcmV2X2NvbnRlbnQYBCABKAkiIgoSRGVsZXRlRmlsZU5vdEZvdW5kEgwKBHBhdGgYASABKAkiMgoNRGVsZXRlTm90RmlsZRIMCgRwYXRoGAEgASgJEhMKC2FjdHVhbF90eXBlGAIgASgJIlkKFkRlbGV0ZVBlcm1pc3Npb25EZW5pZWQSDAoEcGF0aBgBIAEoCRIcChRjbGllbnRfdmlzaWJsZV9lcnJvchgCIAEoCRITCgtpc19yZWFkb25seRgDIAEoCCIeCg5EZWxldGVGaWxlQnVzeRIMCgRwYXRoGAEgASgJIi4KDkRlbGV0ZVJlamVjdGVkEgwKBHBhdGgYASABKAkSDgoGcmVhc29uGAIgASgJIioKC0RlbGV0ZUVycm9yEgwKBHBhdGgYASABKAkSDQoFZXJyb3IYAiABKAkiXAoORGVsZXRlVG9vbENhbGwSIgoEYXJncxgBIAEoCzIULmFnZW50LnYxLkRlbGV0ZUFyZ3MSJgoGcmVzdWx0GAIgASgLMhYuYWdlbnQudjEuRGVsZXRlUmVzdWx0IjUKD0RpYWdub3N0aWNzQXJncxIMCgRwYXRoGAEgASgJEhQKDHRvb2xfY2FsbF9pZBgCIAEoCSKvAgoRRGlhZ25vc3RpY3NSZXN1bHQSLwoHc3VjY2VzcxgBIAEoCzIcLmFnZW50LnYxLkRpYWdub3N0aWNzU3VjY2Vzc0gAEisKBWVycm9yGAIgASgLMhouYWdlbnQudjEuRGlhZ25vc3RpY3NFcnJvckgAEjEKCHJlamVjdGVkGAMgASgLMh0uYWdlbnQudjEuRGlhZ25vc3RpY3NSZWplY3RlZEgAEjsKDmZpbGVfbm90X2ZvdW5kGAQgASgLMiEuYWdlbnQudjEuRGlhZ25vc3RpY3NGaWxlTm90Rm91bmRIABJCChFwZXJtaXNzaW9uX2RlbmllZBgFIAEoCzIlLmFnZW50LnYxLkRpYWdub3N0aWNzUGVybWlzc2lvbkRlbmllZEgAQggKBnJlc3VsdCJoChJEaWFnbm9zdGljc1N1Y2Nlc3MSDAoEcGF0aBgBIAEoCRIpCgtkaWFnbm9zdGljcxgCIAMoCzIULmFnZW50LnYxLkRpYWdub3N0aWMSGQoRdG90YWxfZGlhZ25vc3RpY3MYAyABKAUifwoKRGlhZ25vc3RpYxIQCghzZXZlcml0eRgBIAEoBRIeCgVyYW5nZRgCIAEoCzIPLmFnZW50LnYxLlJhbmdlEg8KB21lc3NhZ2UYAyABKAkSDgoGc291cmNlGAQgASgJEgwKBGNvZGUYBSABKAkSEAoIaXNfc3RhbGUYBiABKAgiLwoQRGlhZ25vc3RpY3NFcnJvchIMCgRwYXRoGAEgASgJEg0KBWVycm9yGAIgASgJIjMKE0RpYWdub3N0aWNzUmVqZWN0ZWQSDAoEcGF0aBgBIAEoCRIOCgZyZWFzb24YAiABKAkiJwoXRGlhZ25vc3RpY3NGaWxlTm90Rm91bmQSDAoEcGF0aBgBIAEoCSIrChtEaWFnbm9zdGljc1Blcm1pc3Npb25EZW5pZWQSDAoEcGF0aBgBIAEoCSJICghFZGl0QXJncxIMCgRwYXRoGAEgASgJEhsKDnN0cmVhbV9jb250ZW50GAYgASgJSACIAQFCEQoPX3N0cmVhbV9jb250ZW50ItYCCgpFZGl0UmVzdWx0EigKB3N1Y2Nlc3MYASABKAsyFS5hZ2VudC52MS5FZGl0U3VjY2Vzc0gAEjQKDmZpbGVfbm90X2ZvdW5kGAIgASgLMhouYWdlbnQudjEuRWRpdEZpbGVOb3RGb3VuZEgAEkQKFnJlYWRfcGVybWlzc2lvbl9kZW5pZWQYAyABKAsyIi5hZ2VudC52MS5FZGl0UmVhZFBlcm1pc3Npb25EZW5pZWRIABJGChd3cml0ZV9wZXJtaXNzaW9uX2RlbmllZBgEIAEoCzIjLmFnZW50LnYxLkVkaXRXcml0ZVBlcm1pc3Npb25EZW5pZWRIABIqCghyZWplY3RlZBgGIAEoCzIWLmFnZW50LnYxLkVkaXRSZWplY3RlZEgAEiQKBWVycm9yGAcgASgLMhMuYWdlbnQudjEuRWRpdEVycm9ySABCCAoGcmVzdWx0IqQCCgtFZGl0U3VjY2VzcxIMCgRwYXRoGAEgASgJEhgKC2xpbmVzX2FkZGVkGAMgASgFSACIAQESGgoNbGluZXNfcmVtb3ZlZBgEIAEoBUgBiAEBEhgKC2RpZmZfc3RyaW5nGAUgASgJSAKIAQESJQoYYmVmb3JlX2Z1bGxfZmlsZV9jb250ZW50GAYgASgJSAOIAQESHwoXYWZ0ZXJfZnVsbF9maWxlX2NvbnRlbnQYByABKAkSFAoHbWVzc2FnZRgIIAEoCUgEiAEBQg4KDF9saW5lc19hZGRlZEIQCg5fbGluZXNfcmVtb3ZlZEIOCgxfZGlmZl9zdHJpbmdCGwoZX2JlZm9yZV9mdWxsX2ZpbGVfY29udGVudEIKCghfbWVzc2FnZSIgChBFZGl0RmlsZU5vdEZvdW5kEgwKBHBhdGgYASABKAkiKAoYRWRpdFJlYWRQZXJtaXNzaW9uRGVuaWVkEgwKBHBhdGgYASABKAkiTQoZRWRpdFdyaXRlUGVybWlzc2lvbkRlbmllZBIMCgRwYXRoGAEgASgJEg0KBWVycm9yGAIgASgJEhMKC2lzX3JlYWRvbmx5GAMgASgIIiwKDEVkaXRSZWplY3RlZBIMCgRwYXRoGAEgASgJEg4KBnJlYXNvbhgCIAEoCSJiCglFZGl0RXJyb3ISDAoEcGF0aBgBIAEoCRINCgVlcnJvchgCIAEoCRIgChNtb2RlbF92aXNpYmxlX2Vycm9yGAUgASgJSACIAQFCFgoUX21vZGVsX3Zpc2libGVfZXJyb3IiVgoMRWRpdFRvb2xDYWxsEiAKBGFyZ3MYASABKAsyEi5hZ2VudC52MS5FZGl0QXJncxIkCgZyZXN1bHQYAiABKAsyFC5hZ2VudC52MS5FZGl0UmVzdWx0IjEKEUVkaXRUb29sQ2FsbERlbHRhEhwKFHN0cmVhbV9jb250ZW50X2RlbHRhGAEgASgJIjEKDEV4YUZldGNoQXJncxILCgNpZHMYASADKAkSFAoMdG9vbF9jYWxsX2lkGAIgASgJIqIBCg5FeGFGZXRjaFJlc3VsdBIsCgdzdWNjZXNzGAEgASgLMhkuYWdlbnQudjEuRXhhRmV0Y2hTdWNjZXNzSAASKAoFZXJyb3IYAiABKAsyFy5hZ2VudC52MS5FeGFGZXRjaEVycm9ySAASLgoIcmVqZWN0ZWQYAyABKAsyGi5hZ2VudC52MS5FeGFGZXRjaFJlamVjdGVkSABCCAoGcmVzdWx0Ij4KD0V4YUZldGNoU3VjY2VzcxIrCghjb250ZW50cxgBIAMoCzIZLmFnZW50LnYxLkV4YUZldGNoQ29udGVudCIeCg1FeGFGZXRjaEVycm9yEg0KBWVycm9yGAEgASgJIiIKEEV4YUZldGNoUmVqZWN0ZWQSDgoGcmVhc29uGAEgASgJIlMKD0V4YUZldGNoQ29udGVudBINCgV0aXRsZRgBIAEoCRILCgN1cmwYAiABKAkSDAoEdGV4dBgDIAEoCRIWCg5wdWJsaXNoZWRfZGF0ZRgEIAEoCSJiChBFeGFGZXRjaFRvb2xDYWxsEiQKBGFyZ3MYASABKAsyFi5hZ2VudC52MS5FeGFGZXRjaEFyZ3MSKAoGcmVzdWx0GAIgASgLMhguYWdlbnQudjEuRXhhRmV0Y2hSZXN1bHQiPAoURXhhRmV0Y2hSZXF1ZXN0UXVlcnkSJAoEYXJncxgBIAEoCzIWLmFnZW50LnYxLkV4YUZldGNoQXJncyKjAQoXRXhhRmV0Y2hSZXF1ZXN0UmVzcG9uc2USPgoIYXBwcm92ZWQYASABKAsyKi5hZ2VudC52MS5FeGFGZXRjaFJlcXVlc3RSZXNwb25zZV9BcHByb3ZlZEgAEj4KCHJlamVjdGVkGAIgASgLMiouYWdlbnQudjEuRXhhRmV0Y2hSZXF1ZXN0UmVzcG9uc2VfUmVqZWN0ZWRIAEIICgZyZXN1bHQiIgogRXhhRmV0Y2hSZXF1ZXN0UmVzcG9uc2VfQXBwcm92ZWQiMgogRXhhRmV0Y2hSZXF1ZXN0UmVzcG9uc2VfUmVqZWN0ZWQSDgoGcmVhc29uGAEgASgJIlcKDUV4YVNlYXJjaEFyZ3MSDQoFcXVlcnkYASABKAkSDAoEdHlwZRgCIAEoCRITCgtudW1fcmVzdWx0cxgDIAEoBRIUCgx0b29sX2NhbGxfaWQYBCABKAkipgEKD0V4YVNlYXJjaFJlc3VsdBItCgdzdWNjZXNzGAEgASgLMhouYWdlbnQudjEuRXhhU2VhcmNoU3VjY2Vzc0gAEikKBWVycm9yGAIgASgLMhguYWdlbnQudjEuRXhhU2VhcmNoRXJyb3JIABIvCghyZWplY3RlZBgDIAEoCzIbLmFnZW50LnYxLkV4YVNlYXJjaFJlamVjdGVkSABCCAoGcmVzdWx0IkQKEEV4YVNlYXJjaFN1Y2Nlc3MSMAoKcmVmZXJlbmNlcxgBIAMoCzIcLmFnZW50LnYxLkV4YVNlYXJjaFJlZmVyZW5jZSIfCg5FeGFTZWFyY2hFcnJvchINCgVlcnJvchgBIAEoCSIjChFFeGFTZWFyY2hSZWplY3RlZBIOCgZyZWFzb24YASABKAkiVgoSRXhhU2VhcmNoUmVmZXJlbmNlEg0KBXRpdGxlGAEgASgJEgsKA3VybBgCIAEoCRIMCgR0ZXh0GAMgASgJEhYKDnB1Ymxpc2hlZF9kYXRlGAQgASgJImUKEUV4YVNlYXJjaFRvb2xDYWxsEiUKBGFyZ3MYASABKAsyFy5hZ2VudC52MS5FeGFTZWFyY2hBcmdzEikKBnJlc3VsdBgCIAEoCzIZLmFnZW50LnYxLkV4YVNlYXJjaFJlc3VsdCI+ChVFeGFTZWFyY2hSZXF1ZXN0UXVlcnkSJQoEYXJncxgBIAEoCzIXLmFnZW50LnYxLkV4YVNlYXJjaEFyZ3MipgEKGEV4YVNlYXJjaFJlcXVlc3RSZXNwb25zZRI/CghhcHByb3ZlZBgBIAEoCzIrLmFnZW50LnYxLkV4YVNlYXJjaFJlcXVlc3RSZXNwb25zZV9BcHByb3ZlZEgAEj8KCHJlamVjdGVkGAIgASgLMisuYWdlbnQudjEuRXhhU2VhcmNoUmVxdWVzdFJlc3BvbnNlX1JlamVjdGVkSABCCAoGcmVzdWx0IiMKIUV4YVNlYXJjaFJlcXVlc3RSZXNwb25zZV9BcHByb3ZlZCIzCiFFeGFTZWFyY2hSZXF1ZXN0UmVzcG9uc2VfUmVqZWN0ZWQSDgoGcmVhc29uGAEgASgJIiMKFUV4ZWNDbGllbnRTdHJlYW1DbG9zZRIKCgJpZBgBIAEoDSJ+Cg9FeGVjQ2xpZW50VGhyb3cSCgoCaWQYASABKA0SDQoFZXJyb3IYAiABKAkSGAoLc3RhY2tfdHJhY2UYAyABKAlIAIgBARIXCgplcnJvcl9jb2RlGAQgASgJSAGIAQFCDgoMX3N0YWNrX3RyYWNlQg0KC19lcnJvcl9jb2RlIiEKE0V4ZWNDbGllbnRIZWFydGJlYXQSCgoCaWQYASABKA0ivgEKGEV4ZWNDbGllbnRDb250cm9sTWVzc2FnZRI3CgxzdHJlYW1fY2xvc2UYASABKAsyHy5hZ2VudC52MS5FeGVjQ2xpZW50U3RyZWFtQ2xvc2VIABIqCgV0aHJvdxgCIAEoCzIZLmFnZW50LnYxLkV4ZWNDbGllbnRUaHJvd0gAEjIKCWhlYXJ0YmVhdBgDIAEoCzIdLmFnZW50LnYxLkV4ZWNDbGllbnRIZWFydGJlYXRIAEIJCgdtZXNzYWdlIoQBCgtTcGFuQ29udGV4dBIQCgh0cmFjZV9pZBgBIAEoCRIPCgdzcGFuX2lkGAIgASgJEhgKC3RyYWNlX2ZsYWdzGAMgASgNSACIAQESGAoLdHJhY2Vfc3RhdGUYBCABKAlIAYgBAUIOCgxfdHJhY2VfZmxhZ3NCDgoMX3RyYWNlX3N0YXRlIgsKCUFib3J0QXJncyINCgtBYm9ydFJlc3VsdCLaEwoRRXhlY1NlcnZlck1lc3NhZ2USCgoCaWQYASABKA0SDwoHZXhlY19pZBgPIAEoCRIwCgxzcGFuX2NvbnRleHQYEyABKAsyFS5hZ2VudC52MS5TcGFuQ29udGV4dEgBiAEBEikKCnNoZWxsX2FyZ3MYAiABKAsyEy5hZ2VudC52MS5TaGVsbEFyZ3NIABIpCgp3cml0ZV9hcmdzGAMgASgLMhMuYWdlbnQudjEuV3JpdGVBcmdzSAASKwoLZGVsZXRlX2FyZ3MYBCABKAsyFC5hZ2VudC52MS5EZWxldGVBcmdzSAASJwoJZ3JlcF9hcmdzGAUgASgLMhIuYWdlbnQudjEuR3JlcEFyZ3NIABInCglyZWFkX2FyZ3MYByABKAsyEi5hZ2VudC52MS5SZWFkQXJnc0gAEiMKB2xzX2FyZ3MYCCABKAsyEC5hZ2VudC52MS5Mc0FyZ3NIABI1ChBkaWFnbm9zdGljc19hcmdzGAkgASgLMhkuYWdlbnQudjEuRGlhZ25vc3RpY3NBcmdzSAASPAoUcmVxdWVzdF9jb250ZXh0X2FyZ3MYCiABKAsyHC5hZ2VudC52MS5SZXF1ZXN0Q29udGV4dEFyZ3NIABIlCghtY3BfYXJncxgLIAEoCzIRLmFnZW50LnYxLk1jcEFyZ3NIABIwChFzaGVsbF9zdHJlYW1fYXJncxgOIAEoCzITLmFnZW50LnYxLlNoZWxsQXJnc0gAEkkKG2JhY2tncm91bmRfc2hlbGxfc3Bhd25fYXJncxgQIAEoCzIiLmFnZW50LnYxLkJhY2tncm91bmRTaGVsbFNwYXduQXJnc0gAEkoKHGxpc3RfbWNwX3Jlc291cmNlc19leGVjX2FyZ3MYESABKAsyIi5hZ2VudC52MS5MaXN0TWNwUmVzb3VyY2VzRXhlY0FyZ3NIABJIChtyZWFkX21jcF9yZXNvdXJjZV9leGVjX2FyZ3MYEiABKAsyIS5hZ2VudC52MS5SZWFkTWNwUmVzb3VyY2VFeGVjQXJnc0gAEikKCmZldGNoX2FyZ3MYFCABKAsyEy5hZ2VudC52MS5GZXRjaEFyZ3NIABI4ChJyZWNvcmRfc2NyZWVuX2FyZ3MYFSABKAsyGi5hZ2VudC52MS5SZWNvcmRTY3JlZW5BcmdzSAASNgoRY29tcHV0ZXJfdXNlX2FyZ3MYFiABKAsyGS5hZ2VudC52MS5Db21wdXRlclVzZUFyZ3NIABI/ChZ3cml0ZV9zaGVsbF9zdGRpbl9hcmdzGBcgASgLMh0uYWdlbnQudjEuV3JpdGVTaGVsbFN0ZGluQXJnc0gAEjAKEnJlZGFjdGVkX3JlYWRfYXJncxgdIAEoCzISLmFnZW50LnYxLlJlYWRBcmdzSAASOQoTbWNwX3N0YXRlX2V4ZWNfYXJncxgkIAEoCzIaLmFnZW50LnYxLk1jcFN0YXRlRXhlY0FyZ3NIABI2ChFleGVjdXRlX2hvb2tfYXJncxgbIAEoCzIZLmFnZW50LnYxLkV4ZWN1dGVIb29rQXJnc0gAEi8KDXN1YmFnZW50X2FyZ3MYHCABKAsyFi5hZ2VudC52MS5TdWJhZ2VudEFyZ3NIABJJChtmb3JjZV9iYWNrZ3JvdW5kX3NoZWxsX2FyZ3MYHiABKAsyIi5hZ2VudC52MS5Gb3JjZUJhY2tncm91bmRTaGVsbEFyZ3NIABJPCh5mb3JjZV9iYWNrZ3JvdW5kX3N1YmFnZW50X2FyZ3MYHyABKAsyJS5hZ2VudC52MS5Gb3JjZUJhY2tncm91bmRTdWJhZ2VudEFyZ3NIABI6ChNzdWJhZ2VudF9hd2FpdF9hcmdzGCUgASgLMhsuYWdlbnQudjEuU3ViYWdlbnRBd2FpdEFyZ3NIABJHChpzbWFydF9tb2RlX2NsYXNzaWZpZXJfYXJncxgmIAEoCzIhLmFnZW50LnYxLlNtYXJ0TW9kZUNsYXNzaWZpZXJBcmdzSAASQgoXY2FudmFzX2RpYWdub3N0aWNzX2FyZ3MYKCABKAsyHy5hZ2VudC52MS5DYW52YXNEaWFnbm9zdGljc0FyZ3NIABJNCh1zaGVsbF9hbGxvd2xpc3RfcHJlY2hlY2tfYXJncxgpIAEoCzIkLmFnZW50LnYxLlNoZWxsQWxsb3dsaXN0UHJlY2hlY2tBcmdzSAASSQobbWNwX2FsbG93bGlzdF9wcmVjaGVja19hcmdzGCogASgLMiIuYWdlbnQudjEuTWNwQWxsb3dsaXN0UHJlY2hlY2tBcmdzSAASVAohd2ViX2ZldGNoX2FsbG93bGlzdF9wcmVjaGVja19hcmdzGCsgASgLMicuYWdlbnQudjEuV2ViRmV0Y2hBbGxvd2xpc3RQcmVjaGVja0FyZ3NIABI0ChBnaXRfZGlmZl9yZXF1ZXN0GCwgASgLMhguYWdlbnQudjEuR2V0RGlmZlJlcXVlc3RIABIwCgxwaV9yZWFkX2FyZ3MYLSABKAsyGC5hZ2VudC52MS5QaVJlYWRFeGVjQXJnc0gAEjAKDHBpX2Jhc2hfYXJncxguIAEoCzIYLmFnZW50LnYxLlBpQmFzaEV4ZWNBcmdzSAASMAoMcGlfZWRpdF9hcmdzGC8gASgLMhguYWdlbnQudjEuUGlFZGl0RXhlY0FyZ3NIABIyCg1waV93cml0ZV9hcmdzGDAgASgLMhkuYWdlbnQudjEuUGlXcml0ZUV4ZWNBcmdzSAASMAoMcGlfZ3JlcF9hcmdzGDEgASgLMhguYWdlbnQudjEuUGlHcmVwRXhlY0FyZ3NIABIwCgxwaV9maW5kX2FyZ3MYMiABKAsyGC5hZ2VudC52MS5QaUZpbmRFeGVjQXJnc0gAEiwKCnBpX2xzX2FyZ3MYMyABKAsyFi5hZ2VudC52MS5QaUxzRXhlY0FyZ3NIABI3ChhtaW5pX3N3ZV9hZ2VudF9iYXNoX2FyZ3MYNCABKAsyEy5hZ2VudC52MS5TaGVsbEFyZ3NIABJEChhjb252ZXJzYXRpb25fc2VhcmNoX2FyZ3MYNSABKAsyIC5hZ2VudC52MS5Db252ZXJzYXRpb25TZWFyY2hBcmdzSAASRQoZYWdlbnRfc3RvcmVfY29uZmxpY3RfYXJncxg2IAEoCzIgLmFnZW50LnYxLkFnZW50U3RvcmVDb25mbGljdEFyZ3NIABIsCh9hY2NlcHRfaG9va19hZGRpdGlvbmFsX2NvbnRleHRzGDcgASgISAKIAQFCCQoHbWVzc2FnZUIPCg1fc3Bhbl9jb250ZXh0QiIKIF9hY2NlcHRfaG9va19hZGRpdGlvbmFsX2NvbnRleHRzIuEUChFFeGVjQ2xpZW50TWVzc2FnZRIKCgJpZBgBIAEoDRIPCgdleGVjX2lkGA8gASgJEi0KDHNoZWxsX3Jlc3VsdBgCIAEoCzIVLmFnZW50LnYxLlNoZWxsUmVzdWx0SAASLQoMd3JpdGVfcmVzdWx0GAMgASgLMhUuYWdlbnQudjEuV3JpdGVSZXN1bHRIABIvCg1kZWxldGVfcmVzdWx0GAQgASgLMhYuYWdlbnQudjEuRGVsZXRlUmVzdWx0SAASKwoLZ3JlcF9yZXN1bHQYBSABKAsyFC5hZ2VudC52MS5HcmVwUmVzdWx0SAASKwoLcmVhZF9yZXN1bHQYByABKAsyFC5hZ2VudC52MS5SZWFkUmVzdWx0SAASJwoJbHNfcmVzdWx0GAggASgLMhIuYWdlbnQudjEuTHNSZXN1bHRIABI5ChJkaWFnbm9zdGljc19yZXN1bHQYCSABKAsyGy5hZ2VudC52MS5EaWFnbm9zdGljc1Jlc3VsdEgAEkAKFnJlcXVlc3RfY29udGV4dF9yZXN1bHQYCiABKAsyHi5hZ2VudC52MS5SZXF1ZXN0Q29udGV4dFJlc3VsdEgAEikKCm1jcF9yZXN1bHQYCyABKAsyEy5hZ2VudC52MS5NY3BSZXN1bHRIABItCgxzaGVsbF9zdHJlYW0YDiABKAsyFS5hZ2VudC52MS5TaGVsbFN0cmVhbUgAEk0KHWJhY2tncm91bmRfc2hlbGxfc3Bhd25fcmVzdWx0GBAgASgLMiQuYWdlbnQudjEuQmFja2dyb3VuZFNoZWxsU3Bhd25SZXN1bHRIABJOCh5saXN0X21jcF9yZXNvdXJjZXNfZXhlY19yZXN1bHQYESABKAsyJC5hZ2VudC52MS5MaXN0TWNwUmVzb3VyY2VzRXhlY1Jlc3VsdEgAEkwKHXJlYWRfbWNwX3Jlc291cmNlX2V4ZWNfcmVzdWx0GBIgASgLMiMuYWdlbnQudjEuUmVhZE1jcFJlc291cmNlRXhlY1Jlc3VsdEgAEi0KDGZldGNoX3Jlc3VsdBgUIAEoCzIVLmFnZW50LnYxLkZldGNoUmVzdWx0SAASPAoUcmVjb3JkX3NjcmVlbl9yZXN1bHQYFSABKAsyHC5hZ2VudC52MS5SZWNvcmRTY3JlZW5SZXN1bHRIABI6ChNjb21wdXRlcl91c2VfcmVzdWx0GBYgASgLMhsuYWdlbnQudjEuQ29tcHV0ZXJVc2VSZXN1bHRIABJDChh3cml0ZV9zaGVsbF9zdGRpbl9yZXN1bHQYFyABKAsyHy5hZ2VudC52MS5Xcml0ZVNoZWxsU3RkaW5SZXN1bHRIABI0ChRyZWRhY3RlZF9yZWFkX3Jlc3VsdBgdIAEoCzIULmFnZW50LnYxLlJlYWRSZXN1bHRIABI9ChVtY3Bfc3RhdGVfZXhlY19yZXN1bHQYJCABKAsyHC5hZ2VudC52MS5NY3BTdGF0ZUV4ZWNSZXN1bHRIABI6ChNleGVjdXRlX2hvb2tfcmVzdWx0GBsgASgLMhsuYWdlbnQudjEuRXhlY3V0ZUhvb2tSZXN1bHRIABIzCg9zdWJhZ2VudF9yZXN1bHQYHCABKAsyGC5hZ2VudC52MS5TdWJhZ2VudFJlc3VsdEgAEk0KHWZvcmNlX2JhY2tncm91bmRfc2hlbGxfcmVzdWx0GB4gASgLMiQuYWdlbnQudjEuRm9yY2VCYWNrZ3JvdW5kU2hlbGxSZXN1bHRIABJTCiBmb3JjZV9iYWNrZ3JvdW5kX3N1YmFnZW50X3Jlc3VsdBgfIAEoCzInLmFnZW50LnYxLkZvcmNlQmFja2dyb3VuZFN1YmFnZW50UmVzdWx0SAASPgoVc3ViYWdlbnRfYXdhaXRfcmVzdWx0GCUgASgLMh0uYWdlbnQudjEuU3ViYWdlbnRBd2FpdFJlc3VsdEgAEksKHHNtYXJ0X21vZGVfY2xhc3NpZmllcl9yZXN1bHQYJiABKAsyIy5hZ2VudC52MS5TbWFydE1vZGVDbGFzc2lmaWVyUmVzdWx0SAASRgoZY2FudmFzX2RpYWdub3N0aWNzX3Jlc3VsdBgoIAEoCzIhLmFnZW50LnYxLkNhbnZhc0RpYWdub3N0aWNzUmVzdWx0SAASUQofc2hlbGxfYWxsb3dsaXN0X3ByZWNoZWNrX3Jlc3VsdBgpIAEoCzImLmFnZW50LnYxLlNoZWxsQWxsb3dsaXN0UHJlY2hlY2tSZXN1bHRIABJNCh1tY3BfYWxsb3dsaXN0X3ByZWNoZWNrX3Jlc3VsdBgqIAEoCzIkLmFnZW50LnYxLk1jcEFsbG93bGlzdFByZWNoZWNrUmVzdWx0SAASWAojd2ViX2ZldGNoX2FsbG93bGlzdF9wcmVjaGVja19yZXN1bHQYKyABKAsyKS5hZ2VudC52MS5XZWJGZXRjaEFsbG93bGlzdFByZWNoZWNrUmVzdWx0SAASNgoRZ2l0X2RpZmZfcmVzcG9uc2UYLCABKAsyGS5hZ2VudC52MS5HZXREaWZmUmVzcG9uc2VIABI0Cg5waV9yZWFkX3Jlc3VsdBguIAEoCzIaLmFnZW50LnYxLlBpUmVhZEV4ZWNSZXN1bHRIABI0Cg5waV9iYXNoX3Jlc3VsdBgvIAEoCzIaLmFnZW50LnYxLlBpQmFzaEV4ZWNSZXN1bHRIABI0Cg5waV9lZGl0X3Jlc3VsdBgwIAEoCzIaLmFnZW50LnYxLlBpRWRpdEV4ZWNSZXN1bHRIABI2Cg9waV93cml0ZV9yZXN1bHQYMSABKAsyGy5hZ2VudC52MS5QaVdyaXRlRXhlY1Jlc3VsdEgAEjQKDnBpX2dyZXBfcmVzdWx0GDIgASgLMhouYWdlbnQudjEuUGlHcmVwRXhlY1Jlc3VsdEgAEjQKDnBpX2ZpbmRfcmVzdWx0GDMgASgLMhouYWdlbnQudjEuUGlGaW5kRXhlY1Jlc3VsdEgAEjAKDHBpX2xzX3Jlc3VsdBg0IAEoCzIYLmFnZW50LnYxLlBpTHNFeGVjUmVzdWx0SAASSAoaY29udmVyc2F0aW9uX3NlYXJjaF9yZXN1bHQYNSABKAsyIi5hZ2VudC52MS5Db252ZXJzYXRpb25TZWFyY2hSZXN1bHRIABJJChthZ2VudF9zdG9yZV9jb25mbGljdF9yZXN1bHQYNiABKAsyIi5hZ2VudC52MS5BZ2VudFN0b3JlQ29uZmxpY3RSZXN1bHRIABI7ChptaW5pX3N3ZV9hZ2VudF9iYXNoX3Jlc3VsdBg3IAEoCzIVLmFnZW50LnYxLlNoZWxsUmVzdWx0SAASJAoXbG9jYWxfZXhlY3V0aW9uX3RpbWVfbXMYJyABKAVIAYgBARJBChhob29rX2FkZGl0aW9uYWxfY29udGV4dHMYLSADKAsyHy5hZ2VudC52MS5Ib29rQWRkaXRpb25hbENvbnRleHRCCQoHbWVzc2FnZUIaChhfbG9jYWxfZXhlY3V0aW9uX3RpbWVfbXMiLgoJRmV0Y2hBcmdzEgsKA3VybBgBIAEoCRIUCgx0b29sX2NhbGxfaWQYAiABKAkiaQoLRmV0Y2hSZXN1bHQSKQoHc3VjY2VzcxgBIAEoCzIWLmFnZW50LnYxLkZldGNoU3VjY2Vzc0gAEiUKBWVycm9yGAIgASgLMhQuYWdlbnQudjEuRmV0Y2hFcnJvckgAQggKBnJlc3VsdCJXCgxGZXRjaFN1Y2Nlc3MSCwoDdXJsGAEgASgJEg8KB2NvbnRlbnQYAiABKAkSEwoLc3RhdHVzX2NvZGUYAyABKAUSFAoMY29udGVudF90eXBlGAQgASgJIigKCkZldGNoRXJyb3ISCwoDdXJsGAEgASgJEg0KBWVycm9yGAIgASgJIm0KEUdlbmVyYXRlSW1hZ2VBcmdzEhMKC2Rlc2NyaXB0aW9uGAEgASgJEhYKCWZpbGVfcGF0aBgCIAEoCUgAiAEBEh0KFXJlZmVyZW5jZV9pbWFnZV9wYXRocxgFIAMoCUIMCgpfZmlsZV9wYXRoIoEBChNHZW5lcmF0ZUltYWdlUmVzdWx0EjEKB3N1Y2Nlc3MYASABKAsyHi5hZ2VudC52MS5HZW5lcmF0ZUltYWdlU3VjY2Vzc0gAEi0KBWVycm9yGAIgASgLMhwuYWdlbnQudjEuR2VuZXJhdGVJbWFnZUVycm9ySABCCAoGcmVzdWx0Ij0KFEdlbmVyYXRlSW1hZ2VTdWNjZXNzEhEKCWZpbGVfcGF0aBgBIAEoCRISCgppbWFnZV9kYXRhGAIgASgJIiMKEkdlbmVyYXRlSW1hZ2VFcnJvchINCgVlcnJvchgBIAEoCSJxChVHZW5lcmF0ZUltYWdlVG9vbENhbGwSKQoEYXJncxgBIAEoCzIbLmFnZW50LnYxLkdlbmVyYXRlSW1hZ2VBcmdzEi0KBnJlc3VsdBgCIAEoCzIdLmFnZW50LnYxLkdlbmVyYXRlSW1hZ2VSZXN1bHQi5gQKCEdyZXBBcmdzEg8KB3BhdHRlcm4YASABKAkSEQoEcGF0aBgCIAEoCUgAiAEBEhEKBGdsb2IYAyABKAlIAYgBARIYCgtvdXRwdXRfbW9kZRgEIAEoCUgCiAEBEhsKDmNvbnRleHRfYmVmb3JlGAUgASgFSAOIAQESGgoNY29udGV4dF9hZnRlchgGIAEoBUgEiAEBEhQKB2NvbnRleHQYByABKAVIBYgBARIdChBjYXNlX2luc2Vuc2l0aXZlGAggASgISAaIAQESEQoEdHlwZRgJIAEoCUgHiAEBEhcKCmhlYWRfbGltaXQYCiABKAVICIgBARIWCgltdWx0aWxpbmUYCyABKAhICYgBARIRCgRzb3J0GAwgASgJSAqIAQESGwoOc29ydF9hc2NlbmRpbmcYDSABKAhIC4gBARIUCgx0b29sX2NhbGxfaWQYDiABKAkSNAoOc2FuZGJveF9wb2xpY3kYDyABKAsyFy5hZ2VudC52MS5TYW5kYm94UG9saWN5SAyIAQESEwoGb2Zmc2V0GBAgASgFSA2IAQFCBwoFX3BhdGhCBwoFX2dsb2JCDgoMX291dHB1dF9tb2RlQhEKD19jb250ZXh0X2JlZm9yZUIQCg5fY29udGV4dF9hZnRlckIKCghfY29udGV4dEITChFfY2FzZV9pbnNlbnNpdGl2ZUIHCgVfdHlwZUINCgtfaGVhZF9saW1pdEIMCgpfbXVsdGlsaW5lQgcKBV9zb3J0QhEKD19zb3J0X2FzY2VuZGluZ0IRCg9fc2FuZGJveF9wb2xpY3lCCQoHX29mZnNldCJmCgpHcmVwUmVzdWx0EigKB3N1Y2Nlc3MYASABKAsyFS5hZ2VudC52MS5HcmVwU3VjY2Vzc0gAEiQKBWVycm9yGAIgASgLMhMuYWdlbnQudjEuR3JlcEVycm9ySABCCAoGcmVzdWx0IhoKCUdyZXBFcnJvchINCgVlcnJvchgBIAEoCSK0AgoLR3JlcFN1Y2Nlc3MSDwoHcGF0dGVybhgBIAEoCRIMCgRwYXRoGAIgASgJEhMKC291dHB1dF9tb2RlGAMgASgJEkYKEXdvcmtzcGFjZV9yZXN1bHRzGAQgAygLMisuYWdlbnQudjEuR3JlcFN1Y2Nlc3MuV29ya3NwYWNlUmVzdWx0c0VudHJ5EjwKFGFjdGl2ZV9lZGl0b3JfcmVzdWx0GAUgASgLMhkuYWdlbnQudjEuR3JlcFVuaW9uUmVzdWx0SACIAQEaUgoVV29ya3NwYWNlUmVzdWx0c0VudHJ5EgsKA2tleRgBIAEoCRIoCgV2YWx1ZRgCIAEoCzIZLmFnZW50LnYxLkdyZXBVbmlvblJlc3VsdDoCOAFCFwoVX2FjdGl2ZV9lZGl0b3JfcmVzdWx0IqMBCg9HcmVwVW5pb25SZXN1bHQSKgoFY291bnQYASABKAsyGS5hZ2VudC52MS5HcmVwQ291bnRSZXN1bHRIABIqCgVmaWxlcxgCIAEoCzIZLmFnZW50LnYxLkdyZXBGaWxlc1Jlc3VsdEgAEi4KB2NvbnRlbnQYAyABKAsyGy5hZ2VudC52MS5HcmVwQ29udGVudFJlc3VsdEgAQggKBnJlc3VsdCKDAgoPR3JlcENvdW50UmVzdWx0EicKBmNvdW50cxgBIAMoCzIXLmFnZW50LnYxLkdyZXBGaWxlQ291bnQSEwoLdG90YWxfZmlsZXMYAiABKAUSFQoNdG90YWxfbWF0Y2hlcxgDIAEoBRIYChBjbGllbnRfdHJ1bmNhdGVkGAQgASgIEhkKEXJpcGdyZXBfdHJ1bmNhdGVkGAUgASgIEh8KEmhlYWRfbGltaXRfYXBwbGllZBgGIAEoBUgAiAEBEhsKDm9mZnNldF9hcHBsaWVkGAcgASgFSAGIAQFCFQoTX2hlYWRfbGltaXRfYXBwbGllZEIRCg9fb2Zmc2V0X2FwcGxpZWQiLAoNR3JlcEZpbGVDb3VudBIMCgRmaWxlGAEgASgJEg0KBWNvdW50GAIgASgFItIBCg9HcmVwRmlsZXNSZXN1bHQSDQoFZmlsZXMYASADKAkSEwoLdG90YWxfZmlsZXMYAiABKAUSGAoQY2xpZW50X3RydW5jYXRlZBgDIAEoCBIZChFyaXBncmVwX3RydW5jYXRlZBgEIAEoCBIfChJoZWFkX2xpbWl0X2FwcGxpZWQYBSABKAVIAIgBARIbCg5vZmZzZXRfYXBwbGllZBgGIAEoBUgBiAEBQhUKE19oZWFkX2xpbWl0X2FwcGxpZWRCEQoPX29mZnNldF9hcHBsaWVkIowCChFHcmVwQ29udGVudFJlc3VsdBIoCgdtYXRjaGVzGAEgAygLMhcuYWdlbnQudjEuR3JlcEZpbGVNYXRjaBITCgt0b3RhbF9saW5lcxgCIAEoBRIbChN0b3RhbF9tYXRjaGVkX2xpbmVzGAMgASgFEhgKEGNsaWVudF90cnVuY2F0ZWQYBCABKAgSGQoRcmlwZ3JlcF90cnVuY2F0ZWQYBSABKAgSHwoSaGVhZF9saW1pdF9hcHBsaWVkGAYgASgFSACIAQESGwoOb2Zmc2V0X2FwcGxpZWQYByABKAVIAYgBAUIVChNfaGVhZF9saW1pdF9hcHBsaWVkQhEKD19vZmZzZXRfYXBwbGllZCJKCg1HcmVwRmlsZU1hdGNoEgwKBGZpbGUYASABKAkSKwoHbWF0Y2hlcxgCIAMoCzIaLmFnZW50LnYxLkdyZXBDb250ZW50TWF0Y2gibAoQR3JlcENvbnRlbnRNYXRjaBITCgtsaW5lX251bWJlchgBIAEoBRIPCgdjb250ZW50GAIgASgJEhkKEWNvbnRlbnRfdHJ1bmNhdGVkGAMgASgIEhcKD2lzX2NvbnRleHRfbGluZRgEIAEoCCIdCgpHcmVwU3RyZWFtEg8KB3BhdHRlcm4YASABKAkiVgoMR3JlcFRvb2xDYWxsEiAKBGFyZ3MYASABKAsyEi5hZ2VudC52MS5HcmVwQXJncxIkCgZyZXN1bHQYAiABKAsyFC5hZ2VudC52MS5HcmVwUmVzdWx0Ih4KC0dldEJsb2JBcmdzEg8KB2Jsb2JfaWQYASABKAwiNQoNR2V0QmxvYlJlc3VsdBIWCglibG9iX2RhdGEYASABKAxIAIgBAUIMCgpfYmxvYl9kYXRhIjEKC1NldEJsb2JBcmdzEg8KB2Jsb2JfaWQYASABKAwSEQoJYmxvYl9kYXRhGAIgASgMIj4KDVNldEJsb2JSZXN1bHQSIwoFZXJyb3IYASABKAsyDy5hZ2VudC52MS5FcnJvckgAiAEBQggKBl9lcnJvciLLAQoPS3ZTZXJ2ZXJNZXNzYWdlEgoKAmlkGAEgASgNEjAKDHNwYW5fY29udGV4dBgEIAEoCzIVLmFnZW50LnYxLlNwYW5Db250ZXh0SAGIAQESLgoNZ2V0X2Jsb2JfYXJncxgCIAEoCzIVLmFnZW50LnYxLkdldEJsb2JBcmdzSAASLgoNc2V0X2Jsb2JfYXJncxgDIAEoCzIVLmFnZW50LnYxLlNldEJsb2JBcmdzSABCCQoHbWVzc2FnZUIPCg1fc3Bhbl9jb250ZXh0IpABCg9LdkNsaWVudE1lc3NhZ2USCgoCaWQYASABKA0SMgoPZ2V0X2Jsb2JfcmVzdWx0GAIgASgLMhcuYWdlbnQudjEuR2V0QmxvYlJlc3VsdEgAEjIKD3NldF9ibG9iX3Jlc3VsdBgDIAEoCzIXLmFnZW50LnYxLlNldEJsb2JSZXN1bHRIAEIJCgdtZXNzYWdlIq0BCgZMc0FyZ3MSDAoEcGF0aBgBIAEoCRIOCgZpZ25vcmUYAiADKAkSFAoMdG9vbF9jYWxsX2lkGAMgASgJEjQKDnNhbmRib3hfcG9saWN5GAQgASgLMhcuYWdlbnQudjEuU2FuZGJveFBvbGljeUgAiAEBEhcKCnRpbWVvdXRfbXMYBSABKA1IAYgBAUIRCg9fc2FuZGJveF9wb2xpY3lCDQoLX3RpbWVvdXRfbXMisgEKCExzUmVzdWx0EiYKB3N1Y2Nlc3MYASABKAsyEy5hZ2VudC52MS5Mc1N1Y2Nlc3NIABIiCgVlcnJvchgCIAEoCzIRLmFnZW50LnYxLkxzRXJyb3JIABIoCghyZWplY3RlZBgDIAEoCzIULmFnZW50LnYxLkxzUmVqZWN0ZWRIABImCgd0aW1lb3V0GAQgASgLMhMuYWdlbnQudjEuTHNUaW1lb3V0SABCCAoGcmVzdWx0IkcKCUxzU3VjY2VzcxI6ChNkaXJlY3RvcnlfdHJlZV9yb290GAEgASgLMh0uYWdlbnQudjEuTHNEaXJlY3RvcnlUcmVlTm9kZSL2AgoTTHNEaXJlY3RvcnlUcmVlTm9kZRIQCghhYnNfcGF0aBgBIAEoCRI0Cg1jaGlsZHJlbl9kaXJzGAIgAygLMh0uYWdlbnQudjEuTHNEaXJlY3RvcnlUcmVlTm9kZRI6Cg5jaGlsZHJlbl9maWxlcxgDIAMoCzIiLmFnZW50LnYxLkxzRGlyZWN0b3J5VHJlZU5vZGVfRmlsZRIfChdjaGlsZHJlbl93ZXJlX3Byb2Nlc3NlZBgEIAEoCBJkCh1mdWxsX3N1YnRyZWVfZXh0ZW5zaW9uX2NvdW50cxgFIAMoCzI9LmFnZW50LnYxLkxzRGlyZWN0b3J5VHJlZU5vZGUuRnVsbFN1YnRyZWVFeHRlbnNpb25Db3VudHNFbnRyeRIRCgludW1fZmlsZXMYBiABKAUaQQofRnVsbFN1YnRyZWVFeHRlbnNpb25Db3VudHNFbnRyeRILCgNrZXkYASABKAkSDQoFdmFsdWUYAiABKAU6AjgBInoKGExzRGlyZWN0b3J5VHJlZU5vZGVfRmlsZRIMCgRuYW1lGAEgASgJEjoKEXRlcm1pbmFsX21ldGFkYXRhGAIgASgLMhouYWdlbnQudjEuVGVybWluYWxNZXRhZGF0YUgAiAEBQhQKEl90ZXJtaW5hbF9tZXRhZGF0YSImCgdMc0Vycm9yEgwKBHBhdGgYASABKAkSDQoFZXJyb3IYAiABKAkiKgoKTHNSZWplY3RlZBIMCgRwYXRoGAEgASgJEg4KBnJlYXNvbhgCIAEoCSJHCglMc1RpbWVvdXQSOgoTZGlyZWN0b3J5X3RyZWVfcm9vdBgBIAEoCzIdLmFnZW50LnYxLkxzRGlyZWN0b3J5VHJlZU5vZGUi8QEKEFRlcm1pbmFsTWV0YWRhdGESEAoDY3dkGAEgASgJSACIAQESOQoNbGFzdF9jb21tYW5kcxgCIAMoCzIiLmFnZW50LnYxLlRlcm1pbmFsTWV0YWRhdGFfQ29tbWFuZBIdChBsYXN0X21vZGlmaWVkX21zGAMgASgDSAGIAQESQAoPY3VycmVudF9jb21tYW5kGAQgASgLMiIuYWdlbnQudjEuVGVybWluYWxNZXRhZGF0YV9Db21tYW5kSAKIAQFCBgoEX2N3ZEITChFfbGFzdF9tb2RpZmllZF9tc0ISChBfY3VycmVudF9jb21tYW5kIqcBChhUZXJtaW5hbE1ldGFkYXRhX0NvbW1hbmQSDwoHY29tbWFuZBgBIAEoCRIWCglleGl0X2NvZGUYAiABKAVIAIgBARIZCgx0aW1lc3RhbXBfbXMYAyABKANIAYgBARIYCgtkdXJhdGlvbl9tcxgEIAEoA0gCiAEBQgwKCl9leGl0X2NvZGVCDwoNX3RpbWVzdGFtcF9tc0IOCgxfZHVyYXRpb25fbXMiUAoKTHNUb29sQ2FsbBIeCgRhcmdzGAEgASgLMhAuYWdlbnQudjEuTHNBcmdzEiIKBnJlc3VsdBgCIAEoCzISLmFnZW50LnYxLkxzUmVzdWx0IuACCgdNY3BBcmdzEgwKBG5hbWUYASABKAkSKQoEYXJncxgCIAMoCzIbLmFnZW50LnYxLk1jcEFyZ3MuQXJnc0VudHJ5EhQKDHRvb2xfY2FsbF9pZBgDIAEoCRIbChNwcm92aWRlcl9pZGVudGlmaWVyGAQgASgJEhEKCXRvb2xfbmFtZRgFIAEoCRI9ChNzbWFydF9tb2RlX2FwcHJvdmFsGAYgASgLMhsuYWdlbnQudjEuU21hcnRNb2RlQXBwcm92YWxIAIgBARIgChhzbWFydF9tb2RlX2FwcHJvdmFsX29ubHkYByABKAgSFQoNc2tpcF9hcHByb3ZhbBgIIAEoCBIZChFzZXJ2ZXJfaWRlbnRpZmllchgJIAEoCRorCglBcmdzRW50cnkSCwoDa2V5GAEgASgJEg0KBXZhbHVlGAIgASgMOgI4AUIWChRfc21hcnRfbW9kZV9hcHByb3ZhbCLjAgoJTWNwUmVzdWx0EicKB3N1Y2Nlc3MYASABKAsyFC5hZ2VudC52MS5NY3BTdWNjZXNzSAASIwoFZXJyb3IYAiABKAsyEi5hZ2VudC52MS5NY3BFcnJvckgAEikKCHJlamVjdGVkGAMgASgLMhUuYWdlbnQudjEuTWNwUmVqZWN0ZWRIABI6ChFwZXJtaXNzaW9uX2RlbmllZBgEIAEoCzIdLmFnZW50LnYxLk1jcFBlcm1pc3Npb25EZW5pZWRIABIzCg50b29sX25vdF9mb3VuZBgFIAEoCzIZLmFnZW50LnYxLk1jcFRvb2xOb3RGb3VuZEgAEjcKEHNlcnZlcl9ub3RfZm91bmQYBiABKAsyGy5hZ2VudC52MS5NY3BTZXJ2ZXJOb3RGb3VuZEgAEikKCGFwcHJvdmVkGAcgASgLMhUuYWdlbnQudjEuTWNwQXBwcm92ZWRIAEIICgZyZXN1bHQiOAoPTWNwVG9vbE5vdEZvdW5kEgwKBG5hbWUYASABKAkSFwoPYXZhaWxhYmxlX3Rvb2xzGAIgAygJImoKDk1jcFRleHRDb250ZW50EgwKBHRleHQYASABKAkSNgoPb3V0cHV0X2xvY2F0aW9uGAIgASgLMhguYWdlbnQudjEuT3V0cHV0TG9jYXRpb25IAIgBAUISChBfb3V0cHV0X2xvY2F0aW9uIjIKD01jcEltYWdlQ29udGVudBIMCgRkYXRhGAEgASgMEhEKCW1pbWVfdHlwZRgCIAEoCSJ7ChhNY3BUb29sUmVzdWx0Q29udGVudEl0ZW0SKAoEdGV4dBgBIAEoCzIYLmFnZW50LnYxLk1jcFRleHRDb250ZW50SAASKgoFaW1hZ2UYAiABKAsyGS5hZ2VudC52MS5NY3BJbWFnZUNvbnRlbnRIAEIJCgdjb250ZW50IlMKCk1jcFN1Y2Nlc3MSMwoHY29udGVudBgBIAMoCzIiLmFnZW50LnYxLk1jcFRvb2xSZXN1bHRDb250ZW50SXRlbRIQCghpc19lcnJvchgCIAEoCCIZCghNY3BFcnJvchINCgVlcnJvchgBIAEoCSIyCgtNY3BSZWplY3RlZBIOCgZyZWFzb24YASABKAkSEwoLaXNfcmVhZG9ubHkYAiABKAgiOQoTTWNwUGVybWlzc2lvbkRlbmllZBINCgVlcnJvchgBIAEoCRITCgtpc19yZWFkb25seRgCIAEoCCI6ChhMaXN0TWNwUmVzb3VyY2VzRXhlY0FyZ3MSEwoGc2VydmVyGAEgASgJSACIAQFCCQoHX3NlcnZlciLGAQoaTGlzdE1jcFJlc291cmNlc0V4ZWNSZXN1bHQSNAoHc3VjY2VzcxgBIAEoCzIhLmFnZW50LnYxLkxpc3RNY3BSZXNvdXJjZXNTdWNjZXNzSAASMAoFZXJyb3IYAiABKAsyHy5hZ2VudC52MS5MaXN0TWNwUmVzb3VyY2VzRXJyb3JIABI2CghyZWplY3RlZBgDIAEoCzIiLmFnZW50LnYxLkxpc3RNY3BSZXNvdXJjZXNSZWplY3RlZEgAQggKBnJlc3VsdCK9AgomTGlzdE1jcFJlc291cmNlc0V4ZWNSZXN1bHRfTWNwUmVzb3VyY2USCwoDdXJpGAEgASgJEhEKBG5hbWUYAiABKAlIAIgBARIYCgtkZXNjcmlwdGlvbhgDIAEoCUgBiAEBEhYKCW1pbWVfdHlwZRgEIAEoCUgCiAEBEg4KBnNlcnZlchgFIAEoCRJWCgthbm5vdGF0aW9ucxgGIAMoCzJBLmFnZW50LnYxLkxpc3RNY3BSZXNvdXJjZXNFeGVjUmVzdWx0X01jcFJlc291cmNlLkFubm90YXRpb25zRW50cnkaMgoQQW5ub3RhdGlvbnNFbnRyeRILCgNrZXkYASABKAkSDQoFdmFsdWUYAiABKAk6AjgBQgcKBV9uYW1lQg4KDF9kZXNjcmlwdGlvbkIMCgpfbWltZV90eXBlIl4KF0xpc3RNY3BSZXNvdXJjZXNTdWNjZXNzEkMKCXJlc291cmNlcxgBIAMoCzIwLmFnZW50LnYxLkxpc3RNY3BSZXNvdXJjZXNFeGVjUmVzdWx0X01jcFJlc291cmNlIiYKFUxpc3RNY3BSZXNvdXJjZXNFcnJvchINCgVlcnJvchgBIAEoCSIqChhMaXN0TWNwUmVzb3VyY2VzUmVqZWN0ZWQSDgoGcmVhc29uGAEgASgJItEBChdSZWFkTWNwUmVzb3VyY2VFeGVjQXJncxIOCgZzZXJ2ZXIYASABKAkSCwoDdXJpGAIgASgJEhoKDWRvd25sb2FkX3BhdGgYAyABKAlIAIgBARIUCgx0b29sX2NhbGxfaWQYBCABKAkSPQoTc21hcnRfbW9kZV9hcHByb3ZhbBgFIAEoCzIbLmFnZW50LnYxLlNtYXJ0TW9kZUFwcHJvdmFsSAGIAQFCEAoOX2Rvd25sb2FkX3BhdGhCFgoUX3NtYXJ0X21vZGVfYXBwcm92YWwi+gEKGVJlYWRNY3BSZXNvdXJjZUV4ZWNSZXN1bHQSMwoHc3VjY2VzcxgBIAEoCzIgLmFnZW50LnYxLlJlYWRNY3BSZXNvdXJjZVN1Y2Nlc3NIABIvCgVlcnJvchgCIAEoCzIeLmFnZW50LnYxLlJlYWRNY3BSZXNvdXJjZUVycm9ySAASNQoIcmVqZWN0ZWQYAyABKAsyIS5hZ2VudC52MS5SZWFkTWNwUmVzb3VyY2VSZWplY3RlZEgAEjYKCW5vdF9mb3VuZBgEIAEoCzIhLmFnZW50LnYxLlJlYWRNY3BSZXNvdXJjZU5vdEZvdW5kSABCCAoGcmVzdWx0IrIDChZSZWFkTWNwUmVzb3VyY2VTdWNjZXNzEgsKA3VyaRgBIAEoCRIRCgRuYW1lGAIgASgJSAGIAQESGAoLZGVzY3JpcHRpb24YAyABKAlIAogBARIWCgltaW1lX3R5cGUYBCABKAlIA4gBARJGCgthbm5vdGF0aW9ucxgHIAMoCzIxLmFnZW50LnYxLlJlYWRNY3BSZXNvdXJjZVN1Y2Nlc3MuQW5ub3RhdGlvbnNFbnRyeRIaCg1kb3dubG9hZF9wYXRoGAggASgJSASIAQESDgoEdGV4dBgFIAEoCUgAEg4KBGJsb2IYBiABKAxIABI2Cg9vdXRwdXRfbG9jYXRpb24YCSABKAsyGC5hZ2VudC52MS5PdXRwdXRMb2NhdGlvbkgFiAEBGjIKEEFubm90YXRpb25zRW50cnkSCwoDa2V5GAEgASgJEg0KBXZhbHVlGAIgASgJOgI4AUIJCgdjb250ZW50QgcKBV9uYW1lQg4KDF9kZXNjcmlwdGlvbkIMCgpfbWltZV90eXBlQhAKDl9kb3dubG9hZF9wYXRoQhIKEF9vdXRwdXRfbG9jYXRpb24iMgoUUmVhZE1jcFJlc291cmNlRXJyb3ISCwoDdXJpGAEgASgJEg0KBWVycm9yGAIgASgJIjYKF1JlYWRNY3BSZXNvdXJjZVJlamVjdGVkEgsKA3VyaRgBIAEoCRIOCgZyZWFzb24YAiABKAkiJgoXUmVhZE1jcFJlc291cmNlTm90Rm91bmQSCwoDdXJpGAEgASgJIrIBChFNY3BUb29sRGVmaW5pdGlvbhIMCgRuYW1lGAEgASgJEhsKE3Byb3ZpZGVyX2lkZW50aWZpZXIYBCABKAkSEQoJdG9vbF9uYW1lGAUgASgJEhMKC2Rlc2NyaXB0aW9uGAIgASgJEhQKDGlucHV0X3NjaGVtYRgDIAEoDBIeChFpbnB1dF9zY2hlbWFfanNvbhgGIAEoCUgAiAEBQhQKEl9pbnB1dF9zY2hlbWFfanNvbiI6CghNY3BUb29scxIuCgltY3BfdG9vbHMYASADKAsyGy5hZ2VudC52MS5NY3BUb29sRGVmaW5pdGlvbiJXCg9NY3BJbnN0cnVjdGlvbnMSEwoLc2VydmVyX25hbWUYASABKAkSFAoMaW5zdHJ1Y3Rpb25zGAIgASgJEhkKEXNlcnZlcl9pZGVudGlmaWVyGAMgASgJIv0CCg1NY3BEZXNjcmlwdG9yEhMKC3NlcnZlcl9uYW1lGAEgASgJEhkKEXNlcnZlcl9pZGVudGlmaWVyGAIgASgJEhgKC2ZvbGRlcl9wYXRoGAMgASgJSACIAQESJAoXc2VydmVyX3VzZV9pbnN0cnVjdGlvbnMYBCABKAlIAYgBARIqCgV0b29scxgFIAMoCzIbLmFnZW50LnYxLk1jcFRvb2xEZXNjcmlwdG9yEhMKBnBsdWdpbhgHIAEoCUgCiAEBEhgKC21hcmtldHBsYWNlGAggASgJSAOIAQESGQoMcGx1Z2luX2RiX2lkGAkgASgJSASIAQESGwoObWFya2V0cGxhY2VfaWQYCiABKAlIBYgBAUIOCgxfZm9sZGVyX3BhdGhCGgoYX3NlcnZlcl91c2VfaW5zdHJ1Y3Rpb25zQgkKB19wbHVnaW5CDgoMX21hcmtldHBsYWNlQg8KDV9wbHVnaW5fZGJfaWRCEQoPX21hcmtldHBsYWNlX2lkIrgBChFNY3BUb29sRGVzY3JpcHRvchIRCgl0b29sX25hbWUYASABKAkSHAoPZGVmaW5pdGlvbl9wYXRoGAIgASgJSACIAQESGAoLZGVzY3JpcHRpb24YAyABKAlIAYgBARIeChFpbnB1dF9zY2hlbWFfanNvbhgFIAEoCUgCiAEBQhIKEF9kZWZpbml0aW9uX3BhdGhCDgoMX2Rlc2NyaXB0aW9uQhQKEl9pbnB1dF9zY2hlbWFfanNvbiJ4ChRNY3BGaWxlU3lzdGVtT3B0aW9ucxIPCgdlbmFibGVkGAEgASgIEh0KFXdvcmtzcGFjZV9wcm9qZWN0X2RpchgCIAEoCRIwCg9tY3BfZGVzY3JpcHRvcnMYAyADKAsyFy5hZ2VudC52MS5NY3BEZXNjcmlwdG9yIpoBCghSZWFkQXJncxIMCgRwYXRoGAEgASgJEhQKDHRvb2xfY2FsbF9pZBgCIAEoCRITCgZvZmZzZXQYBCABKAVIAIgBARISCgVsaW1pdBgFIAEoDUgBiAEBEhoKDWVuY29kaW5nX2hpbnQYBiABKAlIAogBAUIJCgdfb2Zmc2V0QggKBl9saW1pdEIQCg5fZW5jb2RpbmdfaGludCK4AgoKUmVhZFJlc3VsdBIoCgdzdWNjZXNzGAEgASgLMhUuYWdlbnQudjEuUmVhZFN1Y2Nlc3NIABIkCgVlcnJvchgCIAEoCzITLmFnZW50LnYxLlJlYWRFcnJvckgAEioKCHJlamVjdGVkGAMgASgLMhYuYWdlbnQudjEuUmVhZFJlamVjdGVkSAASNAoOZmlsZV9ub3RfZm91bmQYBCABKAsyGi5hZ2VudC52MS5SZWFkRmlsZU5vdEZvdW5kSAASOwoRcGVybWlzc2lvbl9kZW5pZWQYBSABKAsyHi5hZ2VudC52MS5SZWFkUGVybWlzc2lvbkRlbmllZEgAEjEKDGludmFsaWRfZmlsZRgGIAEoCzIZLmFnZW50LnYxLlJlYWRJbnZhbGlkRmlsZUgAQggKBnJlc3VsdCLKAQoLUmVhZFN1Y2Nlc3MSDAoEcGF0aBgBIAEoCRITCgt0b3RhbF9saW5lcxgDIAEoBRIRCglmaWxlX3NpemUYBCABKAMSEQoJdHJ1bmNhdGVkGAYgASgIEhsKDm91dHB1dF9ibG9iX2lkGAcgASgMSAGIAQESEQoHY29udGVudBgCIAEoCUgAEg4KBGRhdGEYBSABKAxIABIVCg1yYW5nZV9hcHBsaWVkGAggASgIQggKBm91dHB1dEIRCg9fb3V0cHV0X2Jsb2JfaWQiKAoJUmVhZEVycm9yEgwKBHBhdGgYASABKAkSDQoFZXJyb3IYAiABKAkiLAoMUmVhZFJlamVjdGVkEgwKBHBhdGgYASABKAkSDgoGcmVhc29uGAIgASgJIiAKEFJlYWRGaWxlTm90Rm91bmQSDAoEcGF0aBgBIAEoCSIkChRSZWFkUGVybWlzc2lvbkRlbmllZBIMCgRwYXRoGAEgASgJIi8KD1JlYWRJbnZhbGlkRmlsZRIMCgRwYXRoGAEgASgJEg4KBnJlYXNvbhgCIAEoCSJeCgxSZWFkVG9vbENhbGwSJAoEYXJncxgBIAEoCzIWLmFnZW50LnYxLlJlYWRUb29sQXJncxIoCgZyZXN1bHQYAiABKAsyGC5hZ2VudC52MS5SZWFkVG9vbFJlc3VsdCJaCgxSZWFkVG9vbEFyZ3MSDAoEcGF0aBgBIAEoCRITCgZvZmZzZXQYAiABKAVIAIgBARISCgVsaW1pdBgDIAEoBUgBiAEBQgkKB19vZmZzZXRCCAoGX2xpbWl0InIKDlJlYWRUb29sUmVzdWx0EiwKB3N1Y2Nlc3MYASABKAsyGS5hZ2VudC52MS5SZWFkVG9vbFN1Y2Nlc3NIABIoCgVlcnJvchgCIAEoCzIXLmFnZW50LnYxLlJlYWRUb29sRXJyb3JIAEIICgZyZXN1bHQiMQoJUmVhZFJhbmdlEhIKCnN0YXJ0X2xpbmUYASABKA0SEAoIZW5kX2xpbmUYAiABKA0ijgIKD1JlYWRUb29sU3VjY2VzcxIQCghpc19lbXB0eRgCIAEoCBIWCg5leGNlZWRlZF9saW1pdBgDIAEoCBITCgt0b3RhbF9saW5lcxgEIAEoDRIRCglmaWxlX3NpemUYBSABKA0SDAoEcGF0aBgHIAEoCRIsCgpyZWFkX3JhbmdlGAggASgLMhMuYWdlbnQudjEuUmVhZFJhbmdlSAGIAQESEQoHY29udGVudBgBIAEoCUgAEg4KBGRhdGEYBiABKAxIABIWCgxkYXRhX2Jsb2JfaWQYCSABKAxIABIZCg9jb250ZW50X2Jsb2JfaWQYCiABKAxIAEIICgZvdXRwdXRCDQoLX3JlYWRfcmFuZ2UiJgoNUmVhZFRvb2xFcnJvchIVCg1lcnJvcl9tZXNzYWdlGAEgASgJImoKEFJlY29yZFNjcmVlbkFyZ3MSDAoEbW9kZRgBIAEoBRIUCgx0b29sX2NhbGxfaWQYAiABKAkSHQoQc2F2ZV9hc19maWxlbmFtZRgDIAEoCUgAiAEBQhMKEV9zYXZlX2FzX2ZpbGVuYW1lIokCChJSZWNvcmRTY3JlZW5SZXN1bHQSOwoNc3RhcnRfc3VjY2VzcxgBIAEoCzIiLmFnZW50LnYxLlJlY29yZFNjcmVlblN0YXJ0U3VjY2Vzc0gAEjkKDHNhdmVfc3VjY2VzcxgCIAEoCzIhLmFnZW50LnYxLlJlY29yZFNjcmVlblNhdmVTdWNjZXNzSAASPwoPZGlzY2FyZF9zdWNjZXNzGAMgASgLMiQuYWdlbnQudjEuUmVjb3JkU2NyZWVuRGlzY2FyZFN1Y2Nlc3NIABIwCgdmYWlsdXJlGAQgASgLMh0uYWdlbnQudjEuUmVjb3JkU2NyZWVuRmFpbHVyZUgAQggKBnJlc3VsdCJnChhSZWNvcmRTY3JlZW5TdGFydFN1Y2Nlc3MSJQodd2FzX3ByaW9yX3JlY29yZGluZ19jYW5jZWxsZWQYASABKAgSJAocd2FzX3NhdmVfYXNfZmlsZW5hbWVfaWdub3JlZBgCIAEoCCKgAQoXUmVjb3JkU2NyZWVuU2F2ZVN1Y2Nlc3MSDAoEcGF0aBgBIAEoCRIdChVyZWNvcmRpbmdfZHVyYXRpb25fbXMYAiABKAMSMAojcmVxdWVzdGVkX2ZpbGVfcGF0aF9yZWplY3RlZF9yZWFzb24YAyABKAVIAIgBAUImCiRfcmVxdWVzdGVkX2ZpbGVfcGF0aF9yZWplY3RlZF9yZWFzb24iHAoaUmVjb3JkU2NyZWVuRGlzY2FyZFN1Y2Nlc3MiJAoTUmVjb3JkU2NyZWVuRmFpbHVyZRINCgVlcnJvchgBIAEoCSI2ChNDdXJzb3JQYWNrYWdlUHJvbXB0EgwKBG5hbWUYASABKAkSEQoJZmlsZV9wYXRoGAIgASgJIuIBCg1DdXJzb3JQYWNrYWdlEgwKBG5hbWUYASABKAkSEwoLZGVzY3JpcHRpb24YAiABKAkSEwoLZm9sZGVyX3BhdGgYAyABKAkSDwoHZW5hYmxlZBgEIAEoCBIYCgtwYXJzZV9lcnJvchgFIAEoCUgAiAEBEi4KB3Byb21wdHMYBiADKAsyHS5hZ2VudC52MS5DdXJzb3JQYWNrYWdlUHJvbXB0EhgKEHJlYWRtZV9maWxlX3BhdGgYByABKAkSFAoMcGFja2FnZV90eXBlGAggASgFQg4KDF9wYXJzZV9lcnJvciKrAgoWUmVwb3NpdG9yeUluZGV4aW5nSW5mbxIfChdyZWxhdGl2ZV93b3Jrc3BhY2VfcGF0aBgBIAEoCRITCgtyZW1vdGVfdXJscxgCIAMoCRIUCgxyZW1vdGVfbmFtZXMYAyADKAkSEQoJcmVwb19uYW1lGAQgASgJEhIKCnJlcG9fb3duZXIYBSABKAkSEgoKaXNfdHJhY2tlZBgGIAEoCBIQCghpc19sb2NhbBgHIAEoCBImChlvcnRob2dvbmFsX3RyYW5zZm9ybV9zZWVkGAggASgBSACIAQESFQoNd29ya3NwYWNlX3VyaRgJIAEoCRIbChNwYXRoX2VuY3J5cHRpb25fa2V5GAogASgJQhwKGl9vcnRob2dvbmFsX3RyYW5zZm9ybV9zZWVkIqwCChJSZXF1ZXN0Q29udGV4dEFyZ3MSHQoQbm90ZXNfc2Vzc2lvbl9pZBgCIAEoCUgAiAEBEhkKDHdvcmtzcGFjZV9pZBgDIAEoCUgBiAEBEiYKGXJlYWRfb25seV9waW5uZWRfdHJlZV9zaGEYBCABKAlIAogBARIoChtyZWFkX29ubHlfcGx1Z2luX2NhY2hlX3Jvb3QYBSABKAlIA4gBARIXCgp1c2VfY2FjaGVkGAcgASgISASIAQFCEwoRX25vdGVzX3Nlc3Npb25faWRCDwoNX3dvcmtzcGFjZV9pZEIcChpfcmVhZF9vbmx5X3Bpbm5lZF90cmVlX3NoYUIeChxfcmVhZF9vbmx5X3BsdWdpbl9jYWNoZV9yb290Qg0KC191c2VfY2FjaGVkIroBChRSZXF1ZXN0Q29udGV4dFJlc3VsdBIyCgdzdWNjZXNzGAEgASgLMh8uYWdlbnQudjEuUmVxdWVzdENvbnRleHRTdWNjZXNzSAASLgoFZXJyb3IYAiABKAsyHS5hZ2VudC52MS5SZXF1ZXN0Q29udGV4dEVycm9ySAASNAoIcmVqZWN0ZWQYAyABKAsyIC5hZ2VudC52MS5SZXF1ZXN0Q29udGV4dFJlamVjdGVkSABCCAoGcmVzdWx0IooBChVSZXF1ZXN0Q29udGV4dFN1Y2Nlc3MSMQoPcmVxdWVzdF9jb250ZXh0GAEgASgLMhguYWdlbnQudjEuUmVxdWVzdENvbnRleHQSIwoWc2VydmVkX2Zyb21fZGlza19jYWNoZRgCIAEoCEgAiAEBQhkKF19zZXJ2ZWRfZnJvbV9kaXNrX2NhY2hlIiQKE1JlcXVlc3RDb250ZXh0RXJyb3ISDQoFZXJyb3IYASABKAkiKAoWUmVxdWVzdENvbnRleHRSZWplY3RlZBIOCgZyZWFzb24YASABKAkiwgEKCkltYWdlUHJvdG8SDAoEZGF0YRgBIAEoDBIMCgR1dWlkGAIgASgJEgwKBHBhdGgYAyABKAkSMQoJZGltZW5zaW9uGAQgASgLMh4uYWdlbnQudjEuSW1hZ2VQcm90b19EaW1lbnNpb24SJgoZdGFza19zcGVjaWZpY19kZXNjcmlwdGlvbhgGIAEoCUgAiAEBEhEKCW1pbWVfdHlwZRgHIAEoCUIcChpfdGFza19zcGVjaWZpY19kZXNjcmlwdGlvbiI1ChRJbWFnZVByb3RvX0RpbWVuc2lvbhINCgV3aWR0aBgBIAEoBRIOCgZoZWlnaHQYAiABKAUiaAoLR2l0UmVwb0luZm8SDAoEcGF0aBgBIAEoCRIOCgZzdGF0dXMYAiABKAkSEwoLYnJhbmNoX25hbWUYAyABKAkSFwoKcmVtb3RlX3VybBgEIAEoCUgAiAEBQg0KC19yZW1vdGVfdXJsIpsCChFSZXF1ZXN0Q29udGV4dEVudhISCgpvc192ZXJzaW9uGAEgASgJEhcKD3dvcmtzcGFjZV9wYXRocxgCIAMoCRINCgVzaGVsbBgDIAEoCRIXCg9zYW5kYm94X2VuYWJsZWQYBSABKAgSGAoQdGVybWluYWxzX2ZvbGRlchgHIAEoCRIhChlhZ2VudF9zaGFyZWRfbm90ZXNfZm9sZGVyGAggASgJEicKH2FnZW50X2NvbnZlcnNhdGlvbl9ub3Rlc19mb2xkZXIYCSABKAkSEQoJdGltZV96b25lGAogASgJEhYKDnByb2plY3RfZm9sZGVyGAsgASgJEiAKGGFnZW50X3RyYW5zY3JpcHRzX2ZvbGRlchgMIAEoCSI8Cg9EZWJ1Z01vZGVDb25maWcSEAoIbG9nX3BhdGgYASABKAkSFwoPc2VydmVyX2VuZHBvaW50GAIgASgJIrQBCg9Ta2lsbERlc2NyaXB0b3ISDAoEbmFtZRgBIAEoCRITCgtkZXNjcmlwdGlvbhgCIAEoCRITCgtmb2xkZXJfcGF0aBgDIAEoCRIPCgdlbmFibGVkGAQgASgIEhgKC3BhcnNlX2Vycm9yGAUgASgJSACIAQESGAoQcmVhZG1lX2ZpbGVfcGF0aBgGIAEoCRIUCgxwYWNrYWdlX3R5cGUYByABKAVCDgoMX3BhcnNlX2Vycm9yIkQKDFNraWxsT3B0aW9ucxI0ChFza2lsbF9kZXNjcmlwdG9ycxgBIAMoCzIZLmFnZW50LnYxLlNraWxsRGVzY3JpcHRvciL2CAoOUmVxdWVzdENvbnRleHQSIwoFcnVsZXMYAiADKAsyFC5hZ2VudC52MS5DdXJzb3JSdWxlEigKA2VudhgEIAEoCzIbLmFnZW50LnYxLlJlcXVlc3RDb250ZXh0RW52EjkKD3JlcG9zaXRvcnlfaW5mbxgGIAMoCzIgLmFnZW50LnYxLlJlcG9zaXRvcnlJbmRleGluZ0luZm8SKgoFdG9vbHMYByADKAsyGy5hZ2VudC52MS5NY3BUb29sRGVmaW5pdGlvbhInChpjb252ZXJzYXRpb25fbm90ZXNfbGlzdGluZxgIIAEoCUgAiAEBEiEKFHNoYXJlZF9ub3Rlc19saXN0aW5nGAkgASgJSAGIAQESKAoJZ2l0X3JlcG9zGAsgAygLMhUuYWdlbnQudjEuR2l0UmVwb0luZm8SNgoPcHJvamVjdF9sYXlvdXRzGA0gAygLMh0uYWdlbnQudjEuTHNEaXJlY3RvcnlUcmVlTm9kZRIzChBtY3BfaW5zdHJ1Y3Rpb25zGA4gAygLMhkuYWdlbnQudjEuTWNwSW5zdHJ1Y3Rpb25zEjkKEWRlYnVnX21vZGVfY29uZmlnGA8gASgLMhkuYWdlbnQudjEuRGVidWdNb2RlQ29uZmlnSAKIAQESFwoKY2xvdWRfcnVsZRgQIAEoCUgDiAEBEh8KEndlYl9zZWFyY2hfZW5hYmxlZBgRIAEoCEgEiAEBEjIKDXNraWxsX29wdGlvbnMYEiABKAsyFi5hZ2VudC52MS5Ta2lsbE9wdGlvbnNIBYgBARIuCiFyZXBvc2l0b3J5X2luZm9fc2hvdWxkX3F1ZXJ5X3Byb2QYEyABKAhIBogBARJBCg1maWxlX2NvbnRlbnRzGBQgAygLMiouYWdlbnQudjEuUmVxdWVzdENvbnRleHQuRmlsZUNvbnRlbnRzRW50cnkSIAoTdXNlcl9pbnRlbnRfc3VtbWFyeRgVIAEoCUgHiAEBEjIKEGN1c3RvbV9zdWJhZ2VudHMYFiADKAsyGC5hZ2VudC52MS5DdXN0b21TdWJhZ2VudBJEChdtY3BfZmlsZV9zeXN0ZW1fb3B0aW9ucxgXIAEoCzIeLmFnZW50LnYxLk1jcEZpbGVTeXN0ZW1PcHRpb25zSAiIAQEaMwoRRmlsZUNvbnRlbnRzRW50cnkSCwoDa2V5GAEgASgJEg0KBXZhbHVlGAIgASgJOgI4AUIdChtfY29udmVyc2F0aW9uX25vdGVzX2xpc3RpbmdCFwoVX3NoYXJlZF9ub3Rlc19saXN0aW5nQhQKEl9kZWJ1Z19tb2RlX2NvbmZpZ0INCgtfY2xvdWRfcnVsZUIVChNfd2ViX3NlYXJjaF9lbmFibGVkQhAKDl9za2lsbF9vcHRpb25zQiQKIl9yZXBvc2l0b3J5X2luZm9fc2hvdWxkX3F1ZXJ5X3Byb2RCFgoUX3VzZXJfaW50ZW50X3N1bW1hcnlCGgoYX21jcF9maWxlX3N5c3RlbV9vcHRpb25zIrICCg1TYW5kYm94UG9saWN5EgwKBHR5cGUYASABKAUSGwoObmV0d29ya19hY2Nlc3MYAiABKAhIAIgBARIiChphZGRpdGlvbmFsX3JlYWR3cml0ZV9wYXRocxgDIAMoCRIhChlhZGRpdGlvbmFsX3JlYWRvbmx5X3BhdGhzGAQgAygJEh0KEGRlYnVnX291dHB1dF9kaXIYBSABKAlIAYgBARIdChBibG9ja19naXRfd3JpdGVzGAYgASgISAKIAQESHgoRZGlzYWJsZV90bXBfd3JpdGUYByABKAhIA4gBAUIRCg9fbmV0d29ya19hY2Nlc3NCEwoRX2RlYnVnX291dHB1dF9kaXJCEwoRX2Jsb2NrX2dpdF93cml0ZXNCFAoSX2Rpc2FibGVfdG1wX3dyaXRlIu8BCg1TZWxlY3RlZEltYWdlEgwKBHV1aWQYAiABKAkSDAoEcGF0aBgDIAEoCRI0CglkaW1lbnNpb24YBCABKAsyIS5hZ2VudC52MS5TZWxlY3RlZEltYWdlX0RpbWVuc2lvbhIRCgltaW1lX3R5cGUYByABKAkSEQoHYmxvYl9pZBgBIAEoDEgAEg4KBGRhdGEYCCABKAxIABJDChFibG9iX2lkX3dpdGhfZGF0YRgJIAEoCzImLmFnZW50LnYxLlNlbGVjdGVkSW1hZ2VfQmxvYklkV2l0aERhdGFIAEIRCg9kYXRhX29yX2Jsb2JfaWQiPQocU2VsZWN0ZWRJbWFnZV9CbG9iSWRXaXRoRGF0YRIPCgdibG9iX2lkGAEgASgMEgwKBGRhdGEYAiABKAwiOAoXU2VsZWN0ZWRJbWFnZV9EaW1lbnNpb24SDQoFd2lkdGgYASABKAUSDgoGaGVpZ2h0GAIgASgFIkkKEUV4dHJhQ29udGV4dEVudHJ5Eg4KBGRhdGEYASABKAlIABIRCgdibG9iX2lkGAIgASgMSABCEQoPZGF0YV9vcl9ibG9iX2lkIlsKDFNlbGVjdGVkRmlsZRIPCgdjb250ZW50GAEgASgJEgwKBHBhdGgYAiABKAkSGgoNcmVsYXRpdmVfcGF0aBgDIAEoCUgAiAEBQhAKDl9yZWxhdGl2ZV9wYXRoIoQBChVTZWxlY3RlZENvZGVTZWxlY3Rpb24SDwoHY29udGVudBgBIAEoCRIMCgRwYXRoGAIgASgJEhoKDXJlbGF0aXZlX3BhdGgYAyABKAlIAIgBARIeCgVyYW5nZRgEIAEoCzIPLmFnZW50LnYxLlJhbmdlQhAKDl9yZWxhdGl2ZV9wYXRoIl0KEFNlbGVjdGVkVGVybWluYWwSDwoHY29udGVudBgBIAEoCRISCgV0aXRsZRgCIAEoCUgAiAEBEhEKBHBhdGgYAyABKAlIAYgBAUIICgZfdGl0bGVCBwoFX3BhdGgihgEKGVNlbGVjdGVkVGVybWluYWxTZWxlY3Rpb24SDwoHY29udGVudBgBIAEoCRISCgV0aXRsZRgCIAEoCUgAiAEBEhEKBHBhdGgYAyABKAlIAYgBARIeCgVyYW5nZRgEIAEoCzIPLmFnZW50LnYxLlJhbmdlQggKBl90aXRsZUIHCgVfcGF0aCKDAQoOU2VsZWN0ZWRGb2xkZXISDAoEcGF0aBgBIAEoCRIaCg1yZWxhdGl2ZV9wYXRoGAIgASgJSACIAQESNQoOZGlyZWN0b3J5X3RyZWUYAyABKAsyHS5hZ2VudC52MS5Mc0RpcmVjdG9yeVRyZWVOb2RlQhAKDl9yZWxhdGl2ZV9wYXRoIp8BChRTZWxlY3RlZEV4dGVybmFsTGluaxILCgN1cmwYASABKAkSDAoEdXVpZBgCIAEoCRIYCgtwZGZfY29udGVudBgDIAEoCUgAiAEBEhMKBmlzX3BkZhgEIAEoCEgBiAEBEhUKCGZpbGVuYW1lGAUgASgJSAKIAQFCDgoMX3BkZl9jb250ZW50QgkKB19pc19wZGZCCwoJX2ZpbGVuYW1lIjgKElNlbGVjdGVkQ3Vyc29yUnVsZRIiCgRydWxlGAEgASgLMhQuYWdlbnQudjEuQ3Vyc29yUnVsZSIiCg9TZWxlY3RlZEdpdERpZmYSDwoHY29udGVudBgBIAEoCSIyCh9TZWxlY3RlZEdpdERpZmZGcm9tQnJhbmNoVG9NYWluEg8KB2NvbnRlbnQYASABKAkiaQoRU2VsZWN0ZWRHaXRDb21taXQSCwoDc2hhGAEgASgJEg8KB21lc3NhZ2UYAiABKAkSGAoLZGVzY3JpcHRpb24YAyABKAlIAIgBARIMCgRkaWZmGAQgASgJQg4KDF9kZXNjcmlwdGlvbiLdAQoTU2VsZWN0ZWRQdWxsUmVxdWVzdBIOCgZudW1iZXIYASABKAUSCwoDdXJsGAIgASgJEhIKBXRpdGxlGAMgASgJSACIAQESEwoLZm9sZGVyX3BhdGgYBCABKAkSGQoMc3VtbWFyeV9qc29uGAUgASgJSAGIAQESGAoLZGVzY3JpcHRpb24YBiABKAlIAogBARIUCgdibG9iX2lkGAcgASgMSAOIAQFCCAoGX3RpdGxlQg8KDV9zdW1tYXJ5X2pzb25CDgoMX2Rlc2NyaXB0aW9uQgoKCF9ibG9iX2lkIrMBChpTZWxlY3RlZEdpdFBSRGlmZlNlbGVjdGlvbhIOCgZwcl91cmwYASABKAkSEQoJZmlsZV9wYXRoGAIgASgJEhIKCnN0YXJ0X2xpbmUYAyABKAUSEAoIZW5kX2xpbmUYBCABKAUSGQoMZGlmZl9jb250ZW50GAUgASgJSACIAQESFAoHYmxvYl9pZBgGIAEoDEgBiAEBQg8KDV9kaWZmX2NvbnRlbnRCCgoIX2Jsb2JfaWQiNgoVU2VsZWN0ZWRDdXJzb3JDb21tYW5kEgwKBG5hbWUYASABKAkSDwoHY29udGVudBgCIAEoCSI1ChVTZWxlY3RlZERvY3VtZW50YXRpb24SDgoGZG9jX2lkGAEgASgJEgwKBG5hbWUYAiABKAkiMgoQU2VsZWN0ZWRQYXN0Q2hhdBIQCghhZ2VudF9pZBgBIAEoCRIMCgRuYW1lGAIgASgJIqsBCglDYWxsRnJhbWUSGgoNZnVuY3Rpb25fbmFtZRgBIAEoCUgAiAEBEhAKA3VybBgCIAEoCUgBiAEBEhgKC2xpbmVfbnVtYmVyGAMgASgFSAKIAQESGgoNY29sdW1uX251bWJlchgEIAEoBUgDiAEBQhAKDl9mdW5jdGlvbl9uYW1lQgYKBF91cmxCDgoMX2xpbmVfbnVtYmVyQhAKDl9jb2x1bW5fbnVtYmVyImgKClN0YWNrVHJhY2USKAoLY2FsbF9mcmFtZXMYASADKAsyEy5hZ2VudC52MS5DYWxsRnJhbWUSHAoPcmF3X3N0YWNrX3RyYWNlGAIgASgJSACIAQFCEgoQX3Jhd19zdGFja190cmFjZSLkAQoSU2VsZWN0ZWRDb25zb2xlTG9nEg8KB21lc3NhZ2UYASABKAkSEQoJdGltZXN0YW1wGAIgASgBEg0KBWxldmVsGAMgASgJEhMKC2NsaWVudF9uYW1lGAQgASgJEhIKCnNlc3Npb25faWQYBSABKAkSLgoLc3RhY2tfdHJhY2UYBiABKAsyFC5hZ2VudC52MS5TdGFja1RyYWNlSACIAQESHQoQb2JqZWN0X2RhdGFfanNvbhgHIAEoCUgBiAEBQg4KDF9zdGFja190cmFjZUITChFfb2JqZWN0X2RhdGFfanNvbiK6AQoRU2VsZWN0ZWRVSUVsZW1lbnQSDwoHZWxlbWVudBgBIAEoCRINCgV4cGF0aBgCIAEoCRIUCgx0ZXh0X2NvbnRlbnQYAyABKAkSDQoFZXh0cmEYBCABKAkSFgoJY29tcG9uZW50GAUgASgJSACIAQESIQoUY29tcG9uZW50X3Byb3BzX2pzb24YBiABKAlIAYgBAUIMCgpfY29tcG9uZW50QhcKFV9jb21wb25lbnRfcHJvcHNfanNvbiIgChBTZWxlY3RlZFN1YmFnZW50EgwKBG5hbWUYASABKAkiggoKD1NlbGVjdGVkQ29udGV4dBIwCg9zZWxlY3RlZF9pbWFnZXMYASADKAsyFy5hZ2VudC52MS5TZWxlY3RlZEltYWdlEjwKEmludm9jYXRpb25fY29udGV4dBgCIAEoCzIbLmFnZW50LnYxLkludm9jYXRpb25Db250ZXh0SACIAQESFQoNZXh0cmFfY29udGV4dBgDIAMoCRI6ChVleHRyYV9jb250ZXh0X2VudHJpZXMYECADKAsyGy5hZ2VudC52MS5FeHRyYUNvbnRleHRFbnRyeRIlCgVmaWxlcxgEIAMoCzIWLmFnZW50LnYxLlNlbGVjdGVkRmlsZRI4Cg9jb2RlX3NlbGVjdGlvbnMYBSADKAsyHy5hZ2VudC52MS5TZWxlY3RlZENvZGVTZWxlY3Rpb24SLQoJdGVybWluYWxzGAYgAygLMhouYWdlbnQudjEuU2VsZWN0ZWRUZXJtaW5hbBJAChN0ZXJtaW5hbF9zZWxlY3Rpb25zGAcgAygLMiMuYWdlbnQudjEuU2VsZWN0ZWRUZXJtaW5hbFNlbGVjdGlvbhIpCgdmb2xkZXJzGAggAygLMhguYWdlbnQudjEuU2VsZWN0ZWRGb2xkZXISNgoOZXh0ZXJuYWxfbGlua3MYCSADKAsyHi5hZ2VudC52MS5TZWxlY3RlZEV4dGVybmFsTGluaxIyCgxjdXJzb3JfcnVsZXMYCiADKAsyHC5hZ2VudC52MS5TZWxlY3RlZEN1cnNvclJ1bGUSMAoIZ2l0X2RpZmYYEiABKAsyGS5hZ2VudC52MS5TZWxlY3RlZEdpdERpZmZIAYgBARJUChxnaXRfZGlmZl9mcm9tX2JyYW5jaF90b19tYWluGAsgASgLMikuYWdlbnQudjEuU2VsZWN0ZWRHaXREaWZmRnJvbUJyYW5jaFRvTWFpbkgCiAEBEjgKD2N1cnNvcl9jb21tYW5kcxgMIAMoCzIfLmFnZW50LnYxLlNlbGVjdGVkQ3Vyc29yQ29tbWFuZBI3Cg5kb2N1bWVudGF0aW9ucxgNIAMoCzIfLmFnZW50LnYxLlNlbGVjdGVkRG9jdW1lbnRhdGlvbhIwCgt1aV9lbGVtZW50cxgOIAMoCzIbLmFnZW50LnYxLlNlbGVjdGVkVUlFbGVtZW50EjIKDGNvbnNvbGVfbG9ncxgPIAMoCzIcLmFnZW50LnYxLlNlbGVjdGVkQ29uc29sZUxvZxIwCgtnaXRfY29tbWl0cxgRIAMoCzIbLmFnZW50LnYxLlNlbGVjdGVkR2l0Q29tbWl0Ei4KCnBhc3RfY2hhdHMYEyADKAsyGi5hZ2VudC52MS5TZWxlY3RlZFBhc3RDaGF0EkQKFmdpdF9wcl9kaWZmX3NlbGVjdGlvbnMYFCADKAsyJC5hZ2VudC52MS5TZWxlY3RlZEdpdFBSRGlmZlNlbGVjdGlvbhI9ChZzZWxlY3RlZF9wdWxsX3JlcXVlc3RzGBUgAygLMh0uYWdlbnQudjEuU2VsZWN0ZWRQdWxsUmVxdWVzdBI2ChJzZWxlY3RlZF9zdWJhZ2VudHMYFiADKAsyGi5hZ2VudC52MS5TZWxlY3RlZFN1YmFnZW50QhUKE19pbnZvY2F0aW9uX2NvbnRleHRCCwoJX2dpdF9kaWZmQh8KHV9naXRfZGlmZl9mcm9tX2JyYW5jaF90b19tYWluIuUBChFJbnZvY2F0aW9uQ29udGV4dBI/CgxzbGFja190aHJlYWQYASABKAsyJy5hZ2VudC52MS5JbnZvY2F0aW9uQ29udGV4dF9TbGFja1RocmVhZEgAEjkKCWdpdGh1Yl9wchgCIAEoCzIkLmFnZW50LnYxLkludm9jYXRpb25Db250ZXh0X0dpdGh1YlBSSAASOQoJaWRlX3N0YXRlGAMgASgLMiQuYWdlbnQudjEuSW52b2NhdGlvbkNvbnRleHRfSWRlU3RhdGVIABIRCgdibG9iX2lkGAogASgMSABCBgoEZGF0YSK7AQodSW52b2NhdGlvbkNvbnRleHRfU2xhY2tUaHJlYWQSDgoGdGhyZWFkGAEgASgJEhkKDGNoYW5uZWxfbmFtZRgCIAEoCUgAiAEBEhwKD2NoYW5uZWxfcHVycG9zZRgDIAEoCUgBiAEBEhoKDWNoYW5uZWxfdG9waWMYBCABKAlIAogBAUIPCg1fY2hhbm5lbF9uYW1lQhIKEF9jaGFubmVsX3B1cnBvc2VCEAoOX2NoYW5uZWxfdG9waWMifAoaSW52b2NhdGlvbkNvbnRleHRfR2l0aHViUFISDQoFdGl0bGUYASABKAkSEwoLZGVzY3JpcHRpb24YAiABKAkSEAoIY29tbWVudHMYAyABKAkSGAoLY2lfZmFpbHVyZXMYBCABKAlIAIgBAUIOCgxfY2lfZmFpbHVyZXMi/gEKGkludm9jYXRpb25Db250ZXh0X0lkZVN0YXRlEkAKDXZpc2libGVfZmlsZXMYASADKAsyKS5hZ2VudC52MS5JbnZvY2F0aW9uQ29udGV4dF9JZGVTdGF0ZV9GaWxlEkgKFXJlY2VudGx5X3ZpZXdlZF9maWxlcxgCIAMoCzIpLmFnZW50LnYxLkludm9jYXRpb25Db250ZXh0X0lkZVN0YXRlX0ZpbGUSVAoUY3VycmVudGx5X3ZpZXdlZF9wcnMYAyADKAsyNi5hZ2VudC52MS5JbnZvY2F0aW9uQ29udGV4dF9JZGVTdGF0ZV9WaWV3ZWRQdWxsUmVxdWVzdCKOAgofSW52b2NhdGlvbkNvbnRleHRfSWRlU3RhdGVfRmlsZRIMCgRwYXRoGAEgASgJEhoKDXJlbGF0aXZlX3BhdGgYAiABKAlIAIgBARJWCg9jdXJzb3JfcG9zaXRpb24YAyABKAsyOC5hZ2VudC52MS5JbnZvY2F0aW9uQ29udGV4dF9JZGVTdGF0ZV9GaWxlX0N1cnNvclBvc2l0aW9uSAGIAQESEwoLdG90YWxfbGluZXMYBCABKAUSGwoOYWN0aXZlX2NvbW1hbmQYBSABKAlIAogBAUIQCg5fcmVsYXRpdmVfcGF0aEISChBfY3Vyc29yX3Bvc2l0aW9uQhEKD19hY3RpdmVfY29tbWFuZCJMCi5JbnZvY2F0aW9uQ29udGV4dF9JZGVTdGF0ZV9GaWxlX0N1cnNvclBvc2l0aW9uEgwKBGxpbmUYASABKAUSDAoEdGV4dBgCIAEoCSLpAQosSW52b2NhdGlvbkNvbnRleHRfSWRlU3RhdGVfVmlld2VkUHVsbFJlcXVlc3QSDgoGbnVtYmVyGAEgASgFEgsKA3VybBgCIAEoCRISCgV0aXRsZRgDIAEoCUgAiAEBEhgKC2ZvbGRlcl9wYXRoGAQgASgJSAGIAQESGQoMc3VtbWFyeV9qc29uGAUgASgJSAKIAQESGAoLZGVzY3JpcHRpb24YBiABKAlIA4gBAUIICgZfdGl0bGVCDgoMX2ZvbGRlcl9wYXRoQg8KDV9zdW1tYXJ5X2pzb25CDgoMX2Rlc2NyaXB0aW9uIkgKFlNldHVwVm1FbnZpcm9ubWVudEFyZ3MSFwoPaW5zdGFsbF9jb21tYW5kGAIgASgJEhUKDXN0YXJ0X2NvbW1hbmQYAyABKAkiXAoYU2V0dXBWbUVudmlyb25tZW50UmVzdWx0EjYKB3N1Y2Nlc3MYASABKAsyIy5hZ2VudC52MS5TZXR1cFZtRW52aXJvbm1lbnRTdWNjZXNzSABCCAoGcmVzdWx0IhsKGVNldHVwVm1FbnZpcm9ubWVudFN1Y2Nlc3MigAEKGlNldHVwVm1FbnZpcm9ubWVudFRvb2xDYWxsEi4KBGFyZ3MYASABKAsyIC5hZ2VudC52MS5TZXR1cFZtRW52aXJvbm1lbnRBcmdzEjIKBnJlc3VsdBgCIAEoCzIiLmFnZW50LnYxLlNldHVwVm1FbnZpcm9ubWVudFJlc3VsdCLJAgoZU2hlbGxDb21tYW5kUGFyc2luZ1Jlc3VsdBIWCg5wYXJzaW5nX2ZhaWxlZBgBIAEoCBJSChNleGVjdXRhYmxlX2NvbW1hbmRzGAIgAygLMjUuYWdlbnQudjEuU2hlbGxDb21tYW5kUGFyc2luZ1Jlc3VsdF9FeGVjdXRhYmxlQ29tbWFuZBIVCg1oYXNfcmVkaXJlY3RzGAMgASgIEiAKGGhhc19jb21tYW5kX3N1YnN0aXR1dGlvbhgEIAEoCBInChphbGxfcmVkaXJlY3RzX2FyZV9kZXZfbnVsbBgFIAEoCEgAiAEBEj8KCXJlZGlyZWN0cxgGIAMoCzIsLmFnZW50LnYxLlNoZWxsQ29tbWFuZFBhcnNpbmdSZXN1bHRfUmVkaXJlY3RCHQobX2FsbF9yZWRpcmVjdHNfYXJlX2Rldl9udWxsIk0KLlNoZWxsQ29tbWFuZFBhcnNpbmdSZXN1bHRfRXhlY3V0YWJsZUNvbW1hbmRBcmcSDAoEdHlwZRgBIAEoCRINCgV2YWx1ZRgCIAEoCSKWAQorU2hlbGxDb21tYW5kUGFyc2luZ1Jlc3VsdF9FeGVjdXRhYmxlQ29tbWFuZBIMCgRuYW1lGAEgASgJEkYKBGFyZ3MYAiADKAsyOC5hZ2VudC52MS5TaGVsbENvbW1hbmRQYXJzaW5nUmVzdWx0X0V4ZWN1dGFibGVDb21tYW5kQXJnEhEKCWZ1bGxfdGV4dBgDIAEoCSL6BwoJU2hlbGxBcmdzEg8KB2NvbW1hbmQYASABKAkSGQoRd29ya2luZ19kaXJlY3RvcnkYAiABKAkSDwoHdGltZW91dBgDIAEoBRIUCgx0b29sX2NhbGxfaWQYBCABKAkSFwoPc2ltcGxlX2NvbW1hbmRzGAUgAygJEhoKEmhhc19pbnB1dF9yZWRpcmVjdBgGIAEoCBIbChNoYXNfb3V0cHV0X3JlZGlyZWN0GAcgASgIEjsKDnBhcnNpbmdfcmVzdWx0GAggASgLMiMuYWdlbnQudjEuU2hlbGxDb21tYW5kUGFyc2luZ1Jlc3VsdBI+ChhyZXF1ZXN0ZWRfc2FuZGJveF9wb2xpY3kYCSABKAsyFy5hZ2VudC52MS5TYW5kYm94UG9saWN5SACIAQESKAobZmlsZV9vdXRwdXRfdGhyZXNob2xkX2J5dGVzGAogASgESAGIAQESFQoNaXNfYmFja2dyb3VuZBgLIAEoCBIVCg1za2lwX2FwcHJvdmFsGAwgASgIEhgKEHRpbWVvdXRfYmVoYXZpb3IYDSABKAUSGQoMaGFyZF90aW1lb3V0GA4gASgFSAKIAQESGAoLZGVzY3JpcHRpb24YDyABKAlIA4gBARJBChFjbGFzc2lmaWVyX3Jlc3VsdBgQIAEoCzIhLmFnZW50LnYxLkNvbW1hbmRDbGFzc2lmaWVyUmVzdWx0SASIAQESEwoLY2xvc2Vfc3RkaW4YESABKAgSSQoTb3V0cHV0X25vdGlmaWNhdGlvbhgSIAEoCzInLmFnZW50LnYxLlNoZWxsT3V0cHV0Tm90aWZpY2F0aW9uQ29uZmlnSAWIAQESPQoTc21hcnRfbW9kZV9hcHByb3ZhbBgTIAEoCzIbLmFnZW50LnYxLlNtYXJ0TW9kZUFwcHJvdmFsSAaIAQESTgoZaG9va19hcHByb3ZhbF9yZXF1aXJlbWVudBgUIAEoCzImLmFnZW50LnYxLlNoZWxsSG9va0FwcHJvdmFsUmVxdWlyZW1lbnRIB4gBARIcCg9jb252ZXJzYXRpb25faWQYFSABKAlICIgBAUIbChlfcmVxdWVzdGVkX3NhbmRib3hfcG9saWN5Qh4KHF9maWxlX291dHB1dF90aHJlc2hvbGRfYnl0ZXNCDwoNX2hhcmRfdGltZW91dEIOCgxfZGVzY3JpcHRpb25CFAoSX2NsYXNzaWZpZXJfcmVzdWx0QhYKFF9vdXRwdXRfbm90aWZpY2F0aW9uQhYKFF9zbWFydF9tb2RlX2FwcHJvdmFsQhwKGl9ob29rX2FwcHJvdmFsX3JlcXVpcmVtZW50QhIKEF9jb252ZXJzYXRpb25faWQi+gMKC1NoZWxsUmVzdWx0EjQKDnNhbmRib3hfcG9saWN5GGUgASgLMhcuYWdlbnQudjEuU2FuZGJveFBvbGljeUgBiAEBEhoKDWlzX2JhY2tncm91bmQYZiABKAhIAogBARIdChB0ZXJtaW5hbHNfZm9sZGVyGGcgASgJSAOIAQESEAoDcGlkGGggASgNSASIAQESKQoHc3VjY2VzcxgBIAEoCzIWLmFnZW50LnYxLlNoZWxsU3VjY2Vzc0gAEikKB2ZhaWx1cmUYAiABKAsyFi5hZ2VudC52MS5TaGVsbEZhaWx1cmVIABIpCgd0aW1lb3V0GAMgASgLMhYuYWdlbnQudjEuU2hlbGxUaW1lb3V0SAASKwoIcmVqZWN0ZWQYBCABKAsyFy5hZ2VudC52MS5TaGVsbFJlamVjdGVkSAASMAoLc3Bhd25fZXJyb3IYBSABKAsyGS5hZ2VudC52MS5TaGVsbFNwYXduRXJyb3JIABI8ChFwZXJtaXNzaW9uX2RlbmllZBgHIAEoCzIfLmFnZW50LnYxLlNoZWxsUGVybWlzc2lvbkRlbmllZEgAQggKBnJlc3VsdEIRCg9fc2FuZGJveF9wb2xpY3lCEAoOX2lzX2JhY2tncm91bmRCEwoRX3Rlcm1pbmFsc19mb2xkZXJCBgoEX3BpZCIhChFTaGVsbFN0cmVhbVN0ZG91dBIMCgRkYXRhGAEgASgJIiEKEVNoZWxsU3RyZWFtU3RkZXJyEgwKBGRhdGEYASABKAki9wEKD1NoZWxsU3RyZWFtRXhpdBIMCgRjb2RlGAEgASgNEgsKA2N3ZBgCIAEoCRI2Cg9vdXRwdXRfbG9jYXRpb24YAyABKAsyGC5hZ2VudC52MS5PdXRwdXRMb2NhdGlvbkgAiAEBEg8KB2Fib3J0ZWQYBCABKAgSGQoMYWJvcnRfcmVhc29uGAUgASgFSAGIAQESJAoXbG9jYWxfZXhlY3V0aW9uX3RpbWVfbXMYBiABKAVIAogBAUISChBfb3V0cHV0X2xvY2F0aW9uQg8KDV9hYm9ydF9yZWFzb25CGgoYX2xvY2FsX2V4ZWN1dGlvbl90aW1lX21zIlsKEFNoZWxsU3RyZWFtU3RhcnQSNAoOc2FuZGJveF9wb2xpY3kYASABKAsyFy5hZ2VudC52MS5TYW5kYm94UG9saWN5SACIAQFCEQoPX3NhbmRib3hfcG9saWN5ItoBChdTaGVsbFN0cmVhbUJhY2tncm91bmRlZBIQCghzaGVsbF9pZBgBIAEoDRIPCgdjb21tYW5kGAIgASgJEhkKEXdvcmtpbmdfZGlyZWN0b3J5GAMgASgJEhAKA3BpZBgEIAEoDUgAiAEBEhcKCm1zX3RvX3dhaXQYBSABKAVIAYgBARI0CgZyZWFzb24YBiABKA4yHy5hZ2VudC52MS5TaGVsbEJhY2tncm91bmRSZWFzb25IAogBAUIGCgRfcGlkQg0KC19tc190b193YWl0QgkKB19yZWFzb24irAMKC1NoZWxsU3RyZWFtEi0KBnN0ZG91dBgBIAEoCzIbLmFnZW50LnYxLlNoZWxsU3RyZWFtU3Rkb3V0SAASLQoGc3RkZXJyGAIgASgLMhsuYWdlbnQudjEuU2hlbGxTdHJlYW1TdGRlcnJIABIpCgRleGl0GAMgASgLMhkuYWdlbnQudjEuU2hlbGxTdHJlYW1FeGl0SAASKwoFc3RhcnQYBCABKAsyGi5hZ2VudC52MS5TaGVsbFN0cmVhbVN0YXJ0SAASKwoIcmVqZWN0ZWQYBSABKAsyFy5hZ2VudC52MS5TaGVsbFJlamVjdGVkSAASPAoRcGVybWlzc2lvbl9kZW5pZWQYBiABKAsyHy5hZ2VudC52MS5TaGVsbFBlcm1pc3Npb25EZW5pZWRIABI5CgxiYWNrZ3JvdW5kZWQYByABKAsyIS5hZ2VudC52MS5TaGVsbFN0cmVhbUJhY2tncm91bmRlZEgAEjgKDGhvb2tfY29udGV4dBgIIAEoCzIgLmFnZW50LnYxLlNoZWxsU3RyZWFtSG9va0NvbnRleHRIAEIHCgVldmVudCJLCg5PdXRwdXRMb2NhdGlvbhIRCglmaWxlX3BhdGgYASABKAkSEgoKc2l6ZV9ieXRlcxgCIAEoAxISCgpsaW5lX2NvdW50GAMgASgDIpgFCgxTaGVsbFN1Y2Nlc3MSDwoHY29tbWFuZBgBIAEoCRIZChF3b3JraW5nX2RpcmVjdG9yeRgCIAEoCRIRCglleGl0X2NvZGUYAyABKAUSDgoGc2lnbmFsGAQgASgJEg4KBnN0ZG91dBgFIAEoCRIOCgZzdGRlcnIYBiABKAkSFgoOZXhlY3V0aW9uX3RpbWUYByABKAUSNgoPb3V0cHV0X2xvY2F0aW9uGAggASgLMhguYWdlbnQudjEuT3V0cHV0TG9jYXRpb25IAIgBARIVCghzaGVsbF9pZBgJIAEoDUgBiAEBEh8KEmludGVybGVhdmVkX291dHB1dBgKIAEoCUgCiAEBEhAKA3BpZBgLIAEoDUgDiAEBEhcKCm1zX3RvX3dhaXQYDCABKAVIBIgBARIkChdsb2NhbF9leGVjdXRpb25fdGltZV9tcxgNIAEoBUgFiAEBEj8KEWJhY2tncm91bmRfcmVhc29uGA4gASgOMh8uYWdlbnQudjEuU2hlbGxCYWNrZ3JvdW5kUmVhc29uSAaIAQESGAoLb3V0cHV0X2hlYWQYDyABKAlIB4gBARIYCgtvdXRwdXRfdGFpbBgQIAEoCUgIiAEBEhkKDGVsaWRlZF9jaGFycxgRIAEoDUgJiAEBQhIKEF9vdXRwdXRfbG9jYXRpb25CCwoJX3NoZWxsX2lkQhUKE19pbnRlcmxlYXZlZF9vdXRwdXRCBgoEX3BpZEINCgtfbXNfdG9fd2FpdEIaChhfbG9jYWxfZXhlY3V0aW9uX3RpbWVfbXNCFAoSX2JhY2tncm91bmRfcmVhc29uQg4KDF9vdXRwdXRfaGVhZEIOCgxfb3V0cHV0X3RhaWxCDwoNX2VsaWRlZF9jaGFycyKYBAoMU2hlbGxGYWlsdXJlEg8KB2NvbW1hbmQYASABKAkSGQoRd29ya2luZ19kaXJlY3RvcnkYAiABKAkSEQoJZXhpdF9jb2RlGAMgASgFEg4KBnNpZ25hbBgEIAEoCRIOCgZzdGRvdXQYBSABKAkSDgoGc3RkZXJyGAYgASgJEhYKDmV4ZWN1dGlvbl90aW1lGAcgASgFEjYKD291dHB1dF9sb2NhdGlvbhgIIAEoCzIYLmFnZW50LnYxLk91dHB1dExvY2F0aW9uSACIAQESHwoSaW50ZXJsZWF2ZWRfb3V0cHV0GAkgASgJSAGIAQESGQoMYWJvcnRfcmVhc29uGAogASgFSAKIAQESDwoHYWJvcnRlZBgLIAEoCBIkChdsb2NhbF9leGVjdXRpb25fdGltZV9tcxgMIAEoBUgDiAEBEhgKC291dHB1dF9oZWFkGA0gASgJSASIAQESGAoLb3V0cHV0X3RhaWwYDiABKAlIBYgBARIZCgxlbGlkZWRfY2hhcnMYDyABKA1IBogBAUISChBfb3V0cHV0X2xvY2F0aW9uQhUKE19pbnRlcmxlYXZlZF9vdXRwdXRCDwoNX2Fib3J0X3JlYXNvbkIaChhfbG9jYWxfZXhlY3V0aW9uX3RpbWVfbXNCDgoMX291dHB1dF9oZWFkQg4KDF9vdXRwdXRfdGFpbEIPCg1fZWxpZGVkX2NoYXJzIk4KDFNoZWxsVGltZW91dBIPCgdjb21tYW5kGAEgASgJEhkKEXdvcmtpbmdfZGlyZWN0b3J5GAIgASgJEhIKCnRpbWVvdXRfbXMYAyABKAUiYAoNU2hlbGxSZWplY3RlZBIPCgdjb21tYW5kGAEgASgJEhkKEXdvcmtpbmdfZGlyZWN0b3J5GAIgASgJEg4KBnJlYXNvbhgDIAEoCRITCgtpc19yZWFkb25seRgEIAEoCCJnChVTaGVsbFBlcm1pc3Npb25EZW5pZWQSDwoHY29tbWFuZBgBIAEoCRIZChF3b3JraW5nX2RpcmVjdG9yeRgCIAEoCRINCgVlcnJvchgDIAEoCRITCgtpc19yZWFkb25seRgEIAEoCCJMCg9TaGVsbFNwYXduRXJyb3ISDwoHY29tbWFuZBgBIAEoCRIZChF3b3JraW5nX2RpcmVjdG9yeRgCIAEoCRINCgVlcnJvchgDIAEoCSJAChJTaGVsbFBhcnRpYWxSZXN1bHQSFAoMc3Rkb3V0X2RlbHRhGAEgASgJEhQKDHN0ZGVycl9kZWx0YRgCIAEoCSJZCg1TaGVsbFRvb2xDYWxsEiEKBGFyZ3MYASABKAsyEy5hZ2VudC52MS5TaGVsbEFyZ3MSJQoGcmVzdWx0GAIgASgLMhUuYWdlbnQudjEuU2hlbGxSZXN1bHQiKwoYU2hlbGxUb29sQ2FsbFN0ZG91dERlbHRhEg8KB2NvbnRlbnQYASABKAkiKwoYU2hlbGxUb29sQ2FsbFN0ZGVyckRlbHRhEg8KB2NvbnRlbnQYASABKAkiiQEKElNoZWxsVG9vbENhbGxEZWx0YRI0CgZzdGRvdXQYASABKAsyIi5hZ2VudC52MS5TaGVsbFRvb2xDYWxsU3Rkb3V0RGVsdGFIABI0CgZzdGRlcnIYAiABKAsyIi5hZ2VudC52MS5TaGVsbFRvb2xDYWxsU3RkZXJyRGVsdGFIAEIHCgVkZWx0YSLtAQoMU3ViYWdlbnRUeXBlEjgKC3Vuc3BlY2lmaWVkGAEgASgLMiEuYWdlbnQudjEuU3ViYWdlbnRUeXBlVW5zcGVjaWZpZWRIABI5Cgxjb21wdXRlcl91c2UYAiABKAsyIS5hZ2VudC52MS5TdWJhZ2VudFR5cGVDb21wdXRlclVzZUgAEi4KBmN1c3RvbRgDIAEoCzIcLmFnZW50LnYxLlN1YmFnZW50VHlwZUN1c3RvbUgAEjAKB2V4cGxvcmUYBCABKAsyHS5hZ2VudC52MS5TdWJhZ2VudFR5cGVFeHBsb3JlSABCBgoEdHlwZSIZChdTdWJhZ2VudFR5cGVVbnNwZWNpZmllZCIZChdTdWJhZ2VudFR5cGVDb21wdXRlclVzZSIVChNTdWJhZ2VudFR5cGVFeHBsb3JlIiIKElN1YmFnZW50VHlwZUN1c3RvbRIMCgRuYW1lGAEgASgJIo0BCg5DdXN0b21TdWJhZ2VudBIRCglmdWxsX3BhdGgYASABKAkSDAoEbmFtZRgCIAEoCRITCgtkZXNjcmlwdGlvbhgDIAEoCRINCgV0b29scxgEIAMoCRINCgVtb2RlbBgFIAEoCRIOCgZwcm9tcHQYBiABKAkSFwoPcGVybWlzc2lvbl9tb2RlGAcgASgFImgKDlN3aXRjaE1vZGVBcmdzEhYKDnRhcmdldF9tb2RlX2lkGAEgASgJEhgKC2V4cGxhbmF0aW9uGAIgASgJSACIAQESFAoMdG9vbF9jYWxsX2lkGAMgASgJQg4KDF9leHBsYW5hdGlvbiKqAQoQU3dpdGNoTW9kZVJlc3VsdBIuCgdzdWNjZXNzGAEgASgLMhsuYWdlbnQudjEuU3dpdGNoTW9kZVN1Y2Nlc3NIABIqCgVlcnJvchgCIAEoCzIZLmFnZW50LnYxLlN3aXRjaE1vZGVFcnJvckgAEjAKCHJlamVjdGVkGAMgASgLMhwuYWdlbnQudjEuU3dpdGNoTW9kZVJlamVjdGVkSABCCAoGcmVzdWx0Ij0KEVN3aXRjaE1vZGVTdWNjZXNzEhQKDGZyb21fbW9kZV9pZBgBIAEoCRISCgp0b19tb2RlX2lkGAIgASgJIiAKD1N3aXRjaE1vZGVFcnJvchINCgVlcnJvchgBIAEoCSIkChJTd2l0Y2hNb2RlUmVqZWN0ZWQSDgoGcmVhc29uGAEgASgJImgKElN3aXRjaE1vZGVUb29sQ2FsbBImCgRhcmdzGAEgASgLMhguYWdlbnQudjEuU3dpdGNoTW9kZUFyZ3MSKgoGcmVzdWx0GAIgASgLMhouYWdlbnQudjEuU3dpdGNoTW9kZVJlc3VsdCJAChZTd2l0Y2hNb2RlUmVxdWVzdFF1ZXJ5EiYKBGFyZ3MYASABKAsyGC5hZ2VudC52MS5Td2l0Y2hNb2RlQXJncyKpAQoZU3dpdGNoTW9kZVJlcXVlc3RSZXNwb25zZRJACghhcHByb3ZlZBgBIAEoCzIsLmFnZW50LnYxLlN3aXRjaE1vZGVSZXF1ZXN0UmVzcG9uc2VfQXBwcm92ZWRIABJACghyZWplY3RlZBgCIAEoCzIsLmFnZW50LnYxLlN3aXRjaE1vZGVSZXF1ZXN0UmVzcG9uc2VfUmVqZWN0ZWRIAEIICgZyZXN1bHQiJAoiU3dpdGNoTW9kZVJlcXVlc3RSZXNwb25zZV9BcHByb3ZlZCI0CiJTd2l0Y2hNb2RlUmVxdWVzdFJlc3BvbnNlX1JlamVjdGVkEg4KBnJlYXNvbhgBIAEoCSJ1CghUb2RvSXRlbRIKCgJpZBgBIAEoCRIPCgdjb250ZW50GAIgASgJEg4KBnN0YXR1cxgDIAEoBRISCgpjcmVhdGVkX2F0GAQgASgDEhIKCnVwZGF0ZWRfYXQYBSABKAMSFAoMZGVwZW5kZW5jaWVzGAYgAygJImsKE1VwZGF0ZVRvZG9zVG9vbENhbGwSJwoEYXJncxgBIAEoCzIZLmFnZW50LnYxLlVwZGF0ZVRvZG9zQXJncxIrCgZyZXN1bHQYAiABKAsyGy5hZ2VudC52MS5VcGRhdGVUb2Rvc1Jlc3VsdCJDCg9VcGRhdGVUb2Rvc0FyZ3MSIQoFdG9kb3MYASADKAsyEi5hZ2VudC52MS5Ub2RvSXRlbRINCgVtZXJnZRgCIAEoCCJ7ChFVcGRhdGVUb2Rvc1Jlc3VsdBIvCgdzdWNjZXNzGAEgASgLMhwuYWdlbnQudjEuVXBkYXRlVG9kb3NTdWNjZXNzSAASKwoFZXJyb3IYAiABKAsyGi5hZ2VudC52MS5VcGRhdGVUb2Rvc0Vycm9ySABCCAoGcmVzdWx0Il8KElVwZGF0ZVRvZG9zU3VjY2VzcxIhCgV0b2RvcxgBIAMoCzISLmFnZW50LnYxLlRvZG9JdGVtEhMKC3RvdGFsX2NvdW50GAIgASgFEhEKCXdhc19tZXJnZRgDIAEoCCIhChBVcGRhdGVUb2Rvc0Vycm9yEg0KBWVycm9yGAEgASgJImUKEVJlYWRUb2Rvc1Rvb2xDYWxsEiUKBGFyZ3MYASABKAsyFy5hZ2VudC52MS5SZWFkVG9kb3NBcmdzEikKBnJlc3VsdBgCIAEoCzIZLmFnZW50LnYxLlJlYWRUb2Rvc1Jlc3VsdCI5Cg1SZWFkVG9kb3NBcmdzEhUKDXN0YXR1c19maWx0ZXIYASADKAUSEQoJaWRfZmlsdGVyGAIgAygJInUKD1JlYWRUb2Rvc1Jlc3VsdBItCgdzdWNjZXNzGAEgASgLMhouYWdlbnQudjEuUmVhZFRvZG9zU3VjY2Vzc0gAEikKBWVycm9yGAIgASgLMhguYWdlbnQudjEuUmVhZFRvZG9zRXJyb3JIAEIICgZyZXN1bHQiSgoQUmVhZFRvZG9zU3VjY2VzcxIhCgV0b2RvcxgBIAMoCzISLmFnZW50LnYxLlRvZG9JdGVtEhMKC3RvdGFsX2NvdW50GAIgASgFIh8KDlJlYWRUb2Rvc0Vycm9yEg0KBWVycm9yGAEgASgJIksKBVJhbmdlEiEKBXN0YXJ0GAEgASgLMhIuYWdlbnQudjEuUG9zaXRpb24SHwoDZW5kGAIgASgLMhIuYWdlbnQudjEuUG9zaXRpb24iKAoIUG9zaXRpb24SDAoEbGluZRgBIAEoDRIOCgZjb2x1bW4YAiABKA0iGAoFRXJyb3ISDwoHbWVzc2FnZRgBIAEoCSI6Cg1XZWJTZWFyY2hBcmdzEhMKC3NlYXJjaF90ZXJtGAEgASgJEhQKDHRvb2xfY2FsbF9pZBgCIAEoCSKmAQoPV2ViU2VhcmNoUmVzdWx0Ei0KB3N1Y2Nlc3MYASABKAsyGi5hZ2VudC52MS5XZWJTZWFyY2hTdWNjZXNzSAASKQoFZXJyb3IYAiABKAsyGC5hZ2VudC52MS5XZWJTZWFyY2hFcnJvckgAEi8KCHJlamVjdGVkGAMgASgLMhsuYWdlbnQudjEuV2ViU2VhcmNoUmVqZWN0ZWRIAEIICgZyZXN1bHQiRAoQV2ViU2VhcmNoU3VjY2VzcxIwCgpyZWZlcmVuY2VzGAEgAygLMhwuYWdlbnQudjEuV2ViU2VhcmNoUmVmZXJlbmNlIh8KDldlYlNlYXJjaEVycm9yEg0KBWVycm9yGAEgASgJIiMKEVdlYlNlYXJjaFJlamVjdGVkEg4KBnJlYXNvbhgBIAEoCSI/ChJXZWJTZWFyY2hSZWZlcmVuY2USDQoFdGl0bGUYASABKAkSCwoDdXJsGAIgASgJEg0KBWNodW5rGAMgASgJImUKEVdlYlNlYXJjaFRvb2xDYWxsEiUKBGFyZ3MYASABKAsyFy5hZ2VudC52MS5XZWJTZWFyY2hBcmdzEikKBnJlc3VsdBgCIAEoCzIZLmFnZW50LnYxLldlYlNlYXJjaFJlc3VsdCI+ChVXZWJTZWFyY2hSZXF1ZXN0UXVlcnkSJQoEYXJncxgBIAEoCzIXLmFnZW50LnYxLldlYlNlYXJjaEFyZ3MipgEKGFdlYlNlYXJjaFJlcXVlc3RSZXNwb25zZRI/CghhcHByb3ZlZBgBIAEoCzIrLmFnZW50LnYxLldlYlNlYXJjaFJlcXVlc3RSZXNwb25zZV9BcHByb3ZlZEgAEj8KCHJlamVjdGVkGAIgASgLMisuYWdlbnQudjEuV2ViU2VhcmNoUmVxdWVzdFJlc3BvbnNlX1JlamVjdGVkSABCCAoGcmVzdWx0IiMKIVdlYlNlYXJjaFJlcXVlc3RSZXNwb25zZV9BcHByb3ZlZCIzCiFXZWJTZWFyY2hSZXF1ZXN0UmVzcG9uc2VfUmVqZWN0ZWQSDgoGcmVhc29uGAEgASgJIq0BCglXcml0ZUFyZ3MSDAoEcGF0aBgBIAEoCRIRCglmaWxlX3RleHQYAiABKAkSFAoMdG9vbF9jYWxsX2lkGAMgASgJEicKH3JldHVybl9maWxlX2NvbnRlbnRfYWZ0ZXJfd3JpdGUYBCABKAgSEgoKZmlsZV9ieXRlcxgFIAEoDBIaCg1lbmNvZGluZ19oaW50GAYgASgJSACIAQFCEAoOX2VuY29kaW5nX2hpbnQigAIKC1dyaXRlUmVzdWx0EikKB3N1Y2Nlc3MYASABKAsyFi5hZ2VudC52MS5Xcml0ZVN1Y2Nlc3NIABI8ChFwZXJtaXNzaW9uX2RlbmllZBgDIAEoCzIfLmFnZW50LnYxLldyaXRlUGVybWlzc2lvbkRlbmllZEgAEioKCG5vX3NwYWNlGAQgASgLMhYuYWdlbnQudjEuV3JpdGVOb1NwYWNlSAASJQoFZXJyb3IYBSABKAsyFC5hZ2VudC52MS5Xcml0ZUVycm9ySAASKwoIcmVqZWN0ZWQYBiABKAsyFy5hZ2VudC52MS5Xcml0ZVJlamVjdGVkSABCCAoGcmVzdWx0IooBCgxXcml0ZVN1Y2Nlc3MSDAoEcGF0aBgBIAEoCRIVCg1saW5lc19jcmVhdGVkGAIgASgFEhEKCWZpbGVfc2l6ZRgDIAEoBRIlChhmaWxlX2NvbnRlbnRfYWZ0ZXJfd3JpdGUYBCABKAlIAIgBAUIbChlfZmlsZV9jb250ZW50X2FmdGVyX3dyaXRlIm8KFVdyaXRlUGVybWlzc2lvbkRlbmllZBIMCgRwYXRoGAEgASgJEhEKCWRpcmVjdG9yeRgCIAEoCRIRCglvcGVyYXRpb24YAyABKAkSDQoFZXJyb3IYBCABKAkSEwoLaXNfcmVhZG9ubHkYBSABKAgiHAoMV3JpdGVOb1NwYWNlEgwKBHBhdGgYASABKAkiKQoKV3JpdGVFcnJvchIMCgRwYXRoGAEgASgJEg0KBWVycm9yGAIgASgJIi0KDVdyaXRlUmVqZWN0ZWQSDAoEcGF0aBgBIAEoCRIOCgZyZWFzb24YAiABKAkigwEKF0Jvb3RzdHJhcFN0YXRzaWdSZXF1ZXN0Eh4KEWlnbm9yZV9kZXZfc3RhdHVzGAEgASgISACIAQESHQoQb3BlcmF0aW5nX3N5c3RlbRgCIAEoBUgBiAEBQhQKEl9pZ25vcmVfZGV2X3N0YXR1c0ITChFfb3BlcmF0aW5nX3N5c3RlbSIOCgxQaW5nUmVzcG9uc2UitwEKC0V4ZWNSZXF1ZXN0Eg8KB2NvbW1hbmQYASABKAkSEAoDY3dkGAIgASgJSACIAQESDAoEYXJncxgDIAMoCRI7CgtlbnZpcm9ubWVudBgEIAMoCzImLmFnZW50LnYxLkV4ZWNSZXF1ZXN0LkVudmlyb25tZW50RW50cnkaMgoQRW52aXJvbm1lbnRFbnRyeRILCgNrZXkYASABKAkSDQoFdmFsdWUYAiABKAk6AjgBQgYKBF9jd2QioAEKDEV4ZWNSZXNwb25zZRItCgxzdGRvdXRfZXZlbnQYASABKAsyFS5hZ2VudC52MS5TdGRvdXRFdmVudEgAEi0KDHN0ZGVycl9ldmVudBgCIAEoCzIVLmFnZW50LnYxLlN0ZGVyckV2ZW50SAASKQoKZXhpdF9ldmVudBgDIAEoCzITLmFnZW50LnYxLkV4aXRFdmVudEgAQgcKBWV2ZW50IhsKC1N0ZG91dEV2ZW50EgwKBGRhdGEYASABKAkiGwoLU3RkZXJyRXZlbnQSDAoEZGF0YRgBIAEoCSIeCglFeGl0RXZlbnQSEQoJZXhpdF9jb2RlGAEgASgFIiMKE1JlYWRUZXh0RmlsZVJlcXVlc3QSDAoEcGF0aBgBIAEoCSInChRSZWFkVGV4dEZpbGVSZXNwb25zZRIPCgdjb250ZW50GAEgASgJIjUKFFdyaXRlVGV4dEZpbGVSZXF1ZXN0EgwKBHBhdGgYASABKAkSDwoHY29udGVudBgCIAEoCSIXChVXcml0ZVRleHRGaWxlUmVzcG9uc2UiJQoVUmVhZEJpbmFyeUZpbGVSZXF1ZXN0EgwKBHBhdGgYASABKAkiKQoWUmVhZEJpbmFyeUZpbGVSZXNwb25zZRIPCgdjb250ZW50GAEgASgMIjcKFldyaXRlQmluYXJ5RmlsZVJlcXVlc3QSDAoEcGF0aBgBIAEoCRIPCgdjb250ZW50GAIgASgMIhkKF1dyaXRlQmluYXJ5RmlsZVJlc3BvbnNlIkUKHkdldFdvcmtzcGFjZUNoYW5nZXNIYXNoUmVxdWVzdBIRCglyb290X3BhdGgYASABKAkSEAoIYmFzZV9yZWYYAiABKAkiLwofR2V0V29ya3NwYWNlQ2hhbmdlc0hhc2hSZXNwb25zZRIMCgRoYXNoGAEgASgJIlAKH1JlZnJlc2hHaXRodWJBY2Nlc3NUb2tlblJlcXVlc3QSGwoTZ2l0aHViX2FjY2Vzc190b2tlbhgBIAEoCRIQCghob3N0bmFtZRgCIAEoCSIiCiBSZWZyZXNoR2l0aHViQWNjZXNzVG9rZW5SZXNwb25zZSJXCh1XYXJtUmVtb3RlQWNjZXNzU2VydmVyUmVxdWVzdBIOCgZjb21taXQYASABKAkSDAoEcG9ydBgCIAEoBRIYChBjb25uZWN0aW9uX3Rva2VuGAMgASgJIiAKHldhcm1SZW1vdGVBY2Nlc3NTZXJ2ZXJSZXNwb25zZSIWChRMaXN0QXJ0aWZhY3RzUmVxdWVzdCKKAgoWQXJ0aWZhY3RVcGxvYWRNZXRhZGF0YRIVCg1hYnNvbHV0ZV9wYXRoGAEgASgJEhIKCnNpemVfYnl0ZXMYAiABKAQSGgoSdXBkYXRlZF9hdF91bml4X21zGAMgASgDEg4KBnN0YXR1cxgEIAEoBRIWCg5ieXRlc191cGxvYWRlZBgFIAEoBBISCgpsYXN0X2Vycm9yGAYgASgJEhcKD3VwbG9hZF9hdHRlbXB0cxgHIAEoDRIfChdsYXN0X3N0YXJ0ZWRfYXRfdW5peF9tcxgIIAEoAxIgChhsYXN0X2ZpbmlzaGVkX2F0X3VuaXhfbXMYCSABKAMSEQoJdXBsb2FkX2lkGAogASgJIkwKFUxpc3RBcnRpZmFjdHNSZXNwb25zZRIzCglhcnRpZmFjdHMYASADKAsyIC5hZ2VudC52MS5BcnRpZmFjdFVwbG9hZE1ldGFkYXRhIk4KFlVwbG9hZEFydGlmYWN0c1JlcXVlc3QSNAoHdXBsb2FkcxgBIAMoCzIjLmFnZW50LnYxLkFydGlmYWN0VXBsb2FkSW5zdHJ1Y3Rpb24i1wIKGUFydGlmYWN0VXBsb2FkSW5zdHJ1Y3Rpb24SFQoNYWJzb2x1dGVfcGF0aBgBIAEoCRISCgp1cGxvYWRfdXJsGAIgASgJEg4KBm1ldGhvZBgDIAEoCRJBCgdoZWFkZXJzGAQgAygLMjAuYWdlbnQudjEuQXJ0aWZhY3RVcGxvYWRJbnN0cnVjdGlvbi5IZWFkZXJzRW50cnkSGQoMY29udGVudF90eXBlGAUgASgJSACIAQESHQoQc2xhY2tfdXBsb2FkX3VybBgGIAEoCUgBiAEBEhoKDXNsYWNrX2ZpbGVfaWQYByABKAlIAogBARouCgxIZWFkZXJzRW50cnkSCwoDa2V5GAEgASgJEg0KBXZhbHVlGAIgASgJOgI4AUIPCg1fY29udGVudF90eXBlQhMKEV9zbGFja191cGxvYWRfdXJsQhAKDl9zbGFja19maWxlX2lkIoQBChxBcnRpZmFjdFVwbG9hZERpc3BhdGNoUmVzdWx0EhUKDWFic29sdXRlX3BhdGgYASABKAkSDgoGc3RhdHVzGAIgASgFEg8KB21lc3NhZ2UYAyABKAkSGgoNc2xhY2tfZmlsZV9pZBgEIAEoCUgAiAEBQhAKDl9zbGFja19maWxlX2lkIlIKF1VwbG9hZEFydGlmYWN0c1Jlc3BvbnNlEjcKB3Jlc3VsdHMYASADKAsyJi5hZ2VudC52MS5BcnRpZmFjdFVwbG9hZERpc3BhdGNoUmVzdWx0IhwKGkdldE1jcFJlZnJlc2hUb2tlbnNSZXF1ZXN0IqUBChtHZXRNY3BSZWZyZXNoVG9rZW5zUmVzcG9uc2USUAoOcmVmcmVzaF90b2tlbnMYASADKAsyOC5hZ2VudC52MS5HZXRNY3BSZWZyZXNoVG9rZW5zUmVzcG9uc2UuUmVmcmVzaFRva2Vuc0VudHJ5GjQKElJlZnJlc2hUb2tlbnNFbnRyeRILCgNrZXkYASABKAkSDQoFdmFsdWUYAiABKAk6AjgBIqMBCiFVcGRhdGVFbnZpcm9ubWVudFZhcmlhYmxlc1JlcXVlc3QSQQoDZW52GAEgAygLMjQuYWdlbnQudjEuVXBkYXRlRW52aXJvbm1lbnRWYXJpYWJsZXNSZXF1ZXN0LkVudkVudHJ5Eg8KB3JlcGxhY2UYAiABKAgaKgoIRW52RW50cnkSCwoDa2V5GAEgASgJEg0KBXZhbHVlGAIgASgJOgI4ASJGCiJVcGRhdGVFbnZpcm9ubWVudFZhcmlhYmxlc1Jlc3BvbnNlEg8KB2FwcGxpZWQYASABKA0SDwoHcmVtb3ZlZBgCIAEoDSKDAQoSTWNwT0F1dGhTdG9yZWREYXRhEhUKDXJlZnJlc2hfdG9rZW4YASABKAkSEQoJY2xpZW50X2lkGAIgASgJEhoKDWNsaWVudF9zZWNyZXQYAyABKAlIAIgBARIVCg1yZWRpcmVjdF91cmlzGAQgAygJQhAKDl9jbGllbnRfc2VjcmV0Ik4KBUZyYW1lEgoKAmlkGAEgASgJEg4KBm1ldGhvZBgCIAEoCRIMCgRkYXRhGAMgASgMEgwKBGtpbmQYBCABKAUSDQoFZXJyb3IYBSABKAkiBwoFRW1wdHkiIwoNQmlkaVJlcXVlc3RJZBISCgpyZXF1ZXN0X2lkGAEgASgJIoECCgxQaVRydW5jYXRpb24SEQoJdHJ1bmNhdGVkGAEgASgIEhQKDHRydW5jYXRlZF9ieRgCIAEoCRITCgt0b3RhbF9saW5lcxgDIAEoDRIUCgxvdXRwdXRfbGluZXMYBCABKA0SFAoMb3V0cHV0X2J5dGVzGAUgASgNEhYKCW1heF9saW5lcxgGIAEoDUgAiAEBEhYKCW1heF9ieXRlcxgHIAEoDUgBiAEBEiAKGGZpcnN0X2xpbmVfZXhjZWVkc19saW1pdBgIIAEoCBIZChFsYXN0X2xpbmVfcGFydGlhbBgJIAEoCEIMCgpfbWF4X2xpbmVzQgwKCl9tYXhfYnl0ZXMiNwoRUGlFZGl0UmVwbGFjZW1lbnQSEAoIb2xkX3RleHQYASABKAkSEAoIbmV3X3RleHQYAiABKAkiXAoOUGlSZWFkRXhlY0FyZ3MSDAoEcGF0aBgBIAEoCRITCgZvZmZzZXQYAiABKAVIAIgBARISCgVsaW1pdBgDIAEoBUgBiAEBQgkKB19vZmZzZXRCCAoGX2xpbWl0ImMKEVBpUmVhZEV4ZWNTdWNjZXNzEg4KBm91dHB1dBgBIAEoCRIvCgp0cnVuY2F0aW9uGAIgASgLMhYuYWdlbnQudjEuUGlUcnVuY2F0aW9uSACIAQFCDQoLX3RydW5jYXRpb24iIAoPUGlSZWFkRXhlY0Vycm9yEg0KBWVycm9yGAEgASgJIngKEFBpUmVhZEV4ZWNSZXN1bHQSLgoHc3VjY2VzcxgBIAEoCzIbLmFnZW50LnYxLlBpUmVhZEV4ZWNTdWNjZXNzSAASKgoFZXJyb3IYAiABKAsyGS5hZ2VudC52MS5QaVJlYWRFeGVjRXJyb3JIAEIICgZyZXN1bHQiQwoOUGlCYXNoRXhlY0FyZ3MSDwoHY29tbWFuZBgBIAEoCRIUCgd0aW1lb3V0GAIgASgBSACIAQFCCgoIX3RpbWVvdXQilwEKEVBpQmFzaEV4ZWNTdWNjZXNzEg4KBm91dHB1dBgBIAEoCRIvCgp0cnVuY2F0aW9uGAIgASgLMhYuYWdlbnQudjEuUGlUcnVuY2F0aW9uSACIAQESHQoQZnVsbF9vdXRwdXRfcGF0aBgDIAEoCUgBiAEBQg0KC190cnVuY2F0aW9uQhMKEV9mdWxsX291dHB1dF9wYXRoIpQBCg9QaUJhc2hFeGVjRXJyb3ISDQoFZXJyb3IYASABKAkSLwoKdHJ1bmNhdGlvbhgCIAEoCzIWLmFnZW50LnYxLlBpVHJ1bmNhdGlvbkgAiAEBEh0KEGZ1bGxfb3V0cHV0X3BhdGgYAyABKAlIAYgBAUINCgtfdHJ1bmNhdGlvbkITChFfZnVsbF9vdXRwdXRfcGF0aCJ4ChBQaUJhc2hFeGVjUmVzdWx0Ei4KB3N1Y2Nlc3MYASABKAsyGy5hZ2VudC52MS5QaUJhc2hFeGVjU3VjY2Vzc0gAEioKBWVycm9yGAIgASgLMhkuYWdlbnQudjEuUGlCYXNoRXhlY0Vycm9ySABCCAoGcmVzdWx0IkoKDlBpRWRpdEV4ZWNBcmdzEgwKBHBhdGgYASABKAkSKgoFZWRpdHMYAiADKAsyGy5hZ2VudC52MS5QaUVkaXRSZXBsYWNlbWVudCJ4ChFQaUVkaXRFeGVjU3VjY2VzcxIOCgZvdXRwdXQYASABKAkSDAoEZGlmZhgCIAEoCRINCgVwYXRjaBgDIAEoCRIfChJmaXJzdF9jaGFuZ2VkX2xpbmUYBCABKA1IAIgBAUIVChNfZmlyc3RfY2hhbmdlZF9saW5lIiAKD1BpRWRpdEV4ZWNFcnJvchINCgVlcnJvchgBIAEoCSIkChJQaUVkaXRFeGVjUmVqZWN0ZWQSDgoGcmVhc29uGAEgASgJIqoBChBQaUVkaXRFeGVjUmVzdWx0Ei4KB3N1Y2Nlc3MYASABKAsyGy5hZ2VudC52MS5QaUVkaXRFeGVjU3VjY2Vzc0gAEioKBWVycm9yGAIgASgLMhkuYWdlbnQudjEuUGlFZGl0RXhlY0Vycm9ySAASMAoIcmVqZWN0ZWQYAyABKAsyHC5hZ2VudC52MS5QaUVkaXRFeGVjUmVqZWN0ZWRIAEIICgZyZXN1bHQiMAoPUGlXcml0ZUV4ZWNBcmdzEgwKBHBhdGgYASABKAkSDwoHY29udGVudBgCIAEoCSIkChJQaVdyaXRlRXhlY1N1Y2Nlc3MSDgoGb3V0cHV0GAEgASgJIiEKEFBpV3JpdGVFeGVjRXJyb3ISDQoFZXJyb3IYASABKAkiJQoTUGlXcml0ZUV4ZWNSZWplY3RlZBIOCgZyZWFzb24YASABKAkirgEKEVBpV3JpdGVFeGVjUmVzdWx0Ei8KB3N1Y2Nlc3MYASABKAsyHC5hZ2VudC52MS5QaVdyaXRlRXhlY1N1Y2Nlc3NIABIrCgVlcnJvchgCIAEoCzIaLmFnZW50LnYxLlBpV3JpdGVFeGVjRXJyb3JIABIxCghyZWplY3RlZBgDIAEoCzIdLmFnZW50LnYxLlBpV3JpdGVFeGVjUmVqZWN0ZWRIAEIICgZyZXN1bHQi5QEKDlBpR3JlcEV4ZWNBcmdzEg8KB3BhdHRlcm4YASABKAkSEQoEcGF0aBgCIAEoCUgAiAEBEhEKBGdsb2IYAyABKAlIAYgBARIYCgtpZ25vcmVfY2FzZRgEIAEoCEgCiAEBEhQKB2xpdGVyYWwYBSABKAhIA4gBARIUCgdjb250ZXh0GAYgASgFSASIAQESEgoFbGltaXQYByABKAVIBYgBAUIHCgVfcGF0aEIHCgVfZ2xvYkIOCgxfaWdub3JlX2Nhc2VCCgoIX2xpdGVyYWxCCgoIX2NvbnRleHRCCAoGX2xpbWl0IrYBChFQaUdyZXBFeGVjU3VjY2VzcxIOCgZvdXRwdXQYASABKAkSLwoKdHJ1bmNhdGlvbhgCIAEoCzIWLmFnZW50LnYxLlBpVHJ1bmNhdGlvbkgAiAEBEiAKE21hdGNoX2xpbWl0X3JlYWNoZWQYAyABKA1IAYgBARIXCg9saW5lc190cnVuY2F0ZWQYBCABKAhCDQoLX3RydW5jYXRpb25CFgoUX21hdGNoX2xpbWl0X3JlYWNoZWQiIAoPUGlHcmVwRXhlY0Vycm9yEg0KBWVycm9yGAEgASgJIngKEFBpR3JlcEV4ZWNSZXN1bHQSLgoHc3VjY2VzcxgBIAEoCzIbLmFnZW50LnYxLlBpR3JlcEV4ZWNTdWNjZXNzSAASKgoFZXJyb3IYAiABKAsyGS5hZ2VudC52MS5QaUdyZXBFeGVjRXJyb3JIAEIICgZyZXN1bHQiWwoOUGlGaW5kRXhlY0FyZ3MSDwoHcGF0dGVybhgBIAEoCRIRCgRwYXRoGAIgASgJSACIAQESEgoFbGltaXQYAyABKAVIAYgBAUIHCgVfcGF0aEIICgZfbGltaXQinwEKEVBpRmluZEV4ZWNTdWNjZXNzEg4KBm91dHB1dBgBIAEoCRIvCgp0cnVuY2F0aW9uGAIgASgLMhYuYWdlbnQudjEuUGlUcnVuY2F0aW9uSACIAQESIQoUcmVzdWx0X2xpbWl0X3JlYWNoZWQYAyABKA1IAYgBAUINCgtfdHJ1bmNhdGlvbkIXChVfcmVzdWx0X2xpbWl0X3JlYWNoZWQiIAoPUGlGaW5kRXhlY0Vycm9yEg0KBWVycm9yGAEgASgJIngKEFBpRmluZEV4ZWNSZXN1bHQSLgoHc3VjY2VzcxgBIAEoCzIbLmFnZW50LnYxLlBpRmluZEV4ZWNTdWNjZXNzSAASKgoFZXJyb3IYAiABKAsyGS5hZ2VudC52MS5QaUZpbmRFeGVjRXJyb3JIAEIICgZyZXN1bHQiSAoMUGlMc0V4ZWNBcmdzEhEKBHBhdGgYASABKAlIAIgBARISCgVsaW1pdBgCIAEoBUgBiAEBQgcKBV9wYXRoQggKBl9saW1pdCKbAQoPUGlMc0V4ZWNTdWNjZXNzEg4KBm91dHB1dBgBIAEoCRIvCgp0cnVuY2F0aW9uGAIgASgLMhYuYWdlbnQudjEuUGlUcnVuY2F0aW9uSACIAQESIAoTZW50cnlfbGltaXRfcmVhY2hlZBgDIAEoDUgBiAEBQg0KC190cnVuY2F0aW9uQhYKFF9lbnRyeV9saW1pdF9yZWFjaGVkIh4KDVBpTHNFeGVjRXJyb3ISDQoFZXJyb3IYASABKAkicgoOUGlMc0V4ZWNSZXN1bHQSLAoHc3VjY2VzcxgBIAEoCzIZLmFnZW50LnYxLlBpTHNFeGVjU3VjY2Vzc0gAEigKBWVycm9yGAIgASgLMhcuYWdlbnQudjEuUGlMc0V4ZWNFcnJvckgAQggKBnJlc3VsdCI8ChFNY3BTZXJ2ZXJOb3RGb3VuZBIMCgRuYW1lGAEgASgJEhkKEWF2YWlsYWJsZV9zZXJ2ZXJzGAIgAygJIg0KC01jcEFwcHJvdmVkIkEKEE1jcFN0YXRlRXhlY0FyZ3MSGgoSc2VydmVyX2lkZW50aWZpZXJzGAEgAygJEhEKCWtpY2tfb25seRgCIAEoCCKHAgoOTWNwU3RhdGVTZXJ2ZXISEwoLc2VydmVyX25hbWUYASABKAkSGQoRc2VydmVyX2lkZW50aWZpZXIYAiABKAkSEwoGcGx1Z2luGAMgASgJSACIAQESGAoLbWFya2V0cGxhY2UYBCABKAlIAYgBARIqCgV0b29scxgFIAMoCzIbLmFnZW50LnYxLk1jcFRvb2xEZWZpbml0aW9uEi8KDGluc3RydWN0aW9ucxgGIAMoCzIZLmFnZW50LnYxLk1jcEluc3RydWN0aW9ucxITCgZzdGF0dXMYByABKAlIAogBAUIJCgdfcGx1Z2luQg4KDF9tYXJrZXRwbGFjZUIJCgdfc3RhdHVzIjwKD01jcFN0YXRlU3VjY2VzcxIpCgdzZXJ2ZXJzGAEgAygLMhguYWdlbnQudjEuTWNwU3RhdGVTZXJ2ZXIiHgoNTWNwU3RhdGVFcnJvchINCgVlcnJvchgBIAEoCSIiChBNY3BTdGF0ZVJlamVjdGVkEg4KBnJlYXNvbhgBIAEoCSKmAQoSTWNwU3RhdGVFeGVjUmVzdWx0EiwKB3N1Y2Nlc3MYASABKAsyGS5hZ2VudC52MS5NY3BTdGF0ZVN1Y2Nlc3NIABIoCgVlcnJvchgCIAEoCzIXLmFnZW50LnYxLk1jcFN0YXRlRXJyb3JIABIuCghyZWplY3RlZBgDIAEoCzIaLmFnZW50LnYxLk1jcFN0YXRlUmVqZWN0ZWRIAEIICgZyZXN1bHQirQEKKUNvbW1hbmRDbGFzc2lmaWVyUmVzdWx0X0NsYXNzaWZpZWRDb21tYW5kEgwKBG5hbWUYASABKAkSEQoJYXJndW1lbnRzGAIgAygJEiYKGXN1Z2dlc3RlZF9hbGxvd2xpc3RfZW50cnkYAyABKAlIAIgBARIZChFzdWJjb21tYW5kX3Rva2VucxgEIAMoCUIcChpfc3VnZ2VzdGVkX2FsbG93bGlzdF9lbnRyeSLXAQoXQ29tbWFuZENsYXNzaWZpZXJSZXN1bHQSRQoIY29tbWFuZHMYASADKAsyMy5hZ2VudC52MS5Db21tYW5kQ2xhc3NpZmllclJlc3VsdF9DbGFzc2lmaWVkQ29tbWFuZBJWChZzdWdnZXN0ZWRfc2FuZGJveF9tb2RlGAIgASgOMjYuYWdlbnQudjEuQ29tbWFuZENsYXNzaWZpZXJSZXN1bHRfU3VnZ2VzdGVkU2FuZGJveE1vZGUSHQoVY2xhc3NpZmljYXRpb25fZmFpbGVkGAMgASgIIpMBCiJTaGVsbENvbW1hbmRQYXJzaW5nUmVzdWx0X1JlZGlyZWN0EhAKCG9wZXJhdG9yGAEgASgJEhcKD2Rlc3RpbmF0aW9uX2ZkcxgCIAMoDRIYChB0YXJnZXRfbm9kZV90eXBlGAMgASgJEhgKC3RhcmdldF90ZXh0GAQgASgJSACIAQFCDgoMX3RhcmdldF90ZXh0IooCChpTaGVsbEFsbG93bGlzdFByZWNoZWNrQXJncxIPCgdjb21tYW5kGAEgASgJEhkKEXdvcmtpbmdfZGlyZWN0b3J5GAIgASgJEjsKDnBhcnNpbmdfcmVzdWx0GAMgASgLMiMuYWdlbnQudjEuU2hlbGxDb21tYW5kUGFyc2luZ1Jlc3VsdBJBChFjbGFzc2lmaWVyX3Jlc3VsdBgEIAEoCzIhLmFnZW50LnYxLkNvbW1hbmRDbGFzc2lmaWVyUmVzdWx0SACIAQESGQoMdG9vbF9jYWxsX2lkGAUgASgJSAGIAQFCFAoSX2NsYXNzaWZpZXJfcmVzdWx0Qg8KDV90b29sX2NhbGxfaWQiMwocU2hlbGxBbGxvd2xpc3RQcmVjaGVja1Jlc3VsdBITCgthbGxvd2xpc3RlZBgBIAEoCCJ2ChhNY3BBbGxvd2xpc3RQcmVjaGVja0FyZ3MSGwoTcHJvdmlkZXJfaWRlbnRpZmllchgBIAEoCRIRCgl0b29sX25hbWUYAiABKAkSGQoMdG9vbF9jYWxsX2lkGAMgASgJSACIAQFCDwoNX3Rvb2xfY2FsbF9pZCIxChpNY3BBbGxvd2xpc3RQcmVjaGVja1Jlc3VsdBITCgthbGxvd2xpc3RlZBgBIAEoCCJYCh1XZWJGZXRjaEFsbG93bGlzdFByZWNoZWNrQXJncxILCgN1cmwYASABKAkSGQoMdG9vbF9jYWxsX2lkGAIgASgJSACIAQFCDwoNX3Rvb2xfY2FsbF9pZCI2Ch9XZWJGZXRjaEFsbG93bGlzdFByZWNoZWNrUmVzdWx0EhMKC2FsbG93bGlzdGVkGAEgASgIIjcKEVNtYXJ0TW9kZUFwcHJvdmFsEhIKCnJlcXVlc3RfaWQYASABKAkSDgoGcmVhc29uGAIgASgJIpwBCh1TaGVsbE91dHB1dE5vdGlmaWNhdGlvbkNvbmZpZxIPCgdwYXR0ZXJuGAEgASgJEg4KBnJlYXNvbhgCIAEoCRIVCghkZWJvdW5jZRgDIAEoAUgAiAEBEh8KEm5vdGlmaWNhdGlvbl9saW1pdBgEIAEoBUgBiAEBQgsKCV9kZWJvdW5jZUIVChNfbm90aWZpY2F0aW9uX2xpbWl0InkKHFNoZWxsSG9va0FwcHJvdmFsUmVxdWlyZW1lbnQSOQoEa2luZBgBIAEoDjIrLmFnZW50LnYxLlNoZWxsSG9va0FwcHJvdmFsUmVxdWlyZW1lbnRfS2luZBITCgZyZWFzb24YAiABKAlIAIgBAUIJCgdfcmVhc29uIjAKGEZvcmNlQmFja2dyb3VuZFNoZWxsQXJncxIUCgx0b29sX2NhbGxfaWQYASABKAkilQEKGkZvcmNlQmFja2dyb3VuZFNoZWxsUmVzdWx0EjQKBnN0YXR1cxgBIAEoDjIkLmFnZW50LnYxLkZvcmNlQmFja2dyb3VuZFNoZWxsU3RhdHVzEjAKDHNoZWxsX3Jlc3VsdBgCIAEoCzIVLmFnZW50LnYxLlNoZWxsUmVzdWx0SACIAQFCDwoNX3NoZWxsX3Jlc3VsdCJBChVIb29rQWRkaXRpb25hbENvbnRleHQSFwoPaG9va19ldmVudF9uYW1lGAEgASgJEg8KB2NvbnRlbnQYAiABKAkiWwoWU2hlbGxTdHJlYW1Ib29rQ29udGV4dBJBChhob29rX2FkZGl0aW9uYWxfY29udGV4dHMYASADKAsyHy5hZ2VudC52MS5Ib29rQWRkaXRpb25hbENvbnRleHQiSwoMU3ViYWdlbnRBcmdzEhQKDHRvb2xfY2FsbF9pZBgBIAEoCRIVCg1zdWJhZ2VudF90eXBlGAIgASgJEg4KBnByb21wdBgEIAEoCSLbAQoPU3ViYWdlbnRTdWNjZXNzEhAKCGFnZW50X2lkGAEgASgJEhoKDWZpbmFsX21lc3NhZ2UYAiABKAlIAIgBARIXCg90b29sX2NhbGxfY291bnQYAyABKAUSPQoRYmFja2dyb3VuZF9yZWFzb24YBCABKA4yIi5hZ2VudC52MS5TdWJhZ2VudEJhY2tncm91bmRSZWFzb24SHAoPdHJhbnNjcmlwdF9wYXRoGAUgASgJSAGIAQFCEAoOX2ZpbmFsX21lc3NhZ2VCEgoQX3RyYW5zY3JpcHRfcGF0aCJCCg1TdWJhZ2VudEVycm9yEhUKCGFnZW50X2lkGAEgASgJSACIAQESDQoFZXJyb3IYAiABKAlCCwoJX2FnZW50X2lkInIKDlN1YmFnZW50UmVzdWx0EiwKB3N1Y2Nlc3MYASABKAsyGS5hZ2VudC52MS5TdWJhZ2VudFN1Y2Nlc3NIABIoCgVlcnJvchgCIAEoCzIXLmFnZW50LnYxLlN1YmFnZW50RXJyb3JIAEIICgZyZXN1bHQiOQoRU3ViYWdlbnRBd2FpdEFyZ3MSEAoIYWdlbnRfaWQYASABKAkSEgoKdGltZW91dF9tcxgCIAEoDSKiAQoVU3ViYWdlbnRBd2FpdENvbXBsZXRlEhAKCGFnZW50X2lkGAEgASgJEhwKD3RyYW5zY3JpcHRfcGF0aBgCIAEoCUgAiAEBEhcKD3Rvb2xfY2FsbF9jb3VudBgDIAEoBRIaCg1maW5hbF9tZXNzYWdlGAQgASgJSAGIAQFCEgoQX3RyYW5zY3JpcHRfcGF0aEIQCg5fZmluYWxfbWVzc2FnZSJfChlTdWJhZ2VudEF3YWl0U3RpbGxSdW5uaW5nEhAKCGFnZW50X2lkGAEgASgJEhwKD3RyYW5zY3JpcHRfcGF0aBgCIAEoCUgAiAEBQhIKEF90cmFuc2NyaXB0X3BhdGgiKQoVU3ViYWdlbnRBd2FpdE5vdEZvdW5kEhAKCGFnZW50X2lkGAEgASgJIkcKElN1YmFnZW50QXdhaXRFcnJvchIVCghhZ2VudF9pZBgBIAEoCUgAiAEBEg0KBWVycm9yGAIgASgJQgsKCV9hZ2VudF9pZCL3AQoTU3ViYWdlbnRBd2FpdFJlc3VsdBIzCghjb21wbGV0ZRgBIAEoCzIfLmFnZW50LnYxLlN1YmFnZW50QXdhaXRDb21wbGV0ZUgAEjwKDXN0aWxsX3J1bm5pbmcYAiABKAsyIy5hZ2VudC52MS5TdWJhZ2VudEF3YWl0U3RpbGxSdW5uaW5nSAASNAoJbm90X2ZvdW5kGAMgASgLMh8uYWdlbnQudjEuU3ViYWdlbnRBd2FpdE5vdEZvdW5kSAASLQoFZXJyb3IYBCABKAsyHC5hZ2VudC52MS5TdWJhZ2VudEF3YWl0RXJyb3JIAEIICgZyZXN1bHQiMwobRm9yY2VCYWNrZ3JvdW5kU3ViYWdlbnRBcmdzEhQKDHRvb2xfY2FsbF9pZBgBIAEoCSJYCh1Gb3JjZUJhY2tncm91bmRTdWJhZ2VudFJlc3VsdBI3CgZzdGF0dXMYASABKA4yJy5hZ2VudC52MS5Gb3JjZUJhY2tncm91bmRTdWJhZ2VudFN0YXR1cyIYChZQcmVDb21wYWN0UmVxdWVzdFF1ZXJ5IhsKGVN1YmFnZW50U3RhcnRSZXF1ZXN0UXVlcnkiGgoYU3ViYWdlbnRTdG9wUmVxdWVzdFF1ZXJ5IhgKFlByZVRvb2xVc2VSZXF1ZXN0UXVlcnkiGQoXUG9zdFRvb2xVc2VSZXF1ZXN0UXVlcnkiIAoeUG9zdFRvb2xVc2VGYWlsdXJlUmVxdWVzdFF1ZXJ5IiAKHkJlZm9yZVN1Ym1pdFByb21wdFJlcXVlc3RRdWVyeSIgCh5BZnRlckFnZW50UmVzcG9uc2VSZXF1ZXN0UXVlcnkiHwodQWZ0ZXJBZ2VudFRob3VnaHRSZXF1ZXN0UXVlcnkiEgoQU3RvcFJlcXVlc3RRdWVyeSJHChlQcmVDb21wYWN0UmVxdWVzdFJlc3BvbnNlEhkKDHVzZXJfbWVzc2FnZRgBIAEoCUgAiAEBQg8KDV91c2VyX21lc3NhZ2UiqgEKHFN1YmFnZW50U3RhcnRSZXF1ZXN0UmVzcG9uc2USFwoKcGVybWlzc2lvbhgBIAEoCUgAiAEBEhkKDHVzZXJfbWVzc2FnZRgCIAEoCUgBiAEBEh8KEmFkZGl0aW9uYWxfY29udGV4dBgDIAEoCUgCiAEBQg0KC19wZXJtaXNzaW9uQg8KDV91c2VyX21lc3NhZ2VCFQoTX2FkZGl0aW9uYWxfY29udGV4dCKJAQobU3ViYWdlbnRTdG9wUmVxdWVzdFJlc3BvbnNlEh0KEGZvbGxvd3VwX21lc3NhZ2UYASABKAlIAIgBARIfChJhZGRpdGlvbmFsX2NvbnRleHQYAiABKAlIAYgBAUITChFfZm9sbG93dXBfbWVzc2FnZUIVChNfYWRkaXRpb25hbF9jb250ZXh0IoMCChlQcmVUb29sVXNlUmVxdWVzdFJlc3BvbnNlEhcKCnBlcm1pc3Npb24YASABKAlIAIgBARIZCgx1c2VyX21lc3NhZ2UYAiABKAlIAYgBARIaCg1hZ2VudF9tZXNzYWdlGAMgASgJSAKIAQESGgoNdXBkYXRlZF9pbnB1dBgEIAEoCUgDiAEBEh8KEmFkZGl0aW9uYWxfY29udGV4dBgFIAEoCUgEiAEBQg0KC19wZXJtaXNzaW9uQg8KDV91c2VyX21lc3NhZ2VCEAoOX2FnZW50X21lc3NhZ2VCEAoOX3VwZGF0ZWRfaW5wdXRCFQoTX2FkZGl0aW9uYWxfY29udGV4dCJUChpQb3N0VG9vbFVzZVJlcXVlc3RSZXNwb25zZRIfChJhZGRpdGlvbmFsX2NvbnRleHQYASABKAlIAIgBAUIVChNfYWRkaXRpb25hbF9jb250ZXh0IlsKIVBvc3RUb29sVXNlRmFpbHVyZVJlcXVlc3RSZXNwb25zZRIfChJhZGRpdGlvbmFsX2NvbnRleHQYASABKAlIAIgBAUIVChNfYWRkaXRpb25hbF9jb250ZXh0IqsBCiFCZWZvcmVTdWJtaXRQcm9tcHRSZXF1ZXN0UmVzcG9uc2USFQoIY29udGludWUYASABKAhIAIgBARIZCgx1c2VyX21lc3NhZ2UYAiABKAlIAYgBARIfChJhZGRpdGlvbmFsX2NvbnRleHQYAyABKAlIAogBAUILCglfY29udGludWVCDwoNX3VzZXJfbWVzc2FnZUIVChNfYWRkaXRpb25hbF9jb250ZXh0IiMKIUFmdGVyQWdlbnRSZXNwb25zZVJlcXVlc3RSZXNwb25zZSIiCiBBZnRlckFnZW50VGhvdWdodFJlcXVlc3RSZXNwb25zZSJJChNTdG9wUmVxdWVzdFJlc3BvbnNlEh0KEGZvbGxvd3VwX21lc3NhZ2UYASABKAlIAIgBAUITChFfZm9sbG93dXBfbWVzc2FnZSKdBQoSRXhlY3V0ZUhvb2tSZXF1ZXN0EjcKC3ByZV9jb21wYWN0GAEgASgLMiAuYWdlbnQudjEuUHJlQ29tcGFjdFJlcXVlc3RRdWVyeUgAEj0KDnN1YmFnZW50X3N0YXJ0GAIgASgLMiMuYWdlbnQudjEuU3ViYWdlbnRTdGFydFJlcXVlc3RRdWVyeUgAEjsKDXN1YmFnZW50X3N0b3AYAyABKAsyIi5hZ2VudC52MS5TdWJhZ2VudFN0b3BSZXF1ZXN0UXVlcnlIABI4CgxwcmVfdG9vbF91c2UYBCABKAsyIC5hZ2VudC52MS5QcmVUb29sVXNlUmVxdWVzdFF1ZXJ5SAASOgoNcG9zdF90b29sX3VzZRgFIAEoCzIhLmFnZW50LnYxLlBvc3RUb29sVXNlUmVxdWVzdFF1ZXJ5SAASSQoVcG9zdF90b29sX3VzZV9mYWlsdXJlGAYgASgLMiguYWdlbnQudjEuUG9zdFRvb2xVc2VGYWlsdXJlUmVxdWVzdFF1ZXJ5SAASSAoUYmVmb3JlX3N1Ym1pdF9wcm9tcHQYByABKAsyKC5hZ2VudC52MS5CZWZvcmVTdWJtaXRQcm9tcHRSZXF1ZXN0UXVlcnlIABJIChRhZnRlcl9hZ2VudF9yZXNwb25zZRgIIAEoCzIoLmFnZW50LnYxLkFmdGVyQWdlbnRSZXNwb25zZVJlcXVlc3RRdWVyeUgAEkYKE2FmdGVyX2FnZW50X3Rob3VnaHQYCSABKAsyJy5hZ2VudC52MS5BZnRlckFnZW50VGhvdWdodFJlcXVlc3RRdWVyeUgAEioKBHN0b3AYCyABKAsyGi5hZ2VudC52MS5TdG9wUmVxdWVzdFF1ZXJ5SABCCQoHcmVxdWVzdCK9BQoTRXhlY3V0ZUhvb2tSZXNwb25zZRI6CgtwcmVfY29tcGFjdBgBIAEoCzIjLmFnZW50LnYxLlByZUNvbXBhY3RSZXF1ZXN0UmVzcG9uc2VIABJACg5zdWJhZ2VudF9zdGFydBgCIAEoCzImLmFnZW50LnYxLlN1YmFnZW50U3RhcnRSZXF1ZXN0UmVzcG9uc2VIABI+Cg1zdWJhZ2VudF9zdG9wGAMgASgLMiUuYWdlbnQudjEuU3ViYWdlbnRTdG9wUmVxdWVzdFJlc3BvbnNlSAASOwoMcHJlX3Rvb2xfdXNlGAQgASgLMiMuYWdlbnQudjEuUHJlVG9vbFVzZVJlcXVlc3RSZXNwb25zZUgAEj0KDXBvc3RfdG9vbF91c2UYBSABKAsyJC5hZ2VudC52MS5Qb3N0VG9vbFVzZVJlcXVlc3RSZXNwb25zZUgAEkwKFXBvc3RfdG9vbF91c2VfZmFpbHVyZRgGIAEoCzIrLmFnZW50LnYxLlBvc3RUb29sVXNlRmFpbHVyZVJlcXVlc3RSZXNwb25zZUgAEksKFGJlZm9yZV9zdWJtaXRfcHJvbXB0GAcgASgLMisuYWdlbnQudjEuQmVmb3JlU3VibWl0UHJvbXB0UmVxdWVzdFJlc3BvbnNlSAASSwoUYWZ0ZXJfYWdlbnRfcmVzcG9uc2UYCCABKAsyKy5hZ2VudC52MS5BZnRlckFnZW50UmVzcG9uc2VSZXF1ZXN0UmVzcG9uc2VIABJJChNhZnRlcl9hZ2VudF90aG91Z2h0GAkgASgLMiouYWdlbnQudjEuQWZ0ZXJBZ2VudFRob3VnaHRSZXF1ZXN0UmVzcG9uc2VIABItCgRzdG9wGAsgASgLMh0uYWdlbnQudjEuU3RvcFJlcXVlc3RSZXNwb25zZUgAQgoKCHJlc3BvbnNlIkAKD0V4ZWN1dGVIb29rQXJncxItCgdyZXF1ZXN0GAEgASgLMhwuYWdlbnQudjEuRXhlY3V0ZUhvb2tSZXF1ZXN0IkQKEUV4ZWN1dGVIb29rUmVzdWx0Ei8KCHJlc3BvbnNlGAEgASgLMh0uYWdlbnQudjEuRXhlY3V0ZUhvb2tSZXNwb25zZSIlChNTbWFydE1vZGVSaXNrVGFyZ2V0Eg4KBmFjdGlvbhgBIAEoCSJHCiZTbWFydE1vZGVDbGFzc2lmaWVyQ29udmVyc2F0aW9uTWVzc2FnZRIMCgRyb2xlGAEgASgJEg8KB2NvbnRlbnQYAiABKAki7gEKF1NtYXJ0TW9kZUNsYXNzaWZpZXJBcmdzEhQKDHRvb2xfY2FsbF9pZBgBIAEoCRIjChZwYXJlbnRfY29udmVyc2F0aW9uX2lkGAIgASgJSACIAQESLQoGdGFyZ2V0GAMgASgLMh0uYWdlbnQudjEuU21hcnRNb2RlUmlza1RhcmdldBJOChRjb252ZXJzYXRpb25fY29udGV4dBgEIAMoCzIwLmFnZW50LnYxLlNtYXJ0TW9kZUNsYXNzaWZpZXJDb252ZXJzYXRpb25NZXNzYWdlQhkKF19wYXJlbnRfY29udmVyc2F0aW9uX2lkIoEBChpTbWFydE1vZGVDbGFzc2lmaWVyU3VjY2VzcxI3CghkZWNpc2lvbhgBIAEoDjIlLmFnZW50LnYxLlNtYXJ0TW9kZUNsYXNzaWZpZXJEZWNpc2lvbhIZCgxibG9ja19yZWFzb24YAiABKAlIAIgBAUIPCg1fYmxvY2tfcmVhc29uIikKGFNtYXJ0TW9kZUNsYXNzaWZpZXJFcnJvchINCgVlcnJvchgBIAEoCSKTAQoZU21hcnRNb2RlQ2xhc3NpZmllclJlc3VsdBI3CgdzdWNjZXNzGAEgASgLMiQuYWdlbnQudjEuU21hcnRNb2RlQ2xhc3NpZmllclN1Y2Nlc3NIABIzCgVlcnJvchgCIAEoCzIiLmFnZW50LnYxLlNtYXJ0TW9kZUNsYXNzaWZpZXJFcnJvckgAQggKBnJlc3VsdCI7ChVDYW52YXNEaWFnbm9zdGljc0FyZ3MSDAoEcGF0aBgBIAEoCRIUCgx0b29sX2NhbGxfaWQYAiABKAkiUwoYQ2FudmFzRGlhZ25vc3RpY3NTdWNjZXNzEgwKBHBhdGgYASABKAkSKQoLZGlhZ25vc3RpY3MYAiADKAsyFC5hZ2VudC52MS5EaWFnbm9zdGljIjUKFkNhbnZhc0RpYWdub3N0aWNzRXJyb3ISDAoEcGF0aBgBIAEoCRINCgVlcnJvchgCIAEoCSKNAQoXQ2FudmFzRGlhZ25vc3RpY3NSZXN1bHQSNQoHc3VjY2VzcxgBIAEoCzIiLmFnZW50LnYxLkNhbnZhc0RpYWdub3N0aWNzU3VjY2Vzc0gAEjEKBWVycm9yGAIgASgLMiAuYWdlbnQudjEuQ2FudmFzRGlhZ25vc3RpY3NFcnJvckgAQggKBnJlc3VsdCKsAQoVQ29udmVyc2F0aW9uU2VhcmNoSGl0EhcKD2NvbnZlcnNhdGlvbl9pZBgBIAEoCRINCgV0aXRsZRgCIAEoCRIyCgZzb3VyY2UYAyABKA4yIi5hZ2VudC52MS5Db252ZXJzYXRpb25TZWFyY2hTb3VyY2USFQoNdXBkYXRlZF9hdF9tcxgEIAEoAxIUCgdzbmlwcGV0GAUgASgJSACIAQFCCgoIX3NuaXBwZXQiggEKGUNvbnZlcnNhdGlvblNlYXJjaFN1Y2Nlc3MSLQoEaGl0cxgBIAMoCzIfLmFnZW50LnYxLkNvbnZlcnNhdGlvblNlYXJjaEhpdBIRCgl0cnVuY2F0ZWQYAiABKAgSDwoHcGFydGlhbBgDIAEoCBISCgpyZWJ1aWxkaW5nGAQgASgIIigKF0NvbnZlcnNhdGlvblNlYXJjaEVycm9yEg0KBWVycm9yGAEgASgJIlsKFkNvbnZlcnNhdGlvblNlYXJjaEFyZ3MSDQoFcXVlcnkYASABKAkSFAoMdG9vbF9jYWxsX2lkGAIgASgJEhIKBWxpbWl0GAMgASgFSACIAQFCCAoGX2xpbWl0IpABChhDb252ZXJzYXRpb25TZWFyY2hSZXN1bHQSNgoHc3VjY2VzcxgBIAEoCzIjLmFnZW50LnYxLkNvbnZlcnNhdGlvblNlYXJjaFN1Y2Nlc3NIABIyCgVlcnJvchgCIAEoCzIhLmFnZW50LnYxLkNvbnZlcnNhdGlvblNlYXJjaEVycm9ySABCCAoGcmVzdWx0IlUKGEFnZW50U3RvcmVDb25mbGljdEN1cnNvchIVCg1qb3VybmFsX2Vwb2NoGAEgASgJEgsKA3NlcRgCIAEoBBIVCg1sYXN0X2V2ZW50X2lkGAMgASgJIqUDChdBZ2VudFN0b3JlQ29uZmxpY3RFdmVudBIJCgF2GAEgASgNEhAKCGV2ZW50X2lkGAIgASgJEhUKDWpvdXJuYWxfZXBvY2gYAyABKAkSCwoDc2VxGAQgASgEEg0KBXRzX21zGAUgASgEEgwKBGtpbmQYBiABKAkSFQoIc3RvcmVfaWQYByABKAlIAIgBARIeChFvcmlnaW5hbF9yZWxfcGF0aBgIIAEoCUgBiAEBEh4KEWNvbmZsaWN0X3JlbF9wYXRoGAkgASgJSAKIAQESHgoRb3JpZ2luYWxfYWJzX3BhdGgYCiABKAlIA4gBARIeChFjb25mbGljdF9hYnNfcGF0aBgLIAEoCUgEiAEBEhwKD3ByZXNlcnZlZF9ieXRlcxgMIAEoBEgFiAEBQgsKCV9zdG9yZV9pZEIUChJfb3JpZ2luYWxfcmVsX3BhdGhCFAoSX2NvbmZsaWN0X3JlbF9wYXRoQhQKEl9vcmlnaW5hbF9hYnNfcGF0aEIUChJfY29uZmxpY3RfYWJzX3BhdGhCEgoQX3ByZXNlcnZlZF9ieXRlcyKUAQoZQWdlbnRTdG9yZUNvbmZsaWN0U3VjY2VzcxIxCgZldmVudHMYASADKAsyIS5hZ2VudC52MS5BZ2VudFN0b3JlQ29uZmxpY3RFdmVudBI3CgtuZXh0X2N1cnNvchgCIAEoCzIiLmFnZW50LnYxLkFnZW50U3RvcmVDb25mbGljdEN1cnNvchILCgNnYXAYAyABKAgiKAoXQWdlbnRTdG9yZUNvbmZsaWN0RXJyb3ISDQoFZXJyb3IYASABKAkifgoWQWdlbnRTdG9yZUNvbmZsaWN0QXJncxI3CgZjdXJzb3IYASABKAsyIi5hZ2VudC52MS5BZ2VudFN0b3JlQ29uZmxpY3RDdXJzb3JIAIgBARIUCgdhZHZhbmNlGAIgASgISAGIAQFCCQoHX2N1cnNvckIKCghfYWR2YW5jZSKQAQoYQWdlbnRTdG9yZUNvbmZsaWN0UmVzdWx0EjYKB3N1Y2Nlc3MYASABKAsyIy5hZ2VudC52MS5BZ2VudFN0b3JlQ29uZmxpY3RTdWNjZXNzSAASMgoFZXJyb3IYAiABKAsyIS5hZ2VudC52MS5BZ2VudFN0b3JlQ29uZmxpY3RFcnJvckgAQggKBnJlc3VsdCJ8Cg5GaWxlRGlmZl9DaHVuaxIPCgdjb250ZW50GAEgASgJEg0KBWxpbmVzGAIgAygJEhEKCW9sZF9zdGFydBgDIAEoBRIRCglvbGRfbGluZXMYBCABKAUSEQoJbmV3X3N0YXJ0GAUgASgFEhEKCW5ld19saW5lcxgGIAEoBSKQAgoIRmlsZURpZmYSDQoFYWRkZWQYBCABKAUSDwoHcmVtb3ZlZBgFIAEoBRIMCgRmcm9tGAEgASgJEgoKAnRvGAIgASgJEigKBmNodW5rcxgDIAMoCzIYLmFnZW50LnYxLkZpbGVEaWZmX0NodW5rEiEKFGJlZm9yZV9maWxlX2NvbnRlbnRzGAYgASgJSACIAQESIAoTYWZ0ZXJfZmlsZV9jb250ZW50cxgHIAEoCUgBiAEBEhkKDGlzX2dlbmVyYXRlZBgIIAEoCEgCiAEBQhcKFV9iZWZvcmVfZmlsZV9jb250ZW50c0IWChRfYWZ0ZXJfZmlsZV9jb250ZW50c0IPCg1faXNfZ2VuZXJhdGVkIlsKB0dpdERpZmYSIQoFZGlmZnMYASADKAsyEi5hZ2VudC52MS5GaWxlRGlmZhItCglkaWZmX3R5cGUYAiABKA4yGi5hZ2VudC52MS5HaXREaWZmX0RpZmZUeXBlImgKHUdldERpZmZSZXNwb25zZV9TdWJtb2R1bGVEaWZmEhUKDXJlbGF0aXZlX3BhdGgYASABKAkSHwoEZGlmZhgCIAEoCzIRLmFnZW50LnYxLkdpdERpZmYSDwoHZXJyb3JlZBgDIAEoCCLyAwoOR2V0RGlmZlJlcXVlc3QSCwoDY3dkGAEgASgJEgsKA3JlZhgCIAEoCRIQCghiYXNlX3JlZhgDIAEoCRISCgptZXJnZV9iYXNlGAQgASgIEhQKDHRhcmdldF9wYXRocxgFIAMoCRIiChV1bmlmaWVkX2NvbnRleHRfbGluZXMYBiABKAVIAIgBARIbChNtYXhfdW50cmFja2VkX2ZpbGVzGAcgASgFEh8KF3N1Ym1vZHVsZV9yZWN1cnNlX2RlcHRoGAkgASgFEh0KFWluY2x1ZGVfc3BhY2VfY2hhbmdlcxgKIAEoCBIWCg5jb21taXR0ZWRfb25seRgLIAEoCBIYChBjb21wdXRlX3BhdGNoX2lkGAwgASgIEhwKD3JldHVybl9oZWFkX3NoYRgNIAEoCEgBiAEBEh8KEm1heF9yZXNwb25zZV9ieXRlcxgOIAEoBUgCiAEBEkEKDW91dHB1dF9mb3JtYXQYCCABKA4yJS5hZ2VudC52MS5HZXREaWZmUmVxdWVzdF9PdXRwdXRGb3JtYXRIA4gBAUIYChZfdW5pZmllZF9jb250ZXh0X2xpbmVzQhIKEF9yZXR1cm5faGVhZF9zaGFCFQoTX21heF9yZXNwb25zZV9ieXRlc0IQCg5fb3V0cHV0X2Zvcm1hdCL+AQoPR2V0RGlmZlJlc3BvbnNlEh8KBGRpZmYYASABKAsyES5hZ2VudC52MS5HaXREaWZmEkAKD3N1Ym1vZHVsZV9kaWZmcxgCIAMoCzInLmFnZW50LnYxLkdldERpZmZSZXNwb25zZV9TdWJtb2R1bGVEaWZmEhUKCHBhdGNoX2lkGAMgASgJSACIAQESFQoIaGVhZF9zaGEYBCABKAlIAYgBARIkChdoYXNfdW5jb21taXR0ZWRfY2hhbmdlcxgFIAEoCEgCiAEBQgsKCV9wYXRjaF9pZEILCglfaGVhZF9zaGFCGgoYX2hhc191bmNvbW1pdHRlZF9jaGFuZ2VzImQKDlBpUmVhZFRvb2xDYWxsEiYKBGFyZ3MYASABKAsyGC5hZ2VudC52MS5QaVJlYWRFeGVjQXJncxIqCgZyZXN1bHQYAiABKAsyGi5hZ2VudC52MS5QaVJlYWRFeGVjUmVzdWx0ImQKDlBpQmFzaFRvb2xDYWxsEiYKBGFyZ3MYASABKAsyGC5hZ2VudC52MS5QaUJhc2hFeGVjQXJncxIqCgZyZXN1bHQYAiABKAsyGi5hZ2VudC52MS5QaUJhc2hFeGVjUmVzdWx0ImQKDlBpRWRpdFRvb2xDYWxsEiYKBGFyZ3MYASABKAsyGC5hZ2VudC52MS5QaUVkaXRFeGVjQXJncxIqCgZyZXN1bHQYAiABKAsyGi5hZ2VudC52MS5QaUVkaXRFeGVjUmVzdWx0ImcKD1BpV3JpdGVUb29sQ2FsbBInCgRhcmdzGAEgASgLMhkuYWdlbnQudjEuUGlXcml0ZUV4ZWNBcmdzEisKBnJlc3VsdBgCIAEoCzIbLmFnZW50LnYxLlBpV3JpdGVFeGVjUmVzdWx0ImQKDlBpR3JlcFRvb2xDYWxsEiYKBGFyZ3MYASABKAsyGC5hZ2VudC52MS5QaUdyZXBFeGVjQXJncxIqCgZyZXN1bHQYAiABKAsyGi5hZ2VudC52MS5QaUdyZXBFeGVjUmVzdWx0ImQKDlBpRmluZFRvb2xDYWxsEiYKBGFyZ3MYASABKAsyGC5hZ2VudC52MS5QaUZpbmRFeGVjQXJncxIqCgZyZXN1bHQYAiABKAsyGi5hZ2VudC52MS5QaUZpbmRFeGVjUmVzdWx0Il4KDFBpTHNUb29sQ2FsbBIkCgRhcmdzGAEgASgLMhYuYWdlbnQudjEuUGlMc0V4ZWNBcmdzEigKBnJlc3VsdBgCIAEoCzIYLmFnZW50LnYxLlBpTHNFeGVjUmVzdWx0IoEBChtTZWFyY2hDb252ZXJzYXRpb25zVG9vbENhbGwSLgoEYXJncxgBIAEoCzIgLmFnZW50LnYxLkNvbnZlcnNhdGlvblNlYXJjaEFyZ3MSMgoGcmVzdWx0GAIgASgLMiIuYWdlbnQudjEuQ29udmVyc2F0aW9uU2VhcmNoUmVzdWx0IjkKGkNvbm5lY3RTY21HaXRodWJSZXBvc2l0b3J5Eg0KBW93bmVyGAEgASgJEgwKBHJlcG8YAiABKAkifgoQQ29ubmVjdFNjbUdpdGh1YhI4CgpyZXBvc2l0b3J5GAEgASgLMiQuYWdlbnQudjEuQ29ubmVjdFNjbUdpdGh1YlJlcG9zaXRvcnkSHAoPZ2hlX2FwcGxpY2F0aW9uGAIgASgJSACIAQFCEgoQX2doZV9hcHBsaWNhdGlvbiJeCg5Db25uZWN0U2NtQXJncxIUCgx0b29sX2NhbGxfaWQYASABKAkSLAoGZ2l0aHViGAIgASgLMhouYWdlbnQudjEuQ29ubmVjdFNjbUdpdGh1YkgAQggKBnRhcmdldCITChFDb25uZWN0U2NtU3VjY2VzcyIgCg9Db25uZWN0U2NtRXJyb3ISDQoFZXJyb3IYASABKAkiJAoSQ29ubmVjdFNjbVJlamVjdGVkEg4KBnJlYXNvbhgBIAEoCSKqAQoQQ29ubmVjdFNjbVJlc3VsdBIuCgdzdWNjZXNzGAEgASgLMhsuYWdlbnQudjEuQ29ubmVjdFNjbVN1Y2Nlc3NIABIqCgVlcnJvchgCIAEoCzIZLmFnZW50LnYxLkNvbm5lY3RTY21FcnJvckgAEjAKCHJlamVjdGVkGAMgASgLMhwuYWdlbnQudjEuQ29ubmVjdFNjbVJlamVjdGVkSABCCAoGcmVzdWx0ImgKEkNvbm5lY3RTY21Ub29sQ2FsbBImCgRhcmdzGAEgASgLMhguYWdlbnQudjEuQ29ubmVjdFNjbUFyZ3MSKgoGcmVzdWx0GAIgASgLMhouYWdlbnQudjEuQ29ubmVjdFNjbVJlc3VsdCqIAQodQXBwbGllZEFnZW50Q2hhbmdlX0NoYW5nZVR5cGUSGwoXQ0hBTkdFX1RZUEVfVU5TUEVDSUZJRUQQABIXChNDSEFOR0VfVFlQRV9DUkVBVEVEEAESGAoUQ0hBTkdFX1RZUEVfTU9ESUZJRUQQAhIXChNDSEFOR0VfVFlQRV9ERUxFVEVEEAMqpAEKC01vdXNlQnV0dG9uEhwKGE1PVVNFX0JVVFRPTl9VTlNQRUNJRklFRBAAEhUKEU1PVVNFX0JVVFRPTl9MRUZUEAESFgoSTU9VU0VfQlVUVE9OX1JJR0hUEAISFwoTTU9VU0VfQlVUVE9OX01JRERMRRADEhUKEU1PVVNFX0JVVFRPTl9CQUNLEAQSGAoUTU9VU0VfQlVUVE9OX0ZPUldBUkQQBSqeAQoPU2Nyb2xsRGlyZWN0aW9uEiAKHFNDUk9MTF9ESVJFQ1RJT05fVU5TUEVDSUZJRUQQABIXChNTQ1JPTExfRElSRUNUSU9OX1VQEAESGQoVU0NST0xMX0RJUkVDVElPTl9ET1dOEAISGQoVU0NST0xMX0RJUkVDVElPTl9MRUZUEAMSGgoWU0NST0xMX0RJUkVDVElPTl9SSUdIVBAEKnAKEEN1cnNvclJ1bGVTb3VyY2USIgoeQ1VSU09SX1JVTEVfU09VUkNFX1VOU1BFQ0lGSUVEEAASGwoXQ1VSU09SX1JVTEVfU09VUkNFX1RFQU0QARIbChdDVVJTT1JfUlVMRV9TT1VSQ0VfVVNFUhACKrwBChJEaWFnbm9zdGljU2V2ZXJpdHkSIwofRElBR05PU1RJQ19TRVZFUklUWV9VTlNQRUNJRklFRBAAEh0KGURJQUdOT1NUSUNfU0VWRVJJVFlfRVJST1IQARIfChtESUFHTk9TVElDX1NFVkVSSVRZX1dBUk5JTkcQAhIjCh9ESUFHTk9TVElDX1NFVkVSSVRZX0lORk9STUFUSU9OEAMSHAoYRElBR05PU1RJQ19TRVZFUklUWV9ISU5UEAQqnAEKDVJlY29yZGluZ01vZGUSHgoaUkVDT1JESU5HX01PREVfVU5TUEVDSUZJRUQQABIiCh5SRUNPUkRJTkdfTU9ERV9TVEFSVF9SRUNPUkRJTkcQARIhCh1SRUNPUkRJTkdfTU9ERV9TQVZFX1JFQ09SRElORxACEiQKIFJFQ09SRElOR19NT0RFX0RJU0NBUkRfUkVDT1JESU5HEAMqkwEKH1JlcXVlc3RlZEZpbGVQYXRoUmVqZWN0ZWRSZWFzb24SMwovUkVRVUVTVEVEX0ZJTEVfUEFUSF9SRUpFQ1RFRF9SRUFTT05fVU5TUEVDSUZJRUQQABI7CjdSRVFVRVNURURfRklMRV9QQVRIX1JFSkVDVEVEX1JFQVNPTl9TTEFTSEVTX05PVF9BTExPV0VEEAEqrQEKC1BhY2thZ2VUeXBlEhwKGFBBQ0tBR0VfVFlQRV9VTlNQRUNJRklFRBAAEh8KG1BBQ0tBR0VfVFlQRV9DVVJTT1JfUFJPSkVDVBABEiAKHFBBQ0tBR0VfVFlQRV9DVVJTT1JfUEVSU09OQUwQAhIdChlQQUNLQUdFX1RZUEVfQ0xBVURFX1NLSUxMEAMSHgoaUEFDS0FHRV9UWVBFX0NMQVVERV9QTFVHSU4QBCp9ChJTYW5kYm94UG9saWN5X1R5cGUSFAoQVFlQRV9VTlNQRUNJRklFRBAAEhYKElRZUEVfSU5TRUNVUkVfTk9ORRABEhwKGFRZUEVfV09SS1NQQUNFX1JFQURXUklURRACEhsKF1RZUEVfV09SS1NQQUNFX1JFQURPTkxZEAMqcQoPVGltZW91dEJlaGF2aW9yEiAKHFRJTUVPVVRfQkVIQVZJT1JfVU5TUEVDSUZJRUQQABIbChdUSU1FT1VUX0JFSEFWSU9SX0NBTkNFTBABEh8KG1RJTUVPVVRfQkVIQVZJT1JfQkFDS0dST1VORBACKnkKEFNoZWxsQWJvcnRSZWFzb24SIgoeU0hFTExfQUJPUlRfUkVBU09OX1VOU1BFQ0lGSUVEEAASIQodU0hFTExfQUJPUlRfUkVBU09OX1VTRVJfQUJPUlQQARIeChpTSEVMTF9BQk9SVF9SRUFTT05fVElNRU9VVBACKqoBChxDdXN0b21TdWJhZ2VudFBlcm1pc3Npb25Nb2RlEi8KK0NVU1RPTV9TVUJBR0VOVF9QRVJNSVNTSU9OX01PREVfVU5TUEVDSUZJRUQQABIrCidDVVNUT01fU1VCQUdFTlRfUEVSTUlTU0lPTl9NT0RFX0RFRkFVTFQQARIsCihDVVNUT01fU1VCQUdFTlRfUEVSTUlTU0lPTl9NT0RFX1JFQURPTkxZEAIqlQEKClRvZG9TdGF0dXMSGwoXVE9ET19TVEFUVVNfVU5TUEVDSUZJRUQQABIXChNUT0RPX1NUQVRVU19QRU5ESU5HEAESGwoXVE9ET19TVEFUVVNfSU5fUFJPR1JFU1MQAhIZChVUT0RPX1NUQVRVU19DT01QTEVURUQQAxIZChVUT0RPX1NUQVRVU19DQU5DRUxMRUQQBCpmCghDbGllbnRPUxIZChVDTElFTlRfT1NfVU5TUEVDSUZJRUQQABIVChFDTElFTlRfT1NfV0lORE9XUxABEhMKD0NMSUVOVF9PU19NQUNPUxACEhMKD0NMSUVOVF9PU19MSU5VWBADKuwBChxBcnRpZmFjdFVwbG9hZERpc3BhdGNoU3RhdHVzEi8KK0FSVElGQUNUX1VQTE9BRF9ESVNQQVRDSF9TVEFUVVNfVU5TUEVDSUZJRUQQABIsCihBUlRJRkFDVF9VUExPQURfRElTUEFUQ0hfU1RBVFVTX0FDQ0VQVEVEEAESLAooQVJUSUZBQ1RfVVBMT0FEX0RJU1BBVENIX1NUQVRVU19SRUpFQ1RFRBACEj8KO0FSVElGQUNUX1VQTE9BRF9ESVNQQVRDSF9TVEFUVVNfU0tJUFBFRF9BTFJFQURZX0lOX1BST0dSRVNTEAMqVwoKRnJhbWVfS2luZBIUChBLSU5EX1VOU1BFQ0lGSUVEEAASEAoMS0lORF9SRVFVRVNUEAESEQoNS0lORF9SRVNQT05TRRACEg4KCktJTkRfRVJST1IQAyqwAgoXQnVnYm90RGVlcGxpbmtFdmVudEtpbmQSKgomQlVHQk9UX0RFRVBMSU5LX0VWRU5UX0tJTkRfVU5TUEVDSUZJRUQQABImCiJCVUdCT1RfREVFUExJTktfRVZFTlRfS0lORF9DTElDS0VEEAESMwovQlVHQk9UX0RFRVBMSU5LX0VWRU5UX0tJTkRfSEFORExFRF9ESUFMT0dfU0hPV04QAhIzCi9CVUdCT1RfREVFUExJTktfRVZFTlRfS0lORF9IQU5ETEVEX0NIQVRfQ1JFQVRFRBADEiQKIEJVR0JPVF9ERUVQTElOS19FVkVOVF9LSU5EX0VSUk9SEAQSMQotQlVHQk9UX0RFRVBMSU5LX0VWRU5UX0tJTkRfSEFORExFRF9GSVhfSU5fV0VCEAUqygEKLENvbW1hbmRDbGFzc2lmaWVyUmVzdWx0X1N1Z2dlc3RlZFNhbmRib3hNb2RlEiYKIlNVR0dFU1RFRF9TQU5EQk9YX01PREVfVU5TUEVDSUZJRUQQABIiCh5TVUdHRVNURURfU0FOREJPWF9NT0RFX1NBTkRCT1gQARIlCiFTVUdHRVNURURfU0FOREJPWF9NT0RFX05PX1NBTkRCT1gQAhInCiNTVUdHRVNURURfU0FOREJPWF9NT0RFX1VOREVURVJNSU5FRBADKpABCiFTaGVsbEhvb2tBcHByb3ZhbFJlcXVpcmVtZW50X0tpbmQSNAowU0hFTExfSE9PS19BUFBST1ZBTF9SRVFVSVJFTUVOVF9LSU5EX1VOU1BFQ0lGSUVEEAASNQoxU0hFTExfSE9PS19BUFBST1ZBTF9SRVFVSVJFTUVOVF9LSU5EX0ZPUkNFX1BST01QVBABKo8BChVTaGVsbEJhY2tncm91bmRSZWFzb24SJwojU0hFTExfQkFDS0dST1VORF9SRUFTT05fVU5TUEVDSUZJRUQQABIjCh9TSEVMTF9CQUNLR1JPVU5EX1JFQVNPTl9USU1FT1VUEAESKAokU0hFTExfQkFDS0dST1VORF9SRUFTT05fVVNFUl9SRVFVRVNUEAIqpAEKGkZvcmNlQmFja2dyb3VuZFNoZWxsU3RhdHVzEi0KKUZPUkNFX0JBQ0tHUk9VTkRfU0hFTExfU1RBVFVTX1VOU1BFQ0lGSUVEEAASKgomRk9SQ0VfQkFDS0dST1VORF9TSEVMTF9TVEFUVVNfQUNDRVBURUQQARIrCidGT1JDRV9CQUNLR1JPVU5EX1NIRUxMX1NUQVRVU19OT1RfRk9VTkQQAirSAQoYU3ViYWdlbnRCYWNrZ3JvdW5kUmVhc29uEioKJlNVQkFHRU5UX0JBQ0tHUk9VTkRfUkVBU09OX1VOU1BFQ0lGSUVEEAASLAooU1VCQUdFTlRfQkFDS0dST1VORF9SRUFTT05fQUdFTlRfUkVRVUVTVBABEisKJ1NVQkFHRU5UX0JBQ0tHUk9VTkRfUkVBU09OX1VTRVJfUkVRVUVTVBACEi8KK1NVQkFHRU5UX0JBQ0tHUk9VTkRfUkVBU09OX1FVRVVFRF9GT0xMT1dfVVAQAyqwAQodRm9yY2VCYWNrZ3JvdW5kU3ViYWdlbnRTdGF0dXMSMAosRk9SQ0VfQkFDS0dST1VORF9TVUJBR0VOVF9TVEFUVVNfVU5TUEVDSUZJRUQQABItCilGT1JDRV9CQUNLR1JPVU5EX1NVQkFHRU5UX1NUQVRVU19BQ0NFUFRFRBABEi4KKkZPUkNFX0JBQ0tHUk9VTkRfU1VCQUdFTlRfU1RBVFVTX05PVF9GT1VORBACKqEBChtTbWFydE1vZGVDbGFzc2lmaWVyRGVjaXNpb24SLgoqU01BUlRfTU9ERV9DTEFTU0lGSUVSX0RFQ0lTSU9OX1VOU1BFQ0lGSUVEEAASKAokU01BUlRfTU9ERV9DTEFTU0lGSUVSX0RFQ0lTSU9OX0FMTE9XEAESKAokU01BUlRfTU9ERV9DTEFTU0lGSUVSX0RFQ0lTSU9OX0JMT0NLEAIqmAEKGENvbnZlcnNhdGlvblNlYXJjaFNvdXJjZRIqCiZDT05WRVJTQVRJT05fU0VBUkNIX1NPVVJDRV9VTlNQRUNJRklFRBAAEiQKIENPTlZFUlNBVElPTl9TRUFSQ0hfU09VUkNFX0xPQ0FMEAESKgomQ09OVkVSU0FUSU9OX1NFQVJDSF9TT1VSQ0VfQ0xPVURfQ0FDSEUQAirTAQobR2V0RGlmZlJlcXVlc3RfT3V0cHV0Rm9ybWF0Eh0KGU9VVFBVVF9GT1JNQVRfVU5TUEVDSUZJRUQQABIdChlPVVRQVVRfRk9STUFUX05BTUVfU1RBVFVTEAESKQolT1VUUFVUX0ZPUk1BVF9OQU1FX1NUQVRVU19BTkRfTlVNU1RBVBACEhwKGE9VVFBVVF9GT1JNQVRfRklMRV9ESUZGUxADEi0KKU9VVFBVVF9GT1JNQVRfRElGRlNfV0lUSF9CRUZPUkVfQU5EX0FGVEVSEAQqcQoQR2l0RGlmZl9EaWZmVHlwZRIZChVESUZGX1RZUEVfVU5TUEVDSUZJRUQQABIaChZESUZGX1RZUEVfRElGRl9UT19IRUFEEAESJgoiRElGRl9UWVBFX0RJRkZfRlJPTV9CUkFOQ0hfVE9fTUFJThACMocECgxBZ2VudFNlcnZpY2USQQoDUnVuEhwuYWdlbnQudjEuQWdlbnRDbGllbnRNZXNzYWdlGhwuYWdlbnQudjEuQWdlbnRTZXJ2ZXJNZXNzYWdlEj8KBlJ1blNTRRIXLmFnZW50LnYxLkJpZGlSZXF1ZXN0SWQaHC5hZ2VudC52MS5BZ2VudFNlcnZlck1lc3NhZ2USRAoJTmFtZUFnZW50EhouYWdlbnQudjEuTmFtZUFnZW50UmVxdWVzdBobLmFnZW50LnYxLk5hbWVBZ2VudFJlc3BvbnNlElYKD0dldFVzYWJsZU1vZGVscxIgLmFnZW50LnYxLkdldFVzYWJsZU1vZGVsc1JlcXVlc3QaIS5hZ2VudC52MS5HZXRVc2FibGVNb2RlbHNSZXNwb25zZRJoChVHZXREZWZhdWx0TW9kZWxGb3JDbGkSJi5hZ2VudC52MS5HZXREZWZhdWx0TW9kZWxGb3JDbGlSZXF1ZXN0GicuYWdlbnQudjEuR2V0RGVmYXVsdE1vZGVsRm9yQ2xpUmVzcG9uc2USawoWR2V0QWxsb3dlZE1vZGVsSW50ZW50cxInLmFnZW50LnYxLkdldEFsbG93ZWRNb2RlbEludGVudHNSZXF1ZXN0GiguYWdlbnQudjEuR2V0QWxsb3dlZE1vZGVsSW50ZW50c1Jlc3BvbnNlMrUICg5Db250cm9sU2VydmljZRJNCgxSZWFkVGV4dEZpbGUSHS5hZ2VudC52MS5SZWFkVGV4dEZpbGVSZXF1ZXN0Gh4uYWdlbnQudjEuUmVhZFRleHRGaWxlUmVzcG9uc2USUAoNV3JpdGVUZXh0RmlsZRIeLmFnZW50LnYxLldyaXRlVGV4dEZpbGVSZXF1ZXN0Gh8uYWdlbnQudjEuV3JpdGVUZXh0RmlsZVJlc3BvbnNlElMKDlJlYWRCaW5hcnlGaWxlEh8uYWdlbnQudjEuUmVhZEJpbmFyeUZpbGVSZXF1ZXN0GiAuYWdlbnQudjEuUmVhZEJpbmFyeUZpbGVSZXNwb25zZRJWCg9Xcml0ZUJpbmFyeUZpbGUSIC5hZ2VudC52MS5Xcml0ZUJpbmFyeUZpbGVSZXF1ZXN0GiEuYWdlbnQudjEuV3JpdGVCaW5hcnlGaWxlUmVzcG9uc2USbgoXR2V0V29ya3NwYWNlQ2hhbmdlc0hhc2gSKC5hZ2VudC52MS5HZXRXb3Jrc3BhY2VDaGFuZ2VzSGFzaFJlcXVlc3QaKS5hZ2VudC52MS5HZXRXb3Jrc3BhY2VDaGFuZ2VzSGFzaFJlc3BvbnNlEnEKGFJlZnJlc2hHaXRodWJBY2Nlc3NUb2tlbhIpLmFnZW50LnYxLlJlZnJlc2hHaXRodWJBY2Nlc3NUb2tlblJlcXVlc3QaKi5hZ2VudC52MS5SZWZyZXNoR2l0aHViQWNjZXNzVG9rZW5SZXNwb25zZRJrChZXYXJtUmVtb3RlQWNjZXNzU2VydmVyEicuYWdlbnQudjEuV2FybVJlbW90ZUFjY2Vzc1NlcnZlclJlcXVlc3QaKC5hZ2VudC52MS5XYXJtUmVtb3RlQWNjZXNzU2VydmVyUmVzcG9uc2USUAoNTGlzdEFydGlmYWN0cxIeLmFnZW50LnYxLkxpc3RBcnRpZmFjdHNSZXF1ZXN0Gh8uYWdlbnQudjEuTGlzdEFydGlmYWN0c1Jlc3BvbnNlElYKD1VwbG9hZEFydGlmYWN0cxIgLmFnZW50LnYxLlVwbG9hZEFydGlmYWN0c1JlcXVlc3QaIS5hZ2VudC52MS5VcGxvYWRBcnRpZmFjdHNSZXNwb25zZRJiChNHZXRNY3BSZWZyZXNoVG9rZW5zEiQuYWdlbnQudjEuR2V0TWNwUmVmcmVzaFRva2Vuc1JlcXVlc3QaJS5hZ2VudC52MS5HZXRNY3BSZWZyZXNoVG9rZW5zUmVzcG9uc2USdwoaVXBkYXRlRW52aXJvbm1lbnRWYXJpYWJsZXMSKy5hZ2VudC52MS5VcGRhdGVFbnZpcm9ubWVudFZhcmlhYmxlc1JlcXVlc3QaLC5hZ2VudC52MS5VcGRhdGVFbnZpcm9ubWVudFZhcmlhYmxlc1Jlc3BvbnNlMg0KC0V4ZWNTZXJ2aWNlMlEKIlByaXZhdGVXb3JrZXJCcmlkZ2VFeHRlcm5hbFNlcnZpY2USKwoHQ29ubmVjdBIPLmFnZW50LnYxLkZyYW1lGg8uYWdlbnQudjEuRnJhbWUyeAoQTGlmZWN5Y2xlU2VydmljZRIxCg1SZXNldEluc3RhbmNlEg8uYWdlbnQudjEuRW1wdHkaDy5hZ2VudC52MS5FbXB0eRIxCg1SZW5ld0luc3RhbmNlEg8uYWdlbnQudjEuRW1wdHkaDy5hZ2VudC52MS5FbXB0eWIGcHJvdG8z");
/**
* Describes the message agent.v1.McpToolError.
* Use `create(McpToolErrorSchema)` to create a new message.
*/
const McpToolErrorSchema = /*@__PURE__*/ messageDesc(file_agent, 12);
/**
* Describes the message agent.v1.McpToolResult.
* Use `create(McpToolResultSchema)` to create a new message.
*/
const McpToolResultSchema = /*@__PURE__*/ messageDesc(file_agent, 13);
/**
* Describes the message agent.v1.McpToolCall.
* Use `create(McpToolCallSchema)` to create a new message.
*/
const McpToolCallSchema = /*@__PURE__*/ messageDesc(file_agent, 14);
/**
* Describes the message agent.v1.ToolCall.
* Use `create(ToolCallSchema)` to create a new message.
*/
const ToolCallSchema = /*@__PURE__*/ messageDesc(file_agent, 46);
/**
* Describes the message agent.v1.ConversationStep.
* Use `create(ConversationStepSchema)` to create a new message.
*/
const ConversationStepSchema = /*@__PURE__*/ messageDesc(file_agent, 53);
/**
* Describes the message agent.v1.ConversationAction.
* Use `create(ConversationActionSchema)` to create a new message.
*/
const ConversationActionSchema = /*@__PURE__*/ messageDesc(file_agent, 54);
/**
* Describes the message agent.v1.UserMessageAction.
* Use `create(UserMessageActionSchema)` to create a new message.
*/
const UserMessageActionSchema = /*@__PURE__*/ messageDesc(file_agent, 55);
/**
* Describes the message agent.v1.ResumeAction.
* Use `create(ResumeActionSchema)` to create a new message.
*/
const ResumeActionSchema = /*@__PURE__*/ messageDesc(file_agent, 57);
/**
* Describes the message agent.v1.UserMessage.
* Use `create(UserMessageSchema)` to create a new message.
*/
const UserMessageSchema = /*@__PURE__*/ messageDesc(file_agent, 63);
/**
* Describes the message agent.v1.AssistantMessage.
* Use `create(AssistantMessageSchema)` to create a new message.
*/
const AssistantMessageSchema = /*@__PURE__*/ messageDesc(file_agent, 64);
/**
* Describes the message agent.v1.ThinkingMessage.
* Use `create(ThinkingMessageSchema)` to create a new message.
*/
const ThinkingMessageSchema = /*@__PURE__*/ messageDesc(file_agent, 65);
/**
* Describes the message agent.v1.ConversationTurnStructure.
* Use `create(ConversationTurnStructureSchema)` to create a new message.
*/
const ConversationTurnStructureSchema = /*@__PURE__*/ messageDesc(file_agent, 70);
/**
* Describes the message agent.v1.AgentConversationTurnStructure.
* Use `create(AgentConversationTurnStructureSchema)` to create a new message.
*/
const AgentConversationTurnStructureSchema = /*@__PURE__*/ messageDesc(file_agent, 72);
/**
* Describes the message agent.v1.ConversationStateStructure.
* Use `create(ConversationStateStructureSchema)` to create a new message.
*/
const ConversationStateStructureSchema = /*@__PURE__*/ messageDesc(file_agent, 83);
/**
* Describes the message agent.v1.ModelDetails.
* Use `create(ModelDetailsSchema)` to create a new message.
*/
const ModelDetailsSchema = /*@__PURE__*/ messageDesc(file_agent, 88);
/**
* Describes the message agent.v1.RequestedModel.
* Use `create(RequestedModelSchema)` to create a new message.
*/
const RequestedModelSchema = /*@__PURE__*/ messageDesc(file_agent, 89);
/**
* Describes the message agent.v1.AgentRunRequest.
* Use `create(AgentRunRequestSchema)` to create a new message.
*/
const AgentRunRequestSchema = /*@__PURE__*/ messageDesc(file_agent, 91);
/**
* Describes the message agent.v1.ClientHeartbeat.
* Use `create(ClientHeartbeatSchema)` to create a new message.
*/
const ClientHeartbeatSchema = /*@__PURE__*/ messageDesc(file_agent, 114);
/**
* Describes the message agent.v1.AgentClientMessage.
* Use `create(AgentClientMessageSchema)` to create a new message.
*/
const AgentClientMessageSchema = /*@__PURE__*/ messageDesc(file_agent, 118);
/**
* Describes the message agent.v1.AgentServerMessage.
* Use `create(AgentServerMessageSchema)` to create a new message.
*/
const AgentServerMessageSchema = /*@__PURE__*/ messageDesc(file_agent, 119);
/**
* Describes the message agent.v1.GetUsableModelsRequest.
* Use `create(GetUsableModelsRequestSchema)` to create a new message.
*/
const GetUsableModelsRequestSchema = /*@__PURE__*/ messageDesc(file_agent, 122);
/**
* Describes the message agent.v1.GetUsableModelsResponse.
* Use `create(GetUsableModelsResponseSchema)` to create a new message.
*/
const GetUsableModelsResponseSchema = /*@__PURE__*/ messageDesc(file_agent, 123);
/**
* Describes the message agent.v1.DeleteResult.
* Use `create(DeleteResultSchema)` to create a new message.
*/
const DeleteResultSchema = /*@__PURE__*/ messageDesc(file_agent, 187);
/**
* Describes the message agent.v1.DeleteRejected.
* Use `create(DeleteRejectedSchema)` to create a new message.
*/
const DeleteRejectedSchema = /*@__PURE__*/ messageDesc(file_agent, 193);
/**
* Describes the message agent.v1.ExecClientMessage.
* Use `create(ExecClientMessageSchema)` to create a new message.
*/
const ExecClientMessageSchema = /*@__PURE__*/ messageDesc(file_agent, 244);
/**
* Describes the message agent.v1.GrepResult.
* Use `create(GrepResultSchema)` to create a new message.
*/
const GrepResultSchema = /*@__PURE__*/ messageDesc(file_agent, 255);
/**
* Describes the message agent.v1.GrepError.
* Use `create(GrepErrorSchema)` to create a new message.
*/
const GrepErrorSchema = /*@__PURE__*/ messageDesc(file_agent, 256);
/**
* Describes the message agent.v1.GetBlobResult.
* Use `create(GetBlobResultSchema)` to create a new message.
*/
const GetBlobResultSchema = /*@__PURE__*/ messageDesc(file_agent, 268);
/**
* Describes the message agent.v1.SetBlobResult.
* Use `create(SetBlobResultSchema)` to create a new message.
*/
const SetBlobResultSchema = /*@__PURE__*/ messageDesc(file_agent, 270);
/**
* Describes the message agent.v1.KvClientMessage.
* Use `create(KvClientMessageSchema)` to create a new message.
*/
const KvClientMessageSchema = /*@__PURE__*/ messageDesc(file_agent, 272);
/**
* Describes the message agent.v1.LsResult.
* Use `create(LsResultSchema)` to create a new message.
*/
const LsResultSchema = /*@__PURE__*/ messageDesc(file_agent, 274);
/**
* Describes the message agent.v1.LsRejected.
* Use `create(LsRejectedSchema)` to create a new message.
*/
const LsRejectedSchema = /*@__PURE__*/ messageDesc(file_agent, 279);
/**
* Describes the message agent.v1.McpArgs.
* Use `create(McpArgsSchema)` to create a new message.
*/
const McpArgsSchema = /*@__PURE__*/ messageDesc(file_agent, 284);
/**
* Describes the message agent.v1.McpResult.
* Use `create(McpResultSchema)` to create a new message.
*/
const McpResultSchema = /*@__PURE__*/ messageDesc(file_agent, 285);
/**
* Describes the message agent.v1.McpTextContent.
* Use `create(McpTextContentSchema)` to create a new message.
*/
const McpTextContentSchema = /*@__PURE__*/ messageDesc(file_agent, 287);
/**
* Describes the message agent.v1.McpToolResultContentItem.
* Use `create(McpToolResultContentItemSchema)` to create a new message.
*/
const McpToolResultContentItemSchema = /*@__PURE__*/ messageDesc(file_agent, 289);
/**
* Describes the message agent.v1.McpSuccess.
* Use `create(McpSuccessSchema)` to create a new message.
*/
const McpSuccessSchema = /*@__PURE__*/ messageDesc(file_agent, 290);
/**
* Describes the message agent.v1.McpError.
* Use `create(McpErrorSchema)` to create a new message.
*/
const McpErrorSchema = /*@__PURE__*/ messageDesc(file_agent, 291);
/**
* Describes the message agent.v1.McpRejected.
* Use `create(McpRejectedSchema)` to create a new message.
*/
const McpRejectedSchema = /*@__PURE__*/ messageDesc(file_agent, 292);
/**
* Describes the message agent.v1.ListMcpResourcesExecResult.
* Use `create(ListMcpResourcesExecResultSchema)` to create a new message.
*/
const ListMcpResourcesExecResultSchema = /*@__PURE__*/ messageDesc(file_agent, 295);
/**
* Describes the message agent.v1.ListMcpResourcesSuccess.
* Use `create(ListMcpResourcesSuccessSchema)` to create a new message.
*/
const ListMcpResourcesSuccessSchema = /*@__PURE__*/ messageDesc(file_agent, 297);
/**
* Describes the message agent.v1.McpToolDefinition.
* Use `create(McpToolDefinitionSchema)` to create a new message.
*/
const McpToolDefinitionSchema = /*@__PURE__*/ messageDesc(file_agent, 306);
/**
* Describes the message agent.v1.ReadResult.
* Use `create(ReadResultSchema)` to create a new message.
*/
const ReadResultSchema = /*@__PURE__*/ messageDesc(file_agent, 313);
/**
* Describes the message agent.v1.ReadRejected.
* Use `create(ReadRejectedSchema)` to create a new message.
*/
const ReadRejectedSchema = /*@__PURE__*/ messageDesc(file_agent, 316);
/**
* Describes the message agent.v1.RequestContextResult.
* Use `create(RequestContextResultSchema)` to create a new message.
*/
const RequestContextResultSchema = /*@__PURE__*/ messageDesc(file_agent, 336);
/**
* Describes the message agent.v1.RequestContextSuccess.
* Use `create(RequestContextSuccessSchema)` to create a new message.
*/
const RequestContextSuccessSchema = /*@__PURE__*/ messageDesc(file_agent, 337);
/**
* Describes the message agent.v1.RequestContext.
* Use `create(RequestContextSchema)` to create a new message.
*/
const RequestContextSchema = /*@__PURE__*/ messageDesc(file_agent, 347);
/**
* Describes the message agent.v1.SelectedImage.
* Use `create(SelectedImageSchema)` to create a new message.
*/
const SelectedImageSchema = /*@__PURE__*/ messageDesc(file_agent, 349);
/**
* Describes the message agent.v1.SelectedImage_BlobIdWithData.
* Use `create(SelectedImage_BlobIdWithDataSchema)` to create a new message.
*/
const SelectedImage_BlobIdWithDataSchema = /*@__PURE__*/ messageDesc(file_agent, 350);
/**
* Describes the message agent.v1.SelectedImage_Dimension.
* Use `create(SelectedImage_DimensionSchema)` to create a new message.
*/
const SelectedImage_DimensionSchema = /*@__PURE__*/ messageDesc(file_agent, 351);
/**
* Describes the message agent.v1.SelectedContext.
* Use `create(SelectedContextSchema)` to create a new message.
*/
const SelectedContextSchema = /*@__PURE__*/ messageDesc(file_agent, 373);
/**
* Describes the message agent.v1.ShellResult.
* Use `create(ShellResultSchema)` to create a new message.
*/
const ShellResultSchema = /*@__PURE__*/ messageDesc(file_agent, 389);
/**
* Describes the message agent.v1.ShellRejected.
* Use `create(ShellRejectedSchema)` to create a new message.
*/
const ShellRejectedSchema = /*@__PURE__*/ messageDesc(file_agent, 400);
/**
* Describes the message agent.v1.WriteResult.
* Use `create(WriteResultSchema)` to create a new message.
*/
const WriteResultSchema = /*@__PURE__*/ messageDesc(file_agent, 450);
/**
* Describes the message agent.v1.WriteRejected.
* Use `create(WriteRejectedSchema)` to create a new message.
*/
const WriteRejectedSchema = /*@__PURE__*/ messageDesc(file_agent, 455);
/**
* Describes the message agent.v1.PiBashExecError.
* Use `create(PiBashExecErrorSchema)` to create a new message.
*/
const PiBashExecErrorSchema = /*@__PURE__*/ messageDesc(file_agent, 500);
/**
* Describes the message agent.v1.PiBashExecResult.
* Use `create(PiBashExecResultSchema)` to create a new message.
*/
const PiBashExecResultSchema = /*@__PURE__*/ messageDesc(file_agent, 501);
/**
* Describes the message agent.v1.McpApproved.
* Use `create(McpApprovedSchema)` to create a new message.
*/
const McpApprovedSchema = /*@__PURE__*/ messageDesc(file_agent, 525);
/**
* @generated from enum agent.v1.AppliedAgentChange_ChangeType
*/
var AppliedAgentChange_ChangeType;
(function(AppliedAgentChange_ChangeType) {
	/**
	* @generated from enum value: CHANGE_TYPE_UNSPECIFIED = 0;
	*/
	AppliedAgentChange_ChangeType[AppliedAgentChange_ChangeType["CHANGE_TYPE_UNSPECIFIED"] = 0] = "CHANGE_TYPE_UNSPECIFIED";
	/**
	* @generated from enum value: CHANGE_TYPE_CREATED = 1;
	*/
	AppliedAgentChange_ChangeType[AppliedAgentChange_ChangeType["CHANGE_TYPE_CREATED"] = 1] = "CHANGE_TYPE_CREATED";
	/**
	* @generated from enum value: CHANGE_TYPE_MODIFIED = 2;
	*/
	AppliedAgentChange_ChangeType[AppliedAgentChange_ChangeType["CHANGE_TYPE_MODIFIED"] = 2] = "CHANGE_TYPE_MODIFIED";
	/**
	* @generated from enum value: CHANGE_TYPE_DELETED = 3;
	*/
	AppliedAgentChange_ChangeType[AppliedAgentChange_ChangeType["CHANGE_TYPE_DELETED"] = 3] = "CHANGE_TYPE_DELETED";
})(AppliedAgentChange_ChangeType || (AppliedAgentChange_ChangeType = {}));
/**
* @generated from enum agent.v1.MouseButton
*/
var MouseButton;
(function(MouseButton) {
	/**
	* @generated from enum value: MOUSE_BUTTON_UNSPECIFIED = 0;
	*/
	MouseButton[MouseButton["UNSPECIFIED"] = 0] = "UNSPECIFIED";
	/**
	* @generated from enum value: MOUSE_BUTTON_LEFT = 1;
	*/
	MouseButton[MouseButton["LEFT"] = 1] = "LEFT";
	/**
	* @generated from enum value: MOUSE_BUTTON_RIGHT = 2;
	*/
	MouseButton[MouseButton["RIGHT"] = 2] = "RIGHT";
	/**
	* @generated from enum value: MOUSE_BUTTON_MIDDLE = 3;
	*/
	MouseButton[MouseButton["MIDDLE"] = 3] = "MIDDLE";
	/**
	* @generated from enum value: MOUSE_BUTTON_BACK = 4;
	*/
	MouseButton[MouseButton["BACK"] = 4] = "BACK";
	/**
	* @generated from enum value: MOUSE_BUTTON_FORWARD = 5;
	*/
	MouseButton[MouseButton["FORWARD"] = 5] = "FORWARD";
})(MouseButton || (MouseButton = {}));
/**
* @generated from enum agent.v1.ScrollDirection
*/
var ScrollDirection;
(function(ScrollDirection) {
	/**
	* @generated from enum value: SCROLL_DIRECTION_UNSPECIFIED = 0;
	*/
	ScrollDirection[ScrollDirection["UNSPECIFIED"] = 0] = "UNSPECIFIED";
	/**
	* @generated from enum value: SCROLL_DIRECTION_UP = 1;
	*/
	ScrollDirection[ScrollDirection["UP"] = 1] = "UP";
	/**
	* @generated from enum value: SCROLL_DIRECTION_DOWN = 2;
	*/
	ScrollDirection[ScrollDirection["DOWN"] = 2] = "DOWN";
	/**
	* @generated from enum value: SCROLL_DIRECTION_LEFT = 3;
	*/
	ScrollDirection[ScrollDirection["LEFT"] = 3] = "LEFT";
	/**
	* @generated from enum value: SCROLL_DIRECTION_RIGHT = 4;
	*/
	ScrollDirection[ScrollDirection["RIGHT"] = 4] = "RIGHT";
})(ScrollDirection || (ScrollDirection = {}));
/**
* @generated from enum agent.v1.CursorRuleSource
*/
var CursorRuleSource;
(function(CursorRuleSource) {
	/**
	* @generated from enum value: CURSOR_RULE_SOURCE_UNSPECIFIED = 0;
	*/
	CursorRuleSource[CursorRuleSource["UNSPECIFIED"] = 0] = "UNSPECIFIED";
	/**
	* @generated from enum value: CURSOR_RULE_SOURCE_TEAM = 1;
	*/
	CursorRuleSource[CursorRuleSource["TEAM"] = 1] = "TEAM";
	/**
	* @generated from enum value: CURSOR_RULE_SOURCE_USER = 2;
	*/
	CursorRuleSource[CursorRuleSource["USER"] = 2] = "USER";
})(CursorRuleSource || (CursorRuleSource = {}));
/**
* @generated from enum agent.v1.DiagnosticSeverity
*/
var DiagnosticSeverity;
(function(DiagnosticSeverity) {
	/**
	* @generated from enum value: DIAGNOSTIC_SEVERITY_UNSPECIFIED = 0;
	*/
	DiagnosticSeverity[DiagnosticSeverity["UNSPECIFIED"] = 0] = "UNSPECIFIED";
	/**
	* @generated from enum value: DIAGNOSTIC_SEVERITY_ERROR = 1;
	*/
	DiagnosticSeverity[DiagnosticSeverity["ERROR"] = 1] = "ERROR";
	/**
	* @generated from enum value: DIAGNOSTIC_SEVERITY_WARNING = 2;
	*/
	DiagnosticSeverity[DiagnosticSeverity["WARNING"] = 2] = "WARNING";
	/**
	* @generated from enum value: DIAGNOSTIC_SEVERITY_INFORMATION = 3;
	*/
	DiagnosticSeverity[DiagnosticSeverity["INFORMATION"] = 3] = "INFORMATION";
	/**
	* @generated from enum value: DIAGNOSTIC_SEVERITY_HINT = 4;
	*/
	DiagnosticSeverity[DiagnosticSeverity["HINT"] = 4] = "HINT";
})(DiagnosticSeverity || (DiagnosticSeverity = {}));
/**
* @generated from enum agent.v1.RecordingMode
*/
var RecordingMode;
(function(RecordingMode) {
	/**
	* @generated from enum value: RECORDING_MODE_UNSPECIFIED = 0;
	*/
	RecordingMode[RecordingMode["UNSPECIFIED"] = 0] = "UNSPECIFIED";
	/**
	* @generated from enum value: RECORDING_MODE_START_RECORDING = 1;
	*/
	RecordingMode[RecordingMode["START_RECORDING"] = 1] = "START_RECORDING";
	/**
	* @generated from enum value: RECORDING_MODE_SAVE_RECORDING = 2;
	*/
	RecordingMode[RecordingMode["SAVE_RECORDING"] = 2] = "SAVE_RECORDING";
	/**
	* @generated from enum value: RECORDING_MODE_DISCARD_RECORDING = 3;
	*/
	RecordingMode[RecordingMode["DISCARD_RECORDING"] = 3] = "DISCARD_RECORDING";
})(RecordingMode || (RecordingMode = {}));
/**
* @generated from enum agent.v1.RequestedFilePathRejectedReason
*/
var RequestedFilePathRejectedReason;
(function(RequestedFilePathRejectedReason) {
	/**
	* @generated from enum value: REQUESTED_FILE_PATH_REJECTED_REASON_UNSPECIFIED = 0;
	*/
	RequestedFilePathRejectedReason[RequestedFilePathRejectedReason["UNSPECIFIED"] = 0] = "UNSPECIFIED";
	/**
	* @generated from enum value: REQUESTED_FILE_PATH_REJECTED_REASON_SLASHES_NOT_ALLOWED = 1;
	*/
	RequestedFilePathRejectedReason[RequestedFilePathRejectedReason["SLASHES_NOT_ALLOWED"] = 1] = "SLASHES_NOT_ALLOWED";
})(RequestedFilePathRejectedReason || (RequestedFilePathRejectedReason = {}));
/**
* @generated from enum agent.v1.PackageType
*/
var PackageType;
(function(PackageType) {
	/**
	* @generated from enum value: PACKAGE_TYPE_UNSPECIFIED = 0;
	*/
	PackageType[PackageType["UNSPECIFIED"] = 0] = "UNSPECIFIED";
	/**
	* @generated from enum value: PACKAGE_TYPE_CURSOR_PROJECT = 1;
	*/
	PackageType[PackageType["CURSOR_PROJECT"] = 1] = "CURSOR_PROJECT";
	/**
	* @generated from enum value: PACKAGE_TYPE_CURSOR_PERSONAL = 2;
	*/
	PackageType[PackageType["CURSOR_PERSONAL"] = 2] = "CURSOR_PERSONAL";
	/**
	* @generated from enum value: PACKAGE_TYPE_CLAUDE_SKILL = 3;
	*/
	PackageType[PackageType["CLAUDE_SKILL"] = 3] = "CLAUDE_SKILL";
	/**
	* @generated from enum value: PACKAGE_TYPE_CLAUDE_PLUGIN = 4;
	*/
	PackageType[PackageType["CLAUDE_PLUGIN"] = 4] = "CLAUDE_PLUGIN";
})(PackageType || (PackageType = {}));
/**
* @generated from enum agent.v1.SandboxPolicy_Type
*/
var SandboxPolicy_Type;
(function(SandboxPolicy_Type) {
	/**
	* @generated from enum value: TYPE_UNSPECIFIED = 0;
	*/
	SandboxPolicy_Type[SandboxPolicy_Type["TYPE_UNSPECIFIED"] = 0] = "TYPE_UNSPECIFIED";
	/**
	* @generated from enum value: TYPE_INSECURE_NONE = 1;
	*/
	SandboxPolicy_Type[SandboxPolicy_Type["TYPE_INSECURE_NONE"] = 1] = "TYPE_INSECURE_NONE";
	/**
	* @generated from enum value: TYPE_WORKSPACE_READWRITE = 2;
	*/
	SandboxPolicy_Type[SandboxPolicy_Type["TYPE_WORKSPACE_READWRITE"] = 2] = "TYPE_WORKSPACE_READWRITE";
	/**
	* @generated from enum value: TYPE_WORKSPACE_READONLY = 3;
	*/
	SandboxPolicy_Type[SandboxPolicy_Type["TYPE_WORKSPACE_READONLY"] = 3] = "TYPE_WORKSPACE_READONLY";
})(SandboxPolicy_Type || (SandboxPolicy_Type = {}));
/**
* @generated from enum agent.v1.TimeoutBehavior
*/
var TimeoutBehavior;
(function(TimeoutBehavior) {
	/**
	* @generated from enum value: TIMEOUT_BEHAVIOR_UNSPECIFIED = 0;
	*/
	TimeoutBehavior[TimeoutBehavior["UNSPECIFIED"] = 0] = "UNSPECIFIED";
	/**
	* @generated from enum value: TIMEOUT_BEHAVIOR_CANCEL = 1;
	*/
	TimeoutBehavior[TimeoutBehavior["CANCEL"] = 1] = "CANCEL";
	/**
	* @generated from enum value: TIMEOUT_BEHAVIOR_BACKGROUND = 2;
	*/
	TimeoutBehavior[TimeoutBehavior["BACKGROUND"] = 2] = "BACKGROUND";
})(TimeoutBehavior || (TimeoutBehavior = {}));
/**
* @generated from enum agent.v1.ShellAbortReason
*/
var ShellAbortReason;
(function(ShellAbortReason) {
	/**
	* @generated from enum value: SHELL_ABORT_REASON_UNSPECIFIED = 0;
	*/
	ShellAbortReason[ShellAbortReason["UNSPECIFIED"] = 0] = "UNSPECIFIED";
	/**
	* @generated from enum value: SHELL_ABORT_REASON_USER_ABORT = 1;
	*/
	ShellAbortReason[ShellAbortReason["USER_ABORT"] = 1] = "USER_ABORT";
	/**
	* @generated from enum value: SHELL_ABORT_REASON_TIMEOUT = 2;
	*/
	ShellAbortReason[ShellAbortReason["TIMEOUT"] = 2] = "TIMEOUT";
})(ShellAbortReason || (ShellAbortReason = {}));
/**
* @generated from enum agent.v1.CustomSubagentPermissionMode
*/
var CustomSubagentPermissionMode;
(function(CustomSubagentPermissionMode) {
	/**
	* @generated from enum value: CUSTOM_SUBAGENT_PERMISSION_MODE_UNSPECIFIED = 0;
	*/
	CustomSubagentPermissionMode[CustomSubagentPermissionMode["UNSPECIFIED"] = 0] = "UNSPECIFIED";
	/**
	* @generated from enum value: CUSTOM_SUBAGENT_PERMISSION_MODE_DEFAULT = 1;
	*/
	CustomSubagentPermissionMode[CustomSubagentPermissionMode["DEFAULT"] = 1] = "DEFAULT";
	/**
	* @generated from enum value: CUSTOM_SUBAGENT_PERMISSION_MODE_READONLY = 2;
	*/
	CustomSubagentPermissionMode[CustomSubagentPermissionMode["READONLY"] = 2] = "READONLY";
})(CustomSubagentPermissionMode || (CustomSubagentPermissionMode = {}));
/**
* @generated from enum agent.v1.TodoStatus
*/
var TodoStatus;
(function(TodoStatus) {
	/**
	* @generated from enum value: TODO_STATUS_UNSPECIFIED = 0;
	*/
	TodoStatus[TodoStatus["UNSPECIFIED"] = 0] = "UNSPECIFIED";
	/**
	* @generated from enum value: TODO_STATUS_PENDING = 1;
	*/
	TodoStatus[TodoStatus["PENDING"] = 1] = "PENDING";
	/**
	* @generated from enum value: TODO_STATUS_IN_PROGRESS = 2;
	*/
	TodoStatus[TodoStatus["IN_PROGRESS"] = 2] = "IN_PROGRESS";
	/**
	* @generated from enum value: TODO_STATUS_COMPLETED = 3;
	*/
	TodoStatus[TodoStatus["COMPLETED"] = 3] = "COMPLETED";
	/**
	* @generated from enum value: TODO_STATUS_CANCELLED = 4;
	*/
	TodoStatus[TodoStatus["CANCELLED"] = 4] = "CANCELLED";
})(TodoStatus || (TodoStatus = {}));
/**
* @generated from enum agent.v1.ClientOS
*/
var ClientOS;
(function(ClientOS) {
	/**
	* @generated from enum value: CLIENT_OS_UNSPECIFIED = 0;
	*/
	ClientOS[ClientOS["CLIENT_OS_UNSPECIFIED"] = 0] = "CLIENT_OS_UNSPECIFIED";
	/**
	* @generated from enum value: CLIENT_OS_WINDOWS = 1;
	*/
	ClientOS[ClientOS["CLIENT_OS_WINDOWS"] = 1] = "CLIENT_OS_WINDOWS";
	/**
	* @generated from enum value: CLIENT_OS_MACOS = 2;
	*/
	ClientOS[ClientOS["CLIENT_OS_MACOS"] = 2] = "CLIENT_OS_MACOS";
	/**
	* @generated from enum value: CLIENT_OS_LINUX = 3;
	*/
	ClientOS[ClientOS["CLIENT_OS_LINUX"] = 3] = "CLIENT_OS_LINUX";
})(ClientOS || (ClientOS = {}));
/**
* @generated from enum agent.v1.ArtifactUploadDispatchStatus
*/
var ArtifactUploadDispatchStatus;
(function(ArtifactUploadDispatchStatus) {
	/**
	* @generated from enum value: ARTIFACT_UPLOAD_DISPATCH_STATUS_UNSPECIFIED = 0;
	*/
	ArtifactUploadDispatchStatus[ArtifactUploadDispatchStatus["UNSPECIFIED"] = 0] = "UNSPECIFIED";
	/**
	* @generated from enum value: ARTIFACT_UPLOAD_DISPATCH_STATUS_ACCEPTED = 1;
	*/
	ArtifactUploadDispatchStatus[ArtifactUploadDispatchStatus["ACCEPTED"] = 1] = "ACCEPTED";
	/**
	* @generated from enum value: ARTIFACT_UPLOAD_DISPATCH_STATUS_REJECTED = 2;
	*/
	ArtifactUploadDispatchStatus[ArtifactUploadDispatchStatus["REJECTED"] = 2] = "REJECTED";
	/**
	* @generated from enum value: ARTIFACT_UPLOAD_DISPATCH_STATUS_SKIPPED_ALREADY_IN_PROGRESS = 3;
	*/
	ArtifactUploadDispatchStatus[ArtifactUploadDispatchStatus["SKIPPED_ALREADY_IN_PROGRESS"] = 3] = "SKIPPED_ALREADY_IN_PROGRESS";
})(ArtifactUploadDispatchStatus || (ArtifactUploadDispatchStatus = {}));
/**
* @generated from enum agent.v1.Frame_Kind
*/
var Frame_Kind;
(function(Frame_Kind) {
	/**
	* @generated from enum value: KIND_UNSPECIFIED = 0;
	*/
	Frame_Kind[Frame_Kind["KIND_UNSPECIFIED"] = 0] = "KIND_UNSPECIFIED";
	/**
	* @generated from enum value: KIND_REQUEST = 1;
	*/
	Frame_Kind[Frame_Kind["KIND_REQUEST"] = 1] = "KIND_REQUEST";
	/**
	* @generated from enum value: KIND_RESPONSE = 2;
	*/
	Frame_Kind[Frame_Kind["KIND_RESPONSE"] = 2] = "KIND_RESPONSE";
	/**
	* @generated from enum value: KIND_ERROR = 3;
	*/
	Frame_Kind[Frame_Kind["KIND_ERROR"] = 3] = "KIND_ERROR";
})(Frame_Kind || (Frame_Kind = {}));
/**
* @generated from enum agent.v1.BugbotDeeplinkEventKind
*/
var BugbotDeeplinkEventKind;
(function(BugbotDeeplinkEventKind) {
	/**
	* @generated from enum value: BUGBOT_DEEPLINK_EVENT_KIND_UNSPECIFIED = 0;
	*/
	BugbotDeeplinkEventKind[BugbotDeeplinkEventKind["UNSPECIFIED"] = 0] = "UNSPECIFIED";
	/**
	* @generated from enum value: BUGBOT_DEEPLINK_EVENT_KIND_CLICKED = 1;
	*/
	BugbotDeeplinkEventKind[BugbotDeeplinkEventKind["CLICKED"] = 1] = "CLICKED";
	/**
	* @generated from enum value: BUGBOT_DEEPLINK_EVENT_KIND_HANDLED_DIALOG_SHOWN = 2;
	*/
	BugbotDeeplinkEventKind[BugbotDeeplinkEventKind["HANDLED_DIALOG_SHOWN"] = 2] = "HANDLED_DIALOG_SHOWN";
	/**
	* @generated from enum value: BUGBOT_DEEPLINK_EVENT_KIND_HANDLED_CHAT_CREATED = 3;
	*/
	BugbotDeeplinkEventKind[BugbotDeeplinkEventKind["HANDLED_CHAT_CREATED"] = 3] = "HANDLED_CHAT_CREATED";
	/**
	* @generated from enum value: BUGBOT_DEEPLINK_EVENT_KIND_ERROR = 4;
	*/
	BugbotDeeplinkEventKind[BugbotDeeplinkEventKind["ERROR"] = 4] = "ERROR";
	/**
	* @generated from enum value: BUGBOT_DEEPLINK_EVENT_KIND_HANDLED_FIX_IN_WEB = 5;
	*/
	BugbotDeeplinkEventKind[BugbotDeeplinkEventKind["HANDLED_FIX_IN_WEB"] = 5] = "HANDLED_FIX_IN_WEB";
})(BugbotDeeplinkEventKind || (BugbotDeeplinkEventKind = {}));
/**
* @generated from enum agent.v1.CommandClassifierResult_SuggestedSandboxMode
*/
var CommandClassifierResult_SuggestedSandboxMode;
(function(CommandClassifierResult_SuggestedSandboxMode) {
	/**
	* @generated from enum value: SUGGESTED_SANDBOX_MODE_UNSPECIFIED = 0;
	*/
	CommandClassifierResult_SuggestedSandboxMode[CommandClassifierResult_SuggestedSandboxMode["SUGGESTED_SANDBOX_MODE_UNSPECIFIED"] = 0] = "SUGGESTED_SANDBOX_MODE_UNSPECIFIED";
	/**
	* @generated from enum value: SUGGESTED_SANDBOX_MODE_SANDBOX = 1;
	*/
	CommandClassifierResult_SuggestedSandboxMode[CommandClassifierResult_SuggestedSandboxMode["SUGGESTED_SANDBOX_MODE_SANDBOX"] = 1] = "SUGGESTED_SANDBOX_MODE_SANDBOX";
	/**
	* @generated from enum value: SUGGESTED_SANDBOX_MODE_NO_SANDBOX = 2;
	*/
	CommandClassifierResult_SuggestedSandboxMode[CommandClassifierResult_SuggestedSandboxMode["SUGGESTED_SANDBOX_MODE_NO_SANDBOX"] = 2] = "SUGGESTED_SANDBOX_MODE_NO_SANDBOX";
	/**
	* @generated from enum value: SUGGESTED_SANDBOX_MODE_UNDETERMINED = 3;
	*/
	CommandClassifierResult_SuggestedSandboxMode[CommandClassifierResult_SuggestedSandboxMode["SUGGESTED_SANDBOX_MODE_UNDETERMINED"] = 3] = "SUGGESTED_SANDBOX_MODE_UNDETERMINED";
})(CommandClassifierResult_SuggestedSandboxMode || (CommandClassifierResult_SuggestedSandboxMode = {}));
/**
* @generated from enum agent.v1.ShellHookApprovalRequirement_Kind
*/
var ShellHookApprovalRequirement_Kind;
(function(ShellHookApprovalRequirement_Kind) {
	/**
	* @generated from enum value: SHELL_HOOK_APPROVAL_REQUIREMENT_KIND_UNSPECIFIED = 0;
	*/
	ShellHookApprovalRequirement_Kind[ShellHookApprovalRequirement_Kind["SHELL_HOOK_APPROVAL_REQUIREMENT_KIND_UNSPECIFIED"] = 0] = "SHELL_HOOK_APPROVAL_REQUIREMENT_KIND_UNSPECIFIED";
	/**
	* @generated from enum value: SHELL_HOOK_APPROVAL_REQUIREMENT_KIND_FORCE_PROMPT = 1;
	*/
	ShellHookApprovalRequirement_Kind[ShellHookApprovalRequirement_Kind["SHELL_HOOK_APPROVAL_REQUIREMENT_KIND_FORCE_PROMPT"] = 1] = "SHELL_HOOK_APPROVAL_REQUIREMENT_KIND_FORCE_PROMPT";
})(ShellHookApprovalRequirement_Kind || (ShellHookApprovalRequirement_Kind = {}));
/**
* @generated from enum agent.v1.ShellBackgroundReason
*/
var ShellBackgroundReason;
(function(ShellBackgroundReason) {
	/**
	* @generated from enum value: SHELL_BACKGROUND_REASON_UNSPECIFIED = 0;
	*/
	ShellBackgroundReason[ShellBackgroundReason["UNSPECIFIED"] = 0] = "UNSPECIFIED";
	/**
	* @generated from enum value: SHELL_BACKGROUND_REASON_TIMEOUT = 1;
	*/
	ShellBackgroundReason[ShellBackgroundReason["TIMEOUT"] = 1] = "TIMEOUT";
	/**
	* @generated from enum value: SHELL_BACKGROUND_REASON_USER_REQUEST = 2;
	*/
	ShellBackgroundReason[ShellBackgroundReason["USER_REQUEST"] = 2] = "USER_REQUEST";
})(ShellBackgroundReason || (ShellBackgroundReason = {}));
/**
* @generated from enum agent.v1.ForceBackgroundShellStatus
*/
var ForceBackgroundShellStatus;
(function(ForceBackgroundShellStatus) {
	/**
	* @generated from enum value: FORCE_BACKGROUND_SHELL_STATUS_UNSPECIFIED = 0;
	*/
	ForceBackgroundShellStatus[ForceBackgroundShellStatus["UNSPECIFIED"] = 0] = "UNSPECIFIED";
	/**
	* @generated from enum value: FORCE_BACKGROUND_SHELL_STATUS_ACCEPTED = 1;
	*/
	ForceBackgroundShellStatus[ForceBackgroundShellStatus["ACCEPTED"] = 1] = "ACCEPTED";
	/**
	* @generated from enum value: FORCE_BACKGROUND_SHELL_STATUS_NOT_FOUND = 2;
	*/
	ForceBackgroundShellStatus[ForceBackgroundShellStatus["NOT_FOUND"] = 2] = "NOT_FOUND";
})(ForceBackgroundShellStatus || (ForceBackgroundShellStatus = {}));
/**
* @generated from enum agent.v1.SubagentBackgroundReason
*/
var SubagentBackgroundReason;
(function(SubagentBackgroundReason) {
	/**
	* @generated from enum value: SUBAGENT_BACKGROUND_REASON_UNSPECIFIED = 0;
	*/
	SubagentBackgroundReason[SubagentBackgroundReason["UNSPECIFIED"] = 0] = "UNSPECIFIED";
	/**
	* @generated from enum value: SUBAGENT_BACKGROUND_REASON_AGENT_REQUEST = 1;
	*/
	SubagentBackgroundReason[SubagentBackgroundReason["AGENT_REQUEST"] = 1] = "AGENT_REQUEST";
	/**
	* @generated from enum value: SUBAGENT_BACKGROUND_REASON_USER_REQUEST = 2;
	*/
	SubagentBackgroundReason[SubagentBackgroundReason["USER_REQUEST"] = 2] = "USER_REQUEST";
	/**
	* @generated from enum value: SUBAGENT_BACKGROUND_REASON_QUEUED_FOLLOW_UP = 3;
	*/
	SubagentBackgroundReason[SubagentBackgroundReason["QUEUED_FOLLOW_UP"] = 3] = "QUEUED_FOLLOW_UP";
})(SubagentBackgroundReason || (SubagentBackgroundReason = {}));
/**
* @generated from enum agent.v1.ForceBackgroundSubagentStatus
*/
var ForceBackgroundSubagentStatus;
(function(ForceBackgroundSubagentStatus) {
	/**
	* @generated from enum value: FORCE_BACKGROUND_SUBAGENT_STATUS_UNSPECIFIED = 0;
	*/
	ForceBackgroundSubagentStatus[ForceBackgroundSubagentStatus["UNSPECIFIED"] = 0] = "UNSPECIFIED";
	/**
	* @generated from enum value: FORCE_BACKGROUND_SUBAGENT_STATUS_ACCEPTED = 1;
	*/
	ForceBackgroundSubagentStatus[ForceBackgroundSubagentStatus["ACCEPTED"] = 1] = "ACCEPTED";
	/**
	* @generated from enum value: FORCE_BACKGROUND_SUBAGENT_STATUS_NOT_FOUND = 2;
	*/
	ForceBackgroundSubagentStatus[ForceBackgroundSubagentStatus["NOT_FOUND"] = 2] = "NOT_FOUND";
})(ForceBackgroundSubagentStatus || (ForceBackgroundSubagentStatus = {}));
/**
* @generated from enum agent.v1.SmartModeClassifierDecision
*/
var SmartModeClassifierDecision;
(function(SmartModeClassifierDecision) {
	/**
	* @generated from enum value: SMART_MODE_CLASSIFIER_DECISION_UNSPECIFIED = 0;
	*/
	SmartModeClassifierDecision[SmartModeClassifierDecision["UNSPECIFIED"] = 0] = "UNSPECIFIED";
	/**
	* @generated from enum value: SMART_MODE_CLASSIFIER_DECISION_ALLOW = 1;
	*/
	SmartModeClassifierDecision[SmartModeClassifierDecision["ALLOW"] = 1] = "ALLOW";
	/**
	* @generated from enum value: SMART_MODE_CLASSIFIER_DECISION_BLOCK = 2;
	*/
	SmartModeClassifierDecision[SmartModeClassifierDecision["BLOCK"] = 2] = "BLOCK";
})(SmartModeClassifierDecision || (SmartModeClassifierDecision = {}));
/**
* @generated from enum agent.v1.ConversationSearchSource
*/
var ConversationSearchSource;
(function(ConversationSearchSource) {
	/**
	* @generated from enum value: CONVERSATION_SEARCH_SOURCE_UNSPECIFIED = 0;
	*/
	ConversationSearchSource[ConversationSearchSource["UNSPECIFIED"] = 0] = "UNSPECIFIED";
	/**
	* @generated from enum value: CONVERSATION_SEARCH_SOURCE_LOCAL = 1;
	*/
	ConversationSearchSource[ConversationSearchSource["LOCAL"] = 1] = "LOCAL";
	/**
	* @generated from enum value: CONVERSATION_SEARCH_SOURCE_CLOUD_CACHE = 2;
	*/
	ConversationSearchSource[ConversationSearchSource["CLOUD_CACHE"] = 2] = "CLOUD_CACHE";
})(ConversationSearchSource || (ConversationSearchSource = {}));
/**
* @generated from enum agent.v1.GetDiffRequest_OutputFormat
*/
var GetDiffRequest_OutputFormat;
(function(GetDiffRequest_OutputFormat) {
	/**
	* @generated from enum value: OUTPUT_FORMAT_UNSPECIFIED = 0;
	*/
	GetDiffRequest_OutputFormat[GetDiffRequest_OutputFormat["OUTPUT_FORMAT_UNSPECIFIED"] = 0] = "OUTPUT_FORMAT_UNSPECIFIED";
	/**
	* @generated from enum value: OUTPUT_FORMAT_NAME_STATUS = 1;
	*/
	GetDiffRequest_OutputFormat[GetDiffRequest_OutputFormat["OUTPUT_FORMAT_NAME_STATUS"] = 1] = "OUTPUT_FORMAT_NAME_STATUS";
	/**
	* @generated from enum value: OUTPUT_FORMAT_NAME_STATUS_AND_NUMSTAT = 2;
	*/
	GetDiffRequest_OutputFormat[GetDiffRequest_OutputFormat["OUTPUT_FORMAT_NAME_STATUS_AND_NUMSTAT"] = 2] = "OUTPUT_FORMAT_NAME_STATUS_AND_NUMSTAT";
	/**
	* @generated from enum value: OUTPUT_FORMAT_FILE_DIFFS = 3;
	*/
	GetDiffRequest_OutputFormat[GetDiffRequest_OutputFormat["OUTPUT_FORMAT_FILE_DIFFS"] = 3] = "OUTPUT_FORMAT_FILE_DIFFS";
	/**
	* @generated from enum value: OUTPUT_FORMAT_DIFFS_WITH_BEFORE_AND_AFTER = 4;
	*/
	GetDiffRequest_OutputFormat[GetDiffRequest_OutputFormat["OUTPUT_FORMAT_DIFFS_WITH_BEFORE_AND_AFTER"] = 4] = "OUTPUT_FORMAT_DIFFS_WITH_BEFORE_AND_AFTER";
})(GetDiffRequest_OutputFormat || (GetDiffRequest_OutputFormat = {}));
/**
* @generated from enum agent.v1.GitDiff_DiffType
*/
var GitDiff_DiffType;
(function(GitDiff_DiffType) {
	/**
	* @generated from enum value: DIFF_TYPE_UNSPECIFIED = 0;
	*/
	GitDiff_DiffType[GitDiff_DiffType["DIFF_TYPE_UNSPECIFIED"] = 0] = "DIFF_TYPE_UNSPECIFIED";
	/**
	* @generated from enum value: DIFF_TYPE_DIFF_TO_HEAD = 1;
	*/
	GitDiff_DiffType[GitDiff_DiffType["DIFF_TYPE_DIFF_TO_HEAD"] = 1] = "DIFF_TYPE_DIFF_TO_HEAD";
	/**
	* @generated from enum value: DIFF_TYPE_DIFF_FROM_BRANCH_TO_MAIN = 2;
	*/
	GitDiff_DiffType[GitDiff_DiffType["DIFF_TYPE_DIFF_FROM_BRANCH_TO_MAIN"] = 2] = "DIFF_TYPE_DIFF_FROM_BRANCH_TO_MAIN";
})(GitDiff_DiffType || (GitDiff_DiffType = {}));
//#endregion
//#region lib/types/catalog.js
/**
* Frozen seed catalog plus GetUsableModels refresh after sign-in.
* Cursor encodes thinking level and speed in the wire id; we collapse thinking
* levels into one family and keep Fast as its own model. Fetch sorts Auto,
* then Cursor (Composer, Cursor Grok 4.5/4.6, and other first-party SKUs),
* then other brands. Fetch may offer a `-1m` sibling for families Cursor
* actually has Max Context for; a saved catalog keeps only the rows you picked.
*/
const GET_USABLE_MODELS_PATH = "/agent.v1.AgentService/GetUsableModels";
function fallbackCursorCatalog() {
	return CURSOR_CATALOG.map((model) => ({ ...model }));
}
function catalogFromSettings(models) {
	if (models === void 0) return fallbackCursorCatalog();
	return groupCursorModels(models);
}
function parseUsableModels(models) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	for (const entry of models) {
		if (entry.modelId.length === 0 || seen.has(entry.modelId)) continue;
		seen.add(entry.modelId);
		const short = entry.displayNameShort;
		const name = entry.modelId === "default" || entry.modelId === "auto" ? entry.displayName.length > 0 && entry.displayName !== "default" && entry.displayName !== "auto" ? entry.displayName : "Auto" : short !== void 0 && short.length > 0 ? short : entry.displayName.length > 0 ? entry.displayName : entry.modelId;
		const displayModelId = entry.displayModelId;
		out.push({
			id: entry.modelId,
			name,
			thinking: entry.thinkingDetails !== void 0,
			vision: true,
			...entry.maxMode === true ? { maxMode: true } : {},
			...displayModelId !== void 0 && displayModelId.length > 0 ? { displayModelId } : {}
		});
	}
	return out;
}
async function readCursorModels(request) {
	const origin = request.apiURL ?? "https://api2.cursor.sh";
	const payload = toBinary(GetUsableModelsRequestSchema, create(GetUsableModelsRequestSchema, {}));
	const response = await connectUnaryProto({
		origin,
		path: GET_USABLE_MODELS_PATH,
		headers: cursorRequestHeaders(request.accessToken),
		body: payload,
		...request.signal === void 0 ? {} : { signal: request.signal }
	});
	const models = groupCursorModels(parseUsableModels(fromBinary(GetUsableModelsResponseSchema, response).models), "brand");
	if (models.length === 0) throw new Error("Cursor returned no models");
	return models;
}
//#endregion
//#region lib/types/session.js
/**
* Host-only Cursor OAuth session file. Tokens never leave this module through
* the RPC contract; the browser only sees {@link statusFromSession}.
*/
/** File name under `$DSH_HOME`. Never `~/.cursor` auth files. */
const CURSOR_SESSION_FILENAME = "cursor-oauth.json";
function isRecord$2(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function expandHome(path) {
	if (path === "~") return homedir();
	if (path.startsWith("~/") || path.startsWith("~\\")) return join(homedir(), path.slice(2));
	return path;
}
function resolveCursorSessionPath(ctx) {
	const fromEnv = launchEnvironmentOf(ctx).get("DSH_HOME")?.value;
	const home = fromEnv !== void 0 && fromEnv.trim().length > 0 ? expandHome(fromEnv.trim()) : join(homedir(), ".dsh");
	return join(home, CURSOR_SESSION_FILENAME);
}
function sessionPathForHome(dshHome) {
	return join(dshHome, CURSOR_SESSION_FILENAME);
}
function decodeCursorSession(value) {
	if (!isRecord$2(value)) return void 0;
	const accessToken = value["accessToken"];
	const refreshToken = value["refreshToken"];
	const expiresAt = value["expiresAt"];
	const email = value["email"];
	const userId = value["userId"];
	if (typeof accessToken !== "string" || accessToken.length === 0) return void 0;
	if (typeof refreshToken !== "string" || refreshToken.length === 0) return void 0;
	if (typeof expiresAt !== "string" || expiresAt.length === 0 || Number.isNaN(Date.parse(expiresAt))) return;
	if (email !== void 0 && (typeof email !== "string" || email.length === 0)) return void 0;
	if (userId !== void 0 && (typeof userId !== "string" || userId.length === 0)) return void 0;
	return {
		accessToken,
		refreshToken,
		expiresAt,
		...email === void 0 ? {} : { email },
		...userId === void 0 ? {} : { userId }
	};
}
async function readSession(path) {
	try {
		const raw = await readFile(path, "utf8");
		return decodeCursorSession(JSON.parse(raw));
	} catch {
		return;
	}
}
async function writeSession(path, session) {
	await mkdir(dirname(path), { recursive: true });
	const tmp = `${path}.${randomBytes(8).toString("hex")}.tmp`;
	const body = `${JSON.stringify(session, null, 2)}\n`;
	try {
		await writeFile(tmp, body, {
			encoding: "utf8",
			mode: 384
		});
		await chmod(tmp, 384);
		await rename(tmp, path);
		await chmod(path, 384);
	} catch (error) {
		await unlink(tmp).catch(() => void 0);
		throw error;
	}
}
async function deleteSession(path) {
	try {
		await unlink(path);
	} catch (error) {
		if (error.code !== "ENOENT") throw error;
	}
}
function statusFromSession(session) {
	if (session === void 0) return { loggedIn: false };
	return {
		loggedIn: true,
		...session.email === void 0 ? {} : { email: session.email },
		expiresAt: session.expiresAt
	};
}
//#endregion
//#region lib/types/usage.js
/**
* Host-only Cursor usage reads. The browser receives a decoded window view.
*/
const CURSOR_USAGE_URL = `${CURSOR_API_URL}/auth/usage`;
const CURSOR_AUTH_ME_URL = "https://cursor.com/api/auth/me";
function isRecord$1(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function toNumber(value) {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string" && value.length > 0) {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : void 0;
	}
}
/** Official dashboard "Usage limits reset on …" comes from billingCycleEnd. */
function parseCursorBillingReset(payload) {
	if (!isRecord$1(payload)) return void 0;
	const value = payload["billingCycleEnd"];
	if (typeof value === "string" && value.length > 0) {
		const parsed = Date.parse(value);
		return Number.isFinite(parsed) ? new Date(parsed).toISOString() : void 0;
	}
	if (typeof value === "number" && Number.isFinite(value) && value > 0) {
		const ms = value < 0xe8d4a51000 ? value * 1e3 : value;
		const date = new Date(ms);
		return Number.isNaN(date.getTime()) ? void 0 : date.toISOString();
	}
}
function roundPercent(value) {
	return Math.round(value * 10) / 10;
}
function windowOf(id, used, limit, period) {
	return {
		id,
		used,
		limit: limit === void 0 ? 0 : limit,
		...period === void 0 ? {} : { period }
	};
}
/** Decode GET /auth/usage. A null maxRequestUsage still yields a used window. */
function parseCursorAuthUsage(payload) {
	if (!isRecord$1(payload)) return [];
	const windows = [];
	for (const [key, value] of Object.entries(payload)) {
		if (!isRecord$1(value)) continue;
		const used = toNumber(value["numRequests"]) ?? toNumber(value["used"]) ?? toNumber(value["amountUsed"]) ?? toNumber(value["usdUsed"]);
		const limit = toNumber(value["maxRequestUsage"]) ?? toNumber(value["limit"]) ?? toNumber(value["amountLimit"]) ?? toNumber(value["usdLimit"]);
		if (used === void 0) continue;
		windows.push(windowOf(key, used, limit));
	}
	return windows;
}
/** Decode cursor.com/api/usage-summary individualUsage. */
function parseCursorUsageSummary(payload) {
	if (!isRecord$1(payload) || !isRecord$1(payload["individualUsage"])) return [];
	const individual = payload["individualUsage"];
	const windows = [];
	const plan = isRecord$1(individual["plan"]) ? individual["plan"] : void 0;
	const overall = isRecord$1(individual["overall"]) ? individual["overall"] : void 0;
	const onDemand = isRecord$1(individual["onDemand"]) ? individual["onDemand"] : void 0;
	const auto = plan === void 0 ? void 0 : toNumber(plan["autoPercentUsed"]);
	const api = plan === void 0 ? void 0 : toNumber(plan["apiPercentUsed"]);
	if (auto !== void 0) windows.push({
		id: "Cursor Models",
		used: roundPercent(auto),
		limit: 100,
		unit: "percent"
	});
	if (api !== void 0) windows.push({
		id: "Other Models",
		used: roundPercent(api),
		limit: 100,
		unit: "percent"
	});
	if (windows.length === 0 && overall !== void 0) {
		const used = toNumber(overall["used"]);
		const limit = toNumber(overall["limit"]);
		if (used !== void 0) windows.push(windowOf("Personal Usage", used, limit));
	}
	if (onDemand !== void 0) {
		const used = toNumber(onDemand["used"]);
		const limit = toNumber(onDemand["limit"]);
		if (used !== void 0 && (used > 0 || limit !== void 0 && limit > 0)) windows.push(windowOf("On-Demand", used, limit));
	}
	return windows;
}
/** Drop leftover 0 / Unlimited request buckets (e.g. gpt-4 from /auth/usage). */
function usefulUsageWindows(windows) {
	return windows.filter((window) => window.unit === "percent" || window.used > 0 || window.limit > 0);
}
function parseCursorAuthMeEmail(payload) {
	if (!isRecord$1(payload)) return void 0;
	if (typeof payload["email"] === "string" && payload["email"].length > 0) return payload["email"];
	const user = payload["user"];
	if (isRecord$1(user) && typeof user["email"] === "string" && user["email"].length > 0) return user["email"];
}
async function readCursorAccountEmail(request) {
	const fetchImpl = request.fetch ?? fetch;
	const cookie = `WorkosCursorSessionToken=${encodeURIComponent(`${request.userId}::${request.accessToken}`)}`;
	try {
		return parseCursorAuthMeEmail(await readJson(fetchImpl, request.authMeURL ?? "https://cursor.com/api/auth/me", {
			accept: "application/json",
			cookie
		}, request.signal));
	} catch {
		return;
	}
}
async function readJson(fetchImpl, url, headers, signal) {
	const response = await fetchImpl(url, {
		headers,
		redirect: "error",
		...signal === void 0 ? {} : { signal }
	});
	if (!response.ok) {
		await response.body?.cancel();
		throw new Error(`Cursor usage read failed: ${String(response.status)}`);
	}
	return await response.json();
}
async function readCursorUsage(request) {
	const fetchImpl = request.fetch ?? fetch;
	const now = request.now ?? Date.now;
	const headers = {
		accept: "application/json",
		...cursorRequestHeaders(request.accessToken)
	};
	const authWindows = parseCursorAuthUsage(await readJson(fetchImpl, request.usageURL ?? CURSOR_USAGE_URL, headers, request.signal));
	let summaryWindows = [];
	let resetsAt;
	if (request.userId !== void 0 && request.userId.length > 0) {
		const sessionHeaders = {
			accept: "application/json",
			cookie: "WorkosCursorSessionToken=" + encodeURIComponent(request.userId + "::" + request.accessToken)
		};
		try {
			const summary = await readJson(fetchImpl, request.usageSummaryURL ?? "https://cursor.com/api/usage-summary", sessionHeaders, request.signal);
			summaryWindows = parseCursorUsageSummary(summary);
			resetsAt = parseCursorBillingReset(summary);
		} catch {}
		try {
			const email = parseCursorAuthMeEmail(await readJson(fetchImpl, request.authMeURL ?? "https://cursor.com/api/auth/me", sessionHeaders, request.signal));
			if (email !== void 0) await request.onEmail?.(email);
		} catch {}
	}
	const windows = usefulUsageWindows(summaryWindows.length > 0 ? summaryWindows : authWindows);
	if (windows.length === 0) return { status: "unsupported" };
	return {
		status: "ok",
		usage: {
			fetchedAt: new Date(now()).toISOString(),
			windows,
			...resetsAt === void 0 ? {} : { resetsAt }
		}
	};
}
//#endregion
//#region lib/types/oauth.js
/**
* Host-owned Cursor Deep Control login (PKCE + poll).
* Tokens stay on the Host; this module never logs Authorization headers.
*/
const CURSOR_LOGIN_URL = "https://cursor.com/loginDeepControl";
const CURSOR_POLL_URL = "https://api2.cursor.sh/auth/poll";
const CURSOR_REFRESH_URL = "https://api2.cursor.sh/auth/exchange_user_api_key";
const CURSOR_POLL_BASE_DELAY_MS = 1e3;
const CURSOR_POLL_MAX_DELAY_MS = 1e4;
const CURSOR_POLL_BACKOFF = 1.2;
const CURSOR_REFRESH_SKEW_MS = 3e5;
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function retryable(message) {
	return {
		ok: false,
		retryable: true,
		message
	};
}
function randomUrlSafe(bytes) {
	return randomBytes(bytes).toString("base64url");
}
function generatePkce() {
	const verifier = randomUrlSafe(32);
	return {
		verifier,
		challenge: createHash("sha256").update(verifier).digest("base64url")
	};
}
function decodeJwtPayload(token) {
	const parts = token.split(".");
	const payload = parts[1];
	if (parts.length !== 3 || payload === void 0) return void 0;
	try {
		const json = Buffer.from(payload, "base64url").toString("utf8");
		const value = JSON.parse(json);
		return isRecord(value) ? value : void 0;
	} catch {
		return;
	}
}
function extractCursorAccessTokenEmail(accessToken) {
	const email = decodeJwtPayload(accessToken)?.["email"];
	return typeof email === "string" && email.length > 0 ? email : void 0;
}
function extractCursorAccessTokenUserId(accessToken) {
	const sub = decodeJwtPayload(accessToken)?.["sub"];
	if (typeof sub !== "string" || sub.length === 0) return void 0;
	const parts = sub.split("|");
	const userId = (parts.length > 1 ? parts[1] : sub)?.trim();
	return userId === void 0 || userId.length === 0 ? void 0 : userId;
}
function firstNonEmpty(...values) {
	for (const value of values) if (value !== void 0 && value.length > 0) return value;
}
function isCursorUnauthorized(error) {
	if (error instanceof Error) {
		const status = "failure" in error && typeof error.failure?.status === "number" ? error.failure.status : void 0;
		if (status === 401 || status === 403) return true;
		if (/401|403|unauthor/iu.test(error.message)) return true;
	}
	return false;
}
function tokenExpiryMs(token, now) {
	const exp = decodeJwtPayload(token)?.["exp"];
	if (typeof exp === "number" && Number.isFinite(exp)) return exp * 1e3 - CURSOR_REFRESH_SKEW_MS;
	return now() + 36e5;
}
function isCursorTokenExpiringSoon(token, now, skewMs = CURSOR_REFRESH_SKEW_MS) {
	const exp = decodeJwtPayload(token)?.["exp"];
	if (typeof exp !== "number" || !Number.isFinite(exp)) return true;
	return exp * 1e3 - now() < skewMs;
}
async function defaultOpenBrowser(url) {
	const command = process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open";
	const args = process.platform === "win32" ? [
		"/c",
		"start",
		"",
		url
	] : [url];
	await new Promise((resolve, reject) => {
		const child = spawn(command, args, {
			stdio: "ignore",
			detached: true
		});
		child.on("error", reject);
		child.unref();
		resolve();
	});
}
function createCursorAuthRuntime(overrides) {
	return {
		loginURL: CURSOR_LOGIN_URL,
		pollURL: CURSOR_POLL_URL,
		refreshURL: CURSOR_REFRESH_URL,
		authMeURL: CURSOR_AUTH_ME_URL,
		openBrowser: defaultOpenBrowser,
		fetch,
		now: () => Date.now(),
		sleep: (ms) => new Promise((resolve) => {
			setTimeout(resolve, ms);
		}),
		pollMaxAttempts: 150,
		pollBaseDelayMs: CURSOR_POLL_BASE_DELAY_MS,
		pollMaxDelayMs: CURSOR_POLL_MAX_DELAY_MS,
		refreshSkewMs: CURSOR_REFRESH_SKEW_MS,
		...overrides
	};
}
async function pollCursorAuth(runtime, uuid, verifier, signal) {
	let delay = runtime.pollBaseDelayMs;
	let consecutiveErrors = 0;
	for (let attempt = 0; attempt < runtime.pollMaxAttempts; attempt++) {
		if (signal?.aborted) throw new Error("Sign-in was cancelled.");
		await runtime.sleep(delay);
		if (signal?.aborted) throw new Error("Sign-in was cancelled.");
		try {
			const response = await runtime.fetch(`${runtime.pollURL}?uuid=${encodeURIComponent(uuid)}&verifier=${encodeURIComponent(verifier)}`, signal === void 0 ? {} : { signal });
			if (response.status === 404) {
				consecutiveErrors = 0;
				delay = Math.min(delay * CURSOR_POLL_BACKOFF, runtime.pollMaxDelayMs);
				continue;
			}
			if (response.ok) {
				const data = await response.json();
				if (!isRecord(data)) throw new Error("Poll returned an invalid body.");
				const accessToken = data["accessToken"];
				const refreshToken = data["refreshToken"];
				if (typeof accessToken !== "string" || accessToken.length === 0) throw new Error("Poll returned no access token.");
				if (typeof refreshToken !== "string" || refreshToken.length === 0) throw new Error("Poll returned no refresh token.");
				const email = data["email"];
				return {
					accessToken,
					refreshToken,
					...typeof email === "string" && email.length > 0 ? { email } : {}
				};
			}
			throw new Error(`Poll failed: ${String(response.status)}`);
		} catch (error) {
			if (signal?.aborted) throw new Error("Sign-in was cancelled.");
			consecutiveErrors++;
			if (consecutiveErrors >= 3) throw error instanceof Error ? error : /* @__PURE__ */ new Error("Too many consecutive errors during Cursor auth polling");
		}
	}
	throw new Error("Cursor authentication polling timeout");
}
function sessionFromTokens(runtime, accessToken, refreshToken, previous, pollEmail) {
	const userId = extractCursorAccessTokenUserId(accessToken) ?? previous?.userId;
	const email = firstNonEmpty(pollEmail, extractCursorAccessTokenEmail(accessToken), previous?.email);
	return {
		accessToken,
		refreshToken,
		expiresAt: new Date(tokenExpiryMs(accessToken, runtime.now)).toISOString(),
		...email === void 0 ? {} : { email },
		...userId === void 0 ? {} : { userId }
	};
}
async function sessionWithAccountEmail(runtime, session, signal) {
	if (session.email !== void 0 || session.userId === void 0) return session;
	const email = await readCursorAccountEmail({
		accessToken: session.accessToken,
		userId: session.userId,
		authMeURL: runtime.authMeURL,
		fetch: runtime.fetch,
		...signal === void 0 ? {} : { signal }
	});
	if (email === void 0) return session;
	return {
		...session,
		email
	};
}
async function refreshStoredSession(runtime) {
	const path = runtime.resolveSessionPath();
	const session = await readSession(path);
	if (session === void 0) throw new Error("Cursor session is missing.");
	const withEmail = await sessionWithAccountEmail(runtime, await refreshCursorToken(runtime, session.refreshToken, session));
	await writeSession(path, withEmail);
	return withEmail;
}
async function withUnauthorizedRetry(runtime, accessToken, run) {
	try {
		return await run(accessToken);
	} catch (error) {
		if (!isCursorUnauthorized(error)) throw error;
		return await run((await refreshStoredSession(runtime)).accessToken);
	}
}
async function refreshCursorToken(runtime, apiKeyOrRefreshToken, previous) {
	const response = await runtime.fetch(runtime.refreshURL, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKeyOrRefreshToken}`,
			"Content-Type": "application/json"
		},
		body: "{}"
	});
	if (!response.ok) throw new Error(`Cursor token refresh failed: ${String(response.status)}`);
	const data = await response.json();
	if (!isRecord(data)) throw new Error("Cursor token refresh returned an invalid body.");
	const accessToken = data["accessToken"];
	const refreshToken = data["refreshToken"];
	if (typeof accessToken !== "string" || accessToken.length === 0) throw new Error("Cursor token refresh returned no access token.");
	return sessionFromTokens(runtime, accessToken, typeof refreshToken === "string" && refreshToken.length > 0 ? refreshToken : apiKeyOrRefreshToken, previous);
}
async function startPkceLogin(runtime, signal) {
	const { verifier, challenge } = generatePkce();
	const uuid = crypto.randomUUID();
	const params = new URLSearchParams({
		challenge,
		uuid,
		mode: "login",
		redirectTarget: "cli"
	});
	const loginUrl = `${runtime.loginURL}?${params.toString()}`;
	try {
		await runtime.openBrowser(loginUrl);
		const tokens = await pollCursorAuth(runtime, uuid, verifier, signal);
		const session = await sessionWithAccountEmail(runtime, sessionFromTokens(runtime, tokens.accessToken, tokens.refreshToken, void 0, tokens.email), signal);
		await writeSession(runtime.resolveSessionPath(), session);
		return { ok: true };
	} catch (error) {
		return retryable(error instanceof Error && error.message.length > 0 ? error.message : "Sign-in did not complete.");
	}
}
async function ensureFreshSession(runtime) {
	const path = runtime.resolveSessionPath();
	const session = await readSession(path);
	if (session === void 0) return void 0;
	if (!isCursorTokenExpiringSoon(session.accessToken, runtime.now, runtime.refreshSkewMs)) {
		const withEmail = await sessionWithAccountEmail(runtime, session);
		if (withEmail.email !== void 0 && session.email === void 0) await writeSession(path, withEmail);
		return withEmail;
	}
	try {
		const withEmail = await sessionWithAccountEmail(runtime, await refreshCursorToken(runtime, session.refreshToken, session));
		await writeSession(path, withEmail);
		return withEmail;
	} catch {
		await deleteSession(path);
		return;
	}
}
//#endregion
//#region lib/types/park.js
/**
* Park an unfinished HTTP/2 Run until the next DSH turn writes mcpResult.
* Heartbeats continue; silence is local wait and does not trip stream idle.
*/
const parks = /* @__PURE__ */ new Map();
function sessionKeyOf(sessionId) {
	return sessionId ?? "__default__";
}
function getParkedRun(sessionId) {
	return parks.get(sessionKeyOf(sessionId));
}
function setParkedRun(parked) {
	parks.set(parked.sessionKey, parked);
}
function trailingToolResults(messages) {
	const out = [];
	for (let i = messages.length - 1; i >= 0; i--) {
		const message = messages[i];
		if (message === void 0 || message.role !== "user" || message.source.kind !== "tool") break;
		const block = message.content[0];
		const text = block?.type === "tool-result" ? block.content.filter((item) => item.type === "text").map((item) => item.text).join("\n") : "";
		const isError = block?.type === "tool-result" && block.isError === true;
		out.unshift({
			callId: message.source.callId,
			text,
			isError
		});
	}
	return out;
}
function parkMatches(parked, messages) {
	const results = trailingToolResults(messages);
	if (results.length === 0 || parked.calls.length === 0) return false;
	const have = new Set(results.map((result) => result.callId));
	return parked.calls.every((call) => have.has(call.envelopeCallId));
}
function pairParkResults(parked, messages) {
	const results = trailingToolResults(messages);
	const byId = new Map(results.map((result) => [result.callId, result]));
	return parked.calls.flatMap((call) => {
		const result = byId.get(call.envelopeCallId);
		if (result === void 0) return [];
		return [{
			call,
			text: result.text,
			isError: result.isError
		}];
	});
}
function closeParkedRun(parked) {
	if (parked.closed) return;
	parked.closed = true;
	if (parked.heartbeat !== void 0) clearInterval(parked.heartbeat);
	parked.heartbeat = void 0;
	try {
		parked.stream.destroy();
	} catch {}
	try {
		parked.session.destroy();
	} catch {}
	if (parks.get(parked.sessionKey) === parked) parks.delete(parked.sessionKey);
}
function clearPark(sessionId) {
	const parked = getParkedRun(sessionId);
	if (parked !== void 0) closeParkedRun(parked);
}
function parkCompletedMcp(parked, completed, pending) {
	const unused = [...pending];
	parked.calls = completed.map((block) => {
		const matchIndex = unused.findIndex((item) => item.name === block.name || item.toolCallId === block.envelopeCallId);
		const match = matchIndex >= 0 ? unused.splice(matchIndex, 1)[0] : unused.shift();
		return {
			envelopeCallId: block.envelopeCallId,
			pending: match ?? {
				execId: block.envelopeCallId,
				execMessageId: 0,
				toolCallId: block.envelopeCallId,
				name: block.name
			}
		};
	});
	setParkedRun(parked);
}
//#endregion
//#region lib/types/history.js
/**
* Rebuild Cursor conversationState from DSH messages.
* Checkpoint history is not authoritative.
*/
async function loadCursorImages(messages, store, signal) {
	const out = /* @__PURE__ */ new Map();
	if (store === void 0) return out;
	for (const message of messages) for (const block of message.content) {
		if (block.type !== "image") continue;
		const id = block.attachment.attachmentId;
		if (out.has(id)) continue;
		const stored = await store.readImage(block.attachment, signal);
		out.set(id, {
			data: stored.data,
			mediaType: stored.ref.mediaType,
			width: stored.ref.width,
			height: stored.ref.height
		});
	}
	return out;
}
function createBlobId(data) {
	return new Uint8Array(createHash("sha256").update(data).digest());
}
function storeCursorBlob(blobStore, data) {
	const blobId = createBlobId(data);
	blobStore.set(Buffer.from(blobId).toString("hex"), data);
	return blobId;
}
function readCursorBlob(blobStore, blobId) {
	return blobStore.get(Buffer.from(blobId).toString("hex"));
}
function isToolResult(message) {
	return message.role === "user" && message.source.kind === "tool";
}
function isUserTurn(message) {
	return message.role === "user" && message.source.kind === "user";
}
/** Active user only when the request ends on a new user turn; tool-result tails resume. */
function findActiveUserMessageIndex(messages) {
	const last = messages[messages.length - 1];
	if (last === void 0 || !isUserTurn(last)) return -1;
	return messages.length - 1;
}
function assistantMatches(message, provider, model) {
	return message.role === "assistant" && message.source.kind === "model" && message.source.provider === provider && message.source.model === model;
}
function textOf(message) {
	return message.content.filter((block) => block.type === "text").map((block) => block.text).join("\n").trim();
}
function imageIdsOf(message) {
	const ids = [];
	for (const block of message.content) if (block.type === "image") ids.push(block.attachment.attachmentId);
	return ids;
}
function selectedImagesOf(message, blobStore, images) {
	if (images === void 0 || images.size === 0) return [];
	const selected = [];
	for (const id of imageIdsOf(message)) {
		const bytes = images.get(id);
		if (bytes === void 0) continue;
		const blobId = storeCursorBlob(blobStore, bytes.data);
		selected.push(create(SelectedImageSchema, {
			uuid: deterministicUuid(`img:${id}`),
			mimeType: bytes.mediaType,
			dimension: create(SelectedImage_DimensionSchema, {
				width: bytes.width,
				height: bytes.height
			}),
			dataOrBlobId: {
				case: "blobIdWithData",
				value: create(SelectedImage_BlobIdWithDataSchema, {
					blobId,
					data: bytes.data
				})
			}
		}));
	}
	return selected;
}
function toolResultText(message) {
	const block = message.content[0];
	if (block?.type !== "tool-result") return textOf(message);
	return block.content.filter((item) => item.type === "text").map((item) => item.text).join("\n");
}
function deterministicUuid(seed) {
	const hash = createHash("sha256").update(seed).digest();
	const bytes = Buffer.from(hash.subarray(0, 16));
	bytes[6] = bytes[6] & 15 | 64;
	bytes[8] = bytes[8] & 63 | 128;
	const hex = bytes.toString("hex");
	return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
function systemPromptJsons(system) {
	const trimmed = system?.trim() ?? "";
	if (trimmed.length === 0) return [JSON.stringify({
		role: "system",
		content: "You are a helpful assistant."
	})];
	return [JSON.stringify({
		role: "system",
		content: trimmed
	})];
}
function buildRootPromptMessagesJson(messages, system, blobStore, activeUserMessageIndex, provider, model) {
	const entries = systemPromptJsons(system).map((json) => storeCursorBlob(blobStore, new TextEncoder().encode(json)));
	const pushJson = (obj) => {
		entries.push(storeCursorBlob(blobStore, new TextEncoder().encode(JSON.stringify(obj))));
	};
	const paired = /* @__PURE__ */ new Set();
	for (const message of messages) {
		if (!assistantMatches(message, provider, model)) continue;
		for (const block of message.content) if (block.type === "tool-call") paired.add(block.id);
	}
	for (let i = 0; i < messages.length; i++) {
		if (i === activeUserMessageIndex) break;
		const msg = messages[i];
		if (msg === void 0) continue;
		if (isUserTurn(msg)) {
			const content = textOf(msg);
			if (content.length === 0) continue;
			pushJson({
				role: "user",
				content
			});
		} else if (msg.role === "assistant") {
			const parts = [];
			for (const block of msg.content) {
				if (block.type === "text" && block.text.length > 0) parts.push({
					type: "text",
					text: block.text
				});
				if (block.type === "reasoning" && assistantMatches(msg, provider, model) && block.text.length > 0) parts.push({
					type: "thinking",
					thinking: block.text
				});
				if (block.type === "tool-call") {
					if (assistantMatches(msg, provider, model)) parts.push({
						type: "tool-call",
						id: block.id,
						name: block.name,
						arguments: block.arguments
					});
					else {
						const args = block.arguments.trim();
						parts.push({
							type: "text",
							text: args.length > 0 ? `[${block.name}] ${args}` : `[${block.name}]`
						});
					}
				}
			}
			if (parts.length === 0) continue;
			pushJson({
				role: "assistant",
				content: parts
			});
		} else if (isToolResult(msg) && msg.source.kind === "tool") {
			const resultBlock = msg.content[0];
			const isError = resultBlock?.type === "tool-result" ? resultBlock.isError === true : false;
			const text = toolResultText(msg);
			if (!paired.has(msg.source.callId)) {
				pushJson({
					role: "assistant",
					content: [{
						type: "text",
						text: `${isError ? "[Tool Error]" : "[Tool Result]"}\n${text}`
					}]
				});
				continue;
			}
			pushJson({
				role: "tool",
				id: msg.source.callId,
				content: [{
					type: "tool-result",
					toolCallId: msg.source.callId,
					result: text,
					...isError ? { isError: true } : {}
				}]
			});
		}
	}
	return entries;
}
function encodeMcpArguments(raw) {
	let parsed;
	try {
		parsed = JSON.parse(raw);
	} catch {
		parsed = {};
	}
	if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return {};
	const encoded = {};
	for (const [name, value] of Object.entries(parsed)) {
		if (value === void 0) continue;
		encoded[name] = toBinary(ValueSchema, fromJson(ValueSchema, value));
	}
	return encoded;
}
function mcpResultFor(message) {
	if (message === void 0) return void 0;
	const text = toolResultText(message);
	if (message.content[0]?.type === "tool-result" && message.content[0].isError === true) return create(McpToolResultSchema, { result: {
		case: "error",
		value: create(McpToolErrorSchema, { error: text })
	} });
	return create(McpToolResultSchema, { result: {
		case: "success",
		value: create(McpSuccessSchema, { content: [create(McpToolResultContentItemSchema, { content: {
			case: "text",
			value: create(McpTextContentSchema, { text })
		} })] })
	} });
}
function buildConversationTurns(messages, blobStore, activeUserMessageIndex, provider, model, images) {
	const turns = [];
	const historyEnd = activeUserMessageIndex >= 0 ? activeUserMessageIndex : messages.length;
	const toolResults = /* @__PURE__ */ new Map();
	const paired = /* @__PURE__ */ new Set();
	for (let i = 0; i < historyEnd; i++) {
		const message = messages[i];
		if (message === void 0) continue;
		if (isToolResult(message) && message.source.kind === "tool") toolResults.set(message.source.callId, message);
		else if (message.role === "assistant" && assistantMatches(message, provider, model)) {
			for (const block of message.content) if (block.type === "tool-call") paired.add(block.id);
		}
	}
	let i = 0;
	while (i < messages.length) {
		const msg = messages[i];
		if (msg === void 0 || !isUserTurn(msg)) {
			i++;
			continue;
		}
		if (i === activeUserMessageIndex) break;
		const userText = textOf(msg);
		const selectedImages = selectedImagesOf(msg, blobStore, images);
		if (userText.length === 0 && selectedImages.length === 0) {
			i++;
			continue;
		}
		const userMessage = create(UserMessageSchema, {
			text: userText,
			messageId: deterministicUuid(`u:${String(turns.length)}:${userText}`),
			...selectedImages.length > 0 ? { selectedContext: create(SelectedContextSchema, { selectedImages }) } : {}
		});
		const userMessageBlobId = storeCursorBlob(blobStore, toBinary(UserMessageSchema, userMessage));
		const stepBlobIds = [];
		i++;
		while (i < messages.length) {
			const stepMsg = messages[i];
			if (stepMsg === void 0 || isUserTurn(stepMsg)) break;
			if (stepMsg.role === "assistant") {
				for (const item of stepMsg.content) if (item.type === "text" && item.text.length > 0) stepBlobIds.push(storeCursorBlob(blobStore, toBinary(ConversationStepSchema, create(ConversationStepSchema, { message: {
					case: "assistantMessage",
					value: create(AssistantMessageSchema, { text: item.text })
				} }))));
				else if (item.type === "reasoning" && assistantMatches(stepMsg, provider, model) && item.text.length > 0) stepBlobIds.push(storeCursorBlob(blobStore, toBinary(ConversationStepSchema, create(ConversationStepSchema, { message: {
					case: "thinkingMessage",
					value: create(ThinkingMessageSchema, { text: item.text })
				} }))));
				else if (item.type === "tool-call") {
					if (!assistantMatches(stepMsg, provider, model)) {
						const args = item.arguments.trim();
						const text = args.length > 0 ? `[${item.name}] ${args}` : `[${item.name}]`;
						stepBlobIds.push(storeCursorBlob(blobStore, toBinary(ConversationStepSchema, create(ConversationStepSchema, { message: {
							case: "assistantMessage",
							value: create(AssistantMessageSchema, { text })
						} }))));
						continue;
					}
					const result = toolResults.get(item.id);
					const mcpCall = create(McpToolCallSchema, {
						args: create(McpArgsSchema, {
							name: item.name,
							args: encodeMcpArguments(item.arguments),
							toolCallId: item.id,
							providerIdentifier: CURSOR_MCP_PROVIDER_ID,
							toolName: item.name
						}),
						...result === void 0 ? {} : { result: mcpResultFor(result) }
					});
					stepBlobIds.push(storeCursorBlob(blobStore, toBinary(ConversationStepSchema, create(ConversationStepSchema, { message: {
						case: "toolCall",
						value: create(ToolCallSchema, {
							tool: {
								case: "mcpToolCall",
								value: mcpCall
							},
							toolCallId: item.id
						})
					} }))));
				}
			} else if (isToolResult(stepMsg) && stepMsg.source.kind === "tool" && !paired.has(stepMsg.source.callId)) {
				const text = toolResultText(stepMsg);
				const prefix = stepMsg.content[0]?.type === "tool-result" && stepMsg.content[0].isError === true ? "[Tool Error]" : "[Tool Result]";
				stepBlobIds.push(storeCursorBlob(blobStore, toBinary(ConversationStepSchema, create(ConversationStepSchema, { message: {
					case: "assistantMessage",
					value: create(AssistantMessageSchema, { text: `${prefix}\n${text}` })
				} }))));
			}
			i++;
		}
		const agentTurn = create(AgentConversationTurnStructureSchema, {
			userMessage: userMessageBlobId,
			steps: stepBlobIds
		});
		turns.push(storeCursorBlob(blobStore, toBinary(ConversationTurnStructureSchema, create(ConversationTurnStructureSchema, { turn: {
			case: "agentConversationTurn",
			value: agentTurn
		} }))));
	}
	return turns;
}
function buildRunAction(messages, activeUserMessageIndex, blobStore, images) {
	const active = activeUserMessageIndex >= 0 ? messages[activeUserMessageIndex] : void 0;
	const userText = active !== void 0 && isUserTurn(active) ? textOf(active) : "";
	const selectedImages = active !== void 0 ? selectedImagesOf(active, blobStore, images) : [];
	if (active !== void 0 && isUserTurn(active) && (userText.length > 0 || selectedImages.length > 0)) return create(ConversationActionSchema, { action: {
		case: "userMessageAction",
		value: create(UserMessageActionSchema, { userMessage: create(UserMessageSchema, {
			text: userText,
			messageId: deterministicUuid(`active:${userText}`),
			...selectedImages.length > 0 ? { selectedContext: create(SelectedContextSchema, { selectedImages }) } : {}
		}) })
	} });
	return create(ConversationActionSchema, { action: {
		case: "resumeAction",
		value: create(ResumeActionSchema, {})
	} });
}
function buildConversationState(messages, system, blobStore, provider, model, images) {
	const activeUserMessageIndex = findActiveUserMessageIndex(messages);
	return {
		conversationState: create(ConversationStateStructureSchema, {
			rootPromptMessagesJson: buildRootPromptMessagesJson(messages, system, blobStore, activeUserMessageIndex, provider, model),
			turns: buildConversationTurns(messages, blobStore, activeUserMessageIndex, provider, model, images),
			todos: [],
			pendingToolCalls: [],
			previousWorkspaceUris: [],
			fileStates: {},
			fileStatesV2: {},
			summaryArchives: []
		}),
		action: buildRunAction(messages, activeUserMessageIndex, blobStore, images),
		activeUserMessageIndex
	};
}
//#endregion
//#region lib/types/exec.js
/**
* Cursor exec / KV handshake. DSH never executes native tools.
*/
const NATIVE_TOOL_NAMES = /* @__PURE__ */ new Set([
	"bash",
	"read",
	"write",
	"delete",
	"ls",
	"grep",
	"lsp",
	"todo"
]);
const REJECT_REASON = "Tools are executed by DeepSeek Harness. Use the provided tools.";
function buildMcpToolDefinitions(tools) {
	if (tools === void 0 || tools.length === 0) return [];
	return tools.filter((tool) => !NATIVE_TOOL_NAMES.has(tool.name)).map((tool) => {
		const schema = tool.parameters;
		const inputSchema = toBinary(ValueSchema, fromJson(ValueSchema, schema));
		return create(McpToolDefinitionSchema, {
			name: tool.name,
			description: tool.description,
			providerIdentifier: CURSOR_MCP_PROVIDER_ID,
			toolName: tool.name,
			inputSchema
		});
	});
}
function writeClient(stream, message) {
	stream.write(frameConnectMessage(toBinary(AgentClientMessageSchema, message)));
}
function handleKvServerMessage(kvMsg, blobStore, stream) {
	const kvCase = kvMsg.message.case;
	if (kvCase === "getBlobArgs") {
		const blobId = kvMsg.message.value.blobId;
		const blobData = readCursorBlob(blobStore, blobId);
		writeClient(stream, create(AgentClientMessageSchema, { message: {
			case: "kvClientMessage",
			value: create(KvClientMessageSchema, {
				id: kvMsg.id,
				message: {
					case: "getBlobResult",
					value: create(GetBlobResultSchema, blobData === void 0 ? {} : { blobData })
				}
			})
		} }));
		return;
	}
	if (kvCase === "setBlobArgs") {
		const { blobId, blobData } = kvMsg.message.value;
		blobStore.set(Buffer.from(blobId).toString("hex"), blobData);
		writeClient(stream, create(AgentClientMessageSchema, { message: {
			case: "kvClientMessage",
			value: create(KvClientMessageSchema, {
				id: kvMsg.id,
				message: {
					case: "setBlobResult",
					value: create(SetBlobResultSchema, {})
				}
			})
		} }));
	}
}
function rejectNative(stream, execMsg, caseName) {
	const reason = REJECT_REASON;
	const result = (() => {
		switch (caseName) {
			case "shellArgs":
			case "shellStreamArgs": return {
				case: "shellResult",
				value: create(ShellResultSchema, { result: {
					case: "rejected",
					value: create(ShellRejectedSchema, { reason })
				} })
			};
			case "readArgs": return {
				case: "readResult",
				value: create(ReadResultSchema, { result: {
					case: "rejected",
					value: create(ReadRejectedSchema, { reason })
				} })
			};
			case "writeArgs": return {
				case: "writeResult",
				value: create(WriteResultSchema, { result: {
					case: "rejected",
					value: create(WriteRejectedSchema, { reason })
				} })
			};
			case "deleteArgs": return {
				case: "deleteResult",
				value: create(DeleteResultSchema, { result: {
					case: "rejected",
					value: create(DeleteRejectedSchema, { reason })
				} })
			};
			case "lsArgs": return {
				case: "lsResult",
				value: create(LsResultSchema, { result: {
					case: "rejected",
					value: create(LsRejectedSchema, { reason })
				} })
			};
			case "grepArgs": return {
				case: "grepResult",
				value: create(GrepResultSchema, { result: {
					case: "error",
					value: create(GrepErrorSchema, { error: reason })
				} })
			};
			case "piBashArgs": return {
				case: "piBashResult",
				value: create(PiBashExecResultSchema, { result: {
					case: "error",
					value: create(PiBashExecErrorSchema, { error: reason })
				} })
			};
			default: return;
		}
	})();
	if (result === void 0) return;
	writeClient(stream, create(AgentClientMessageSchema, { message: {
		case: "execClientMessage",
		value: create(ExecClientMessageSchema, {
			id: execMsg.id,
			execId: execMsg.execId,
			message: result
		})
	} }));
}
function handleExecServerMessage(execMsg, stream, tools, pending) {
	const execCase = execMsg.message.case;
	if (execCase === "requestContextArgs") {
		writeClient(stream, create(AgentClientMessageSchema, { message: {
			case: "execClientMessage",
			value: create(ExecClientMessageSchema, {
				id: execMsg.id,
				execId: execMsg.execId,
				message: {
					case: "requestContextResult",
					value: create(RequestContextResultSchema, { result: {
						case: "success",
						value: create(RequestContextSuccessSchema, { requestContext: create(RequestContextSchema, { tools: buildMcpToolDefinitions(tools) }) })
					} })
				}
			})
		} }));
		return "context";
	}
	if (execCase === "mcpArgs") {
		const args = execMsg.message.value;
		const name = args.toolName || args.name;
		if (args.smartModeApprovalOnly) {
			const allowed = (tools ?? []).some((tool) => tool.name === name);
			writeClient(stream, create(AgentClientMessageSchema, { message: {
				case: "execClientMessage",
				value: create(ExecClientMessageSchema, {
					id: execMsg.id,
					execId: execMsg.execId,
					message: {
						case: "mcpResult",
						value: create(McpResultSchema, { result: allowed ? {
							case: "approved",
							value: create(McpApprovedSchema, {})
						} : {
							case: "rejected",
							value: create(McpRejectedSchema, { reason: `Tool "${name}" is not advertised.` })
						} })
					}
				})
			} }));
			return "mcp-probe";
		}
		pending.push({
			execId: execMsg.execId,
			execMessageId: execMsg.id,
			toolCallId: args.toolCallId || crypto.randomUUID(),
			name
		});
		return "mcp-invoke";
	}
	if (execCase === "listMcpResourcesExecArgs" || execCase === "readMcpResourceExecArgs") {
		writeClient(stream, create(AgentClientMessageSchema, { message: {
			case: "execClientMessage",
			value: create(ExecClientMessageSchema, {
				id: execMsg.id,
				execId: execMsg.execId,
				message: {
					case: "listMcpResourcesExecResult",
					value: create(ListMcpResourcesExecResultSchema, { result: {
						case: "success",
						value: create(ListMcpResourcesSuccessSchema, { resources: [] })
					} })
				}
			})
		} }));
		return "ignored";
	}
	if (execCase !== void 0) {
		rejectNative(stream, execMsg, execCase);
		return "native-reject";
	}
	return "ignored";
}
function writeMcpResult(stream, pending, text, isError) {
	writeClient(stream, create(AgentClientMessageSchema, { message: {
		case: "execClientMessage",
		value: create(ExecClientMessageSchema, {
			id: pending.execMessageId,
			execId: pending.execId,
			message: {
				case: "mcpResult",
				value: create(McpResultSchema, { result: isError ? {
					case: "error",
					value: create(McpErrorSchema, { error: text })
				} : {
					case: "success",
					value: create(McpSuccessSchema, {
						content: [create(McpToolResultContentItemSchema, { content: {
							case: "text",
							value: create(McpTextContentSchema, { text })
						} })],
						isError: false
					})
				} })
			}
		})
	} }));
}
//#endregion
//#region lib/types/interaction.js
/**
* Map Cursor interactionUpdate frames onto DSH StreamChunks.
* args_text_delta is a cumulative snapshot; only the unmatched suffix is emitted.
*/
const SERVER_OWNED_CASES = /* @__PURE__ */ new Set([
	"updateTodosToolCall",
	"readTodosToolCall",
	"connectScmToolCall"
]);
function isIgnoredToolCall(toolCall) {
	const toolCase = toolCall?.tool.case;
	if (toolCase === void 0) return true;
	if (toolCase === "mcpToolCall") return false;
	return true;
}
function mcpToolName(toolCall) {
	if (toolCall?.tool.case !== "mcpToolCall") return void 0;
	const args = toolCall.tool.value.args;
	const name = args?.toolName || args?.name;
	return name === void 0 || name.length === 0 ? void 0 : name;
}
function snapshotDelta(previous, snapshot) {
	if (snapshot.startsWith(previous)) return snapshot.slice(previous.length);
	return snapshot;
}
var InteractionMapper = class {
	nextIndex = 0;
	textIndex;
	text = "";
	reasoningIndex;
	reasoning = "";
	mcp = /* @__PURE__ */ new Map();
	outputTokens = 0;
	inputTokens = 0;
	sawTokenDelta = false;
	turnEnded = false;
	chunks = [];
	take() {
		const out = this.chunks;
		this.chunks = [];
		return out;
	}
	openMcpBlocks() {
		return [...this.mcp.values()];
	}
	completedMcpBlocks() {
		return [...this.mcp.values()].filter((block) => block.completed);
	}
	hasIncompleteMcp() {
		return [...this.mcp.values()].some((block) => !block.completed);
	}
	applyCheckpointUsedTokens(used) {
		if (!this.sawTokenDelta) this.inputTokens = used;
	}
	handle(update) {
		const msgCase = update.message.case;
		if (msgCase === "textDelta") {
			this.ensureText();
			const text = update.message.value.text;
			this.text += text;
			this.chunks.push({
				type: "text-delta",
				index: this.textIndex,
				text
			});
			return;
		}
		if (msgCase === "thinkingDelta") {
			this.ensureReasoning();
			const text = update.message.value.text;
			this.reasoning += text;
			this.chunks.push({
				type: "reasoning-delta",
				index: this.reasoningIndex,
				text
			});
			return;
		}
		if (msgCase === "thinkingCompleted") {
			this.closeReasoning();
			return;
		}
		if (msgCase === "tokenDelta") {
			this.sawTokenDelta = true;
			this.outputTokens += update.message.value.tokens;
			return;
		}
		if (msgCase === "turnEnded") {
			this.closeText();
			this.closeReasoning();
			this.turnEnded = true;
			return;
		}
		if (msgCase === "toolCallStarted") {
			this.openMcp(update.message.value.callId, update.message.value.toolCall);
			return;
		}
		if (msgCase === "partialToolCall") {
			this.applyArgsSnapshot(update.message.value.callId, update.message.value.argsTextDelta, update.message.value.toolCall);
			return;
		}
		if (msgCase === "toolCallDelta") return;
		if (msgCase === "toolCallCompleted") this.completeMcp(update.message.value.callId, update.message.value.toolCall);
	}
	flushOpenText() {
		this.closeText();
		this.closeReasoning();
	}
	ensureText() {
		if (this.textIndex !== void 0) return;
		this.closeReasoning();
		this.textIndex = this.nextIndex++;
		this.text = "";
		this.chunks.push({
			type: "block-start",
			index: this.textIndex,
			blockType: "text"
		});
	}
	closeText() {
		if (this.textIndex === void 0) return;
		this.chunks.push({
			type: "block-end",
			index: this.textIndex,
			block: {
				type: "text",
				text: this.text
			}
		});
		this.textIndex = void 0;
		this.text = "";
	}
	ensureReasoning() {
		if (this.reasoningIndex !== void 0) return;
		this.closeText();
		this.reasoningIndex = this.nextIndex++;
		this.reasoning = "";
		this.chunks.push({
			type: "block-start",
			index: this.reasoningIndex,
			blockType: "reasoning"
		});
	}
	closeReasoning() {
		if (this.reasoningIndex === void 0) return;
		this.chunks.push({
			type: "block-end",
			index: this.reasoningIndex,
			block: {
				type: "reasoning",
				text: this.reasoning
			}
		});
		this.reasoningIndex = void 0;
		this.reasoning = "";
	}
	openMcp(envelopeCallId, toolCall) {
		if (isIgnoredToolCall(toolCall)) return;
		if (this.mcp.has(envelopeCallId)) return;
		this.closeText();
		this.closeReasoning();
		const name = mcpToolName(toolCall) ?? "tool";
		const index = this.nextIndex++;
		this.mcp.set(envelopeCallId, {
			envelopeCallId,
			index,
			name,
			arguments: "",
			completed: false
		});
		this.chunks.push({
			type: "block-start",
			index,
			blockType: "tool-call"
		});
		this.chunks.push({
			type: "tool-call-delta",
			index,
			id: CallId(envelopeCallId),
			name,
			argumentsDelta: ""
		});
	}
	applyArgsSnapshot(envelopeCallId, snapshot, toolCall) {
		if (isIgnoredToolCall(toolCall) && !this.mcp.has(envelopeCallId)) return;
		if (!this.mcp.has(envelopeCallId)) this.openMcp(envelopeCallId, toolCall);
		const block = this.mcp.get(envelopeCallId);
		if (block === void 0 || block.completed) return;
		const name = mcpToolName(toolCall);
		if (name !== void 0) block.name = name;
		const delta = snapshotDelta(block.arguments, snapshot);
		block.arguments = snapshot.startsWith(block.arguments) ? snapshot : snapshot;
		if (delta.length === 0) return;
		this.chunks.push({
			type: "tool-call-delta",
			index: block.index,
			id: CallId(envelopeCallId),
			name: block.name,
			argumentsDelta: delta
		});
	}
	completeMcp(envelopeCallId, toolCall) {
		if (isIgnoredToolCall(toolCall) && !this.mcp.has(envelopeCallId)) return;
		if (SERVER_OWNED_CASES.has(toolCall?.tool.case ?? "")) return;
		if (!this.mcp.has(envelopeCallId)) this.openMcp(envelopeCallId, toolCall);
		const block = this.mcp.get(envelopeCallId);
		if (block === void 0) return;
		const name = mcpToolName(toolCall);
		if (name !== void 0) block.name = name;
		if (toolCall?.tool.case === "mcpToolCall") {
			if (toolCall.tool.value.args !== void 0 && block.arguments.length === 0) block.arguments = "{}";
		}
		block.completed = true;
		const finished = {
			type: "tool-call",
			id: CallId(envelopeCallId),
			name: block.name,
			arguments: block.arguments.length > 0 ? block.arguments : "{}"
		};
		this.chunks.push({
			type: "block-end",
			index: block.index,
			block: finished
		});
	}
};
//#endregion
//#region lib/types/run.js
/**
* One DSH GenerateOptions turn: start or resume a Cursor AgentService/Run.
*/
const DEFAULT_HEARTBEAT_INTERVAL_MS = 5e3;
const bindings = /* @__PURE__ */ new Map();
function conversationBinding(sessionId) {
	const key = sessionKeyOf(sessionId);
	const existing = bindings.get(key);
	if (existing !== void 0) return existing;
	const created = {
		conversationId: crypto.randomUUID(),
		blobStore: /* @__PURE__ */ new Map()
	};
	bindings.set(key, created);
	return created;
}
function rotateConversationId(sessionId) {
	const key = sessionKeyOf(sessionId);
	const next = {
		conversationId: crypto.randomUUID(),
		blobStore: /* @__PURE__ */ new Map()
	};
	bindings.set(key, next);
	return next.conversationId;
}
function catalogModel$1(catalog, id) {
	return findCatalogModel(catalog, id);
}
function writeAgent(stream, message) {
	stream.write(frameConnectMessage(toBinary(AgentClientMessageSchema, message)));
}
function startHeartbeat(parked, intervalMs) {
	if (parked.heartbeat !== void 0) clearInterval(parked.heartbeat);
	parked.heartbeat = setInterval(() => {
		if (parked.closed) return;
		try {
			writeAgent(parked.stream, create(AgentClientMessageSchema, { message: {
				case: "clientHeartbeat",
				value: create(ClientHeartbeatSchema, {})
			} }));
		} catch {}
	}, intervalMs);
	parked.heartbeat.unref?.();
}
function usageOf(mapper) {
	return {
		inputTokens: mapper.inputTokens,
		outputTokens: mapper.outputTokens
	};
}
async function drainWork(parked) {
	if (parked.pendingWork.length === 0) return;
	const work = parked.pendingWork.splice(0);
	await Promise.all(work);
}
function handleServerMessage(parked, message, tools, pending) {
	const msgCase = message.message.case;
	if (msgCase === "kvServerMessage" && message.message.value !== void 0) {
		const kvMsg = message.message.value;
		const work = Promise.resolve().then(() => {
			handleKvServerMessage(kvMsg, parked.blobStore, parked.stream);
		});
		parked.pendingWork.push(work);
		return;
	}
	if (msgCase === "execServerMessage" && message.message.value !== void 0) {
		const execMsg = message.message.value;
		parked.localWork = true;
		const work = Promise.resolve().then(() => {
			handleExecServerMessage(execMsg, parked.stream, tools, pending);
		});
		parked.pendingWork.push(work);
		return;
	}
	if (msgCase === "conversationCheckpointUpdate" && message.message.value !== void 0) {
		const used = message.message.value.tokenDetails?.usedTokens;
		if (used !== void 0) parked.mapper.applyCheckpointUsedTokens(used);
		return;
	}
	if (msgCase === "interactionUpdate" && message.message.value !== void 0) parked.mapper.handle(message.message.value);
}
async function waitChunkOrIdle(parked, idleMs) {
	if (parked.localWork || idleMs <= 0) return parked.waitChunk();
	let timer;
	try {
		return await Promise.race([parked.waitChunk(), new Promise((resolve) => {
			timer = setTimeout(() => {
				resolve("idle");
			}, idleMs);
			timer.unref?.();
		})]);
	} finally {
		if (timer !== void 0) clearTimeout(timer);
	}
}
async function readOnePayload(parked, idleMs) {
	for (;;) {
		const taken = takeConnectFrames(parked.inbox);
		parked.inbox = taken.rest;
		const frame = taken.frames[0];
		if (frame !== void 0) {
			if (taken.frames.length > 1) parked.inbox = Buffer.concat([...taken.frames.slice(1).map((item) => frameConnectMessage(item.payload, item.flags)), parked.inbox]);
			if ((frame.flags & 2) !== 0) {
				const error = parseConnectEndStream(frame.payload);
				if (error !== null) throw error;
				return "end";
			}
			return frame.payload;
		}
		const chunk = await waitChunkOrIdle(parked, idleMs);
		if (chunk === "idle") throw new LlmError("llm-cursor: provider stream idle timeout", "TIMEOUT");
		if (chunk === void 0) return "end";
		parked.inbox = Buffer.concat([parked.inbox, chunk]);
	}
}
function cursorHttpStatusError(status) {
	if (status === 401 || status === 403) return new LlmError("llm-cursor: Cursor session was rejected", "AUTH", { status });
	if (status === 429) return new LlmError("llm-cursor: Cursor session was rate limited", "RATE_LIMIT", { status });
	if (status >= 500) return new LlmError("llm-cursor: Cursor service failed", "SERVER", { status });
	if (status >= 400) return new LlmError("llm-cursor: Cursor request was rejected", "INVALID_REQUEST", { status });
}
async function* continueRun(parked, options, runtime, pending) {
	const onAbort = () => {
		clearPark(options.sessionId);
	};
	options.signal?.addEventListener("abort", onAbort, { once: true });
	try {
		for (;;) {
			if (options.signal?.aborted) {
				closeParkedRun(parked);
				throw new LlmError("llm-cursor: request aborted", "ABORTED");
			}
			const payload = await readOnePayload(parked, runtime.streamIdleTimeoutMs);
			if (payload === "end") {
				if (options.signal?.aborted) {
					closeParkedRun(parked);
					throw new LlmError("llm-cursor: request aborted", "ABORTED");
				}
				break;
			}
			const statusError = cursorHttpStatusError(parked.getHttpStatus());
			if (statusError !== void 0) throw statusError;
			handleServerMessage(parked, fromBinary(AgentServerMessageSchema, payload), options.tools, pending);
			await drainWork(parked);
			parked.localWork = false;
			for (const chunk of parked.mapper.take()) yield chunk;
			if (parked.mapper.completedMcpBlocks().length > 0 && !parked.mapper.hasIncompleteMcp() && pending.length >= parked.mapper.completedMcpBlocks().length) {
				parked.mapper.flushOpenText();
				for (const chunk of parked.mapper.take()) yield chunk;
				parkCompletedMcp(parked, parked.mapper.completedMcpBlocks(), pending);
				startHeartbeat(parked, runtime.heartbeatIntervalMs);
				parked.localWork = true;
				yield {
					type: "usage",
					usage: usageOf(parked.mapper)
				};
				yield {
					type: "finish",
					reason: { kind: "tool-calls" }
				};
				return;
			}
			if (parked.mapper.turnEnded) {
				await drainWork(parked);
				parked.mapper.flushOpenText();
				for (const chunk of parked.mapper.take()) yield chunk;
				yield {
					type: "usage",
					usage: usageOf(parked.mapper)
				};
				yield {
					type: "finish",
					reason: { kind: "stop" }
				};
				closeParkedRun(parked);
				return;
			}
		}
		const trailerError = grpcStatusError(parked.trailers);
		if (trailerError !== void 0) throw trailerError;
		const statusError = cursorHttpStatusError(parked.getHttpStatus());
		if (statusError !== void 0) throw statusError;
		if (!parked.mapper.turnEnded) throw new LlmError("llm-cursor: stream ended before turnEnded", "TRANSPORT");
	} catch (error) {
		if (options.signal?.aborted) {
			closeParkedRun(parked);
			throw new LlmError("llm-cursor: request aborted", "ABORTED");
		}
		if (isResourceExhausted(error) && parked.mapper.outputTokens === 0) rotateConversationId(options.sessionId);
		closeParkedRun(parked);
		if (error instanceof LlmError) throw error;
		if (error instanceof CursorWireError) {
			if (["canceled", "1"].includes(error.wireCode)) throw new LlmError(`llm-cursor: ${error.message}`, "ABORTED");
			if ([
				"permission_denied",
				"7",
				"unauthenticated",
				"16"
			].includes(error.wireCode)) {
				const status = ["unauthenticated", "16"].includes(error.wireCode) ? 401 : 403;
				throw new LlmError(`llm-cursor: ${error.message}`, "AUTH", { status });
			}
			if (["invalid_argument", "3"].includes(error.wireCode)) throw new LlmError(`llm-cursor: ${error.message}`, "INVALID_REQUEST");
			if (["deadline_exceeded", "4"].includes(error.wireCode)) throw new LlmError(`llm-cursor: ${error.message}`, "TIMEOUT");
		}
		const message = error instanceof Error && error.message.length > 0 ? error.message : "Cursor Run failed";
		const code = /401|403|unauthor/iu.test(message) ? "AUTH" : /429/.test(message) ? "RATE_LIMIT" : "SERVER";
		const status = /HTTP 401\b/u.test(message) || message.includes("session was rejected") ? 401 : /HTTP 403\b/u.test(message) ? 403 : void 0;
		throw new LlmError(`llm-cursor: ${message}`, code, status === void 0 ? {} : { status });
	} finally {
		options.signal?.removeEventListener("abort", onAbort);
	}
}
function buildRunRequest(options, binding, model, images) {
	const built = buildConversationState(options.messages, options.system, binding.blobStore, options.provider, options.model, images);
	const wireId = resolveCursorWireId(model, options.reasoningEffort);
	const maxMode = variantMaxMode(model, options.reasoningEffort);
	return create(AgentRunRequestSchema, {
		conversationState: built.conversationState,
		action: built.action,
		conversationId: binding.conversationId,
		modelDetails: create(ModelDetailsSchema, {
			modelId: wireId,
			...maxMode ? { maxMode: true } : {}
		}),
		requestedModel: create(RequestedModelSchema, {
			modelId: wireId,
			maxMode
		})
	});
}
async function* runCursorTurn(options, runtime) {
	if (options.stop !== void 0 && options.stop.length > 0) runtime.debug?.("llm-cursor: GenerateOptions.stop is ignored");
	const model = catalogModel$1(runtime.catalog, options.model);
	if (model === void 0) throw new LlmError(`llm-cursor: model ${options.model} is not in the Cursor catalog`, "INVALID_REQUEST");
	const existing = getParkedRun(options.sessionId);
	if (existing !== void 0 && !existing.closed && parkMatches(existing, options.messages)) {
		existing.localWork = true;
		existing.mapper = new InteractionMapper();
		const pending = [];
		for (const pair of pairParkResults(existing, options.messages)) writeMcpResult(existing.stream, pair.call.pending, pair.text, pair.isError);
		existing.calls = [];
		yield* continueRun(existing, options, runtime, pending);
		return;
	}
	if (existing !== void 0) closeParkedRun(existing);
	const binding = conversationBinding(options.sessionId);
	const opened = openConnectStream(runtime.apiURL, RUN_PATH, cursorRequestHeaders(runtime.accessToken));
	const parked = {
		sessionKey: sessionKeyOf(options.sessionId),
		conversationId: binding.conversationId,
		session: opened.session,
		stream: opened.stream,
		blobStore: binding.blobStore,
		calls: [],
		mapper: new InteractionMapper(),
		localWork: false,
		closed: false,
		heartbeat: void 0,
		pendingWork: [],
		push: opened.push,
		waitChunk: opened.waitChunk,
		trailers: opened.trailers,
		getHttpStatus: opened.getHttpStatus,
		inbox: Buffer.alloc(0)
	};
	startHeartbeat(parked, runtime.heartbeatIntervalMs);
	writeAgent(parked.stream, create(AgentClientMessageSchema, { message: {
		case: "runRequest",
		value: buildRunRequest(options, binding, model, runtime.images)
	} }));
	yield* continueRun(parked, options, runtime, []);
}
//#endregion
//#region lib/types/adapter.js
/**
* Cursor subscription chat adapter. Implements LlmAdapter directly.
*/
async function resolveCursorAccessToken(runtime) {
	const existing = await readSession(runtime.resolveSessionPath());
	const session = await ensureFreshSession(runtime);
	if (session !== void 0) return session.accessToken;
	const fromEnv = process.env["CURSOR_ACCESS_TOKEN"];
	if (fromEnv !== void 0 && fromEnv.length > 0) return fromEnv;
	if (existing !== void 0) throw new LlmError("llm-cursor: session refresh failed; sign in again from Plugin configuration", "AUTH");
	throw new LlmError("llm-cursor: not signed in; sign in with a Cursor subscription from Plugin configuration", "MISSING_CREDENTIAL");
}
async function refreshCursorAccessToken(runtime) {
	try {
		return (await refreshStoredSession(runtime)).accessToken;
	} catch {
		throw new LlmError("llm-cursor: session refresh failed; sign in again from Plugin configuration", "AUTH");
	}
}
function asModelInfo(model) {
	return {
		provider: CURSOR_PROVIDER,
		id: model.id,
		name: model.name ?? model.id,
		...model.vision === true ? { inputModalities: ["text", "image"] } : { inputModalities: ["text"] }
	};
}
var CursorAdapter = class extends LlmAdapter {
	config;
	constructor(config) {
		super();
		this.config = config;
	}
	providerInfo(provider) {
		return {
			id: provider,
			name: "Cursor"
		};
	}
	providerRetryPolicy(_provider) {
		return this.config.options().retryPolicy;
	}
	async listModels(_provider) {
		return this.config.options().models.map(asModelInfo);
	}
	resolveModel(provider, model, _signal) {
		const found = findCatalogModel(this.config.options().models, model);
		if (found === void 0) return Promise.reject(new LlmError(`llm-cursor: model ${model} is not in the Cursor catalog`, "INVALID_REQUEST"));
		const efforts = effortsForCursorModel(found);
		const defaultEffort = resolveCursorDefaultEffort(found);
		const reasoning = efforts.length > 0 && defaultEffort !== void 0 ? {
			efforts: efforts.map((effort) => ({
				id: ReasoningEffortId(effort),
				name: CURSOR_EFFORT_LABELS[effort]
			})),
			defaultEffort: ReasoningEffortId(defaultEffort)
		} : void 0;
		return Promise.resolve({
			...asModelInfo(found),
			provider,
			context: { contextWindow: found.contextWindow ?? (isCursorMaxRow(found.id) ? 1e6 : 2e5) },
			...reasoning === void 0 ? {} : { reasoning }
		});
	}
	stream(options) {
		const runtime = this.config.options();
		const self = this;
		return (async function* () {
			const run = async function* (accessToken) {
				const images = await loadCursorImages(options.messages, self.config.resolveAttachments?.(), options.signal);
				yield* runCursorTurn(options, {
					apiURL: runtime.apiURL,
					accessToken,
					catalog: runtime.models,
					heartbeatIntervalMs: runtime.heartbeatIntervalMs,
					streamIdleTimeoutMs: runtime.streamIdleTimeoutMs,
					...images.size > 0 ? { images } : {},
					...self.config.debug === void 0 ? {} : { debug: self.config.debug }
				});
			};
			try {
				let accessToken = await self.config.resolveApiKey();
				let yielded = false;
				try {
					for await (const chunk of run(accessToken)) {
						yielded = true;
						yield chunk;
					}
					return;
				} catch (error) {
					if (options.signal?.aborted) {
						clearPark(options.sessionId);
						throw error;
					}
					if (yielded || self.config.refreshApiKey === void 0 || !isCursorUnauthorized(error)) throw error;
					accessToken = await self.config.refreshApiKey();
					yield* run(accessToken);
				}
			} catch (error) {
				if (options.signal?.aborted) clearPark(options.sessionId);
				throw error;
			}
		})();
	}
};
function defaultCursorConnection(overrides) {
	return {
		apiURL: CURSOR_API_URL,
		models: CURSOR_CATALOG,
		heartbeatIntervalMs: DEFAULT_HEARTBEAT_INTERVAL_MS,
		...overrides
	};
}
//#endregion
//#region lib/types/index.js
/**
* Register the `cursor` provider, the AgentService chat adapter,
* the `llm-cursor` settings section, and the loopback `/cursor` RPC.
* @module dsh-llm-cursor
*/
const name = "llm-cursor";
const inject = ["llm"];
const NS = settingsNamespace(CURSOR_SETTINGS_NAMESPACE);
function resolveAdapterOptions(config) {
	const streamIdleTimeoutMs = config.streamIdleTimeoutMs ?? 3e5;
	if (!Number.isFinite(streamIdleTimeoutMs) || streamIdleTimeoutMs <= 0 || streamIdleTimeoutMs > MAX_TIMER_DELAY_MS) throw new Error(`llm-cursor: streamIdleTimeoutMs must be a positive finite number no greater than ${MAX_TIMER_DELAY_MS}`);
	return {
		apiURL: CURSOR_API_URL,
		models: catalogFromSettings(config.models),
		streamIdleTimeoutMs,
		heartbeatIntervalMs: DEFAULT_HEARTBEAT_INTERVAL_MS,
		retryPolicy: resolveRetryPolicy(config.retryPolicy, "llm-cursor: retryPolicy")
	};
}
const catalogEffort = z.union([
	z.const("none"),
	z.const("low"),
	z.const("medium"),
	z.const("high"),
	z.const("xhigh"),
	z.const("max")
]);
const catalogVariant = z.object({
	wireId: z.string().required(),
	effort: catalogEffort,
	fast: z.boolean(),
	maxMode: z.boolean()
});
const catalogModel = z.object({
	id: z.string().required(),
	name: z.string(),
	thinking: z.boolean(),
	vision: z.boolean(),
	maxMode: z.boolean(),
	contextWindow: z.number().step(1).min(1),
	defaultEffort: catalogEffort,
	variants: z.array(catalogVariant),
	displayModelId: z.string()
});
const Config = z.object({
	streamIdleTimeoutMs: z.number().min(Number.MIN_VALUE).max(MAX_TIMER_DELAY_MS).default(CURSOR_DEFAULT_STREAM_IDLE_TIMEOUT_MS),
	retryPolicy: RetryPolicySchema,
	models: z.array(catalogModel)
});
function internalError(message) {
	return {
		ok: false,
		error: {
			code: "internal",
			message,
			details: {}
		}
	};
}
function rpcFailure(error, secrets, fallback) {
	let message = error instanceof Error && error.message.length > 0 ? error.message : fallback;
	for (const secret of secrets) {
		if (secret.length === 0) continue;
		message = message.split(secret).join("[redacted]");
	}
	return internalError(message);
}
function createCursorRpcHandler(runtime, options) {
	return async (endpoint, payload, signal) => {
		if (endpoint === "auth/start") {
			if (decodeCursorEmptyRequest(payload) === void 0) return internalError("invalid Cursor auth start request");
			return {
				ok: true,
				value: await startPkceLogin(runtime, signal)
			};
		}
		if (endpoint === "auth/status") {
			if (decodeCursorEmptyRequest(payload) === void 0) return internalError("invalid Cursor auth status request");
			return {
				ok: true,
				value: statusFromSession(await ensureFreshSession(runtime))
			};
		}
		if (endpoint === "auth/logout") {
			if (decodeCursorEmptyRequest(payload) === void 0) return internalError("invalid Cursor auth logout request");
			await deleteSession(runtime.resolveSessionPath());
			return {
				ok: true,
				value: { ok: true }
			};
		}
		if (endpoint === "models/list") {
			if (decodeCursorEmptyRequest(payload) === void 0) return internalError("invalid Cursor models request");
			const session = await ensureFreshSession(runtime);
			if (session === void 0) return internalError("Sign in to fetch Cursor models");
			try {
				return {
					ok: true,
					value: { models: await withUnauthorizedRetry(runtime, session.accessToken, (accessToken) => readCursorModels({
						accessToken,
						...options?.apiURL === void 0 ? {} : { apiURL: options.apiURL },
						signal
					})) }
				};
			} catch (error) {
				const latest = await readSession(runtime.resolveSessionPath());
				return rpcFailure(error, [
					session.accessToken,
					session.refreshToken,
					latest?.accessToken ?? "",
					latest?.refreshToken ?? ""
				], "Could not read Cursor models");
			}
		}
		if (endpoint === "settings/save") {
			const request = decodeCursorSaveRequest(payload);
			if (request === void 0) return internalError("invalid Cursor settings request");
			if (options?.saveCatalog === void 0) return internalError("Cursor settings are unavailable");
			try {
				return {
					ok: true,
					value: await options.saveCatalog(request)
				};
			} catch (error) {
				return internalError(error instanceof Error && error.message.length > 0 ? error.message : "Cursor settings save failed");
			}
		}
		if (endpoint === "usage/read") {
			if (decodeCursorEmptyRequest(payload) === void 0) return internalError("invalid Cursor usage request");
			const session = await ensureFreshSession(runtime);
			if (session === void 0) return {
				ok: true,
				value: { status: "logged-out" }
			};
			try {
				return {
					ok: true,
					value: await withUnauthorizedRetry(runtime, session.accessToken, (accessToken) => readCursorUsage({
						accessToken,
						...session.userId === void 0 ? {} : { userId: session.userId },
						...options?.usageURL === void 0 ? {} : { usageURL: options.usageURL },
						...options?.usageSummaryURL === void 0 ? {} : { usageSummaryURL: options.usageSummaryURL },
						...options?.authMeURL === void 0 ? {} : { authMeURL: options.authMeURL },
						fetch: runtime.fetch,
						now: runtime.now,
						signal,
						onEmail: async (email) => {
							const current = await readSession(runtime.resolveSessionPath());
							if (current === void 0 || current.email !== void 0) return;
							await writeSession(runtime.resolveSessionPath(), {
								...current,
								email
							});
						}
					}))
				};
			} catch (error) {
				const latest = await readSession(runtime.resolveSessionPath());
				return rpcFailure(error, [
					session.accessToken,
					session.refreshToken,
					latest?.accessToken ?? "",
					latest?.refreshToken ?? ""
				], "Cursor usage read failed");
			}
		}
		return internalError(`unknown Cursor endpoint: ${endpoint}`);
	};
}
function apply(ctx, config) {
	let current = () => config;
	let lastRaw;
	let lastGood;
	const options = () => {
		const raw = current();
		if (raw === lastRaw && lastGood !== void 0) return lastGood;
		try {
			const next = resolveAdapterOptions(raw);
			lastRaw = raw;
			lastGood = next;
			return next;
		} catch (error) {
			if (lastGood === void 0) throw error;
			lastRaw = raw;
			ctx.logger.error("llm-cursor: keeping the last good configuration after an invalid settings section");
			ctx.logger.error(error);
			return lastGood;
		}
	};
	options();
	const runtime = createCursorAuthRuntime({ resolveSessionPath: () => resolveCursorSessionPath(ctx) });
	const saveCatalog = async (request) => {
		const settings = ctx.get("settings");
		if (settings === void 0) throw new Error("Cursor settings are unavailable");
		const before = settings.describe().find((descriptor) => descriptor.ns === NS);
		if (before === void 0) throw new Error("Cursor settings are unavailable");
		const currentSettings = decodeCursorSettings(before.value);
		if (currentSettings === void 0) throw new Error("Cursor settings are invalid");
		const ops = [];
		if (!deepEqualJson(currentSettings.models, request.models)) ops.push({
			op: "set",
			path: ["models"],
			value: request.models
		});
		if (ops.length > 0) await settings.mutate(NS, ops, request.expectedRevision);
		const accepted = settings.describe().find((descriptor) => descriptor.ns === NS);
		const acceptedSettings = decodeCursorSettings(accepted?.value);
		if (accepted === void 0 || acceptedSettings === void 0) throw new Error("Cursor settings could not be reloaded");
		return {
			settings: acceptedSettings,
			revision: accepted.revision
		};
	};
	const adapter = new CursorAdapter({
		options,
		resolveApiKey: () => resolveCursorAccessToken(runtime),
		refreshApiKey: () => refreshCursorAccessToken(runtime),
		resolveAttachments: () => ctx.get("attachments")
	});
	ctx.llm.registerConfigurableProviders([{
		provider: CURSOR_PROVIDER,
		displayName: "Cursor",
		settingsNs: NS,
		settingsPath: []
	}]);
	const registration = ctx.llm.registerAdapter([CURSOR_PROVIDER], adapter);
	let registeredPolicy = options().retryPolicy;
	const ensureRegistrationFacts = () => {
		lastRaw = void 0;
		const policy = options().retryPolicy;
		if (deepEqualJson(policy, registeredPolicy)) return;
		registration.replace([CURSOR_PROVIDER]);
		registeredPolicy = policy;
	};
	ctx.inject(["connection"], (connectionCtx) => {
		connectionCtx.connection.rpc.handle(CURSOR_RPC_CHANNEL, createCursorRpcHandler(runtime, { saveCatalog }), { authority: "loopback" });
	});
	installSettingsSection(ctx, NS, Config, config, {
		setSource: (source) => {
			current = source;
		},
		onChange: ensureRegistrationFacts
	});
}
//#endregion
export { CURSOR_API_URL, CURSOR_AUTH_LOGOUT_ENDPOINT, CURSOR_AUTH_START_ENDPOINT, CURSOR_AUTH_STATUS_ENDPOINT, CURSOR_CATALOG, CURSOR_CLIENT_VERSION, CURSOR_DEFAULT_STREAM_IDLE_TIMEOUT_MS, CURSOR_LOGIN_URL, CURSOR_MCP_PROVIDER_ID, CURSOR_MODELS_ENDPOINT, CURSOR_PLUGIN_IDENTITY_HEADER, CURSOR_POLL_URL, CURSOR_PROVIDER, CURSOR_REFRESH_URL, CURSOR_RPC_CHANNEL, CURSOR_SAVE_ENDPOINT, CURSOR_SESSION_FILENAME, CURSOR_SETTINGS_NAMESPACE, CURSOR_USAGE_ENDPOINT, Config, CursorAdapter, DEFAULT_HEARTBEAT_INTERVAL_MS, apply, catalogFromSettings, createCursorAuthRuntime, createCursorRpcHandler, decodeCursorAuthLogoutReply, decodeCursorAuthStartReply, decodeCursorAuthStatus, decodeCursorEmptyRequest, decodeCursorModelsReply, decodeCursorSaveRequest, decodeCursorSaveResult, decodeCursorSettings, decodeCursorUsageReply, decodeCursorUsageView, defaultCursorConnection, deleteSession, effortsForCursorModel, ensureFreshSession, fallbackCursorCatalog, findCatalogModel, groupCursorModels, inject, name, parseCursorAuthMeEmail, parseCursorAuthUsage, parseCursorUsageSummary, readCursorModels, readCursorUsage, readSession, refreshCursorAccessToken, refreshCursorToken, refreshStoredSession, resolveAdapterOptions, resolveCursorAccessToken, resolveCursorSessionPath, resolveCursorWireId, sessionPathForHome, startPkceLogin, statusFromSession, usefulUsageWindows, withUnauthorizedRetry, writeSession };
