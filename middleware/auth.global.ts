export default defineNuxtRouteMiddleware(() => {
  const { $fetchUser } = useNuxtApp()

  $fetchUser()
})
