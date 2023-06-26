<script setup lang="ts">
import {IBreadcrumb} from "~/interface";

const {crumbs} = defineProps<{crumbs: IBreadcrumb[]}>()
</script>

<template>
  <div class="flex flex-wrap gap-2 font-semibold">
    <nuxt-link class="flex p-1.5 gap-1 items-center bg-gray-100 rounded px-3" to="/">
      <div class="w-4 h-4 i-con-home"/>
      <span class="hidden md:block">Home</span>
    </nuxt-link>
    <div class="hidden md:block p-1.5">
      <div class="w-6 h-6 i-con-right"/>
    </div>
    <template v-for="(crumb, i) in crumbs" :key="crumb.to">
      <nuxt-link class="flex p-1.5 gap-1 items-center bg-gray-100 rounded px-3" :to="crumb.to">
        <div v-if="crumb.icon" class="w-4 h-4" :class="crumb.icon"/>
        <span>{{crumb.name}}</span>
      </nuxt-link>
      <div v-if="i < crumbs.length - 1" class="hidden md:block p-1.5">
        <div class="w-6 h-6 i-con-right"/>
      </div>
    </template>
  </div>
</template>

<style scoped>

</style>
