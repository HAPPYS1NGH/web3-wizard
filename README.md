# Web3 Wizard 🚀

The Web3 Wizard helps you quickly add Privy Authentication and WalletConnect functionality to your NextJS or React project.

## Usage

To use the wizard, you can run it directly using:

```bash
npx web3-wizard
```

Currently, the wizard can be used for React & Next.js projects. The wizard will detect your project type and guide you through the integration process.

## What it does

The Web3 Wizard:

1. Detects your project type (Next.js or React)
2. Installs required dependencies:
   - wagmi
   - viem
   - @tanstack/react-query
   - @privyio/react
3. Creates necessary components:
   - Privy provider setup
   - Authentication components with login/logout functionality
   - Web3 provider configuration
4. Configures environment variables for your Privy Project ID
5. Provides documentation for further customization

## Options

The following CLI arguments are available:

| Option            | Description                          | Type    | Default             | Environment Variable      |
| ----------------- | ------------------------------------ | ------- | ------------------- | ------------------------- |
| `--help`          | Show help                            | boolean |                     |                           |
| `--version`       | Show version number                  | boolean |                     |                           |
| `--debug`         | Enable verbose logging               | boolean | `false`             | `WEB3_WIZARD_DEBUG`       |
| `--integration`   | Choose the integration to setup      | choices | Select during setup | `WEB3_WIZARD_INTEGRATION` |
| `--force-install` | Force install the SDK NPM packages   | boolean | `false`             |                           |
| `--install-dir`   | Relative path to install in          | string  | `.`                 | `WEB3_WIZARD_INSTALL_DIR` |
| `--default`       | Select default options automatically | boolean | `false`             | `WEB3_WIZARD_DEFAULT`     |

## Requirements

1. A Privy Project ID (get one at [Privy](https://privy.io/))
2. A Next.js or React project

## License

MIT
