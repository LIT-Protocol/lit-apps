/**
 * 
 * This function is used to balance a token portfolio based on a given strategy.
 * It takes in the `portfolio` array and the `strategy` array as arguments and returns an object
 * with the `tokenToSell`, `percentageToSell`, `amountToSell`, and `tokenToBuy` properties.
 * 
 * @jsparams { Array<CurrentBalance> } portfolio
 * @jsparams { Array<{ token: string, percentage: number }> } strategy
 * 
 * @returns { StrategyExecutionPlan }
 * 
 * [PARENT] @example
 *
    const res = await client.executeJs({
      authSig,
      ipfsId: "QmP8Ws87bRq9vgM3VQJ4fuK6AnukEPqSnSC3x6EMYMhBFw",
      jsParams: {
        portfolio: [
          {
            token: {
              chainId: 137,
              decimals: 18,
              address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
              symbol: "WMATIC",
              name: "Wrapped Matic",
            },
            balance: 2.6989198489555926,
            value: 3.2818865363300005,
          },
          {
            token: {
              chainId: 137,
              decimals: 6,
              address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
              symbol: "USDC",
              name: "USD//C",
            },
            balance: 7.491075,
            value: 7.491075,
          },
        ],
        strategy: [
          { token: "USDC", percentage: 70 },
          { token: "WMATIC", percentage: 30 },
        ],
      },
    });
 *
 *
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
 * @typedef { Object } CurrentBalance
 * @property { SwapToken } token
 * @property { number } balance
 * @property { number } value
 *
 * eg. { token: swapToken, balance: 100, value: 100 }
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
 *
 * @param { Array<CurrentBalance> } portfolio
 * @param { Array<{ token: string, percentage: number }> } strategy
 *
 * @returns { StrategyExecutionPlan }
 */
function getStrategyExecutionPlan(tokens, strategy) {
  // if the strategy percentage is not 100, throw an error
  if (strategy.reduce((sum, s) => sum + s.percentage, 0) !== 100) {
    // show which token can be adjusted with another percentage to make the total 100
    let tokenToAdjust = strategy.find((s) => s.percentage !== 0);
    let adjustedPercentage =
      100 - strategy.reduce((sum, s) => sum + s.percentage, 0);

    let total = tokenToAdjust.percentage + adjustedPercentage;

    throw new Error(
      `Strategy percentages must add up to 100 - The total strategy percentage for all assets must equal 100, with a suggested allocation of ${total}% for ${tokenToAdjust.token}  to reach this total.`
    );
  }

  // this will both set the response to the client and return the data internally
  const respond = (data) => {
    Lit.Actions.setResponse({
      response: JSON.stringify(data),
    });

    return data;
  };
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
    map[token.token.symbol] = index;
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

  const toSellSymbol = strategy[tokenToSellIndex].token;
  const toBuySymbol = strategy[tokenToBuyIndex].token;

  // find to sell token param tokens
  const toSellToken = tokens.find(
    (token) => token.token.symbol === toSellSymbol
  ).token;

  //  find to buy token
  const toBuyToken = tokens.find(
    (token) => token.token.symbol === toBuySymbol
  ).token;

  // calculate the percentage difference between the strategy and the current portfolio, and show which token is it
  const proposedAllocation = diffValues.map((diff, index) => {
    const percentageDiff = (diff / totalValue) * 100;
    const token = strategy[index].token;
    return { token, percentageDiff };
  });

  // sell allocation
  const sellPercentageDiff = proposedAllocation.find((token) => {
    return token.token === toSellToken.symbol;
  });

  // Return the token to sell and the amount to sell
  return respond({
    tokenToSell: toSellToken,
    percentageToSell: Math.abs(percentageToSell),
    amountToSell: amountToSell.toFixed(6).toString(),
    tokenToBuy: toBuyToken,
    proposedAllocation,
    valueDiff: {
      token: sellPercentageDiff.token,
      percentage: Math.abs(sellPercentageDiff.percentageDiff).toFixed(2),
    },
  });
}

(async () => {
  // --------------------------------------
  //          JS Params Handling
  // --------------------------------------
  const jsParams = {};

  try {
    jsParams.portfolio = portfolio;
  } catch (e) {
    console.error("[ERROR] portfolio is required");
    return;
  }

  try {
    jsParams.strategy = strategy;
  } catch (e) {
    console.error("[ERROR] strategy is required");
    return;
  }

  // -----------------------
  //          GO!
  // -----------------------
  const res = await getStrategyExecutionPlan(portfolio, strategy);

  console.log("res:", res);
})();
