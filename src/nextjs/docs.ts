import { getAssetHostFromHost, getUiHostFromHost } from "../utils/urls";

export const getNextjsAppRouterDocs = ({
  language,
}: {
  language: "typescript" | "javascript";
}) => {
  return `
==============================
FILE: PrivyProvider.${
    language === "typescript" ? "tsx" : "jsx"
  } (create this in your components directory)
LOCATION: Wherever other providers are, or the components directory
==============================
Changes:
- Create a PrivyProvider component that will wrap your application with Privy authentication.
- Mark it with 'use client' directive since it uses client-side functionality.

Example:
--------------------------------------------------
'use client';

import { PrivyProvider as PrivyAuthProvider } from '@privy-io/react-auth';

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyAuthProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        // Customize Privy's appearance in your app
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          logo: 'https://your-logo-url'
        },
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: 'users-without-wallets'
        }
      }}
    >
      {children}
    </PrivyAuthProvider>
  );
}
--------------------------------------------------

==============================
FILE: layout.${language === "typescript" ? "tsx" : "jsx"}
LOCATION: Wherever the root layout is
==============================
Changes:
- Import the PrivyProvider and wrap your application in it.
- This makes Privy available throughout your application.

Example:
--------------------------------------------------
// other imports
import { PrivyProvider } from "@/components/PrivyProvider"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* other providers */}
          <PrivyProvider>
            {children}
          </PrivyProvider>
        {/* other providers */}
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
FILE: _app.${language === "typescript" ? "tsx" : "jsx"}
LOCATION: Wherever the root _app.${
    language === "typescript" ? "tsx" : "jsx"
  } file is
==============================
Changes:
- Initialize Privy in your _app file
- Wrap the application in PrivyProvider
- Note the use of 'NEXT_PUBLIC_PRIVY_APP_ID' environment variable

Example:
--------------------------------------------------
import { PrivyProvider } from '@privy-io/react-auth';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          // You can customize this with your own logo
          logo: 'https://your-logo-url'
        },
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: 'users-without-wallets'
        }
      }}
    >
      <Component {...pageProps} />
    </PrivyProvider>
  );
}

export default MyApp;

--------------------------------------------------
`;
};
