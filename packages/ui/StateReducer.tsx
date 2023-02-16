export const StateReducer = (
  state: {
    data: any;
  },
  action: {
    type: string;
    payload?: any;
    loading?: boolean;
    loadingMessage?: string;
  }
) => {
  let newState;

  switch (action.type) {
    case "LOADING":
      newState = {
        data: { ...state.data },
        loading: true,
        loadingMessage: action.loadingMessage ?? "Loading...",
      };
      break;
    case "SET_DATA":
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
