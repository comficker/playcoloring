<script setup lang="ts">
import {ref} from "@vue/reactivity";
import {useSeoMeta, useRuntimeConfig} from "nuxt/app";
import ColoringCard from "~/components/ColoringCard.vue";
import {useHomeStore} from "~/stores/home";

const config = useRuntimeConfig()
const {$pwa} = useNuxtApp()
const hs = useHomeStore()

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
    <editor/>
    <template v-if="!$pwa || !$pwa.isInstalled">
      <div class="max-w-xl mx-auto space-y-4">
        <h1 class="text-3xl md:text-5xl font-bold">Play Coloring, Hi!</h1>
        <p>Play Coloring was created to provide a Coloring by Number that promotes mindfulness and stress relief in an
          enjoyable and accessible way.
          <a href="/about" target="_blank" class="underline">About us!</a></p>
        <div v-if="hs.r1.count" class="max-w-xl mx-auto my-4 space-y-2">
          <div class="flex gap-2 items-center">
            <div class="flex gap-1">
              <div class="w-5 h-5 i-con-star text-yellow-500"/>
              <div class="w-5 h-5 i-con-star text-yellow-500"/>
              <div class="w-5 h-5 i-con-star-outline"/>
              <div class="w-5 h-5 i-con-star-outline"/>
              <div class="w-5 h-5 i-con-star-outline"/>
            </div>
            <h2 class="font-bold text-xl">
              <nuxt-link title="8x8 Coloring" to="/arts/size-8x8">8x8</nuxt-link>
            </h2>
          </div>
          <div class="grid grid-cols-3 gap-2 md:gap-3">
            <coloring-card v-for="item in hs.r1.results" :value="item" :key="item.id" show-author/>
          </div>
        </div>
        <div v-if="hs.r2.count" class="max-w-xl mx-auto my-4 space-y-2">
          <div class="flex gap-2 items-center">
            <div class="flex gap-1">
              <div class="w-5 h-5 i-con-star text-yellow-500"/>
              <div class="w-5 h-5 i-con-star text-yellow-500"/>
              <div class="w-5 h-5 i-con-star-outline"/>
              <div class="w-5 h-5 i-con-star-outline"/>
              <div class="w-5 h-5 i-con-star-outline"/>
            </div>
            <h2 class="font-bold text-xl">
              <nuxt-link to="/arts/size-16x16">16x16</nuxt-link>
            </h2>
          </div>
          <div class="grid grid-cols-3 gap-2 md:gap-3">
            <coloring-card v-for="item in hs.r2.results" :value="item" :key="item.id" show-author/>
          </div>
        </div>
        <div v-if="hs.r3.count" class="max-w-xl mx-auto my-4 space-y-2">
          <div class="flex gap-2 items-center">
            <div class="flex gap-1">
              <div class="w-5 h-5 i-con-star text-yellow-500"/>
              <div class="w-5 h-5 i-con-star text-yellow-500"/>
              <div class="w-5 h-5 i-con-star-outline"/>
              <div class="w-5 h-5 i-con-star-outline"/>
              <div class="w-5 h-5 i-con-star-outline"/>
            </div>
            <h2 class="font-bold text-xl">
              <nuxt-link title="24x24 Coloring" to="/arts/size-24x24">24x24</nuxt-link>
            </h2>
          </div>
          <div class="grid grid-cols-3 gap-2 md:gap-3">
            <coloring-card v-for="item in hs.r3.results" :value="item" :key="item.id" show-author/>
          </div>
        </div>
        <div v-if="hs.r4.count" class="max-w-xl mx-auto my-4 space-y-2">
          <div class="flex gap-2 items-center">
            <div class="flex gap-1">
              <div class="w-5 h-5 i-con-star text-yellow-500"/>
              <div class="w-5 h-5 i-con-star text-yellow-500"/>
              <div class="w-5 h-5 i-con-star-outline"/>
              <div class="w-5 h-5 i-con-star-outline"/>
              <div class="w-5 h-5 i-con-star-outline"/>
            </div>
            <h2 class="font-bold text-xl">
              <nuxt-link title="32x32 Coloring" to="/arts/size-32x32">32x32</nuxt-link>
            </h2>
          </div>
          <div class="grid grid-cols-3 gap-2 md:gap-3">
            <coloring-card v-for="item in hs.r4.results" :value="item" :key="item.id" show-author/>
          </div>
        </div>
        <div class="grid gap-2 md:grid-cols-2">
          <nuxt-link to="/pages" title="Coloring Pages"
                     class="border p-3 flex justify-between items-center cursor-pointer group">
            <div>
              <div class="text-2xl font-bold group-hover:underline">Coloring Pages</div>
              <p>You might want to try!</p>
            </div>
            <div class="i-con-right w-6 h-6"/>
          </nuxt-link>
          <nuxt-link to="/arts" title="Pixel Art"
                     class="border p-3 flex justify-between items-center cursor-pointer group">
            <div>
              <div class="text-2xl font-bold group-hover:underline">Pixel Art</div>
              <p>Pixel art by community!</p>
            </div>
            <div class="i-con-right w-6 h-6"/>
          </nuxt-link>
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
    </template>
  </div>
</template>
