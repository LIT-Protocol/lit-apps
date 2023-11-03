import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import { Pool } from "pg";

const e2eStatusHandler: Express = express();
e2eStatusHandler.use(bodyParser.json());
