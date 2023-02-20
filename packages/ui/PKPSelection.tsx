import { ECDSAAddresses, getShortAddress, TokenInfo } from "@lit-dev/utils";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { computeAddress } from "ethers/lib/utils.js";
import { useEffect, useReducer, useState } from "react";
import { toast } from "react-hot-toast";
import { LitCopy } from "./LitCopy";
import { LitIcon } from "./LitIcon";
import { LitLoading } from "./LitLoading";
import { PKPCard } from "./PKPCard";
import { usePKPConnectionContext } from "./useContext/usePKPConnectionContext";
import { StateReducer } from "./StateReducer";
import { LitButton } from "./LitButton";
import { watchSigner } from "@wagmi/core";

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

    let tokenInfo: TokenInfo;
    try {
      tokenInfo = await ECDSAAddresses({
        pkpTokenId: tokenIds[i],
        options: {
          cacheContractCall: true,
        },
      });

      tokens.push(tokenInfo);

      if (onProgress) {
        const progress = parseInt(
          (((i + 1) / tokenIds.length) * 100).toFixed(2)
        );
        onProgress(tokens, tokenInfo, progress);
      }
    } catch (e) {
      console.error(e);
      continue;
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

  watchSigner(
    {
      chainId: 1,
    },
    async (provider) => {
      dispatch({
        type: "LOADING",
        loadingMessage: "Fetching PKPs...",
      });

      const addr = (await provider?.getAddress()) as string;

      const result = await fetchPKPs(
        addr,
        (tokens: Array<TokenInfo>, tokenInfo: TokenInfo, progress: number) => {
          dispatch({
            type: "LOADING",
            loadingMessage: `Loading ${progress}%..`,
          });
        }
      );

      dispatch({ type: "SET_DATA", payload: { pkps: result } });
    }
  );

  useEffect(() => {
    async function loadData() {
      dispatch({
        type: "LOADING",
        loadingMessage: "Fetching PKPs...",
      });

      const result = await fetchPKPs(
        address,
        (tokens: Array<TokenInfo>, tokenInfo: TokenInfo, progress: number) => {
          dispatch({
            type: "LOADING",
            loadingMessage: `Loading ${progress}%..`,
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

  const onMint = async () => {
    dispatch({
      type: "LOADING",
      loadingMessage: "Minting PKP...",
    });

    try {
      const litContracts = new LitContracts({
        debug: false,
      });
      await litContracts.connect();

      const tx = await litContracts.pkpNftContractUtil.write.mint();
      console.log("Tx: ", tx);
      toast.success("Successfully minted PKP!", {
        duration: 1000,
      });

      const result = await fetchPKPs(
        address,
        (tokens: Array<TokenInfo>, tokenInfo: TokenInfo, progress: number) => {
          dispatch({
            type: "LOADING",
            loadingMessage: `Loading ${progress}%..`,
          });
        }
      );

      dispatch({ type: "SET_DATA", payload: { pkps: result } });
    } catch (e: any) {
      toast.error(e?.data?.message ?? "Error minting", {
        duration: 1000,
      });
    }

    dispatch({ type: "SET_DATA" });
  };

  if (state.data.pkps?.length <= 0) {
    return (
      <div className="flex flex-col gap-12">
        <h2>Oops... it seems that you don't have any cloud wallets!</h2>
        <div className="m-auto">
          {state.loading ? (
            <LitLoading icon="lit-logo" text={state.loadingMessage} />
          ) : (
            <LitButton onClick={onMint}>Mint PKP</LitButton>
          )}
        </div>
      </div>
    );
  }

  if (state.loading || !state.data.pkps) {
    return <LitLoading icon="lit-logo" text={state.loadingMessage} />;
  }

  return (
    <div className="heading">
      <h3>My Cloud Wallets</h3>
      <div className="pkp-cards">
        {state.data.pkps.map((pkp: TokenInfo, i: number) => {
          // skip if pkp is undefined
          if (!pkp) return null;

          const selected =
            (state.data.selectedPKP as TokenInfo)?.tokenId == pkp?.tokenId;

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
