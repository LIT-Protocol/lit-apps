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
import { jsx as _jsx } from "react/jsx-runtime";
import { WagmiConfig, createClient } from "wagmi";
import { getDefaultProvider } from "ethers";
var client = createClient({
    autoConnect: true,
    provider: getDefaultProvider(),
});
export var Web3Auth = function (_a) {
    var children = _a.children;
    return _jsx(WagmiConfig, __assign({ client: client }, { children: children }));
};
