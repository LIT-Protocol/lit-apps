import { useReducer, useEffect, useCallback } from "react";

type State = {
  data: any | null;
  loading: boolean;
  error: unknown | null;
};

type Action =
  | { type: "FETCH_INIT" }
  | { type: "FETCH_SUCCESS"; payload: any }
  | { type: "FETCH_FAILURE"; payload: unknown };

const dataFetchReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "FETCH_INIT":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, data: action.payload, error: null };
    case "FETCH_FAILURE":
      return { ...state, loading: false, error: action.payload };
    default:
      throw new Error("Invalid action type");
  }
};

/**
 * useFetchData is a custom hook that fetches data from an API
 * when the returned "start" function is called, and returns the data, loading, and error states.
 *
 * Example usage:
 * ```
 * const fetchFunction = async () => {
 *   const response = await fetch(`https://example.com/api/endpoint`);
 *   return response.json();
 * };
 *
 * const { data, loading, error, start } = useFetchData(fetchFunction);
 *
 * // Call start() to initiate data fetching
 * start();
 * ```
 *
 * @param fetchFunction The function to fetch data
 * @return { data, loading, error, start } The data, loading, error states, and a start function to initiate fetching
 */
export function useFetchData(fetchFunction: any) {
  const [state, dispatch] = useReducer(dataFetchReducer, {
    data: null,
    loading: false,
    error: null,
  });

  const fetchData = useCallback(async () => {
    dispatch({ type: "FETCH_INIT" });
    try {
      const responseData = await fetchFunction();
      dispatch({ type: "FETCH_SUCCESS", payload: responseData });
    } catch (error) {
      dispatch({ type: "FETCH_FAILURE", payload: error });
    }
  }, [fetchFunction]);

  return { ...state, start: fetchData };
}
