import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import useInitialization from '@/hooks/useInitialization'
import useWalletConnectEventsManager from '@/hooks/useWalletConnectEventsManager'
import { createTheme, NextUIProvider } from '@nextui-org/react'
import { AppProps } from 'next/app'
import '../../public/main.css'

import { WagmiConfig, createClient, configureChains } from 'wagmi'
import { mainnet, goerli, polygon, polygonMumbai } from 'wagmi/chains'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { Chain } from 'wagmi/chains'
import useLitAuth from '@/hooks/useLitAuth'

const chronicleChain: Chain = {
  id: 175177,
  name: 'Chronicle',
  network: 'chronicle',
  // iconUrl: 'https://example.com/icon.svg',
  // iconBackground: '#fff',
  nativeCurrency: {
    decimals: 18,
    name: 'Chronicle - Lit Protocol Testnet',
    symbol: 'LIT'
  },
  rpcUrls: {
    default: {
      http: ['https://chain-rpc.litprotocol.com/http']
    },
    public: {
      http: ['https://chain-rpc.litprotocol.com/http']
    }
  },
  blockExplorers: {
    default: {
      name: 'Chronicle - Lit Protocol Testnet',
      url: 'https://chain.litprotocol.com'
    }
  },
  testnet: true
}

const { provider, chains } = configureChains(
  [chronicleChain, mainnet, polygon, goerli, polygonMumbai],
  [
    jsonRpcProvider({
      rpc: chain => ({ http: chain.rpcUrls.default.http[0] })
    })
  ]
)

const client = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'wagmi'
      }
    })
  ],
  provider
})

export default function App({ Component, pageProps }: AppProps) {
  // Authenticate with Lit
  const { authenticated } = useLitAuth()

  // Once authenticated, initialize WalletConnect client
  const initialized = useInitialization(authenticated)

  // Once initialized, set up WalletConnect event manager
  useWalletConnectEventsManager(initialized)

  // render app
  return (
    <NextUIProvider theme={createTheme({ type: 'dark' })}>
      <WagmiConfig client={client}>
        <Layout>
          <Component {...pageProps} />
        </Layout>

        <Modal />
      </WagmiConfig>
    </NextUIProvider>
  )
}
