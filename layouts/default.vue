<script lang="ts" setup>
const route = useRoute()
const {$pwa} = useNuxtApp()
const isPWA = computed(() => $pwa && $pwa.isInstalled)
</script>

<template>
  <main id="main" class="flex flex-col px-4" :class="{'pb-8': isPWA}">
    <Header/>
    <div class="flex-1">
      <slot class="w-full"/>
    </div>
    <Footer v-if="!(route.name === 'game' || isPWA)"/>
  </main>
</template>

<style>
@supports (-webkit-touch-callout: none) {
  #main {
    margin-bottom: 20px;
  }
}
</style>
