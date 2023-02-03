import { executeSwap, swapStubs, tokenSwapList } from "@lit-dev/lit-actions";
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

const provider = new ethers.providers.JsonRpcProvider(process.env.MATIC_RPC);

const pkpAddress = computeAddress(process.env.PKP_PUBLIC_KEY);

const litNodeClient = new LitJsSdk.LitNodeClient({
  litNetwork: "serrano",
  debug: false,
});

await litNodeClient.connect();

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
const getUSDPrice = async (symbol) => {
  console.log(`Running Lit Action to get ${symbol}/USD price...`);

  const res = await litNodeClient.executeJs({
    targetNodeRange: 1,
    authSig: serverAuthSig,
    code: getCode(`get-token-price.action.mjs`),
    jsParams: {
      tokenSymbol: symbol,
    },
  });
  return res.response;
};

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
const getPortfolio = async (
  tokens,
  pkpAddress,
  provider,
  { getUSDPriceCallback }
) => {
  console.log(`[FAKE] Running Lit Action to get portfolio...`);

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
};

/**
 * This function is used to balance a token portfolio based on a given strategy.
 * It takes in the `portfolio` array and the `strategy` array as arguments and returns an object
 * with the `tokenToSell`, `percentageToSell`, `amountToSell`, and `tokenToBuy` properties.
 * @param { Array<CurrentBalance> } portfolio
 * @param { Array<{ token: string, percentage: number }> } strategy
 *
 * @returns { StrategyExecutionPlan }
 */
const getStrategyExecutionPlan = async (portfolio, strategy) => {
  console.log(`Running Lit Action to get strategy execution plan...`);

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
};

// ------------------------------
//          Start Here
// ------------------------------
let counter = 0;

while (true) {
  counter++;

  // get current date and time in the format: YYYY-MM-DD HH:mm:ss in UK time
  const now = new Date().toLocaleString("en-GB", {
    timeZone: "Europe/London",
  });

  console.log(`[${now}]counter:`, counter);

  const portfolio = await getPortfolio(
    [swapStubs.wmatic, swapStubs.usdc],
    pkpAddress,
    provider,
    {
      getUSDPriceCallback: getUSDPrice,
    }
  );

  console.log("portfolio:", portfolio);

  const plan = await getStrategyExecutionPlan(portfolio, [
    { token: "USDC", percentage: 60 },
    { token: "WMATIC", percentage: 40 },
  ]);

  console.log(plan);

  let atLeastPercentageDiff = 0.05; // this is 0.05% NOT 5%

  // If the percentage difference is less than 5%, then don't execute the swap
  if (plan.valueDiff.percentage < atLeastPercentageDiff) {
    console.log(
      `No need to execute swap, percentage is only ${plan.valueDiff.percentage}% which is less than ${atLeastPercentageDiff}%`
    );
    // skip while loop
    console.log("waiting for 5 minutes before continuing...");
    await new Promise((resolve) => setTimeout(resolve, 5 * 60 * 1000));
    continue;
  }

  // this usually happens when the price of the token has spiked in the last moments
  let spikePercentageDiff = 15;

  // Unless the percentage difference is greater than 15%, then set the max gas price to 1000 gwei
  // otherwise, set the max gas price to 100 gwei
  let maxGasPrice =
    plan.valueDiff.percentage > spikePercentageDiff
      ? {
          value: 1000,
          unit: "gwei",
        }
      : {
          value: 200,
          unit: "gwei",
        };

  const res = await executeSwap({
    jsParams: {
      authSig: serverAuthSig,
      rpcUrl: "https://polygon.llamarpc.com",
      chain: "matic",
      tokenIn: plan.tokenToSell,
      tokenOut: plan.tokenToBuy,
      pkp: {
        publicKey: process.env.PKP_PUBLIC_KEY,
      },
      amountToSell: plan.amountToSell.toString(),
      conditions: {
        maxGasPrice,
      },
    },
  });

  console.log("res:", res);
  console.log("waiting for 5 seconds before continuing...");
  await new Promise((resolve) => setTimeout(resolve, 5 * 60 * 1000));
}
