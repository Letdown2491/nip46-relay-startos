// Constants shared across the package.

// Port the relay listens on (HTTP landing page + WebSocket relay). Fixed by the
// package; users reach it through the exported "ui" interface, not by editing it.
export const relayPort = 3334

// Where the "main" data volume is mounted inside the container. The badger
// backend persists here (when enabled) and it is the relay's WORKING_DIR.
export const dataDir = '/data'
