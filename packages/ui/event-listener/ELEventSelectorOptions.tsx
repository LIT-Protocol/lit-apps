import { useEffect, useReducer, useState } from "react";
import { LitButton } from "../LitButton";
import { LitIcon } from "../LitIcon";
import { StateReducer } from "../StateReducer";
import { JsonRpcProvider } from "@ethersproject/providers";
import { LitInputTextV1 } from "../form/LitInputTextV1";

export const ELEventSelectorOptions = (prop: any) => {
  const [state, dispatch] = useReducer(StateReducer, {
    data: [],
    loading: false,
  });

  const [jsonRpcProvider, setJsonRpcProvider] = useState<any>();
  const [currentBlockNumber, setCurrentBlockNumber] = useState(0);

  useEffect(() => {
    if (!jsonRpcProvider && !currentBlockNumber) {
      const provider = new JsonRpcProvider("https://rpc-mumbai.maticvigil.com");
      setJsonRpcProvider(provider);

      provider.on("block", async (blockNumber: number) => {
        if (blockNumber > currentBlockNumber) {
          setCurrentBlockNumber(blockNumber);
        }
      });
    }
  });

  const handleNewState = (newState: any) => {
    dispatch({
      type: "SET_DATA",
      payload: newState,
    });

    if (prop.onChange) {
      console.log("state:", state.data);
      prop.onChange({ ...state.data, ...newState });
    }
  };

  return (
    <div className="flex flex-col gap-8 relative">
      <div className="lit-block-number">
        <span>
          <LitIcon icon="greendot"></LitIcon>
        </span>
        <span>{currentBlockNumber}</span>
      </div>
      <LitInputTextV1
        label="Start Block"
        onChange={(e: any) =>
          handleNewState({
            startBlock: e.target.value,
          })
        }
      />
      <div className="lit-input-v1 text-xs txt-grey text-right flex gap-6">
        <LitButton className="lit-mini-button active">Repeat until</LitButton>
        <LitButton className="lit-mini-button disabled">
          Repeat every x blocks
        </LitButton>
      </div>
      <LitInputTextV1
        label="End Block"
        onChange={(e: any) =>
          handleNewState({
            endBlock: e.target.value,
          })
        }
      />
    </div>
  );
};
