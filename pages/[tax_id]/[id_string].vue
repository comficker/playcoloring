<template>
  <PageDetail v-if="isDetail"/>
  <PageAuthor v-else-if="isAuthor"/>
  <PageList v-else/>
</template>

<script setup lang="ts">
import PageAuthor from "~/components/PageAuthor.vue";

const route = useRoute()

const isDetail = computed(() => {
  return route.params.tax_id === 'post' && route.params.id_string
})

const isAuthor = computed(() => {
  return route.params.tax_id === 'author' && route.params.id_string
})
</script>
