import toast from "react-hot-toast";
import { useFetchData } from "./parents/useFetchData";
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { TokenInfo } from "@lit-protocol/contracts-sdk/src/lib/addresses";
import React from "react";

interface UsePKPsOptions {
  litNetwork?: string;
  chain?: string;
}

/**
 * usePKPs is a custom hook that fetches Public Key Pages (PKPs) data and returns
 * the data, loading, and error states along with a start function to initiate fetching.
 *
 * Example usage:
 * ```
 * const { data, loading, error, start } = usePKPs({ litNetwork: "serrano", chain: "ethereum" });
 *
 * // Call start() to initiate data fetching
 * start();
 * ```
 *
 * @param props Options object containing litNetwork and chain properties
 * @return { data, loading, error, start } The data, loading, error states, and a start function to initiate fetching
 */
export function usePKPs(props?: UsePKPsOptions) {
  const defaultOptions = {
    litNetwork: "serrano",
    chain: "ethereum",
  };

  const fetchFunction = async () => {
    const litNodeClient = new LitNodeClient({
      litNetwork: props?.litNetwork || defaultOptions.litNetwork,
    });

    await litNodeClient.connect();
    let _authSig;

    try {
      _authSig = await LitJsSdk.checkAndSignAuthMessage({
        chain: (props?.chain as any) || defaultOptions.chain,
      });
    } catch (e) {
      toast.error("Authentication failed");
      return;
    }

    const litContracts = new LitContracts();

    await litContracts.connect();

    let tokenInfos: TokenInfo[] = [];

    try {
      tokenInfos =
        await litContracts.pkpNftContractUtil.read.getTokensInfoByAddress(
          _authSig.address
        );
    } catch (e) {
      toast.error("Failed to fetch PKPs");
      return;
    }

    if (tokenInfos.length <= 0) {
      toast.error("No PKPs found");
      return;
    }

    return tokenInfos;
  };

  const defaultRender = (callback: any = (pkp: TokenInfo) => {}) => {
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!data) return null;

    return (
      <div style={{ width: "100%" }}>
        <table style={{ width: "100%", textAlign: "left", padding: "12px" }}>
          <tbody>
            {data.map((pkp: TokenInfo, index: number) => (
              <React.Fragment key={index}>
                <div onClick={() => callback(pkp)}>
                  <tr>
                    <th>#</th>
                    <td>{index + 1}</td>
                  </tr>
                  <tr>
                    <th>Token ID</th>
                    <td>{pkp.tokenId}</td>
                  </tr>
                  <tr>
                    <th>Public Key</th>
                    <td>{pkp.publicKey}</td>
                  </tr>
                  <tr>
                    <th>BTC Address</th>
                    <td>{pkp.btcAddress}</td>
                  </tr>
                  <tr>
                    <th>ETH Address</th>
                    <td>{pkp.ethAddress}</td>
                  </tr>
                  <tr>
                    <th>Cosmos Address</th>
                    <td>{pkp.cosmosAddress}</td>
                  </tr>
                </div>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const { data, loading, error, start } = useFetchData(fetchFunction);

  return [data, loading, error, start, defaultRender];
}
