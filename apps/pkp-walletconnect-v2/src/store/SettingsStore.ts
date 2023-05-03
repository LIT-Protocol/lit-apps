import { PKPClient } from '@lit-protocol/pkp-client'
import { AuthMethod, IRelayPKP, SessionSigs } from '@lit-protocol/types'
import { proxy } from 'valtio'

const LIT_PKPS_KEY = 'lit-my-pkps'
const LIT_SESSION_SIGS_KEY = 'lit-session-sigs'
const LIT_SESSION_EXP_KEY = 'lit-session-exp'

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
  sessionSigs?: SessionSigs
  sessionExpiration?: string
  // pkpClient?: PKPClient
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
  myPKPs: getStoredPKPs(),
  sessionSigs: getStoredSessionSigs(),
  sessionExpiration: getStoredSessionExpiration()
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
    setMyPKPs(myPKPs)
  },

  setSession(sessionSigs: SessionSigs, sessionExpiration: string) {
    state.sessionSigs = sessionSigs
    state.sessionExpiration = sessionExpiration
    setSessionSigs(sessionSigs)
    setSessionExpiration(sessionExpiration)
  },

  // setPKPClient(pkpClient: PKPClient) {
  //   state.pkpClient = pkpClient
  // },

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
    const storedPKPs = localStorage.getItem(LIT_PKPS_KEY)
    if (storedPKPs) {
      return JSON.parse(storedPKPs)
    }
  } catch (err) {}
  return []
}

function getStoredSessionSigs(): SessionSigs | undefined {
  try {
    const storedSigs = localStorage.getItem(LIT_SESSION_SIGS_KEY)
    if (storedSigs) {
      return JSON.parse(storedSigs)
    }
  } catch (err) {}
  return undefined
}

function getStoredSessionExpiration(): string | undefined {
  try {
    const storedExpiration = localStorage.getItem(LIT_SESSION_EXP_KEY)
    if (storedExpiration) {
      return storedExpiration
    }
  } catch (err) {}
  return undefined
}

function setMyPKPs(pkps: IRelayPKP[]): void {
  try {
    localStorage.setItem(LIT_PKPS_KEY, JSON.stringify(pkps))
  } catch (err) {}
}

function setSessionSigs(sigs: SessionSigs): void {
  try {
    localStorage.setItem(LIT_SESSION_SIGS_KEY, JSON.stringify(sigs))
  } catch (err) {}
}

function setSessionExpiration(expiry: string): void {
  try {
    localStorage.setItem(LIT_SESSION_EXP_KEY, expiry)
  } catch (err) {}
}

export default SettingsStore
