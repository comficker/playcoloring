<script setup lang="ts">
import {useUserStore} from "~/stores/user";
import MainNavigator from "~/components/MainNavigator.vue";
import {useEditor} from "~/stores/editor";
const route = useRoute()
const userStore = useUserStore()
const editorStore = useEditor()
</script>
<template>
  <header class="sticky top-0 z-20 bg-white -mx-4 px-4">
    <div class="mx-auto max-w-xl w-full font-semibold relative">
      <div class="flex justify-between items-center">
        <div class="flex md:gap-6 items-center">
          <h1>
            <nuxt-link class="flex gap-1 p-4 md:px-0" title="Play Coloring Logo" to="/">
              <div class="i-con-pad fill-red-400 h-6 w-6"/>
              <img class="hidden md:block w-auto h-6" src="/logo.png" alt="Play Coloring">
            </nuxt-link>
          </h1>
          <nuxt-link class="flex p-4 md:px-0 gap-2 items-center hover:text-blue-500" to="/pages">
            <div class="w-5 h-5 i-con-color"/>
            <span>Browser</span>
          </nuxt-link>
        </div>
        <div class="flex gap-2 items-center">
          <div
            v-if="['editor'].includes(route.name.toString())"
            class="btn p-4 md:px-0"
            @click="editorStore.toggleModal('save')"
          >
            <div class="i-con-save w-5 h-5"/>
            <span class="hidden md:block">Share</span>
          </div>
          <nuxt-link v-if="userStore.isLogged" :immediate="true" to="/my-space" title="My space" class="btn p-4 md:px-0">
            <div class="i-con-user w-5 h-5"/>
            <span class="hidden md:block">Mine</span>
          </nuxt-link>
        </div>
      </div>
    </div>
  </header>
</template>
