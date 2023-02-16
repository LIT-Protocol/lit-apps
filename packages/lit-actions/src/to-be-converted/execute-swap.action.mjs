import { ethers } from "ethers";
import { Interface } from "@ethersproject/abi";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { computeAddress } from "ethers/lib/utils.js";
import { arrayify, joinSignature, keccak256 } from "ethers/lib/utils.js";
import { serialize } from "@ethersproject/transactions";
import { Contract } from "@ethersproject/contracts";
import { MaxUint256 } from "@ethersproject/constants";

// -----------------------------------------------
//          Typescript Type Definitions
// -----------------------------------------------

/**
 * @typedef { object } PKPInfo
 * @property { string } publicKey
 *
 * eg. { publicKey: "0x..."}
 */

/**
 * @typedef { object } SwapToken
 * @property { number } chainId
 * @property { number } decimals
 * @property { string } address
 * @property { string } symbol
 * @property { string } name
 * eg. { chainId: 1, decimals: 18, address: "0x...", symbol: "USDT", name: "Tether USD" }
 */

/**
 * @typedef { object } AuthSig
 * @property { string } sig
 * @property { string } derivedVia
 * @property { string } signedMessage
 * @property { string } address
 *
 * eg. { sig: "0x...", derivedVia: "ethers", signedMessage: "0x...", address: "0x..." }
 */

/**
 * @typedef { object } SwapJSParams
 * @property { "matic" | "ethereum" } chain
 * @property { SwapToken } tokenIn
 * @property { SwapToken } tokenOut
 * @property { PKPInfo } pkp
 * @property { AuthSig } authSig
 * @property { string } amountToSell
 * @property { string } rpcUrl
 *
 * eg. { chain: "matic", tokenIn: { ... }, tokenOut: { ... }, pkp: { ... }, authSig: { ... }, amountToSell: "100", rpcUrl: "https://rpc-mainnet.maticvigil.com" }
 */

// ------------------------------------

export const tokenSwapList = {
  WMATIC: {
    chainId: 137,
    decimals: 18,
    address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    symbol: "WMATIC",
    name: "Wrapped Matic",
  },
  USDC: {
    chainId: 137,
    decimals: 6,
    address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    symbol: "USDC",
    name: "USD//C",
  },
};

