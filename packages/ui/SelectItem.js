var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @ts-nocheck
import { CheckIcon } from '@radix-ui/react-icons';
import * as Select from '@radix-ui/react-select';
import React from 'react';
import classnames from 'classnames';
export const SelectItem = React.forwardRef((_a, forwardedRef) => {
    var { children, className } = _a, props = __rest(_a, ["children", "className"]);
    return (_jsxs(Select.Item, Object.assign({ className: classnames('SelectItem', className) }, props, { ref: forwardedRef }, { children: [_jsx(Select.ItemText, { children: children }), _jsx(Select.ItemIndicator, Object.assign({ className: "SelectItemIndicator" }, { children: _jsx(CheckIcon, {}) }))] })));
});
