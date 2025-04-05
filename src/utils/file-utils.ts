import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import glob from 'fast-glob';
import clack from './clack';
import { Integration } from '../lib/constants';
import type { ExtraIntegrationData, FileChange } from './types';

export async function getRelevantFilesForIntegration({
  installDir,
  integration,
}: {
  installDir: string;
  integration: Integration;
}): Promise<string[]> {
  const patterns = getRelevantPatternsForIntegration(integration);
  
  const files = await glob(patterns, {
    cwd: installDir,
    absolute: true,
    onlyFiles: true,
  });
  
  return files;
}

function getRelevantPatternsForIntegration(integration: Integration): string[] {
  switch (integration) {
    case Integration.nextjs:
      return [
        'app/layout.{js,jsx,ts,tsx}',
        'app/page.{js,jsx,ts,tsx}',
        'pages/_app.{js,jsx,ts,tsx}',
        'pages/index.{js,jsx,ts,tsx}',
        '.env*',
      ];
    case Integration.react:
      return [
        'src/App.{js,jsx,ts,tsx}',
        'src/index.{js,jsx,ts,tsx}',
        'src/main.{js,jsx,ts,tsx}',
        '.env*',
      ];
    case Integration.reown:
      return [
        'app/layout.{js,jsx,ts,tsx}',
        'app/page.{js,jsx,ts,tsx}',
        '.env*',
      ];
    default:
      return [];
  }
}

export async function getFilesToChange({
  integration,
  relevantFiles,
  documentation,
  wizardHash,
  projectId,
  extraData,
}: {
  integration: Integration;
  relevantFiles: string[];
  documentation: string;
  wizardHash: string;
  projectId: string;
  extraData?: ExtraIntegrationData;
}): Promise<FileChange[]> {
  // This is a placeholder for what could be an AI-driven function
  // For now, we'll manually generate file changes based on the integration type
  
  const spinner = clack.spinner();
  spinner.start('Analyzing your codebase to determine necessary changes...');
  
  // For demo purposes, let's create new files
  const filesToChange: FileChange[] = [];
  
  switch (integration) {
    case Integration.nextjs:
      // Check if we have app dir or pages dir
      const appDirPattern = relevantFiles.find(file => file.includes('app/'));
      
      if (appDirPattern) {
        // App router approach
        filesToChange.push({
          filePath: path.join(path.dirname(path.dirname(appDirPattern)), 'app/providers.tsx'),
          content: getAppRouterProviderContent(projectId),
          isNewFile: true,
        });
        
        filesToChange.push({
          filePath: path.join(path.dirname(path.dirname(appDirPattern)), 'app/components/ConnectButton.tsx'),
          content: getConnectButtonContent(),
          isNewFile: true,
        });
      } else {
        // Pages router approach
        const pagesDirPattern = relevantFiles.find(file => file.includes('pages/'));
        
        if (pagesDirPattern) {
          filesToChange.push({
            filePath: path.join(path.dirname(path.dirname(pagesDirPattern)), 'components/Web3Provider.tsx'),
            content: getPagesRouterProviderContent(projectId),
            isNewFile: true,
          });
          
          filesToChange.push({
            filePath: path.join(path.dirname(path.dirname(pagesDirPattern)), 'components/ConnectButton.tsx'),
            content: getConnectButtonContent(),
            isNewFile: true,
          });
        }
      }
      break;
      
    case Integration.react:
      // Assume standard React app structure
      const appFile = relevantFiles.find(file => file.includes('App.'));
      
      if (appFile) {
        filesToChange.push({
          filePath: path.join(path.dirname(appFile), 'components/Web3Provider.tsx'),
          content: getReactProviderContent(projectId),
          isNewFile: true,
        });
        
        filesToChange.push({
          filePath: path.join(path.dirname(appFile), 'components/ConnectButton.tsx'),
          content: getConnectButtonContent(),
          isNewFile: true,
        });
      }
      break;
      
    case Integration.reown:
      // Check if we have app dir
      const reownAppDirPattern = relevantFiles.find(file => file.includes('app/'));
      
      if (reownAppDirPattern && extraData) {
        const reownAppId = extraData.reownAppId || 'your-reown-app-id';
        const reownApiKey = extraData.reownApiKey || 'your-reown-api-key';
        
        // App router approach for Reown
        filesToChange.push({
          filePath: path.join(path.dirname(path.dirname(reownAppDirPattern)), 'app/providers.tsx'),
          content: getReownProviderContent(projectId, reownAppId),
          isNewFile: true,
        });
        
        filesToChange.push({
          filePath: path.join(path.dirname(path.dirname(reownAppDirPattern)), 'app/api/reown/route.ts'),
          content: getReownApiRouteContent(reownApiKey),
          isNewFile: true,
        });
        
        filesToChange.push({
          filePath: path.join(path.dirname(path.dirname(reownAppDirPattern)), 'app/components/ConnectButton.tsx'),
          content: getReownConnectButtonContent(),
          isNewFile: true,
        });
      }
      break;
  }
  
  spinner.stop('Analysis complete!');
  
  return filesToChange;
}

export async function generateFileChangesForIntegration({
  integration,
  filesToChange,
  wizardHash,
  installDir,
  documentation,
  projectId,
  extraData,
}: {
  integration: Integration;
  filesToChange: FileChange[];
  wizardHash: string;
  installDir: string;
  documentation: string;
  projectId: string;
  extraData?: ExtraIntegrationData;
}): Promise<void> {
  for (const fileChange of filesToChange) {
    const absolutePath = path.isAbsolute(fileChange.filePath)
      ? fileChange.filePath
      : path.join(installDir, fileChange.filePath);
    
    // Create directory if it doesn't exist
    const dir = path.dirname(absolutePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    
    if (fileChange.isNewFile || !existsSync(absolutePath)) {
      // Create new file
      writeFileSync(absolutePath, fileChange.content);
      clack.log.success(`Created new file: ${path.relative(installDir, absolutePath)}`);
    } else {
      // Update existing file (not implemented for simplicity)
      clack.log.info(`File already exists: ${path.relative(installDir, absolutePath)}`);
    }
  }
  
  // Create README with instructions
  const readmePath = path.join(installDir, 'WALLETCONNECT_SETUP.md');
  writeFileSync(readmePath, documentation);
  clack.log.success('Created setup instructions in WALLETCONNECT_SETUP.md');
}

function getAppRouterProviderContent(projectId: string): string {
  return `'use client'

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
}`;
}

function getPagesRouterProviderContent(projectId: string): string {
  return `import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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
}`;
}

function getReactProviderContent(projectId: string): string {
  return `import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { metaMask, walletConnect } from 'wagmi/connectors'
import { ReactNode, useState } from 'react'

// Get projectId from environment variable
const projectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID || '${projectId}'

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
}`;
}

function getReownProviderContent(projectId: string, reownAppId: string): string {
  return `'use client'

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
}`;
}

function getReownApiRouteContent(apiKey: string): string {
  return `import { ReownAPI } from '@reownit/next'

// Initialize ReownAPI with your API key
const reownAPI = new ReownAPI({ 
  apiKey: process.env.REOWN_API_KEY
})

// Export handlers for GET and POST requests
export const GET = reownAPI.createGETHandler()
export const POST = reownAPI.createPOSTHandler()`;
}

function getConnectButtonContent(): string {
  return `import { useAccount, useConnect, useDisconnect } from 'wagmi'

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
}`;
}

function getReownConnectButtonContent(): string {
  return `'use client'

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
}`;
}
