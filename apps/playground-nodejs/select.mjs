import {
  childRunCommand,
  getArgs,
  redLog,
} from "../../packages/dev-tools/utils.mjs";

import { exit } from "process";

const args = getArgs();

const FILE_NAME = args[0];

if (!FILE_NAME || FILE_NAME === "") {
  redLog("file name is required", true);
  exit();
}

// check if file exists
try {
  await childRunCommand(`ls src/${FILE_NAME}`);
} catch (e) {
  redLog(`file ${FILE_NAME} does not exist`, true);
  exit();
}

// run the file
await childRunCommand(
  `nodemon --watch src --ext js,ts,mjs --exec "tsx src/${FILE_NAME}"`
);
