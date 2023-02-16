import { useReducer } from "react";
import { StateReducer } from "../StateReducer";

export const ELHelloWorld = () => {
  const [state, dispatch] = useReducer(StateReducer, {
    data: [],
    loading: false,
  });

  return <></>;
};
