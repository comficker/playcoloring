import {useCookie} from "#app";
export default defineNuxtPlugin(async (NuxtApp) => {
  const {$pwa} = useNuxtApp()
  const isPWA = function () {
    return $pwa && $pwa.isInstalled
  }

  return {
    provide: {
      isPWA
    }
  }
})
