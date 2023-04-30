const { execSync } = require("child_process");

const appEnv = process.env.APP_ENV;

execSync(`yarn turbo run build --filter ${appEnv}`, { stdio: "inherit" });