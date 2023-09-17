<script setup lang="ts">
import {useUserStore} from "~/stores/user";

const userStore = useUserStore()
const crumbs = computed(() => userStore.breadcrumbs)
const isPWA = computed(() => process.client && window.isPWA)
</script>

<template>
  <div
    v-if="crumbs.length"
    class="-mx-4 overflow-auto no-scrollbar relative z-10"
    :class="{'border-b bg-gray-100': !isPWA, 'p-4 pb-0': isPWA}"
  >
    <div class="mx-auto max-w-xl flex flex-nowrap gap-1 font-semibold items-center">
      <nuxt-link class="flex-none z-10 bg-gray-100 sticky left-0 flex gap-1 items-center p-3 md:p-2 rounded" to="/">
        <div class="w-4 h-4 i-con-home"/>
        <span class="hidden md:block">Home</span>
      </nuxt-link>
      <div class="hidden md:block flex-none w-4 h-4 i-con-right"/>
      <template v-for="(crumb, i) in crumbs" :key="crumb.to">
        <nuxt-link class="flex flex-none gap-1 items-center p-3 md:p-2 w-fit" :to="crumb.to">
          <div
            v-if="crumb.icon"
            class="w-4 h-4" :class="crumb.icon"
          />
          <span :class="{'hidden md:block': i < crumbs.length - 1}">{{crumb.name}}</span>
        </nuxt-link>
        <div v-if="i < crumbs.length - 1" class="hidden md:block flex-none w-4 h-4 i-con-right"/>
      </template>
      <div class="flex-none w-4 h-4"/>
    </div>
  </div>
</template>
