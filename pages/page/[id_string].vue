<template>
  <div>
    <breadcrumb/>
    <div v-if="value" class="max-w-xl mx-auto space-y-4">
      <div class="w-full pt-full relative bg-white">
        <div class="absolute inset-4">
          <img
            id="mainImg"
            v-if="value.status == 'public' || !value.status"
            :src="meta.imgSrc"
            :alt="meta.title"
            class="object-contain w-full md:max-w-sm mx-auto h-full"
          >
          <canvas
            v-else
            :id="`canvas_${value.id}`"
            class="duration-300 w-full h-full"
            width="200"
            height="200"
          />
        </div>
      </div>
      <div>
        <h1 class="text-4xl font-bold">{{ meta.title }}</h1>
        <p>{{ meta.desc }}</p>
      </div>
      <div class="flex flex-row gap-4 justify-between">
        <div class="flex-1 flex gap-2 font-medium">
          <div class="btn hover:shadow border-gray-200" @click="print">
            <div class="w-4 h-4 i-con-print"/>
            <span class="hidden md:block">Print</span>
          </div>
          <a class="btn hover:shadow border-gray-200" :href="meta.imgSrc" download target="_blank">
            <div class="w-4 h-4 i-con-download"/>
            <span class="hidden md:block">Download</span>
          </a>
          <nuxt-link
            v-if="value.is_template || isOwner"
            :to="`/?id=${value.id_string}`"
            class="btn flex-1 justify-center uppercase font-semibold text-sm bg-blue-500 text-white"
          >
            <div class="w-4 h-4 i-con-gamepad"/>
            <span class="hidden md:block" v-if="isOwner && !value.is_template">Continue</span>
            <span class="hidden md:block" v-else>Play</span>
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
          class="w-10 h-10"
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
            <div class="font-bold">{{ Object.keys(value.map_numbers).length }}</div>
          </div>
        </div>
        <div class="flex gap-2 items-center p-2 py-1 bg-white border-b md:border border-gray-100">
          <div class="w-8 h-8 i-con-ruler"/>
          <div>
            <div class="text-sm text-gray-500">Size</div>
            <div class="flex gap-4">
              <nuxt-link :to="`/${space}/size-${value.width}x${value.height}`" class="flex gap-1 hover:underline">
                <div class="font-bold">{{ value.width }}x{{ value.height }}</div>
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
              class="font-bold hover:underline">{{ value.user?.username || 'Anonymous' }}
            </nuxt-link>
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
        <p v-if="variant.results.length === 0" class="p-4 py-2 bg-yellow-100 font-semibold border">
          Don't have any variant,
          <nuxt-link class="underline" :to="`/game?id=${value.id_string}`">Play and create one</nuxt-link>
        </p>
      </div>
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
import Breadcrumb from "~/components/Breadcrumb.vue";
import {useUserStore} from "~/stores/user";
import {drawThumbnail} from "~/helper/canvas";

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

const space = computed(() => {
  return value.is_template ? 'pages' : 'arts'
})

userStore.setBC([{
  name: "Coloring Pages",
  to: "/pages",
  icon: "i-con-template",
}, {
  name: meta.value.title,
  to: '/post/' + value.id_string,
  icon: 'i-con-picture',
}])

useHead({
  title: meta.value.title + ` - ${value.width}x${value.height} - ${value.is_template ? 'Coloring by Number' : 'Pixel Arts'}`,
  meta: [
    {
      name: "description",
      content: meta.value.desc
    },
    ...value.status !== 'public' ? [{hid: 'robots', name: 'robots', content: 'noindex'}] : []
  ]
})

useSeoMeta({
  title: meta.value.title + ` - ${value.width}x${value.height} - ${value.is_template ? 'Coloring by Number' : 'Pixel Arts'}`,
  ogDescription: meta.value.desc,
  ogTitle: meta.value.title,
  ogImage: meta.value.imgSrc + '?type=social',
  twitterCard: 'summary_large_image',
})

onMounted(() => {
  if (!(value.status == 'public' || !value.status)) {
    drawThumbnail(value)
  }
  render()
})

const print = () => {
  window.open(meta.value.imgSrc.replace(".png", ".pdf"), '_blank')
}

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
</script>
