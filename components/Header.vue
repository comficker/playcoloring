<script lang="ts" setup>
const route = useRoute()
const is_home = computed(() => route.name === "index")
</script>

<template>
  <div class="max-w-lg mx-auto w-full px-4 md:px-0">
    <h1>
      <nuxt-link class="flex items-center gap-1" to="/">
        <div class="w-10 h-10 i-con-palette fill-red-400"/>
        <img class="h-12 w-auto" src="/logo.png" alt="" :class="{'h-12': is_home, 'h-8': !is_home}">
      </nuxt-link>
    </h1>
    <div v-if="is_home" class="text-lg">Download printable coloring or play online</div>
  </div>
</template>

<style>
</style>
