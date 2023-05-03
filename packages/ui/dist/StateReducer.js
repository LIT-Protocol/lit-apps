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
export var StateReducer = function (state, action) {
    var _a;
    var newState;
    switch (action.type) {
        case "LOADING":
            newState = {
                data: __assign({}, state.data),
                loading: true,
                loadingMessage: (_a = action.loadingMessage) !== null && _a !== void 0 ? _a : "Loading...",
            };
            break;
        case "SET_DATA":
            newState = { data: __assign(__assign({}, state.data), action.payload), loading: false };
            break;
        case "STOP_LOADING":
            newState = { data: __assign(__assign({}, state.data), action.payload), loading: false };
            break;
        default:
            throw new Error();
    }
    return newState;
};
