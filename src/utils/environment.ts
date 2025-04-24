import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { Integration } from "../lib/constants";
import clack from "./clack";

export function readEnvironment() {
  return {
    debug: process.env.WEB3_WIZARD_DEBUG === "true",
    integration: process.env.WEB3_WIZARD_INTEGRATION as Integration | undefined,
    installDir: process.env.WEB3_WIZARD_INSTALL_DIR,
    default: process.env.WEB3_WIZARD_DEFAULT === "true",
  };
}

export async function addOrUpdateEnvironmentVariables({
  variables,
  installDir,
  integration,
}: {
  variables: Record<string, string>;
  installDir: string;
  integration: Integration;
}) {
  let envFile = ".env";
  let envLocalFile = ".env.local";

  // Check if .env.local exists, prioritize it
  if (existsSync(path.join(installDir, envLocalFile))) {
    await updateEnvFile(envLocalFile, variables, installDir);
    return;
  }

  // Check if .env exists
  if (existsSync(path.join(installDir, envFile))) {
    await updateEnvFile(envFile, variables, installDir);
    return;
  }

  // Create .env.local if no env files exist
  await createEnvFile(envLocalFile, variables, installDir);
}

async function updateEnvFile(
  filename: string,
  variables: Record<string, string>,
  installDir: string
) {
  const filePath = path.join(installDir, filename);
  try {
    let content = readFileSync(filePath, "utf-8");
    let updated = false;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`^${key}=.*`, "m");
      if (regex.test(content)) {
        content = content.replace(regex, `${key}=${value}`);
        updated = true;
      } else {
        content += `\n${key}=${value}`;
        updated = true;
      }
    }

    if (updated) {
      writeFileSync(filePath, content);
      clack.log.success(`Updated ${filename} with WalletConnect variables`);
    }
  } catch (error) {
    clack.log.error(`Failed to update ${filename}: ${error}`);
  }
}

async function createEnvFile(
  filename: string,
  variables: Record<string, string>,
  installDir: string
) {
  const filePath = path.join(installDir, filename);
  try {
    let content = "";
    for (const [key, value] of Object.entries(variables)) {
      content += `${key}=${value}\n`;
    }

    writeFileSync(filePath, content);
    clack.log.success(`Created ${filename} with WalletConnect variables`);
  } catch (error) {
    clack.log.error(`Failed to create ${filename}: ${error}`);
  }
}
