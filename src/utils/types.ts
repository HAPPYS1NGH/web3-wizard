export type WizardOptions = {
  debug: boolean;
  forceInstall: boolean;
  installDir: string;
  default: boolean;
};

export type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  [key: string]: unknown;
};

export type PackageManager = {
  name: 'npm' | 'yarn' | 'pnpm';
  installCommand: string;
  runScriptCommand: string;
};

export type FileChange = {
  filePath: string;
  content: string;
  isNewFile: boolean;
};

export type ExtraIntegrationData = {
  reownAppId?: string;
  reownApiKey?: string;
  [key: string]: string | undefined;
};
