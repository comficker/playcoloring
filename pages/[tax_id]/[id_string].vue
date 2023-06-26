<template>
  <PageDetail v-if="isDetail"/>
  <PageList v-else/>
</template>

<script setup lang="ts">
const route = useRoute()

const isDetail = computed(() => {
  return route.params.tax_id === 'post' && route.params.id_string
})
</script>
