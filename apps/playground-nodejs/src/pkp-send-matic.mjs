import * as utilsPkg from "@lit-dev/utils";
import { PKPWallet } from "@lit-protocol/pkp-ethers.js-node";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { getArgs, greenLog, redLog } from "@lit-dev/tools";
import { exit } from "process";
import { computeAddress } from "ethers/lib/utils";

dotenv.config({
  path: "../../.env",
});

const args = getArgs();

let AMOUNT_TO_SEND = args[0]; // in base value eg. matic
const OPT = args[1];

// --------------------------
//          Checks
// --------------------------w
// check if required env vars are set
if (!process.env.SERVER_PRIVATE_KEY) {
  redLog("SERVER_PRIVATE_KEY env var not set");
  exit();
}

if (!process.env.PKP_PUBLIC_KEY) {
  redLog("PKP_PUBLIC_KEY env var not set");
  exit();
}

if (!process.env.RECIPENT_ADDRESS) {
  redLog("RECIPENT_ADDRESS env var not set");
  exit();
}

if (!AMOUNT_TO_SEND || AMOUNT_TO_SEND === "" || isNaN(AMOUNT_TO_SEND)) {
  redLog("argument { AMOUNT_TO_SEND } is required and must be a number");
  exit();
}

// -------------------------
//          Start
// -------------------------

const decimals = await utilsPkg.default.ERC20.getDecimals(
  process.env.MATIC_NATIVE_ADDRESS,
  new ethers.providers.JsonRpcProvider(process.env.MATIC_RPC)
);

// convert matic to wei
AMOUNT_TO_SEND = ethers.utils.parseUnits(AMOUNT_TO_SEND, decimals);

// convert wei to matic
const AMOUNT_READABLE = ethers.utils.formatUnits(AMOUNT_TO_SEND, decimals);

// get unit

// -- Get Auth Sig
const authSig = await utilsPkg.default.getWalletAuthSig({
  privateKey: process.env.SERVER_PRIVATE_KEY,
  chainId: 137,
});

const pkpWallet = new PKPWallet({
  pkpPubKey: process.env.PKP_PUBLIC_KEY,
  controllerAuthSig: authSig,
  provider: process.env.MATIC_RPC,
});

await pkpWallet.init();

const tx = {
  to: process.env.RECIPENT_ADDRESS,
  value: AMOUNT_TO_SEND,
};

// -- Sign Transaction
const signedTx = await pkpWallet.signTransaction(tx);
console.log("signedTx:", signedTx);

// -- Send Transaction
if (OPT !== "--send") {
  greenLog(
    `
    -------------------------------------------------------------------------
                 This is a dry run, use '--send' to send a tx
       turbo dev --filter playground-nodejs -- pkp-send-matic.mjs 1 --send                                    
    -------------------------------------------------------------------------
    
    Sending ${AMOUNT_READABLE} MATIC to ${process.env.RECIPENT_ADDRESS}

    `,
    true
  );
  exit();
}
greenLog(`Sending ${AMOUNT_READABLE} MATIC to ${process.env.RECIPENT_ADDRESS}`);

try {
  const sentTx = await pkpWallet.sendTransaction(signedTx);
  console.log("sentTx:", sentTx);
  sentTx.wait();
  greenLog(
    `Transaction sent! View your tx here: https://polygonscan.com/tx/${sentTx.hash}`
  );
  console.log(sentTx);
} catch (e) {
  redLog(e);

  if (e.code === "INSUFFICIENT_FUNDS") {
    redLog("Insufficient funds, try a smaller amount");

    const yourBalance = await utilsPkg.default.ERC20.getBalance(
      process.env.MATIC_NATIVE_ADDRESS,
      new ethers.providers.JsonRpcProvider(process.env.MATIC_RPC),
      computeAddress(process.env.PKP_PUBLIC_KEY)
    );

    const yourBalanceReadable = ethers.utils.formatUnits(yourBalance, decimals);

    redLog(`Your PKP balance is ${yourBalanceReadable} MATIC`);
  }
}
