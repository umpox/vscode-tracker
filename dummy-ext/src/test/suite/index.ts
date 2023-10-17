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

export interface ApiOutput {
  version: string;
  api: object;
}

export function parseApiOutput(path: string): ApiOutput {
  try {
    const file = readFileSync(path, "utf8");
    const config = JSON.parse(file) as ApiOutput;
    return config;
  } catch (error) {
    console.error(`Error parsing exisitng output file: ${error}`);
    throw error;
  }
}

export function writeApiOutput(path: string, apiOutput: ApiOutput): void {
  return writeFileSync(path, JSON.stringify(apiOutput, null, 2), "utf-8");
}

function getDeepProperties(obj: object): object {
  const result: { [key: string]: any } = {};

  for (const key of Object.keys(obj).sort()) {
    try {
      const value = (obj as any)[key];

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        result[key] = getDeepProperties(value);
      } else {
        result[key] = value; // capturing the type of the property
      }
    } catch (error: any) {
      result[key] = `Error: ${error.message}`;
    }
  }

  return result;
}

export async function run(): Promise<void> {
  assert(process.env.COMMAND_OUTPUT, "COMMAND_OUTPUT is required");
  assert(process.env.API_OUTPUT, "API_OUTPUT is required");

  const filesToCommit = [];

  // Commands
  const commandOutputFile = path.resolve(REPO_ROOT, process.env.COMMAND_OUTPUT);
  const existingCommandOutput = parseCommandOutput(commandOutputFile);
  if (existingCommandOutput.version !== vscode.version) {
    const commands = await vscode.commands.getCommands();

    // Sort commands ourselves to avoid false positives
    const sortedCommands = commands.sort();

    writeCommandOutput(commandOutputFile, {
      version: vscode.version,
      commands: sortedCommands,
    });

    filesToCommit.push(commandOutputFile);
  }

  // Api
  const apiOutputFile = path.resolve(REPO_ROOT, process.env.API_OUTPUT);
  const existingApiOuput = parseApiOutput(apiOutputFile);
  if (existingApiOuput.version !== vscode.version) {
    const vscodeProps = getDeepProperties(vscode);
    writeApiOutput(apiOutputFile, {
      version: vscode.version,
      api: vscodeProps,
    });
    filesToCommit.push(apiOutputFile);
  }

  // Commit files when running in CI
  if (process.env.CI && filesToCommit.length > 0) {
    execFileSync("git", ["add", "--", ...filesToCommit]);
    execFileSync("git", ["commit", "--message", `${vscode.version}`], {
      env: {
        GIT_COMMITTER_NAME: "VS Code Tracker",
        GIT_COMMITTER_EMAIL: "actions@github.com",
        GIT_AUTHOR_NAME: "VS Code Tracker",
        GIT_AUTHOR_EMAIL: "actions@github.com",
      },
    });
  }
}
