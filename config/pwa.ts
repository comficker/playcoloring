import type { ModuleOptions } from '@vite-pwa/nuxt'
import { appDescription, appName } from '../constants'

const scope = '/'

export const pwa: ModuleOptions = {
  registerType: 'autoUpdate',
  scope,
  base: scope,
  manifest: {
    id: scope,
    scope,
    name: appName,
    short_name: appName,
    description: appDescription,
    theme_color: '#ffffff',
    icons: [
      {
        src: '/images/pwa-192x192.svg',
        sizes: '192x192',
        type: 'image/svg',
      },
      {
        src: '/images/pwa-512x512.svg',
        sizes: '512x512',
        type: 'image/svg',
      },
      {
        src: '/images/pwa-512x512.svg',
        sizes: '512x512',
        type: 'image/svg',
        purpose: 'any maskable',
      },
    ],
  },
  registerWebManifestInRouteRules: true,
  writePlugin: true,
  devOptions: {
    enabled: process.env.VITE_PLUGIN_PWA === 'true',
    navigateFallback: scope,
  },
}
