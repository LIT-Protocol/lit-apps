import * as Bull from "bull";
import { JsonRpcProvider } from "@ethersproject/providers";
import { ActionListener, BlockEventParams, JobFilter } from "../types";
import { moveQueue } from "../util/util-queue";
import { Logger } from "../util/util-log";

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

  getFilter(name: string): any {
    try {
      return this.filters.find((f: JobFilter) => f.name === name)?.filter;
    } catch (e) {
      throw Error("Cannot find filter");
    }
  }

  filters: Array<JobFilter> = [
    {
      name: "lessThanOrEqual",
      filter: (job: Bull.Job, eventParams: BlockEventParams) => {
        return (
          job.data.payload.eventParams.blockNumber <= eventParams.blockNumber
        );
      },
    },
  ];

  start(opts?: { beforeEnd?: () => any }) {
    const _opts = opts || {
      beforeEnd: null,
    };

    let blockEventProcessStarted = false;

    this.provider.on("block", async (blockNumber) => {
      // -- don't process if already processing
      if (blockEventProcessStarted) return;
      blockEventProcessStarted = true;

      // -- get all waiting jobs
      let waitingJobs = await this.waitingList.getWaiting();

      // -- filter jobs
      let filterdJobs = waitingJobs.filter((job) =>
        this.getFilter("lessThanOrEqual")(job, { blockNumber })
      );

      if (filterdJobs.length <= 0) {
        this.log.info(`No jobs found. Continue.`);
        blockEventProcessStarted = false;
        return;
      }

      this.log.warning(`Filterd jobs: ${filterdJobs.length}`);

      // -- log it
      this.log.info(
        `event:BlockEvent, block:${blockNumber}, waiting:${waitingJobs.length}, filtered:${filterdJobs.length}`
      );

      // -- move all waiting jobs to processing list
      await moveQueue({
        type: "waiting",
        from: this.waitingList,
        to: this.processList,
        filter: (job) =>
          this.getFilter("lessThanOrEqual")(job, { blockNumber }),
        debug: true,
      });

      // -- start processing
      blockEventProcessStarted = false;
    });

    this.processList.process(this.concurrency, function (job, done) {
      this.log.info(`processing job ${job.id}: ${JSON.stringify(job.data)}`);
      done();
    });

    // // blockEventWaitingList.process(10, function (job, done) {
    // //   console.log("processing job", job.data);
    // //   done();
    // // });

    if (_opts.beforeEnd) {
      _opts.beforeEnd();
    }
  }
}
