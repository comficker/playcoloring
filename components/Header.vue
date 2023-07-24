<script setup lang="ts">
import {useUserStore} from "~/stores/user";

const userStore = useUserStore()
</script>
<template>
  <div class="mx-auto w-full px-4 py-2 font-semibold">
    <div class="flex justify-between items-center">
      <h1>
        <nuxt-link class="flex gap-1" to="/">
          <div class="i-con-pad fill-red-400 h-8 w-8"/>
          <img class="hidden md:block w-auto h-8" src="/logo.png" alt="Play Coloring">
        </nuxt-link>
      </h1>
      <div class="flex gap-2 items-center">
        <nuxt-link to="/?id=random" class="btn md:px-5 bg-rose-700 text-white">
          <div class="i-con-refresh w-4 h-4"/>
          <span class="hidden md:block">Random coloring page</span>
        </nuxt-link>
        <nuxt-link class="btn hover:shadow rounded" to="/editor">
          <div class="w-4 h-4 i-con-design"></div>
          <span>Pixel editor</span>
        </nuxt-link>
        <nuxt-link v-if="userStore.isLogged" to="/my-space" class="btn hover:shadow rounded">
          <div class="i-con-user w-4 h-4"/>
          <span>My space</span>
        </nuxt-link>
      </div>
    </div>
  </div>
</template>
