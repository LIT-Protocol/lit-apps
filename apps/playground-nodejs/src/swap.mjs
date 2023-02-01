import * as litActionPkg from "@lit-dev/lit-actions";
import { ethers } from "ethers";
import * as utilsPkg from "@lit-dev/utils";
import * as dotenv from "dotenv";

dotenv.config();

const { getWalletAuthSig } = utilsPkg.default;
const { executeSwap, swapStubs, validateParams } = litActionPkg.default;

const serverAuthSig = await getWalletAuthSig({
  privateKey: process.env.SERVER_PRIVATE_KEY,
  chainId: 1,
});

const res = await executeSwap({
  jsParams: {
    authSig: serverAuthSig,
    rpcUrl: "https://polygon.llamarpc.com",
    chain: "matic",
    tokenIn: swapStubs.wmatic,
    tokenOut: swapStubs.usdc,
    pkp: {
      publicKey:
        "0499713b16636af841756431b73bd1a88d1837d110ae981ff3711c9239af95d8849b149fb6f2d46697b4d75c62ae4e63f8b8b941d4ca0a06a02b8b47d12f42b61d",
    },
    amountToSell: "0.1",
  },
});

console.log("res:", res);
