import { ECDSAAddresses } from "@lit-dev/utils";
import { useEffect, useReducer } from "react";
import {
  LitButton,
  LitHeaderV1,
  LitLoading,
  PKPSelection,
  StateReducer,
} from "ui";
import { useAccount } from "wagmi";

export function Login() {
  const { address, isConnected } = useAccount();

  const [state, dispatch] = useReducer(StateReducer, {
    data: [],
    loading: false,
  });

  useEffect(() => {
    async function loadData() {
      if (!isConnected || !address) {
        dispatch({
          type: "LOADING",
          loading: true,
          payload: "Please connect your wallet to continue",
        });

        return;
      }
      // if localstorage has 'redirect' key, redirect to that page
      // const redirect = localStorage.getItem("redirect");
      // if (redirect) {
      //   localStorage.removeItem("redirect");

      //   Router.push(redirect);
      // }
    }
    loadData();
  }, [isConnected]);

  return (
    <>
      <LitHeaderV1 title="Lit Actions Event Listener" />

      {!isConnected || !address ? (
        <div className="flex flex-col center-item">
          <LitLoading icon="lit-logo" text={state.data} />
        </div>
      ) : (
        <div className="flex flex-col center-item">
          <PKPSelection address={address} />
        </div>
      )}
    </>
  );
}
export default Login;
