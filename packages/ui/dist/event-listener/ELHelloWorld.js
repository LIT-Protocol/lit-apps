import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useReducer } from "react";
import { StateReducer } from "../StateReducer";
export var ELHelloWorld = function () {
    var _a = useReducer(StateReducer, {
        data: [],
        loading: false,
    }), state = _a[0], dispatch = _a[1];
    return _jsx(_Fragment, {});
};
