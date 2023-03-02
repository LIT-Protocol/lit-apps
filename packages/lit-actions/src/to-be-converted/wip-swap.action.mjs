/**
 * Lit Action Name: Execute Uniswap Swap
 * Version: 0.0.95
 * Description: This Lit Action allows you to swap tokens using the Uniswap Router (This is a work in progress. Each function is separated so that it could be executed individually. This is to avoid the 30 seconds rate limit(for this demo). A 'ALL' command is also available to run all commands, which will take longer than 30 seconds, and will probably need a rate limit NFT to increae its rate limits.)
 * Author: Anson <anson@litprotocol.com>
 * 
 * Available commands:
 * ---------------------------------------------------------------------
 * COMMAND                          | DESCRIPTION
 * ---------------------------------------------------------------------
 * ALL                              | run all commands
 * TEST_SIGN                        | test signing a message
 * TEST_COMBINE_SHARES              | test combining shares
 * TEST_GET_UNSIGNED_TX             | test signing a message
 * GET_ALLOWANCE                    | get allowance
 * GET_APPROVE_UNSIGNED_TX          | get unsigned tx to approve
 * GET_REVOKE_APPROVE_UNSIGNED_TX   | get unsigned tx to revoke approval
 * GET_SWAP_UNSIGNED_TX             | get unsigned tx to swap
 * SIGN_TX                          | sign tx
 * SEND_TX                          | send tx
 * SEND_SERIALIZE_TX                | send serialized tx
 * ---------------------------------------------------------------------
 * 
 * JS Params:
 * ---------------------------------------------------------------------
 * PARAM                            | DESCRIPTION
 * ---------------------------------------------------------------------
 * RPC_URL                          | RPC URL
 * TOKEN_IN                         | token to swap from
 * TOKEN_OUT                        | token to swap to
 * PKP_PUBLIC_KEY                   | public key of the PKP
 * SWAP_ROUTER_ADDRESS              | address of the swap router
 * DEBUG                            | show logs
 * CALL_FUNCTION                    | function to call
 * AMOUNT_TO_SELL                   | amount to sell
 * ---------------------------------------------------------------------
 * 
 * JS Usage:
 * ---------------------------------------------------------------------
 async function runLitAction(callFunction: string, args: any = null) {
    return await client.executeJs({
      authSig,
      code,
      jsParams: {
        CALL_FUNCTION: callFunction,
        ...(args !== null ? args : {}),
        ...{
          RPC_URL: "https://polygon.llamarpc.com",
          TOKEN_IN: {
            chainId: 137,
            decimals: 18,
            address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
            symbol: "WMATIC",
            name: "Wrapped Matic",
          },
          TOKEN_OUT: {
            chainId: 137,
            decimals: 6,
            address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
            symbol: "USDC",
            name: "USD//C",
          },
          PKP_PUBLIC_KEY,
          SWAP_ROUTER_ADDRESS: "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45",
          DEBUG: true,
          AMOUNT_TO_SELL: 0.1,
        },
      },
    });
  }
  *
  * Example of calling a particular function:
  * ---------------------------------------------------------------------
  // Calling without arguments
  const res = await runLitAction("GET_ALLOWANCE");

  // Calling with arguments
  const sendApproveTx = await runLitAction("SEND_TX", {
    unsignedTx: (res.response as any).unsignedApproveTx,
    encodedSig: approveEncodedSig,
  });
 */

/**
 * Respond to the action
 */
function respond(data) {
  Lit.Actions.setResponse({
    response: JSON.stringify(data),
  });
}

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
  DEBUG;
} catch (e) {
  errors.push(e.message);
}
try {
  CALL_FUNCTION;
} catch (e) {
  errors.push(e.message);
}
try {
  AMOUNT_TO_SELL;
} catch (e) {
  errors.push(e.message);
}

if (errors.length > 0) respond({ errors });

const PKP_ADDRESS = ethers.utils.computeAddress(PKP_PUBLIC_KEY);

/**
 * log to console if DEBUG is true
 */
