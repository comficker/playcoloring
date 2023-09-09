<template>
  <div class="border-emerald-100 border divide-y divide-emerald-100 rounded-md overflow-hidden">
    <div class="pt-full relative bg-white">
      <div class="absolute inset-4 group">
        <img
          v-if="value.status == 'public' || !value.status"
          :src="src" :alt="value.name"
          class="group-hover:blur-sm duration-300 w-full h-full"
        />
        <canvas
          v-else
          :id="`canvas_${value.id}`"
          class="group-hover:blur-sm duration-300 w-full h-full"
          width="200"
          height="200"
        />
        <div
          class="absolute inset-0 flex items-center justify-center group-hover:opacity-100 opacity-0 duration-300 gap-2">
          <div
            class="cursor-pointer p-2 rounded bg-yellow-300"
            @click="useRouter().replace(to)"
          >
            <div class="w-4 h-4 i-con-expand"/>
          </div>
          <nuxt-link :to="`/?id=${value.id_string}`" :title="`Coloring ${value.name}`" class="cursor-pointer p-2 rounded bg-yellow-300">
            <div class="w-4 h-4 i-con-color"/>
          </nuxt-link>
        </div>
      </div>
    </div>
    <div class="space-y-2 py-2 p-3 bg-gray-50">
      <div class="flex gap-1 items-center">
        <div class="i-con-picture w-4 h-4"></div>
        <nuxt-link
          :to="to"
          :title="value.name"
          class="font-semibold hover:underline whitespace-nowrap truncate">{{ value.name || value.id_string }}
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {SharedPage} from "~/interface";
import {useRuntimeConfig} from "nuxt/app";
import {drawThumbnail} from "~/helper/canvas";
import {computed} from "vue";

const route = useRoute()
const {value, showAuthor} = defineProps<{value: SharedPage, showAuthor?: boolean}>()
const config = useRuntimeConfig()

const src = computed(() => {
  return `${config.public.apiBase}/coloring/files/${value.id_string}.png?type=thumbnail`
})
const to = computed(() => {
  if (route.fullPath !== '/my-space') {
    return `/post/${value.id_string}`
  } else {
    const p = value.is_template ? 'editor' : ''
    return `/${p}?id=${value.id_string}`
  }
})

onMounted(() => {
  if (!(value.status == 'public' || !value.status)) {
    drawThumbnail(value)
  }
})
</script>
