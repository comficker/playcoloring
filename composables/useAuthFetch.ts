import {useCookie, UseFetchOptions, useRoute, useFetch} from '#app'
import {NitroFetchRequest} from 'nitropack'
import {KeyOfRes} from 'nuxt/dist/app/composables/asyncData'

export function useAuthFetch<T>(
  request: NitroFetchRequest,
  opts?:
    | UseFetchOptions<T extends void ? unknown : T,
    (res: T extends void ? unknown : T) => T extends void ? unknown : T,
    KeyOfRes<(res: T extends void ? unknown : T) => T extends void ? unknown : T>>
    | undefined) {
  const config = useRuntimeConfig()
  const route = useRoute()
  const authCookie = useCookie('auth.token')
  const token = route.query.token || authCookie.value
  if (!opts) {
    opts = {}
  }
  const headers :any = opts.headers || {}
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }
  headers["Content-Type"] = 'application/json'
  headers["Accept"] = 'application/json; indent=4'
  opts.headers = headers
  return useFetch(request, {baseURL: config.public.apiBase, ...opts}).then(async res => {
    if (res.pending.value) {
      await res.execute()
    }
    return res
  })
}
