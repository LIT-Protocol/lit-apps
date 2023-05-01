import SettingsStore from '@/store/SettingsStore'
import { useCallback, useState } from 'react'
import { Connector } from 'wagmi'
import { createPKPClient, fetchMyPKPs, litAuthClient } from '@/utils/LitAuthUtil'
import { ProviderType } from '@lit-protocol/constants'
import { AuthMethod } from '@lit-protocol/types'

export default function useLitAuth() {
  const [authenticated, setAuthenticated] = useState(false)
  const [error, setError] = useState<Error>()

  const handleAuth = useCallback(async (authMethod: AuthMethod): Promise<void> => {
    try {
      // Fetch my PKPs
      const pkps = await fetchMyPKPs(authMethod)
      SettingsStore.setMyPKPs(pkps)

      // Default to first PKP
      const account = 0
      const pkpPublicKey = pkps[account].publicKey
      SettingsStore.setAccount(account)

      // Initialize PKP client
      const pkpClient = await createPKPClient(pkpPublicKey, authMethod)
      SettingsStore.setPKPClient(pkpClient)

      setAuthenticated(true)
    } catch (err) {
      if (err instanceof Error) {
        setError(err)
      } else {
        setError(new Error('Failed to handle successful auth'))
      }
    }
  }, [])

  const authWithEthWallet = useCallback(
    async (address: string, connector: Connector): Promise<void> => {
      setAuthenticated(false)

      try {
        // Create a function to handle signing messages
        const signer = await connector.getSigner()
        const signAuthSig = async (message: string) => {
          const sig = await signer.signMessage(message)
          return sig
        }

        // Get auth method
        const provider = litAuthClient.getProvider(ProviderType.EthWallet)
        if (!provider) {
          throw new Error('litAuthClient EthWalletProvider not initialized')
        }
        const authMethod = await provider.authenticate({
          address,
          signMessage: signAuthSig
        })
        SettingsStore.setAuthMethod(authMethod)

        // Handle successful auth
        return await handleAuth(authMethod)
      } catch (err) {
        if (err instanceof Error) {
          setError(err)
        } else {
          setError(new Error('Failed to auth with Eth wallet'))
        }
      }
    },
    [handleAuth]
  )

  return { authenticated, error, authWithEthWallet }
}
