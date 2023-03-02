import * as LitJsSdk from "@lit-protocol/lit-node-client";
import fs from "fs";
import dotenv from "dotenv";
import { computeAddress, Interface, joinSignature } from "ethers/lib/utils";
import { ethers, providers } from "ethers";
import { ECDSAAddresses } from "@lit-dev/utils";
import { executeSwap } from "@lit-dev/lit-actions";

dotenv.config();
// read the file
const code = fs.readFileSync(
  "../../packages/lit-actions/src/to-be-converted/wip-swap.action.mjs",
  "utf8"
);

/**
 * Get encoded signature
 */
const getEncodedSignature = (sig) => {
  try {
    const _sig = {
      r: "0x" + sig.r,
      s: "0x" + sig.s,
      recoveryParam: sig.recid,
    };

    const encodedSignature = joinSignature(_sig);

    return encodedSignature;
  } catch (e) {
    console.log(e);
    throw new Error("Error getting encoded signature");
  }
};

const authSig = JSON.parse(process.env.SERVER_AUTH_SIG) as any;

const unSignedTxBuffer = (tx) => {
  const { arrayify, keccak256, serializeTransaction } = ethers.utils;
  // convert {0: 86, 1: 198, ..., 31: 162} to [86, 198, ..., 162]
  // return Object.values(arrayify(keccak256(arrayify(serializeTransaction(tx)))));

  return arrayify(keccak256(arrayify(serializeTransaction(tx))));
};

const ENV: string = "mainnet"; // mumbai, mainnet
let ENV_LIT_NETWORK: string = "localhost"; // serrano, localhost, custom

let PKP_PUBLIC_KEY;

let LOCAL_PKP =
  "0x04371bce26b7d9e94f8ba542199172c8e351a6434002bc74e9cb188ab4d6b119ab1dddfd532e1b260efbc251484e15fda15bd30046b037f19889cc99a886ee56f0";
let SERRANO_PKP =
  "0x0499713b16636af841756431b73bd1a88d1837d110ae981ff3711c9239af95d8849b149fb6f2d46697b4d75c62ae4e63f8b8b941d4ca0a06a02b8b47d12f42b61d";
let ENV_RPC;
let ENV_WMATIC_ADDRESS;
let ENV_WUSD_ADDRESS;
let ENV_SWAP_ROUTER_ADDRESS = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";
let ENV_CONTROLLER_ADDRESS = "0x8A82174Ff0dCAE1cD02474f10143ee0d834c2b26";

let ENV_CHAIN_ID;
let ENV_RECIPIENT_ADDRESS;
PKP_PUBLIC_KEY =
  ENV_LIT_NETWORK === "localhost" || ENV_LIT_NETWORK === "custom"
    ? LOCAL_PKP
    : SERRANO_PKP;

if (ENV === "mumbai") {
  // https://mumbai.polygonscan.com/address/0xfcf8a959e2d6ea185789c89e66c77319ab10e302
  // https://mumbai.polygonscan.com/tokenapprovalchecker?search=0xfcf8a959e2d6ea185789c89e66c77319ab10e302
  ENV_RPC = "https://matic-mumbai.chainstacklabs.com";
  ENV_WMATIC_ADDRESS = "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889";
  ENV_WUSD_ADDRESS = "0x90A49b254a017C4Fc2E22a732097d6d17752d855";
  ENV_RECIPIENT_ADDRESS = "0xfcF8A959e2D6eA185789C89E66C77319AB10e302";
  ENV_CHAIN_ID = 80001;
} else if (ENV === "mainnet") {
  // https://polygonscan.com/address/0xfcf8a959e2d6ea185789c89e66c77319ab10e302
  // https://polygonscan.com/tokenapprovalchecker?search=0xfcf8a959e2d6ea185789c89e66c77319ab10e302
  ENV_RPC = "https://polygon.llamarpc.com";
  ENV_WMATIC_ADDRESS = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
  ENV_WUSD_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
  ENV_RECIPIENT_ADDRESS = "0xfcF8A959e2D6eA185789C89E66C77319AB10e302";
  ENV_CHAIN_ID = 137;
} else {
  throw new Error("Invalid ENV");
}

// convert big number object to ethers big number
const convertBigNumber = (bigNumberObj) => {
  const { type, hex } = bigNumberObj;
  if (type === "BigNumber") {
    return ethers.BigNumber.from(hex);
  }
  return bigNumberObj;
};

