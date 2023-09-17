<script lang="ts" setup>
const route = useRoute()

const isPWA = computed(() => process.client && window.isPWA)
if (isPWA) {
  useHead({
    meta: [
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
      }
    ]
  })
}
</script>

<template>
  <main id="main" class="flex flex-col px-4">
    <Header class="border-b" v-if="!isPWA"/>
    <div class="flex-1">
      <slot class="w-full"/>
    </div>
    <Header
      v-if="isPWA" class="sticky bottom-0 pb-4"
      :class="{'mt-4 border-t': !['game', 'editor'].includes(route.name.toString())}"
    />
    <Footer v-else-if="route.name !== 'game'"/>
  </main>
</template>

<style>
@supports (-webkit-touch-callout: none) {
  #main {
    margin-bottom: 20px;
  }
}
</style>
