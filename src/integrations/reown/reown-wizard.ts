// import chalk from 'chalk';
// import {
//   abort,
//   confirmContinueIfNoOrDirtyGitRepo,
//   getOrAskForProjectData,
//   getPackageDotJson,
//   getPackageManager,
//   installPackage,
//   isUsingTypeScript,
//   printWelcome,
//   runPrettierIfInstalled,
// } from '../../utils/clack-utils';
// import { hasPackageInstalled } from '../../utils/package-json';
// import clack from '../../utils/clack';
// import { Integration, ISSUES_URL } from '../../lib/constants';
// import { getReownNextjsDocs } from './docs';
// import { addOrUpdateEnvironmentVariables } from '../../utils/environment';
// import {
//   generateFileChangesForIntegration,
//   getFilesToChange,
//   getRelevantFilesForIntegration,
// } from '../../utils/file-utils';
// import type { WizardOptions } from '../../utils/types';

// export async function runReownWizard(options: WizardOptions): Promise<void> {
//   printWelcome({
//     wizardName: 'Reown App Kit Next.js Wizard',
//   });

//   const typeScriptDetected = isUsingTypeScript(options);

//   await confirmContinueIfNoOrDirtyGitRepo(options);

//   const packageJson = await getPackageDotJson(options);

//   const { projectId: walletConnectProjectId, wizardHash } = await getOrAskForProjectData({
//     installDir: options.installDir,
//   });

//   // Ask for Reown App ID
//   const reownAppId = await clack.text({
//     message: 'Enter your Reown App ID',
//     placeholder: 'myapp.reown.id',
//     validate(value) {
//       if (!value) return 'Reown App ID is required';
//       return;
//     },
//   });

//   if (clack.isCancel(reownAppId)) {
//     await abort('Setup cancelled', 0);
//   }

//   // Ask for Reown API key
//   const reownApiKey = await clack.text({
//     message: 'Enter your Reown API Key',
//     placeholder: 'reown_api_xxxxxxxxxx',
//     validate(value) {
//       if (!value) return 'Reown API Key is required';
//       return;
//     },
//   });

//   if (clack.isCancel(reownApiKey)) {
//     await abort('Setup cancelled', 0);
//   }

//   const wagmiInstalled = hasPackageInstalled('wagmi', packageJson);
//   const reownKitInstalled = hasPackageInstalled('@reownit/core', packageJson);

//   const { packageManager: packageManagerFromInstallStep } =
//     await installPackage({
//       packageName: '@reownit/core',
//       packageNameDisplayLabel: '@reownit/core',
//       alreadyInstalled: reownKitInstalled,
//       forceInstall: options.forceInstall,
//       askBeforeUpdating: false,
//       installDir: options.installDir,
//       integration: Integration.reown,
//     });

//   await installPackage({
//     packageName: '@reownit/next',
//     packageNameDisplayLabel: '@reownit/next',
//     packageManager: packageManagerFromInstallStep,
//     alreadyInstalled: hasPackageInstalled('@reownit/next', packageJson),
//     forceInstall: options.forceInstall,
//     askBeforeUpdating: false,
//     installDir: options.installDir,
//     integration: Integration.reown,
//   });

//   await installPackage({
//     packageName: 'wagmi',
//     packageNameDisplayLabel: 'wagmi',
//     packageManager: packageManagerFromInstallStep,
//     alreadyInstalled: wagmiInstalled,
//     forceInstall: options.forceInstall,
//     askBeforeUpdating: false,
//     installDir: options.installDir,
//     integration: Integration.reown,
//   });

//   await installPackage({
//     packageName: 'viem',
//     packageNameDisplayLabel: 'viem',
//     packageManager: packageManagerFromInstallStep,
//     alreadyInstalled: hasPackageInstalled('viem', packageJson),
//     forceInstall: options.forceInstall,
//     askBeforeUpdating: false,
//     installDir: options.installDir,
//     integration: Integration.reown,
//   });

//   await installPackage({
//     packageName: '@tanstack/react-query',
//     packageNameDisplayLabel: '@tanstack/react-query',
//     packageManager: packageManagerFromInstallStep,
//     alreadyInstalled: hasPackageInstalled('@tanstack/react-query', packageJson),
//     forceInstall: options.forceInstall,
//     askBeforeUpdating: false,
//     installDir: options.installDir,
//     integration: Integration.reown,
//   });

//   const relevantFiles = await getRelevantFilesForIntegration({
//     installDir: options.installDir,
//     integration: Integration.reown,
//   });

//   const installationDocumentation = getReownNextjsDocs({
//     language: typeScriptDetected ? 'typescript' : 'javascript',
//   });

//   clack.log.info('Analyzing project for Reown App Kit integration...');

//   const filesToChange = await getFilesToChange({
//     integration: Integration.reown,
//     relevantFiles,
//     documentation: installationDocumentation,
//     wizardHash,
//     projectId: walletConnectProjectId,
//     extraData: {
//       reownAppId,
//       reownApiKey,
//     },
//   });

//   await generateFileChangesForIntegration({
//     integration: Integration.reown,
//     filesToChange,
//     wizardHash,
//     installDir: options.installDir,
//     documentation: installationDocumentation,
//     projectId: walletConnectProjectId,
//     extraData: {
//       reownAppId,
//       reownApiKey,
//     },
//   });

//   await addOrUpdateEnvironmentVariables({
//     variables: {
//       NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: walletConnectProjectId,
//       NEXT_PUBLIC_REOWN_APP_ID: reownAppId,
//       REOWN_API_KEY: reownApiKey,
//     },
//     installDir: options.installDir,
//     integration: Integration.reown,
//   });

//   const packageManagerForOutro =
//     packageManagerFromInstallStep ?? (await getPackageManager(options));

//   await runPrettierIfInstalled({
//     installDir: options.installDir,
//     integration: Integration.reown,
//   });

//   clack.outro(`
// ${chalk.green('Successfully installed Reown App Kit!')} ${`\n\nYou should validate your setup by (re)starting your dev environment (e.g. ${chalk.cyan(
//     `${packageManagerForOutro.runScriptCommand} dev`,
//   )})`}

// ${chalk.dim(`If you encounter any issues, let us know here: ${ISSUES_URL}`)}`);
// }
