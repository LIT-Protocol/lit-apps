import { jsx as _jsx } from "react/jsx-runtime";
import { useReducer } from "react";
import { LitButton } from "../LitButton";
import { LitSelectionV1 } from "../LitSelectV1";
import { StateReducer } from "../StateReducer";
export const ELIntervalSelector = (prop) => {
    // -- default data
    const defaultData = [
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
    const [state, dispatch] = useReducer(StateReducer, {
        data: defaultData,
        loading: false,
    });
    return (_jsx(LitSelectionV1, { items: state.data, button: {
            component: LitButton,
            className: "lit-mini-button capitalize",
        }, onClick: (item) => prop === null || prop === void 0 ? void 0 : prop.onClick(item) }));
};
