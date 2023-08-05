<script setup lang="ts">
import {useUserStore} from "~/stores/user";

const userStore = useUserStore()
const crumbs = computed(() => userStore.breadcrumbs)
</script>

<template>
  <div class="py-2 mb-4 border-b -mx-4 px-4 md:border-transparent">
    <div class="mx-auto max-w-xl flex flex-wrap gap-2 font-semibold items-center">
      <nuxt-link class="flex gap-2 items-center px-2" to="/">
        <div class="w-4 h-4 i-con-home"/>
        <span class="hidden md:block">Home</span>
      </nuxt-link>
      <div class="hidden md:block">
        <div class="w-4 h-4 i-con-right"/>
      </div>
      <template v-for="(crumb, i) in crumbs" :key="crumb.to">
        <nuxt-link class="flex gap-2 items-center px-2" :to="crumb.to">
          <div v-if="crumb.icon" class="w-4 h-4" :class="crumb.icon"/>
          <span>{{crumb.name}}</span>
        </nuxt-link>
        <div v-if="i < crumbs.length - 1" class="hidden md:block">
          <div class="w-4 h-4 i-con-right"/>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>

</style>
