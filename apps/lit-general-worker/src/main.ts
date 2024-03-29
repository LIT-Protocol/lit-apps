import express, { Express } from "express";
import bodyParser from "body-parser";
import { txHandler } from "./handlers/txHandler";
import { analyticsHandler } from "./handlers/analyticsHandler";
import { contractsHandler } from "./handlers/contracts-handler/contractsHandler";
import cors from "cors";

const app: Express = express();
app.use(bodyParser.json());

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
app.use(txHandler);
app.use(analyticsHandler);

const PORT: string | number = process.env.PORT || 3031;
app.listen(PORT, () => console.log("Lit General Worker " + PORT));
