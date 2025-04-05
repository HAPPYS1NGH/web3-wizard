export function getReactDocs({
  language,
}: {
  language: 'typescript' | 'javascript';
}): string {
  const ext = language === 'typescript' ? 'tsx' : 'jsx';
  
  return `
# React WalletConnect Integration

## Step 1: Create a Web3 Provider component

Create a file at \`src/components/Web3Provider.${ext}\`:

\`\`\`${ext}
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { metaMask, walletConnect } from 'wagmi/connectors'
import { ReactNode, useState } from 'react'

// Get projectId from environment variable
const projectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID

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

## Step 2: Add the provider to your App

Update your \`src/App.${ext}\` file:

\`\`\`${ext}
import { Web3Provider } from './components/Web3Provider'

function App() {
  return (
    <Web3Provider>
      <div className="App">
        <header className="App-header">
          <h1>WalletConnect Integration</h1>
          <ConnectButton />
        </header>
      </div>
    </Web3Provider>
  )
}

export default App
\`\`\`

## Step 3: Create a Connect Button component

Create a file at \`src/components/ConnectButton.${ext}\`:

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

Make sure your \`.env\` file contains your WalletConnect Project ID:

\`\`\`
REACT_APP_WALLETCONNECT_PROJECT_ID=your_project_id
\`\`\`

For create-react-app projects, remember that environment variables need to be prefixed with REACT_APP_.
`;
}
