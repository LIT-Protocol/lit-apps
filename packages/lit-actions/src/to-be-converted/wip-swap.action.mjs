// -----------------------------------------
//          JS Params Validations
// -----------------------------------------

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

const PKP_ADDRESS = ethers.utils.computeAddress(PKP_PUBLIC_KEY);

if (errors.length > 0) {
  Lit.Actions.setResponse({
    response: JSON.stringify({
      errors,
    }),
  });
}

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
    const gasPrice = (await provider.getGasPrice()).toString();
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

// -------------------------
//          Start
// -------------------------
(async () => {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

  const allowance = await getAllowance({
    tokenInAddress: TOKEN_IN.address,
    pkpAddress: PKP_ADDRESS,
    swapRouterAddress: SWAP_ROUTER_ADDRESS,
    provider,
  });

  console.log("[ExecuteSwap] 1. allowance:", allowance.toString());

  console.log("[ExecuteSwap] 3. Approved! swapping now...");
//   await swap({
//     swapRouterAddress: SWAP_ROUTER_ADDRESS,
//     swapParams: {
//         tokenIn: TOKEN_IN.address,
//         tokenOut: TOKEN_OUT.address,
//         fee: 3000,
//         recipient: WALLET_ADDRESS,
//         amoutIn: 
//     }
//   })

  Lit.Actions.setResponse({
    response: JSON.stringify({
      allowance: allowance.toString(),
    }),
  });
})();
