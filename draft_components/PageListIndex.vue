<template>
  <breadcrumb/>
  <div class="max-w-xl mx-auto space-y-2">
    <h1 class="text-4xl md:text-5xl font-bold">Coloring pages</h1>
    <p class="text-lg">Free Coloring Pages that you can play online or print out and color.</p>
  </div>
  <div v-if="r1.count" class="max-w-xl mx-auto my-6 space-y-2">
    <div class="flex gap-2 items-center">
      <div class="flex gap-1">
        <div class="w-5 h-5 i-con-star text-yellow-500"/>
        <div class="w-5 h-5 i-con-star text-yellow-500"/>
        <div class="w-5 h-5 i-con-star-outline"/>
        <div class="w-5 h-5 i-con-star-outline"/>
        <div class="w-5 h-5 i-con-star-outline"/>
      </div>
      <h2 class="font-bold text-xl">8x8</h2>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
      <coloring-card v-for="item in r1.results" :value="item" :key="item.id" show-author/>
    </div>
  </div>
  <div v-if="r2.count" class="max-w-xl mx-auto my-6 space-y-2">
    <div class="flex gap-2 items-center">
      <div class="flex gap-1">
        <div class="w-5 h-5 i-con-star text-yellow-500"/>
        <div class="w-5 h-5 i-con-star text-yellow-500"/>
        <div class="w-5 h-5 i-con-star-outline"/>
        <div class="w-5 h-5 i-con-star-outline"/>
        <div class="w-5 h-5 i-con-star-outline"/>
      </div>
      <h2 class="font-bold text-xl">16x16</h2>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
      <coloring-card v-for="item in r2.results" :value="item" :key="item.id" show-author/>
    </div>
  </div>
  <div v-if="r3.count" class="max-w-xl mx-auto my-6 space-y-2">
    <div class="flex gap-2 items-center">
      <div class="flex gap-1">
        <div class="w-5 h-5 i-con-star text-yellow-500"/>
        <div class="w-5 h-5 i-con-star text-yellow-500"/>
        <div class="w-5 h-5 i-con-star-outline"/>
        <div class="w-5 h-5 i-con-star-outline"/>
        <div class="w-5 h-5 i-con-star-outline"/>
      </div>
      <h2 class="font-bold text-xl">24x24</h2>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
      <coloring-card v-for="item in r3.results" :value="item" :key="item.id" show-author/>
    </div>
  </div>
  <div v-if="r4.count" class="max-w-xl mx-auto my-6 space-y-2">
    <div class="flex gap-2 items-center">
      <div class="flex gap-1">
        <div class="w-5 h-5 i-con-star text-yellow-500"/>
        <div class="w-5 h-5 i-con-star text-yellow-500"/>
        <div class="w-5 h-5 i-con-star-outline"/>
        <div class="w-5 h-5 i-con-star-outline"/>
        <div class="w-5 h-5 i-con-star-outline"/>
      </div>
      <h2 class="font-bold text-xl">32x32</h2>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
      <coloring-card v-for="item in r4.results" :value="item" :key="item.id" show-author/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useHead, useRoute, useRuntimeConfig} from "#app";
import {ResponseSharedPage} from "~/interface";
import {useAuthFetch} from "~/composables/useAuthFetch";
import ColoringCard from "~/components/ColoringCard.vue";

import {useSeoMeta} from "nuxt/app";
import Breadcrumb from "~/components/Breadcrumb.vue";
import {useUserStore} from "~/stores/user";

const userStore = useUserStore()

const route = useRoute()
const config = useRuntimeConfig()

const params = {
  page: 1,
  page_size: 6,
  status: 'public',
  is_template: true
}

const [{data: r1}, {data: r2}, {data: r3}, {data: r4}] = await Promise.all([
  useAuthFetch<ResponseSharedPage>(`/coloring/shared-pages/`, {
    params: {...params, width: 8, height: 8},
    key: 'r1'
  }),
  useAuthFetch<ResponseSharedPage>(`/coloring/shared-pages/`, {
    params: {...params, width: 16, height: 16},
    key: 'r2'
  }),
  useAuthFetch<ResponseSharedPage>(`/coloring/shared-pages/`, {
    params: {...params, width: 24, height: 32},
    key: 'r3'
  }),
  useAuthFetch<ResponseSharedPage>(`/coloring/shared-pages/`, {
    params: {...params, width: 32, height: 32},
    key: 'r4'
  })
])

userStore.setBC([{
  name: 'Coloring Pages',
  to: `/${route.params.tax_id}`,
  icon: 'i-con-color'
}])

useHead({
  title: "Coloring pages",
  meta: [
    {
      name: "description",
      content: "Free Coloring Pages that you can play online or print out and color."
    }
  ]
})

useSeoMeta({
  title: "Coloring pages",
  ogDescription: "Free Coloring Pages that you can play online or print out and color.",
  ogTitle: "Coloring pages",
  ogImage: '/screenshot/default.png',
  twitterCard: 'summary_large_image',
})
</script>
