// Usage:
// -----
// import React from "react";
// import { useCustomState } from "./useCustomState";

// const MyComponent = (props: any) => {
//   const initialState = { data: [], loading: false };
//   const [state, handleNewState] = useCustomState(initialState, props.onChange);

//   // Your component logic here

//   return <div>My component</div>;
// };

// export default MyComponent;

// Then use it like this:
// ----
//  const handleNewState = (newState: any) => {
//   dispatch({
//     type: "SET_DATA",
//     payload: newState,
//   });

//   if (prop.onChange) {
//     console.log("state:", state.data);
//     prop.onChange({ ...state.data, ...newState });
//   }
// };

import { useReducer } from "react";

const StateReducer = (state: any, action: any) => {
  let newState;

  switch (action.type) {
    case "SET_DATA":
      newState = { data: { ...state.data, ...action.payload }, loading: false };
      break;
    default:
      return state;
  }

  return newState;
};

export const useCustomState = (
  initialState: any,
  onChange?: (newState: any) => void
) => {
  const [state, dispatch] = useReducer(StateReducer, initialState);

  const handleNewState = (newState: any) => {
    dispatch({
      type: "SET_DATA",
      payload: newState,
    });

    if (onChange) {
      console.log("state:", state.data);
      onChange({ ...state.data, ...newState });
    }
  };

  const clearAllState = () => {
    dispatch({
      type: "SET_DATA",
      payload: initialState,
    });

    if (onChange) {
      onChange(initialState);
    }
  };

  return [state, handleNewState, clearAllState];
};
