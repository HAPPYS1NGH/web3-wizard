export function getNextjsAppRouterDocs({
  language,
}: {
  language: 'typescript' | 'javascript';
}): string {
  const ext = language === 'typescript' ? 'tsx' : 'jsx';
  
  return `
# Next.js App Router WalletConnect Integration

## Step 1: Create a root provider component

Create a file at \`app/providers.${ext}\`:

\`\`\`${ext}
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { metaMask, walletConnect } from 'wagmi/connectors'
import { ReactNode, useState } from 'react'

// Get projectId from environment variable
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string

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
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
\`\`\`

## Step 2: Add the provider to your layout

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

## Step 3: Create a Connect Button component

Create a file at \`app/components/ConnectButton.${ext}\`:

\`\`\`${ext}
'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'

export function ConnectButton() {
  const { connectors, connect, status: connectStatus, error: connectError } = useConnect()
  const { disconnect, status: disconnectStatus } = useDisconnect()
  const { isConnected, address } = useAccount()

  if (isConnected) {
    return (
      <div>
        <div>Connected to {address?.substring(0, 6)}...{address?.substring(address.length - 4)}</div>
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

## Step 4: Use the Connect Button in your app

Add the ConnectButton to any page where you want users to connect their wallets:

\`\`\`${ext}
'use client'

import { ConnectButton } from './components/ConnectButton'

export default function Home() {
  return (
    <main>
      <h1>WalletConnect Integration</h1>
      <ConnectButton />
    </main>
  )
}
\`\`\`

Make sure your \`.env.local\` file contains your WalletConnect Project ID:

\`\`\`
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
\`\`\`
`;
}

export function getNextjsPagesRouterDocs({
  language,
}: {
  language: 'typescript' | 'javascript';
}): string {
  const ext = language === 'typescript' ? 'tsx' : 'jsx';
  
  return `
# Next.js Pages Router WalletConnect Integration

## Step 1: Create a Web3 Provider component

Create a file at \`components/Web3Provider.${ext}\`:

\`\`\`${ext}
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { metaMask, walletConnect } from 'wagmi/connectors'
import { ReactNode, useState } from 'react'

// Get projectId from environment variable
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string

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

export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
\`\`\`

## Step 2: Add the provider to your _app file

Update your \`pages/_app.${ext}\` file:

\`\`\`${ext}
import { Web3Provider } from '../components/Web3Provider'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Web3Provider>
      <Component {...pageProps} />
    </Web3Provider>
  )
}

export default MyApp
\`\`\`

## Step 3: Create a Connect Button component

Create a file at \`components/ConnectButton.${ext}\`:

\`\`\`${ext}
import { useAccount, useConnect, useDisconnect } from 'wagmi'

export function ConnectButton() {
  const { connectors, connect, status: connectStatus, error: connectError } = useConnect()
  const { disconnect, status: disconnectStatus } = useDisconnect()
  const { isConnected, address } = useAccount()

  if (isConnected) {
    return (
      <div>
        <div>Connected to {address?.substring(0, 6)}...{address?.substring(address.length - 4)}</div>
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

## Step 4: Use the Connect Button in your pages

Add the ConnectButton to any page where you want users to connect their wallets:

\`\`\`${ext}
import { ConnectButton } from '../components/ConnectButton'

export default function Home() {
  return (
    <main>
      <h1>WalletConnect Integration</h1>
      <ConnectButton />
    </main>
  )
}
\`\`\`

Make sure your \`.env.local\` file contains your WalletConnect Project ID:

\`\`\`
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
\`\`\`
`;
}
