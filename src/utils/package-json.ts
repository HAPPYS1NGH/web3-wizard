import { readFileSync } from 'fs';
import path from 'path';
import type { PackageJson } from './types';

export function getPackageVersion(
  packageName: string,
  packageJson: PackageJson
): string | undefined {
  return (
    packageJson.dependencies?.[packageName] ||
    packageJson.devDependencies?.[packageName]
  );
}

export function hasPackageInstalled(
  packageName: string,
  packageJson: PackageJson
): boolean {
  return !!(
    packageJson.dependencies?.[packageName] ||
    packageJson.devDependencies?.[packageName]
  );
}

export function readPackageJson(installDir: string): PackageJson | undefined {
  try {
    const packageJsonPath = path.join(installDir, 'package.json');
    const packageJsonContent = readFileSync(packageJsonPath, 'utf8');
    return JSON.parse(packageJsonContent) as PackageJson;
  } catch (error) {
    return undefined;
  }
}
