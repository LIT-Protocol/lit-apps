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
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { toast } from "react-hot-toast";
import { LitIcon } from "./LitIcon";
export var LitCopy = function (props) {
    // copy to clipboard
    var copyToClipboard = function (e) {
        if (!props.copyText)
            return;
        navigator.clipboard.writeText(props.copyText);
        toast.success("Copied ".concat(props.text), { duration: 1000 });
    };
    return (_jsxs(_Fragment, { children: [_jsx("div", __assign({ className: "" }, { children: props.text })), _jsx("div", __assign({ className: "lit-icon-wrapper flex gap-6" }, { children: _jsx(LitIcon, { onClick: copyToClipboard, icon: "copy" }) }))] }));
};
