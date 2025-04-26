# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2025-04-27

### Changed

- Privy with Wagmi integration

### Fixed

- Fixed an extra log of installDir
- Fixed warning caused by multiple node instances

## [1.0.2] - 2025-04-25

### Changed

- Updated backend connection to use webwizard.dev URL instead of vercel one

### Fixed

- Removed redundant installation of `@privy-io/react-auth` dependency

## [1.0.1] - 2025-04-25

### Changed

- Updated analytics URL for production environment

### Removed

- Eliminated `IS_DEV` flag that was used for development environments

## [1.0.0] - 2025-04-24

### Added

- Initial release of Web3 Wizard
- Support for Next.js App Router and Pages Router implementations
- Automatic detection of project type
- Comprehensive setup wizard for initial project configuration
- Seamless Next.js integration for Privy authentication
