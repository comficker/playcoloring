import {useCookie, UseFetchOptions, useFetch} from '#app'
import { defu } from 'defu'

export function useAuthFetch<T> (url: string, options: UseFetchOptions<T> = {}) {
  const userAuth = useCookie('auth.token')
  const config = useRuntimeConfig()

  const defaults: UseFetchOptions<T> = {
    baseURL: config.public.apiBase,
    key: url,
    headers: {
      ...userAuth.value
        ? { Authorization: `Bearer ${userAuth.value}` }
        : {},
      "Content-Type": 'application/json',
      "Accept": 'application/json; indent=2'
    },
  }

  const params = defu(options, defaults)

  return useFetch(url, params)
}
