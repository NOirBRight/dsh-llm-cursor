window.__ModuleLoader__.load({
	id: "dsh-llm-cursor",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client-contract.ts
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
		/**
		* Offline fallback when the account catalog cannot be read.
		* Live ids come from GetUsableModels after sign-in.
		*/
		const CURSOR_CATALOG = Object.freeze([Object.freeze({
			id: "composer-2.5",
			name: "Composer 2.5",
			thinking: true,
			vision: true,
			maxMode: true
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
		function decodeCursorCatalogModel(value) {
			if (!isRecord(value)) return void 0;
			const id = value["id"];
			if (typeof id !== "string" || id.length === 0) return void 0;
			const name = value["name"];
			const thinking = value["thinking"];
			const vision = value["vision"];
			const maxMode = value["maxMode"];
			if (name !== void 0 && (typeof name !== "string" || name.length === 0)) return void 0;
			if (thinking !== void 0 && typeof thinking !== "boolean") return void 0;
			if (vision !== void 0 && typeof vision !== "boolean") return void 0;
			if (maxMode !== void 0 && typeof maxMode !== "boolean") return void 0;
			return {
				id,
				...name === void 0 ? {} : { name },
				...thinking === void 0 ? {} : { thinking },
				...vision === void 0 ? {} : { vision },
				...maxMode === void 0 ? {} : { maxMode }
			};
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
		//#endregion
		//#region src/client/CursorPluginCard.tsx
		/** Cursor Plugin configuration card: Host-owned Deep Control login, usage, and a read-only catalog. */
		const cardStyle = {
			overflow: "hidden",
			border: "1px solid var(--dsw-alias-border-l2)",
			borderRadius: 10,
			background: "var(--dsw-alias-bg-module-platform)"
		};
		const headerStyle = {
			boxSizing: "border-box",
			width: "100%",
			display: "flex",
			alignItems: "center",
			justifyContent: "space-between",
			gap: 16,
			border: 0,
			padding: "13px 14px",
			background: "transparent",
			color: "var(--dsw-alias-label-primary)",
			font: "inherit",
			textAlign: "left",
			cursor: "pointer"
		};
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
		const statusStyle = {
			margin: 0,
			fontSize: 13,
			color: "var(--dsw-alias-label-secondary)"
		};
		const errorStyle = {
			...statusStyle,
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
		const catalogStyle = {
			margin: 0,
			padding: 0,
			listStyle: "none",
			display: "flex",
			flexDirection: "column",
			gap: 8
		};
		const modelRowStyle = {
			display: "flex",
			alignItems: "center",
			justifyContent: "space-between",
			gap: 10,
			border: "1px solid var(--dsw-alias-border-l2)",
			borderRadius: 8,
			padding: "8px 10px"
		};
		const flagsStyle = {
			display: "flex",
			alignItems: "center",
			flexWrap: "wrap",
			gap: 10
		};
		function formatSignedIn(t, email) {
			if (email === void 0) return t("signedInNoEmail");
			return t("signedInAs").replace("{email}", email);
		}
		function messageOf(error, fallback) {
			return error instanceof Error && error.message.length > 0 ? error.message : fallback;
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
						children: quota.unit === "percent" ? `${String(quota.used)}%` : unlimited ? `${usedText} ${String(quota.used)} / ${unlimitedText}` : `${usedText} ${String(quota.used)} / ${String(quota.limit)}`
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
			const { t, startAuth, readAuthStatus, logout, fetchUsage, fetchModels } = props;
			const [open, setOpen] = (0, react.useState)(false);
			const [auth, setAuth] = (0, react.useState)({ kind: "signed-out" });
			const [usage, setUsage] = (0, react.useState)({ status: "idle" });
			const [models, setModels] = (0, react.useState)(CURSOR_CATALOG);
			const title = t("title");
			const busy = auth.kind === "signing-in";
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
				if (!open) return;
				let cancelled = false;
				readAuthStatus().then((status) => {
					if (cancelled) return;
					if (status.loggedIn) {
						setAuth({
							kind: "signed-in",
							...status.email === void 0 ? {} : { email: status.email }
						});
						fetchModels().then((next) => {
							if (!cancelled && next.length > 0) setModels(next);
						}).catch(() => void 0);
						return;
					}
					setAuth({ kind: "signed-out" });
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
			}, [
				open,
				readAuthStatus,
				t
			]);
			(0, react.useEffect)(() => {
				if (!open || auth.kind !== "signed-in" || usage.status !== "idle") return;
				loadUsage();
			}, [
				open,
				auth.kind,
				usage.status
			]);
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
					setUsage({ status: "idle" });
				} catch {
					setAuth((current) => current.kind === "signed-in" ? current : {
						kind: "signed-out",
						message: t("signOutFailed")
					});
				}
			};
			const statusLabel = auth.kind === "signing-in" ? t("signingIn") : auth.kind === "signed-in" ? formatSignedIn(t, auth.email) : auth.message ?? t("signedOut");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
				style: cardStyle,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					style: headerStyle,
					"aria-expanded": open,
					"aria-label": t(open ? "collapse" : "expand") + ": " + title,
					onClick: () => {
						setOpen(!open);
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						style: {
							display: "flex",
							minWidth: 0,
							flexDirection: "column",
							gap: 3
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							style: {
								fontSize: 14,
								lineHeight: "20px",
								fontWeight: 600
							},
							children: title
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							style: {
								fontSize: 13,
								lineHeight: "18px",
								color: "var(--dsw-alias-label-tertiary)"
							},
							children: t("description")
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						"aria-hidden": "true",
						style: {
							fontSize: 18,
							transform: open ? "rotate(180deg)" : "none"
						},
						children: "⌄"
					})]
				}), open ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					style: bodyStyle,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							style: sectionStyle,
							"aria-label": statusLabel,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								style: statusStyle,
								children: statusLabel
							}), auth.kind === "signed-in" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
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
								disabled: busy,
								onClick: () => {
									onSignIn();
								},
								children: t("signIn")
							})]
						}),
						auth.kind === "signed-in" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							style: sectionStyle,
							"aria-label": t("usage"),
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										gap: 10
									},
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
										style: sectionTitleStyle,
										children: t("usage")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										style: buttonStyle,
										disabled: usage.status === "loading",
										onClick: () => {
											loadUsage();
										},
										children: t(usage.status === "loading" ? "usageLoading" : "usageRefresh")
									})]
								}),
								usage.status === "ready" ? usage.usage.windows.map((window, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UsageBar, {
									usedText: t("usageUsed"),
									unlimitedText: t("usageUnlimited"),
									window
								}, `${window.id}:${String(index)}`)) : null,
								usage.status === "unsupported" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									style: hintStyle,
									children: t("usageUnsupported")
								}) : null,
								usage.status === "error" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									style: errorStyle,
									children: usage.message
								}) : null
							]
						}) : null,
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							style: sectionStyle,
							"aria-label": t("models"),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
								style: sectionTitleStyle,
								children: t("models")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
								style: catalogStyle,
								children: models.map((model) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
									"data-model-row": model.id,
									style: modelRowStyle,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [model.name ?? model.id, model.name !== void 0 && model.name !== model.id ? ` (${model.id})` : ""] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										style: flagsStyle,
										children: [
											model.thinking === true ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												style: hintStyle,
												children: t("thinking")
											}) : null,
											model.vision === true ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												style: hintStyle,
												children: t("vision")
											}) : null,
											model.maxMode === true ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												style: hintStyle,
												children: t("maxMode")
											}) : null
										]
									})]
								}, model.id))
							})]
						})
					]
				}) : null]
			});
		}
		//#endregion
		//#region src/client/locales.ts
		/** Localized copy for the Cursor Plugin configuration card. */
		const en = {
			title: "Cursor",
			description: "Sign in with a Cursor subscription. This plugin is not the official Cursor CLI or Cloud Agents.",
			expand: "Expand settings",
			collapse: "Collapse settings",
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
			thinking: "Reasoning",
			vision: "Vision",
			maxMode: "Max mode",
			usage: "Subscription usage",
			usageRefresh: "Refresh",
			usageLoading: "Reading usage…",
			usageUsed: "Used",
			usageUnlimited: "Unlimited",
			usageUnsupported: "This subscription does not report usage.",
			usageFailed: "Could not read usage."
		};
		const zh = {
			title: "Cursor",
			description: "使用 Cursor 订阅登录。本插件不是官方 Cursor CLI，也不调用 Cloud Agents。",
			expand: "展开设置",
			collapse: "折叠设置",
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
			thinking: "推理",
			vision: "视觉",
			maxMode: "Max 模式",
			usage: "订阅额度",
			usageRefresh: "刷新",
			usageLoading: "正在读取额度…",
			usageUsed: "已用",
			usageUnlimited: "不限",
			usageUnsupported: "此订阅不提供额度信息。",
			usageFailed: "无法读取额度。"
		};
		//#endregion
		//#region src/client/index.ts
		const name = "dsh-llm-cursor-client";
		const inject = [
			"slots",
			"locale",
			"connection"
		];
		function apply(ctx) {
			const localeNamespace = "settings.cursor";
			ctx.effect(() => ctx.locale.register(localeNamespace, {
				zh,
				en
			}), "dsh-llm-cursor: Plugin configuration copy");
			const t = ctx.locale.bind(localeNamespace);
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
			const fetchModels = async () => {
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
			ctx.slots.inject("settings.plugin.item", () => ctx.slots.register({
				name: "settings.plugin.item",
				id: "cursor",
				order: 41,
				locale: localeNamespace,
				inject: () => ({
					t,
					startAuth,
					readAuthStatus,
					logout,
					fetchUsage,
					fetchModels
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
