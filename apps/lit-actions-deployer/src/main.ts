import { uploadLitAction } from "@lit-dev/utils";
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();

app.use(express.json());

app.post("/", async (req: Request, res: Response) => {
  console.log("Received data:", req.body);

  const { code } = req.body;

  const uploadRes = await uploadLitAction({
    code,
    PINATA_API_KEY: process.env.PINATA_API_KEY,
    PINATA_SECRET_KEY: process.env.PINATA_SECRET_KEY,
  });

  res.json({ res: uploadRes });
});

app.listen(3003, () => {
  console.log("LitActions Deployer listening on port 3003!");
});