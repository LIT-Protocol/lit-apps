import AccountCard from '@/components/AccountCard'
import AccountPicker from '@/components/AccountPicker'
import PageHeader from '@/components/PageHeader'
// import { COSMOS_MAINNET_CHAINS } from '@/data/COSMOSData'
import { EIP155_MAINNET_CHAINS, EIP155_TEST_CHAINS } from '@/data/EIP155Data'
// import { SOLANA_MAINNET_CHAINS, SOLANA_TEST_CHAINS } from '@/data/SolanaData'
// import { POLKADOT_MAINNET_CHAINS, POLKADOT_TEST_CHAINS } from '@/data/PolkadotData'
// import { ELROND_MAINNET_CHAINS, ELROND_TEST_CHAINS } from '@/data/ElrondData'
import SettingsStore from '@/store/SettingsStore'
import { Text } from '@nextui-org/react'
import { Fragment, useEffect, useState } from 'react'
import { useSnapshot } from 'valtio'
import { NEAR_TEST_CHAINS } from '@/data/NEARData'
import useLitAuth from '@/hooks/useLitAuth'
import LoadingView from './LoadingView'
import { pkpWalletConnect } from '@/utils/WalletConnectUtil'

export default function MyPKPs() {
  const {
    testNets,
    account
    // eip155Address
    // cosmosAddress,
    // solanaAddress,
    // polkadotAddress,
    // nearAddress,
    // elrondAddress
    // pkpClient
  } = useSnapshot(SettingsStore.state)

  // Get addresses
  const [eip155Address, setEip155Address] = useState<string>('')

  useEffect(() => {
    async function getAddress() {
      const addresses = await pkpWalletConnect.getAccounts('eip155')
      setEip155Address(addresses[account])
    }
    if (!eip155Address) getAddress()
  }, [account, eip155Address])

  return (
    <Fragment>
      <PageHeader title="Accounts">{/* <AccountPicker /> */}</PageHeader>
      <Text h4 css={{ marginBottom: '$5' }}>
        Mainnets
      </Text>
      {Object.values(EIP155_MAINNET_CHAINS).map(({ name, logo, rgb }) => (
        <AccountCard key={name} name={name} logo={logo} rgb={rgb} address={eip155Address} />
      ))}
      {/* {Object.values(COSMOS_MAINNET_CHAINS).map(({ name, logo, rgb }) => (
        <AccountCard key={name} name={name} logo={logo} rgb={rgb} address={cosmosAddress} />
      ))}
      {Object.values(SOLANA_MAINNET_CHAINS).map(({ name, logo, rgb }) => (
        <AccountCard key={name} name={name} logo={logo} rgb={rgb} address={solanaAddress} />
      ))}
      {Object.values(POLKADOT_MAINNET_CHAINS).map(({ name, logo, rgb }) => (
        <AccountCard key={name} name={name} logo={logo} rgb={rgb} address={polkadotAddress} />
      ))}
      {Object.values(ELROND_MAINNET_CHAINS).map(({ name, logo, rgb }) => (
        <AccountCard key={name} name={name} logo={logo} rgb={rgb} address={elrondAddress} />
      ))} */}

      {testNets ? (
        <Fragment>
          <Text h4 css={{ marginBottom: '$5' }}>
            Testnets
          </Text>
          {Object.values(EIP155_TEST_CHAINS).map(({ name, logo, rgb }) => (
            <AccountCard key={name} name={name} logo={logo} rgb={rgb} address={eip155Address} />
          ))}
          {/* {Object.values(SOLANA_TEST_CHAINS).map(({ name, logo, rgb }) => (
            <AccountCard key={name} name={name} logo={logo} rgb={rgb} address={solanaAddress} />
          ))}
          {Object.values(POLKADOT_TEST_CHAINS).map(({ name, logo, rgb }) => (
            <AccountCard key={name} name={name} logo={logo} rgb={rgb} address={polkadotAddress} />
          ))}
          {Object.values(NEAR_TEST_CHAINS).map(({ name, logo, rgb }) => (
            <AccountCard key={name} name={name} logo={logo} rgb={rgb} address={nearAddress} />
          ))}
          {Object.values(ELROND_TEST_CHAINS).map(({ name, logo, rgb }) => (
            <AccountCard key={name} name={name} logo={logo} rgb={rgb} address={elrondAddress} />
          ))} */}
        </Fragment>
      ) : null}
    </Fragment>
  )
}
