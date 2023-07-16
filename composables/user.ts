import {computed, ref} from "vue"
import {defineStore} from 'pinia'

import {User} from "~/interface";
import {useCookie} from "#app";
import {useFetch} from "#app";
import {useAuthFetch} from "~/composables/useAuthFetch";

export const useUserStore = defineStore('user', () => {
  /**
   * Current named of the user.
   */
  const cookieToken = useCookie('auth.token')
  const cookieTokenRefresh = useCookie('auth.token_refresh')

  const logged = ref({} as User)
  const modalOpening = ref<null | string>(null)

  const isLogged = computed(() => {
    return Boolean(logged.value && logged.value.id)
  })

  function setToken(nToken: string, refresh: string) {
    cookieToken.value = nToken
    cookieTokenRefresh.value = refresh
    setTimeout(() => {
      fetchUser().then(() => console.log("LOGGED"))
    }, 800)
  }

  async function refreshToken() {{
    const {data: res} = await useAuthFetch<{access: string}>('/auth/token/refresh/', {
      headers: {
        "Authorization": ''
      },
      body: {
        refresh: cookieTokenRefresh.value
      }
    })
    if (res.value) {
      cookieToken.value = res.value.access
    }
  }}

  async function loginAnonymous() {
    const {data: res} = await useAuthFetch<{refresh: string, access: string}>('/auth/guess')
    if (res.value) {
      cookieToken.value = res.value.access
      cookieTokenRefresh.value = res.value.refresh
    }
  }

  function setLogged(user: User) {
    logged.value = user
  }

  async function fetchUser() {
    if (logged.value.id) return
    if (!cookieToken.value) {
      await loginAnonymous()
    }
    if (cookieToken.value) {
      let {data: userRes} = await useAuthFetch<User>('/auth/user', {
        headers: {
          "Authorization": `Bearer ${cookieToken.value}`
        }
      })
      if (userRes.value) {
        logged.value = userRes.value
      } else if (cookieTokenRefresh.value) {
        await refreshToken()
        let {data: userRes} = await useAuthFetch<User>('/auth/user', {
          headers: {
            "Authorization": `Bearer ${cookieToken.value}`
          }
        })
        if (userRes.value)
          logged.value = userRes.value
      }
      if (!logged.value || !logged.value.id) {
        setToken('', '')
      }
    }
  }

  return {
    modalOpening,
    logged,
    setLogged,
    fetchUser,
    isLogged
  }
})

