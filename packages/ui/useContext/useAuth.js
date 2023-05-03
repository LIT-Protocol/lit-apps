import { jsx as _jsx } from "react/jsx-runtime";
import Router from "next/router";
import { createContext, useContext, useEffect } from "react";
import { usePKPConnectionContext } from "@getlit/ui";
import { useAccount } from "wagmi";
const AuthContext = createContext({
    auth: {
        isConnected: false,
        pkpConnected: false,
    },
});
export const AuthProviderContext = (props) => {
    const { pkpConnected, selectedPKP } = usePKPConnectionContext();
    const { address, isConnected } = useAccount();
    useEffect(() => {
        if (!isConnected || !pkpConnected) {
            // this will redirect back to this page after login
            const { pathname } = Router;
            // set redirect to local storage
            localStorage.setItem("redirect", pathname);
            if (pathname !== "/login") {
                Router.push("/login");
            }
        }
    });
    const auth = {
        isConnected,
        pkpConnected,
    };
    return (_jsx(AuthContext.Provider, Object.assign({ value: { auth } }, { children: props.children })));
};
export const useAuthProviderContext = () => {
    return useContext(AuthContext);
};
