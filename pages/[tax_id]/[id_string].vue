<template>
  <PageDetail v-if="isDetail"/>
  <PageList v-else/>
</template>

<script setup lang="ts">
const route = useRoute()

const isDetail = computed(() => {
  return route.params.tax_id && route.params.id_string && ['pages', 'shared'].includes(route.params.tax_id.toString())
})
</script>
