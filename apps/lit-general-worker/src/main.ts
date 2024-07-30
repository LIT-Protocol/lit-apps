import bodyParser from "body-parser";
import cors from "cors";
import express, { Express } from "express";
import { contractsHandler } from "./handlers/contracts-handler/contractsHandler";
import { rateLimit } from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
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