export const swapStubs = {
  // example stub data, can be used or not
  wmatic: {
    chainId: 137,
    decimals: 18,
    address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    symbol: "WMATIC",
    name: "Wrapped Matic",
  },

  usdc: {
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

// ------------------------------------------------------------------------
//          Let's pretend this function is hosting on Lit Action
// ------------------------------------------------------------------------
export const executeSwap = async ({ jsParams }) => {
  // --------------------------------------
  //          Checking JS Params
  // --------------------------------------

  const { tokenIn, tokenOut, pkp, authSig, amountToSell, rpcUrl, conditions } =
    jsParams;

  // if pkp.public key doesn't start with 0x, add it
  if (!pkp.publicKey.startsWith("0x")) {
    pkp.publicKey = "0x" + pkp.publicKey;
  }

  const pkpAddress = computeAddress(pkp.publicKey);

  // ------------------------------------------------------------------------------
  //          ! NOTE ! Let's pretend these functions works on Lit Action
  // ------------------------------------------------------------------------------
  const LitActions = {
    call: async (executeJsProps) => {
      const client = new LitNodeClient({
        litNetwork: "serrano",
        debug: false,
      });
      await client.connect();

      const sig = await client.executeJs(executeJsProps);

      return sig;
    },
  };

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

  const Lit = {
    Actions: {
      getGasPrice: () => provider.getGasPrice(),
      getTransactionCount: (walletAddress) =>
        provider.getTransactionCount(walletAddress),
      getNetwork: () => provider.getNetwork(),
      sendTransaction: (tx) => provider.sendTransaction(tx),
    },
  };

  class Code {
    static signEcdsa = `(async() => {
      const sigShare = await LitActions.signEcdsa({ toSign, publicKey, sigName });
    })();`;
  }

  // ------------------------------------
  //          Helper Functions
  // ------------------------------------
  /**
   * This will check if the tx has been approved by checking if the allowance is greater than 0
   * @param { string } tokenInAddress
   * @param { string } pkpAddress
   * @param { string } swapRouterAddress
   *
   * @returns { BigNumber } allowance
   */
  const getAllowance = async ({
    tokenInAddress,
    pkpAddress,
    swapRouterAddress,
  }) => {
    try {
      const tokenInContract = new Contract(
        tokenInAddress,
        ["function allowance(address,address) view returns (uint256)"],
        provider
      );
      const tokenInAllowance = await tokenInContract.allowance(
        pkpAddress,
        swapRouterAddress
      );

      return tokenInAllowance;
    } catch (e) {
      console.log(e);
      throw new Error("Error getting allowance");
    }
  };

  /**
   * Convert a tx to a message
   * @param { any } tx
   * @returns { string }
   */
  const txToMsg = (tx) => arrayify(keccak256(arrayify(serialize(tx))));

  /**
   * Get basic tx info
   */
  const getBasicTxInfo = async ({ walletAddress }) => {
    try {
      const nonce = await Lit.Actions.getTransactionCount(walletAddress);
      const gasPrice = await Lit.Actions.getGasPrice();
      const { chainId } = await Lit.Actions.getNetwork();
      return { nonce, gasPrice, chainId };
    } catch (e) {
      console.log(e);
      throw new Error("Error getting basic tx info");
    }
  };

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

  /**
   * Sending tx
   * @param param0
   */
  const sendTx = async ({ originalUnsignedTx, signedTxSignature }) => {
    try {
      const serialized = serialize(originalUnsignedTx, signedTxSignature);

      return await Lit.Actions.sendTransaction(serialized);
    } catch (e) {
      console.log(e);
      throw new Error("Error sending tx");
    }
  };

  /**
   * This will approve the swap
   */
  const approveSwap = async ({
    swapRouterAddress,
    maxAmountToApprove = MaxUint256,
    tokenInAddress,
  }) => {
    console.log("Approving swap...");

    // getting approve data from swap router address
    const approveData = new Interface([
      "function approve(address,uint256) returns (bool)",
    ]).encodeFunctionData("approve", [swapRouterAddress, maxAmountToApprove]);

    // get the basic tx info such as nonce, gasPrice, chainId
    const { nonce, gasPrice, chainId } = await getBasicTxInfo({
      walletAddress: pkpAddress,
    });

    // create the unsigned tx
    const unsignedTx = {
      to: tokenInAddress,
      nonce,
      value: 0,
      gasPrice,
      gasLimit: 150000,
      chainId,
      data: approveData,
    };

    const message = txToMsg(unsignedTx);

    // sign the tx (with lit action)
    const sigName = "approve-tx-sig";
    const res = await LitActions.call({
      code: Code.signEcdsa,
      authSig,
      jsParams: {
        toSign: message,
        publicKey: pkp.publicKey,
        sigName,
      },
    });

    // get encoded signature
    const encodedSignature = getEncodedSignature(res.signatures[sigName]);

    const sentTx = await sendTx({
      originalUnsignedTx: unsignedTx,
      signedTxSignature: encodedSignature,
    });

    await sentTx.wait();

    return sentTx;
  };

  /**
   * This will swap the token
   */
  const swap = async ({ swapRouterAddress, swapParams }) => {
    console.log("[Swap] Swapping...");

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

    console.log(`[Swap] Getting basic tx info...`);
    // get the basic tx info such as nonce, gasPrice, chainId
    const { nonce, gasPrice, chainId } = await getBasicTxInfo({
      walletAddress: pkpAddress,
    });

    // get gas price in gwei
    const _gasPrice = ethers.utils.formatUnits(
      gasPrice,
      conditions.maxGasPrice.unit
    );

    console.log(
      `[Swap] Gas Price(${conditions.maxGasPrice.unit}): ${_gasPrice}`
    );

    if (_gasPrice > conditions.maxGasPrice.value) {
      console.log(`[Swap] Gas price is too high, aborting!`);

      console.log(`[Swap] Max gas price: ${conditions.maxGasPrice.value}`);
      console.log(
        `[Swap] That's ${_gasPrice - conditions.maxGasPrice.value} too high!`
      );
      return;
    } else {
      console.log(`[Swap] Gas price is ok, proceeding...`);
    }

    // create the unsigned tx
    const unsignedTx = {
      to: swapRouterAddress,
      nonce,
      value: 0,
      gasPrice,
      gasLimit: 150000,
      chainId,
      data: swapData,
    };

    const message = txToMsg(unsignedTx);

    console.log(`[Swap] Signing with Lit Action...`);
    // sign the tx (with lit action)
    const sigName = "swap-tx-sig";
    const res = await LitActions.call({
      code: Code.signEcdsa,
      authSig,
      jsParams: {
        toSign: message,
        publicKey: pkp.publicKey,
        sigName,
      },
    });

    // get encoded signature
    const encodedSignature = getEncodedSignature(res.signatures[sigName]);

    console.log(`[Swap] Sending tx...`);
    const sentTx = await sendTx({
      originalUnsignedTx: unsignedTx,
      signedTxSignature: encodedSignature,
    });

    console.log(`[Swap] Waiting for tx to be mined...`);
    await sentTx.wait();

    return sentTx;
  };

  // --------------------------------------------------------------------------
  //          This is where the actual logic being run in Lit Action
  // --------------------------------------------------------------------------

  // get the allowance of the contract to spend the token
  const allowance = await getAllowance({
    tokenInAddress: tokenIn.address,
    pkpAddress,
    swapRouterAddress: SWAP_ROUTER_ADDRESS,
  });

  console.log("[ExecuteSwap] 1. allowance:", allowance.toString());

  // if it's NOT approved, then we need to approve the swap
  if (allowance <= 0) {
    console.log("[ExecuteSwap] 2. NOT approved! approving now...");
    await approveSwap({
      swapRouterAddress: SWAP_ROUTER_ADDRESS,
      tokenInAddress: tokenIn.address,
    });
  }

  console.log("[ExecuteSwap] 3. Approved! swapping now...");
  return await swap({
    swapRouterAddress: SWAP_ROUTER_ADDRESS,
    swapParams: {
      tokenIn: tokenIn.address,
      tokenOut: tokenOut.address,
      fee: 3000,
      recipient: pkpAddress,
      // deadline: (optional)
      amountIn: ethers.utils.parseUnits(amountToSell, tokenIn.decimals),
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0,
    },
  });
};
