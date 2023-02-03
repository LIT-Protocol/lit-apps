import * as litActionPkg from "@lit-dev/lit-actions";
import { ethers } from "ethers";
import * as utilsPkg from "@lit-dev/utils";
import * as dotenv from "dotenv";
import { computeAddress } from "ethers/lib/utils";

dotenv.config({
  path: "../../.env",
});

const { getWalletAuthSig, ERC20 } = utilsPkg.default;
const { executeSwap, swapStubs, validateParams, tokenSwapList } =
  litActionPkg.default;

const serverAuthSig = await getWalletAuthSig({
  privateKey: process.env.SERVER_PRIVATE_KEY,
  chainId: 1,
});

const provider = new ethers.providers.JsonRpcProvider(process.env.MATIC_RPC);

const pkpAddress = computeAddress(process.env.PKP_PUBLIC_KEY);

console.log("pkpAddress:", pkpAddress);

const getUSDPrice = async (symbol) => {
  // -- PRODUCTION MODE
  const API =
    "https://min-api.cryptocompare.com/data/price?fsym=" +
    symbol +
    "&tsyms=USD";

  let res;
  let data;

  try {
    res = await fetch(API);
    data = await res.json();
  } catch (e) {
    console.log(e);
  }

  if (!res) {
    return { status: 500, data: null };
  }

  return { status: 200, data: data.USD };
};

const getCurrentBalances = async (tokens, pkpAddress, provider) => {
  // token symbol mapper, eg. WMATIC -> MATIC
  const tokenSymbolMapper = {
    WMATIC: "MATIC",
    WETH: "ETH",
  };

  const balances = await Promise.all(
    tokens.map(async (token) => {
      let balance = await ERC20.getBalance(token.address, provider, pkpAddress);
      const decimals = await ERC20.getDecimals(token.address, provider);
      balance = parseFloat(ethers.utils.formatUnits(balance, decimals));

      const priceSymbol = tokenSymbolMapper[token.symbol] ?? token.symbol;
      const value = (await getUSDPrice(priceSymbol)).data * balance;

      return {
        token: token.symbol,
        balance,
        value,
      };
    })
  );

  return balances;
};

function balancePortfolio(tokens, strategy) {
  // Calculate the total value of the portfolio
  let totalValue = tokens.reduce((sum, token) => sum + token.value, 0);
  console.log("totalValue:", totalValue);
  // Calculate the target percentage for each token based on the strategy
  let targetPercentages = strategy.map((s) => s.percentage / 100);
  console.log("targetPercentages:", targetPercentages);

  // Calculate the target value for each token
  let targetValues = targetPercentages.map((p) => totalValue * p);
  console.log("targetValues:", targetValues);

  // Create a mapping between the token symbol and its index in the tokens array
  let tokenIndexMap = tokens.reduce((map, token, index) => {
    map[token.token] = index;
    return map;
  }, {});
  console.log("tokenIndexMap:", tokenIndexMap);

  // Calculate the difference between the target value and the current value for each token
  let diffValues = strategy.map((s, index) => {
    let tokenIndex = tokenIndexMap[s.token];
    return targetValues[index] - tokens[tokenIndex].value;
  });
  console.log("diffValues:", diffValues);

  // Determine which token to buy by finding the token with the largest negative difference
  let tokenToBuyIndex = diffValues.reduce(
    (maxIndex, diff, index) => (diff > diffValues[maxIndex] ? index : maxIndex),
    0
  );
  console.log("tokenToBuyIndex:", tokenToBuyIndex);
  // Calculate the amount of the token to sell
  let percentageToSell =
    diffValues[tokenToBuyIndex] / tokens[tokenToBuyIndex].value;
  console.log("percentageToSell:", percentageToSell);

  // get the actual amount of token to sell
  let amountToSell = tokens[tokenToBuyIndex].balance * percentageToSell;
  console.log("amountToSell:", amountToSell);

  // Determine which token to sell by finding the token with the largest positive difference
  let tokenToSellIndex = diffValues.reduce(
    (minIndex, diff, index) => (diff < diffValues[minIndex] ? index : minIndex),
    0
  );
  console.log("tokenToSellIndex:", tokenToSellIndex);

  // Return the token to sell and the amount to sell
  return {
    tokenToSell: strategy[tokenToSellIndex].token,
    percentageToSell: Math.abs(percentageToSell),
    amountToSell,
    tokenToBuy: strategy[tokenToBuyIndex].token,
  };
}

const balances = await getCurrentBalances(
  [swapStubs.wmatic, swapStubs.usdc],
  pkpAddress,
  provider
);

console.log("balances:", balances);

const result = balancePortfolio(balances, [
  { token: "USDC", percentage: 70 },
  { token: "WMATIC", percentage: 30 },
]);

console.log("result:", result);

const tokenIn = tokenSwapList[result.tokenToSell];
const tokenOut = tokenSwapList[result.tokenToBuy];

console.log("tokenIn:", tokenIn);
console.log("tokenOut:", tokenOut);
console.log("To Sell", result.amountToSell.toString());

const res = await executeSwap({
  jsParams: {
    authSig: serverAuthSig,
    rpcUrl: "https://polygon.llamarpc.com",
    chain: "matic",
    tokenIn,
    tokenOut,
    pkp: {
      publicKey: process.env.PKP_PUBLIC_KEY,
    },
    amountToSell: result.amountToSell.toFixed(6).toString(),
  },
});

console.log("res:", res);