const log = (...args) => {
  if (DEBUG) console.log(...args);
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
 * Get basic tx info
 */
const getBasicTxInfo = async ({ walletAddress, provider }) => {
  try {
    const nonce = await provider.getTransactionCount(walletAddress);

    const gasPrice = await provider.getGasPrice();

    const chainId = (await provider.getNetwork()).chainId;

    const gasLimit = 150000;

    return { nonce, gasPrice, chainId, gasLimit };
  } catch (e) {
    return respond({ error: "Error getting basic tx info" });
  }
};

/**
 * Convert a tx to a message
 * @param { any } tx
 * @returns { string }
 */
const unSignedTxBuffer = (tx) => {
  const { arrayify, keccak256, serializeTransaction } = ethers.utils;
  // convert {0: 86, 1: 198, ..., 31: 162} to [86, 198, ..., 162]
  // return Object.values(arrayify(keccak256(arrayify(serializeTransaction(tx)))));

  return arrayify(keccak256(arrayify(serializeTransaction(tx))));
};

/**
 * This will check if the tx has been approved by checking if the allowance is greater than 0
 * @jsParam { string } tokenInAddress
 * @jsParam { string } pkpAddress
 * @jsParam { string } swapRouterAddress
 *
 * @returns { BigNumber } allowance
 */
const getAllowance = async () => {
  log("[GET_ALLOWANCE]");
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

  const tokenInAddress = TOKEN_IN.address;
  const pkpAddress = PKP_ADDRESS;
  const swapRouterAddress = SWAP_ROUTER_ADDRESS;

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

    const allowance = tokenInAllowance.toString();
    log("[GET_ALLOWANCE] allowance", allowance);

    return allowance;
  } catch (e) {
    return respond({ error: "Error getting allowance" });
  }
};
/**
 * @description This is a sample function that shows how to sign a
 * transaction using the Lit library.
 *
 * @returns {Promise<string>} A promise that resolves to a success message
 * if the transaction is signed successfully.
 */
const signTest = async () => {
  log("[TEST_SIGN]");
  await Lit.Actions.signEcdsa({
    toSign: [1, 2, 3],
    publicKey: PKP_PUBLIC_KEY,
    sigName: "test",
  });
  return "GOOD - TEST TX SIGNED";
};

/**
 * getTestUnsignedTx
 * @description Returns a test unsigned transaction
 * @returns {Object} unsignedTx and unsignedTxBuffer
 */
const getTestUnsignedTx = async () => {
  log("[GET_TEST_UNSIGNED_TX]");
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

  const { nonce, gasPrice, chainId, gasLimit } = await getBasicTxInfo({
    walletAddress: PKP_ADDRESS,
    provider,
  });
  log("[GET_TEST_UNSIGNED_TX] nonce", nonce);
  log("[GET_TEST_UNSIGNED_TX] gasPrice", gasPrice);
  log("[GET_TEST_UNSIGNED_TX] chainId", chainId);
  log("[GET_TEST_UNSIGNED_TX] gasLimit", gasLimit);

  const unsignedTx = {
    to: TOKEN_IN.address,
    value: 0,
    chainId,
    nonce,
    gasLimit,
    gasPrice,
  };
  log("[GET_TEST_UNSIGNED_TX] unsignedTx", unsignedTx);

  const unsignedTxBuffer = unSignedTxBuffer(unsignedTx);
  log("[GET_TEST_UNSIGNED_TX] unsignedTxBuffer", unsignedTxBuffer);

  return { unsignedTx, unsignedTxBuffer };
};

/**
 * This will return the unsigned approve tx
 * @jsParam { string } swapRouterAddress
 * @jsParam { string } tokenInAddress
 * @jsParam { BigNumber } maxAmountToApprove
 *
 * @returns { Promise } tx
 */
