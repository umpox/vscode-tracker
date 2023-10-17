/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import assert = require("assert");
import path = require("node:path");

// Must match the structure of `commands.json`
export interface CommandOutput {
  version: string;
  commands: string[];
}

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..", "..");

export function parseCommandOutput(path: string): CommandOutput {
  try {
    const file = readFileSync(path, "utf8");
    const config = JSON.parse(file) as CommandOutput;
    return config;
  } catch (error) {
    console.error(`Error parsing exisitng output file: ${error}`);
    throw error;
  }
}

export function writeCommandOutput(
  path: string,
  commandOutput: CommandOutput
): void {
  return writeFileSync(path, JSON.stringify(commandOutput, null, 2), "utf-8");
}

export async function run(): Promise<void> {
  assert(process.env.OUTPUT_FILE, "OUTPUT_FILE is required");
  const outputFile = path.resolve(REPO_ROOT, process.env.OUTPUT_FILE);

  const existingCommandOutput = parseCommandOutput(outputFile);
  if (existingCommandOutput.version === vscode.version) {
    console.log("Skipping test run, output is already up to date");
    return;
  }

  writeCommandOutput(outputFile, {
    version: vscode.version,
    commands: await vscode.commands.getCommands(),
  });

  // Commit files when running in CI
  if (process.env.CI) {
    execFileSync("git", ["add", "--", outputFile]);
    execFileSync("git", ["commit", "--message", vscode.version], {
      env: {
        GIT_COMMITTER_NAME: "VS Code Tracker",
        GIT_COMMITTER_EMAIL: "actions@github.com",
        GIT_AUTHOR_NAME: "VS Code Tracker",
        GIT_AUTHOR_EMAIL: "actions@github.com",
      },
    });
  }
}
