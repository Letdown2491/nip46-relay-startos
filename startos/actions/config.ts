import { sdk } from '../sdk'
import { storeFile } from '../fileModels/store'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  relayName: Value.text({
    name: 'Relay Name',
    description: 'Display name advertised in the NIP-11 relay info document.',
    required: true,
    default: 'NIP-46 Relay',
  }),
  relayDescription: Value.text({
    name: 'Description',
    description: 'Short description advertised in NIP-11.',
    required: true,
    default: 'A NIP-46 remote signing relay',
  }),
  relayUrl: Value.text({
    name: 'Public URL',
    description:
      'The public WebSocket URL clients use to reach this relay (e.g. wss://nip46.example.com). Advertised in NIP-11 and shown on the landing page. Leave blank if unset.',
    required: false,
    default: null,
    placeholder: 'wss://nip46.example.com',
    patterns: [
      {
        regex: '^wss?://\\S+$',
        description: 'Must be a ws:// or wss:// URL.',
      },
    ],
  }),
  relayPubkey: Value.text({
    name: 'Operator Pubkey',
    description:
      "Operator's Nostr pubkey in hex. NIP-11's preferred contact method. Leave blank to omit.",
    required: false,
    default: null,
    patterns: [
      {
        regex: '^[0-9a-fA-F]{64}$',
        description: 'Must be a 64-character hex public key (not an npub).',
      },
    ],
  }),
  relayContact: Value.text({
    name: 'Contact',
    description:
      'Fallback contact (e.g. mailto: or https: URI). Used only if no operator pubkey is set.',
    required: false,
    default: null,
  }),
  relayIcon: Value.text({
    name: 'Icon URL',
    description: 'URL to an icon image, advertised in NIP-11.',
    required: false,
    default: null,
    patterns: [
      {
        regex: '^https?://\\S+$',
        description: 'Must be an http:// or https:// URL.',
      },
    ],
  }),
  relayBanner: Value.text({
    name: 'Banner URL',
    description: 'URL to a banner image, advertised in NIP-11.',
    required: false,
    default: null,
    patterns: [
      {
        regex: '^https?://\\S+$',
        description: 'Must be an http:// or https:// URL.',
      },
    ],
  }),
  storageBackend: Value.select({
    name: 'Storage Backend',
    description:
      'memory: ephemeral, nothing touches disk (recommended). badger: persists buffered events to the data volume across restarts.',
    default: 'memory',
    values: {
      memory: 'In-memory (ephemeral)',
      badger: 'Badger (persistent)',
    },
  }),
  keepInMinutes: Value.number({
    name: 'Event Retention (minutes)',
    description: 'How long buffered events are retained before eviction.',
    required: true,
    default: 10,
    integer: true,
    min: 1,
    units: 'minutes',
  }),
  acceptWindowInMinutes: Value.number({
    name: 'Timestamp Window (minutes)',
    description:
      'Reject events whose timestamp is outside +/- this many minutes from now.',
    required: true,
    default: 1,
    integer: true,
    min: 1,
    units: 'minutes',
  }),
  rateLimitPerMinute: Value.number({
    name: 'Rate Limit (events/min)',
    description: 'Maximum events accepted per minute, per pubkey.',
    required: true,
    default: 100,
    integer: true,
    min: 1,
    units: 'events/min',
  }),
  maxMemoryMb: Value.number({
    name: 'In-memory Budget (MB)',
    description:
      "Byte budget for the in-memory store, in MB. 0 = auto (~50% of the container's memory limit). Ignored when the backend is badger.",
    required: true,
    default: 0,
    integer: true,
    min: 0,
    units: 'MB',
  }),
})

export const config = sdk.Action.withInput(
  'config',

  async ({ effects }) => ({
    name: 'Configure',
    description: 'Configure the NIP-46 relay',
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => (await storeFile.read().const(effects)) ?? null,

  async ({ effects, input }) => {
    // The optional text fields come back as `string | null`; the store keeps
    // them as plain strings (empty = unset), so normalize null to ''.
    await storeFile.merge(effects, {
      ...input,
      relayUrl: input.relayUrl ?? '',
      relayPubkey: input.relayPubkey ?? '',
      relayContact: input.relayContact ?? '',
      relayIcon: input.relayIcon ?? '',
      relayBanner: input.relayBanner ?? '',
    })
    return null
  },
)
