<template>
  <div class="max-w-xl mx-auto space-y-4">
    <breadcrumb :crumbs="crumbs"/>
    <div class="space-y-2">
      <h1 class="text-4xl md:text-5xl font-bold">{{ meta.title }}</h1>
      <p class="text-lg">{{ meta.desc }}</p>
    </div>
  </div>
  <div class="max-w-3xl mx-auto mt-4">
    <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
      <coloring-card v-for="item in variant.results" :value="item"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed} from "vue";
import {IBreadcrumb} from "~/interface";
import {useHead, useRoute, useRuntimeConfig} from "#app";
import {ResponseSharedPage} from "~/interface";
import {useAuthFetch} from "~/composables/useAuthFetch";
import ColoringCard from "~/components/ColoringCard.vue";

import {useSeoMeta} from "nuxt/app";
import Breadcrumb from "~/components/Breadcrumb.vue";
function capitalize(word: string) {
  const lower = word.toLowerCase();
  return word.charAt(0).toUpperCase() + lower.slice(1);
}
const config = useRuntimeConfig()
const route = useRoute()
const params = computed(() => {
  let taxonomies__id_string, width, height, color, user
  const is_template = route.params.tax_id.toString() === 'pages'
  const id_string = route.params.id_string ? route.params.id_string.toString() : ''
  if (id_string) {
    const test = id_string.split("-")
    if (id_string.startsWith("size-")) {
      const arr = test[1].split('x')
      width = arr[0]
      height = arr[1]
    } else if (id_string.startsWith("color-")) {
      color = test[1]
    } else if (id_string.startsWith("creator-")) {
      user = test[1]
    } else {
      taxonomies__id_string = route.params.id_string
    }
  }

  return {
    page_size: 12,
    status: 'public',
    taxonomies__id_string,
    width,
    height,
    color,
    user,
    is_template
  }
})
const {data: r2} = await useAuthFetch<ResponseSharedPage>(`/coloring/shared-pages/`, {params: params.value})

const variant: ResponseSharedPage = r2.value as ResponseSharedPage

const crumbs = computed<IBreadcrumb[]>(() => {
  let icon
  let name = capitalize(route.params.tax_id.toString())
  if (route.params.tax_id === 'author') {
    icon = 'i-con-user'
  } else if (route.params.tax_id === 'size') {
    icon = 'i-con-ruler'
  } else if (route.params.tax_id === 'pages') {
    name = "Coloring " + name
    icon = 'i-con-color'
  } else {
    icon = 'i-con-color'
  }
  const arr = [{
    name,
    to: `/${route.params.tax_id}`,
    icon: icon
  }]
  if (route.params.id_string) {
    arr.push({
      name: (route.params.tax_id.toString() === 'color' ? '#' : '') + route.params.id_string.toString(),
      to: `/${route.params.tax_id}/${route.params.id_string}`,
      icon: null
    })
  }
  return arr
})

const meta = computed(() => {
  let defaultDesc = ``
  if (variant.instance) {
    return {
      title: variant.instance.title + (variant.instance.is_template ? " Coloring Pages": " Pixel Arts"),
      desc: variant.instance.desc || defaultDesc,
      imgSrc: variant.count ? `${config.public.apiBase}/coloring/files/${variant.results[0].id_string}.png` : '/screenshot/default.png'
    }
  } else {
    let title = route.params.tax_id === 'arts' ? 'Pixel Arts': 'Coloring Pages';
    const id_string = route.params.id_string ? route.params.id_string.toString() : ''
    if (id_string) {
      const arr = id_string.split("-")
      title = `${capitalize(arr[0])} ${id_string.startsWith("color-") ? "#": ""}${arr[1].toUpperCase()}: ${title}`
    }
    return {
      title: title,
      desc: defaultDesc,
      imgSrc: '/screenshot/default.png'
    }
  }
})

useHead({
  title: meta.value.title + ' | Coloring Pages',
  meta: [
    {
      name: "description",
      content: meta.value.desc
    }
  ]
})

useSeoMeta({
  title: meta.value.title + ' | Coloring Pages',
  ogDescription: meta.value.desc,
  ogTitle: meta.value.title,
  ogImage: meta.value.imgSrc + '?type=social',
  twitterCard: 'summary_large_image',
})
</script>
