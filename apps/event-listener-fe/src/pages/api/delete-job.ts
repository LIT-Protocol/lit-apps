// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Logger } from "@lit-dev/utils";
import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import { redisConfig } from "@lit-dev/utils/src/redisConfig";

import Queue from "bull";
const blockEventWaitingList = new Queue("blockEventWaitingList", {
  redis: redisConfig(),
});

const blockEventProcessingList = new Queue("blockEventProcessingList", {
  redis: redisConfig(),
});

type Error = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any | Error>
) {
  const log = new Logger();
  log.info("called => delete-job.ts");

  const { jobId, signature, address } = req.body;

  if (!jobId || !signature || !address) {
    const errors = [];
    if (!jobId) {
      errors.push("jobId is required");
    }
    if (!signature) {
      errors.push("signature is required");
    }
    if (!address) {
      errors.push("address is required");
    }

    res.status(500).json({
      message: errors.join(", "),
    });

    return;
  }

  const message = `Delete job id: ${jobId}`;
  console.log("jobid:", jobId);

  // convert message to hash
  const messageHash = ethers.utils.hashMessage(message);
  const recoveredAddress = ethers.utils.recoverAddress(messageHash, signature);

  if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
    console.log("Valid signature - message was signed by the registered user");

    // find and delete job
    const jobs = await blockEventWaitingList.getJobs(["waiting", "active"]);

    const job = jobs.find((item: any) => item.id === jobId);

    await job?.remove();

    res.status(200).json({
      message: `${jobId} deleted successfully`,
    });
  } else {
    console.log(
      "Invalid signature - message was not signed by the registered user"
    );

    res.status(500).json({
      message:
        "Invalid signature - message was not signed by the registered user",
    });
  }
  res.status(500).json({
    message: "not implemented",
  });
}
