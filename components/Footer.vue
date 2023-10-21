<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  data() {
    return {

    }
  },
})
</script>

<template>
  <div class="mt-auto">
    <div class="mt-4 border-t py-3 font-semibold -mx-4 text-sm bg-gray-50">
      <div class="md:px-0 px-4 w-full max-w-xl mx-auto flex gap-4">
        <p class="mr-auto">Copyright © 2023 playcoloring.com.</p>
        <nuxt-link to="/about">About</nuxt-link>
        <a href="/sitemap-index.xml" target="_blank">Sitemap</a>
      </div>
    </div>
  </div>
</template>
