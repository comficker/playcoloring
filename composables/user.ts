import { defineStore } from 'pinia'
import {User} from "~/interface";

export const useUserStore = defineStore('user', () => {
  /**
   * Current named of the user.
   */
  const logged = ref({} as User)

  function setLogged(user: User) {
    logged.value = user
  }

  return {
    logged,
    setLogged
  }
})

