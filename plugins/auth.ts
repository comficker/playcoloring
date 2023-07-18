import {useUserStore} from "~/stores/user";
import {useCookie} from "#app";
import {User} from "~/interface";
import {ofetch} from "ofetch";

export default defineNuxtPlugin(async(NuxtApp) => {
  const config = useRuntimeConfig()
  const cookieToken = useCookie('auth.token')
  const cookieTokenRefresh = useCookie('auth.token_refresh')
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
    })
    if (res) {
      cookieToken.value = res.access
    }
  }}

  async function fetchUser() {
    if (userStore.logged.id) return

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
        await refreshToken()
        let userRes = await touch<User>('/auth/user', {
          headers: {
            "Authorization": `Bearer ${cookieToken.value}`
          }
        }).catch(() => null)
        if (userRes)
          userStore.setLogged(userRes)
      } else {
        cookieTokenRefresh.value = ''
        cookieToken.value = ''
      }
    }
  }

  return {
    provide: {
      fetchUser
    }
  }
})