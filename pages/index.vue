<script setup lang="ts">
import {ref} from "@vue/reactivity";
import {useSeoMeta, useRuntimeConfig} from "nuxt/app";
import ColoringCard from "~/components/ColoringCard.vue";
import {useHomeStore} from "~/stores/home";

const config = useRuntimeConfig()
const hs = useHomeStore()

const title = "Play Coloring - Online Coloring by Number - Pixel Editor"
const desc = 'Play Coloring was created to provide a Coloring by Number that promotes mindfulness and stress relief in an enjoyable and accessible way.'
const isPWA = computed(() => process.client && window.isPWA)

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
    opened: false,
    title: "Why we love coloring?",
    aws: [
      "It is often used as a relaxation tool and a form of arts therapy, allowing individuals to unwind and express themselves creatively. Coloring has been found to have calming effects, reducing anxiety, and increasing focus and mindfulness.",
      "Additionally, it can develop hand-eye coordination and fine motor skills in children, while building a sense of accomplishment and confidence through the completion of a colorful piece of arts. Whether it's with pencils, markers, or digital tools, coloring is a fun and therapeutic activity that can be enjoyed by people of all ages."
    ]
  },
  {
    opened: false,
    title: "What is coloring?",
    aws: ["Coloring is an activity that involves filling in outlined designs or patterns with colors to create a finished image. This simple yet enjoyable activity is not only for kids, but it has become increasingly popular with adults as well."],
  },
  {
    opened: false,
    title: "How to play coloring?",
    aws: ["Use various coloring tools such as pencils, crayons, or markers to fill the outlined areas with different shades and colors, producing a completed image."]
  }
])
</script>

<template>
  <div class="space-y-6 md:py-6" :class="{'py-4': isPWA}">
    <div class="max-w-xl mx-auto space-y-4">
      <div class="space-y-2 hidden md:block">
        <h1 class="text-5xl font-bold">Play Coloring</h1>
        <p>Play Coloring was created to provide a Coloring by Number that promotes mindfulness and stress relief in an
          enjoyable and accessible way.
          <a href="/about" target="_blank" class="underline">About us!</a></p>
      </div>
      <div class="max-w-xl mx-auto ">
        <user-bar/>
      </div>
      <nuxt-link
        to="/pages" title="Coloring Pages"
        class="md:bg-gray-50 md:border md:p-3 flex justify-between items-center cursor-pointer group rounded-[2px]"
      >
        <div>
          <h2 class="text-2xl font-bold group-hover:underline">Coloring Pages</h2>
          <p>You might want to try!</p>
        </div>
        <div class="i-con-right w-6 h-6"/>
      </nuxt-link>
      <div v-if="hs.r1.count" class="max-w-xl mx-auto my-4 space-y-2">
        <div class="flex gap-2 items-center">
          <div class="flex gap-1">
            <div class="w-5 h-5 i-con-star text-yellow-500"/>
            <div class="w-5 h-5 i-con-star text-yellow-500"/>
            <div class="w-5 h-5 i-con-star-outline"/>
            <div class="w-5 h-5 i-con-star-outline"/>
            <div class="w-5 h-5 i-con-star-outline"/>
          </div>
          <h2 class="font-bold md:text-xl">
            <nuxt-link title="8x8 Coloring" to="/pages/size-8x8">8x8</nuxt-link>
          </h2>
        </div>
        <div class="grid grid-cols-3 gap-3">
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
          <h2 class="font-bold md:text-xl">
            <nuxt-link to="/pages/size-16x16">16x16</nuxt-link>
          </h2>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <coloring-card v-for="item in hs.r2.results" :value="item" :key="item.id" show-author/>
        </div>
      </div>
      <div v-if="hs.r3.count" class="max-w-xl mx-auto my-4 space-y-2">
        <div class="flex gap-2 items-center">
          <div class="flex gap-1">
            <div class="w-5 h-5 i-con-star text-yellow-500"/>
            <div class="w-5 h-5 i-con-star text-yellow-500"/>
            <div class="w-5 h-5 i-con-star text-yellow-500"/>
            <div class="w-5 h-5 i-con-star-outline"/>
            <div class="w-5 h-5 i-con-star-outline"/>
          </div>
          <h2 class="font-bold md:text-xl">
            <nuxt-link title="24x24 Coloring" to="/pages/size-24x24">24x24</nuxt-link>
          </h2>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <coloring-card v-for="item in hs.r3.results" :value="item" :key="item.id" show-author/>
        </div>
      </div>
      <div v-if="hs.r4.count" class="max-w-xl mx-auto my-4 space-y-2">
        <div class="flex gap-2 items-center">
          <div class="flex gap-1">
            <div class="w-5 h-5 i-con-star text-yellow-500"/>
            <div class="w-5 h-5 i-con-star text-yellow-500"/>
            <div class="w-5 h-5 i-con-star text-yellow-500"/>
            <div class="w-5 h-5 i-con-star text-yellow-500"/>
            <div class="w-5 h-5 i-con-star-outline"/>
          </div>
          <h2 class="font-bold md:text-xl">
            <nuxt-link title="32x32 Coloring" to="/pages/size-32x32">32x32</nuxt-link>
          </h2>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <coloring-card v-for="item in hs.r4.results" :value="item" :key="item.id" show-author/>
        </div>
      </div>

    </div>
    <div v-if="!isPWA" class="max-w-xl mx-auto space-y-4">
      <h2 class="text-5xl font-bold">FAQ</h2>
      <div v-for="(faq, i) in faqs" :key="i" class="space-y-1">
        <h3 class="cursor-pointer flex gap-1 items-center font-semibold text-2xl" @click="faq.opened = !faq.opened">
          <span>{{ faq.title }}</span>
        </h3>
        <div v-show="faq.opened" class="space-y-2">
          <p v-for="aw in faq.aws">{{ aw }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
