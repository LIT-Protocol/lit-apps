import * as Bull from "bull";
import { JsonRpcProvider } from "@ethersproject/providers";
import { ActionListener, JobFilter } from "../types";
import { moveQueue } from "../util/util-queue";
import { Logger } from "../util/util-log";
import { BlockEventRequirements, JobData } from "@lit-dev/utils";

export class BlockListener implements ActionListener {
  provider: JsonRpcProvider;
  waitingList: Bull.Queue;
  processList: Bull.Queue;
  rpcUrl: string;
  log: Logger;
  logPrefix: string;
  concurrency: number;

  constructor(args?: {
    waitingList: Bull.Queue;
    processList: Bull.Queue;
    rpcUrl?: string;
    logPrefix?: string;
    concurrency?: number;
  }) {
    const _args = args || {
      waitingList: null,
      processList: null,
      rpcUrl: null,
      logPrefix: null,
      concurrency: null,
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
      this.rpcUrl = "https://rpc-mumbai.maticvigil.com";
    }

    this.provider = new JsonRpcProvider(_args.rpcUrl ?? this.rpcUrl);
    this.waitingList = _args.waitingList;
    this.processList = _args.processList;
  }

  start(opts?: { beforeEnd?: () => any }) {
    const _opts = opts || {
      beforeEnd: null,
    };

    const waitingList = this.waitingList;
    const provider = this.provider;

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

      // this.processList.process(this.concurrency, function (job, done) {
      //   console.log("processing job", job.data.jobData);
      //   // done();
      // });
    });

    // ---------------------------------------------------------------------------------------
    //          Proceed to execute jobs when they have been moved from waiting list
    // ---------------------------------------------------------------------------------------
    // this.processList.process(this.concurrency, function (job, done) {
    //   this.log.info(`processing job ${job.id}: ${JSON.stringify(job.data)}`);

    //   // calling done signals that the job is completed
    //   // done();
    // });
    this.processList.process(this.concurrency, function (job: Bull.Job, done) {
      const jobData: JobData = job.data.jobData;
      const jobName: string = job.data.name;

      const log = new Logger(`[Process Job ID:${job.id}]`);
      log.info(`Job Name: ${jobName}`);

      // get block number
      provider.getBlockNumber().then((BLOCK_NUMBER) => {
        log.info(`Current Block Number: ${BLOCK_NUMBER}`);

        const requirements = new BlockEventRequirements(
          jobData.eventParams,
          BLOCK_NUMBER
        );
        const metConditions = requirements
          .is("CURRENT_BLOCK_GREATER_THAN_START_BLOCK")
          .is("CURRENT_BLOCK_LESS_THAN_END_BLOCK");

        // if the condition is still met, then re-add the job back to waiting list
        // if the conditions are not met, then we will not add it back to the waiting list
        if (metConditions.result) {
          log.warning(
            "Conditions are still met, moving job back to waiting list"
          );
          waitingList.add(job.data);
        }
      });

      // done anyway, cus this particular job is done
      done();
    });

    if (_opts.beforeEnd) {
      _opts.beforeEnd();
    }
  }
}
