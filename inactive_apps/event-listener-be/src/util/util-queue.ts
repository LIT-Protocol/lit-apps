import { JobData } from "@lit-dev/utils";
import * as Bull from "bull";
import { Log } from "./util-log";

export const moveQueue = async ({
  from,
  to,
  type,
  debug = false,
  filter,
}: {
  from: Bull.Queue;
  to: Bull.Queue;
  type: Bull.JobStatus;
  debug?: boolean;
  filter?: (job: Bull.Job) => any;
}) => {
  let jobs: Array<Bull.Job> = [];

  if (!type) {
    throw new Error("type is required");
  }

  if (type === "waiting") {
    jobs = await from.getWaiting();
  }

  if (type === "active") {
    jobs = await from.getActive();
  }

  if (type === "completed") {
    jobs = await from.getCompleted();
  }

  if (type === "failed") {
    jobs = await from.getFailed();
  }

  if (type === "delayed") {
    jobs = await from.getDelayed();
  }

  if (filter) {
    try {
      jobs = jobs.filter(filter);
    } catch (e) {
      console.log(e.message);
      // swallow error
    }
  }

  // do a async for each
  jobs.forEach(async (job: Bull.Job) => {
    const jobData: JobData = job.data.jobData;

    if (debug) {
      Log.info(`[MoveQueue] ...adding ${job.data.name}`);
    }

    to.add(job.data);

    try {
      const waitingJob = await from.getJob(job.id);
      waitingJob?.remove();
      // Log.info(`[MoveQueue] ...removed it from ${from.name}`);
    } catch (e) {
      // swallow error
    }
  });

  Log.info(
    `[MoveQueue] moved ${jobs.length} jobs from ${from.name} to ${to.name}`
  );
};
