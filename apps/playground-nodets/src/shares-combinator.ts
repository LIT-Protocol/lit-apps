import express, { Express, Request, Response } from "express";
import * as LitJsSdk from "@lit-protocol/lit-node-client";

const app: Express = express();

app.get("/", async (req, res) => {
  res.send("Hello World!");

  const client = new LitJsSdk.LitNodeClient({
    litNetwork: 'serrano',
  });

  await client.connect();

//   const result = await client.executeJs({
//     code: ``,
//   })

});

app.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});
