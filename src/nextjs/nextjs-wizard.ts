import chalk from 'chalk';
import {
  abort,
  confirmContinueIfNoOrDirtyGitRepo,
  ensurePackageIsInstalled,
  getOrAskForProjectData,
  getPackageDotJson,
  getPackageManager,
  installPackage,
  isUsingTypeScript,
  printWelcome,
  runPrettierIfInstalled,
} from '../utils/clack-utils';
import { getPackageVersion, hasPackageInstalled } from '../utils/package-json';
import { getNextJsRouter, getNextJsRouterName, NextJsRouter } from './utils';
import clack from '../utils/clack';
import { Integration, ISSUES_URL } from '../lib/constants';
import { getNextjsAppRouterDocs, getNextjsPagesRouterDocs } from './docs';
import { addOrUpdateEnvironmentVariables } from '../utils/environment';
import {
  generateFileChangesForIntegration,
  getFilesToChange,
  getRelevantFilesForIntegration,
} from '../utils/file-utils';
import type { WizardOptions } from '../utils/types';

export async function runNextjsWizard(options: WizardOptions): Promise<void> {
  printWelcome({
    wizardName: 'Web3 WalletConnect Next.js Wizard',
  });

  const typeScriptDetected = isUsingTypeScript(options);

  await confirmContinueIfNoOrDirtyGitRepo(options);

  const packageJson = await getPackageDotJson(options);

  await ensurePackageIsInstalled(packageJson, 'next', 'Next.js');

  const nextVersion = getPackageVersion('next', packageJson);

  const { projectId, wizardHash } = await getOrAskForProjectData({
    installDir: options.installDir,
  });

  const wagmiInstalled = hasPackageInstalled('wagmi', packageJson);
  const walletConnectInstalled = hasPackageInstalled('@walletconnect/ethereum-provider', packageJson);

  const { packageManager: packageManagerFromInstallStep } =
    await installPackage({
      packageName: 'wagmi',
      packageNameDisplayLabel: 'wagmi',
      alreadyInstalled: wagmiInstalled,
      forceInstall: options.forceInstall,
      askBeforeUpdating: false,
      installDir: options.installDir,
      integration: Integration.nextjs,
    });

  await installPackage({
    packageName: 'viem',
    packageNameDisplayLabel: 'viem',
    packageManager: packageManagerFromInstallStep,
    alreadyInstalled: hasPackageInstalled('viem', packageJson),
    forceInstall: options.forceInstall,
    askBeforeUpdating: false,
    installDir: options.installDir,
    integration: Integration.nextjs,
  });

  await installPackage({
    packageName: '@tanstack/react-query',
    packageNameDisplayLabel: '@tanstack/react-query',
    packageManager: packageManagerFromInstallStep,
    alreadyInstalled: hasPackageInstalled('@tanstack/react-query', packageJson),
    forceInstall: options.forceInstall,
    askBeforeUpdating: false,
    installDir: options.installDir,
    integration: Integration.nextjs,
  });

  await installPackage({
    packageName: '@walletconnect/ethereum-provider',
    packageNameDisplayLabel: '@walletconnect/ethereum-provider',
    packageManager: packageManagerFromInstallStep,
    alreadyInstalled: walletConnectInstalled,
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
    language: typeScriptDetected ? 'typescript' : 'javascript',
  });

  clack.log.info(
    `Reviewing WalletConnect documentation for ${getNextJsRouterName(router)}`,
  );

  const filesToChange = await getFilesToChange({
    integration: Integration.nextjs,
    relevantFiles,
    documentation: installationDocumentation,
    wizardHash,
    projectId,
  });

  await generateFileChangesForIntegration({
    integration: Integration.nextjs,
    filesToChange,
    wizardHash,
    installDir: options.installDir,
    documentation: installationDocumentation,
    projectId,
  });

  await addOrUpdateEnvironmentVariables({
    variables: {
      NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: projectId,
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
${chalk.green('Successfully installed WalletConnect!')} ${`\n\nYou should validate your setup by (re)starting your dev environment (e.g. ${chalk.cyan(
    `${packageManagerForOutro.runScriptCommand} dev`,
  )})`}

${chalk.dim(`If you encounter any issues, let us know here: ${ISSUES_URL}`)}`);
}

function getInstallationDocumentation({
  router,
  language,
}: {
  router: NextJsRouter;
  language: 'typescript' | 'javascript';
}) {
  if (router === NextJsRouter.PAGES_ROUTER) {
    return getNextjsPagesRouterDocs({ language });
  }

  return getNextjsAppRouterDocs({ language });
}
