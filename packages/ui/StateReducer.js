export const StateReducer = (state, action) => {
    var _a;
    let newState;
    switch (action.type) {
        case "LOADING":
            newState = {
                data: Object.assign({}, state.data),
                loading: true,
                loadingMessage: (_a = action.loadingMessage) !== null && _a !== void 0 ? _a : "Loading...",
            };
            break;
        case "SET_DATA":
            newState = { data: Object.assign(Object.assign({}, state.data), action.payload), loading: false };
            break;
        case "STOP_LOADING":
            newState = { data: Object.assign(Object.assign({}, state.data), action.payload), loading: false };
            break;
        default:
            throw new Error();
    }
    return newState;
};
