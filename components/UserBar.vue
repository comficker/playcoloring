<script setup lang="ts">
import {useUserStore} from "~/stores/user";

const us = useUserStore()
const user = computed(() => {
  return us.isLogged ? {
    full_name: us.logged.first_name ? `${us.logged.first_name} ${us.logged.last_name}` : us.logged.username,
    username: us.logged.username
  } : {
    full_name: "Anonymous",
    username: "anonymous"
  }
})
</script>

<template>
<div class="flex justify-between text-lg font-semibold gap-4">
  <div class="flex flex-1">
    <div class="flex gap-2 items-center truncate">
      <div class="i-con-user w-6 h-6"/>
      <div class="hidden md:block">{{user.full_name}}</div>
    </div>
  </div>
  <div class="flex gap-3">
    <div class="flex gap-2 items-center">
      <div class="i-con-seal w-6 h-6"/>
    </div>
    <div class="flex gap-2 items-center md:border rounded md:px-3">
      <div class="i-con-coin w-6 h-6"/>
      <span>32</span>
    </div>
    <div class="flex gap-2 items-center md:border rounded md:px-3">
      <div class="i-con-fill w-6 h-6"/>
      <span>32</span>
    </div>
  </div>
</div>
</template>

<style scoped>

</style>
