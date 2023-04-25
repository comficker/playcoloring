import { useAuthFetch } from '@/composables/useAuthFetch'
import {useUserStore} from "~/composables/user";
import {User} from "~/interface";

export default defineNuxtPlugin(async nuxtApp => {
  const { data: userRes } = await useAuthFetch<User>('/auth/user')
  if (userRes) {
    const userStore = useUserStore()
    userStore.setLogged(userRes.value as User)
  }
})
