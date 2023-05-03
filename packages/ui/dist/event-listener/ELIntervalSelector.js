import { jsx as _jsx } from "react/jsx-runtime";
import { useReducer } from "react";
import { LitButton } from "../LitButton";
import { LitSelectionV1 } from "../LitSelectV1";
import { StateReducer } from "../StateReducer";
export var ELIntervalSelector = function (prop) {
    // -- default data
    var defaultData = [
        {
            id: "repeat_until",
            name: "Repeat until",
            enabled: true,
        },
        {
            id: "repeat_for_x_blocks",
            name: "Repeat for x blocks ",
            enabled: false,
        },
    ];
    var _a = useReducer(StateReducer, {
        data: defaultData,
        loading: false,
    }), state = _a[0], dispatch = _a[1];
    return (_jsx(LitSelectionV1, { items: state.data, button: {
            component: LitButton,
            className: "lit-mini-button capitalize",
        }, onClick: function (item) { return prop === null || prop === void 0 ? void 0 : prop.onClick(item); } }));
};