const getApproveUnsignedTx = async () => {
  log("[GET_APPROVE_UNSIGNED_TX]");

  // -- JS PARAMS
  const swapRouterAddress = SWAP_ROUTER_ADDRESS;
  const tokenInAddress = TOKEN_IN.address;
  const maxAmountToApprove = ethers.constants.MaxUint256;

  // check if any of the params are undefined
  if (!swapRouterAddress || !tokenInAddress) {
    // show which params are undefined
    const missingParams = [];
    if (!swapRouterAddress) missingParams.push("swapRouterAddress");
    if (!tokenInAddress) missingParams.push("tokenInAddress");
    return respond({ error: `Missing params: ${missingParams.join(", ")}` });
  }

  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

  const approveData = new ethers.utils.Interface([
    "function approve(address,uint256) returns (bool)",
  ]).encodeFunctionData("approve", [swapRouterAddress, maxAmountToApprove]);
  log(`[GET_APPROVE_UNSIGNED_TX] approveData: ${approveData}`);

  // get the basic tx info such as nonce, gasPrice, chainId
  const { nonce, gasPrice, chainId, gasLimit } = await getBasicTxInfo({
    walletAddress: PKP_ADDRESS,
    provider,
  });
  log(`[GET_APPROVE_UNSIGNED_TX] nonce: ${nonce}`);
  log(`[GET_APPROVE_UNSIGNED_TX] gasPrice: ${gasPrice}`);
  log(`[GET_APPROVE_UNSIGNED_TX] chainId: ${chainId}`);

  // create the unsigned tx
  const unsignedTx = {
    to: tokenInAddress,
    nonce,
    value: 0,
    gasPrice,
    gasLimit,
    chainId,
    data: approveData,
  };
  log(`[GET_APPROVE_UNSIGNED_TX] unsignedTx: ${JSON.stringify(unsignedTx)}`);

  const unsignedTxBuffer = unSignedTxBuffer(unsignedTx);
  log(`[GET_APPROVE_UNSIGNED_TX] unsignedTxBuffer: ${unsignedTxBuffer}`);

  return { unsignedTx, unsignedTxBuffer };
};

/**
 * This will return the unsigned swap tx
 * @jsParam { string } swapRouterAddress
 * @jsParam { object } swapParams
 * @swapParams.property { string } tokenInAddress
 * @swapParams.property { string } tokenOutAddress
 * @swapParams.property { number } fee
 * @swapParams.property { string } recipient
 * @swapParams.property { BigNumber } amountIn
 * @swapParams.property { BigNumber } sqrtPriceLimitX96
 * @swapParams.property { BigNumber } amountOutMinimum
 *
 * @returns { Promise } { unsignedTx, unsignedTxBuffer };
 */
