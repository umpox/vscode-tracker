/* eslint-disable @typescript-eslint/naming-convention */
import * as path from "path";
import { execFileSync } from "node:child_process";

import { runTests } from "@vscode/test-electron";

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, "../../");
    const extensionTestsPath = path.resolve(__dirname, "./suite/index");

    await runTests({
      version: "stable",
      extensionDevelopmentPath,
      extensionTestsPath,
      extensionTestsEnv: { OUTPUT_FILE: "commands-stable.json" },
    });

    await runTests({
      version: "stable",
      extensionDevelopmentPath,
      extensionTestsPath,
      extensionTestsEnv: { OUTPUT_FILE: "commands-insiders.json" },
    });
  } catch (err) {
    console.error("Failed to run tests", err);
    process.exit(1);
  }
}

main();
