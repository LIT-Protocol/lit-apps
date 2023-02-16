import { SelectionItem } from "@lit-dev/utils";
import { useReducer } from "react";
import { LitButton } from "../LitButton";
import { LitSelectionV1 } from "../LitSelectV1";
import { StateReducer } from "../StateReducer";

export const ELEventSelector = (prop: any) => {
  // -- default data
  const defaultData: Array<SelectionItem> = [
    {
      id: "block",
      name: "block",
      enabled: true,
    },
    {
      id: "periodic",
      name: "periodic",
      enabled: false,
    },
    {
      id: "webhook",
      name: "webhook",
      enabled: false,
    },
    {
      id: "contract",
      name: "contract",
      enabled: false,
    },
    {
      id: "transaction",
      name: "transaction",
      enabled: false,
    },
  ];

  const [state, dispatch] = useReducer(StateReducer, {
    data: defaultData,
    loading: false,
  });

  return (
    <LitSelectionV1
      items={state.data}
      button={{
        component: LitButton,
        className: "lit-mini-button capitalize",
      }}
      // onClick={(item: { name: string }) => {
      //   console.log(item.name);
      // }}
      onClick={(item: { name: string }) => prop?.onClick(item)}
    />
  );
};
