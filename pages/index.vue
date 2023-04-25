<script setup lang="ts">
import {ref} from "@vue/reactivity";
import {useFetch, useSeoMeta, useRuntimeConfig} from "nuxt/app";
import {ResponseTagSchema, ResponseSharedPage} from "~/interface";
import ColoringCard from "~/components/ColoringCard.vue";
import PixelColoring from "~/components/PixelColoring.vue";

const config = useRuntimeConfig()
const title = "Online Coloring Page"
const desc = 'A coloring page is a black and white drawing, design or pattern that is printed or displayed on paper or digital formats.'
useSeoMeta({
  title: title,
  description: desc,
  ogDescription: desc,
  ogTitle: title,
  ogImage: '/screenshot/default.png',
  twitterCard: 'summary_large_image',
})

const [{data: tag}, {data: page}] = await Promise.all([
  useFetch<ResponseTagSchema>(`${config.public.apiBase}/coloring/tags/`, {
    params: {
      page_size: 100,
      type: 'tag'
    }
  }),
  useFetch<ResponseSharedPage>(`${config.public.apiBase}/coloring/shared-pages/`, {
    params: {
      page_size: 6,
      is_template: true,
      status: 'public'
    }
  }),
])
const responseTag: ResponseTagSchema = tag.value as ResponseTagSchema
const responsePage: ResponseSharedPage = page.value as ResponseSharedPage

const faqs = ref([
  {
    opened: true,
    title: "What is coloring?",
    aws: ["Coloring is an activity that involves filling in outlined designs or patterns with colors to create a finished image. This simple yet enjoyable activity is not only for kids, but it has become increasingly popular with adults as well."],
  }, {
    opened: false,
    title: "What is coloring therapy?",
    aws: [
      "It is often used as a relaxation tool and a form of art therapy, allowing individuals to unwind and express themselves creatively. Coloring has been found to have calming effects, reducing anxiety, and increasing focus and mindfulness.",
      "Additionally, it can develop hand-eye coordination and fine motor skills in children, while building a sense of accomplishment and confidence through the completion of a colorful piece of art. Whether it's with pencils, markers, or digital tools, coloring is a fun and therapeutic activity that can be enjoyed by people of all ages."
    ]
  }, {
    opened: false,
    title: "What is a coloring page?",
    aws: [
      "A coloring page is a black and white drawing, design or pattern that is printed or displayed on paper or digital formats. Individuals can use various coloring tools such as pencils, crayons, or markers to fill the outlined areas with different shades and colors, producing a completed image...."
    ]
  }
])
</script>

<template>
  <div class="space-y-4 max-w-lg mx-auto">
    <div class="max-w-lg mx-auto space-y-4">
      <div class="flex justify-between items-center">
        <h1>
          <nuxt-link class="flex items-center gap-1" to="/">
            <div class="w-10 h-10 i-con-palette fill-red-400"/>
            <img class="h-7 w-auto" src="/logo-px.png" alt="">
          </nuxt-link>
        </h1>
      </div>
      <div class="flex justify-between">
        <div>
          <div>Download printable coloring or play online</div>
          <div class="text-sm underline">How to play?</div>
        </div>
      </div>
    </div>
    <PixelColoring/>
    <div class="divide-y mx-auto">
      <p class="text-sm italic"><b>HOW TO PLAY</b>: Use various coloring tools such as pencils, crayons, or markers
        to fill the outlined areas with different shades and colors, producing a completed image.</p>
    </div>
  </div>
  <div class="space-y-4 max-w-lg mx-auto mt-4">
    <h2 class="uppercase text-xl font-bold">Browse Coloring Pages</h2>
    <h3 v-if="responseTag.results.length" class="font-bold text-xs uppercase">Coloring Pages by tag</h3>
    <div v-if="responseTag.results.length" class="flex flex-wrap gap-2">
      <nuxt-link
        v-for="item in responseTag.results" :to="`/coloring-pages/${item.id_string}`"
        class="p-0.5 px-2 bg-orange-200 rounded cursor-pointer"
      >
        {{ item.name }}
      </nuxt-link>
    </div>
    <div class="flex justify-between items-end text-xs uppercase">
      <h3 class="font-bold">Newest Coloring Pages</h3>
      <nuxt-link to="/pages" class="underline">More</nuxt-link>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
      <coloring-card v-for="item in responsePage.results" :value="item"/>
    </div>
    <div v-if="false" class="max-w-lg mx-auto grid grid-cols-2 gap-4 mt-4">
      <nuxt-link to="/gallery" class="btn border bg-white">
        <div class="i-con-download w-10 h-10"/>
        <div>
          <div>Gallery</div>
        </div>
      </nuxt-link>
      <nuxt-link to="/pages" class="btn border bg-white">
        <div class="i-con-save w-10 h-10"/>
        <div>
          <div>Template</div>
        </div>
      </nuxt-link>
    </div>
    <h2 class="uppercase text-xl font-bold">FAQ</h2>
    <div v-for="(faq, i) in faqs" :key="i">
      <h3 class="font-bold cursor-pointer flex gap-2 items-center" @click="faq.opened = !faq.opened">
        <div class="w-4 h-4 i-con-right"/>
        <span>{{ faq.title }}</span>
      </h3>
      <div v-show="faq.opened" class="space-y-2 mt-3">
        <p v-for="aw in faq.aws" class="text-zinc-500 text-sm">{{ aw }}</p>
      </div>
    </div>
  </div>
</template>
