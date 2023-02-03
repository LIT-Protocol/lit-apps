/**
 * @typedef { Object } SwapToken
 * @property { number } chainId
 * @property { number } decimals
 * @property { string } address
 * @property { string } symbol
 * @property { string } name
 *
 * eg. { chainId: 1, decimals: 18, address: "0x...", symbol: "USDT", name: "Tether USD" }
 */

/**
 * @typedef { Object } CurrentBalance
 * @property { SwapToken } token
 * @property { number } balance
 * @property { number } value
 *
 * eg. { token: "USDT", balance: 100, value: 100 }
 */

/**
 * @typedef { Object } StrategyExecutionPlan
 * @property { string } tokenToSell
 * @property { number } percentageToSell
 * @property { number } amountToSell
 * @property { string } tokenToBuy
 *
 * eg. { tokenToSell: "USDT", percentageToSell: 0.5, amountToSell: 100, tokenToBuy: "ETH" }
 */

/**
 * @typedef { Object } PriceData
 * @property { number } status
 * @property { number | null } data
 *
 * eg. { status: 200, data: 1234.56 }
 */

/**
 * @typedef { Object } TX
 * @property { string } nonce
 * @property { BigNumber } gasPrice
 * @property { BigNumber } gasLimit
 * @property { string } to
 * @property { BigNumber } value
 * @property { string } data
 * @property { number } chainId
 * @property { number } v
 * @property { string } r
 * @property { string } s
 * @property { string } from
 * @property { string } hash
 * @property { null } type
 * @property { number } confirmations
 * @property { Function } wait
 *
 * eg. { nonce: 0, gasPrice: BigNumber { _hex: "0x...", _isBigNumber: true }, gasLimit: BigNumber { _hex: "0x...", _isBigNumber: true }, to: "0x...", value: BigNumber { _hex: "0x...", _isBigNumber: true }, data: "0x...", chainId: 1, v: 0, r: "0x...", s: "0x...", from: "0x...", hash: "0x...", type: null, confirmations: 0, wait: [Function: wait] }
 */

import { executeSwap, tokenSwapList } from "@lit-dev/lit-actions";
import { ethers } from "ethers";
import * as utilsPkg from "@lit-dev/utils";
import * as dotenv from "dotenv";
import { computeAddress } from "ethers/lib/utils";
import { exit } from "process";
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import fs from "fs";
import path from "path";

const { getWalletAuthSig, ERC20 } = utilsPkg.default;

dotenv.config({
  path: "../../.env",
});

const serverAuthSig = await getWalletAuthSig({
  privateKey: process.env.SERVER_PRIVATE_KEY,
  chainId: 1,
});

const litNodeClient = new LitJsSdk.LitNodeClient({
  litNetwork: "serrano",
  debug: false,
});

await litNodeClient.connect();

const getCode = (fileName) => {
  return fs.readFileSync(
    path.join(`../../packages/lit-actions/src/publishable/${fileName}`),
    "utf8"
  );
};

/**
 * It retrieves the current price of a specific symbol in USD. The symbol is passed as a parameter to the function. It uses the CryptoCompare API to fetch the price and returns the price data in the form of an object with a status field and a data field.
 *
 * @param { string } symbol eg. "ETH", "USDT", "DAI"
 * @return { { PriceData  } } eg. { status: 200, data: 1234.56 }
 */
