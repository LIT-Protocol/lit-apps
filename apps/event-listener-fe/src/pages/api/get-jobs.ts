import { Logger } from "@lit-dev/utils";
import type { NextApiRequest, NextApiResponse } from "next";
import Queue from "bull";
import { redisConfig } from "@lit-dev/utils/src/redisConfig";

const blockEventWaitingList = new Queue("blockEventWaitingList", {
  redis: redisConfig(),
});

const blockEventProcessingList = new Queue("blockEventProcessingList", {
  redis: redisConfig(),
});

type Data = {
  data: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const log = new Logger();
  log.info("called => api/get-jobs.ts");

  //   test redis connection

  const searchTerm = "0x3B5dD260598B7579A0b015A1F3BBF322aDC499A1";

  const blockEventWaitingJobs = await blockEventWaitingList.getJobs([
    "waiting",
    "active",
  ]);

  const blockEventProcessingJobs = await blockEventProcessingList.getJobs([
    "waiting",
    "active",
  ]);

  const blockEventProgressCompletedJobs =
    await blockEventProcessingList.getJobs(["completed"]);

  const filteredBlockEventWaitingJobs = blockEventWaitingJobs.filter(
    (item: any) => item.data.name.includes(searchTerm)
  );

  const filteredBlockEventProcessingJobs = blockEventProcessingJobs.filter(
    (item: any) => item.data.name.includes(searchTerm)
  );

  const filteredBlockEventProgressCompletedJobs =
    blockEventProgressCompletedJobs.filter((item: any) => {
      try {
        const data = item.data.name.includes(searchTerm);
        return data;
      } catch (e) {
        //
      }
    });

  res.status(200).json({
    data: {
      waitingJobs: filteredBlockEventWaitingJobs,
      processingJobs: filteredBlockEventProcessingJobs,
      completedJobs: filteredBlockEventProgressCompletedJobs,
    },
  });
}
