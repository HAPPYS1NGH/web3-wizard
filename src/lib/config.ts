import { Integration } from './constants';
import { existsSync } from 'fs';
import path from 'path';

type IntegrationConfig = {
  detect: (options: { installDir: string }) => Promise<boolean>;
};

export const INTEGRATION_CONFIG: Record<Integration, IntegrationConfig> = {
  [Integration.nextjs]: {
    detect: async ({ installDir }) => {
      const packageJsonPath = path.join(installDir, 'package.json');
      if (!existsSync(packageJsonPath)) {
        return false;
      }

      try {
        const packageJson = require(packageJsonPath);
        return !!(
          packageJson.dependencies?.next || packageJson.devDependencies?.next
        );
      } catch (e) {
        return false;
      }
    },
  },
  [Integration.react]: {
    detect: async ({ installDir }) => {
      const packageJsonPath = path.join(installDir, 'package.json');
      if (!existsSync(packageJsonPath)) {
        return false;
      }

      try {
        const packageJson = require(packageJsonPath);
        return !!(
          packageJson.dependencies?.react || packageJson.devDependencies?.react
        );
      } catch (e) {
        return false;
      }
    },
  },
  [Integration.reown]: {
    detect: async ({ installDir }) => {
      const packageJsonPath = path.join(installDir, 'package.json');
      if (!existsSync(packageJsonPath)) {
        return false;
      }

      try {
        const packageJson = require(packageJsonPath);
        // Check if it's a Next.js project first
        const hasNextJs = !!(
          packageJson.dependencies?.next || packageJson.devDependencies?.next
        );
        
        // Check if Reown is already installed
        const hasReown = !!(
          packageJson.dependencies?.['@reownit/core'] || 
          packageJson.devDependencies?.['@reownit/core'] ||
          packageJson.dependencies?.['@reownit/next'] || 
          packageJson.devDependencies?.['@reownit/next']
        );
        
        // Return true for Next.js projects (we'll ask if they want to install Reown)
        return hasNextJs;
      } catch (e) {
        return false;
      }
    },
  },
};

export const INTEGRATION_ORDER = [Integration.nextjs, Integration.react, Integration.reown];
