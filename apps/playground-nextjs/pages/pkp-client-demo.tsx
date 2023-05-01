import "ui/theme.purple.css";
import "ui/utils.css";
import Head from "next/head";
import { Toaster } from "react-hot-toast";
import { toast } from "react-hot-toast";

import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { PKPClient } from "@lit-protocol/pkp-client";
import { LitContracts } from "@lit-protocol/contracts-sdk";

import {
  LitButton,
  LitCard,
  LitLoading,
  LitNote,
  LitSelectionV1,
  LitTable,
  LitToast,
} from "ui";
import { useState } from "react";
import { getShortAddress } from "@lit-dev/utils";
import { StdFee, coins } from "@cosmjs/amino";
import { GasPrice, calculateFee } from "@cosmjs/stargate";

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

    const _authSig = await LitJsSdk.checkAndSignAuthMessage({
      chain: "ethereum",
    });

    setAuthSig(_authSig);

    const litContracts = new LitContracts();

    await litContracts.connect();

    const tokenInfos =
      await litContracts.pkpNftContractUtil.read.getTokensInfoByAddress(
        _authSig.address
      );

    console.log("tokenInfos", tokenInfos);

    setTokens(tokenInfos);
    setLoading(false);
  };

  const setPKP = async (pkp: any) => {
    setSelectedPKP(pkp);

    const pkpClient = new PKPClient({
      controllerAuthSig: authSig,
      pkpPubKey: pkp.publicKey,
      cosmosAddressPrefix: "cosmos",
    });

    await pkpClient.connect();

    setPKPClient(pkpClient);
  };

  const go = async () => {
    const pkpClient = new PKPClient({
      controllerAuthSig: authSig,
      pkpPubKey: selectedPKP.publicKey,
      cosmosAddressPrefix: "cosmos",
    });

    await pkpClient.connect();

    const cosmosWallet = pkpClient.getCosmosWallet();

    console.log("cosmosWallet", cosmosWallet);

    const [pkpAccount] = await cosmosWallet.getAccounts();

    console.log("pkpAccount", pkpAccount);
  };

  const selectSigner = async (pkp: PKPInfo) => {
    if (pkp.type !== "Cosmos" && pkp.type !== "ETH") {
      console.log("Unknown signer type", pkp.type);
      return;
    }
    setSigner(pkp.type);
  };

  const runCosmos = async () => {
    if (!pkpClient) {
      toast.error("PKPClient not found.");
      return;
    }

    const cosmosWallet = pkpClient.getCosmosWallet();
    console.log("cosmosWallet", cosmosWallet);

    const accounts = await cosmosWallet.getAccounts();

    // access stargate client
    const client = await cosmosWallet.getClient();

    const balances = await client.getAllBalances(accounts[0].address);

    console.log("accounts:", accounts);
    console.log("balances:", balances);

    const amount = coins(1, "uatom");
    const gasPrice = GasPrice.fromString("0.025uatom");
    const sendFee: StdFee = calculateFee(80_000, gasPrice);

    const tx = await client.sendTokens(
      accounts[0].address,
      "cosmos1jyz3m6gxuwceq63e44fqpgyw2504ux85ta8vma",
      amount,
      sendFee,
      "Transaction"
    );

    console.log("tx", tx);
  };

  // Ends

  const renderCosmosOptions = () => {
    return (
      <div className="mt-12">
        <LitButton onClick={runCosmos}>Run</LitButton>
      </div>
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
          <div className="AlertDialogOverlay flex z-index-999">
            <div className="m-auto">
              <LitLoading icon="lit-logo" />
              <h6>Loading</h6>
            </div>
          </div>
        ) : null}

        {/* ----- Start ----- */}
        <h1 className="mt-12 mb-12">PKPClient Demo</h1>
        <LitButton onClick={viewPKPs}>View PKPs</LitButton>

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
            <h5 className="mt-12 text-center info-box">
              ✅ Selected {signer} Signer
            </h5>

            {signer === "Cosmos" ? renderCosmosOptions() : ""}
          </>
        ) : (
          ""
        )}
      </div>
    </main>
  );
}
