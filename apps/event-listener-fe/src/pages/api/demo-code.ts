// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Logger, uploadLitAction } from "@lit-dev/utils";
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";

type Data = {
  code: any;
  jsParams: any;
};

type Error = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | Error>
) {
  const log = new Logger();
  log.info("called => demo-code.ts");

  const fileName = req.body.fileName ?? "get-price";

  try {
    const code = fs.readFileSync(
      `${process.cwd()}/src/demos/${fileName}.js`,
      "utf8"
    );

    const jsParams = fs.readFileSync(
      `${process.cwd()}/src/demos/${fileName}.json`,
      "utf8"
    );

    res.status(200).json({ code, jsParams });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
}
