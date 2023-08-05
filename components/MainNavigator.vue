<script setup lang="ts">
import {useRoute} from "#app";

const route = useRoute()
const force = ref(false)

watch(() => route.fullPath, () => {
  force.value = false
})
</script>

<template>
  <div class="flex gap-2 items-center p-1 cursor-pointer" @click="force = !force">
    <div class="w-4 h-4 i-con-menu"/>
    <span>Menu</span>
  </div>
  <Transition
    enter-active-class="animated animated-duration-300 animate-fade-in"
    leave-active-class="animated animated-duration-300 animate-fade-out"
  >
    <div v-if="force" class="fixed inset-0 grayscale bg-gray-50 z-10" @click="force = false"/>
  </Transition>
  <Transition
    enter-active-class="animated animated-duration-300 animate-slide-in-down"
    leave-active-class="animated animated-duration-300 animate-slide-out-up"
  >
    <div v-show="force" class="z-20 fixed top-0 -right-[1px] -left-[1px] z-60">
      <div class="fixed inset-0" @click="force = false"/>
      <div class="relative max-w-xl mx-auto bg-white shadow-xl rounded-bl-lg rounded-br-lg border divide-y">
        <div class="p-4 flex justify-between items-center">
          <div class="flex gap-2 items-end">
            <div class="font-semibold text-xl">Menu</div>
          </div>
          <div class="i-con-close w-6 h-6 cursor-pointer" @click="force = false"/>
        </div>
        <nuxt-link class="flex gap-2 items-center p-4 md:py-3 hover:text-blue-500" to="/pages">
          <div class="w-4 h-4 i-con-color"/>
          <span>Coloring Pages</span>
          <div class="ml-auto w-4 h-4 i-con-arrow-right"/>
        </nuxt-link>
        <nuxt-link class="flex gap-2 items-center p-4 md:py-3 hover:text-blue-500" to="/arts">
          <div class="w-4 h-4 i-con-picture"/>
          <span>Pixel Arts</span>
          <div class="ml-auto w-4 h-4 i-con-arrow-right"/>
        </nuxt-link>
        <nuxt-link class="flex gap-2 items-center p-4 md:py-3 hover:text-blue-500" to="/editor">
          <div class="w-4 h-4 i-con-design"/>
          <span>Pixel editor</span>
          <div class="ml-auto w-4 h-4 i-con-arrow-right"/>
        </nuxt-link>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.router-link-exact-active {
  @apply text-blue-500;
}
</style>
