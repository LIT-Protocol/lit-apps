import bodyParser from "body-parser";
import cors from "cors";
import express, { Express } from "express";
import { contractsHandler } from "./handlers/contracts-handler/contractsHandler";
import { rateLimit } from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 60, // Limit each IP to 60 requests per `window` (here, per 1 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
  handler: (req, res) => {
    console.log(`❗️ Too many requests from ${req.ip}`);
    res
      .status(429)
      .send(
        "Too many requests, please try again later. For uninterrupted use, please use SDK version 6.30 and above."
      );
  },
});

const app: Express = express();
app.use(bodyParser.json());
app.use(limiter);

const blacklist = (process.env.CORS_BLACKLIST || "").split(",");

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || blacklist.indexOf(origin) === -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions));
app.use(contractsHandler);

const PORT: string | number = process.env.PORT || 3031;
app.listen(PORT, () => console.log("Lit General Worker " + PORT));
