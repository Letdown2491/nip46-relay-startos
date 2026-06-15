import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const v_1_0_0 = VersionInfo.of({
  version: '1.0.0:0',
  releaseNotes: {
    en_US: 'Initial StartOS release of NIP-46 Relay.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
