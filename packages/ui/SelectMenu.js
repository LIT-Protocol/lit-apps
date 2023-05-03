import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @ts-nocheck
import * as Select from "@radix-ui/react-select";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import { SelectItem } from "./SelectItem";
export const SelectMenu = ({ onChange, items, label }) => (_jsxs(Select.Root, Object.assign({ onValueChange: onChange }, { children: [_jsxs(Select.Trigger, Object.assign({ className: "SelectTrigger", "aria-label": "Food" }, { children: [_jsx(Select.Value, { placeholder: label !== null && label !== void 0 ? label : "Select Item" }), _jsx(Select.Icon, Object.assign({ className: "SelectIcon" }, { children: _jsx(ChevronDownIcon, {}) }))] })), _jsx(Select.Portal, { children: _jsxs(Select.Content, Object.assign({ className: "SelectContent" }, { children: [_jsx(Select.ScrollUpButton, Object.assign({ className: "SelectScrollButton" }, { children: _jsx(ChevronUpIcon, {}) })), _jsx(Select.Viewport, Object.assign({ className: "SelectViewport" }, { children: _jsx(Select.Group, { children: !items
                                ? ""
                                : items.map((item, index) => {
                                    // capitalize first letter of each word
                                    const calitalized = item.name
                                        .split(" ")
                                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                        .join(" ");
                                    if (item.type === "label") {
                                        return (_jsx(Select.Label, Object.assign({ className: "SelectLabel" }, { children: calitalized }), index));
                                    }
                                    return (_jsx(SelectItem, Object.assign({ value: item.name, disabled: !item.enabled }, { children: calitalized }), index));
                                }) }) })), _jsx(Select.ScrollDownButton, Object.assign({ className: "SelectScrollButton" }, { children: _jsx(ChevronDownIcon, {}) }))] })) })] })));
