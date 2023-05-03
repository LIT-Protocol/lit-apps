import { jsx as _jsx } from "react/jsx-runtime";
import { useReducer } from "react";
import { LitButton } from "../LitButton";
import { LitSelectionV1 } from "../LitSelectV1";
import { StateReducer } from "../StateReducer";
export var ELEventSelector = function (prop) {
    // -- default data
    var defaultData = [
        {
            id: "block",
            name: "block",
            enabled: true,
        },
        {
            id: "periodic",
            name: "periodic",
            enabled: false,
        },
        {
            id: "webhook",
            name: "webhook",
            enabled: false,
        },
        {
            id: "contract",
            name: "contract",
            enabled: false,
        },
        {
            id: "transaction",
            name: "transaction",
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
        }, 
        // onClick={(item: { name: string }) => {
        //   console.log(item.name);
        // }}
        onClick: function (item) { return prop === null || prop === void 0 ? void 0 : prop.onClick(item); } }));
};
