import {useUserStore} from "~/composables/user";

export default defineNuxtPlugin( nuxtApp => {
  useUserStore().fetchUser().then(r => console.log)
})
