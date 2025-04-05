#!/usr/bin/env node
import { satisfies } from 'semver';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const NODE_VERSION_RANGE = '>=18.20.0';

// Check Node.js version before importing other modules
if (!satisfies(process.version, NODE_VERSION_RANGE)) {
  console.error(
    `Web3 Wizard requires Node.js ${NODE_VERSION_RANGE}. You are using Node.js ${process.version}. Please upgrade your Node.js version.`,
  );
  process.exit(1);
}

import { run } from './src/run';

// Parse command line arguments
const argv = yargs(hideBin(process.argv)).options({
  debug: {
    default: false,
    describe: 'Enable verbose logging\nenv: WEB3_WIZARD_DEBUG',
    type: 'boolean',
  },
}).argv;

void run(argv);
