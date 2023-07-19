<template>
  <div v-if="value" class="max-w-xl mx-auto space-y-4 md:space-y-6 py-4">
    <breadcrumb :crumbs="crumbs"/>
    <div>
      <h1 class="text-4xl font-bold">{{ meta.title }}</h1>
      <p>{{ meta.desc }}</p>
    </div>
    <div class="w-full">
      <img :src="meta.imgSrc" :alt="meta.title" class="object-cover w-full md:max-w-sm mx-auto h-full">
    </div>
    <div class="flex flex-col md:flex-row gap-4 justify-between">
      <div class="flex-1 flex gap-2">
        <div class="btn border" @click="print">
          <div class="w-4 h-4 i-con-print"/>
        </div>
        <a :href="meta.imgSrc" download target="_blank" class="btn border">
          <div class="w-4 h-4 i-con-download"/>
        </a>
        <nuxt-link
          v-if="value.is_template || isOwner"
          :to="`/?id=${value.id_string}`"
          class="btn flex-1 justify-center uppercase font-semibold text-sm bg-blue-500 text-white"
        >
          <div class="w-4 h-4 i-con-gamepad"/>
          <span v-if="isOwner">Continue</span>
          <span v-else>Play</span>
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
            :media="meta.imgSrc"
            class="btn border"
          >
            <div class="w-4 h-4" :class="`i-con-${item}`"/>
          </ShareNetwork>
        </client-only>
      </div>
    </div>
    <div v-if="value.taxonomies.length" class="font-semibold text-sm flex gap-2 flex-wrap items-center">
      <div class="text-sm flex gap-2 flex-wrap items-center">
        <div class="w-5 h-5 i-con-tags"/>
      </div>
      <nuxt-link
        class="p-0.5 px-2 rounded bg-green-400 text-white hover:underline"
        v-for="item in value.taxonomies" :key="item.id"
        :to="`/${space}/${item.id_string}`"
      >
        <span>{{ item.title }}</span>
      </nuxt-link>
    </div>
    <div v-if="value.colors.length" class="font-semibold text-sm flex gap-2 flex-wrap items-center">
      <nuxt-link
        class="w-6 h-6 border"
        v-for="item in value.colors" :key="item"
        :to="`/${space}/color-${item.toUpperCase().replace('#', '')}`"
        :style="{background: item}"
      >
        <span class="hidden">{{ item }}</span>
      </nuxt-link>
    </div>
    <div class="grid md:grid-cols-2 gap-3">
      <div class="flex gap-2 items-center p-2 py-1 bg-white border-b md:border border-gray-100">
        <div class="w-8 h-8 i-con-ruler"/>
        <div class="block">
          <div class="text-sm text-gray-500">Length</div>
          <div class="font-bold">{{Object.keys(value.map_numbers).length}}</div>
        </div>
      </div>
      <div class="flex gap-2 items-center p-2 py-1 bg-white border-b md:border border-gray-100">
        <div class="w-8 h-8 i-con-ruler"/>
        <div>
          <div class="text-sm text-gray-500">Size</div>
          <div class="flex gap-4">
            <nuxt-link :to="`/${space}/size-${value.width}x${value.height}`" class="flex gap-1 hover:underline">
              <div class="font-bold">{{value.width}}x{{value.height}}</div>
            </nuxt-link>
          </div>
        </div>
      </div>
      <div class="flex gap-2 items-center p-2 py-1 bg-white border-b md:border border-gray-100">
        <div class="w-8 h-8 i-con-user"/>
        <div>
          <div class="text-sm text-gray-500">Creator</div>
          <nuxt-link
            :to="`/author/${value.user?.username || 'anonymous'}`"
            class="font-bold hover:underline">{{value.user?.username || 'Anonymous'}}</nuxt-link>
        </div>
      </div>
      <div class="flex gap-2 items-center p-2 py-1 bg-white border-b md:border border-gray-100">
        <div class="w-8 h-8 i-con-sign"/>
        <div>
          <div class="text-sm text-gray-500">Owner</div>
          <div class="font-bold">__</div>
        </div>
      </div>
    </div>
    <div class="space-y-2">
      <h2 class="uppercase text-xs font-bold">Variants</h2>
      <div v-if="variant.results.length" class="grid grid-cols-2 md:grid-cols-3 gap-3">
        <coloring-card v-for="item in variant.results" :value="item" show-author/>
      </div>
      <p v-if="variant.results.length === 0" class="p-4 py-2 bg-yellow-100 border text-sm">
        Don't have any variant, <nuxt-link class="underline" :to="`/?id=${value.id_string}`">Play and create one</nuxt-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useHead, useRoute, useRuntimeConfig, useSeoMeta} from "#app";
import {IBreadcrumb, ResponseSharedPage, SharedPage} from "~/interface";
import {useAuthFetch} from "~/composables/useAuthFetch";
import {onMounted} from "@vue/runtime-core";
import ColoringCard from "~/components/ColoringCard.vue";
import {computed} from "vue";
import Breadcrumb from "~/components/Breadcrumb.vue";
import {useUserStore} from "~/stores/user";

const config = useRuntimeConfig()
const route = useRoute()
const userStore = useUserStore()
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
  const defaultDesc = ''
  const url = `https://www.playcoloring.com/post/${value.id_string}`
  let src = `${config.public.apiBase}/coloring/files/${value.id_string}.png`
  if (value) {
    return {
      url: url,
      title: `${value.name || value.id_string}`,
      desc: value.desc || defaultDesc,
      imgSrc: src
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

const isOwner = computed(() => {
  return value.user && userStore.isLogged && value.user.id === userStore.logged.id
})

const crumbs = computed<IBreadcrumb[]>(() => [{
  name: value.is_template ? 'Coloring Pages' : 'Arts',
  to: value.is_template ? '/pages' : '/arts',
  icon: value.is_template ? 'i-con-template' : 'i-con-shared',
},{
  name: meta.value.title,
  to: '/post/' + value.id_string,
  icon: 'i-con-picture',
}])


const space = computed(() => {
  return value.is_template ? 'pages' : 'arts'
})

const print = () => {

}

useHead({
  title: meta.value.title +  ` - ${value.width}x${value.height} - ${value.is_template ? 'Coloring by Number': 'Pixel Arts'}`,
  meta: [
    {
      name: "description",
      content: meta.value.desc
    }
  ]
})

useSeoMeta({
  title: meta.value.title +  ` - ${value.width}x${value.height} - ${value.is_template ? 'Coloring by Number': 'Pixel Arts'}`,
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
