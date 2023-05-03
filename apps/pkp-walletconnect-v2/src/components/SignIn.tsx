import PageHeader from '@/components/PageHeader'
import { useIsMounted } from '@/hooks/useIsMounted'
import useLitAuth from '@/hooks/useLitAuth'
import { Button, Card, Col, Container, Grid, Loading, Text } from '@nextui-org/react'
import { Fragment, useState } from 'react'
import { useConnect, useAccount, useDisconnect } from 'wagmi'
import LoadingView from './LoadingView'

export default function SignIn() {
  const { connectAsync, connectors } = useConnect()
  const { isConnected, connector, address } = useAccount()
  const { disconnectAsync } = useDisconnect()

  const { error, authWithEthWallet } = useLitAuth()

  const [loading, setLoading] = useState(false)

  const isMounted = useIsMounted()

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
    return <LoadingView />
  }

  return (
    <Fragment>
      <PageHeader title="Sign in with Lit"></PageHeader>
      <Text h4 css={{ marginBottom: '$5' }}>
        Get started by connecting your wallet
      </Text>
      {error && (
        <Card css={{ mb: 16, bc: '$red900', br: '$xs' }}>
          <Card.Body>
            <Text size="$xs" color="$red300">
              ❗️ {error.message}
            </Text>
          </Card.Body>
        </Card>
      )}
      {isConnected ? (
        <Grid.Container gap={1} direction="column">
          {connector && (
            <Grid>
              <Button
                auto
                flat
                disabled={isMounted ? !connector.ready : false}
                key={connector.id}
                onClick={async () => {
                  setLoading(true)
                  await authWithEthWallet(address!, connector!)
                  setLoading(false)
                }}
                css={{ width: '100%' }}
              >
                Continue with {connector.name}
              </Button>
            </Grid>
          )}
          <Grid>
            <Button
              auto
              ghost
              onClick={async () => {
                await disconnectAsync()
              }}
              css={{ width: '100%' }}
            >
              Disconnect wallet
            </Button>
          </Grid>
        </Grid.Container>
      ) : (
        <Grid.Container gap={1} direction="column">
          {/* If wallet is not connected, show all connect wallet options */}
          {connectors.map(connector => (
            <Grid key={connector.id}>
              <Button
                flat
                disabled={isMounted ? !connector.ready : false}
                onClick={async () => {
                  await handleConnectWallet({ connector })
                }}
                css={{ width: '100%' }}
              >
                {connector.name}
              </Button>
            </Grid>
          ))}
        </Grid.Container>
      )}
    </Fragment>
  )
}
