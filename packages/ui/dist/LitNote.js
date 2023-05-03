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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { jsx as _jsx } from "react/jsx-runtime";
export var LitNote = function (prop) {
    var defaultClass = "lit-note";
    // inject defaultClass into prop.className array
    var newProp = prop.className
        ? __assign(__assign({}, prop), { className: __spreadArray(__spreadArray([], prop.className, true), [" ".concat(defaultClass)], false).join("") }) : __assign(__assign({}, prop), { className: defaultClass });
    return _jsx("div", __assign({}, newProp));
};
