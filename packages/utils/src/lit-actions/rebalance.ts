// @ts-nocheck
import { executeSwap } from "@lit-dev/lit-actions";
import { ethers } from "ethers";
import { getWalletAuthSig, ERC20 } from "@lit-dev/utils";
import * as dotenv from "dotenv";
import { computeAddress } from "ethers/lib/utils";
import * as LitJsSdk from "@lit-protocol/lit-node-client";

import {
  SwapToken,
  Response,
  CurrentBalance,
  Strategy,
  StrategyExecutionPlan,
} from "../types";

dotenv.config({
  path: "../../.env",
});

function getIpfsId(fileName: string) {
  if (fileName === "get-token-price.action.mjs") {
    return "QmRsQdKzFAEYj9rcTWktbLHYmMxgBVkdFZDBataTMFPmPN";
  }

  if (fileName === "get-strategy-execution-plan.action.mjs") {
    return "QmPnmiyZ2ttp1LvhDDffPkHikdvu6NA81L7zXjdypghZXS";
  }
}

/**
 * It retrieves the current price of a specific symbol in USD. The symbol is passed as a parameter to the function. It uses the CryptoCompare API to fetch the price and returns the price data in the form of an object with a status field and a data field.
 *
 * @param { string } symbol eg. "ETH", "USDT", "DAI"
 * @return { { Response  } } eg. { status: 200, data: 1234.56 }
 */
