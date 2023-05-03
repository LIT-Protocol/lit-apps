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
export var LitInputTextV1 = function (prop) {
    var defaultClass = "lit-input-v1";
    var newProp = __assign(__assign({}, prop), { className: "" });
    return (_jsxs("div", __assign({ className: "".concat(defaultClass, " ").concat(prop.className) }, { children: [_jsx("label", { children: prop.label }), _jsx("input", __assign({ type: "text" }, newProp))] })));
};
