// import { describe, expect, test } from "@jest/globals";
// import { executeSwap, swapStubs, validateParams } from "./execute-swap";
// import { ethers } from "ethers";
// import { getServerAuthSig } from "@lit-dev/utils";

// describe("lit-actions", () => {
//   it("should pass", () => {
//     console.log("swapStubs:", swapStubs);
//     expect(true).toBe(true);
//   });

//   it("should swap", async () => {
//     const serverAuthSig = await getServerAuthSig({
//       privateKey: process.env.SERVER_PRIVATE_KEY,
//       chainId: 1,
//     });

//     const provider = new ethers.providers.JsonRpcProvider(
//       "https://polygon.llamarpc.com"
//     );

//     const res = await executeSwap({
//       tokenIn: swapStubs.tokenIn,
//       tokenOut: swapStubs.tokenOut,
//       pkp: {
//         publicKey:
//           "0499713b16636af841756431b73bd1a88d1837d110ae981ff3711c9239af95d8849b149fb6f2d46697b4d75c62ae4e63f8b8b941d4ca0a06a02b8b47d12f42b61d",
//       },
//       authSig: serverAuthSig,
//       amountToSell: "1",
//       provider,
//     });

//     console.log("res:", res);

//     expect(res).toBeDefined();
//   });
// });
