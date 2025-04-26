export const getNextjsAppRouterDocs = ({
  language,
}: {
  language: "typescript" | "javascript";
}) => {
  return `
==============================
FILE: providers.${language === "typescript" ? "tsx" : "jsx"}
LOCATION: Wherever other providers are, or the components directory
==============================
Changes:
- Create a Providers component that wraps your application with Privy authentication, wagmi, and React Query.
- Mark it with 'use client' directive since it uses client-side functionality.

Example:
--------------------------------------------------
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";

import { privyConfig } from "@/config/privyConfig";
import { wagmiConfig } from "@/config/wagmiConfig";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={privyConfig}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
--------------------------------------------------

==============================
FILE: config/privyConfig.${language === "typescript" ? "ts" : "js"}
LOCATION:  inside a config folder
==============================
Changes:
- Create a configuration file for Privy settings.

Example:
--------------------------------------------------
import type { PrivyClientConfig } from '@privy-io/react-auth';

 export const privyConfig: PrivyClientConfig = {
    embeddedWallets: {
        createOnLogin: 'users-without-wallets',
        requireUserPasswordOnCreate: true,
        showWalletUIs: true
    },
    loginMethods: ['wallet', 'email', 'sms'],
    appearance: {
        showWalletLoginFirst: true
    }
};
--------------------------------------------------

==============================
FILE: config/wagmiConfig.${language === "typescript" ? "ts" : "js"}
LOCATION: inside a config folder
==============================
Changes:
- Create a configuration file for Wagmi settings.
- CRITICAL: Always use this implementation with createConfig, not the simplified type-only version.
- Do not replace this with a type-only implementation.

Example:
--------------------------------------------------
import { mainnet, sepolia } from 'viem/chains';
import { http } from 'wagmi';

import { createConfig } from '@privy-io/wagmi';

export const wagmiConfig = createConfig({
    chains: [mainnet, sepolia],
    transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
    },
});
--------------------------------------------------

==============================
FILE: components/LoginButton.${language === "typescript" ? "tsx" : "jsx"}
LOCATION: Wherever the components directory is
==============================
Changes:
- Create a Login Button component.

Example:
--------------------------------------------------
import { useLogin, usePrivy } from "@privy-io/react-auth";

export function LoginButton() {
  const { ready, authenticated } = usePrivy();
  const { login } = useLogin();
  // Disable login when Privy is not ready or the user is already authenticated
  const disableLogin = !ready || (ready && authenticated);

  return (
    <button
      disabled={disableLogin}
      onClick={login}
      className="bg-purple-500 text-white p-2 rounded-sm hover:bg-purple-600 disabled:bg-purple-400"
    >
      Log in
    </button>
  );
}
--------------------------------------------------

==============================
FILE: layout.${language === "typescript" ? "tsx" : "jsx"}
LOCATION: Wherever the root layout is
==============================
Changes:
- Import the Providers component and wrap your application in it.
- This makes Privy, Wagmi, and React Query available throughout your application.

Example:
--------------------------------------------------
// other imports
import Providers from "@/components/providers"; // or "@/providers/index" if you created it there

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {/* If you have other providers, place them here */}
          {children}
          {/* If you have other providers that should be wrapped by Privy, place them here */}
        </Providers>
      </body>
    </html>
  )
}
--------------------------------------------------`;
};

export const getNextjsPagesRouterDocs = ({
  language,
}: {
  language: "typescript" | "javascript";
}) => {
  return `
==============================
FILE: providers.${language === "typescript" ? "tsx" : "jsx"}
LOCATION: Wherever the providers are or components directory
==============================
Changes:
- Create a Providers component that wraps your application with Privy authentication, wagmi, and React Query.
- Mark it with appropriate imports for Pages Router apps.
- Create config files for Privy and Wagmi in a config folder.
- Do not include types for .tsx files

Example:
--------------------------------------------------
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";

import { privyConfig } from "@/config/privyConfig";
import { wagmiConfig } from "@/config/wagmiConfig";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
      config={privyConfig}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
--------------------------------------------------

==============================
FILE: config/privyConfig.${language === "typescript" ? "ts" : "js"}
LOCATION: Wherever the config folder is
==============================
Changes:
- Create a configuration file for Privy settings.

Example:
--------------------------------------------------
import type { PrivyClientConfig } from '@privy-io/react-auth';

 export const privyConfig: PrivyClientConfig = {
    embeddedWallets: {
        createOnLogin: 'users-without-wallets',
        requireUserPasswordOnCreate: true,
        showWalletUIs: true
    },
    loginMethods: ['wallet', 'email', 'sms'],
    appearance: {
        showWalletLoginFirst: true
    }
};
--------------------------------------------------

==============================
FILE: config/wagmiConfig.${language === "typescript" ? "ts" : "js"}
LOCATION: Wherever the config folder is
==============================
Changes:
- Create a configuration file for Wagmi settings.
- CRITICAL: Always use this implementation with createConfig, not the simplified type-only version.
- Do not replace this with a type-only implementation.
Example:
--------------------------------------------------
import { mainnet, sepolia } from 'viem/chains';
import { http } from 'wagmi';

import { createConfig } from '@privy-io/wagmi';

export const wagmiConfig = createConfig({
    chains: [mainnet, sepolia],
    transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
    },
});

--------------------------------------------------

==============================
FILE: components/LoginButton.${language === "typescript" ? "tsx" : "jsx"}
LOCATION: Wherever the components folder is
==============================
Changes:
- Create a Login Button component.

Example:
--------------------------------------------------
import { useLogin, usePrivy } from "@privy-io/react-auth";

export function LoginButton() {
  const { ready, authenticated } = usePrivy();
  const { login } = useLogin();
  // Disable login when Privy is not ready or the user is already authenticated
  const disableLogin = !ready || (ready && authenticated);

  return (
    <button
      disabled={disableLogin}
      onClick={login}
      className="bg-purple-500 text-white p-2 rounded-sm hover:bg-purple-600 disabled:bg-purple-400"
    >
      Log in
    </button>
  );
}
--------------------------------------------------

==============================
FILE: _app.${language === "typescript" ? "tsx" : "jsx"}
LOCATION: Wherever the _app.${language === "typescript" ? "tsx" : "jsx"} file is
==============================
Changes:
- Initialize Privy in your _app file
- Wrap the application in PrivyProvider
- Note the use of 'NEXT_PUBLIC_PRIVY_APP_ID' environment variable

Example:
--------------------------------------------------
import type { AppProps } from 'next/app';
import Providers from '@/components/providers'; // or wherever you created it

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      {/* If you have other providers, place them here */}
      <Component {...pageProps} />
      {/* If you have other providers that should be wrapped by Privy, place them here */}
    </Providers>
  );
}

export default MyApp;
--------------------------------------------------`;
};