async function getUSDPrice(symbol: string): Promise<Response> {
  console.log(`[Lit Action] Running Lit Action to get ${symbol}/USD price...`);

  const res = await globalThis.litNodeClient.executeJs({
    targetNodeRange: 1,
    authSig: globalThis.serverAuthSig,
    ipfsId: getIpfsId(`get-token-price.action.mjs`),
    jsParams: {
      tokenSymbol: symbol,
    },
  });
  return res.response as unknown as Response;
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
 * @param { { getUSDPriceCallback: (symbol: string) => Promise<Response> } } options
 * @returns { CurrentBalance }
 */
async function getPortfolio(
  tokens: Array<SwapToken>,
  pkpAddress: string,
  provider: ethers.providers.JsonRpcProvider,
  {
    getUSDPriceCallback,
  }: {
    getUSDPriceCallback: (symbol: string) => Promise<Response>;
  }
): Promise<Response> {
  console.log(`[Lit Action] [FAKE] Running Lit Action to get portfolio...`);

  // check if getUSDPriceCallback exists
  if (!getUSDPriceCallback) {
    getUSDPriceCallback = getUSDPrice;
    throw new Error("getUSDPriceCallback is required");
  }

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
      let balance: string | number = await ERC20.getBalance(
        token.address,
        provider,
        pkpAddress
      );

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
async function getStrategyExecutionPlan(
  portfolio: Array<CurrentBalance>,
  strategy: Strategy
): Promise<Response> {
  console.log(
    `[Lit Action] Running Lit Action to get strategy execution plan...`
  );

  const res = await globalThis.litNodeClient.executeJs({
    targetNodeRange: 1,
    authSig: globalThis.serverAuthSig,
    // code: getCode(`get-strategy-execution-plan.action.mjs`),
    ipfsId: getIpfsId(`get-strategy-execution-plan.action.mjs`),
    jsParams: {
      portfolio,
      strategy,
    },
  });

  console.log("res:", res);

  return res.response as unknown as Response;
}

// ------------------------------
//          Start Here
// ------------------------------

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
export async function runBalancePortfolio(
  {
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
    isDemo = true,
  },
  serverAuthSig,
  ipfsId,
) {
  // -- validate
  // if any of the required params are missing, throw an error
  if (!tokens || !pkpPublicKey || !strategy || !serverAuthSig || !ipfsId) {
    // check which params are missing
    const missingParams = [];
    if (!tokens) missingParams.push("tokens");
    if (!pkpPublicKey) missingParams.push("pkpPublicKey");
    if (!strategy) missingParams.push("strategy");
    if (!serverAuthSig) missingParams.push("serverAuthSig");
    if (!ipfsId) missingParams.push("ipfsId");

    // throw an error with the missing params
    throw new Error(`Missing params: ${missingParams.join(", ")}`);
  }

  // -- FIXME: THIS CODE SHOULD BE REFACTORED --
  globalThis.serverAuthSig = serverAuthSig;

  globalThis.litNodeClient = new LitJsSdk.LitNodeClient({
    litNetwork: "serrano",
    debug: false,
  });

  await globalThis.litNodeClient.connect();

  // get execution time
  const startTime = new Date().getTime();

  // get current date and time in the format: YYYY-MM-DD HH:mm:ss in UK time
  const now = new Date().toLocaleString("en-GB");

  console.log(`[BalancePortfolio] => Start ${now}`);

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const pkpAddress = computeAddress(pkpPublicKey);

  // -- Portfolio --
  let portfolio: Array<CurrentBalance> = [];
  try {
    const res: Response = await getPortfolio(tokens, pkpAddress, provider, {
      getUSDPriceCallback: getUSDPrice,
    });
    portfolio = res.data;
  } catch (e) {
    const msg = `Error getting portfolio: ${e.message}`;

    console.log(`[BalancePortfolio] ${msg}`);
    return { status: 500, data: msg };
  }

  // print each token balance and value in the format of Token: { symbol: "WMATIC", balance: 0.000000000000000001, value: 0.000000000000000001}
  portfolio.forEach((currentBalance: CurrentBalance) => {
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
  let plan: StrategyExecutionPlan;

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
        ipfsId,
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

// (async () => {
//   globalThis.serverAuthSig = await getWalletAuthSig({
//     privateKey: process.env.SERVER_PRIVATE_KEY,
//     chainId: 1,
//   });

//   const litNodeClient = new LitJsSdk.LitNodeClient({
//     litNetwork: "serrano",
//     debug: false,
//   });

//   await litNodeClient.connect();

//   let counter = 0;

//   while (true) {
//     counter++;

//     console.log(`counter:`, counter);

//     const res = await runBalancePortfolio({
//       tokens: [tokenSwapList.WMATIC, tokenSwapList.USDC],
//       pkpPublicKey: process.env.PKP_PUBLIC_KEY,
//       strategy: [
//         { token: tokenSwapList.USDC.symbol, percentage: 52 },
//         { token: tokenSwapList.WMATIC.symbol, percentage: 48 },
//       ],
//       conditions: {
//         maxGasPrice: 75,
//         unit: "gwei",
//         minExceedPercentage: 1,
//         unless: {
//           spikePercentage: 15,
//           adjustGasPrice: 500,
//         },
//       },
//       rpcUrl: process.env.MATIC_RPC,
//       dryRun: false,
//     });

//     console.log("[Task] res:", res);
//     console.log("[Task] waiting for 5 minutes before continuing...");
//     await new Promise((resolve) => setTimeout(resolve, 5 * 60 * 1000));
//   }
// })();

// const json = {
//   tokens: [
//     {
//       chainId: 137,
//       decimals: 18,
//       address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
//       symbol: "WMATIC",
//       name: "Wrapped Matic",
//     },
//     {
//       chainId: 137,
//       decimals: 6,
//       address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
//       symbol: "USDC",
//       name: "USD//C",
//     },
//   ],
//   pkpPublicKey:
//     "0x0499713b16636af841756431b73bd1a88d1837d110ae981ff3711c9239af95d8849b149fb6f2d46697b4d75c62ae4e63f8b8b941d4ca0a06a02b8b47d12f42b61d",
//   strategy: [
//     { token: "USDC", percentage: 52 },
//     { token: "WMATIC", percentage: 48 },
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
//   rpcUrl: "https://polygon.llamarpc.com",
//   dryRun: false,
// };
