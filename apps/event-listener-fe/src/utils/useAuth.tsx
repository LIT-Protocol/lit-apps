import Router from "next/router";
import { createContext, useContext, useEffect, useState } from "react";
import { usePKPConnectionContext } from "ui";
import { useAccount } from "wagmi";

interface IAuth {
  isConnected: boolean;
  pkpConnected: boolean;
}

const AuthContext = createContext<{
  auth: IAuth;
}>({
  auth: {
    isConnected: false,
    pkpConnected: false,
  },
});

export const AuthProviderContext = (props: any) => {
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

  const auth: IAuth = {
    isConnected,
    pkpConnected,
  };

  return (
    <AuthContext.Provider value={{ auth }}>
      {props.children}
    </AuthContext.Provider>
  );
};

export const useAuthProviderContext = () => {
  return useContext(AuthContext);
};
