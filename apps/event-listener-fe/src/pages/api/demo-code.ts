// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Logger, uploadLitAction } from "@lit-dev/utils";
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";

type Data = {
  code: any;
  jsParams: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const log = new Logger();
  log.info("called => demo-code.ts");

  const code = fs.readFileSync(
    `${process.cwd()}/src/demos/get-price.js`,
    "utf8"
  );

  const jsParams = fs.readFileSync(
    `${process.cwd()}/src/demos/get-price.json`,
    "utf8"
  );

  res.status(200).json({ code, jsParams });
}
