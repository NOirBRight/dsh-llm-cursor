//#region lib/types/invariant.js
/**
* Package-owned invariant companion for `dsh-llm-cursor`.
* @module dsh-llm-cursor/invariant
*/
const PACKAGE_NAME = "dsh-llm-cursor";
const name = "llm-cursor-invariant";
const inject = ["invariants"];
const install = () => {};
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
