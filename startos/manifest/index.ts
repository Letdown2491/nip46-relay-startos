import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'nip46-relay',
  title: 'NIP-46 Relay',
  license: 'MIT',
  packageRepo: 'https://github.com/Letdown2491/nip46-relay-startos',
  upstreamRepo: 'https://github.com/Letdown2491/nip46-relay',
  marketingUrl: 'https://github.com/Letdown2491/nip46-relay',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    'nip46-relay': {
      source: {
        dockerBuild: {
          dockerfile: 'Dockerfile',
          workdir: '.',
          buildArgs: { UPSTREAM_REF: 'v1.0.0' },
        },
      },
      arch: ['x86_64', 'aarch64', 'riscv64'],
    },
  },
  alerts: {
    install: null,
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {},
})
