import { LitContracts } from "@lit-protocol/contracts-sdk";
import { useEffect, useReducer } from "react";
import { LitLoading } from "./LitLoading";

export const pkpSelectionReducer = (
  state: {
    data: any;
  },
  action: {
    type: string;
    payload?: any;
    loading?: boolean;
  }
) => {
  let newState;

  switch (action.type) {
    case "LOADING":
      newState = { ...state, loading: true };
      break;
    case "SET_DATA":
      newState = { data: action.payload, loading: false };
      break;
    default:
      throw new Error();
  }

  return newState;
};

const fetchPKPs = async () => {
  const litContracts = new LitContracts({
    debug: false,
  });
  await litContracts.connect();

  // const tokens = await litContracts.pkpNftContractUtil.read.getTokensByAddress(
  //   "0x3B5dD260598B7579A0b015A1F3BBF322aDC499A1"
  // );

  // return tokens;
};

export const PKPSelection = () => {
  const [state, dispatch] = useReducer(pkpSelectionReducer, {
    data: [],
    loading: false,
  });

  useEffect(() => {
    async function loadData() {
      dispatch({ type: "LOADING", loading: true });
      const result = await fetchPKPs();
      dispatch({ type: "SET_DATA", payload: result });
    }
    loadData();
  }, []);

  return (
    <>
      {!state.loading ? null : (
        <LitLoading icon="lit-logo" text="Fetching PKPs..." />
      )}
    </>
  );
};
