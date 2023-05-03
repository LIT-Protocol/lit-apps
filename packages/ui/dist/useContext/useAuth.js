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
import Router from "next/router";
import { createContext, useContext, useEffect } from "react";
import { usePKPConnectionContext } from "@getlit/ui";
import { useAccount } from "wagmi";
var AuthContext = createContext({
    auth: {
        isConnected: false,
        pkpConnected: false,
    },
});
export var AuthProviderContext = function (props) {
    var _a = usePKPConnectionContext(), pkpConnected = _a.pkpConnected, selectedPKP = _a.selectedPKP;
    var _b = useAccount(), address = _b.address, isConnected = _b.isConnected;
    useEffect(function () {
        if (!isConnected || !pkpConnected) {
            // this will redirect back to this page after login
            var pathname = Router.pathname;
            // set redirect to local storage
            localStorage.setItem("redirect", pathname);
            if (pathname !== "/login") {
                Router.push("/login");
            }
        }
    });
    var auth = {
        isConnected: isConnected,
        pkpConnected: pkpConnected,
    };
    return (_jsx(AuthContext.Provider, __assign({ value: { auth: auth } }, { children: props.children })));
};
export var useAuthProviderContext = function () {
    return useContext(AuthContext);
};
