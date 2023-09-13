import {ref} from "vue"
import {defineStore} from 'pinia'
import {ResponseSharedPage, User} from "~/interface";

export const useHomeStore = defineStore('home', () => {
  const r1 = ref<ResponseSharedPage>()
  const r2 = ref<ResponseSharedPage>()
  const r3 = ref<ResponseSharedPage>()
  const r4 = ref<ResponseSharedPage>()

  const setData = (rsp: ResponseSharedPage[]) => {
    r1.value = rsp[0]
    r2.value = rsp[1]
    r3.value = rsp[2]
    r4.value = rsp[3]
  }

  return {
    r1, r2, r3, r4,
    setData
  }
})

