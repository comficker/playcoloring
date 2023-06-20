<script lang="ts" setup>
const route = useRoute()
const is_home = computed(() => route.name === "index")
</script>

<template>
  <div class="max-w-xl mx-auto w-full px-4 md:px-0">
    <h1>
      <nuxt-link class="flex items-center gap-1" to="/">
        <div class="i-con-palette fill-red-400" :class="{'h-10': is_home, 'h-5': !is_home}"/>
        <img class="w-auto" src="/logo.png" alt="" :class="{'h-12': is_home, 'h-6': !is_home}">
      </nuxt-link>
    </h1>
    <div v-if="is_home" class="text-lg">Download printable coloring or play online</div>
  </div>
</template>

<style>
</style>
