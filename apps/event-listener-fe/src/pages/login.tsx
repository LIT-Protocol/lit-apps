import Router from "next/router";
import { useEffect, useReducer, useState } from "react";
import {
  LitHeaderV1,
  LitLoading,
  PKPSelection,
  StateReducer,
  usePKPConnectionContext,
} from "ui";
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
          payload: "Please connect your wallet to continue",
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
  }, [isConnected]);

  return (
    <div>
      <LitHeaderV1 title="Lit Actions Event Listener" />

      <div className="flex flex-col center-item">
        {!pkpConnected && startChecking ? (
          <div className="mb-36">
            <LitLoading
              icon="lit-logo"
              text="Please connect to your cloud wallet to continue"
            />
          </div>
        ) : (
          ""
        )}
        {!_isConnected || !address ? (
          <LitLoading icon="lit-logo" text={state.data} />
        ) : (
          <PKPSelection
            address={address}
            onDone={() => {
              console.log("Done?????");
              setStartChecking(true);
            }}
          />
        )}
      </div>
    </div>
  );
}
export default Login;
