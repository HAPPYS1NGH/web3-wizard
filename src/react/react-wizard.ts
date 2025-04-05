import chalk from 'chalk';
import {
  abort,
  confirmContinueIfNoOrDirtyGitRepo,
  getOrAskForProjectData,
  getPackageDotJson,
  getPackageManager,
  installPackage,
  isUsingTypeScript,
  printWelcome,
  runPrettierIfInstalled,
} from '../utils/clack-utils';
import { hasPackageInstalled } from '../utils/package-json';
import clack from '../utils/clack';
import { Integration, ISSUES_URL } from '../lib/constants';
import { getReactDocs } from './docs';
import { addOrUpdateEnvironmentVariables } from '../utils/environment';
import {
  generateFileChangesForIntegration,
  getFilesToChange,
  getRelevantFilesForIntegration,
} from '../utils/file-utils';
import type { WizardOptions } from '../utils/types';

export async function runReactWizard(options: WizardOptions): Promise<void> {
  printWelcome({
    wizardName: 'Web3 WalletConnect React Wizard',
  });

  const typeScriptDetected = isUsingTypeScript(options);

  await confirmContinueIfNoOrDirtyGitRepo(options);

  const packageJson = await getPackageDotJson(options);

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
      integration: Integration.react,
    });

  await installPackage({
    packageName: 'viem',
    packageNameDisplayLabel: 'viem',
    packageManager: packageManagerFromInstallStep,
    alreadyInstalled: hasPackageInstalled('viem', packageJson),
    forceInstall: options.forceInstall,
    askBeforeUpdating: false,
    installDir: options.installDir,
    integration: Integration.react,
  });

  await installPackage({
    packageName: '@tanstack/react-query',
    packageNameDisplayLabel: '@tanstack/react-query',
    packageManager: packageManagerFromInstallStep,
    alreadyInstalled: hasPackageInstalled('@tanstack/react-query', packageJson),
    forceInstall: options.forceInstall,
    askBeforeUpdating: false,
    installDir: options.installDir,
    integration: Integration.react,
  });

  await installPackage({
    packageName: '@walletconnect/ethereum-provider',
    packageNameDisplayLabel: '@walletconnect/ethereum-provider',
    packageManager: packageManagerFromInstallStep,
    alreadyInstalled: walletConnectInstalled,
    forceInstall: options.forceInstall,
    askBeforeUpdating: false,
    installDir: options.installDir,
    integration: Integration.react,
  });

  const relevantFiles = await getRelevantFilesForIntegration({
    installDir: options.installDir,
    integration: Integration.react,
  });

  const installationDocumentation = getReactDocs({
    language: typeScriptDetected ? 'typescript' : 'javascript',
  });

  clack.log.info('Reviewing WalletConnect documentation for React');

  const filesToChange = await getFilesToChange({
    integration: Integration.react,
    relevantFiles,
    documentation: installationDocumentation,
    wizardHash,
    projectId,
  });

  await generateFileChangesForIntegration({
    integration: Integration.react,
    filesToChange,
    wizardHash,
    installDir: options.installDir,
    documentation: installationDocumentation,
    projectId,
  });

  // React env variables are named differently
  await addOrUpdateEnvironmentVariables({
    variables: {
      REACT_APP_WALLETCONNECT_PROJECT_ID: projectId,
    },
    installDir: options.installDir,
    integration: Integration.react,
  });

  const packageManagerForOutro =
    packageManagerFromInstallStep ?? (await getPackageManager(options));

  await runPrettierIfInstalled({
    installDir: options.installDir,
    integration: Integration.react,
  });

  clack.outro(`
${chalk.green('Successfully installed WalletConnect!')} ${`\n\nYou should validate your setup by (re)starting your dev environment (e.g. ${chalk.cyan(
    `${packageManagerForOutro.runScriptCommand} start`,
  )})`}

${chalk.dim(`If you encounter any issues, let us know here: ${ISSUES_URL}`)}`);
}
