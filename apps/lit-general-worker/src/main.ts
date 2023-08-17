import express, { Express } from "express";
import bodyParser from "body-parser";
import { txHandler } from "./txHandler";
import { analyticsHandler } from "./analyticsHandler";

const app: Express = express();
app.use(bodyParser.json());
app.use(txHandler);
app.use(analyticsHandler);

const PORT: string | number = process.env.PORT || 3031;
app.listen(PORT, () => console.log("Lit General Worker " + PORT));
