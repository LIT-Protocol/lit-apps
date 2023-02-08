import pinataSDK from "@pinata/sdk";
import { Readable } from "stream";
import { Response } from "./types";

const pinStringToIPFS = async (string: string, pinata: pinataSDK) => {
  let data: any;

  try {
    const buffer = Buffer.from(string, "utf8");
    const stream = Readable.from(buffer);

    // @ts-ignore
    stream.path = "string.txt";

    const res = await pinata.pinFileToIPFS(stream, {
      pinataMetadata: { name: "test" },
    });
    data = { status: 200, data: res };
  } catch (error) {
    data = { status: 500, data: error };
  }
  console.log(data);
  return data;
};

export const uploadLitAction = async ({
  code,
  PINATA_API_KEY,
  PINATA_SECRET_KEY,
}): Promise<Response> => {
  // if any of the required parameters are missing, throw an error
  if (!code || !PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error(
      `Missing required parameters. Make sure to add your code, PINATA_API_KEY, and PINATA_SECRET_KEY.`
    );
  }

  const pinata = new pinataSDK(PINATA_API_KEY, PINATA_SECRET_KEY);

  const result: Response = await pinStringToIPFS(code, pinata);

  return result;
};
