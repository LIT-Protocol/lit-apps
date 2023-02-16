/**
 *
 * DISCLAIMER: THIS CODE IS STRICTLY FOR DEMONSTRATION PURPOSES ONLY.
 *
 * Some parts are still in heavy development and are not ready for production use.
 *
 * The code below can be divided into 4 parts:
 * - get the current price of a token in USD
 * - get the current portfolio balance
 * - get the strategy execution plan
 * - execute the strategy execution plan
 *
 * Each part can be run independently via a child lit action, and finally only sign
 * if conditions are met to execute the strategy execution plan, aka. swap tokens.
 *
 */

/**
 * It retrieves the current price of a specific symbol in USD. The symbol is passed as a parameter to the function. It uses the CryptoCompare API to fetch the price and returns the price data in the form of an object with a status field and a data field.
 *
 * @param { string } symbol eg. "ETH", "USDT", "DAI"
 * @return { { Response  } } eg. { status: 200, data: 1234.56 }
 */
async function getUSDPrice(symbol) {
  console.log(`[Lit Action] Running Lit Action to get ${symbol}/USD price...`);

  const res = await litNodeClient.executeJs({
    targetNodeRange: 1,
    authSig: globalThis.serverAuthSig,
    code: getCode(`get-token-price.action.mjs`),
    jsParams: {
      tokenSymbol: symbol,
    },
  });
  return res.response;
}

/**
 *
 * This function is used to get the current balances of the specified ERC20 tokens.
 * It takes in the `tokens` array, `pkpAddress` (public key pair address) and the `provider`
 * as arguments and returns an array of objects containing the token symbol, balance and value.
 *
 * @param { Array<SwapToken> } tokens
 * @param { string } pkpAddress
 * @param { JsonRpcProvider } provider
 * @returns { CurrentBalance }
 */
async function getPortfolio(tokens, pkpAddress, provider) {
  console.log(`[Lit Action] [FAKE] Running Lit Action to get portfolio...`);

  // `tokenSymbolMapper` is a symbol mapper for the ERC20 tokens,
  // for example, if the token symbol is `WMATIC` it will map it to `MATIC`.
  const tokenSymbolMapper = {
    WMATIC: "MATIC",
    WETH: "ETH",
  };

  // Using Promise.all, we retrieve the balance and value of each token in the `tokens` array.
  const balances = await Promise.all(
    tokens.map(async (token) => {
      // Get the token balance using the `ERC20.getBalance` method.
      let balance = await ERC20.getBalance(token.address, provider, pkpAddress);

      // Get the number of decimal places of the token using the `ERC20.getDecimals` method.
      const decimals = await ERC20.getDecimals(token.address, provider);

      // Format the token balance to have the correct number of decimal places.
      balance = parseFloat(ethers.utils.formatUnits(balance, decimals));

      // Get the token symbol using the `tokenSymbolMapper` or the original symbol if not found.
      const priceSymbol = tokenSymbolMapper[token.symbol] ?? token.symbol;

      // Get the token value in USD using the `getUSDPrice` function.
      const value = (await getUSDPriceCallback(priceSymbol)).data * balance;

      // Return an CurrentBalance object containing the token symbol, balance and value.
      return {
        token,
        balance,
        value,
      };
    })
  );

  return { status: 200, data: balances };
}

/**
 * This function is used to balance a token portfolio based on a given strategy.
 * It takes in the `portfolio` array and the `strategy` array as arguments and returns an object
 * with the `tokenToSell`, `percentageToSell`, `amountToSell`, and `tokenToBuy` properties.
 * @param { Array<CurrentBalance> } portfolio
 * @param { Array<{ token: string, percentage: number }> } strategy
 *
 * @returns { StrategyExecutionPlan }
 */
async function getStrategyExecutionPlan(portfolio, strategy) {
  console.log(
    `[Lit Action] Running Lit Action to get strategy execution plan...`
  );

  const res = await litNodeClient.executeJs({
    targetNodeRange: 1,
    authSig: globalThis.serverAuthSig,
    code: getCode(`get-strategy-execution-plan.action.mjs`),
    jsParams: {
      portfolio,
      strategy,
    },
  });

  return res.response;
}

