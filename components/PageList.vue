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
import {IBreadcrumb} from "~/interface";
import {useHead, useRoute, useRuntimeConfig} from "#app";
import {ResponseSharedPage} from "~/interface";
import {useAuthFetch} from "~/composables/useAuthFetch";
import ColoringCard from "~/components/ColoringCard.vue";
import {computed} from "vue";
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
  if (!['shared', 'template', 'color', 'size'].includes(route.params.tax_id.toString())) {
    taxonomies__id_string = route.params.tax_id
  }
  if (route.params.id_string) {
    if (route.params.tax_id.toString() === 'size') {
      const arr = route.params.id_string.toString().split('x')
      width = arr[0]
      height = arr[1]
    } else if (route.params.tax_id.toString() === 'color') {
      color = route.params.id_string.toString()
    } else if (route.params.tax_id === 'author' && route.params.id_string.toString() !== 'anonymous') {
      user = route.params.id_string.toString()
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
    is_template: route.params.tax_id !== 'shared'
  }
})
const {data: r2} = await useAuthFetch<ResponseSharedPage>(`/coloring/shared-pages/`, {params: params.value})

const variant: ResponseSharedPage = r2.value as ResponseSharedPage

const crumbs = computed<IBreadcrumb[]>(() => {
  let icon = `i-con-${route.params.tax_id}`
  if (route.params.tax_id === 'author') {
    icon = 'i-con-user'
  } else if (route.params.tax_id === 'size') {
    icon = 'i-con-ruler'
  }
  const arr = [{
    name: capitalize(route.params.tax_id.toString()),
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
  const defaultDesc = `Our collection of coloring pages features a wide variety of themes, including animals, nature, and more.`
  if (variant.instance) {
    return {
      title: variant.instance.title,
      desc: variant.instance.desc || defaultDesc,
      imgSrc: variant.count ? `${config.public.apiBase}/coloring/files/${variant.results[0].id_string}.png` : '/screenshot/default.png'
    }
  } else {
    let title = `${capitalize(route.params.tax_id.toString())}`
    if (route.params.id_string) {
      title = title + ' ' + (route.params.tax_id.toString() === 'color' ? '#' : '') + route.params.id_string.toString()
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
