<script lang="ts" setup>
const route = useRoute()
const is_home = computed(() => route.name === "index")
</script>

<template>
  <div class="max-w-xl mx-auto w-full px-4 md:px-0">
    <div class="flex justify-between">
      <h1>
        <nuxt-link class="flex gap-1" to="/">
          <div class="i-con-pad fill-red-400" :class="{'h-10 w-10': is_home, 'h-8 w-8': !is_home}"/>
          <img class="w-auto" src="/logo.png" alt="" :class="{'h-12': is_home, 'h-8': !is_home}">
        </nuxt-link>
      </h1>
      <nuxt-link class="p-2.5 cursor-pointer" to="/editor">
        <div class="w-4 h-4 i-con-design"></div>
      </nuxt-link>
    </div>
    <div v-if="is_home" class="text-lg">Online pixel editor and coloring by number</div>
  </div>
</template>

<style>
</style>
