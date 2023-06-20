<template>
  <div class="max-w-xl mx-auto space-y-4">
    <div class="space-y-2">
      <h1 class="text-4xl md:text-5xl font-bold">{{ meta.title }}</h1>
      <p class="text-lg">{{ meta.desc }}</p>
      <div class="grid grid-cols-2 gap-3">
        <coloring-card v-for="item in variant.results" :value="item"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useHead, useRoute, useRuntimeConfig} from "#app";
import {ResponseSharedPage} from "~/interface";
import {useAuthFetch} from "~/composables/useAuthFetch";
import ColoringCard from "~/components/ColoringCard.vue";
import {computed} from "vue";
import {useSeoMeta} from "nuxt/app";

const config = useRuntimeConfig()
const route = useRoute()
const [{data: r2}] = await Promise.all([
  useAuthFetch<ResponseSharedPage>(`/coloring/shared-pages/`, {
    params: {
      page_size: 12,
      status: 'public',
      taxonomies__id_string: route.params.tax_id && !['shared', 'template'].includes(route.params.tax_id.toString()) ? route.params.tax_id: undefined,
      is_template: route.params.tax_id !== 'shared'
    }
  }),
])

const variant: ResponseSharedPage = r2.value as ResponseSharedPage

const meta = computed(() => {
  const defaultDesc = 'Our collection of coloring shared features a wide variety of themes, including animals, nature, and more.'
  if (variant.instance) {
    return {
      title: variant.instance.title,
      desc: variant.instance.desc || defaultDesc,
      imgSrc: variant.count ? `${config.public.apiBase}/coloring/files/${variant.results[0].id_string}.png` : '/screenshot/default.png'
    }
  } else {
    return {
      title: `Newest ${route.params.tax_id} shared`,
      desc: defaultDesc,
      imgSrc: '/screenshot/default.png'
    }
  }
})

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
