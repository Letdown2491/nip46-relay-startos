# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

This repo is **not** the relay itself — it is the StartOS *packaging wrapper* that
turns the upstream Go relay (https://github.com/Letdown2491/nip46-relay) into an
installable `.s9pk` for StartOS 0.4. The TypeScript under `startos/` describes how
StartOS should build, configure, run, back up, and expose the relay; it never runs
inside the relay process. The actual relay source is cloned and compiled at image
build time by the `Dockerfile` (pinned to `UPSTREAM_REF`).

## Commands

```bash
npm install        # install SDK + build tooling
npm run check      # type-check only (tsc --noEmit) — the fast inner loop
npm run prettier   # format startos/ (config: package.json "prettier" key)
make               # build .s9pk for default arches (x86 + arm, set in Makefile)
make x86           # single arch (also: make arm, make riscv)
make install       # sideload newest *.s9pk to the host in ~/.startos/config.yaml
make clean         # remove .s9pk, javascript/, node_modules/
```

There is **no test suite**. Validation is `npm run check` plus a successful `make`.
`make` runs `npm run check` then `npm run build` (bundles `startos/index.ts` into
`javascript/` via `@vercel/ncc`) as a prerequisite, then `start-cli s9pk pack`.

Building requires `start-cli` (the Start9 SDK) and Docker. `make` cross-compiles a
real Docker image per arch, so a full build is slow; prefer `npm run check` while
iterating on the TypeScript.

Inspect a built package: `start-cli s9pk inspect nip46-relay_x86_64.s9pk manifest`

## Architecture

Everything is wired through `startos/index.ts`, which re-exports the lifecycle hooks
StartOS calls. The pieces:

- **`sdk.ts`** — builds the singleton `sdk` from the manifest. Imported everywhere.
  Marked "DO NOT EDIT" (along with `index.ts`, `i18n/index.ts`).
- **`manifest/index.ts`** — package identity, volumes, and the Docker image spec.
  `buildArgs.UPSTREAM_REF` is the single source of truth for which upstream relay
  version gets compiled.
- **`main.ts`** — the daemon. Reads persisted config via
  `storeFile.read().const(effects)` (a reactive read: saving config restarts the
  daemon), maps each setting to a relay **environment variable**, and launches the
  `nip46-relay` binary in a subcontainer with the `main` volume mounted at `/data`.
- **`fileModels/store.ts`** — the persisted config schema (`store.json` on the `main`
  volume). This is StartOS-side state the relay never reads directly; `main.ts`
  translates it into env vars. Every field uses `.catch(default)` so bad/missing
  values degrade gracefully.
- **`actions/config.ts`** — the user-facing "Configure" form (`InputSpec`). Writes
  to `storeFile`. Registered in `actions/index.ts`.
- **`interfaces.ts`** — exports one `ui` interface bound to port `3334`. The same
  HTTP binding serves both the NIP-11 landing page and the NIP-46 WebSocket endpoint
  (the http binding carries ws upgrades).
- **`utils.ts`** — shared constants: `relayPort = 3334`, `dataDir = '/data'`.
- **`init/index.ts`** — composes the init hooks (restore, version graph, interfaces,
  dependencies, actions).
- **`backups.ts`** — backs up the whole `main` volume.
- **`versions/`** — version graph + migrations.

**The config → env-var pipeline is the spine of this package.** A new relay setting
touches three files in lockstep: add the field to `fileModels/store.ts` (schema +
`.catch` default), add the matching `Value.*` to `actions/config.ts`, and read it
into the `env` map in `main.ts`. The env-var *names* in `main.ts` (e.g. `RELAY_PORT`,
`STORAGE_BACKEND`, `KEEP_IN_MINUTES`) must match what the upstream Go relay expects —
they are an external contract, not arbitrary.

## Updating to a new upstream relay release

1. Bump `buildArgs.UPSTREAM_REF` in `startos/manifest/index.ts` to the new upstream tag.
2. Add a `VersionInfo` entry under `startos/versions/` and set it `current` in
   `versions/index.ts`.
3. Rebuild and publish.

## Conventions

- Prettier config lives in `package.json`: no semicolons, single quotes, trailing
  commas, 2-space tabs. Run `npm run prettier` before committing TS changes.
- Default branch for CI/PRs is `master` (note: not `main`). The Build workflow runs
  on PRs to `master` via Start9's shared workflow and skips `*.md`-only changes.
- The committed `nip46-relay_x86_64.s9pk` is a build artifact; `make clean` removes it.
