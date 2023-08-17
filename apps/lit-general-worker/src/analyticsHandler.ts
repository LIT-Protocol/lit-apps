import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import { Pool } from "pg";

const analyticsHandler: Express = express();
analyticsHandler.use(bodyParser.json());

// PostgreSQL connection
const pool: Pool = new Pool({
  connectionString: process.env.LIT_GENERAL_WORKER_DB,
  ssl: true,
});

interface AnalyticData {
  date: string;
  functionName: string;
  executionTime?: number;
}

// Create an array to store the data
const analyticData: AnalyticData[] = [];

// Create an endpoint to collect the data
analyticsHandler.post("/collect", (req: Request, res: Response) => {
  console.log("Collecting data...");

  const { date, functionName, executionTime } = req.body;
  if (!date || !functionName) {
    return res.status(400).json({
      success: false,
      message: "Date and function name are required.",
    });
  }
  analyticData.push({ date, functionName, executionTime });
  res.json({ success: true, message: "Data collected." });
});

// Create an endpoint to retrieve the data
analyticsHandler.get("/retrieve", (req: Request, res: Response) => {
  console.log("Retrieving data...");

  const result = analyticData.reduce((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = {};
    }
    if (!acc[item.date][item.functionName]) {
      acc[item.date][item.functionName] = 0;
    }
    acc[item.date][item.functionName]++;
    return acc;
  }, {});

  res.json({ success: true, data: result });
});

// Function to submit the analytic data to the database
async function submitDataToDatabase() {
  console.log(
    new Date().toISOString() + " - Submitting data to the database..."
  );

  for (const item of analyticData) {
    const query =
      "INSERT INTO analytics(date, function_name, execution_time) VALUES($1, $2, $3)";
    const values = [item.date, item.functionName, item.executionTime];
    try {
      await pool.query(query, values);
    } catch (error) {
      console.error("Error submitting data to the database:", error);
    }
  }

  // Clear the array
}

// submit every 30 seconds
// setInterval(submitDataToDatabase, 30 * 1000);

// Set an interval to submit the data to the database every 10 minutes
setInterval(submitDataToDatabase, 10 * 60 * 1000);

export { analyticsHandler };
