import {computed, ref} from "vue"
import {defineStore} from 'pinia'
import {User} from "~/interface";

export const useUserStore = defineStore('user', () => {

  const logged = ref({} as User)

  const isLogged = computed(() => {
    return Boolean(logged.value && logged.value.id)
  })

  function setLogged(user: User) {
    logged.value = user
  }

  return {
    logged,
    setLogged,
    isLogged
  }
})

