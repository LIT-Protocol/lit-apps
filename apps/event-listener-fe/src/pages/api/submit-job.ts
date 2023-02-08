import { BlockEventParams, JobData, Logger, TokenInfo } from "@lit-dev/utils";
import type { NextApiRequest, NextApiResponse } from "next";
import Queue from "bull";
import { JsonRpcProvider } from "@ethersproject/providers";

const blockEventWaitingList = new Queue("blockEventWaitingList", {
  redis: {
    host: process.env.REDIS_HOST as unknown as string,
    port: process.env.REDIS_PORT as unknown as number,
  },
});

const blockEventProcessingList = new Queue("blockEventProcessingList", {
  redis: {
    host: process.env.REDIS_HOST as unknown as string,
    port: process.env.REDIS_PORT as unknown as number,
  },
});

type Data = {
  data: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const log = new Logger();
  log.info("called => api/submit-job.ts");

  const jobData: JobData = req.body;

  const {
    ownerAddress,
    pkpInfo,
    eventType,
    ipfsId,
    jsParams,
    eventParams,
  }: JobData = jobData;

  // ---------------------------------------
  //          Validate Event Type
  // ---------------------------------------
  // FIXME: event type must be 'block' only for now
  if (eventType !== "block") {
    res.status(500).json({
      data: {
        message: 'only "block" event is supported for now',
      },
    });
    return;
  }

  let _eventParams;

  // -----------------------------------------------------
  //          Validate Owner Address & PKP Info
  // -----------------------------------------------------
  if (!ownerAddress || !pkpInfo) {
    let message = "";

    // check which one is missing add concat to message

    if (!ownerAddress) {
      message += "ownerAddress is missing";

      if (!pkpInfo) {
        message += " and ";
      }
    }

    if (!pkpInfo) {
      message += "pkpInfo is missing";
    }

    res.status(500).json({
      data: {
        message: message,
      },
    });
    return;
  }

  // -----------------------------------------------
  //          Validate Block Event Params
  // -----------------------------------------------
  if (eventType === "block") {
    _eventParams = eventParams as BlockEventParams;

    // -- param guards
    if (!_eventParams.startBlock || !_eventParams.endBlock) {
      let message = "";

      // check which one is missing add concat to message

      if (!_eventParams.startBlock) {
        message += "startBlock is missing";

        if (!_eventParams.endBlock) {
          message += " and ";
        }
      }

      if (!_eventParams.endBlock) {
        message += "endBlock is missing";
      }

      res.status(500).json({
        data: {
          message: message,
        },
      });
      return;
    }

    // -- check block number
    const provider = new JsonRpcProvider("https://rpc-mumbai.maticvigil.com");

    const blockNumber = await provider.getBlockNumber();

    if (_eventParams.startBlock <= blockNumber) {
      res.status(500).json({
        data: {
          message: `startBlock ${_eventParams.startBlock} must be greater than current block number ${blockNumber}`,
        },
      });
      return;
    }

    // end block must be greater than start block
    if (_eventParams.endBlock <= _eventParams.startBlock) {
      res.status(500).json({
        data: {
          message: `endBlock ${_eventParams.endBlock} must be greater than startBlock ${_eventParams.startBlock}`,
        },
      });
      return;
    }
  }

  // -----------------------------------------
  //          Get the correct queue
  // -----------------------------------------
  let waitingList: Queue.Queue;

  if (eventType === "block") {
    waitingList = blockEventWaitingList;
  } else {
    res.status(500).json({
      data: {
        message: "invalid event type to get the correct queue",
      },
    });
    return;
  }

  // --------------------------------------------
  //          All good - rock and roll
  // --------------------------------------------
  // log.info(`
  //   ipfsId: ${ipfsId}
  //   jsParams: ${jsParams}
  //   eventType: ${eventType}
  //   eventParams: ${JSON.stringify(_eventParams)}
  // `);

  // ---------------------------
  //          Set Ids
  // ---------------------------
  // a combination of owner address, pkp tokenId, event type, ipfsId
  const jobId = `${ownerAddress}-${pkpInfo.tokenId}-${eventType}-${ipfsId}`;

  //  reset
  // clear queue
  // await blockEventWaitingList.empty();
  // await blockEventProcessingList.empty();

  // ---------------------------------------------------
  //          Add to Block Event Waiting List
  // ---------------------------------------------------
  let job;

  try {
    job = await waitingList.add({
      name: jobId,
      jobData,
    });
    log.info(`waiting job id: ${job.id}`);
  } catch (e: any) {
    console.log("error", e);
    res.status(500).json({
      data: {
        message: e.message,
      },
    });
    return;
  }

  // get all jobs

  log.info(
    `Total Waiting Jobs: ${await blockEventWaitingList.getWaitingCount()}`
  );
  log.info(
    `Total Processing Jobs: ${await blockEventProcessingList.getWaitingCount()}`
  );

  log.info(jobId);

  res.status(200).json({
    data: {
      message: "Hello World",
    },
  });
}
