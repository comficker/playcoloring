<script setup lang="ts">
import {ref} from "@vue/reactivity";
import {useFetch, useSeoMeta, useRuntimeConfig} from "nuxt/app";
import {ResponseTagSchema, ResponseSharedPage} from "~/interface";
import ColoringCard from "~/components/ColoringCard.vue";
import PixelColoring from "~/components/PixelColoring.vue";
const router = useRouter()
const config = useRuntimeConfig()
const title = "Play Coloring - Online Coloring by Number - Pixel Editor"
const desc = 'Play Coloring was created to provide a Coloring by Number that promotes mindfulness and stress relief in an enjoyable and accessible way.'
useSeoMeta({
  title: title,
  description: desc,
  ogDescription: desc,
  ogTitle: title,
  ogImage: '/screenshot/default.png',
  twitterCard: 'summary_large_image',
})

const faqs = ref([
  {
    opened: true,
    title: "Why we love coloring?",
    aws: [
      "It is often used as a relaxation tool and a form of art therapy, allowing individuals to unwind and express themselves creatively. Coloring has been found to have calming effects, reducing anxiety, and increasing focus and mindfulness.",
      "Additionally, it can develop hand-eye coordination and fine motor skills in children, while building a sense of accomplishment and confidence through the completion of a colorful piece of art. Whether it's with pencils, markers, or digital tools, coloring is a fun and therapeutic activity that can be enjoyed by people of all ages."
    ]
  },
  {
    opened: true,
    title: "What is coloring?",
    aws: ["Coloring is an activity that involves filling in outlined designs or patterns with colors to create a finished image. This simple yet enjoyable activity is not only for kids, but it has become increasingly popular with adults as well."],
  },
  {
    opened: true,
    title: "How to play coloring?",
    aws: ["Use various coloring tools such as pencils, crayons, or markers to fill the outlined areas with different shades and colors, producing a completed image."]
  }
])
</script>

<template>
  <div class="space-y-6">
    <PixelColoring :is-editor="false"/>
    <div class="max-w-xl mx-auto space-y-4">
      <h1 class="text-5xl font-bold">Play Coloring, Hi!</h1>
      <p>Play Coloring was created to provide a Coloring by Number that promotes mindfulness and stress relief in an enjoyable and accessible way.
        <a href="/about" target="_blank" class="underline">About us!</a></p>
      <div class="grid gap-2 md:grid-cols-2">
        <div class="border p-3 flex justify-between items-center cursor-pointer group" @click="router.replace('/pages')">
          <div>
            <nuxt-link to="/pages" class="text-2xl font-bold group-hover:underline">Coloring Pages</nuxt-link>
            <p>You might want to try!</p>
          </div>
          <div class="i-con-right w-6 h-6"/>
        </div>
        <div class="border p-3 flex justify-between items-center cursor-pointer group" @click="router.replace('/arts')">
          <div>
            <nuxt-link to="/arts" class="text-2xl font-bold group-hover:underline">Pixel Art</nuxt-link>
            <p>Pixel art by community!</p>
          </div>
          <div class="i-con-right w-6 h-6"/>
        </div>
      </div>
    </div>
    <div class="max-w-xl mx-auto">
      <div class="space-y-4">
        <h2 class="text-5xl font-bold">FAQ</h2>
        <div v-for="(faq, i) in faqs" :key="i" class="space-y-1">
          <h3 class="cursor-pointer flex gap-1 items-center font-semibold text-xl" @click="faq.opened = !faq.opened">
            <span>{{ faq.title }}</span>
          </h3>
          <div v-show="faq.opened" class="space-y-2">
            <p v-for="aw in faq.aws">{{ aw }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
