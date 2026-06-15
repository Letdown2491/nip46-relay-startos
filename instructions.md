# NIP-46 Relay

You've installed **NIP-46 Relay**, a lightweight Nostr relay dedicated to
[NIP-46](https://github.com/nostr-protocol/nips/blob/master/46.md) remote
signing. It accepts only NIP-46 traffic (kinds 24133 and 24135), keeps signing
messages in memory by default, validates timestamps, and rate-limits per pubkey.

## Getting started

1. **Start** the service from its StartOS dashboard.
2. Open the **Configure** action and review the settings (sensible defaults are
   provided — you can start without changing anything).
3. Open the **Relay** interface. In a browser it shows the relay info page; the
   same address is the WebSocket endpoint you give to NIP-46 clients and signers.
4. Copy the **Relay** interface address (the `.local`, Tor, or clearnet URL) and
   set it as the relay in your signer (e.g. nsec.app, Signet) and in the apps
   you want to authorize.

## Configuration

All settings live under the **Configure** action:

- **Relay Name / Description / Icon / Banner** — identity advertised in the
  relay's NIP-11 info document.
- **Public URL** — the WebSocket URL clients use to reach this relay (e.g.
  `wss://nip46.example.com`). Advertised in NIP-11 and shown on the landing
  page. Leave blank if you only access it over `.local`/Tor.
- **Operator Pubkey / Contact** — how clients reach you for abuse reports or
  support. The pubkey (hex) is NIP-11's preferred field; Contact is a fallback.
- **Storage Backend** —
  - *In-memory (ephemeral)*: signing messages never touch disk; the default and
    recommended setting.
  - *Badger (persistent)*: buffers events to the data volume so they survive
    restarts. Included in backups.
- **Event Retention** — how long buffered events are kept before eviction.
- **Timestamp Window** — rejects events whose timestamp is too far from now.
- **Rate Limit** — maximum events accepted per minute, per pubkey.
- **In-memory Budget (MB)** — byte budget for the in-memory store; `0`
  auto-detects (~50% of the container's memory limit). Ignored when using badger.

Saving the Configure action restarts the relay with the new settings.

## Notes and limitations

- The relay listens on port **3334**; this is fixed by the package and reached
  through the **Relay** interface, not edited directly.
- Only NIP-46 read queries scoped by `authors`, `#p`, or `ids` are served —
  there's no firehose of everyone's signing messages.
- This is a relay, not a signer. It moves NIP-46 messages between your apps and
  your remote signer; it never holds your keys.

## Documentation

- [Upstream README](https://github.com/Letdown2491/nip46-relay/blob/master/README.md)
- [NIP-46 specification](https://github.com/nostr-protocol/nips/blob/master/46.md)
