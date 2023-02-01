import { ethers } from "ethers";
import { Interface } from "@ethersproject/abi";
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { publicKeyToEthAddress } from "@lit-dev/utils";

export const swapStubs = {
  // example stub data, can be used or not
  tokenIn: {
    chainId: 137,
    decimals: 18,
    address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    symbol: "WMATIC",
    name: "Wrapped Matic",
  },

  tokenOut: {
    chainId: 137,
    decimals: 6,
    address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    symbol: "USDC",
    name: "USD//C",
  },
  // this is the demo PKP address that's in all of our docs
  pkpInfo: {
    publicKey:
      "0x04e0fe6a5e9447112a272b3bfea3cbcb48a730c731d9edd434417d30f5b25966cb8543cece8ba67fd6bbbb9ba952e28db541de9a898cca0257e5479033c3b7b021",
  },

  authSig: {
    sig: "0x2bdede6164f56a601fc17a8a78327d28b54e87cf3fa20373fca1d73b804566736d76efe2dd79a4627870a50e66e1a9050ca333b6f98d9415d8bca424980611ca1c",
    derivedVia: "web3.eth.personal.sign",
    signedMessage:
      "localhost wants you to sign in with your Ethereum account:\n0x9D1a5EC58232A894eBFcB5e466E3075b23101B89\n\nThis is a key for Partiful\n\nURI: https://localhost/login\nVersion: 1\nChain ID: 1\nNonce: 1LF00rraLO4f7ZSIt\nIssued At: 2022-06-03T05:59:09.959Z",
    address: "0x9D1a5EC58232A894eBFcB5e466E3075b23101B89",
  },
};

// these are necessary for the swap to work
const SWAP_ROUTER_ADDRESS = "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45";
const signEcdsaCode = `
  async function getSignatures() {
    const approveSig = await LitActions.signEcdsa({ toSign: approveMessage, publicKey, sigName: 'approveTx' });
    const exactInputSingleSig = await LitActions.signEcdsa({toSign: exactInputSingleMessage, publicKey, sigName: 'exactInputSingleTx'});
  }
​
  getSignatures();
`;

type PKPInfo = {
  publicKey: string;
};

type SwapToken = {
  chainId: number;
  decimals: number;
  address: string;
  symbol: string;
  name: string;
};

type AuthSig = {
  sig: string;
  derivedVia: string;
  signedMessage: string;
  address: string;
};

