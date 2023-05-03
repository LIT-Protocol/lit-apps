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
// @ts-nocheck
import * as Select from "@radix-ui/react-select";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import { SelectItem } from "./SelectItem";
export var SelectMenu = function (_a) {
    var onChange = _a.onChange, items = _a.items, label = _a.label;
    return (_jsxs(Select.Root, __assign({ onValueChange: onChange }, { children: [_jsxs(Select.Trigger, __assign({ className: "SelectTrigger", "aria-label": "Food" }, { children: [_jsx(Select.Value, { placeholder: label !== null && label !== void 0 ? label : "Select Item" }), _jsx(Select.Icon, __assign({ className: "SelectIcon" }, { children: _jsx(ChevronDownIcon, {}) }))] })), _jsx(Select.Portal, { children: _jsxs(Select.Content, __assign({ className: "SelectContent" }, { children: [_jsx(Select.ScrollUpButton, __assign({ className: "SelectScrollButton" }, { children: _jsx(ChevronUpIcon, {}) })), _jsx(Select.Viewport, __assign({ className: "SelectViewport" }, { children: _jsx(Select.Group, { children: !items
                                    ? ""
                                    : items.map(function (item, index) {
                                        // capitalize first letter of each word
                                        var calitalized = item.name
                                            .split(" ")
                                            .map(function (word) { return word.charAt(0).toUpperCase() + word.slice(1); })
                                            .join(" ");
                                        if (item.type === "label") {
                                            return (_jsx(Select.Label, __assign({ className: "SelectLabel" }, { children: calitalized }), index));
                                        }
                                        return (_jsx(SelectItem, __assign({ value: item.name, disabled: !item.enabled }, { children: calitalized }), index));
                                    }) }) })), _jsx(Select.ScrollDownButton, __assign({ className: "SelectScrollButton" }, { children: _jsx(ChevronDownIcon, {}) }))] })) })] })));
};
