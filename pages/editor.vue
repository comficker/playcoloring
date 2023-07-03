<script setup lang="ts">
import {useSeoMeta, useRuntimeConfig} from "nuxt/app";
import PixelColoring from "~/components/PixelColoring.vue";
const router = useRouter()
const config = useRuntimeConfig()
const title = "Pixel Editor"
const desc = 'Simple Pixel Editor for artists of all ages and skill levels who want to create and share pixel art!'
useSeoMeta({
  title: title,
  description: desc,
  ogDescription: desc,
  ogTitle: title,
  ogImage: '/screenshot/default.png',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div class="space-y-6 max-w-xl mx-auto">
    <div>
      <h1 class="text-5xl font-bold">Pixel Editor</h1>
      <p>Simple Pixel Editor for artists of all ages and skill levels who want to create and share pixel art!</p>
    </div>
    <PixelColoring :is-editor="true"/>
    <div class="grid gap-2 md:grid-cols-2">
      <div class="border p-3 flex justify-between items-center cursor-pointer group" @click="router.replace('/pages')">
        <div>
          <nuxt-link to="/pages" class="text-2xl font-bold group-hover:underline">Coloring Pages</nuxt-link>
          <p>You might want to try!</p>
        </div>
        <div class="i-con-right w-6 h-6"/>
      </div>
      <div class="border p-3 flex justify-between items-center cursor-pointer group" @click="router.replace('/arts')">
        <div>
          <nuxt-link to="/arts" class="text-2xl font-bold group-hover:underline">Pixel Art</nuxt-link>
          <p>Pixel art by community!</p>
        </div>
        <div class="i-con-right w-6 h-6"/>
      </div>
    </div>
    <div>
      <p>A powerful and minimum online pixel editor that empowers individuals to unleash their creativity and create stunning pixel art masterpieces.</p>
    </div>
  </div>
</template>
