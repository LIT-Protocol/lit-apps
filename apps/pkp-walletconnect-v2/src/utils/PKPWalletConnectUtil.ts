import { PKPClient } from '@lit-protocol/pkp-client'
import { PKPWalletConnect } from '@lit-protocol/pkp-walletconnect'

export let pkpWalletConnect: any

export async function createPKPWalletConnect(relayerRegionURL: string): Promise<void> {
  pkpWalletConnect = new PKPWalletConnect()

  const config = {
    logger: 'debug',
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
    relayUrl: relayerRegionURL ?? process.env.NEXT_PUBLIC_RELAY_URL
  }

  pkpWalletConnect = await pkpWalletConnect.initClient({
    ...config,
    metadata: {
      name: 'React Web3Wallet',
      description: 'React Web3Wallet for WalletConnect',
      url: 'https://walletconnect.com/',
      icons: ['https://avatars.githubusercontent.com/u/37784886']
    }
  })
}

export function addPKPClient(pkpClient: PKPClient): void {
  pkpWalletConnect.addPKPClient(pkpClient)
}

export async function pair(params: { uri: string }): Promise<void> {
  return await pkpWalletConnect.pair({ uri: params.uri })
}
