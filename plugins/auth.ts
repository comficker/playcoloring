import {useUserStore} from "~/stores/user";
import {useCookie} from "#app";
import {User} from "~/interface";

export default defineNuxtPlugin(async(NuxtApp) => {
  const config = useRuntimeConfig()
  const cookieToken = useCookie('auth.token')
  const cookieTokenRefresh = useCookie('auth.token_refresh')
  const userStore = useUserStore()
  async function loginAnonymous() {
    const {data: res} = await useAuthFetch<{refresh: string, access: string}>('/auth/guess', {
      headers: {
        'Authorization': ''
      },
      baseURL: config.public.apiBase,
    })
    if (res.value) {
      cookieToken.value = res.value.access
      cookieTokenRefresh.value = res.value.refresh
    }
  }

  async function fetchUser() {
    if (userStore.logged.id) return

    if (!cookieToken.value) await loginAnonymous()

    if (cookieToken.value) {
      let {data: userRes} = await useAuthFetch<User>('/auth/user', {
        baseURL: config.public.apiBase,
        headers: {
          "Authorization": `Bearer ${cookieToken.value}`
        }
      })
      if (userRes.value) {
        userStore.setLogged(userRes.value)
      } else if (cookieTokenRefresh.value) {
        await refreshToken()
        let {data: userRes} = await useAuthFetch<User>('/auth/user', {
          baseURL: config.public.apiBase,
          headers: {
            "Authorization": `Bearer ${cookieToken.value}`
          }
        })
        if (userRes.value)
          userStore.setLogged(userRes.value)
      }
    }
  }

  async function refreshToken() {{
    const {data: res} = await useAuthFetch<{access: string}>('/auth/token/refresh/', {
      headers: {
        'Authorization': ''
      },
      baseURL: config.public.apiBase,
      body: {
        refresh: cookieTokenRefresh.value
      }
    })
    if (res.value) {
      cookieToken.value = res.value.access
    }
  }}

  return {
    provide: {
      fetchUser
    }
  }
})
