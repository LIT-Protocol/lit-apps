export const StateReducer = (
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
      newState = { data: action.payload, loading: true };
      break;
    case "SET_DATA":
      // copy the previous action.payload
      // newState = { ...state, data: action.payload };

      newState = { data: { ...state.data, ...action.payload }, loading: false };
      break;
    case "STOP_LOADING":
      newState = { data: { ...state.data, ...action.payload }, loading: false };
      break;

    default:
      throw new Error();
  }

  return newState;
};
