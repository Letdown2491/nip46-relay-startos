import { FileHelper, z } from '@start9labs/start-sdk'

/**
 * Persisted package configuration.
 *
 * This is StartOS-side state, not a file the relay itself reads. The config
 * action (../actions/config.ts) writes it, and main.ts reads it to build the
 * relay's environment variables. It lives in the "main" volume so it survives
 * restarts and is captured by backups.
 *
 * Every field uses `.catch(default)` so a missing key or a hand-edited value of
 * the wrong type falls back to a safe default instead of crashing the read.
 */
export const storeFile = FileHelper.json(
  'store.json',
  z.object({
    relayName: z.string().catch('NIP-46 Relay'),
    relayDescription: z.string().catch('A NIP-46 remote signing relay'),
    relayPubkey: z.string().catch(''),
    relayContact: z.string().catch(''),
    relayUrl: z.string().catch(''),
    relayIcon: z.string().catch(''),
    relayBanner: z.string().catch(''),
    storageBackend: z.enum(['memory', 'badger']).catch('memory'),
    // These three mirror the Configure form's `min: 1`; a stored 0 (or any
    // sub-minimum value) falls back to the default rather than the relay.
    keepInMinutes: z.number().int().min(1).catch(10),
    acceptWindowInMinutes: z.number().int().min(1).catch(1),
    rateLimitPerMinute: z.number().int().min(1).catch(100),
    // maxMemoryMb intentionally allows 0 — it means "auto-detect".
    maxMemoryMb: z.number().int().nonnegative().catch(0),
  }),
)