const getSwapUnsignedTx = async () => {
  log("[GET_SWAP_UNSIGNED_TX]");
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

  let swapRouterAddress = SWAP_ROUTER_ADDRESS;
  let swapParams = {
    tokenIn: TOKEN_IN.address,
    tokenOut: TOKEN_OUT.address,
    fee: 3000,
    recipient: PKP_ADDRESS,
    // deadline: Math.floor(Date.now() / 1000) + 60 * 20,
    amountIn: ethers.utils.parseUnits(
      typeof AMOUNT_TO_SELL === "string"
        ? AMOUNT_TO_SELL
        : AMOUNT_TO_SELL.toString(),
      TOKEN_IN.decimals
    ),
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0,
  };

  log("[GET_SWAP_UNSIGNED_TX] swapRouterAddress: ", swapRouterAddress);
  log("[GET_SWAP_UNSIGNED_TX] swapParams: ", swapParams);

  // get "swap exact input single" data from contract
  const swapData = new ethers.utils.Interface([
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

  log(`[GET_SWAP_UNSIGNED_TX] Getting basic tx info...`);
  // get the basic tx info such as nonce, gasPrice, chainId
  const { nonce, gasPrice, chainId, gasLimit } = await getBasicTxInfo({
    walletAddress: PKP_ADDRESS,
    provider,
  });

  // create the unsigned tx
  const unsignedTx = {
    to: swapRouterAddress,
    nonce,
    value: 0,
    gasPrice,
    gasLimit,
    chainId,
    data: swapData,
  };

  const unsignedTxBuffer = unSignedTxBuffer(unsignedTx);

  log(`[GET_SWAP_UNSIGNED_TX] unsignedTxBuffer: ${unsignedTxBuffer}`);

  return { unsignedTx, unsignedTxBuffer };
};

/**
 * This will return the unsigned revoke approve tx
 * @jsParam { string } swapRouterAddress
 * @jsParam { string } tokenInAddress
 *
 * @returns { Promise } { unsignedTx, unsignedTxBuffer };
 */
const getRevokeApproveUnsignedTx = async () => {
  log("[GET_REVOKE_APPROVE_UNSIGNED_TX]");
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

  const { nonce, gasPrice, chainId, gasLimit } = await getBasicTxInfo({
    walletAddress: PKP_ADDRESS,
    provider,
  });

  const approveData = new ethers.utils.Interface([
    "function approve(address,uint256) returns (bool)",
  ]).encodeFunctionData("approve", [SWAP_ROUTER_ADDRESS, 0]);
  log(`[GET_REVOKE_APPROVE_UNSIGNED_TX] approveData: ${approveData}`);

  const unsignedTx = {
    to: TOKEN_IN.address,
    value: 0,
    chainId,
    nonce,
    gasLimit,
    gasPrice,
    data: approveData,
  };
  log(`[GET_REVOKE_APPROVE_UNSIGNED_TX] unsignedTx: ${unsignedTx}`);

  const unsignedTxBuffer = unSignedTxBuffer(unsignedTx);
  log(`[GET_REVOKE_APPROVE_UNSIGNED_TX] unsignedTxBuffer: ${unsignedTxBuffer}`);

  return { unsignedTx, unsignedTxBuffer };
};

/**
 * This will sign the tx
 * @jsParam { string } sigName
 * @jsParam { string } unsignedTxBuffer
 *
 * @returns { string } "GOOD - TX SIGNED";
 */
const signTx = async (args) => {
  log("[SIGN_TX]");

  // This will use the js params sigName and unsignedTx instead

  let _sigName;
  let _unsignedTxBuffer;

  try {
    args;
    const { sigName, unsignedTxBuffer } = args[0];
    _sigName = sigName;
    _unsignedTxBuffer = unsignedTxBuffer;
  } catch (e) {
    try {
      sigName;
      _sigName = sigName;
    } catch (e) {
      respond({ error: "sigName not defined" });
    }

    try {
      unsignedTxBuffer;
      _unsignedTxBuffer = unsignedTxBuffer;
    } catch (e) {
      respond({ error: "unsignedTxBuffer not defined" });
    }
  }

  log("[SIGN_TX] _sigName:", _sigName);
  log("[SIGN_TX] _unsignedTxBuffer:", _unsignedTxBuffer);

  await Lit.Actions.signEcdsa({
    toSign: _unsignedTxBuffer,
    publicKey: PKP_PUBLIC_KEY,
    sigName: _sigName,
  });

  log("[SIGN_TX] ECDSA Signed:", _unsignedTxBuffer);

  return "GOOD - TX SIGNED";
};

/**
 * This will send a serialized tx
 * @param { * } args
 * @returns
 */
const sendSerializedTx = async (args) => {
  log("[SEND_SERIALIZE_TX]");
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

  let _serializedTx;

  try {
    args;
    const { serializedTx } = args[0];
    _serializedTx = serializedTx;
  } catch (e) {
    try {
      serializedTx;
      _serializedTx = serializedTx;
    } catch (e) {
      respond({ error: "serializedTx not defined" });
    }
  }

  log("[SEND_SERIALIZE_TX] sending tx");
  const sendTx = await provider.sendTransaction(_serializedTx);

  log("[SEND_SERIALIZE_TX] tx sent: ", sendTx);
  await sendTx.wait();

  log("[SEND_SERIALIZE_TX] tx mined: ", sendTx);

  return sendTx;
};

/**
 * This will send a tx
 * @param { object } unsignedTx
 * @param { string } encodedSig
 *
 * @returns { Promise } { tx };
 */
const sendTx = async (args) => {
  log("[SEND_TX]");

  let _unsignedTx;
  let _encodedSig;

  // validate if "toSend" is in jsParams
  try {
    args;
    const { unsignedTx, encodedSig } = args[0];
    _unsignedTx = unsignedTx;
    _encodedSig = encodedSig;
  } catch (e) {
    try {
      unsignedTx;
      _unsignedTx = unsignedTx;
    } catch (e) {
      respond({ error: "unsignedTx not defined" });
    }

    try {
      encodedSig;
      _encodedSig = encodedSig;
    } catch (e) {
      respond({ error: "encodedSig not defined" });
    }
  }

  const convertBigNumber = (bigNumberObj) => {
    try {
      const { type, hex } = bigNumberObj;
      if (type === "BigNumber") {
        return ethers.BigNumber.from(hex);
      }
    } catch (e) {
      log("[SEND_TX] Failed to convert bigNumberObj:", e);
    }

    try {
      const { _hex, _isBigNumber } = bigNumberObj;
      if (_isBigNumber) {
        return ethers.BigNumber.from(_hex);
      }
    } catch (e) {
      log("[SEND_TX] Failed to convert bigNumberObj:", e);
    }
    return bigNumberObj;
  };

  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

  _unsignedTx.gasPrice = convertBigNumber(_unsignedTx.gasPrice);

  log("[SEND_TX] _unsignedTx:", _unsignedTx);
  log("[SEND_TX] _encodedSig:", _encodedSig);

  let serialized;

  try {
    serialized = ethers.utils.serializeTransaction(_unsignedTx, _encodedSig);

    log("[SEND_TX] Serialized:", serialized);
  } catch (e) {
    log("[SEND_TX] Failed to serialize TX:", e);
  }

  const tx = await provider.sendTransaction(serialized);

  log("[SEND_TX] Tx:", tx);

  await tx.wait();
  log("[SEND_TX] Tx waited:", tx);

  return tx;
};

/**
 * This will combine the shares using a single node
 */
const combineSharesTest = async () => {
  const res = await Lit.Actions.signEcdsa({
    toSign: [1, 2, 3],
    publicKey: PKP_PUBLIC_KEY,
    sigName: "combine-shares-test",
  });

  return res;
};

/**
 * This will take function name and call the appropriate function
 * @param { string } func
 *
 * @returns { Promise } response
 */
const getFunction = async (func, ...args) => {
  // map function name to function
  const funcMap = {
    // -- RUN ALL --
    ALL: getRunAll,

    // -- TESTS --
    TEST_SIGN: signTest,
    TEST_COMBINE_SHARES: combineSharesTest,
    TEST_GET_UNSIGNED_TX: getTestUnsignedTx,

    // -- GET --
    GET_ALLOWANCE: getAllowance,

    // -- UNSIGNED TX GETTER --
    GET_APPROVE_UNSIGNED_TX: getApproveUnsignedTx,
    GET_REVOKE_APPROVE_UNSIGNED_TX: getRevokeApproveUnsignedTx,
    GET_SWAP_UNSIGNED_TX: getSwapUnsignedTx,

    // -- SEND --
    SIGN_TX: signTx,
    SEND_TX: sendTx,
    SEND_SERIALIZED_TX: sendSerializedTx,
  };

  // call it with args
  const fn = funcMap[func];
  if (fn) {
    return fn(args);
  }

  // error if the function is not found
  return { error: "Invalid function" };
};

/**
 * This will run all functions
 * @returns { Promise } response
 **/
const getRunAll = async () => {
  let allowance = null;
  let unsignedApproveTx = null;
  let unsignedApproveBuffer = null;
  let signedApproveTx = null;
  let unsignedSwapTx = null;
  let unsignedSwapBuffer = null;
  let signedSwapTx = null;

  allowance = await getFunction("GET_ALLOWANCE");
  log("[ExecuteSwap] 1. allowance:", allowance.toString());

  if (allowance <= 0) {
    log("[ExecuteSwap] 2. NOT approved! approving now...");
    let unsignedApproveRes = await getFunction("GET_APPROVE_UNSIGNED_TX");

    unsignedApproveTx = unsignedApproveRes.unsignedTx;
    unsignedApproveBuffer = unsignedApproveRes.unsignedTxBuffer;

    signedApproveTx = await getFunction("SIGN_TX", {
      sigName: "approve-tx-sig",
      unsignedTxBuffer: unsignedApproveBuffer,
    });

    // FIXME: From this point it should send the tx and wait for it to be mined
  }

  log("[ExecuteSwap] 3. Approved! swapping now...");

  unsignedSwapRes = await getFunction("GET_SWAP_UNSIGNED_TX");

  unsignedSwapTx = unsignedSwapRes.unsignedTx;
  unsignedSwapBuffer = unsignedSwapRes.unsignedTxBuffer;

  signedSwapTx = await getFunction("SIGN_TX", {
    unsignedTxBuffer: unsignedSwapBuffer,
    sigName: "swap-tx-sig",
  });

  return {
    allowance,

    // approve tx
    unsignedApproveTx,
    unsignedApproveBuffer,
    signedApproveTx,

    // swap tx
    unsignedSwapTx,
    unsignedSwapBuffer,
    signedSwapTx,
  };
};

// -------------------------
//          Start
// -------------------------
(async () => {
  log(`[----- START EXECUTE SWAP -----]`);
  log(`[MAIN] CALL_FUNCTION: ${CALL_FUNCTION}`);
  log(`[MAIN] PKP_ADDRESS: ${PKP_ADDRESS} `);
  let res = await getFunction(CALL_FUNCTION);
  log("[MAIN] res:", res);
  log("[----- END EXECUTE SWAP -----]");
  respond(res);
})();
