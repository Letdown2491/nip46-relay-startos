import { sdk } from './sdk'
import { storeFile } from './fileModels/store'
import { dataDir, relayPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  /**
   * ======================== Configuration ========================
   *
   * Read the persisted settings reactively: a `.const` read ties this daemon to
   * store.json, so saving the Configure action restarts the relay with the new
   * values. Fall back to the file model's defaults when nothing is set yet.
   */
  const cfg = await storeFile.read().const(effects)

  const env: Record<string, string> = {
    // Fixed by the package — surfaced via the exported "ui" interface.
    RELAY_PORT: `:${relayPort}`,
    WORKING_DIR: dataDir,

    RELAY_NAME: cfg?.relayName ?? 'NIP-46 Relay',
    RELAY_DESCRIPTION: cfg?.relayDescription ?? 'A NIP-46 remote signing relay',
    RELAY_URL: cfg?.relayUrl ?? '',
    RELAY_PUBKEY: cfg?.relayPubkey ?? '',
    RELAY_CONTACT: cfg?.relayContact ?? '',
    RELAY_ICON: cfg?.relayIcon ?? '',
    RELAY_BANNER: cfg?.relayBanner ?? '',
    STORAGE_BACKEND: cfg?.storageBackend ?? 'memory',
    KEEP_IN_MINUTES: String(cfg?.keepInMinutes ?? 10),
    ACCEPT_WINDOW_IN_MINUTES: String(cfg?.acceptWindowInMinutes ?? 1),
    RATE_LIMIT_PER_MINUTE: String(cfg?.rateLimitPerMinute ?? 100),
    MAX_MEMORY_MB: String(cfg?.maxMemoryMb ?? 0),
  }

  /**
   * ======================== Daemons ========================
   */
  return sdk.Daemons.of(effects).addDaemon('primary', {
    subcontainer: await sdk.SubContainer.of(
      effects,
      { imageId: 'nip46-relay' },
      sdk.Mounts.of().mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: dataDir,
        readonly: false,
      }),
      'nip46-relay-sub',
    ),
    exec: {
      command: ['nip46-relay'],
      env,
    },
    ready: {
      display: 'Relay',
      fn: () =>
        sdk.healthCheck.checkPortListening(effects, relayPort, {
          successMessage: 'The relay is accepting connections',
          errorMessage: 'The relay is not reachable',
        }),
    },
    requires: [],
  })
})
