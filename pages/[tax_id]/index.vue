<template>
  <page-list-index v-if="route.path == '/pages'"/>
  <page-list v-else/>
</template>

<script setup lang="ts">
const route = useRoute()
</script>
