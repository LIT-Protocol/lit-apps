import bodyParser from "body-parser";
import cors from "cors";
import express, { Express, Request, Response, NextFunction } from "express";
import { contractsHandler } from "./handlers/contracts-handler/contractsHandler";
import { rateLimit } from "express-rate-limit";

const getClientIp = (req: Request): string => {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string") {
    // Get the first IP in the list (client's original IP)
    return forwardedFor.split(",")[0].trim();
  }
  return req.ip || "Unknown";
};

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 60, // Limit each IP to 60 requests per `window` (here, per 1 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
  handler: (req, res) => {
    const clientIP = getClientIp(req);
    // ❗️ Too many requests from string 199.212.41.25, 10.213.41.231

    console.log(`❗️ Too many requests from ${typeof clientIP} ${clientIP}`);

    res
      .status(429)
      .send(
        "Too many requests, please try again later. For uninterrupted use, please use SDK version 6.30 and above."
      );
  },
});

const app: Express = express();

// Load banned IPs from environment variable
const bannedIPsEnv = process.env.BANNED_IPS || "";
let bannedIPs: Set<string> = new Set(
  bannedIPsEnv
    .split(",")
    .map((ip) => ip.trim())
    .filter((ip) => ip !== "")
);

console.log(`Loaded ${bannedIPs.size} banned IPs`);

// Middleware to check for banned IPs
const checkBannedIP = (req: Request, res: Response, next: NextFunction) => {
  const clientIP = getClientIp(req);
  if (bannedIPs.has(clientIP)) {
    console.log(`❗️Blocked request from banned IP: ${clientIP}`);
    return res.status(403).send("Access Denied");
  }
  next();
};
const blockSyntheticMonitoringAgent = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userAgent = req.headers["user-agent"] || "";
  if (userAgent.includes("synthetic-monitoring-agent")) {
    console.log(
      `❗️Blocked request from synthetic monitoring agent: ${userAgent}`
    );
    return res.status(403).send("Access Denied");
  }
  next();
};

app.use(blockSyntheticMonitoringAgent);
app.use(checkBannedIP);
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
