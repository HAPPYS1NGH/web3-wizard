import { Integration } from './lib/constants';
import type { WizardOptions } from './utils/types';
import { readEnvironment } from './utils/environment';
import clack from './utils/clack';
import path from 'path';
import { INTEGRATION_CONFIG, INTEGRATION_ORDER } from './lib/config';
import { runNextjsWizard } from './nextjs/nextjs-wizard';

type Args = {
  integration?: Integration;
  debug?: boolean;
  forceInstall?: boolean;
  installDir?: string;
  default?: boolean;
};

export async function run(argv: Args) {
  await runWizard(argv);
}

async function runWizard(argv: Args) {
  const finalArgs = {
    ...argv,
    ...readEnvironment(),
  };

  const wizardOptions: WizardOptions = {
    debug: finalArgs.debug ?? false,
    forceInstall: finalArgs.forceInstall ?? false,
    installDir: finalArgs.installDir
      ? path.join(process.cwd(), finalArgs.installDir)
      : process.cwd(),
    default: finalArgs.default ?? false,
  };

  clack.intro(`Welcome to the Web3 Wallet setup wizard 🚀`);

  const integration =
    finalArgs.integration ?? (await getIntegrationForSetup(wizardOptions));

  switch (integration) {
    case Integration.nextjs:
      await runNextjsWizard(wizardOptions);
      break;
    // case Integration.react:
    //   await runReactWizard(wizardOptions);
    //   break;

    default:
      clack.log.error('No setup wizard selected!');
  }
}

async function detectIntegration(
  options: Pick<WizardOptions, 'installDir'>,
): Promise<Integration | undefined> {
  const integrationConfigs = Object.entries(INTEGRATION_CONFIG).sort(
    ([a], [b]) =>
      INTEGRATION_ORDER.indexOf(a as Integration) -
      INTEGRATION_ORDER.indexOf(b as Integration),
  );

  for (const [integration, config] of integrationConfigs) {
    const detected = await config.detect(options);
    if (detected) {
      return integration as Integration;
    }
  }
}

async function getIntegrationForSetup(
  options: Pick<WizardOptions, 'installDir'>,
) {
  const detectedIntegration = await detectIntegration(options);

  if (detectedIntegration) {
    clack.log.success(
      `Detected integration: ${getIntegrationDescription(detectedIntegration)}`,
    );
    return detectedIntegration;
  }

  const integration: Integration = await clack.select({
    message: 'What do you want to set up?',
    options: [
      { value: Integration.nextjs, label: 'Next.js' },
      { value: Integration.react, label: 'React' },
    ],
  });

  return integration;
}

function getIntegrationDescription(integration: Integration): string {
  switch (integration) {
    case Integration.nextjs:
      return 'Next.js';
    case Integration.react:
      return 'React';
    default:
      return 'Unknown';
  }
}
