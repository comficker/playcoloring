<script setup lang="ts">
import {useUserStore} from "~/stores/user";
import RandomButton from "~/components/RandomButton.vue";
import MainNavigator from "~/components/MainNavigator.vue";

const userStore = useUserStore()
</script>
<template>
  <div class="mx-auto w-full px-4 py-2 font-semibold relative">
    <div class="flex justify-between items-center">
      <div class="flex gap-6 items-center">
        <h1>
          <nuxt-link class="flex gap-1" to="/">
            <div class="i-con-pad fill-red-400 h-8 w-8"/>
            <img class="hidden md:block w-auto h-8" src="/logo.png" alt="Play Coloring">
          </nuxt-link>
        </h1>
        <main-navigator/>
      </div>
      <div class="flex gap-2 items-center">
        <nuxt-link v-if="userStore.isLogged" to="/my-space" class="btn hover:shadow rounded">
          <div class="i-con-user w-4 h-4"/>
          <span class="hidden md:block">My space</span>
        </nuxt-link>
      </div>
    </div>
  </div>
</template>