// -------------------------------------------------------------------
//          Let's pretend this function lives on Lit Action
// -------------------------------------------------------------------
const executeSwap = async ({ jsParams }) => {
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

/**
 *
 * @param { Array<SwapToken> } tokens
 * @param { string } pkpAddress
 * @param { { getUSDPriceCallback: (symbol: string) => Promise<PriceData> } } options
 * @param { Array<{ token: string, percentage: number }> } strategy eg. [{ token: "WMATIC", percentage: 50 }, { token: "USDC", percentage: 50 }]
 * @param { RebalanceConditions } conditions
 * @param { string } rpcUrl
 * @param { boolean } dryRun
 * @returns { Promise<TX> }
 *
 *
 */
async function runBalancePortfolio({
  tokens,
  pkpPublicKey,
  strategy,
  conditions = {
    maxGasPrice: 80,
    unit: "gwei",
    minExceedPercentage: 1,
    unless: { spikePercentage: 10, adjustGasPrice: 500 },
  },
  rpcUrl = "https://polygon.llamarpc.com",
  dryRun = true,
}) {
  // get execution time
  const startTime = new Date().getTime();

  // get current date and time in the format: YYYY-MM-DD HH:mm:ss in UK time
  const now = new Date().toLocaleString("en-GB");

  console.log(`[BalancePortfolio] => Start ${now}`);

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const pkpAddress = computeAddress(pkpPublicKey);

  // -- Portfolio --
  let portfolio = [];
  try {
    const res = await getPortfolio(tokens, pkpAddress, provider, {
      getUSDPriceCallback: getUSDPrice,
    });
    portfolio = res.data;
  } catch (e) {
    const msg = `Error getting portfolio: ${e.message}`;

    console.log(`[BalancePortfolio] ${msg}`);
    return { status: 500, data: msg };
  }

  // log each token balance and value in the format of
  // { symbol: "WMATIC", balance: 0.000000000000000001, value: 0.000000000000000001}
  portfolio.forEach((currentBalance) => {
    console.log(
      `[BalancePortfolio] currentBalance: { symbol: "${currentBalance.token.symbol}", balance: ${currentBalance.balance}, value: ${currentBalance.value} }`
    );
  });

  console.log(
    `[BalancePortfolio] Total value: ${portfolio.reduce(
      (a, b) => a + b.value,
      0
    )}`
  );

  // -- Strategy Execution Plan --
  let plan;

  try {
    const res = await getStrategyExecutionPlan(portfolio, strategy);

    plan = res.data;
  } catch (e) {
    console.log(
      `[BalancePortfolio] Error getting strategy execution plan: ${e.message}`
    );
    return { status: 500, data: "Error getting strategy execution plan" };
  }

  console.log(`[BalancePortfolio] PKP Address: ${pkpAddress}`);

  console.log(
    `[BalancePortfolio] Proposed to swap ${plan.tokenToSell.symbol} for ${plan.tokenToBuy.symbol}. Percentage difference is ${plan.valueDiff.percentage}%.`
  );

  // -- Guard Conditions --
  let atLeastPercentageDiff = conditions.minExceedPercentage; // eg. 1 = 1%

  // If the percentage difference is less than 5%, then don't execute the swap
  if (plan.valueDiff.percentage < atLeastPercentageDiff) {
    const msg = `No need to execute swap, percentage is only ${plan.valueDiff.percentage}% which is less than ${atLeastPercentageDiff}% required.`;
    console.log(`[BalancePortfolio] ${msg}`);
    return { status: 412, data: msg };
  }

  // this usually happens when the price of the token has spiked in the last moments
  let spikePercentageDiff = conditions.unless.spikePercentage; // eg. 15 => 15%

  // Unless the percentage difference is greater than 15%, then set the max gas price to 1000 gwei
  // otherwise, set the max gas price to 100 gwei
  let _maxGasPrice =
    plan.valueDiff.percentage > spikePercentageDiff
      ? {
          value: conditions.unless.adjustGasPrice,
          unit: conditions.unit,
        }
      : {
          value: conditions.maxGasPrice,
          unit: conditions.unit,
        };
  console.log("[BalancePortfolio] maxGasPrice:", _maxGasPrice);

  if (dryRun) {
    return { status: 200, data: "dry run, skipping swap..." };
  }

  // -- Execute Swap --
  let tx;
  try {
    tx = await executeSwap({
      jsParams: {
        authSig: globalThis.serverAuthSig,
        rpcUrl,
        tokenIn: plan.tokenToSell,
        tokenOut: plan.tokenToBuy,
        pkp: {
          publicKey: pkpPublicKey,
        },
        amountToSell: plan.amountToSell.toString(),
        conditions: {
          maxGasPrice: _maxGasPrice,
        },
      },
    });
  } catch (e) {
    const msg = `Error executing swap: ${e.message}`;
    console.log(`[BalancePortfolio] ${msg}`);
    return { status: 500, data: msg };
  }

  // get execution time
  const endTime = new Date().getTime();
  const executionTime = (endTime - startTime) / 1000;

  console.log(`[BalancePortfolio] => End ${executionTime} seconds`);

  return {
    status: 200,
    data: {
      tx,
      executionTime,
    },
  };
}

// ------------------------------------------
//          Run Rebalance Function
// ------------------------------------------

const go = async () => {
  // js params example
  // {
  //   tokens: [tokenSwapList.WMATIC, tokenSwapList.USDC],
  //   pkpPublicKey: process.env.PKP_PUBLIC_KEY,
  //   strategy: [
  //     { token: tokenSwapList.USDC.symbol, percentage: 52 },
  //     { token: tokenSwapList.WMATIC.symbol, percentage: 48 },
  //   ],
  //   conditions: {
  //     maxGasPrice: 75,
  //     unit: "gwei",
  //     minExceedPercentage: 1,
  //     unless: {
  //       spikePercentage: 15,
  //       adjustGasPrice: 500,
  //     },
  //   },
  //   rpcUrl: process.env.MATIC_RPC,
  //   dryRun: false,
  // }

  const res = await runBalancePortfolio(jsParams);
  console.log("[Task] res:", res);
};

go();
