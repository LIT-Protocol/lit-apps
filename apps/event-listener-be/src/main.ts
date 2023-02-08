import Queue from "bull";

import { BlockListener } from "./listeners/block-listener";
// import { mockAddBlockJobs } from "./mock/mock-add-block-jobs";
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { getWalletAuthSig, Logger } from "@lit-dev/utils";
import * as dotenv from "dotenv";

dotenv.config();

const litNodeClient = new LitJsSdk.LitNodeClient({
  litNetwork: "serrano",
  debug: false,
});

const log = new Logger("[Main]");

const bootstrap = async () => {
  log.warning(`Bootstrapping...`);

  await litNodeClient.connect();
  log.warning(`LitNodeClient connected`);

  const serverAuthSig = await getWalletAuthSig({
    privateKey: process.env.SERVER_PRIVATE_KEY,
    chainId: 80001,
  });
  log.warning(`Server AuthSig generated`);

  const blockListener = new BlockListener({
    waitingList: new Queue("blockEventWaitingList"),
    processList: new Queue("blockEventProcessingList"),
    litNodeClient,
    serverAuthSig,
  });

  blockListener.start({
    // beforeEnd: () => {
    //   mockAddBlockJobs(30304200, 5000, 10);
    // },
  });
};

bootstrap();
