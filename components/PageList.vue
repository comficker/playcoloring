<template>
  <div class="max-w-xl mx-auto space-y-4">
    <breadcrumb :crumbs="crumbs"/>
    <div class="space-y-2">
      <h1 class="text-4xl md:text-5xl font-bold">{{ meta.title }}</h1>
      <p class="text-lg">
        {{ meta.desc }}
        <template v-if="route.params.tax_id === 'arts'">
          using <nuxt-link class="underline" to="/editor">Pixel Editor</nuxt-link>
        </template>
      </p>
    </div>
  </div>
  <div class="max-w-xl mx-auto my-4">
    <div class="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
      <coloring-card v-for="item in variant.results" :value="item" show-author/>
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
      color = test[1].toLowerCase()
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
  const tax_id = route.params.tax_id.toString()
  let name = ''
  if (tax_id.startsWith('size')) {
    name = "Size"
    icon = 'i-con-ruler'
  } else if (tax_id.startsWith('color')) {
    name = "Color"
    icon = 'i-con-color'
  } else if (route.params.tax_id === 'pages') {
    name = "Coloring Pages"
    icon = 'i-con-color'
  } else if (route.params.tax_id === 'arts') {
    name = "Pixel Art"
    icon = 'i-con-color'
  }
  const arr: IBreadcrumb[] = [{
    name,
    to: `/${route.params.tax_id}`,
    icon: icon
  }]
  if (route.params.id_string) {
    const temp = route.params.id_string.toString().split("-")
    arr.push({
      name: variant.instance?.name || `${capitalize(temp[0])}: ${temp[1]}`,
      to: `/${route.params.tax_id}/${route.params.id_string}`,
      icon: undefined
    })
  }
  return arr
})

const meta = computed(() => {
  let defaultDesc = `Free {name} that you can play online or print out and color.`
  if (route.params.tax_id !== 'pages') {
    defaultDesc = `Free download {name} made by many Pixel Artists`
  }
  if (variant.instance) {
    const title = variant.instance.title + (route.params.tax_id === 'pages' ? " Coloring Pages by Number": " Pixel Art")
    return {
      title: title,
      desc: variant.instance.desc || defaultDesc.replace("{name}", title.toLowerCase()),
      imgSrc: variant.count ? `${config.public.apiBase}/coloring/files/${variant.results[0].id_string}.png` : '/screenshot/default.png'
    }
  } else {
    let title = route.params.tax_id === 'arts' ? 'Pixel Art': 'Coloring Pages';
    const id_string = route.params.id_string ? route.params.id_string.toString() : ''
    if (id_string) {
      const arr = id_string.split("-")
      if (id_string.startsWith("color-")) {
        title = `#${arr[1].toUpperCase()} ` + title
      } else {
        title = arr[1] + " " + title
      }
    }
    return {
      title: title,
      desc: defaultDesc.replace("{name}", title),
      imgSrc: '/screenshot/default.png'
    }
  }
})

const set_title = computed(() => {
  if (route.params.id_string) {
    return meta.value.title + (route.params.tax_id === 'arts' ? ' - Pixel Art': ' - Coloring Pages')
  }
  return meta.value.title
})

useHead({
  title: set_title.value,
  meta: [
    {
      name: "description",
      content: meta.value.desc
    }
  ]
})

useSeoMeta({
  title: set_title.value,
  ogDescription: meta.value.desc,
  ogTitle: meta.value.title,
  ogImage: meta.value.imgSrc + '?type=social',
  twitterCard: 'summary_large_image',
})
</script>
