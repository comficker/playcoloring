<script setup lang="ts">
import {useUserStore} from "~/stores/user";
import {useEditor} from "~/stores/editor";
const route = useRoute()
const userStore = useUserStore()
const editorStore = useEditor()

const isPWA = computed(() => process.client && window.isPWA)
</script>
<template>
  <header class="sticky top-0 z-20 bg-white -mx-4 px-4">
    <div class="mx-auto max-w-xl w-full font-semibold relative">
      <div class="flex justify-between items-center text-center" :class="{'text-xs': isPWA}">
        <div class="flex flex-1 md:flex-none md:gap-6 items-center">
          <h1 class="flex-1 md:flex-none">
            <nuxt-link
              class="flex flex-col md:flex-row gap-1 p-4 py-2 md:px-0 items-center md:hover:text-blue-500"
              title="Play Coloring Logo" to="/"
            >
              <div class="md:hidden i-con-home fill-red-400 h-5 w-5"/>
              <img class="hidden md:block w-auto h-6" src="/logo.png" alt="Play Coloring">
              <span class="md:hidden">Home</span>
            </nuxt-link>
          </h1>
          <nuxt-link class="flex-1 flex flex-col md:flex-row p-4 py-2 md:px-0 gap-1 items-center md:hover:text-blue-500" to="/pages">
            <div class="w-4 h-4 i-con-color"/>
            <span>Browser</span>
          </nuxt-link>
          <nuxt-link class="flex-1 flex flex-col md:flex-row p-4 py-2 md:px-0 gap-1 items-center md:hover:text-blue-500" to="/game">
            <div class="w-4 h-4 i-con-gamepad"/>
            <span>Play</span>
          </nuxt-link>
        </div>
        <div class="flex gap-2 items-center">
          <div
            class="btn flex-col gap-1 md:flex-row p-4 py-2 md:px-0"
            v-if="['editor'].includes(route.name.toString())"
            @click="editorStore.toggleModal('save')"
          >
            <div class="i-con-save w-5 h-5"/>
            <span>Share</span>
          </div>
          <nuxt-link
            class="btn flex-col gap-1 md:flex-row p-4 py-2 md:px-0 md:hover:text-blue-500" v-if="userStore.isLogged"
            :immediate="true" to="/my-space" title="My space"
          >
            <div class="i-con-user w-5 h-5"/>
            <span>Mine</span>
          </nuxt-link>
        </div>
      </div>
    </div>
  </header>
</template>
