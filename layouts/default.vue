<script lang="ts" setup>
const route = useRoute()
const showHead = computed(() => {
  return !['index', 'editor'].includes(route.name?.toString() || 'index')
})
</script>

<template>
  <main id="main" class="flex flex-col min-h-full">
    <Header v-if="showHead"/>
    <div class="flex-1 px-4">
      <slot class="w-full"/>
    </div>
    <Footer/>
  </main>
</template>
