import { SelectionItem } from "@lit-dev/utils";
import { useReducer } from "react";
import { LitButton } from "../LitButton";
import { LitSelectionV1 } from "../LitSelectV1";
import { StateReducer } from "../StateReducer";

export const ELIntervalSelector = (prop: any) => {
  // -- default data
  const defaultData: Array<SelectionItem> = [
    {
      id: "repeat_until",
      name: "Repeat until",
      enabled: true,
    },
    {
      id: "repeat_for_x_blocks",
      name: "Repeat for x blocks ",
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
      onClick={(item: { name: string }) => prop?.onClick(item)}
    />
  );
};
