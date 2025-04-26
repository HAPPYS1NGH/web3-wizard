import { existsSync } from "fs";
import path from "path";
import clack from "../utils/clack";

export enum NextJsRouter {
  APP_ROUTER = "app",
  PAGES_ROUTER = "pages",
}

export function getNextJsRouterName(router: NextJsRouter): string {
  switch (router) {
    case NextJsRouter.APP_ROUTER:
      return "App Router";
    case NextJsRouter.PAGES_ROUTER:
      return "Pages Router";
  }
}

export function getNextJsVersionBucket(version: string | undefined): string {
  if (!version) {
    return "unknown";
  }

  const major = parseInt(version.split(".")[0].replace(/^\D+/g, ""), 10);

  if (major >= 13) {
    return "13+";
  } else if (major >= 12) {
    return "12";
  } else {
    return "old";
  }
}
export async function getNextJsRouter(options: {
  installDir: string;
}): Promise<NextJsRouter> {
  const hasAppDir =
    existsSync(path.join(options.installDir, "app")) ||
    existsSync(path.join(options.installDir, "src", "app"));
  const hasPagesDir =
    existsSync(path.join(options.installDir, "pages")) ||
    existsSync(path.join(options.installDir, "src", "pages"));

  if (hasAppDir && !hasPagesDir) {
    return NextJsRouter.APP_ROUTER;
  } else if (!hasAppDir && hasPagesDir) {
    return NextJsRouter.PAGES_ROUTER;
  }

  if (hasAppDir && hasPagesDir) {
    return await clack.select({
      message: "Which Next.js router are you primarily using?",
      options: [
        { value: NextJsRouter.APP_ROUTER, label: "App Router" },
        { value: NextJsRouter.PAGES_ROUTER, label: "Pages Router" },
      ],
    });
  }

  clack.log.info(
    "Could not automatically detect your Next.js router. Defaulting to App Router."
  );
  return NextJsRouter.APP_ROUTER;
}
