/* eslint-disable max-lines */

import chalk from "chalk";
import {
  abort,
  askForAIConsent,
  confirmContinueIfNoOrDirtyGitRepo,
  ensurePackageIsInstalled,
  getOrAskForProjectData,
  getPackageDotJson,
  getPackageManager,
  installPackage,
  isUsingTypeScript,
  printWelcome,
  runPrettierIfInstalled,
} from "../utils/clack-utils";
import { getPackageVersion, hasPackageInstalled } from "../utils/package-json";
import {
  getNextJsRouter,
  getNextJsRouterName,
  getNextJsVersionBucket,
  NextJsRouter,
} from "./utils";
import clack from "../utils/clack";
import { Integration, ISSUES_URL } from "../lib/constants";
import { getNextjsAppRouterDocs, getNextjsPagesRouterDocs } from "./docs";
import { analytics } from "../utils/analytics";
import { addOrUpdateEnvironmentVariables } from "../utils/environment";
import {
  generateFileChangesForIntegration,
  getFilesToChange,
  getRelevantFilesForIntegration,
} from "../utils/file-utils";
import type { WizardOptions } from "../utils/types";

export async function runNextjsWizard(options: WizardOptions): Promise<void> {
  printWelcome({
    wizardName: "Web3 Wallet Wizard",
  });

  const aiConsent = await askForAIConsent(options);

  if (!aiConsent) {
    await abort(
      "The Next.js wizard requires AI to get setup right now. Please view the docs to setup Next.js manually instead: https://docs.privy.io/basics/react/setup",
      0
    );
  }

  const typeScriptDetected = isUsingTypeScript(options);

  await confirmContinueIfNoOrDirtyGitRepo(options);

  const packageJson = await getPackageDotJson(options);

  await ensurePackageIsInstalled(packageJson, "next", "Next.js");

  const nextVersion = getPackageVersion("next", packageJson);

  analytics.setTag("nextjs-version", getNextJsVersionBucket(nextVersion));

  const { projectApiKey, wizardHash } = await getOrAskForProjectData({
    ...options,
  });

  const sdkAlreadyInstalled = hasPackageInstalled(
    "@privy-io/react-auth",
    packageJson
  );

  analytics.setTag("sdk-already-installed", sdkAlreadyInstalled);

  const { packageManager: packageManagerFromInstallStep } =
    await installPackage({
      packageName: "@privy-io/react-auth",
      packageNameDisplayLabel: "@privy-io/react-auth",
      alreadyInstalled: !!packageJson?.dependencies?.["@privy-io/react-auth"],
      forceInstall: options.forceInstall,
      askBeforeUpdating: false,
      installDir: options.installDir,
      integration: Integration.nextjs,
    });
  await installPackage({
    packageName: "wagmi",
    packageNameDisplayLabel: "wagmi",
    alreadyInstalled: !!packageJson?.dependencies?.["wagmi"],
    forceInstall: options.forceInstall,
    askBeforeUpdating: false,
    installDir: options.installDir,
    integration: Integration.nextjs,
  });
  await installPackage({
    packageName: "@privy-io/wagmi",
    packageNameDisplayLabel: "@privy-io/wagmi",
    alreadyInstalled: !!packageJson?.dependencies?.["@privy-io/wagmi"],
    forceInstall: options.forceInstall,
    askBeforeUpdating: false,
    installDir: options.installDir,
    integration: Integration.nextjs,
  });
  await installPackage({
    packageName: "@tanstack/react-query",
    packageNameDisplayLabel: "@tanstack/react-query",
    alreadyInstalled: !!packageJson?.dependencies?.["@tanstack/react-query"],
    forceInstall: options.forceInstall,
    askBeforeUpdating: false,
    installDir: options.installDir,
    integration: Integration.nextjs,
  });

  const router = await getNextJsRouter(options);

  const relevantFiles = await getRelevantFilesForIntegration({
    installDir: options.installDir,
    integration: Integration.nextjs,
  });

  const installationDocumentation = getInstallationDocumentation({
    router,
    language: typeScriptDetected ? "typescript" : "javascript",
  });

  clack.log.info(
    `Reviewing Privy documentation for ${getNextJsRouterName(router)}`
  );

  const filesToChange = await getFilesToChange({
    integration: Integration.nextjs,
    relevantFiles,
    documentation: installationDocumentation,
    wizardHash,
  });

  await generateFileChangesForIntegration({
    integration: Integration.nextjs,
    filesToChange,
    wizardHash,
    installDir: options.installDir,
    documentation: installationDocumentation,
  });

  await addOrUpdateEnvironmentVariables({
    variables: {
      NEXT_PUBLIC_PRIVY_APP_ID: projectApiKey,
    },
    installDir: options.installDir,
    integration: Integration.nextjs,
  });

  const packageManagerForOutro =
    packageManagerFromInstallStep ?? (await getPackageManager(options));

  await runPrettierIfInstalled({
    installDir: options.installDir,
    integration: Integration.nextjs,
  });

  clack.outro(`
${chalk.green("Successfully installed Privy!")} ${`\n\n${
    aiConsent
      ? `Note: This uses experimental AI to setup your project. It might have got it wrong, please check!\n`
      : ``
  }You should validate your setup by (re)starting your dev environment (e.g. ${chalk.cyan(
    `${packageManagerForOutro.runScriptCommand} dev`
  )})`}

${chalk.dim(`If you encounter any issues, let us know here: ${ISSUES_URL}`)}`);

  await analytics.shutdown("success");
}

function getInstallationDocumentation({
  router,
  language,
}: {
  router: NextJsRouter;
  language: "typescript" | "javascript";
}) {
  if (router === NextJsRouter.PAGES_ROUTER) {
    return getNextjsPagesRouterDocs({ language });
  }

  return getNextjsAppRouterDocs({ language });
}
