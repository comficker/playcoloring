<script setup lang="ts">
import {useRoute} from "#app";

const route = useRoute()
const force = ref(false)

watch(() => route.fullPath, () => {
  force.value = false
})
</script>

<template>
  <div class="md:hidden flex gap-2 items-center p-1" @click="force = !force">
    <div class="w-6 h-6" :class="{'i-con-up': force, 'i-con-down': !force}"/>
  </div>
  <div
    class="hidden md:flex flex-col md:flex-row absolute md:relative bg-white z-70 right-0 left-0 top-full border-y md:border-none divide-y md:divide-none p-0.5"
    :class="{'flex': force}"
  >
    <nuxt-link class="flex gap-2 items-center p-3 hover:text-blue-500" to="/editor">
      <div class="w-4 h-4 i-con-design"></div>
      <span>Pixel editor</span>
    </nuxt-link>
    <nuxt-link class="flex gap-2 items-center p-3 hover:text-blue-500" to="/pages">
      <div class="w-4 h-4 i-con-color"></div>
      <span>Coloring Pages</span>
    </nuxt-link>
    <nuxt-link class="flex gap-2 items-center p-3 hover:text-blue-500" to="/arts">
      <div class="w-4 h-4 i-con-picture"></div>
      <span>Pixel Arts</span>
    </nuxt-link>
  </div>
</template>

<style scoped>
.router-link-exact-active.btn {
  @apply text-blue-500;
}
</style>
