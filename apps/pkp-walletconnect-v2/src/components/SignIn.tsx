import PageHeader from '@/components/PageHeader'
import useLitAuth from '@/hooks/useLitAuth'
import { Loading, Text } from '@nextui-org/react'
import { Fragment, useState } from 'react'
import { useConnect, useAccount, useDisconnect } from 'wagmi'

export default function SignIn() {
  const { connectAsync, connectors } = useConnect()
  const { isConnected, connector, address } = useAccount()
  const { disconnectAsync } = useDisconnect()

  const { error, authWithEthWallet } = useLitAuth()

  const [loading, setLoading] = useState(false)

  /**
   * Use wagmi to connect one's eth wallet and then request a signature from one's wallet
   */
  async function handleConnectWallet(c: any) {
    setLoading(true)
    const { account, chain, connector } = await connectAsync(c)
    await authWithEthWallet(account, connector!)
    setLoading(false)
  }

  if (loading) {
    return <Loading />
  }

  return (
    <Fragment>
      <PageHeader title="Sign in with Lit"></PageHeader>
      <Text h4 css={{ marginBottom: '$5' }}>
        Sign in with Lit
      </Text>
      {error && <p>{error.message}</p>}
      {isConnected ? (
        <>
          <button
            disabled={!connector!.ready}
            key={connector!.id}
            onClick={async () => await authWithEthWallet(address!, connector!)}
          >
            Continue with {connector!.name}
          </button>
          <button
            onClick={async () => {
              await disconnectAsync()
            }}
          >
            Disconnect wallet
          </button>
        </>
      ) : (
        <>
          {/* If wallet is not connected, show all connect wallet options */}
          {connectors.map(connector => (
            <button
              disabled={!connector.ready}
              key={connector.id}
              onClick={async () => {
                await handleConnectWallet({ connector })
              }}
            >
              {connector.name}
            </button>
          ))}
        </>
      )}
    </Fragment>
  )
}
