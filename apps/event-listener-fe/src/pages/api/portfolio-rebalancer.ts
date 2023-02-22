import { getWalletAuthSig, Logger } from "@lit-dev/utils";
import type { NextApiRequest, NextApiResponse } from "next";

import { runBalancePortfolio } from "@lit-dev/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const log = new Logger();
  log.info("called => portfolio-rebalancer.ts");

  const params = req.body;

  let jsParams = params.jsParams;

  if (!jsParams) {
    res.status(500).json({
      data: {
        message: "jsParams is missing",
      },
    });
    return;
  }

  // check if jsParams is valid json
  try {
    jsParams = JSON.parse(jsParams);
  } catch (e) {
    res.status(500).json({
      data: {
        message: "jsParams is not valid json",
      },
    });
    return;
  }

  // get server auth sig
  const privateKey = process.env.SERVER_PRIVATE_KEY;

  if (!privateKey) {
    res.status(500).json({
      data: {
        message: "SERVER_PRIVATE_KEY is missing",
      },
    });
    return;
  }

  let serverAuthSig;

  try {
    serverAuthSig = await getWalletAuthSig({
      privateKey,
      chainId: 1,
    });
  } catch (e) {
    res.status(500).json({
      data: {
        message: "getWalletAuthSig failed",
      },
    });
    return;
  }

  // try to run rebalance
  let rebalance;
  // try {
  //   rebalance = await runBalancePortfolio(jsParams, serverAuthSig);
  // } catch (e) {
  //   res.status(500).json({
  //     data: {
  //       message: "rebalance failed",
  //     },
  //   });
  //   return;
  // }

  res.status(200).json({ data: { rebalance } });
}
