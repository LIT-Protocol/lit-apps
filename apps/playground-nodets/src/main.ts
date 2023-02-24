import * as LitJsSdk from "@lit-protocol/lit-node-client";
import fs from "fs";

// read the file
const code = fs.readFileSync(
  "../../packages/lit-actions/src/to-be-converted/wip-swap.action.mjs",
  "utf8"
);

// adding a new function in rust
// 1. declare your javascript function in 02_litActionsSDK.js
// 2. bind the function in src/functions/bindings.rs (see op_get_gas_price)
// 3. bind it to js_runtime in src/functions/js_runtime.rs (see op_get_gas_price)

(async () => {
  const client = new LitJsSdk.LitNodeClient({
    litNetwork: "custom",
    bootstrapUrls: [
      "http://0.0.0.0:7470",
      "http://0.0.0.0:7471",
      "http://0.0.0.0:7472",
      "http://0.0.0.0:7473",
      "http://0.0.0.0:7474",
      "http://0.0.0.0:7475",
      "http://0.0.0.0:7476",
      "http://0.0.0.0:7477",
      "http://0.0.0.0:7478",
      "http://0.0.0.0:7479",
    ],
    debug: false,
  });

  await client.connect();

  const RPC_URL = "https://rpc-mainnet.maticvigil.com";
  const WALLET_ADDRESS = "0x8A82174Ff0dCAE1cD02474f10143ee0d834c2b26";
  const TOKEN_IN_ADDRESS = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
  const authSig = {
    sig: "0x76275fc6949feed26015659fe5e949126c65e476c4d68838eb35e9fa5d2303ec5dfce3aeb3a551b5911a0ccfc957124726af028d904f699ef66627cadd0e15a51c",
    derivedVia: "web3.eth.personal.sign",
    signedMessage:
      "demo-encrypt-decrypt-react.vercel.app wants you to sign in with your Ethereum account:\n0x3B5dD260598B7579A0b015A1F3BBF322aDC499A1\n\n\nURI: https://demo-encrypt-decrypt-react.vercel.app/\nVersion: 1\nChain ID: 1\nNonce: 8uG5AhioZlmcX8Q0x\nIssued At: 2023-02-23T19:12:06.887Z\nExpiration Time: 2023-03-02T19:12:06.874Z",
    address: "0x3b5dd260598b7579a0b015a1f3bbf322adc499a1",
  };

  // ------------------------------
  //          Lit Action
  // ------------------------------
  console.log("\x1b[33m%s\x1b[0m", "[Lit Actions] Results:");
  const res = await client.executeJs({
    targetNodeRange: 1,
    authSig,
    code,
    jsParams: {
      RPC_URL,
      WALLET_ADDRESS,
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
      PKP_PUBLIC_KEY:
        "0x043dc9883e112faf8320a539d30661b03fbf38766463a580cc7ace19f23bdb221bc56cb7669ff9529522c7288a37a7b8e0baaea029f2a9cce0690fcb8110413a00",
      SWAP_ROUTER_ADDRESS: "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45",
    },
  });

  console.log(res.response);
})();
