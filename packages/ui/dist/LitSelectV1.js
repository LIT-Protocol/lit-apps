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
import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
// Usage:
{ /* <LitSelectionV1
  items={events}
  button={{
    component: LitButton,
    className: "lit-mini-button capitalize",
  }}
  onClick={(item: { name: string }) => {
    setSelectedEvent(item.name);
  }}
/>; */
}
export var LitSelectionV1 = function (prop) {
    var _a;
    var defaultClass = "lit-selection-v1";
    // inject defaultClass into prop.className array
    var newProp = prop.className
        ? __assign(__assign({}, prop), { className: __spreadArray(__spreadArray([], prop.className, true), [" ".concat(defaultClass)], false).join("") }) : __assign(__assign({}, prop), { className: defaultClass });
    // states
    var _b = useState(null), selected = _b[0], setSelected = _b[1];
    //   handle click
    var handleClick = function (item) {
        setSelected(item);
        prop === null || prop === void 0 ? void 0 : prop.onClick(item);
    };
    return (_jsx(_Fragment, { children: (_a = prop === null || prop === void 0 ? void 0 : prop.items) === null || _a === void 0 ? void 0 : _a.map(function (item, index) {
            return (_jsx(prop.button.component, __assign({ onClick: function () { return handleClick(item); }, className: "\n              ".concat(prop.button.className, " ").concat((item === null || item === void 0 ? void 0 : item.enabled) ? "" : "disabled", "\n              ").concat((selected === null || selected === void 0 ? void 0 : selected.name) === (item === null || item === void 0 ? void 0 : item.name) ? "active" : "", "\n              ") }, { children: item === null || item === void 0 ? void 0 : item.name }), index));
        }) }));
};