interface ExecuteSwapProp {
  tokenIn: SwapToken;
  tokenOut: SwapToken;
  pkp: PKPInfo;
  authSig: AuthSig;
  amountToSell: string;
  provider: ethers.providers.JsonRpcProvider;
}
export const executeSwap = async (props: ExecuteSwapProp) => {
  const { tokenIn, tokenOut, pkp, authSig, amountToSell, provider } = props;

  const pkpAddress = publicKeyToEthAddress(pkp.publicKey);

  const exactInputSingleParams = {
    tokenIn: tokenIn.address,
    tokenOut: tokenOut.address,
    fee: 3000,
    recipient: pkpAddress,
    amountIn: ethers.utils
      .parseUnits(amountToSell, tokenIn.decimals)
      .toString(),
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0,
  };
  const approveCalldata = generateApproveCalldata(
    SWAP_ROUTER_ADDRESS,
    exactInputSingleParams.amountIn
  );
  const exactInputSingleCalldata = generateSwapExactInputSingleCalldata(
    exactInputSingleParams
  );
  const gasPrice = await provider.getGasPrice();
  const chainId = tokenIn.chainId;
  const nonceCount = await provider.getTransactionCount(pkpAddress);
  const approveTx = {
    to: tokenIn.address,
    nonce: nonceCount,
    value: 0,
    gasPrice: gasPrice,
    gasLimit: 150000,
    chainId: chainId,
    data: approveCalldata,
  };
  console.log("ApproveTx: ", approveTx);
  const approveMessage = ethers.utils.arrayify(getMessage(approveTx));
  const exactInputSingleTx = {
    to: SWAP_ROUTER_ADDRESS,
    value: 0,
    nonce: nonceCount + 1,
    gasPrice: gasPrice,
    gasLimit: 500000,
    chainId: chainId,
    data: exactInputSingleCalldata,
  };
  console.log("ExactInputSingleTx: ", exactInputSingleTx);
  const exactInputSingleMessage = ethers.utils.arrayify(
    getMessage(exactInputSingleTx)
  );
  let litNodeClient: LitNodeClient;

  try {
    litNodeClient = new LitJsSdk.LitNodeClient({
      litNetwork: "serrano",
      debug: false,
    });
    await litNodeClient.connect();
  } catch (err) {
    console.log("Unable to connect to network", err);
    return;
  }
  if (!litNodeClient) {
    console.log("LitNodeClient was not instantiated");
    return;
  }
  console.log("LitNodeClient connected");
  const jsParams = {
    exactInputSingleMessage,
    approveMessage,
    publicKey: pkp.publicKey,
    approveSigName: "approveTx",
    exactInputSingleSigName: "exactInputSingleTx",
  };
  console.log("JsParams:", jsParams);
  console.log("AuthSig:", authSig);
  let litActionRes;
  try {
    console.log("Executing LitAction");
    litActionRes = await litNodeClient.executeJs({
      code: signEcdsaCode,
      authSig,
      jsParams: jsParams,
    });
    console.log("LitAction Res:", litActionRes);
  } catch (err) {
    console.log("Unable to execute code", err);
    return;
  }
  if (
    litActionRes["signatures"] &&
    Object.keys(litActionRes["signatures"]).length === 2
  ) {
    console.log("Signing approveTx");
    const signedApproveTx = joinAndSignTx({
      litActionRes,
      tx: approveTx,
      key: "approveTx",
    });
    console.log("Signing exactInputSingleTx");
    const signedExactInputSingleTx = joinAndSignTx({
      litActionRes,
      tx: exactInputSingleTx,
      key: "exactInputSingleTx",
    });
    let signedApproveTxRes;
    let signedExactInputSingleTxRes;
    // send the transactions
    try {
      console.log("Sending signedApproveTx");
      signedApproveTxRes = await provider.sendTransaction(signedApproveTx);
      await signedApproveTxRes.wait();
      signedExactInputSingleTxRes = await provider.sendTransaction(
        signedExactInputSingleTx
      );
      await signedExactInputSingleTxRes.wait();
      console.log("Successful swap - signedApproveTxRes:", signedApproveTxRes);
      console.log(
        "Successful swap - signedExactInputSingleTxRes:",
        signedExactInputSingleTxRes
      );
    } catch (err) {
      console.log("Failed to execute swap", err);
    }
  }
};
function joinAndSignTx({ litActionRes, tx, key }) {
  const { signatures } = litActionRes;
  const encodedSignature = ethers.utils.joinSignature({
    r: "0x" + signatures[key].r,
    s: "0x" + signatures[key].s,
    recoveryParam: signatures[key].recid,
  });
  const signedTx = ethers.utils.serializeTransaction(tx, encodedSignature);
  return signedTx;
}
function getMessage(transaction) {
  return ethers.utils.keccak256(
    ethers.utils.arrayify(ethers.utils.serializeTransaction(transaction))
  );
}
function generateApproveCalldata(spender, amount) {
  const approveInterface = new Interface([
    "function approve(address,uint256) returns (bool)",
  ]);
  return approveInterface.encodeFunctionData("approve", [spender, amount]);
}
export function generateSwapExactInputSingleCalldata(exactInputSingleData) {
  const exactInputSingleInterface = new Interface([
    "function exactInputSingle(tuple(address,address,uint24,address,uint256,uint256,uint160)) external payable returns (uint256)",
  ]);
  return exactInputSingleInterface.encodeFunctionData("exactInputSingle", [
    [
      exactInputSingleData.tokenIn,
      exactInputSingleData.tokenOut,
      exactInputSingleData.fee,
      exactInputSingleData.recipient,
      exactInputSingleData.amountIn,
      exactInputSingleData.amountOutMinimum,
      exactInputSingleData.sqrtPriceLimitX96,
    ],
  ]);
}
