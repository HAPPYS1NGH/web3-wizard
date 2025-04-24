// TODO: Remove this File
import { IS_DEV } from "../lib/constants";

export const getAssetHostFromHost = (host: string) => {
  if (host.includes("us.i.posthog.com")) {
    return "https://us-assets.i.posthog.com";
  }

  if (host.includes("eu.i.posthog.com")) {
    return "https://eu-assets.i.posthog.com";
  }

  return host;
};

export const getUiHostFromHost = (host: string) => {
  if (host.includes("us.i.posthog.com")) {
    return "https://us.posthog.com";
  }

  if (host.includes("eu.i.posthog.com")) {
    return "https://eu.posthog.com";
  }

  return host;
};
