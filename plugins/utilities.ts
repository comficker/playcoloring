import {useCookie} from "#app";
export default defineNuxtPlugin(async (NuxtApp) => {
  const {$pwa} = useNuxtApp()
  const isPWA = function () {
    return true
  }

  return {
    provide: {
      isPWA
    }
  }
})
