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
export declare function useFetchData(fetchFunction: any): {
    start: () => Promise<void>;
    data: any;
    loading: boolean;
    error: unknown;
};
//# sourceMappingURL=useFetchData.d.ts.map