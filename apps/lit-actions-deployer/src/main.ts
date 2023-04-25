import { uploadLitAction } from "@lit-dev/utils";
import express, { Express, Request, Response } from "express";
import rateLimit from "express-rate-limit"; // Import the express-rate-limit middleware
import dotenv from "dotenv";

const PORT = process.env.PORT || 3000;

dotenv.config();

const app: Express = express();

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

app.use(express.json());
app.use(apiLimiter); // Use the rate-limiting middleware

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

app.listen(PORT, () => {
  console.log(`LitActions Deployer listening on port ${PORT}!`);
});
