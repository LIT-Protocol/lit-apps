import "ui/theme.purple.css";
import "ui/utils.css";
import Head from "next/head";
import { Toaster } from "react-hot-toast";
import { toast } from "react-hot-toast";
import { useCustomState } from "ui";

import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { PKPClient } from "@lit-protocol/pkp-client";
import { LitContracts } from "@lit-protocol/contracts-sdk";

import { LitButton, LitInputTextV1, LitLoading, LitNote, LitTable } from "ui";
import { useEffect, useState } from "react";
import { getShortAddress } from "@lit-dev/utils";
import { LitCopy } from "ui";

const DEFAULT_RECIPIENT_ADDRESS =
  "cosmos1jyz3m6gxuwceq63e44fqpgyw2504ux85ta8vma";

const EXPLORER_TX = `https://mintscan.io/cosmos/txs/`;

type PKPInfo = {
  type: string;
  address: string;
  hasSigner?: boolean;
  enabled?: boolean;
};

export default function PKPClientDemo() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [selectedPKP, setSelectedPKP] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [authSig, setAuthSig] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const [pkpClient, setPKPClient] = useState<PKPClient | null>(null);
  const [hasPKPs, setHasPKPs] = useState<boolean | null>(null);
  const [cosmosBalances, setCosmosBalances] = useState<any>();

  const [cosmosWallet, setCosmosWallet] = useState<any>();
  const [stargateClient, setStargateClient] = useState<any>();
  const [txLink, setTxLink] = useState<string | null>(null);

  // cosmos state
  const [cosmosState, handleCosmoState] = useCustomState({
    denom: "uatom",
    gasPrice: 0.025,
    fee: 80_000,
  });

  useEffect(() => {
    console.log("signer", signer);
    if (signer === "Cosmos") {
      handleCosmoState({
        recipientAddress: DEFAULT_RECIPIENT_ADDRESS,
        denom: "uatom",
        gasPrice: 0.025,
        fee: 80_000,
      });

      getCosmosBalances();

      const intervalId = setInterval(() => {
        getCosmosBalances();
      }, 5000);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [signer]);

  const getCosmosBalances = async () => {
    console.log("getCosmosBalances");
    if (!pkpClient || !stargateClient) return;

    const accounts = await cosmosWallet.getAccounts();

    const balances = await stargateClient.getAllBalances(accounts[0].address);

    console.log("getCosmosBalances balances:", balances);

    setCosmosBalances(balances);
  };

  // Starts

  /**
   * Fetches and displays user's Public Key Proofs (PKPs), handles authentication,
   * and manages loading state during the process.
   */
  const viewPKPs = async () => {
    setLoading(true);

    const litNodeClient = new LitNodeClient({
      litNetwork: "serrano",
    });

    await litNodeClient.connect();
    let _authSig;

    try {
      _authSig = await LitJsSdk.checkAndSignAuthMessage({
        chain: "ethereum",
      });
    } catch (e) {
      toast.error("Authentication failed");
      setLoading(false);
      return;
    }

    setAuthSig(_authSig);

    const litContracts = new LitContracts();

    await litContracts.connect();

    let tokenInfos: any[] = [];

    try {
      tokenInfos =
        await litContracts.pkpNftContractUtil.read.getTokensInfoByAddress(
          _authSig.address
        );
    } catch (e) {
      toast.error("Failed to fetch PKPs");
      setLoading(false);
      return;
    }

    console.log("tokenInfos", tokenInfos);

    if (tokenInfos.length <= 0) {
      toast.error("No PKPs found");
      setHasPKPs(false);
      setLoading(false);
      return;
    }

    setTokens(tokenInfos);
    setLoading(false);
    setHasPKPs(true);
  };

  const mintPKP = async () => {
    const litContracts = new LitContracts();

    await litContracts.connect();

    setLoading(true);
    let mint;

    try {
      mint = await litContracts.pkpNftContractUtil.write.mint();
      console.log("mint", mint);
      viewPKPs();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message, { duration: 1000 });
    }
    setLoading(false);
  };

  const setPKP = async (pkp: any) => {
    setLoading(true);
    setSigner(null);
    setSelectedPKP(pkp);

    const pkpClient = new PKPClient({
      controllerAuthSig: authSig,
      pkpPubKey: pkp.publicKey,
      cosmosAddressPrefix: "cosmos",
    });

    await pkpClient.connect();

    setPKPClient(pkpClient);

    const cosmosWallet = pkpClient.getCosmosWallet();

    setCosmosWallet(cosmosWallet);

    const stargateClient = await cosmosWallet.getClient();

    setStargateClient(stargateClient);
    setLoading(false);
  };

  const selectSigner = async (pkp: PKPInfo) => {
    if (pkp.type !== "Cosmos" && pkp.type !== "ETH") {
      console.log("Unknown signer type", pkp.type);
      return;
    }
    setSigner(pkp.type);
  };

  const sendCosmosTx = async () => {
    if (!cosmosWallet || !pkpClient) return;

    setLoading(true);

    let _pkpClient = pkpClient as PKPClient;

    let _cosmosWallet = _pkpClient.getCosmosWallet();

    const state = cosmosState.data;

    try {
      const { amount, fee } = _cosmosWallet.formSendTx({
        amount: parseInt(state.amount),
        denom: state.denom,
        gasPrice: 0.025,
        fee: 80_000,
      });

      let tx;

      try {
        tx = await stargateClient.sendTokens(
          selectedPKP.cosmosAddress,
          state.recipientAddress,
          amount,
          fee,
          "Transaction"
        );
        console.log("tx", tx);

        toast.success("Transaction sent!", { duration: 1000 });

        const txLink = `${EXPLORER_TX}${tx.transactionHash}`;
        setTxLink(txLink);
      } catch (e: any) {
        setLoading(false);
        toast.error(e.message, { duration: 1000 });
        console.error(e);
      }
    } catch (e: any) {
      setLoading(false);
      toast.error(e.message, { duration: 1000 });
      console.error(e);
    }
    setLoading(false);
  };

  // Ends

  const renderCosmosOptions = () => {
    return (
      <>
        {cosmosBalances?.length <= 0 ? (
          <>
            <LitNote className="mt-12">
              <div className="error-box">
                You don't have any balances. Please send some tokens to your
                address
              </div>

              <div className="mt-12 flex">
                <LitCopy
                  copyText={selectedPKP.cosmosAddress}
                  text={selectedPKP.cosmosAddress}
                />
              </div>
            </LitNote>
          </>
        ) : (
          <div className="mt-12 max-width-500">
            <LitNote>
              <h3>Balances</h3>
              <table>
                {cosmosBalances?.map((item: any, index: any) => {
                  return (
                    <tr key={index}>
                      <td>{item.denom}</td>
                      <td>{item.amount}</td>
                    </tr>
                  );
                })}
              </table>
            </LitNote>
            {/* <LitButton onClick={runCosmos}>Run</LitButton> */}
            {/* {cosmosState !== null && (
          <>{JSON.stringify(cosmosState.data, null, 2)}</>
        )} */}
            <div className="flex flex-col">
              <LitInputTextV1
                label="address"
                className="mt-6"
                placeholder="Recipient address"
                value={cosmosState.data?.recipientAddress}
                onChange={(e: any) =>
                  handleCosmoState({
                    recipientAddress: e.target.value,
                  })
                }
              />
              <LitInputTextV1
                label="amount"
                className="mt-6"
                placeholder="Enter amount"
                onChange={(e: any) =>
                  handleCosmoState({
                    amount: e.target.value,
                  })
                }
              />

              <LitInputTextV1
                label="denom"
                className="mt-6"
                placeholder="Denom (eg. uatom)"
                value={cosmosState.data?.denom}
                onChange={(e: any) =>
                  handleCosmoState({
                    denom: e.target.value,
                  })
                }
              />
              {/* <LitInputTextV1
                label="gas-price"
                className="mt-6"
                placeholder="Gas price (eg. 0.025)"
                value={cosmosState.data?.gasPrice}
                onChange={(e: any) =>
                  handleCosmoState({
                    gasPrice: e.target.value,
                  })
                }
              />
              <LitInputTextV1
                label="fee"
                className="mt-6"
                placeholder="Fee (eg. 80_000)"
                value={cosmosState.data?.fee}
                onChange={(e: any) =>
                  handleCosmoState({
                    fee: e.target.value,
                  })
                }
              /> */}
            </div>
            <div className="mt-12 flex">
              <LitButton className="ml-auto lit-button" onClick={sendCosmosTx}>
                Send Tx
              </LitButton>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <main data-lit-theme="purple">
      <Toaster />

      <Head>
        <title>Demo: PKPClient</title>
      </Head>

      <div className="flex flex-col center p-12">
        {/* ----- whole screen overlay ----- */}
        {loading ? (
          <div
            className={`AlertDialogOverlay flex ${
              selectedPKP ? "z-index-999" : ""
            }`}
          >
            <div className="m-auto">
              <LitLoading icon="lit-logo" />
              <h6>Loading</h6>
            </div>
          </div>
        ) : null}

        {/* ----- Start ----- */}
        <h1 className="mt-12 mb-12">PKPClient Demo</h1>

        {!txLink ? (
          ""
        ) : (
          <div className="info-brand mb-12 text-sm">
            Tx Link:{" "}
            <a href={txLink} target="_blank">
              {txLink}
            </a>
          </div>
        )}

        <LitButton onClick={viewPKPs}>View PKPs</LitButton>

        {/* Mint PKP if controller has no PKP */}
        {!hasPKPs && (
          <div className="mt-12 flex flex-col">
            <LitButton className="lit-button m-auto" onClick={mintPKP}>
              Mint PKP
            </LitButton>
            <LitNote className="mt-12 mb-12">
              You can get some FREE LIT from the{" "}
              <a href="https://faucet.litprotocol.com/" target="_blank">
                Lit Faucet
              </a>
            </LitNote>
          </div>
        )}

        {tokens.length > 0 ? (
          <h5 className="mt-12 text-center info-box">✅ PKPs</h5>
        ) : (
          ""
        )}
        <div className="flex flex-col gap-8 pt-12">
          {tokens.map((token, index) => (
            <div key={index} className="m-auto">
              <LitButton className="lit-button" onClick={() => setPKP(token)}>
                <div className="flex flex-col">TokenID: {token.tokenId}</div>
              </LitButton>
            </div>
          ))}
        </div>

        {/* selected token */}
        {!selectedPKP ? (
          ""
        ) : (
          <>
            <h5 className="mt-12 text-center info-box">✅ Selected PKPs</h5>
            <LitNote className="mt-12">
              {/* <h1 className="mb-12">Your Selected PKP</h1> */}

              <LitTable<PKPInfo>
                data={[
                  {
                    type: "Token ID",
                    address: selectedPKP.tokenId,
                  },
                  {
                    type: "Public Key",
                    address: selectedPKP.publicKey,
                  },
                  {
                    type: "BTC",
                    address: selectedPKP.btcAddress,
                    hasSigner: true,
                    enabled: false,
                  },
                  {
                    type: "ETH",
                    address: selectedPKP.ethAddress,
                    hasSigner: true,
                    enabled: true,
                  },
                  {
                    type: "Cosmos",
                    address: selectedPKP.cosmosAddress,
                    hasSigner: true,
                    enabled: true,
                  },
                ]}
                headers={["Type", "Identifier", "Action"]}
                renderRow={(row: any, index) => (
                  <tr key={index}>
                    <td>
                      <h6>{row.type}</h6>
                    </td>
                    <td>
                      <h6
                        onClick={() => {
                          navigator.clipboard.writeText(row.address);
                          toast.success(
                            `Copied ${getShortAddress(row.address)}`,
                            {
                              duration: 1000,
                            }
                          );
                        }}
                      >
                        {row.address}
                      </h6>
                    </td>
                    <td>
                      {row.hasSigner ? (
                        <LitButton
                          className={`${
                            !row.enabled ? "disabled" : ""
                          } lit-button`}
                          onClick={() => selectSigner(row)}
                        >
                          Select Signer
                        </LitButton>
                      ) : (
                        ""
                      )}
                    </td>
                  </tr>
                )}
              />
            </LitNote>
          </>
        )}

        {signer ? (
          <>
            <h5 className="mt-12 text-center info-box">✅ Selected {signer}</h5>

            {signer === "Cosmos" ? renderCosmosOptions() : ""}
          </>
        ) : (
          ""
        )}
      </div>
    </main>
  );
}
