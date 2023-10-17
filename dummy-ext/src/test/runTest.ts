/* eslint-disable @typescript-eslint/naming-convention */
import * as path from "path";

import { runTests } from "@vscode/test-electron";

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, "../../");
    const extensionTestsPath = path.resolve(__dirname, "./suite/index");

    await runTests({
      version: "stable",
      extensionDevelopmentPath,
      extensionTestsPath,
      extensionTestsEnv: {
        COMMAND_OUTPUT: "commands-stable.json",
        API_OUTPUT: "api-stable.json",
      },
    });

    await runTests({
      version: "insiders",
      extensionDevelopmentPath,
      extensionTestsPath,
      extensionTestsEnv: {
        COMMAND_OUTPUT: "commands-insiders.json",
        API_OUTPUT: "api-insiders.json",
      },
    });
  } catch (err) {
    console.error("Failed to run tests", err);
    process.exit(1);
  }
}

main();
