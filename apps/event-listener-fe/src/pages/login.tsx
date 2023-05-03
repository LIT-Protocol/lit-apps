import Router from "next/router";
import { useEffect, useReducer, useState } from "react";
import {
  LitLoading,
  PKPSelection,
  StateReducer,
  usePKPConnectionContext,
} from "@getlit/ui";
import { useAccount } from "wagmi";

export function Login() {
  const { address, isConnected } = useAccount();
  const { pkpConnected, selectedPKP } = usePKPConnectionContext();
  const [state, dispatch] = useReducer(StateReducer, {
    data: [],
    loading: false,
  });

  const [_isConnected, setIsConnected] = useState(false);
  const [startChecking, setStartChecking] = useState(false);

  useEffect(() => {
    setIsConnected(isConnected);

    function loadData() {
      if (!isConnected || !address) {
        dispatch({
          type: "LOADING",
          loading: true,
          loadingMessage: "Please connect your wallet to continue",
        });

        return;
      }

      if (!pkpConnected) {
        return;
      }

      // if localstorage has 'redirect' key, redirect to that page
      const redirect = localStorage.getItem("redirect");
      if (redirect) {
        localStorage.removeItem("redirect");

        Router.push(redirect);
      }
    }
    loadData();
  }, [isConnected, pkpConnected]);

  return (
    <div className="flex flex-col center-item">
      {!pkpConnected && startChecking ? (
        <div className="mb-36">
          <LitLoading
            icon="lit-logo"
            text="Please select to your cloud wallet to continue"
          />
        </div>
      ) : (
        ""
      )}
      {!isConnected || !address ? (
        <LitLoading icon="lit-logo" text={state.loadingMessage} />
      ) : (
        <PKPSelection
          address={address}
          onDone={() => {
            console.log("Connected both wallet and PKP");
            setStartChecking(true);
          }}
        />
      )}
    </div>
  );
}
export default Login;
