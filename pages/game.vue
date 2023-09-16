<script lang="ts" setup>
import {useSeoMeta} from "nuxt/app";

const title = "Play coloring game online in browser"
const desc = 'Use various coloring tools such as pencils, crayons, or markers to fill the outlined areas with different shades and colors, producing a completed image.'

useHead({
  title: title,
  meta: [
    {
      name: "description",
      content: desc
    }
  ]
})

useSeoMeta({
  title: title,
  description: desc,
  ogDescription: desc,
  ogTitle: title,
  ogImage: '/screenshot/default.png',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <editor/>
</template>
