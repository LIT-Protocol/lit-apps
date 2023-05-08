import SettingsStore from '@/store/SettingsStore'
import { useCallback, useEffect, useState } from 'react'
import { Connector } from 'wagmi'
import { EthWalletProvider, LitAuthClient } from '@lit-protocol/lit-auth-client'
import { ProviderType } from '@lit-protocol/constants'
import { PKPClient } from '@lit-protocol/pkp-client'
import { AuthMethod, IRelayPKP, SessionSigs } from '@lit-protocol/types'
import { useSnapshot } from 'valtio'

// let ipfsClient = null;
// try {
//   ipfsClient = require('ipfs-http-client');
// } catch (err) {}

export default function useLitAuth() {
  const [litAuthClient, setLitAuthClient] = useState<LitAuthClient>()
  const [authenticated, setAuthenticated] = useState(false)
  const [pkpClient, setPKPClient] = useState<PKPClient>()
  const [error, setError] = useState<Error>()

  const { myPKPs, account, sessionSigs, sessionExpiration } = useSnapshot(SettingsStore.state)

  const fetchMyPKPs = useCallback(
    async (authMethod: AuthMethod): Promise<IRelayPKP[]> => {
      const provider = litAuthClient!.getProvider(ProviderType.EthWallet)
      if (!provider) {
        throw new Error('litAuthClient EthWalletProvider not initialized')
      }

      // Fetch PKPs
      let pkps: IRelayPKP[] = await provider.fetchPKPsThroughRelayer(authMethod)

      // Mint a PKP if didn't fetch any associated with auth method
      if (pkps.length === 0) {
        const txHash: string = await provider.mintPKPThroughRelayer(authMethod)
        const response = await provider.relay.pollRequestUntilTerminalState(txHash)
        if (
          !response ||
          !response.pkpTokenId ||
          !response.pkpPublicKey ||
          !response.pkpEthAddress
        ) {
          throw new Error('Failed to mint a PKP')
        }
        const newPKP: IRelayPKP = {
          tokenId: response.pkpTokenId,
          publicKey: response.pkpPublicKey,
          ethAddress: response.pkpEthAddress
        }
        pkps = [newPKP]
      }
      SettingsStore.setMyPKPs(pkps)
      return pkps
    },
    [litAuthClient]
  )

  const createSession = useCallback(
    async (
      pkpPublicKey: string,
      authMethod: AuthMethod
    ): Promise<{ sessionSigs: SessionSigs; sessionExp: string }> => {
      const provider = litAuthClient!.getProvider(ProviderType.EthWallet)
      if (!provider) {
        throw new Error('litAuthClient EthWalletProvider not initialized')
      }

      console.log('Generating session sigs...')

      // Get session sigs
      const sessionExp = litAuthClient!.litNodeClient.getExpiration()
      const sessionSigs = await provider.getSessionSigs({
        pkpPublicKey: pkpPublicKey,
        authMethod,
        sessionSigsParams: {
          chain: 'ethereum',
          resources: [`litAction://*`]
        }
      })
      SettingsStore.setSession(sessionSigs, sessionExp)
      return { sessionSigs, sessionExp }
    },
    [litAuthClient]
  )

  const createPKPClient = useCallback(
    async (
      pkpPublicKey: string,
      sessionSigs: SessionSigs,
      sessionExp: string
    ): Promise<PKPClient> => {
      console.log('Setting up a PKPClient...')
      // Create PKP client
      const pkpClient = new PKPClient({
        pkpPubKey: pkpPublicKey,
        controllerSessionSigs: sessionSigs,
        sessionSigsExpiration: sessionExp
      })
      await pkpClient.connect()
      // SettingsStore.setPKPClient(pkpClient)
      setPKPClient(pkpClient)
      return pkpClient
    },
    []
  )

  const handleAuth = useCallback(
    async (authMethod: AuthMethod): Promise<void> => {
      try {
        // Fetch my PKPs
        const pkps = await fetchMyPKPs(authMethod)

        // Default to first PKP
        const account = 0
        const pkpPublicKey = pkps[account].publicKey
        SettingsStore.setAccount(account)

        // Get session sigs for current PKP
        const { sessionSigs, sessionExp } = await createSession(pkpPublicKey, authMethod)

        // Create PKPClient
        const pkpClient = await createPKPClient(pkpPublicKey, sessionSigs, sessionExp)

        setAuthenticated(true)
      } catch (err) {
        console.error(err)
        if (err instanceof Error) {
          setError(err)
        } else {
          setError(new Error('Failed to handle successful auth'))
        }
      }
    },
    [fetchMyPKPs, createSession, createPKPClient]
  )

  const authWithEthWallet = useCallback(
    async (address: string, connector: Connector): Promise<void> => {
      setAuthenticated(false)
      setError(undefined)

      try {
        // Create a function to handle signing messages
        const signer = await connector.getSigner()
        const signAuthSig = async (message: string) => {
          const sig = await signer.signMessage(message)
          return sig
        }

        // Get auth method
        const provider = litAuthClient!.getProvider(ProviderType.EthWallet)
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
        console.error(err)
        if (err instanceof Error) {
          setError(err)
        } else {
          setError(new Error('Failed to auth with Eth wallet'))
        }
      }
    },
    [litAuthClient, handleAuth]
  )

  const checkIfSessionIsValid = useCallback(async () => {
    if (sessionExpiration && Date.now() > Number(sessionExpiration)) {
      setAuthenticated(false)
      setPKPClient(undefined)
      SettingsStore.clearSession()
      return
    }

    if (myPKPs && sessionSigs && sessionExpiration) {
      if (!authenticated) {
        setAuthenticated(true)
      }
      if (!pkpClient) {
        const pkpPublicKey = myPKPs[account].publicKey
        createPKPClient(pkpPublicKey, sessionSigs, sessionExpiration)
      }
    } else {
      setAuthenticated(false)
    }
  }, [authenticated, myPKPs, account, sessionSigs, sessionExpiration, pkpClient, createPKPClient])

  useEffect(() => {
    if (!litAuthClient) {
      const litAuthClient = new LitAuthClient({
        litRelayConfig: {
          relayApiKey: 'test-api-key'
        }
      })
      litAuthClient.initProvider<EthWalletProvider>(ProviderType.EthWallet)
      setLitAuthClient(litAuthClient)
    }
  }, [litAuthClient])

  useEffect(() => {
    checkIfSessionIsValid()
  }, [checkIfSessionIsValid])

  return { authenticated, pkpClient, error, authWithEthWallet }
}
