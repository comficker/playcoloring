<script lang="ts" setup>
const route = useRoute()
const {$pwa} = useNuxtApp()
</script>

<template>
  <main id="main" class="flex flex-col min-h-full px-4">
    <Header/>
    <div class="flex-1 ">
      <slot class="w-full"/>
    </div>
    <Footer v-if="!$pwa || !$pwa.isInstalled"/>
  </main>
</template>

<style>
@supports (-webkit-touch-callout: none) {
  #main {
    margin-bottom: 10px;
  }
}
</style>
