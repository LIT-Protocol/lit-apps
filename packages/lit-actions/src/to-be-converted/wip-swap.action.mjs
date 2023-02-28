// - Separate functionalities so it stays below
// the 6000ms rate limit
// - or if you want to combine them, you can use 
// the Rate Limit NFT to increase the limit to 12000ms
// Features:
// - JS Params validation
// - Get allowance
// - Get unsigned approve tx

// --------------------------------------
//          Validate Js Params
// --------------------------------------

const errors = [];

try {
  RPC_URL;
} catch (e) {
  errors.push(e.message);
}
try {
  WALLET_ADDRESS;
} catch (e) {
  errors.push(e.message);
}
try {
  TOKEN_IN;
} catch (e) {
  errors.push(e.message);
}
try {
  TOKEN_OUT;
} catch (e) {
  errors.push(e.message);
}
try {
  PKP_PUBLIC_KEY;
} catch (e) {
  errors.push(e.message);
}
try {
  SWAP_ROUTER_ADDRESS;
} catch (e) {
  errors.push(e.message);
}
try {
  SIGN_IPFS;
} catch (e) {
  errors.push(e.message);
}
try {
  DEBUG;
} catch (e) {
  errors.push(e.message);
}
try {
  CALL_FUNCTION;
} catch (e) {
  errors.push(e.message);
}

const PKP_ADDRESS = ethers.utils.computeAddress(PKP_PUBLIC_KEY);

if (errors.length > 0) {
  Lit.Actions.setResponse({
    response: JSON.stringify({
      errors,
    }),
  });
}

/**
 * log to console if DEBUG is true
 */
const log = (...args) => {
  if (DEBUG) {
    console.log(...args);
  }
};

/**
 * Respond to the action
 */
function respond(data) {
  Lit.Actions.setResponse({
    response: JSON.stringify(data),
  });

  return data;
}

/**
 * Get basic tx info
 */
const getBasicTxInfo = async ({ walletAddress, provider }) => {
  try {
    const nonce = await provider.getTransactionCount(walletAddress);
    const gasPrice = ethers.utils.parseUnits(
      (await provider.getGasPrice()).toString(),
      "gwei"
    );

    const chainId = (await provider.getNetwork()).chainId;
    return { nonce, gasPrice, chainId };
  } catch (e) {
    return respond({ error: "Error getting basic tx info" });
  }
};

/**
 * This will check if the tx has been approved by checking if the allowance is greater than 0
 * @param { string } tokenInAddress
 * @param { string } pkpAddress
 * @param { string } swapRouterAddress
 * @param { ethers.providers.JsonRpcProvider } provider
 *
 * @returns { BigNumber } allowance
 */
const getAllowance = async ({
  tokenInAddress,
  pkpAddress,
  swapRouterAddress,
  provider,
}) => {
  // check if any of the params are undefined
  if (!tokenInAddress || !pkpAddress || !swapRouterAddress || !provider) {
    // show which params are undefined
    const missingParams = [];
    if (!tokenInAddress) missingParams.push("tokenInAddress");
    if (!pkpAddress) missingParams.push("pkpAddress");
    if (!swapRouterAddress) missingParams.push("swapRouterAddress");
    if (!provider) missingParams.push("provider");
    return respond({ error: `Missing params: ${missingParams.join(", ")}` });
  }

  try {
    const tokenInContract = new ethers.Contract(
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
    return respond({ error: "Error getting allowance" });
  }
};

/**
 * Convert a tx to a message
 * @param { any } tx
 * @returns { string }
 */
const unSignedTxToMessage = (tx) => {
  const { arrayify, keccak256, serializeTransaction } = ethers.utils;
  // convert {0: 86, 1: 198, ..., 31: 162} to [86, 198, ..., 162]
  return Object.values(arrayify(keccak256(arrayify(serializeTransaction(tx)))));
};

/**
 * This will return the unsigned approve tx
 * @param { string } swapRouterAddress
 * @param { string } tokenInAddress
 * @param { BigNumber } maxAmountToApprove
 * @param { ethers.providers.JsonRpcProvider } provider
 *
 * @returns { Promise } tx
 */
const getApproveUnsignedTx = async ({
  swapRouterAddress,
  tokenInAddress,
  maxAmountToApprove = ethers.constants.MaxUint256,
  provider,
}) => {
  // check if any of the params are undefined
  if (!swapRouterAddress || !tokenInAddress || !provider) {
    // show which params are undefined
    const missingParams = [];
    if (!swapRouterAddress) missingParams.push("swapRouterAddress");
    if (!tokenInAddress) missingParams.push("tokenInAddress");
    if (!provider) missingParams.push("provider");
    return respond({ error: `Missing params: ${missingParams.join(", ")}` });
  }

  const approveData = new ethers.utils.Interface([
    "function approve(address,uint256) returns (bool)",
  ]).encodeFunctionData("approve", [swapRouterAddress, maxAmountToApprove]);
  log(`[approveSwap] approveData: ${approveData}`);

  // get the basic tx info such as nonce, gasPrice, chainId
  const { nonce, gasPrice, chainId } = await getBasicTxInfo({
    walletAddress: PKP_ADDRESS,
    provider,
  });
  log(`[approveSwap] nonce: ${nonce}`);
  log(`[approveSwap] gasPrice: ${gasPrice}`);
  log(`[approveSwap] chainId: ${chainId}`);

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
  log(`[approveSwap] unsignedTx: ${JSON.stringify(unsignedTx)}`);

  const message = unSignedTxToMessage(unsignedTx);
  log(`[approveSwap] message: ${message}`);

  return message;

  // const sigName = "approve-tx-sig";

  // const res = await Lit.Actions.call({
  //   ipfsId: SIGN_IPFS,
  //   params: {
  //     toSign: [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100],
  //     publicKey: PKP_PUBLIC_KEY,
  //     sigName,
  //   },
  // });

  // respond(res);

  // log(`[approveSwap] res: ${res}`);
};

// -------------------------
//          Start
// -------------------------
// Available commands:
// - GET_ALLOWANCE
// - GET_APPROVE_UNSIGNED_TX
// - APPROVE_SWAP
// - EXECUTE_SWAP
(async () => {
  if (CALL_FUNCTION === "GET_ALLOWANCE") {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

    const allowance = await getAllowance({
      tokenInAddress: TOKEN_IN.address,
      pkpAddress: PKP_ADDRESS,
      swapRouterAddress: SWAP_ROUTER_ADDRESS,
      provider,
    });

    respond({ allowance: allowance.toString() });
  }

  if (CALL_FUNCTION === "GET_APPROVE_UNSIGNED_TX") {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

    const unsignedTx = await getApproveUnsignedTx({
      swapRouterAddress: SWAP_ROUTER_ADDRESS,
      tokenInAddress: TOKEN_IN.address,
      provider,
    });

    respond({ unsignedTx });
  }

  if (CALL_FUNCTION === "APPROVE_SWAP") {
    const sigName = "approve-tx-sig";

    const res = await Lit.Actions.call({
      ipfsId: SIGN_IPFS,
      params: {
        toSign,
        publicKey: PKP_PUBLIC_KEY,
        sigName,
      },
    });

    respond(res);
  }

  // log("[ExecuteSwap] 1. allowance:", allowance.toString());

  // if (allowance <= 0) {
  //   log("[ExecuteSwap] 2. NOT approved! approving now...");
  //   await approveSwap({
  //     swapRouterAddress: SWAP_ROUTER_ADDRESS,
  //     tokenInAddress: TOKEN_IN.address,
  //     provider,
  //   });
  // }

  // respond({ allowance: allowance.toString() });
})();
