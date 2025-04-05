import { existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import clack from './clack';
import { readPackageJson } from './package-json';
import type { PackageJson, PackageManager, WizardOptions } from './types';
import chalk from 'chalk';

export async function printWelcome({
  wizardName,
}: {
  wizardName: string;
}): Promise<void> {
  clack.log.info(`${wizardName} 🚀`);
}

export async function abort(message: string, code: number): Promise<never> {
  clack.cancel(message);
  process.exit(code);
}

export function isUsingTypeScript(options: Pick<WizardOptions, 'installDir'>): boolean {
  return (
    existsSync(path.join(options.installDir, 'tsconfig.json')) ||
    existsSync(path.join(options.installDir, 'jsconfig.json'))
  );
}

export async function confirmContinueIfNoOrDirtyGitRepo(
  options: Pick<WizardOptions, 'installDir'>
): Promise<void> {
  const hasGit = existsSync(path.join(options.installDir, '.git'));
  
  if (!hasGit) {
    const shouldContinue = await clack.confirm({
      message: 'No Git repository detected. We recommend using Git for version control. Continue anyway?',
    });

    if (!shouldContinue) {
      await abort('Setup cancelled. Please initialize a Git repository and try again.', 0);
    }
    return;
  }

  try {
    const gitStatus = execSync('git status --porcelain', {
      cwd: options.installDir,
    }).toString();

    if (gitStatus.trim() !== '') {
      const shouldContinue = await clack.confirm({
        message: 'You have uncommitted changes. We recommend committing before continuing. Continue anyway?',
      });

      if (!shouldContinue) {
        await abort('Setup cancelled. Please commit your changes and try again.', 0);
      }
    }
  } catch (error) {
    // If git command fails, just continue
  }
}

export async function getPackageDotJson(
  options: Pick<WizardOptions, 'installDir'>
): Promise<PackageJson> {
  const packageJson = readPackageJson(options.installDir);
  
  if (!packageJson) {
    await abort(
      'Failed to read package.json. Make sure you are running this in a valid Node.js project.',
      1
    );
  }

  return packageJson!;
}

export async function getPackageManager(
  options: Pick<WizardOptions, 'installDir'>
): Promise<PackageManager> {
  if (existsSync(path.join(options.installDir, 'yarn.lock'))) {
    return {
      name: 'yarn',
      installCommand: 'yarn add',
      runScriptCommand: 'yarn',
    };
  } else if (existsSync(path.join(options.installDir, 'pnpm-lock.yaml'))) {
    return {
      name: 'pnpm',
      installCommand: 'pnpm add',
      runScriptCommand: 'pnpm',
    };
  } else {
    return {
      name: 'npm',
      installCommand: 'npm install',
      runScriptCommand: 'npm run',
    };
  }
}

export async function installPackage({
  packageName,
  packageNameDisplayLabel,
  alreadyInstalled,
  forceInstall,
  askBeforeUpdating,
  installDir,
  packageManager,
  integration,
}: {
  packageName: string;
  packageNameDisplayLabel: string;
  alreadyInstalled: boolean;
  forceInstall: boolean;
  askBeforeUpdating: boolean;
  installDir: string;
  packageManager?: PackageManager;
  integration: string;
}): Promise<{ packageManager: PackageManager }> {
  const resolvedPackageManager = packageManager || (await getPackageManager({ installDir }));

  if (alreadyInstalled && !forceInstall) {
    clack.log.info(`${packageNameDisplayLabel} is already installed.`);

    if (askBeforeUpdating) {
      const shouldUpdate = await clack.confirm({
        message: `Update ${packageNameDisplayLabel} to the latest version?`,
      });

      if (!shouldUpdate) {
        return { packageManager: resolvedPackageManager };
      }
    } else {
      return { packageManager: resolvedPackageManager };
    }
  }

  clack.log.info(`Installing ${packageNameDisplayLabel}...`);

  try {
    const spinner = clack.spinner();
    spinner.start(`Installing ${packageNameDisplayLabel}...`);

    execSync(`${resolvedPackageManager.installCommand} ${packageName}`, {
      cwd: installDir,
      stdio: 'pipe',
    });

    spinner.stop(`Installed ${packageNameDisplayLabel} successfully!`);
    return { packageManager: resolvedPackageManager };
  } catch (error) {
    clack.log.error(`Failed to install ${packageNameDisplayLabel}: ${error}`);
    
    const shouldContinue = await clack.confirm({
      message: 'Continue without installing the package?',
    });

    if (!shouldContinue) {
      await abort('Setup cancelled. Please install the package manually and try again.', 1);
    }

    return { packageManager: resolvedPackageManager };
  }
}

export async function getOrAskForProjectData({
  installDir,
}: {
  installDir: string;
}) {
  const projectId = await clack.text({
    message: 'Enter your WalletConnect Project ID',
    placeholder: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    validate(value) {
      if (!value) return 'Project ID is required';
      if (value.length < 10) return 'Project ID is too short';
      return;
    },
  });

  if (clack.isCancel(projectId)) {
    await abort('Setup cancelled', 0);
  }

  // Generate a unique hash for this installation
  const wizardHash = Math.random().toString(36).substring(2, 10);

  return {
    projectId,
    wizardHash,
  };
}

export async function runPrettierIfInstalled({
  installDir,
  integration,
}: {
  installDir: string;
  integration: string;
}): Promise<void> {
  const packageJson = readPackageJson(installDir);
  const hasPrettier = !!(
    packageJson?.devDependencies?.prettier || packageJson?.dependencies?.prettier
  );

  if (!hasPrettier) {
    return;
  }

  const packageManager = await getPackageManager({ installDir });
  
  try {
    clack.log.info('Running Prettier to format changes...');
    execSync(`${packageManager.runScriptCommand} prettier --write .`, {
      cwd: installDir,
      stdio: 'pipe',
    });
    clack.log.success('Formatted files with Prettier');
  } catch (error) {
    // Ignore Prettier errors, they're not critical
    clack.log.warn('Failed to run Prettier, but continuing anyway');
  }
}
