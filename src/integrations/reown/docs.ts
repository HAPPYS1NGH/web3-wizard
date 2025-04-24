export function getReownNextjsDocs({
  language,
}: {
  language: "typescript" | "javascript";
}): string {
  const ext = language === "typescript" ? "tsx" : "jsx";

  return `
# Reown App Kit with Next.js Integration

## Step 1: Create a Reown Client Provider

Create a file at \`app/providers.${ext}\`:

\`\`\`${ext}
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { metaMask, walletConnect } from 'wagmi/connectors'
import { ReownProvider } from '@reownit/next'
import { ReactNode, useState } from 'react'

// Get projectId and appId from environment variables
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string
const reownAppId = process.env.NEXT_PUBLIC_REOWN_APP_ID as string

// Create wagmi config
const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  connectors: [
    metaMask(),
    walletConnect({
      projectId,
      metadata: {
        name: 'Your App Name',
        description: 'Your app description',
        url: 'https://yourapp.com',
        icons: ['https://yourapp.com/icon.png'],
      },
    }),
  ],
})

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ReownProvider appId={reownAppId}>
          {children}
        </ReownProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
\`\`\`

## Step 2: Create an API Route for Reown Server Components

Create a file at \`app/api/reown/route.${ext}\`:

\`\`\`${ext}
import { ReownAPI } from '@reownit/next'

// Initialize ReownAPI with your API key
const reownAPI = new ReownAPI({ 
  apiKey: process.env.REOWN_API_KEY
})

// Export handlers for GET and POST requests
export const GET = reownAPI.createGETHandler()
export const POST = reownAPI.createPOSTHandler()
\`\`\`

## Step 3: Add the provider to your layout

Update your \`app/layout.${ext}\` file:

\`\`\`${ext}
import { Providers } from './providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
\`\`\`

## Step 4: Create a Connect Button component

Create a file at \`app/components/ConnectButton.${ext}\`:

\`\`\`${ext}
'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useReown } from '@reownit/next'

export function ConnectButton() {
  const { connectors, connect, status: connectStatus, error: connectError } = useConnect()
  const { disconnect, status: disconnectStatus } = useDisconnect()
  const { isConnected, address } = useAccount()
  const { user } = useReown()

  if (isConnected) {
    return (
      <div>
        <div>Connected to {address?.substring(0, 6)}...{address?.substring(address.length - 4)}</div>
        {user && <div>Reown user: {user.id}</div>}
        <button 
          onClick={() => disconnect()} 
          disabled={disconnectStatus === 'pending'}
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div>
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={connectStatus === 'pending'}
        >
          Connect with {connector.name}
          {connectStatus === 'pending' && ' (connecting...)'}
        </button>
      ))}
      
      {connectError && <div style={{ color: 'red' }}>{connectError.message}</div>}
    </div>
  )
}
\`\`\`

## Step 5: Use Server Components

You can now use Reown server components in your app pages:

\`\`\`${ext}
import { OwnedItems } from '@reownit/next/server'
import { ConnectButton } from './components/ConnectButton'

export default function Home() {
  return (
    <main>
      <h1>Reown App Kit Integration</h1>
      <ConnectButton />
      
      {/* Server Component to display owned NFTs */}
      <OwnedItems />
    </main>
  )
}
\`\`\`

Make sure your \`.env.local\` file contains all necessary environment variables:

\`\`\`
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_REOWN_APP_ID=your_reown_app_id
REOWN_API_KEY=your_reown_api_key
\`\`\`
`;
}
