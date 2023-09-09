import {computed, ref} from "vue"
import {defineStore} from 'pinia'
import {IBreadcrumb, User} from "~/interface";

export const useUserStore = defineStore('user', () => {

  const logged = ref({} as User)
  const breadcrumbs = ref<IBreadcrumb[]>([])

  const isLogged = computed(() => {
    return Boolean(logged.value && logged.value.id)
  })

  function setLogged(user: User) {
    logged.value = user
  }

  function setBC(bc: IBreadcrumb[]) {
    breadcrumbs.value = bc
  }

  function setEditorKey(key: 'editor' | 'current', value: string) {
    if (!logged.value.meta) {
      logged.value.meta = {
        coloring: {}
      }
    }
    if (!logged.value.meta.coloring){
      logged.value.meta.coloring = {}
    }
    logged.value.meta.coloring[key] = value
  }

  return {
    logged,
    setLogged,
    isLogged,
    breadcrumbs,
    setBC,
    setEditorKey
  }
})

