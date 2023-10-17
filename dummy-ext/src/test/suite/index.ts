import * as vscode from "vscode";
import { writeFileSync } from "fs";
import { readFileSync } from "fs";
import assert = require("assert");

import * as path from "path";

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

  return writeCommandOutput(outputFile, {
    version: vscode.version,
    commands: await vscode.commands.getCommands(),
  });
}
