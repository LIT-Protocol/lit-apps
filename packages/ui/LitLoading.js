import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LitIcon } from "./LitIcon";
export const LitLoading = (props) => {
    var _a;
    return (_jsxs("div", Object.assign({ className: `lit-loading` }, { children: [_jsx(LitIcon, { className: "lit-loading-icon", icon: (_a = props.icon) !== null && _a !== void 0 ? _a : "lit-logo-text" }), props.text && _jsx("div", Object.assign({ className: "lit-loading-text" }, { children: props.text }))] })));
};
