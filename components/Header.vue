<script setup lang="ts">
import {useUserStore} from "~/stores/user";
import MainNavigator from "~/components/MainNavigator.vue";

const userStore = useUserStore()
</script>
<template>
  <header class="sticky top-0 z-20 bg-white -mx-4 px-4">
    <div class="mx-auto max-w-xl w-full py-2 font-semibold relative">
      <div class="flex justify-between items-center">
        <div class="flex gap-6 items-center">
          <h1>
            <nuxt-link class="flex gap-1" to="/">
              <div class="i-con-pad fill-red-400 h-6 w-6"/>
              <img class="hidden md:block w-auto h-6" src="/logo.png" alt="Play Coloring">
            </nuxt-link>
          </h1>
          <main-navigator/>
        </div>
        <div class="flex gap-2 items-center">
          <nuxt-link v-if="userStore.isLogged" :immediate="true" to="/my-space" class="btn hover:shadow rounded">
            <div class="i-con-user w-4 h-4"/>
            <span class="hidden md:block">My space</span>
          </nuxt-link>
        </div>
      </div>
    </div>
  </header>
</template>
