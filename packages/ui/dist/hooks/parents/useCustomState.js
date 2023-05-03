// Usage:
// -----
// import React from "react";
// import { useCustomState } from "./useCustomState";
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
// const MyComponent = (props: any) => {
//   const initialState = { data: [], loading: false };
//   const [state, handleNewState] = useCustomState(initialState, props.onChange);
//   // Your component logic here
//   return <div>My component</div>;
// };
// export default MyComponent;
// Then use it like this:
// ----
//  const handleNewState = (newState: any) => {
//   dispatch({
//     type: "SET_DATA",
//     payload: newState,
//   });
//   if (prop.onChange) {
//     console.log("state:", state.data);
//     prop.onChange({ ...state.data, ...newState });
//   }
// };
import { useReducer } from "react";
var StateReducer = function (state, action) {
    var newState;
    switch (action.type) {
        case "SET_DATA":
            newState = { data: __assign(__assign({}, state.data), action.payload), loading: false };
            break;
        default:
            return state;
    }
    return newState;
};
export var useCustomState = function (initialState, onChange) {
    var _a = useReducer(StateReducer, initialState), state = _a[0], dispatch = _a[1];
    var handleNewState = function (newState) {
        dispatch({
            type: "SET_DATA",
            payload: newState,
        });
        if (onChange) {
            console.log("state:", state.data);
            onChange(__assign(__assign({}, state.data), newState));
        }
    };
    var clearAllState = function () {
        dispatch({
            type: "SET_DATA",
            payload: initialState,
        });
        if (onChange) {
            onChange(initialState);
        }
    };
    return [state, handleNewState, clearAllState];
};
