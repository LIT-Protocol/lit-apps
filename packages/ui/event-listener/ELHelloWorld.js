import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useReducer } from "react";
import { StateReducer } from "../StateReducer";
export const ELHelloWorld = () => {
    const [state, dispatch] = useReducer(StateReducer, {
        data: [],
        loading: false,
    });
    return _jsx(_Fragment, {});
};
