export function getReactDocs({
  language,
}: {
  language: 'typescript' | 'javascript';
}): string {
  const ext = language === 'typescript' ? 'tsx' : 'jsx';

  return `
# React Privy Integration

## Step 1: Set up Privy in your index.${ext} file

Update your main entry file (usually \`src/index.${ext}\`):

\`\`\`${ext}
import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';

import {PrivyProvider} from '@privy-io/react-auth';

import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <PrivyProvider
      appId={process.env.REACT_APP_PRIVY_APP_ID}
      config={{
        // Display email and wallet as login methods
        loginMethods: ['email', 'wallet'],
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
      <App />
    </PrivyProvider>
  </React.StrictMode>
);
\`\`\`

`;
}
