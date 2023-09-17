<script lang="ts" setup>
const route = useRoute()
const {$isPWA} = useNuxtApp()
</script>

<template>
  <main id="main" class="flex flex-col px-4">
    <Header class="border-b" v-if="!$isPWA()"/>
    <div class="flex-1">
      <slot class="w-full"/>
    </div>
    <Header v-if="$isPWA()" class="sticky bottom-0 border-t mt-4"/>
    <Footer v-if="!(route.name === 'game' || $isPWA())"/>
  </main>
</template>

<style>
@supports (-webkit-touch-callout: none) {
  #main {
    margin-bottom: 20px;
  }
}
</style>
