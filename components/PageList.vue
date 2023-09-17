<template>
  <div class="space-y-4">
    <breadcrumb/>
    <div v-if="!isPWA" class="hidden md:block max-w-xl mx-auto space-y-2">
      <h1 class="text-4xl md:text-5xl font-bold">{{ meta.title }}</h1>
      <p class="text-lg">{{ meta.desc }}</p>
    </div>
    <div class="max-w-xl mx-auto space-y-4">
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        <coloring-card v-for="item in r2.results" :value="item" :key="item.id" show-author/>
      </div>
      <div class="flex font-semibold">
        <nuxt-link v-if="pagination.p" class="btn hover:shadow" :to="pagination.p">
          <div class="i-con-left w-6 h-6"/>
          <span>Previous</span>
        </nuxt-link>
        <div class="flex-1 flex justify-center gap-3">
          <div class="btn hover:shadow">
            <span>Current:</span>
            <span>{{ page }}</span>
            <span>/</span>
            <span>{{ r2.num_pages }}</span>
          </div>
        </div>
        <nuxt-link v-if="pagination.n" class="btn hover:shadow" :to="pagination.n">
          <span>Next</span>
          <div class="i-con-right w-6 h-6"/>
        </nuxt-link>
      </div>
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
import {useUserStore} from "~/stores/user";

const userStore = useUserStore()
const {$pwa} = useNuxtApp()

function capitalize(word: string) {
  const lower = word.toLowerCase();
  return word.charAt(0).toUpperCase() + lower.slice(1);
}

const route = useRoute()
const config = useRuntimeConfig()

const page = ref(route.query.page ? Number.parseInt(route.query.page.toString()) : 1)
const is_template = computed(() => route.path.includes('/pages'))
const params = computed(() => {
  let taxonomies__id_string, width, height, color, user
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
const isPWA = computed(() => Boolean($pwa && $pwa.isInstalled))

const {data: r2} = await useAuthFetch<ResponseSharedPage>(`/coloring/shared-pages/`, {
  params: {
    ...params.value,
    page: page
  },
  watch: [page]
})

const variant: ResponseSharedPage = r2.value as ResponseSharedPage

const crumbs = computed<IBreadcrumb[]>(() => {
  let icon
  let name = ''
  let path = '/'
  if (is_template.value) {
    name = "Coloring Pages"
    icon = 'i-con-color'
    path = '/pages'
  } else if (route.path.includes('arts')) {
    name = "Pixel Art"
    icon = 'i-con-color'
    path = '/arts'
  }
  const arr: IBreadcrumb[] = [{
    name,
    to: path,
    icon: icon
  }]
  if (route.params.id_string) {
    const temp = route.params.id_string.toString().split("-")
    arr.push({
      name: variant.instance?.name || `${capitalize(temp[0])}: ${temp[1]}`,
      to: `${path}/${route.params.id_string}`,
      icon: undefined
    })
  }
  return arr
})

userStore.setBC(crumbs.value)

const meta = computed(() => {
  let defaultDesc = `Free {name} that you can play online or print out and color.`
  if (!is_template.value) {
    defaultDesc = `Free download {name} made by many Pixel Artists`
  }
  if (variant.instance) {
    const title = variant.instance.title + (is_template.value ? " Coloring Pages by Number" : " Pixel Art")
    return {
      title: title,
      desc: variant.instance.desc || defaultDesc.replace("{name}", title.toLowerCase()),
      imgSrc: variant.count ? `${config.public.apiBase}/coloring/files/${variant.results[0].id_string}.png` : '/screenshot/default.png'
    }
  } else {
    let title = is_template.value ? 'Coloring Pages': 'Pixel Art';
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
    return meta.value.title + (is_template.value ? ' - Coloring Pages' : ' - Pixel Art')
  }
  return meta.value.title
})

const pagination = computed(() => ({
  n: r2.value?.links?.next ? `${route.path}?page=${page.value + 1}` : null,
  p: r2.value?.links?.previous ? `${route.path}?page=${page.value - 1}` : null
}))

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

watch(() => route.query, () => {
  page.value = route.query.page ? Number.parseInt(route.query.page.toString()) : 1
})
</script>
