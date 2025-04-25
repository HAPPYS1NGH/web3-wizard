export enum Integration {
  nextjs = "nextjs",
  react = "react",
}

export function getIntegrationDescription(type: string): string {
  switch (type) {
    case Integration.nextjs:
      return "Next.js";
    case Integration.react:
      return "React";
    default:
      throw new Error(`Unknown integration ${type}`);
  }
}

type IntegrationChoice = {
  name: string;
  value: string;
};

export function getIntegrationChoices(): IntegrationChoice[] {
  return Object.keys(Integration).map((type: string) => ({
    name: getIntegrationDescription(type),
    value: type,
  }));
}

export interface Args {
  debug: boolean;
  integration: Integration;
}

export const ISSUES_URL = "https://github.com/HAPPYS1NGH/web3-wizard/issues";

export const ANALYTICS_POSTHOG_PUBLIC_PROJECT_WRITE_KEY =
  "phc_AwG09nEdyi59tp5VYtQLOHJVPwTIADyXLGyMghzdRLy";

export const ANALYTICS_HOST_URL = "https://us.i.posthog.com";

export const DUMMY_PROJECT_API_KEY = "_YOUR_PRIVY_PROJECT_API_KEY_";

export const WIZARD_PROXY_URL = "https://web3wizard.dev";
