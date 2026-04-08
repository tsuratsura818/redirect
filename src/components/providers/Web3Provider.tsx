// src/components/providers/Web3Provider.tsx
// ============================================
// wagmi v2 + RainbowKit v2 Provider
// 既存のProviderツリーの内側にラップして使用
// SSG時にはスキップし、クライアントサイドのみで初期化
// ============================================

'use client';

import { ReactNode, useState, useEffect } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit';
import { polygon, sepolia } from 'wagmi/chains';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

  // projectId未設定 or SSR時はchildrenのみ返す
  if (!mounted || !projectId) {
    return <>{children}</>;
  }

  const activeChain = Number(process.env.NEXT_PUBLIC_CHAIN_ID) === 137 ? polygon : sepolia;

  const config = getDefaultConfig({
    appName: 'Pivolink',
    projectId,
    chains: [activeChain],
    ssr: true,
  });

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#028090',
            accentColorForeground: '#FFFFFF',
            borderRadius: 'medium',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
