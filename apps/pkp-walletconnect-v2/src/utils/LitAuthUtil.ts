import { EthWalletProvider, LitAuthClient } from '@lit-protocol/lit-auth-client'
import { ProviderType } from '@lit-protocol/constants'
import { PKPClient } from '@lit-protocol/pkp-client'
import { AuthMethod, IRelayPKP } from '@lit-protocol/types'

export let litAuthClient: LitAuthClient = initLitAuthClient()

function initLitAuthClient() {
  const litAuthClient = new LitAuthClient({
    litRelayConfig: {
      relayApiKey: 'test-api-key'
    }
  })
  litAuthClient.initProvider<EthWalletProvider>(ProviderType.EthWallet)
  return litAuthClient
}

export async function fetchMyPKPs(authMethod: AuthMethod): Promise<IRelayPKP[]> {
  const provider = litAuthClient.getProvider(ProviderType.EthWallet)
  if (!provider) {
    throw new Error('litAuthClient EthWalletProvider not initialized')
  }

  // Fetch PKPs
  let pkps: IRelayPKP[] = await provider.fetchPKPsThroughRelayer(authMethod)

  // Mint a PKP if didn't fetch any associated with auth method
  if (pkps.length === 0) {
    const txHash: string = await provider.mintPKPThroughRelayer(authMethod)
    const response = await provider.relay.pollRequestUntilTerminalState(txHash)
    if (!response || !response.pkpTokenId || !response.pkpPublicKey || !response.pkpEthAddress) {
      throw new Error('Failed to mint a PKP')
    }
    const newPKP: IRelayPKP = {
      tokenId: response.pkpTokenId,
      publicKey: response.pkpPublicKey,
      ethAddress: response.pkpEthAddress
    }
    pkps = [newPKP]
  }
  return pkps
}

export async function createPKPClient(
  pkpPublicKey: string,
  authMethod: AuthMethod
): Promise<PKPClient> {
  const provider = litAuthClient.getProvider(ProviderType.EthWallet)
  if (!provider) {
    throw new Error('litAuthClient EthWalletProvider not initialized')
  }

  // Get session sigs
  const exp = litAuthClient.litNodeClient.getExpiration()
  const sessionSigs = await provider.getSessionSigs({
    pkpPublicKey: pkpPublicKey,
    authMethod,
    sessionSigsParams: {
      chain: 'ethereum',
      resources: [`litAction://*`]
    }
  })

  // Create PKP client
  const pkpClient = new PKPClient({
    pkpPubKey: pkpPublicKey,
    controllerSessionSigs: sessionSigs,
    sessionSigsExpiration: exp
  })
  await pkpClient.connect()
  return pkpClient
}
