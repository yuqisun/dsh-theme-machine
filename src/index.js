/**
 * dsh-theme-machine — host half. The skin lives entirely in the browser half
 * (lib/client.js); the Loader only needs a mountable row on the host side.
 */
export const name = 'dsh-theme-machine'

export function apply() {
  // No host-side services: tokens, HUD chrome and the telemetry panel are
  // all browser-side concerns, discovered through the dsh.client manifest.
}
