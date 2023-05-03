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
export var DivWithTitle = function (prop) {
    var defaultClass = "div-with-title";
    return (_jsxs("div", __assign({ className: "".concat(defaultClass) }, { children: [_jsx("h1", __assign({ className: "".concat(!prop.title ? "invisible" : "") }, { children: !prop.title ? "*" : prop.title })), _jsx("section", { children: prop.children })] })));
};
