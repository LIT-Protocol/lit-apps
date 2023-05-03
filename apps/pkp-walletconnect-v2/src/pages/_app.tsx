import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import useInitialization from '@/hooks/useInitialization'
import useWalletConnectEventsManager from '@/hooks/useWalletConnectEventsManager'
import { createTheme, NextUIProvider } from '@nextui-org/react'
import { AppProps } from 'next/app'
import '../../public/main.css'
import useLitAuth from '@/hooks/useLitAuth'

import { WagmiConfig, createClient, configureChains } from 'wagmi'
import { mainnet, goerli, polygon, polygonMumbai } from 'wagmi/chains'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { InjectedConnector } from 'wagmi/connectors/injected'
import SignIn from '@/components/SignIn'
import LoadingView from '@/components/LoadingView'

const { provider, chains } = configureChains(
  [mainnet, goerli, polygon, polygonMumbai],
  [alchemyProvider({ apiKey: 'onvoLvV97DDoLkAmdi0Cj7sxvfglKqDh' }), publicProvider()]
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
    }),
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true
      }
    })
  ],
  provider
})

export default function App({ Component, pageProps }: AppProps) {
  // Get auth state
  const { authenticated, pkpClient } = useLitAuth()
  //
  // Init WalletConnect client
  const initialized = useInitialization({ authenticated, pkpClient })

  // Once initialized, set up WalletConnect event manager
  useWalletConnectEventsManager(initialized)

  // render app
  return (
    <NextUIProvider theme={createTheme({ type: 'dark' })}>
      <WagmiConfig client={client}>
        <Layout>
          {!authenticated && <SignIn />}
          {authenticated && !initialized && <LoadingView />}
          {authenticated && initialized && <Component {...pageProps} />}
        </Layout>

        <Modal />
      </WagmiConfig>
    </NextUIProvider>
  )
}
