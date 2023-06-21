<script setup lang="ts">
import {IBreadcrumb} from "~/interface";

const {crumbs} = defineProps<{crumbs: IBreadcrumb[]}>()
</script>

<template>
  <div class="flex gap-2 items-center font-semibold">
    <nuxt-link class="flex p-1.5 gap-1 items-center bg-gray-100 rounded px-3" to="/">
      <div class="w-5 h-5 i-con-home"/>
      <span>Home</span>
    </nuxt-link>
    <div class="w-5 h-5 i-con-right"/>
    <template v-for="(crumb, i) in crumbs" :key="crumb.to">
      <nuxt-link class="flex p-1.5 gap-1 items-center bg-gray-100 rounded px-3" :to="crumb.to">
        <div class="w-5 h-5" :class="crumb.icon"/>
        <span>{{crumb.name}}</span>
      </nuxt-link>
      <div v-if="i < crumbs.length - 1" class="w-5 h-5 i-con-right"/>
    </template>
  </div>
</template>

<style scoped>

</style>
