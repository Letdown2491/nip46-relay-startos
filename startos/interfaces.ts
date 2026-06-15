import { sdk } from './sdk'
import { relayPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const host = sdk.MultiHost.of(effects, 'relay-multi')

  // A single http binding serves both the landing page and the NIP-46
  // WebSocket relay (the http binding transparently carries ws upgrades).
  const origin = await host.bindPort(relayPort, { protocol: 'http' })

  const ui = sdk.createInterface(effects, {
    name: 'Relay',
    id: 'ui',
    description:
      'The NIP-46 relay endpoint. Use this address as the relay URL in NIP-46 clients and signers; opening it in a browser shows the relay info page.',
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  const receipt = await origin.export([ui])

  return [receipt]
})
