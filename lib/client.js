window.__ModuleLoader__.load({
	id: "dsh-llm-cursor",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let react_dom = require("react-dom");
		//#region src/client-contract.ts
		/** Browser-safe constants and JSON decoders shared by the Host and client plugin faces. */
		/** Settings namespace owned by the Cursor plugin. */
		const CURSOR_SETTINGS_NAMESPACE = "llm-cursor";
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
		}), Object.freeze({
			id: "composer-2.5-1m",
			name: "Composer 2.5 Max",
			thinking: true,
			vision: true,
			maxMode: true,
			contextWindow: 1e6
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
			if (name !== void 0 && (typeof name !== "string" || name.length === 0)) return void 0;
			if (thinking !== void 0 && typeof thinking !== "boolean") return void 0;
			if (vision !== void 0 && typeof vision !== "boolean") return void 0;
			if (maxMode !== void 0 && typeof maxMode !== "boolean") return void 0;
			if (contextWindow !== void 0 && (typeof contextWindow !== "number" || !Number.isInteger(contextWindow) || contextWindow <= 0)) return void 0;
			if (defaultEffort !== void 0 && (typeof defaultEffort !== "string" || !CURSOR_EFFORTS.has(defaultEffort))) return;
			if (fast !== void 0 && typeof fast !== "boolean") return void 0;
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
				...decodedVariants === void 0 ? {} : { variants: decodedVariants }
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
			if (value["ok"] === true) return { ok: true };
			if (value["retryable"] !== true || typeof value["message"] !== "string" || value["message"].length === 0) return;
			return {
				ok: false,
				retryable: true,
				message: value["message"]
			};
		}
		function decodeCursorAuthStatus(value) {
			if (!isRecord(value) || hasTokenFields(value) || typeof value["loggedIn"] !== "boolean") return void 0;
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
			return {
				fetchedAt,
				windows: decoded
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
		//#region src/client/provider-chrome.tsx
		const LABELS = /* @__PURE__ */ new Set(["供应商", "Providers"]);
		const MARK = "data-dsh-providers-icon";
		const REFRESH_PATH = "M1.272 6.21348C1.70645 3.08888 4.59169 0.908064 7.71634 1.34239C8.95495 1.51469 10.0438 2.07331 10.8814 2.87755L11.9458 1.81407C12.1347 1.6255 12.4572 1.75911 12.4575 2.02598V5.08751C12.4574 5.25303 12.3233 5.38731 12.1577 5.38731H9.0972C8.82993 5.38731 8.69629 5.06361 8.88528 4.87462L10.0327 3.72618C9.3732 3.09994 8.52006 2.66569 7.5513 2.53087C5.08313 2.18779 2.80376 3.91044 2.46048 6.37852C2.11747 8.84665 3.84009 11.1261 6.30814 11.4693C8.77612 11.8121 11.0557 10.0896 11.399 7.62169L11.9937 7.70372L12.5874 7.78673C12.153 10.9112 9.26756 13.0919 6.1431 12.6578C3.01854 12.2234 0.837738 9.33809 1.272 6.21348Z";
		const NAV = "<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" fill=\"currentColor\" d=\"M7.00018 0.353516C10.6708 0.353535 13.6468 3.32958 13.6469 7.00018C13.6468 10.6708 10.6708 13.6468 7.00018 13.6469C3.32957 13.6468 0.353535 10.6708 0.353516 7.00018C0.353535 3.32957 3.32957 0.353531 7.00018 0.353516ZM5.44643 7.59661C5.49463 8.97506 5.70762 10.191 6.02136 11.0793C6.20141 11.5891 6.40328 11.9585 6.59898 12.1889C6.79501 12.4196 6.93213 12.454 7.00018 12.454C7.06822 12.454 7.20533 12.4197 7.40138 12.1889C7.59708 11.9585 7.79895 11.589 7.979 11.0793C8.29274 10.191 8.50574 8.97506 8.55394 7.59661H5.44643ZM1.57861 7.59661C1.80785 9.70467 3.2386 11.4509 5.1715 12.1388C5.07135 11.9317 4.97972 11.7098 4.89746 11.477C4.53084 10.4391 4.30224 9.0828 4.25357 7.59661H1.57861ZM9.74679 7.59661C9.69813 9.0828 9.46952 10.4391 9.1029 11.477C9.0206 11.7099 8.92818 11.9316 8.82797 12.1388C10.7613 11.4511 12.1925 9.70496 12.4218 7.59661H9.74679ZM5.1706 1.8616C3.23814 2.54963 1.80876 4.29604 1.5795 6.40376H4.25357C4.30224 4.91756 4.53083 3.56129 4.89746 2.5234C4.97968 2.29066 5.07051 2.0686 5.1706 1.8616ZM7.00018 1.54637C6.93213 1.54638 6.79503 1.5807 6.59898 1.81145C6.40332 2.04177 6.20139 2.41058 6.02136 2.92012C5.70754 3.80851 5.49461 5.02499 5.44643 6.40376H8.55394C8.50575 5.025 8.29282 3.80851 7.979 2.92012C7.79898 2.41059 7.59705 2.04177 7.40138 1.81145C7.20531 1.58067 7.06823 1.54637 7.00018 1.54637ZM8.82887 1.8616C8.92902 2.0687 9.02064 2.29053 9.1029 2.5234C9.46953 3.56129 9.69812 4.91756 9.74679 6.40376H12.4209C12.1916 4.29575 10.7618 2.54943 8.82887 1.8616Z\"/>";
		function patchNav() {
			if (typeof document === "undefined") return;
			for (const button of document.querySelectorAll("nav button")) {
				if ([...button.querySelectorAll("span")].find((span) => LABELS.has(span.textContent?.trim() ?? "")) === void 0) continue;
				const svg = button.querySelector("svg");
				if (svg === null || svg.getAttribute(MARK) === "globe") continue;
				svg.setAttribute(MARK, "globe");
				svg.setAttribute("viewBox", "0 0 14 14");
				svg.setAttribute("fill", "none");
				svg.innerHTML = NAV;
			}
		}
		/** Use the official 14px globe glyph on the 供应商 nav row. */
		function installProvidersNavIcon() {
			if (typeof document === "undefined" || document.body === null) return () => {};
			ensureMotionStyles();
			let scheduled = false;
			let frame = 0;
			const flush = () => {
				scheduled = false;
				frame = 0;
				patchNav();
			};
			const observer = new MutationObserver(() => {
				if (scheduled) return;
				scheduled = true;
				frame = requestAnimationFrame(flush);
			});
			observer.observe(document.body, {
				childList: true,
				subtree: true
			});
			patchNav();
			return () => {
				observer.disconnect();
				if (frame !== 0) cancelAnimationFrame(frame);
				frame = 0;
				scheduled = false;
			};
		}
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
		const providerHeaderStyle = {
			boxSizing: "border-box",
			width: "100%",
			minHeight: 68,
			display: "flex",
			alignItems: "center",
			justifyContent: "space-between",
			gap: 16,
			border: 0,
			padding: "12px 14px",
			background: "transparent",
			color: "var(--dsw-alias-label-primary)",
			font: "inherit",
			textAlign: "left",
			cursor: "pointer"
		};
		/** Join connection status and model count: "已登录 · 8 个模型". */
		function formatProviderSummary(status, modelsLabel) {
			return status.replace(/[。.]$/u, "") + " · " + modelsLabel;
		}
		/** Fixed-height collapsed header: mark, title, status · count, chevron. */
		function ProviderCardHeader(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				style: {
					display: "flex",
					minWidth: 0,
					flex: 1,
					flexDirection: "column",
					gap: 4
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					style: {
						display: "inline-flex",
						alignItems: "center",
						gap: 8,
						fontSize: 14,
						fontWeight: 600,
						lineHeight: 1
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: {
							width: 18,
							height: 18,
							flex: "none",
							display: "block",
							overflow: "visible"
						},
						children: props.mark
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: { lineHeight: "20px" },
						children: props.title
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					style: {
						fontSize: 13,
						lineHeight: "18px",
						color: "var(--dsw-alias-label-tertiary)",
						whiteSpace: "nowrap",
						overflow: "hidden",
						textOverflow: "ellipsis"
					},
					children: props.summary
				})]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				style: {
					display: "inline-flex",
					alignItems: "center",
					gap: 10,
					flex: "none"
				},
				children: [props.unsaved === true && props.unsavedLabel !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					style: {
						fontSize: 12,
						color: "var(--dsw-alias-label-tertiary)"
					},
					children: props.unsavedLabel
				}) : null, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					"aria-hidden": "true",
					style: {
						fontSize: 18,
						transform: props.open ? "rotate(180deg)" : "none"
					},
					children: "⌄"
				})]
			})] });
		}
		//#endregion
		//#region src/client/ProvidersSection.tsx
		const pageStyle = {
			display: "flex",
			flexDirection: "column",
			gap: 16,
			width: "100%"
		};
		const titleStyle$1 = {
			margin: 0,
			color: "var(--dsw-alias-label-primary)",
			fontSize: 16,
			fontWeight: 500,
			lineHeight: "24px"
		};
		const subtitleStyle = {
			margin: "4px 0 0",
			color: "var(--dsw-alias-label-secondary)",
			fontSize: 13,
			lineHeight: "20px"
		};
		const listStyle$2 = {
			display: "flex",
			flexDirection: "column",
			gap: 12
		};
		const emptyStyle = {
			color: "var(--dsw-alias-label-tertiary)",
			fontSize: 13,
			lineHeight: "20px"
		};
		/**
		* Render the shared providers page. Missing keys stay empty so an uninstalled
		* plugin does not occupy space; when every provider plugin is gone the section
		* registration itself is disposed and this page unmounts.
		*/
		function ProvidersSection(props) {
			const t = props.t ?? ((key) => key);
			const renderSlot = props.renderSlot;
			const items = PROVIDER_ITEM_ORDER.map((key) => {
				const node = renderSlot?.(PROVIDERS_ITEM_SLOT, {}, { entryKey: key });
				return node == null ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react.Fragment, { children: node }, key);
			}).filter(Boolean);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				"data-providers-section": PROVIDERS_LOCALE_NS,
				style: pageStyle,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
					style: titleStyle$1,
					children: t("title")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					style: subtitleStyle,
					children: t("subtitle")
				})] }), items.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					style: listStyle$2,
					children: items
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					style: emptyStyle,
					children: t("empty")
				})]
			});
		}
		//#endregion
		//#region src/client/provider-section.ts
		const PROVIDERS_SECTION_ID = "providers";
		const PROVIDERS_ITEM_SLOT = "settings.provider.item";
		const PROVIDERS_LOCALE_NS = "settings.providers";
		/** Display order for installed provider cards. Absent plugins render nothing. */
		const PROVIDER_ITEM_ORDER = [
			"llm-cursor",
			"llm-grok",
			"llm-codex",
			"llm-ollama"
		];
		const copy = {
			zh: {
				nav: "供应商",
				title: "供应商",
				subtitle: "连接账号，并选择哪些模型出现在对话的模型列表里。",
				empty: "安装 Cursor、Grok、Codex 或 Ollama Cloud 后，在这里连接账号并选择模型。"
			},
			en: {
				nav: "Providers",
				title: "Providers",
				subtitle: "Connect accounts and choose which models appear in the chat picker.",
				empty: "Install Cursor, Grok, Codex, or Ollama Cloud to connect an account and pick models here."
			}
		};
		function isOccupied(slots) {
			return slots.entries("settings.section").some((entry) => entry.options.id === PROVIDERS_SECTION_ID);
		}
		function duplicateSection(error) {
			return error instanceof Error && /already has|requires options/.test(error.message);
		}
		/**
		* Register the shared 供应商 section when missing. Uninstalling every
		* provider plugin drops the nav row because only they call this helper.
		* @param ctx - browser plugin context (slots + locale).
		*/
		function ensureProviderSection(ctx) {
			const slots = ctx.slots;
			const locale = ctx.locale;
			ctx.slots.inject("settings.section", () => {
				let disposeSection;
				let disposeLocale;
				let disposeIcon;
				const claim = () => {
					if (disposeSection !== void 0 || isOccupied(slots)) return;
					disposeLocale ??= locale.register(PROVIDERS_LOCALE_NS, copy);
					const t = locale.bind(PROVIDERS_LOCALE_NS);
					try {
						disposeSection = slots.register({
							name: "settings.section",
							id: PROVIDERS_SECTION_ID,
							order: 12,
							label: () => t("nav"),
							locale: PROVIDERS_LOCALE_NS,
							children: { [PROVIDERS_ITEM_SLOT]: {
								kind: "keyed",
								scope: "root"
							} }
						}, ProvidersSection);
						disposeIcon ??= installProvidersNavIcon();
					} catch (error) {
						if (!duplicateSection(error)) throw error;
					}
				};
				claim();
				const stop = slots.subscribe?.("settings.section", () => {
					if (!isOccupied(slots)) {
						disposeSection = void 0;
						claim();
					}
				});
				return () => {
					stop?.();
					disposeIcon?.();
					disposeIcon = void 0;
					disposeSection?.();
					disposeSection = void 0;
					disposeLocale?.();
					disposeLocale = void 0;
				};
			});
		}
		/** Ordinary Cursor request budget. */
		const CURSOR_DEFAULT_CONTEXT_WINDOW = 2e5;
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
		const WIRE_SUFFIXES = [
			{
				suffix: "-none-fast",
				effort: "none",
				fast: true
			},
			{
				suffix: "-low-fast",
				effort: "low",
				fast: true
			},
			{
				suffix: "-medium-fast",
				effort: "medium",
				fast: true
			},
			{
				suffix: "-high-fast",
				effort: "high",
				fast: true
			},
			{
				suffix: "-xhigh-fast",
				effort: "xhigh",
				fast: true
			},
			{
				suffix: "-max-fast",
				effort: "max",
				fast: true
			},
			{
				suffix: "-none",
				effort: "none",
				fast: false
			},
			{
				suffix: "-low",
				effort: "low",
				fast: false
			},
			{
				suffix: "-medium",
				effort: "medium",
				fast: false
			},
			{
				suffix: "-high",
				effort: "high",
				fast: false
			},
			{
				suffix: "-xhigh",
				effort: "xhigh",
				fast: false
			},
			{
				suffix: "-max",
				effort: "max",
				fast: false
			},
			{
				suffix: "-fast",
				fast: true
			}
		];
		function splitCursorWireId(id) {
			for (const entry of WIRE_SUFFIXES) {
				if (!id.endsWith(entry.suffix) || id.length <= entry.suffix.length) continue;
				const base = id.slice(0, -entry.suffix.length);
				return {
					family: entry.fast ? `${base}-fast` : base,
					...entry.effort === void 0 ? {} : { effort: entry.effort },
					fast: entry.fast
				};
			}
			return {
				family: id,
				fast: false
			};
		}
		function cleanFamilyName(name) {
			return name.replace(/\s+1M\b/giu, "").replace(/\s+(?:None|Low|Medium|High|Extra High|Max)\b/giu, "").replace(/\s+/gu, " ").trim();
		}
		function rawRowsOf(models) {
			const rows = [];
			for (const model of models) {
				if (model.variants !== void 0 && model.variants.length > 0) {
					for (const variant of model.variants) {
						const split = splitCursorWireId(variant.wireId);
						const effort = variant.effort ?? split.effort;
						rows.push({
							wireId: variant.wireId,
							name: model.name ?? model.id,
							thinking: model.thinking === true,
							maxMode: variant.maxMode === true,
							family: isCursorMaxRow(model.id) ? model.id : split.family,
							...effort === void 0 ? {} : { effort },
							fast: variant.fast === true || split.fast
						});
					}
					continue;
				}
				const split = splitCursorWireId(model.id);
				rows.push({
					wireId: model.id,
					name: model.name ?? model.id,
					thinking: model.thinking === true,
					maxMode: model.maxMode === true,
					family: split.family,
					...split.effort === void 0 ? {} : { effort: split.effort },
					fast: split.fast
				});
			}
			return rows;
		}
		function clusterOf(family) {
			const base = cursorBaseFamilyId(family);
			return base.endsWith("-fast") ? base.slice(0, -5) : base;
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
		/** Infer the lab / first-party brand from a family id and display name. */
		function brandOfCursorFamily(familyId, name = "") {
			const id = clusterOf(familyId).toLowerCase();
			const label = name.toLowerCase();
			if (id === "default" || id.startsWith("composer") || id.startsWith("cursor-")) return "cursor";
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
				if (left.id === "default") return -1;
				if (right.id === "default") return 1;
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
				const hasExplicitEffort = members.some((member) => member.effort !== void 0);
				const variants = members.map((member) => {
					const effort = member.effort ?? (hasExplicitEffort ? "medium" : void 0);
					return {
						wireId: member.wireId,
						...effort === void 0 ? {} : { effort },
						...member.fast ? { fast: true } : {},
						...member.maxMode ? { maxMode: true } : {}
					};
				});
				const preferred = members.find((member) => member.effort === void 0 || member.effort === "medium") ?? members[0];
				const name = cleanFamilyName(preferred?.name ?? family) || family;
				const efforts = new Set(variants.map((variant) => variant.effort).filter((effort) => effort !== void 0));
				const thinking = members.some((member) => member.thinking) || family.includes("thinking") || efforts.size > 1;
				const maxMode = members.some((member) => member.maxMode);
				const needsVariants = members.length > 1 || variants.some((variant) => variant.effort !== void 0);
				let incomingDefault;
				for (const model of models) {
					if (model.defaultEffort === void 0) continue;
					if (splitCursorWireId(model.id).family === family) {
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
				const supportsMax = alreadyMax || maxMode || hasSavedMaxRow;
				const displayName = alreadyMax ? name.endsWith(" Max") ? name : name + " Max" : name;
				const labeled = family === "default" && preferred?.name === "Auto" ? "Auto" : displayName;
				const row = (id, rowName, max) => ({
					id,
					name: rowName,
					thinking,
					vision: true,
					contextWindow: max ? CURSOR_MAX_CONTEXT_WINDOW : CURSOR_DEFAULT_CONTEXT_WINDOW,
					...max ? { maxMode: true } : {},
					...defaultEffort === void 0 ? {} : { defaultEffort },
					...needsVariants ? { variants } : {}
				});
				grouped.push(row(family, labeled, alreadyMax));
				if (supportsMax && !alreadyMax && !hasSavedMaxRow) grouped.push(row(family + "-1m", name + " Max", true));
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
			if (id.startsWith("gpt-5.6-sol")) return choose("high", "xhigh", "max");
			if (id.startsWith("gpt-5.6-terra")) return choose("xhigh", "high", "max");
			if (id.startsWith("gpt-5.6-luna")) return choose("max", "xhigh", "high");
			if (id.startsWith("claude-fable-5")) return choose("high", "xhigh", "max");
			if (id.includes("grok")) return choose("high", "medium", "low");
			if (id.startsWith("glm-5.2")) return choose("max", "high");
			return choose("xhigh", "high") ?? [...CURSOR_EFFORT_ORDER].filter((effort) => effort !== "none").reverse().find((effort) => efforts.includes(effort)) ?? efforts[0];
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
		//#region src/client/SortableList.tsx
		/** Pointer-driven sortable list with a floating ghost and animated live preview. */
		const listStyle$1 = {
			display: "flex",
			flexDirection: "column",
			gap: 8
		};
		const rowStyle = {
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
			border: 0,
			borderRight: "1px solid var(--dsw-alias-border-l2)",
			padding: 0,
			touchAction: "none",
			userSelect: "none",
			background: "transparent",
			color: "var(--dsw-alias-label-tertiary)"
		};
		const ghostStyle = {
			...rowStyle,
			position: "fixed",
			zIndex: 1e4,
			pointerEvents: "none",
			opacity: .96,
			boxShadow: "var(--dsw-shadow-lv2, 0 10px 30px rgba(0, 0, 0, 0.18))",
			outline: "2px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 22%, transparent)"
		};
		/** Grip glyph marking one row's pointer handle. */
		function IconGrip() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: "10",
				height: "14",
				viewBox: "0 0 10 14",
				fill: "currentColor",
				"aria-hidden": true,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "2.5",
						cy: "2.5",
						r: "1.2"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "7.5",
						cy: "2.5",
						r: "1.2"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "2.5",
						cy: "7",
						r: "1.2"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "7.5",
						cy: "7",
						r: "1.2"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "2.5",
						cy: "11.5",
						r: "1.2"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "7.5",
						cy: "11.5",
						r: "1.2"
					})
				]
			});
		}
		/**
		* A small dependency-free sortable surface adapted from CodexHub's
		* SortableList: pointer movement drives a portal ghost and a preview array,
		* while FLIP animations move sibling rows into their prospective positions.
		*/
		function SortableList({ items, getId, renderItem, dragLabel, onReorder, disabled = false }) {
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
				style.textContent = "html.cursor-sortable-dragging, html.cursor-sortable-dragging * { cursor: grabbing !important; user-select: none !important; }";
				const previousRootCursor = document.documentElement.style.cursor;
				const previousBodyCursor = document.body.style.cursor;
				document.head.appendChild(style);
				document.documentElement.classList.add("cursor-sortable-dragging");
				document.documentElement.style.cursor = "grabbing";
				document.body.style.cursor = "grabbing";
				return () => {
					document.documentElement.classList.remove("cursor-sortable-dragging");
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
				if (disabled || event.button !== 0) return;
				const row = event.currentTarget.closest("[data-sortable-row=\"true\"]");
				if (!(row instanceof HTMLElement)) return;
				event.preventDefault();
				event.currentTarget.focus();
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
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: listStyle$1,
				children: [renderedItems.map((item, index) => {
					const id = getId(item);
					const dragging = draggedId === id;
					const targeted = dropTargetId === id && draggedId !== id;
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						ref: (node) => {
							setRowRef(id, node);
						},
						"data-sortable-row": "true",
						style: {
							...rowStyle,
							visibility: dragging ? "hidden" : "visible",
							pointerEvents: dragging ? "none" : "auto",
							borderColor: dragging ? "transparent" : "var(--dsw-alias-border-l2)",
							boxShadow: targeted ? "0 0 0 2px color-mix(in srgb, var(--dsw-alias-state-business-primary) 20%, transparent)" : "none"
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							style: {
								...handleStyle,
								cursor: disabled ? "default" : draggedId === null ? "grab" : "grabbing"
							},
							"aria-label": dragLabel(item, index),
							"aria-grabbed": dragging,
							title: dragLabel(item, index),
							disabled,
							onDragStart: (event) => {
								event.preventDefault();
							},
							onPointerDown: (event) => {
								startDrag(event, id);
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconGrip, {})
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							style: { minWidth: 0 },
							children: renderItem(item, index)
						})]
					}, id);
				}), dragGhost !== null && draggedItem !== void 0 ? (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					"data-sortable-ghost": "true",
					style: {
						...ghostStyle,
						left: dragGhost.x,
						top: dragGhost.y,
						width: dragGhost.width,
						minHeight: dragGhost.height
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: {
							...handleStyle,
							cursor: "grabbing"
						},
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconGrip, {})
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						style: { minWidth: 0 },
						children: renderItem(draggedItem, renderedItems.findIndex((item) => getId(item) === draggedId))
					})]
				}), document.body) : null]
			});
		}
		function sameOrder(left, right, getId) {
			return left.length === right.length && left.every((item, index) => {
				const other = right[index];
				return other !== void 0 && getId(item) === getId(other);
			});
		}
		//#endregion
		//#region src/client/CursorPluginCard.tsx
		/** Cursor Plugin configuration card: Host-owned login, usage, and an editable catalog. */
		const cardStyle = {
			overflow: "hidden",
			border: "1px solid var(--dsw-alias-border-l2)",
			borderRadius: 10,
			background: "var(--dsw-alias-bg-module-platform)"
		};
		const headerStyle$1 = providerHeaderStyle;
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
		const labelStyle = {
			fontSize: 13,
			color: "var(--dsw-alias-label-secondary)"
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
		const barTrackStyle = {
			boxSizing: "border-box",
			height: 14,
			display: "flex",
			overflow: "hidden",
			borderRadius: 999,
			background: "color-mix(in srgb, var(--dsw-alias-label-primary) 14%, transparent)"
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
		const rowInputStyle = {
			boxSizing: "border-box",
			width: "100%",
			minHeight: 36,
			border: "1px solid var(--dsw-alias-border-l2)",
			borderRadius: 8,
			padding: "7px 10px",
			background: "var(--dsw-alias-bg-layer-1)",
			color: "var(--dsw-alias-label-primary)",
			font: "inherit",
			minHeight: 32,
			padding: "4px 10px"
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
		const selectStyle = {
			minHeight: 28,
			border: "1px solid var(--dsw-alias-border-l2)",
			borderRadius: 6,
			padding: "2px 8px",
			background: "var(--dsw-alias-bg-layer-1)",
			color: "var(--dsw-alias-label-primary)",
			font: "inherit"
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
			return {
				rowId: newModelRowId(),
				id: model.id,
				contextWindow: model.contextWindow === void 0 ? "" : String(model.contextWindow),
				...model.name === void 0 ? {} : { name: model.name },
				...model.thinking === void 0 ? {} : { thinking: model.thinking },
				...model.vision === void 0 ? {} : { vision: model.vision },
				...model.maxMode === void 0 ? {} : { maxMode: model.maxMode },
				...model.defaultEffort === void 0 ? {} : { defaultEffort: model.defaultEffort },
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
			return {
				id: draft.id.trim(),
				...draft.name === void 0 || draft.name.trim().length === 0 ? {} : { name: draft.name.trim() },
				...draft.thinking === void 0 ? {} : { thinking: draft.thinking },
				...draft.vision === void 0 ? {} : { vision: draft.vision },
				...draft.maxMode === void 0 ? {} : { maxMode: draft.maxMode },
				...draft.defaultEffort === void 0 ? {} : { defaultEffort: draft.defaultEffort },
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
			const unlimited = quota.limit === 0 && quota.unit !== "percent";
			const ratio = unlimited ? 0 : quota.limit > 0 ? quota.used / quota.limit : quota.used > 0 ? 1 : 0;
			const percent = Math.round(ratio * 1e3) / 10;
			const fill = Math.min(100, Math.max(0, percent));
			const label = quota.period === void 0 ? quota.id : `${quota.id} (${quota.period})`;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: labelStyle,
						children: label
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						style: hintStyle,
						children: quota.unit === "percent" ? `${(Math.round(quota.used * 10) / 10).toFixed(1).replace(/\.0$/u, "")}%` : unlimited ? `${usedText} ${String(quota.used)} / ${unlimitedText}` : `${usedText} ${String(quota.used)} / ${String(quota.limit)}`
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					style: barTrackStyle,
					role: "progressbar",
					"aria-label": label,
					"aria-valuemin": 0,
					"aria-valuemax": 100,
					"aria-valuenow": Math.round(fill),
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						"data-usage-fill": "true",
						style: {
							width: String(fill) + "%",
							height: "100%",
							flex: "none",
							background: "var(--dsw-alias-state-business-primary)",
							transition: "width 200ms ease"
						}
					})
				})]
			});
		}
		function CursorPluginCard(props) {
			const { t, startAuth, readAuthStatus, logout, fetchUsage, discoverModels } = props;
			const snapshot = props.useCursorSettings((value) => value);
			const [open, setOpen] = (0, react.useState)(false);
			const initial = (0, react.useMemo)(() => snapshot.value === void 0 ? void 0 : draftOf(snapshot.value), [snapshot.value]);
			const [source, setSource] = (0, react.useState)(initial);
			const [draft, setDraft] = (0, react.useState)(initial);
			const [sourceRevision, setSourceRevision] = (0, react.useState)(snapshot.revision);
			const [auth, setAuth] = (0, react.useState)({ kind: "signed-out" });
			const [usage, setUsage] = (0, react.useState)({ status: "idle" });
			const [lastUsage, setLastUsage] = (0, react.useState)(void 0);
			const [usageUpdatedAt, setUsageUpdatedAt] = (0, react.useState)(void 0);
			const [busy, setBusy] = (0, react.useState)(false);
			const [fetching, setFetching] = (0, react.useState)(false);
			const [failure, setFailure] = (0, react.useState)(void 0);
			const [notice, setNotice] = (0, react.useState)(void 0);
			const [catalogOpen, setCatalogOpen] = (0, react.useState)(false);
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
			const loadUsage = async () => {
				setUsage({ status: "loading" });
				try {
					const read = await fetchUsage();
					if (read.status === "logged-out") {
						setAuth({ kind: "signed-out" });
						setUsage({ status: "idle" });
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
				} catch (error) {
					setUsage({
						status: "error",
						message: messageOf(error, t("usageFailed"))
					});
				}
			};
			(0, react.useEffect)(() => {
				let cancelled = false;
				readAuthStatus().then((status) => {
					if (cancelled) return;
					if (status.loggedIn) {
						setAuth({
							kind: "signed-in",
							...status.email === void 0 ? {} : { email: status.email }
						});
						return;
					}
					setAuth({ kind: "signed-out" });
					setLastUsage(void 0);
					setUsageUpdatedAt(void 0);
					setUsage({ status: "idle" });
				}).catch(() => {
					if (!cancelled) {
						setAuth({
							kind: "signed-out",
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
				if (!open || auth.kind !== "signed-in") return;
				setUsage({ status: "loading" });
				loadUsage();
			}, [open, auth.kind]);
			if (snapshot.status === "unavailable") return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
				style: cardStyle,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					style: headerStyle$1,
					"aria-expanded": open,
					"aria-label": t(open ? "collapse" : "expand") + ": " + title,
					onClick: () => {
						setOpen(!open);
					},
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ProviderCardHeader, {
						title,
						mark: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BrandMark, {}),
						summary: formatProviderSummary(t("summaryOff"), t("summaryModels").replace("{count}", "0")),
						open
					})
				}), open ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					style: bodyStyle,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						style: statusStyle$1,
						role: "status",
						children: t("remoteAccess")
					})
				}) : null]
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
			const onSignIn = async () => {
				setAuth({ kind: "signing-in" });
				setUsage({ status: "idle" });
				try {
					const started = await startAuth();
					if (!started.ok) {
						setAuth({
							kind: "signed-out",
							message: started.message || t("signInFailed")
						});
						return;
					}
					const status = await readAuthStatus();
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
			const onSignOut = async () => {
				try {
					await logout();
					setAuth({ kind: "signed-out" });
					setLastUsage(void 0);
					setUsageUpdatedAt(void 0);
					setUsage({ status: "idle" });
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
			const statusLabel = auth.kind === "signing-in" ? t("signingIn") : auth.kind === "signed-in" ? formatSignedIn(t, auth.email) : auth.message ?? t("signedOut");
			const modelCount = draft?.models.length ?? snapshot.value?.models?.length ?? 0;
			const headerSummary = formatProviderSummary(auth.kind === "signed-in" ? t("summaryOn") : t("summaryOff"), t("summaryModels").replace("{count}", String(modelCount)));
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
				style: cardStyle,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					style: headerStyle$1,
					"aria-expanded": open,
					"aria-label": t(open ? "collapse" : "expand") + ": " + title,
					onClick: () => {
						setOpen(!open);
					},
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ProviderCardHeader, {
						title,
						mark: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BrandMark, {}),
						summary: headerSummary,
						open,
						unsaved: dirty,
						unsavedLabel: t("unsaved")
					})
				}), open ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: bodyStyle,
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
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
							style: sectionStyle,
							"aria-label": statusLabel,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AuthToolbar, {
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
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									style: buttonStyle,
									disabled: busy || auth.kind === "signing-in",
									onClick: () => {
										onSignIn();
									},
									children: t("signIn")
								})
							})
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
										loadUsage();
									}
								}),
								(() => {
									if (usage.status === "loading" || usage.status === "idle") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UsageSkeleton, { rows: lastUsage?.windows.length ?? 2 });
									const bars = usage.status === "ready" ? usage.usage : lastUsage;
									if (bars !== void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: bars.windows.map((window, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UsageBar, {
										usedText: t("usageUsed"),
										unlimitedText: t("usageUnlimited"),
										window
									}, window.id + ":" + String(index))) });
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
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									style: buttonStyle,
									disabled: fetching || snapshot.status !== "ready" || auth.kind !== "signed-in",
									onClick: () => {
										fetchModels();
									},
									children: t(fetching ? "fetchingModels" : "fetchModels")
								})]
							}), catalogOpen ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SortableList, {
								items: draft.models,
								getId: (model) => model.rowId,
								disabled,
								dragLabel: (model, index) => {
									const label = model.id.trim().length > 0 ? model.id.trim() : String(index + 1);
									return t("dragModel") + ": " + label;
								},
								onReorder: (models) => {
									patchDraft({ models });
								},
								renderItem: (model, index) => {
									const expanded = expandedModels.has(model.rowId);
									const label = model.id.trim().length > 0 ? model.id.trim() : String(index + 1);
									const efforts = effortsForCursorModel(modelSettingsOf(model));
									return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										"data-model-row": label,
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
											expanded ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												style: {
													...modelDetailStyle,
													gridColumn: "1 / -1"
												},
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													style: capabilitiesStyle,
													children: [
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Capability, {
															label: t("thinking"),
															checked: model.thinking === true,
															disabled,
															onChange: (thinking) => {
																patchModel(index, { thinking });
															}
														}),
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Capability, {
															label: t("vision"),
															checked: model.vision === true,
															disabled,
															onChange: (vision) => {
																patchModel(index, { vision });
															}
														}),
														/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
															style: {
																...labelStyle,
																display: "inline-flex",
																alignItems: "center",
																gap: 6
															},
															children: [t("contextWindow"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
																style: {
																	...rowInputStyle,
																	width: 110
																},
																inputMode: "numeric",
																placeholder: t("contextWindowDefault"),
																value: model.contextWindow,
																disabled,
																"aria-label": t("contextWindow"),
																onChange: (event) => {
																	patchModel(index, { contextWindow: event.target.value });
																}
															})]
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
																disabled,
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
													]
												})
											}) : null
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
									patchDraft({ models: [...draft.models, model] });
									setExpandedModels((current) => new Set(current).add(model.rowId));
								},
								children: t("addModel")
							})] }) : null]
						}),
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
					]
				}) : null]
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
			remoteAccess: "Remote browsers cannot edit plugin settings: the Harness configuration API is loopback-only. Browse the page on the host itself, or forward it first.",
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
			usageUpdatedAt: "Updated {time}"
		};
		const zh = {
			title: "Cursor",
			description: "非官方。走 Cursor CLI 私有会话入口。Cursor 员工认定此类用法违反 ToS，账号可能被封。",
			expand: "展开设置",
			collapse: "折叠设置",
			loading: "正在加载插件设置…",
			remoteAccess: "远程浏览器无法编辑插件设置：Harness 配置 API 仅限 loopback。请在主机本机打开页面，或先做端口转发。",
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
			usageUpdatedAt: "{time} 已更新"
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
		function apply(ctx) {
			const localeNamespace = "settings.cursor";
			ctx.effect(() => ctx.locale.register(localeNamespace, {
				zh,
				en
			}), "dsh-llm-cursor: Plugin configuration copy");
			const t = ctx.locale.bind(localeNamespace);
			const scope = ctx.settingsScope.bind({
				namespace: CURSOR_SETTINGS_NAMESPACE,
				decode: decodeCursorSettings
			});
			const picker = new CursorModelPickerController();
			const { rpc } = ctx.get("connection");
			const startAuth = async () => {
				const result = await rpc.call(CURSOR_RPC_CHANNEL, CURSOR_AUTH_START_ENDPOINT, {});
				if (!result.ok) return {
					ok: false,
					retryable: true,
					message: result.error.message
				};
				const decoded = decodeCursorAuthStartReply(result.value);
				if (decoded === void 0) return {
					ok: false,
					retryable: true,
					message: t("signInFailed")
				};
				return decoded;
			};
			const readAuthStatus = async () => {
				const result = await rpc.call(CURSOR_RPC_CHANNEL, CURSOR_AUTH_STATUS_ENDPOINT, {});
				if (!result.ok) throw new Error(result.error.message);
				const decoded = decodeCursorAuthStatus(result.value);
				if (decoded === void 0) throw new Error(t("statusFailed"));
				return decoded;
			};
			const logout = async () => {
				const result = await rpc.call(CURSOR_RPC_CHANNEL, CURSOR_AUTH_LOGOUT_ENDPOINT, {});
				if (!result.ok) throw new Error(result.error.message);
				if (decodeCursorAuthLogoutReply(result.value) === void 0) throw new Error(t("signOutFailed"));
			};
			const discoverModels = async () => {
				const result = await rpc.call(CURSOR_RPC_CHANNEL, CURSOR_MODELS_ENDPOINT, {});
				if (!result.ok) throw new Error(result.error.message);
				const decoded = decodeCursorModelsReply(result.value);
				if (decoded === void 0) throw new Error(t("statusFailed"));
				return decoded.models;
			};
			const fetchUsage = async () => {
				const result = await rpc.call(CURSOR_RPC_CHANNEL, CURSOR_USAGE_ENDPOINT, {});
				if (!result.ok) throw new Error(result.error.message);
				const decoded = decodeCursorUsageReply(result.value);
				if (decoded === void 0) throw new Error(t("usageFailed"));
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
			ensureProviderSection(ctx);
			ctx.slots.inject("settings.provider.item", () => ctx.slots.register({
				name: "settings.provider.item",
				key: CURSOR_SETTINGS_NAMESPACE,
				locale: localeNamespace,
				inject: () => ({
					t,
					hooks: { cursorSettings: scope },
					startAuth,
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
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		exports.name = name;
		return module.exports;
	}
});
