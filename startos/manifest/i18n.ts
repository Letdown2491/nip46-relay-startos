export const short = {
  en_US: 'A lightweight relay for NIP-46 Nostr remote signing',
}

export const long = {
  en_US:
    'NIP-46 Relay is a lightweight Nostr relay dedicated to NIP-46 remote signing (kinds 24133 and 24135). It buffers signing messages in memory by default so they never touch disk, validates event timestamps, rate-limits per pubkey, and can optionally persist to disk. Use it with self-hosted signers and any NIP-46 compatible application.',
}
