import path from "path";
import fs from "fs";
import type { FileChange, WizardOptions } from "./types";
import clack from "./clack";
import z from "zod";
import { query } from "./query";
import fg from "fast-glob";
import { analytics } from "./analytics";
import { Integration } from "../lib/constants";
import { abort } from "./clack-utils";
import { INTEGRATION_CONFIG } from "../lib/config";
import {
  baseFilterFilesPromptTemplate,
  baseGenerateFileChangesPromptTemplate,
} from "../lib/prompts";

export const GLOBAL_IGNORE_PATTERN = [
  "node_modules",
  "dist",
  "build",
  "public",
  "static",
  ".git",
  ".next",
];
export async function getAllFilesInProject(dir: string): Promise<string[]> {
  let results: string[] = [];

  const entries = await fs.promises.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (GLOBAL_IGNORE_PATTERN.some((pattern) => fullPath.includes(pattern))) {
      continue;
    }

    if (entry.isDirectory()) {
      // Recursively get files from subdirectories
      const subDirFiles = await getAllFilesInProject(fullPath);
      results = results.concat(subDirFiles);
    } else {
      results.push(fullPath);
    }
  }

  return results;
}

export function getDotGitignore({
  installDir,
}: Pick<WizardOptions, "installDir">) {
  const gitignorePath = path.join(installDir, ".gitignore");
  const gitignoreExists = fs.existsSync(gitignorePath);

  if (gitignoreExists) {
    return gitignorePath;
  }

  return undefined;
}

export async function updateFile(
  change: FileChange,
  { installDir }: Pick<WizardOptions, "installDir">
) {
  const dir = path.dirname(path.join(installDir, change.filePath));
  await fs.promises.mkdir(dir, { recursive: true });
  await fs.promises.writeFile(
    path.join(installDir, change.filePath),
    change.newContent
  );
}

export async function getFilesToChange({
  integration,
  relevantFiles,
  documentation,
  wizardHash,
}: {
  integration: Integration;
  relevantFiles: string[];
  documentation: string;
  wizardHash: string;
}) {
  const filterFilesSpinner = clack.spinner();

  filterFilesSpinner.start("Selecting files to change...");

  const filterFilesResponseSchmea = z.object({
    files: z.array(z.string()),
  });

  const prompt = await baseFilterFilesPromptTemplate.format({
    documentation,
    file_list: relevantFiles.join("\n"),
    integration_name: integration,
    integration_rules: INTEGRATION_CONFIG[integration].filterFilesRules,
  });

  const filterFilesResponse = await query({
    message: prompt,
    schema: filterFilesResponseSchmea,
    type: "filter",
    wizardHash,
  });

  const filesToChange = filterFilesResponse.files;

  filterFilesSpinner.stop(`Found ${filesToChange.length} files to change`);

  analytics.capture("wizard interaction", {
    action: "detected files to change",
    integration,
    files: filesToChange,
  });

  return filesToChange;
}

export async function generateFileContent({
  prompt,
  wizardHash,
}: {
  prompt: string;
  wizardHash: string;
}) {
  const response = await query({
    message: prompt,
    type: "generate",
    schema: z.object({
      newContent: z.string(),
    }),
    wizardHash: wizardHash,
  });

  return response.newContent;
}

export async function generateFileChangesForIntegration({
  integration,
  filesToChange,
  wizardHash,
  documentation,
  installDir,
}: {
  integration: Integration;
  filesToChange: string[];
  wizardHash: string;
  documentation: string;
  installDir: string;
}) {
  const changes: FileChange[] = [];

  for (const filePath of filesToChange) {
    const fileChangeSpinner = clack.spinner();

    analytics.capture("wizard interaction", {
      action: "processing file",
      integration,
      file: filePath,
    });

    try {
      let oldContent: string | undefined = undefined;
      try {
        oldContent = await fs.promises.readFile(
          path.join(installDir, filePath),
          "utf8"
        );
      } catch (readError: any) {
        if (
          typeof readError === "object" &&
          readError !== null &&
          "code" in readError &&
          readError.code === "ENOENT"
        ) {
          // File doesn't exist, which is fine for new files
        } else {
          await abort(`Error reading file ${filePath}`);
          continue;
        }
      }

      // Set higher max listeners or increase the limit before multiple file operations
      if (
        process.listenerCount("uncaughtExceptionMonitor") > 5 ||
        process.listenerCount("unhandledRejection") > 5 ||
        process.listenerCount("SIGINT") > 5 ||
        process.listenerCount("SIGTERM") > 5 ||
        process.listenerCount("exit") > 5
      ) {
        // Increase the max listeners limit for the process
        process.setMaxListeners(20);
      }

      fileChangeSpinner.start(
        `${oldContent ? "Updating" : "Creating"} file ${filePath}`
      );

      const unchangedFiles = filesToChange.filter(
        (filePath) => !changes.some((change) => change.filePath === filePath)
      );

      const prompt = await baseGenerateFileChangesPromptTemplate.format({
        file_content: oldContent,
        file_path: filePath,
        documentation,
        integration_name: INTEGRATION_CONFIG[integration].name,
        integration_rules: INTEGRATION_CONFIG[integration].generateFilesRules,
        changed_files: changes
          .map((change) => `${change.filePath}\n${change.oldContent}`)
          .join("\n"),
        unchanged_files: unchangedFiles,
      });

      const newContent = await generateFileContent({
        prompt,
        wizardHash,
      });

      if (newContent !== oldContent) {
        await updateFile({ filePath, oldContent, newContent }, { installDir });
        changes.push({ filePath, oldContent, newContent });
      }

      fileChangeSpinner.stop(
        `${oldContent ? "Updated" : "Created"} file ${filePath}`
      );

      analytics.capture("wizard interaction", {
        action: "processed file",
        integration,
        file: filePath,
      });
    } catch (error) {
      await abort(`Error processing file ${filePath}`);
    }
  }

  analytics.capture("wizard interaction", {
    action: "completed file changes",
    integration,
    files: filesToChange,
  });

  return changes;
}

export async function getRelevantFilesForIntegration({
  installDir,
  integration,
}: Pick<WizardOptions, "installDir"> & {
  integration: Integration;
}) {
  const filterPatterns = INTEGRATION_CONFIG[integration].filterPatterns;
  const ignorePatterns = INTEGRATION_CONFIG[integration].ignorePatterns;

  const filteredFiles = await fg(filterPatterns, {
    cwd: installDir,
    ignore: ignorePatterns,
  });

  analytics.capture("wizard interaction", {
    action: "detected relevant files",
    integration,
    number_of_files: filteredFiles.length,
  });

  return filteredFiles;
}
