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
    <div class="mt-4 border-t py-4 -mx-4">
      <div class="md:px-0 px-4 w-full max-w-xl mx-auto flex gap-4">
        <nuxt-link to="/about">About</nuxt-link>
        <p>Copyright © 2023 playcoloring.com.</p>
      </div>
    </div>
  </div>
</template>
