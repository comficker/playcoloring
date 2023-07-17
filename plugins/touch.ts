import {useCookie} from "#app";
import {ofetch} from "ofetch";

export default defineNuxtPlugin(async (NuxtApp) => {
  const config = useRuntimeConfig()
  const cookieToken = useCookie('auth.token')

  const touch = ofetch.create({
    baseURL: config.public.apiBase,
    headers: {
      "Accept": 'application/json',
      "Content-Type": 'application/json',
      ...cookieToken.value ? { Authorization: `Bearer ${cookieToken.value}` } : {}
    }
  })

  return {
    provide: {
      touch
    }
  }
})
