interface UsePKPsOptions {
    litNetwork?: string;
    chain?: string;
}
/**
 * usePKPs is a custom hook that fetches Progrmmable Key Pairs (PKPs) data and returns
 * the data, loading, and error states along with a start function to initiate fetching.
 *
 * Example usage:
 * ```
 * const [data, loading, error, start, render] = usePKPs({ litNetwork: "serrano", chain: "ethereum" });
 *
 * // Call start() to initiate data fetching
 * start();
 * ```
 *
 * @param props Options object containing litNetwork and chain properties
 * @return { data, loading, error, start } The data, loading, error states, and a start function to initiate fetching
 */
export declare function usePKPs(props?: UsePKPsOptions): any[];
export {};
//# sourceMappingURL=usePKPs.d.ts.map