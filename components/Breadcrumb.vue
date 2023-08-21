<script setup lang="ts">
import {useUserStore} from "~/stores/user";

const userStore = useUserStore()
const crumbs = computed(() => userStore.breadcrumbs)
</script>

<template>
  <div class="py-1 mb-4 border-b -mx-4 bg-gray-100 overflow-auto no-scrollbar relative z-10">
    <div class="mx-auto max-w-xl flex flex-nowrap gap-1 font-semibold items-center">
      <nuxt-link class="z-10 bg-gray-100 sticky left-0 flex-none flex gap-1 items-center px-2 pl-4 md:pl-0 w-fit" to="/">
        <div class="w-4 h-4 i-con-home"/>
        <span>Home</span>
      </nuxt-link>
      <div class="flex-none w-4 h-4 i-con-right"/>
      <template v-for="(crumb, i) in crumbs" :key="crumb.to">
        <nuxt-link class="flex flex-none gap-1 items-center px-2 w-fit" :to="crumb.to">
          <div v-if="crumb.icon" class="w-4 h-4" :class="crumb.icon"/>
          <span>{{crumb.name}}</span>
        </nuxt-link>
        <div v-if="i < crumbs.length - 1" class="flex-none w-4 h-4 i-con-right"/>
      </template>
    </div>
  </div>
</template>

<style scoped>

</style>
