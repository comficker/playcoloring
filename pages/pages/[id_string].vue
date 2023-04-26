<template>
  <div v-if="value" class="max-w-lg mx-auto space-y-4">
    <div class="space-y-2">
      <h1 class="uppercase text-xl font-bold">{{ meta.title }}</h1>
    </div>
    <div class="flex gap-2 flex-col md:flex-row">
      <div class="md:w-2/3 w-full">
        <div class="pt-full relative">
          <div class="absolute inset-0">
            <img :src="meta.imgSrc" :alt="meta.title" class="object-cover w-full h-full">
          </div>
          <div class="absolute inset-0 bg-grid">
            <canvas width="341" height="341" :id="`thumb_${value.id}`" class="w-full h-full"/>
          </div>
        </div>
      </div>
      <div class="flex-1 text-xs space-y-2">
        <div class="flex gap-2 items-center p-2 py-1 bg-white border border-[#F0F0F0]">
          <div class="w-5 h-5 i-con-palette"/>
          <div>
            <div class="text-gray-500">Colors</div>
            <div class="font-bold text-sm">{{value?.colors?.length}}</div>
          </div>
        </div>
        <div class="flex gap-2 items-center p-2 py-1 bg-white border border-[#F0F0F0]">
          <div class="w-5 h-5 i-con-ruler"/>
          <div>
            <div class="text-gray-500">Size</div>
            <div class="font-bold text-sm">{{Object.keys(value.map_numbers).length}}</div>
          </div>
        </div>
        <div class="flex gap-2 items-center p-2 py-1 bg-white border border-[#F0F0F0]">
          <div class="w-5 h-5 i-con-user"/>
          <div>
            <div class="text-gray-500">Creator</div>
            <div class="font-bold text-sm">Anomymous</div>
          </div>
        </div>
        <div class="flex gap-2 items-center p-2 py-1 bg-white border border-[#F0F0F0]">
          <div class="w-5 h-5 i-con-sign"/>
          <div>
            <div class="text-gray-500">Owner</div>
            <div class="font-bold text-sm">Anomymous</div>
          </div>
        </div>
      </div>
    </div>
    <p class="text-sm">{{ meta.desc }}</p>
    <div v-if="value.taxonomies.length" class="font-bold text-sm flex gap-2 flex-wrap items-center">
      <div class="font-bold text-sm flex gap-2 flex-wrap items-center">
        <div class="w-5 h-5 i-con-tags"/>
      </div>
      <nuxt-link
        class="p-0.5 px-2 rounded bg-gray-200 relative group"
        v-for="item in value.taxonomies" :key="item.id"
        :to="`/${item.id_string}`"
      >
        <span>{{ item.title }}</span>
      </nuxt-link>
    </div>
    <div class="flex gap-2 justify-between">
      <div class="flex gap-2">
        <div class="bg-white border cursor-pointer p-2 border-[#F0F0F0] justify-center" @click="print">
          <div class="w-4 h-4 i-con-print"/>
        </div>
        <a :href="meta.imgSrc" download target="_blank" class="bg-white border cursor-pointer p-2 border-[#F0F0F0] justify-center">
          <div class="w-4 h-4 i-con-download"/>
        </a>
        <nuxt-link :to="`/?id=${value.id_string}`" class="bg-white border cursor-pointer p-2 border-[#F0F0F0] justify-center">
          <div class="w-4 h-4 i-con-gamepad"/>
        </nuxt-link>
      </div>
      <div class="flex gap-2">
        <client-only>
          <ShareNetwork
            v-for="item in networks"
            :key="item"
            :network="item"
            :url="meta.url"
            :title="`${meta.title} - Pixel Coloring - Coloring by Number - playcoloring.com`"
            :description="meta.desc"
            :quote="meta.desc"
            :hashtags="value.taxonomies.map(x => x.title).join(',')"
          >
            <div class="bg-white border cursor-pointer p-2 border-[#F0F0F0] justify-center">
              <div class="w-4 h-4" :class="`i-con-${item}`"/>
            </div>
          </ShareNetwork>
        </client-only>
      </div>
    </div>
  </div>
  <div class="mt-4 max-w-lg mx-auto space-y-4">
    <div class="space-y-2">
      <h2 class="uppercase text-xl font-bold">Variants</h2>
      <div v-if="variant.results.length" class="grid grid-cols-3 gap-3">
        <coloring-card v-for="item in variant.results" :value="item"/>
      </div>
      <p v-if="variant.results.length === 0" class="p-4 py-2 bg-yellow-100 border text-sm">
        Don't have any variant, <nuxt-link class="underline" :to="`/?id=${value.id_string}`">Play and create one</nuxt-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useHead, useRoute, useRuntimeConfig, useSeoMeta} from "#app";
