export default defineNuxtRouteMiddleware(async () => {
  const { $fetchUser } = useNuxtApp()
  await $fetchUser()
})