// Note:
// adding a new function in rust
// 1. declare your javascript function in 02_litActionsSDK.js
// 2. bind the function in src/functions/bindings.rs (see op_get_gas_price)
// 3. bind it to js_runtime in src/functions/js_runtime.rs (see op_get_gas_price)
(async () => {
  let client;

  if (ENV_LIT_NETWORK === "localhost") {
    client = new LitJsSdk.LitNodeClient({
      litNetwork: ENV_LIT_NETWORK,
      debug: false,
    });
  } else {
    client = new LitJsSdk.LitNodeClient({
      litNetwork: ENV_LIT_NETWORK,
      bootstrapUrls: [
        "http://localhost:7470",
        "http://localhost:7471",
        "http://localhost:7472",
      ],
      debug: true,
    });
  }

  await client.connect();

  // ------------------------------
  //          Lit Action
  // ------------------------------
  async function runLitAction(callFunction: string, args: any = null) {
    return await client.executeJs({
      authSig,
      code,
      jsParams: {
        CALL_FUNCTION: callFunction,
        ...(args !== null ? args : {}),
        ...{
          RPC_URL: ENV_RPC,
          TOKEN_IN: {
            chainId: ENV_CHAIN_ID,
            decimals: 18,
            address: ENV_WMATIC_ADDRESS,
            symbol: "WMATIC",
            name: "Wrapped Matic",
          },
          TOKEN_OUT: {
            chainId: ENV_CHAIN_ID,
            decimals: 6,
            address: ENV_WUSD_ADDRESS,
            symbol: "USDC",
            name: "USD//C",
          },
          PKP_PUBLIC_KEY,
          SWAP_ROUTER_ADDRESS: ENV_SWAP_ROUTER_ADDRESS,
          AMOUNT_TO_SELL: 0.5,
          DEBUG: true,
        },
      },
    });
  }

  const sendTest = async (litActionRes) => {
    const unsignedTx = (litActionRes.response as any).unsignedTx;

    unsignedTx.gasPrice = convertBigNumber(unsignedTx.gasPrice);

    console.log("unsignedTx:", unsignedTx);

    const res = await runLitAction("SIGN_TX", {
      sigName: "test",
      unsignedTxBuffer: Object.values(
        (litActionRes.response as any).unsignedTxBuffer
      ),
    });

    console.log("res:", res);

    const encodedSig = getEncodedSignature(res.signatures["test"]);

    console.log("encodedSig:", encodedSig);

    const tx = await runLitAction("SEND_TX", {
      unsignedTx,
      encodedSig,
    });

    console.log("tx:", tx);
  };

  const clientSideGetSerialized = async () => {
    const address = await ECDSAAddresses({
      publicKey: PKP_PUBLIC_KEY,
    });

    console.log("[clientSideGetSerialized] address:", address);

    const provider = new ethers.providers.JsonRpcProvider(ENV_RPC);

    const nonce = await provider.getTransactionCount(ENV_RECIPIENT_ADDRESS);
    const gasPrice = await provider.getGasPrice();

    const chainId = (await provider.getNetwork()).chainId;

    console.log("nonce:", nonce);
    console.log("gasPrice:", gasPrice);
    console.log("chainId:", chainId);

    let swapParams = {
      tokenIn: ENV_WMATIC_ADDRESS,
      tokenOut: ENV_WUSD_ADDRESS,
      fee: 3000,
      recipient: ENV_RECIPIENT_ADDRESS,
      // deadline: (optional)
      amountIn: ethers.utils.parseUnits("0.1", 18),
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0,
    };

    // get "swap exact input single" data from contract
    const swapData = new Interface([
      "function exactInputSingle(tuple(address,address,uint24,address,uint256,uint256,uint160)) external payable returns (uint256)",
    ]).encodeFunctionData("exactInputSingle", [
      [
        swapParams.tokenIn,
        swapParams.tokenOut,
        swapParams.fee,
        swapParams.recipient,
        swapParams.amountIn,
        swapParams.amountOutMinimum,
        swapParams.sqrtPriceLimitX96,
      ],
    ]);

    // create the unsigned tx
    const unsignedTx = {
      // to: ENV_RECIPIENT_ADDRESS,
      to: ENV_SWAP_ROUTER_ADDRESS,
      nonce,
      value: 0,
      gasPrice,
      gasLimit: 150000,
      chainId,
      data: swapData,
    };

    const unsignedTxBuffer = unSignedTxBuffer(unsignedTx);

    console.log("unsignedTxBuffer:", unsignedTxBuffer);

    const res = await client.executeJs({
      code: `
  (async () => {
    const sigShare = await LitActions.signEcdsa({ toSign, publicKey, sigName });
  })();
      `,
      authSig,
      jsParams: {
        toSign: unsignedTxBuffer,
        publicKey: PKP_PUBLIC_KEY,
        sigName: "test",
      },
    });

    const encodedSig = getEncodedSignature(res.signatures["test"]);

    console.log("encodedSig:", encodedSig);

    const serializedTx = ethers.utils.serializeTransaction(
      unsignedTx,
      encodedSig
    );

    console.log("serializedTx:", serializedTx);

    return { serializedTx, unsignedTx, encodedSig };
  };

  const sendSerializedTx = async (serialized) => {
    const provider = new ethers.providers.JsonRpcProvider(ENV_RPC);

    try {
      const tx = await provider.sendTransaction(serialized);
      console.log("tx:", tx);
      await tx.wait();
      console.log("tx mined:", tx);
    } catch (e) {
      console.log("Failed to send tx:", e);
    }
  };

  const testAndSendTx = async (fnName: string, args = null) => {
    const test = await runLitAction(fnName, args);
    console.log("test:", test);
    const sendTx = await sendTest(test);
    return sendTx;
  };

  const testWithoutSendTx = async (fnName: string, args = null) => {
    const test = await runLitAction(fnName, args);
    console.log("test:", test);
    return test;
  };

  const testSwapWorked = async () => {
    const test = await runLitAction("GET_SWAP_UNSIGNED_TX", {
      swapRouterAddress: ENV_SWAP_ROUTER_ADDRESS,
      swapParams: {
        tokenIn: ENV_WMATIC_ADDRESS,
        tokenOut: ENV_WUSD_ADDRESS,
        fee: 3000,
        recipient: ENV_RECIPIENT_ADDRESS,
        amountIn: ethers.utils.parseUnits("0.1", 18),
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
      },
    });

    await sendTest(test);
  };

  const runAll = async () => {
    const res = await runLitAction("ALL");
    console.log("res: ", res);

    const approveTxSig = res.signatures["approve-tx-sig"];
    const swapTxSig = res.signatures["swap-tx-sig"];

    console.log("approveTxSig:", approveTxSig);
    console.log("swapTxSig:", swapTxSig);

    // if it hasn't been approved yet, we need to approve it first
    if (approveTxSig) {
      console.log("approveTxSig:", approveTxSig);
      const approveEncodedSig = getEncodedSignature(approveTxSig);
      console.log("approveEncodedSig:", approveEncodedSig);

      const sendApproveTx = await runLitAction("SEND_TX", {
        unsignedTx: (res.response as any).unsignedApproveTx,
        encodedSig: approveEncodedSig,
      });
      console.log("sendApproveTx:", sendApproveTx);
    }

    console.log("swapTxSig:", swapTxSig);

    const swapEncodedSig = getEncodedSignature(swapTxSig);
    console.log("swapEncodedSig:", swapEncodedSig);

    // -- swap locally
    const unsignedTx = (res.response as any).unsignedSwapTx;

    unsignedTx.gasPrice = convertBigNumber(unsignedTx.gasPrice);

    const serializedTx = ethers.utils.serializeTransaction(
      unsignedTx,
      swapEncodedSig
    );

    // console.log("serializedTx:", serializedTx);
    const sendTx = await sendSerializedTx(serializedTx);
    console.log("sendTx:", sendTx);

    return;
    // -- Using lit action to swap
    const sendSwapTx = await runLitAction("SEND_TX", {
      unsignedTx: (res.response as any).unsignedSwapTx,
      encodedSig: swapEncodedSig,
    });

    console.log("sendSwapTx:", sendSwapTx);
  };

  const testCombineShares = async () => {
    const test = await runLitAction("COMBINE_SHARES_TEST");
    console.log("test:", test);
  };

  const testExecuteSwap = async () => {
    const tx = await executeSwap({
      jsParams: {
        ipfsId: "QmRwN9GKHvCn4Vk7biqtr6adjXMs7PzzYPCzNCRjPFiDjm",
        authSig,
        rpcUrl: ENV_RPC,
        tokenIn: {
          chainId: ENV_CHAIN_ID,
          decimals: 18,
          address: ENV_WMATIC_ADDRESS,
          symbol: "WMATIC",
          name: "Wrapped Matic",
        },
        tokenOut: {
          chainId: ENV_CHAIN_ID,
          decimals: 6,
          address: ENV_WUSD_ADDRESS,
          symbol: "USDC",
          name: "USD//C",
        },
        pkp: {
          publicKey: PKP_PUBLIC_KEY,
        },
        amountToSell: "0.1",
        conditions: {
          maxGasPrice: {
            unit: "gwei",
            value: 500,
          },
          minExceedPercentage: 1,
          unless: {
            spikePercentage: 15,
            adjustGasPrice: 500,
          },
        },
      },
    });

    console.log("tx:", tx);
  };

  const testLocalSwap = async () => {
    console.log("Test local swap");

    const jsParams = {
      RPC_URL: ENV_RPC,
      TOKEN_IN: {
        chainId: ENV_CHAIN_ID,
        decimals: 18,
        address: ENV_WMATIC_ADDRESS,
        symbol: "WMATIC",
        name: "Wrapped Matic",
      },
      TOKEN_OUT: {
        chainId: ENV_CHAIN_ID,
        decimals: 6,
        address: ENV_WUSD_ADDRESS,
        symbol: "USDC",
        name: "USD//C",
      },
      PKP_PUBLIC_KEY,
      SWAP_ROUTER_ADDRESS: ENV_SWAP_ROUTER_ADDRESS,
      AMOUNT_TO_SELL: 0.5,
      DEBUG: true,
    };

    const PKP_ADDRESS = computeAddress(PKP_PUBLIC_KEY);

    const provider = new ethers.providers.JsonRpcProvider(jsParams.RPC_URL);

    const tokenInContract = new ethers.Contract(
      jsParams.TOKEN_IN.address,
      ["function allowance(address,address) view returns (uint256)"],
      provider
    );

    const tokenInAllowance = await tokenInContract.allowance(
      PKP_ADDRESS,
      jsParams.SWAP_ROUTER_ADDRESS
    );

    const allowance = tokenInAllowance.toString();

    console.log("Allowance:", allowance);

    if (allowance <= 0) {
      console.log("Approving token");
      return;
    }

    const swapData = new ethers.utils.Interface([
      "function exactInputSingle(tuple(address,address,uint24,address,uint256,uint256,uint160)) external payable returns (uint256)",
    ]).encodeFunctionData("exactInputSingle", [
      [
        jsParams.TOKEN_IN.address,
        jsParams.TOKEN_OUT.address,
        3000,
        PKP_ADDRESS,
        ethers.utils.parseUnits("0.1", 18),
        0,
        0,
      ],
    ]);
    const nonce = await provider.getTransactionCount(PKP_ADDRESS);
    const gasPrice = await provider.getGasPrice();
    const { chainId } = await provider.getNetwork();

    const gasLimit = 150000;

    const unsignedTx = {
      to: jsParams.SWAP_ROUTER_ADDRESS,
      nonce,
      value: 0,
      gasPrice,
      gasLimit,
      chainId,
      data: swapData,
    };

    const unsignedTxBuffer = unSignedTxBuffer(unsignedTx);

    console.log("unsignedTxBuffer:", unsignedTxBuffer);

    const res = await client.executeJs({
      authSig,
      code: `
  (async () => {
    const sigShare = await LitActions.signEcdsa({ toSign, publicKey, sigName });
  })();
      `,
      jsParams: {
        toSign: unsignedTxBuffer,
        sigName: "test-sign-tx",
        publicKey: PKP_PUBLIC_KEY,
      },
    });

    const encodedSig = getEncodedSignature(res.signatures["test-sign-tx"]);

    console.log("encodedSig:", encodedSig);

    const serializedTx = ethers.utils.serializeTransaction(
      unsignedTx,
      encodedSig
    );

    console.log("serializedTx:", serializedTx);

    sendSerializedTx(serializedTx);
  };

  // testWithoutSendTx("TEST_SIGN");
  // testWithoutSendTx("GET_ALLOWANCE");
  // testAndSendTx("TEST_GET_UNSIGNED_TX");
  // await testAndSendTx("GET_APPROVE_UNSIGNED_TX");
  // await testAndSendTx("GET_SWAP_UNSIGNED_TX");
  // testAndSendTx("GET_REVOKE_APPROVE_UNSIGNED_TX");
  // testWithoutSendTx("SIGN_TX", {
  //   sigName: "test-sign-tx",
  //   unsignedTxBuffer: [0, 0, 0, 0, 0],
  // });

  // const { serializedTx } = await clientSideGetSerialized();
  // console.log("serializedTx:", serializedTx);
  // await sendSerializedTx(serializedTx);
  // testWithoutSendTx("SEND_SERIALIZED_TX", {
  //   serializedTx,
  // });

  // const { unsignedTx, encodedSig } =
  //   await clientSideGetSerialized();
  // testWithoutSendTx("SEND_TX", {
  //   unsignedTx,
  //   encodedSig,
  // });
  // selfSendTest();

  // testSwapWorked();

  // runAll();
  // testCombineShares();
  testLocalSwap();
})();
