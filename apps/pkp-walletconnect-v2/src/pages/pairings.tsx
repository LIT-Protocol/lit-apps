import PageHeader from '@/components/PageHeader'
import PairingCard from '@/components/PairingCard'
// import { web3wallet } from '@/utils/WalletConnectUtil'
import { Text } from '@nextui-org/react'
import { getSdkError } from '@walletconnect/utils'
import { Fragment, useState } from 'react'
import { pkpWalletConnect } from '@/utils/WalletConnectUtil'

export default function PairingsPage() {
  const [pairings, setPairings] = useState(
    pkpWalletConnect.getSignClient().core.pairing.pairings.values
  )

  async function onDelete(topic: string) {
    await pkpWalletConnect.disconnectSession({ topic, reason: getSdkError('USER_DISCONNECTED') })
    const newPairings = pairings.filter((pairing: any) => pairing.topic !== topic)
    setPairings(newPairings)
  }

  return (
    <Fragment>
      <PageHeader title="Pairings" />
      {pairings.length ? (
        pairings.map((pairing: any) => {
          const { peerMetadata } = pairing

          return (
            <PairingCard
              key={pairing.topic}
              logo={peerMetadata?.icons[0]}
              url={peerMetadata?.url}
              name={peerMetadata?.name}
              onDelete={() => onDelete(pairing.topic)}
            />
          )
        })
      ) : (
        <Text css={{ opacity: '0.5', textAlign: 'center', marginTop: '$20' }}>No pairings</Text>
      )}
    </Fragment>
  )
}
