import { PKPClient } from '@lit-protocol/pkp-client'
import { AuthMethod, IRelayPKP } from '@lit-protocol/types'
import { proxy } from 'valtio'

/**
 * Types
 */
interface State {
  testNets: boolean
  account: number
  // eip155Address: string
  // cosmosAddress: string
  // solanaAddress: string
  // polkadotAddress: string
  // nearAddress: string
  // elrondAddress: string
  relayerRegionURL: string
  myPKPs: IRelayPKP[]
  authMethod?: AuthMethod
  pkpClient?: PKPClient
}

/**
 * State
 */
const state = proxy<State>({
  testNets: typeof localStorage !== 'undefined' ? Boolean(localStorage.getItem('TEST_NETS')) : true,
  account: 0,
  // eip155Address: '',
  // cosmosAddress: '',
  // solanaAddress: '',
  // polkadotAddress: '',
  // nearAddress: '',
  // elrondAddress: '',
  relayerRegionURL: '',
  myPKPs: getStoredPKPs()
})

/**
 * Store / Actions
 */
const SettingsStore = {
  state,

  setAccount(value: number) {
    state.account = value
  },

  // setEIP155Address(eip155Address: string) {
  //   state.eip155Address = eip155Address
  // },

  // setCosmosAddress(cosmosAddresses: string) {
  //   state.cosmosAddress = cosmosAddresses
  // },

  // setSolanaAddress(solanaAddress: string) {
  //   state.solanaAddress = solanaAddress
  // },

  // setPolkadotAddress(polkadotAddress: string) {
  //   state.polkadotAddress = polkadotAddress
  // },

  // setNearAddress(nearAddress: string) {
  //   state.nearAddress = nearAddress
  // },

  // setElrondAddress(elrondAddress: string) {
  //   state.elrondAddress = elrondAddress
  // },

  setRelayerRegionURL(relayerRegionURL: string) {
    state.relayerRegionURL = relayerRegionURL
  },

  setAuthMethod(authMethod: AuthMethod) {
    state.authMethod = authMethod
  },

  setMyPKPs(myPKPs: IRelayPKP[]) {
    state.myPKPs = myPKPs
  },

  setPKPClient(pkpClient: PKPClient) {
    state.pkpClient = pkpClient
  },

  toggleTestNets() {
    state.testNets = !state.testNets
    if (state.testNets) {
      localStorage.setItem('TEST_NETS', 'YES')
    } else {
      localStorage.removeItem('TEST_NETS')
    }
  }
}

function getStoredPKPs(): IRelayPKP[] {
  try {
    const storedPKPs = localStorage.getItem('lit-pkps')
    if (storedPKPs) {
      return JSON.parse(storedPKPs)
    }
  } catch (err) {}
  return []
}

export default SettingsStore
