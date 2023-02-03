import * as LitJsSdk from "@lit-protocol/lit-node-client";
import * as utilsPkg from "@lit-dev/utils";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({
  path: "../../.env",
});

// check if process.env.SERVER_PRIVATE_KEY is set
if (!process.env.SERVER_PRIVATE_KEY) {
  throw new Error("process.env.SERVER_PRIVATE_KEY is not set");
}

const { getWalletAuthSig, ERC20 } = utilsPkg.default;

const serverAuthSig = await getWalletAuthSig({
  privateKey: process.env.SERVER_PRIVATE_KEY,
  chainId: 1,
});

const client = new LitJsSdk.LitNodeClient({
  litNetwork: "serrano",
  debug: true,
});

await client.connect();

const getCode = (fileName) => {
  return fs.readFileSync(
    path.join(`../../packages/lit-actions/src/publishable/${fileName}`),
    "utf8"
  );
};

// --------------------------------------------------
//          Lit Action: Get Execution Plan
// --------------------------------------------------
// const res = await client.executeJs({
//   targetNodeRange: 1,
//   authSig: serverAuthSig,
//   code: getCode("get-strategy-execution-plan.action.mjs"),
//   jsParams: {
//     portfolio: [
//       {
//         token: {
//           chainId: 137,
//           decimals: 18,
//           address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
//           symbol: "WMATIC",
//           name: "Wrapped Matic",
//         },
//         balance: 2.6989198489555926,
//         value: 3.2818865363300005,
//       },
//       {
//         token: {
//           chainId: 137,
//           decimals: 6,
//           address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
//           symbol: "USDC",
//           name: "USD//C",
//         },
//         balance: 7.491075,
//         value: 7.491075,
//       },
//     ],
//     strategy: [
//       { token: "USDC", percentage: 70 },
//       { token: "WMATIC", percentage: 30 },
//     ],
//   },
// });

// -----------------------------------------------
//          Lit Action: Get Token Price
// -----------------------------------------------
// example: https://lit.mypinata.cloud/ipfs/QmYiF3bqf4MvmGjgfP2v8b6mesUTjsZZXL7astJyH4qfom

// const res = await client.executeJs({
//   targetNodeRange: 1,
//   authSig: serverAuthSig,
//   code: getCode("get-token-price.action.mjs"),
//   jsParams: {
//     tokenSymbol: "ETH",
//   },
// });

console.log("res.response:", res.response);
