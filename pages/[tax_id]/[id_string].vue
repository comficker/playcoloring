<template>
  <page-detail v-if="isDetail"/>
  <page-author v-else-if="isAuthor"/>
  <page-list-index v-else-if="route.path == '/pages'"/>
  <page-list v-else/>
</template>

<script setup lang="ts">
const route = useRoute()

const isDetail = computed(() => {
  return route.params.tax_id === 'post' && route.params.id_string
})

const isAuthor = computed(() => {
  return route.params.tax_id === 'author' && route.params.id_string
})
</script>