import {ResponseSharedPage, SharedPage} from "~/interface";
import {useAuthFetch} from "~/composables/useAuthFetch";
import {onMounted} from "@vue/runtime-core";
import ColoringCard from "~/components/ColoringCard.vue";
import {computed} from "vue";

const config = useRuntimeConfig()
const route = useRoute()
const [{data: r1}, {data: r2}] = await Promise.all([
  useAuthFetch<SharedPage>(`/coloring/shared-pages/${route.params.id_string}/`).then(res => {
    if (res.data.value) {
      if (!res.data.value.colors) res.data.value.colors = []
      if (!res.data.value.map_numbers) res.data.value.map_numbers = {}
    }
    return res
  }),
  useAuthFetch<ResponseSharedPage>(`/coloring/shared-pages/`, {
    params: {
      page_size: 6,
      template__id_string: route.params.id_string,
      status: 'public'
    }
  }),
])

const value: SharedPage = r1.value as SharedPage
const variant: ResponseSharedPage = r2.value as ResponseSharedPage
const networks = ["facebook", "twitter", "telegram", "pinterest"]

const render = () => {
  if (!value) return;
  const canvas: HTMLCanvasElement | null = document.getElementById(`thumb_${value.id}`) as HTMLCanvasElement
  if (canvas) {
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    const ratio = canvas.width / value.width
    for (let x = 0; x < value.width; x++) {
      for (let y = 0; y < value.height; y++) {
        const index = `${x}-${y}`
        if (value.map_numbers[index] >= 0) {
          ctx.fillStyle = value.colors[value.map_numbers[index]]
          ctx.fillRect(x * ratio, y * ratio, ratio, ratio);
        }
      }
    }
  }
}

onMounted(() => {
  render()
})

const meta = computed(() => {
  const defaultDesc = 'It\'s awesome!'
  const url = `https://www.playcoloring.com/pages/${value.id_string}`
  if (value) {
    return {
      url: url,
      title: value.name || value.id_string,
      desc: value.desc || defaultDesc,
      imgSrc: `${config.public.apiBase}/coloring/files/${value.id_string}.png`
    }
  } else {
    return {
      url: url,
      title: 'Untitled',
      desc: defaultDesc,
      imgSrc: '/screenshot/default.png'
    }
  }
})

const print = () => {

}

useHead({
  title: meta.value.title,
  meta: [
    {
      name: "description",
      content: meta.value.desc
    }
  ]
})

useSeoMeta({
  title: meta.value.title,
  ogDescription: meta.value.desc,
  ogTitle: meta.value.title,
  ogImage: meta.value.imgSrc + '?type=social',
  twitterCard: 'summary_large_image',
})
</script>

<style>
.bg-grid {
  @apply border;

  background-color: #FFFFFF;
  background-size: 3.12500% 3.12500%;
  background-image: linear-gradient(to right, #F0F0F0 1px, transparent 1px), linear-gradient(to bottom, #F0F0F0 1px, transparent 1px);
  background-position-x: -1px;
  background-position-y: -1px;
  border-color: #F0F0F0;
  width: 100%;
  height: 100%;
}
</style>
