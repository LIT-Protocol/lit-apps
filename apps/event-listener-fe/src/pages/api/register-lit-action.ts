// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Logger, uploadLitAction } from "@lit-dev/utils";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  data: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const log = new Logger();
  log.info("called => api/register-lit-action.ts");

  const result = await uploadLitAction({
    code: req.body,
    PINATA_API_KEY: process.env.PINATA_API_KEY,
    PINATA_SECRET_KEY: process.env.PINATA_SECRET_KEY,
  });

  res.status(result.status).json({
    data: {
      ...result.data,
      url: `https://lit.mypinata.cloud/ipfs/${result.data.IpfsHash}`,
    },
  });
}
