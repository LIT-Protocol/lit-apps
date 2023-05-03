var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LitIcon } from "./LitIcon";
export var LitLoading = function (props) {
    var _a;
    return (_jsxs("div", __assign({ className: "lit-loading" }, { children: [_jsx(LitIcon, { className: "lit-loading-icon", icon: (_a = props.icon) !== null && _a !== void 0 ? _a : "lit-logo-text" }), props.text && _jsx("div", __assign({ className: "lit-loading-text" }, { children: props.text }))] })));
};
