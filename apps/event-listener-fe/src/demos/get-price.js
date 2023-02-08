/**
 *
 * This function has been tested to run on Lit Actions. It is a simple function that uses the CryptoCompare API
 * to fetch the current price of a token in USD. It takes in the token symbol as a parameter and returns the price in USD.
 * 
 * @jsparam { string } tokenSymbol eg. "ETH", "USDT", "DAI"
 * 
 * @returns { { status: number, data: number | null } } eg. { status: 200, data: 1234.56 }
 * 
 * [PARENT] @example
 * 
    const res = await client.executeJs({
        authSig,
        ipfsId: "QmP8Ws87bRq9vgM3VQJ4fuK6AnukEPqSnSC3x6EMYMhBFw",
        jsParams: {
            tokenSymbol: "ETH",
        },
    });

 * [CHILD] @example
 * `
    (async() => {
        const ethPriceResult = await Lit.Actions.call({
            ipfsId: 'QmT4xgGx1XyKYGU7iJKGuVPGUhtYAVWTNwLcxhsscnECNo',
            params: {
                tokenSymbol: "ETH",
            },
        })

        // -- error
        if( ethPriceResult.status !== 200 ){
            throw new Error("Failed to get ETH price");
        }

        // -- success
        console.log("ETH Price:", ethPriceResult.data);
    })();
  `
 *
 */

/**
 * It retrieves the current price of a specific symbol in USD. The symbol is passed as a parameter to the function. It uses the CryptoCompare API to fetch the price and returns the price data in the form of an object with a status field and a data field.
 *
 * @param { string } symbol eg. "ETH", "USDT", "DAI"
 * @return { { PriceData  } } eg. { status: 200, data: 1234.56 }
 */
const getUSDPrice = async (symbol) => {
  // this will both set the response to the client and return the data internally
  const respond = (data) => {
    Lit.Actions.setResponse({
      response: JSON.stringify(data),
    });

    return data;
  };

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
    return respond({ status: 500, data: null });
  }

  return respond({ status: 200, data: data.USD });
};

(async () => {
  // --------------------------------------
  //          JS Params Handling
  // --------------------------------------
  const jsParams = {};

  try {
    jsParams.tokenSymbol = tokenSymbol;
    jsParams.minSellPrice = minSellPrice;
  } catch (e) {
    console.error("[ERROR] tokenSymbol is required");
    return;
  }

  // -----------------------
  //          GO!
  // -----------------------
  const res = await getUSDPrice(jsParams.tokenSymbol);

  console.log("res:", res.data);
  console.log("jsParams:", jsParams);

  if (res.data >= jsParams.minSellPrice) {
    console.log(
      `${res.data} is higher than ${jsParams.minSellPrice}, signing...`
    );
    await LitActions.signEcdsa({ toSign, publicKey, sigName });
  } else {
    console.log(`${res.data} is lower than ${jsParams.minSellPrice}, abort.`);
  }
})();