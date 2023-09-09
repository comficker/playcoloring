import {useUserStore} from "~/stores/user";
import {useCookie} from "#app";
import {User} from "~/interface";
import {ofetch} from "ofetch";

export default defineNuxtPlugin(async(NuxtApp) => {
  const config = useRuntimeConfig()
  const maxAge = 60 * 60 * 24 * 7 * 30
  const cookieToken = useCookie('auth.token', { maxAge })
  const cookieTokenRefresh = useCookie('auth.token_refresh', { maxAge })
  const userStore = useUserStore()

  const touch = ofetch.create({
    baseURL: config.public.apiBase,
    headers: {
      "Accept": 'application/json',
      "Content-Type": 'application/json'
    }
  })
  async function loginAnonymous() {
    const res = await touch('/auth/guess')
    if (res) {
      cookieToken.value = res.access
      cookieTokenRefresh.value = res.refresh
    }
  }

  async function refreshToken() {{
    const res = await touch('/auth/token/refresh', {
      method: 'POST',
      body: {
        refresh: cookieTokenRefresh.value
      }
    }).catch(() => null)
    if (res) {
      cookieToken.value = res.access
      return true
    }
    return false
  }}

  async function fetchUser() {
    if (userStore.logged.id) return null

    if (!cookieToken.value) await loginAnonymous()
    if (cookieToken.value) {
      let userRes = await touch<User>('/auth/user', {
        headers: {
          "Authorization": `Bearer ${cookieToken.value}`
        }
      }).catch(() => null)
      if (userRes) {
        userStore.setLogged(userRes)
      } else if (cookieTokenRefresh.value) {
        if (await refreshToken()) {
          let userRes = await touch<User>('/auth/user', {
            headers: {
              "Authorization": `Bearer ${cookieToken.value}`
            }
          }).catch(() => null)
          if (userRes)
            userStore.setLogged(userRes)
          else {
            cookieTokenRefresh.value = ''
            cookieToken.value = ''
          }
        } else {
          cookieTokenRefresh.value = ''
          cookieToken.value = ''
        }
      } else {
        cookieTokenRefresh.value = ''
        cookieToken.value = ''
      }
      return userRes
    }
    return null
  }

  return {
    provide: {
      fetchUser
    }
  }
})