async function getUSDPrice(symbol) {
  console.log(`[Lit Action] Running Lit Action to get ${symbol}/USD price...`);

  const res = await litNodeClient.executeJs({
    targetNodeRange: 1,
    authSig: serverAuthSig,
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
 * @param { { getUSDPriceCallback: (symbol: string) => Promise<PriceData> } } options
 * @returns { CurrentBalance }
 */
async function getPortfolio(
  tokens,
  pkpAddress,
  provider,
  { getUSDPriceCallback }
) {
  console.log(`[Lit Action] [FAKE] Running Lit Action to get portfolio...`);

  // check if getUSDPriceCallback exists
  if (!getUSDPriceCallback) {
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

  return balances;
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
  console.log(`[Lit Action] Running Lit Action to get strategy execution plan...`);

  const res = await litNodeClient.executeJs({
    targetNodeRange: 1,
    authSig: serverAuthSig,
    code: getCode(`get-strategy-execution-plan.action.mjs`),
    jsParams: {
      portfolio,
      strategy,
    },
  });

  return res.response;
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
 * @param { { maxGasPrice: number, gasUnit: "gwei" | "wei", minExceedPercentage: number, unless: { spikePercentage: number, adjustGasPrice: boolean } } } conditions
 * @param { string } rpcUrl
 * @param { boolean } dryRun
 * @returns { Promise<TX> }
 *
 *
 */
const runBalancePortfolio = async ({
  tokens,
  pkpPublicKey,
  getUSDPriceCallback,
  strategy,
  conditions = {
    maxGasPrice: 80,
    gasUnit: "gwei",
    minExceedPercentage: 1,
    unless: { spikePercentage: 10, adjustGasPrice: 500 },
  },
  rpcUrl = "https://polygon.llamarpc.com",
  dryRun = false,
}) => {
  // get current date and time in the format: YYYY-MM-DD HH:mm:ss in UK time
  const now = new Date().toLocaleString("en-GB");

  console.log(`[${now}] Running Balance Portfolio...`);

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const pkpAddress = computeAddress(pkpPublicKey);

  // -- Portfolio --
  let portfolio;
  try {
    portfolio = await getPortfolio(tokens, pkpAddress, provider, {
      getUSDPriceCallback,
    });
  } catch (e) {
    console.log(`Error getting portfolio: ${e.message}`);
    return { status: 500, data: "Error getting portfolio" };
  }

  console.log("portfolio:", portfolio);

  // -- Strategy Execution Plan --
  let plan;

  try {
    plan = await getStrategyExecutionPlan(portfolio, strategy);
  } catch (e) {
    console.log(`Error getting strategy execution plan: ${e.message}`);
    return { status: 500, data: "Error getting strategy execution plan" };
  }

  console.log(
    `[pkp:${pkpAddress}]: \nProposed to sell ${plan.tokenToSell.symbol} and buy ${plan.tokenToBuy.symbol}. Percentage difference is ${plan.valueDiff.percentage}%.`
  );

  // -- Guard Conditions --
  let atLeastPercentageDiff = conditions.minExceedPercentage; // eg. 1 = 1%

  // If the percentage difference is less than 5%, then don't execute the swap
  if (plan.valueDiff.percentage < atLeastPercentageDiff) {
    console.log(
      `No need to execute swap, percentage is only ${plan.valueDiff.percentage}% which is less than ${atLeastPercentageDiff}% required.`
    );
    return { status: 412, data: "No need to execute swap" };
  }

  // this usually happens when the price of the token has spiked in the last moments
  let spikePercentageDiff = conditions.conditions.unless.spikePercentage; // eg. 15 => 15%

  // Unless the percentage difference is greater than 15%, then set the max gas price to 1000 gwei
  // otherwise, set the max gas price to 100 gwei
  let _maxGasPrice =
    plan.valueDiff.percentage > spikePercentageDiff
      ? {
          value: conditions.unless.adjustGasPrice,
          unit: conditions.gasUnit,
        }
      : {
          value: conditions.maxGasPrice,
          unit: conditions.gasUnit,
        };

  if (dryRun) {
    return { status: 200, data: "dry run, skipping swap..." };
  }

  // -- Execute Swap --
  let tx;
  try {
    await executeSwap({
      jsParams: {
        authSig: serverAuthSig,
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
    console.log(`Error executing swap: ${e.message}`);
    return { status: 500, data: "Error executing swap" };
  }
  return { status: 200, data: tx };
};

// let counter = 0;

// while (true) {
//   counter++;

//   console.log(`counter:`, counter);

const res = await runBalancePortfolio({
  tokens: [tokenSwapList.WMATIC, tokenSwapList.USDC],
  pkpPublicKey: process.env.PKP_PUBLIC_KEY,
  getUSDPriceCallback: getUSDPrice,
  strategy: [
    { token: tokenSwapList.USDC.symbol, percentage: 60 },
    { token: tokenSwapList.WMATIC.symbol, percentage: 40 },
  ],
  conditions: {
    maxGasPrice: 80,
    minExceedPercentage: 1,
    unless: {
      spikePercentage: 15,
      adjustGasPrice: 1000,
    },
  },
  rpcUrl: process.env.MATIC_RPC,
  dryRun: false,
});

console.log("res:", res);
//   console.log("waiting for 5 seconds before continuing...");
//   await new Promise((resolve) => setTimeout(resolve, 5 * 60 * 1000));
// }
