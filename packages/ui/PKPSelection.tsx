import { ECDSAAddresses, getShortAddress, TokenInfo } from "@lit-dev/utils";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { computeAddress } from "ethers/lib/utils.js";
import { useEffect, useReducer, useState } from "react";
import { toast } from "react-hot-toast";
import { LitCopy } from "./LitCopy";
import { LitIcon } from "./LitIcon";
import { LitLoading } from "./LitLoading";
import { PKPCard } from "./PKPCard";
import { usePKPConnectionContext } from "./PKPConnectionContext";
import { StateReducer } from "./StateReducer";

const fetchPKPs = async (
  walletAddress: string,
  onProgress: (
    tokens: Array<TokenInfo>,
    tokenInfo: TokenInfo,
    progress: number
  ) => void
) => {
  const litContracts = new LitContracts({
    debug: false,
  });
  await litContracts.connect();

  const tokenIds =
    await litContracts.pkpNftContractUtil.read.getTokensByAddress(
      walletAddress
    );

  const tokens = [];

  // async for each
  for (let i = 0; i < tokenIds.length; i++) {
    const tokenInfo = await ECDSAAddresses({
      pkpTokenId: tokenIds[i],
      options: {
        cacheContractCall: true,
      },
    });

    tokens.push(tokenInfo);

    if (onProgress) {
      const progress = parseInt((((i + 1) / tokenIds.length) * 100).toFixed(2));
      onProgress(tokens, tokenInfo, progress);
    }
  }

  return tokens;
};

export const PKPSelection = ({
  address,
  onDone,
}: {
  address: string;
  onDone: any;
}) => {
  const { pkpConnected, selectedPKP, setSelected } = usePKPConnectionContext();

  const [state, dispatch] = useReducer(StateReducer, {
    data: [],
    loading: false,
  });

  useEffect(() => {
    async function loadData() {
      dispatch({ type: "LOADING", loading: true, payload: "Fetching PKPs..." });

      const result = await fetchPKPs(
        address,
        (tokens: Array<TokenInfo>, tokenInfo: TokenInfo, progress: number) => {
          dispatch({
            type: "LOADING",
            loading: true,
            payload: `Loading ${progress}%..`,
          });
        }
      );

      dispatch({ type: "SET_DATA", payload: { pkps: result } });

      // check if localstorage has a selected pkp
      const selectedPKP = localStorage.getItem("lit-selected-pkp");
      if (selectedPKP) {
        const pkp = JSON.parse(selectedPKP);
        dispatch({ type: "SET_DATA", payload: { selectedPKP: pkp } });

        // scroll to the selected pkp
        const pkpCard = document.getElementById(`pkp-card-${pkp.tokenId}`);
        if (pkpCard) {
          pkpCard.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
          });
        }
      }

      // callback done
      if (onDone) {
        onDone();
      }
    }
    loadData();
  }, []);

  if (state.loading || !state.data.pkps)
    return <LitLoading icon="lit-logo" text={state.data} />;

  const onSelectToken = (e: any, pkp: TokenInfo) => {
    if (![...e.target.classList]?.includes("pkp-card-focus")) return;

    // save the selected pkp to localstorage
    try {
      localStorage.setItem("lit-selected-pkp", JSON.stringify(pkp));
      dispatch({ type: "SET_DATA", payload: { selectedPKP: pkp } });

      // update PKPConnectedProvider
      setSelected(pkp);
    } catch (e) {
      toast.error("Error saving selected PKP to localstorage", {
        duration: 1000,
      });
    }
  };

  return (
    <div className="heading">
      <h3>My Cloud Wallets</h3>
      <div className="pkp-cards">
        {state.data.pkps.map((pkp: TokenInfo, i: number) => {
          const selected =
            (state.data.selectedPKP as TokenInfo)?.tokenId == pkp.tokenId;

          return (
            <PKPCard
              id={`pkp-card-${pkp.tokenId}`}
              key={i}
              onClick={(e: any) => onSelectToken(e, pkp)}
              className={`${selected ? "pkp-card active" : "pkp-card"}`}
            >
              <div className="flex pkp-card-focus">
                <div className="pkp-card-icon">
                  <LitIcon icon="wallet" />
                </div>
                <div className="flex flex-col">
                  <div className="pkp-card-title flex space-between">
                    <LitCopy
                      copyText={pkp.publicKey}
                      text={`#${i + 1} | Token ID: ${getShortAddress(
                        pkp.tokenId,
                        8,
                        4
                      )}`}
                    />
                  </div>
                  <div className="pkp-card-addr flex space-between">
                    <LitCopy
                      copyText={pkp.publicKey}
                      text={`Public Key: ${getShortAddress(
                        pkp.publicKey,
                        8,
                        4
                      )}`}
                    />
                  </div>
                  <div className="pkp-card-addr flex space-between">
                    <LitCopy
                      copyText={pkp.publicKey}
                      text={`ETH Address: ${getShortAddress(
                        pkp.ethAddress,
                        8,
                        4
                      )}`}
                    />
                  </div>
                  <div className="pkp-card-addr flex space-between">
                    <LitCopy
                      copyText={pkp.publicKey}
                      text={`BTC Address: ${getShortAddress(
                        pkp.btcAddress,
                        8,
                        4
                      )}`}
                    />
                  </div>
                </div>
                {!selected ? (
                  ""
                ) : (
                  <div className="pkp-card-tick">
                    <LitIcon icon="tick" />
                  </div>
                )}
              </div>
              <div></div>
            </PKPCard>
          );
        })}
      </div>
    </div>
  );
};
