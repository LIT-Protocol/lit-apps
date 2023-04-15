import * as Bull from "bull";
import { JsonRpcProvider } from "@ethersproject/providers";
import { ActionListener } from "../types";
import { moveQueue } from "../util/util-queue";
import { Logger } from "../util/util-log";
import {
  BlockEventRequirements,
  JobData,
  runBalancePortfolio,
} from "@lit-dev/utils";
import { LitNodeClient } from "@lit-protocol/lit-node-client";

export class BlockListener implements ActionListener {
  provider: JsonRpcProvider;
  waitingList: Bull.Queue;
  processList: Bull.Queue;
  rpcUrl: string;
  log: Logger;
  logPrefix: string;
  concurrency: number;
  litNodeClient: LitNodeClient;
  serverAuthSig: any;

  constructor(args?: {
    waitingList: Bull.Queue;
    processList: Bull.Queue;
    rpcUrl?: string;
    logPrefix?: string;
    concurrency?: number;
    litNodeClient: LitNodeClient;
    serverAuthSig: any;
  }) {
    const _args = args || {
      waitingList: null,
      processList: null,
      rpcUrl: null,
      logPrefix: null,
      concurrency: null,
      litNodeClient: null,
      serverAuthSig: null,
    };

    this.log = new Logger(_args.logPrefix ?? "[BlockEvent]");

    if (!_args.concurrency) {
      this.concurrency = 2;
    }

    if (!_args.waitingList || !_args.processList) {
      this.log.error("Waiting list and process list cannot be empty");
      return;
    }

    if (!_args.rpcUrl) {
      this.rpcUrl = "https://lit-protocol.calderachain.xyz/http";
    }

    this.provider = new JsonRpcProvider(_args.rpcUrl ?? this.rpcUrl);
    this.waitingList = _args.waitingList;
    this.processList = _args.processList;
    this.litNodeClient = _args.litNodeClient;
    this.serverAuthSig = _args.serverAuthSig;
  }

  start(opts?: { beforeEnd?: () => any }) {
    const _opts = opts || {
      beforeEnd: null,
    };

    const waitingList = this.waitingList;
    const provider = this.provider;
    const litNodeClient = this.litNodeClient;
    const serverAuthSig = this.serverAuthSig;

    let blockEventProcessStarted = false;

    this.provider.on("block", async (blockNumber) => {
      // -------------------------------------------------
      //          Values that you check against
      // -------------------------------------------------
      const BLOCK_NUMBER = blockNumber;

      // -- don't process if already processing
      if (blockEventProcessStarted) return;
      blockEventProcessStarted = true;

      // -- get all waiting jobs
      let waitingJobs = await this.waitingList.getWaiting();

      // -- get counts
      let waitingJobsCount = await this.waitingList.count();

      // -- set requirement filter
      const requirement = (job: Bull.Job) => {
        const jobData = job.data.jobData as JobData;

        const requirements = new BlockEventRequirements(
          jobData.eventParams,
          BLOCK_NUMBER
        );

        return requirements
          .is("CURRENT_BLOCK_GREATER_THAN_START_BLOCK")
          .is("CURRENT_BLOCK_LESS_THAN_END_BLOCK").result;
      };

      // -- filter jobs that meets the condition
      let filterdJobs = waitingJobs.filter(requirement);

      if (filterdJobs.length <= 0) {
        this.log.info(
          `[${BLOCK_NUMBER}] No jobs were found that met the conditions, but there are ${waitingJobsCount} on the waiting list. Continue...`
        );
        blockEventProcessStarted = false;
        return;
      }

      this.log.warning(`Filterd jobs: ${filterdJobs.length}`);

      // -- log it
      this.log.info(
        `event:BlockEvent, block:${BLOCK_NUMBER}, waiting:${waitingJobs.length}, filtered:${filterdJobs.length}`
      );

      // -- move all waiting jobs to processing list
      await moveQueue({
        type: "waiting",
        from: this.waitingList,
        to: this.processList,
        filter: requirement,
        debug: true,
      });

      // -- start processing
      blockEventProcessStarted = false;
    });

    // ---------------------------------------------------------------------------------------
    //          Proceed to execute jobs when they have been moved from waiting list
    // ---------------------------------------------------------------------------------------

    this.processList.process(
      this.concurrency,
      async function (job: Bull.Job, done) {
        const jobData: JobData = job.data.jobData;
        const jobName: string = job.data.name;

        const log = new Logger(`[Process Job ID:${job.id}]`);
        log.info(`Job Name: ${jobName}`);

        // FIXME: refactor this
        const isRebalancer = jobName.toLowerCase().includes("mock_rebalancer");

        if (isRebalancer) {
          log.warning(`Rebalancer job detected, using custom logic`);
          const ipfsId = jobData.ipfsId.split("-")[1];
          log.warning(`ipfsId: ${ipfsId}`);

          if (typeof jobData.jsParams === "string") {
            jobData.jsParams = JSON.parse(jobData.jsParams);
          }

          try {
            // execute task
            let res = await litNodeClient.executeJs({
              ipfsId,
              authSig: serverAuthSig,
              jsParams: {
                publicKey: (jobData.jsParams as any).pkpPublicKey,
                toSign: [1, 2, 3, 4, 5],
                sigName: "portfolio-rebalancer-test",
                ...(jobData.jsParams as Object),
              },
            });

            log.info(`Result: ${JSON.stringify(res)}`);

            try {
              const rebalance = await runBalancePortfolio(
                jobData.jsParams as any,
                serverAuthSig,
                ipfsId
              );

              log.info(`Rebalance result: ${JSON.stringify(rebalance)}`);
            } catch (e) {
              log.error(`Error: ${e.message}`);
            }
          } catch (e) {
            log.error(`Error: ${e.message}`);
          }

          // return done();
        } else {
          try {
            // execute task
            let res = await litNodeClient.executeJs({
              targetNodeRange: 1,
              ipfsId: jobData.ipfsId,
              authSig: serverAuthSig,
              jsParams: JSON.parse(jobData.jsParams),
            });

            log.info(`Result: ${JSON.stringify(res)}`);
          } catch (e) {
            log.error(`Error: ${e.message}`);
          }
        }

        // get block number
        let currentBlockNumber;

        try {
          currentBlockNumber = await provider.getBlockNumber();
        } catch (e) {
          log.error(`Error getting block number: ${e.message}`);
          return done();
        }

        log.info(`Current Block Number: ${currentBlockNumber}`);

        const requirements = new BlockEventRequirements(
          jobData.eventParams,
          currentBlockNumber
        );
        const metConditions = requirements
          .is("CURRENT_BLOCK_GREATER_THAN_START_BLOCK")
          .is("CURRENT_BLOCK_LESS_THAN_END_BLOCK");

        // if the condition is still met, then re-add the job back to waiting list
        // if the conditions are not met, then we will not add it back to the waiting list
        if (metConditions.result) {
          log.info("Conditions are still met, moving job back to waiting list");
          log.info(
            `Event Params: ${JSON.stringify(job.data.jobData.eventParams)}`
          );
          waitingList.add(job.data);
        }

        // done anyway, cus this particular job is done, new job is added back to waiting list
        done();
      }
    );

    if (_opts.beforeEnd) {
      _opts.beforeEnd();
    }
  }
}
