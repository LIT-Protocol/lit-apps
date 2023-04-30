const { execSync } = require("child_process");

const appEnv = process.env.APP_ENV;

switch (appEnv) {
  case "event-listener-fe":
    execSync("yarn run build:el:fe", { stdio: "inherit" });
    break;
  case "event-listener-be":
    execSync("yarn run build:el:be", { stdio: "inherit" });
    break;
  case "lit-actions-deployer":
    execSync("yarn run build:lit-actions-deployer", { stdio: "inherit" });
    break;
  case "lit-general-worker":
    execSync(`yarn turbo run build --filter ${appEnv}`, { stdio: "inherit" });
    break;
  default:
    console.log("No environment detected, please set APP_ENV");
}
