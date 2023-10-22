<template>
  <div class="border-emerald-100 border divide-y divide-emerald-100 rounded-[2px] overflow-hidden">
    <div class="pt-full relative bg-white">
      <div class="absolute inset-4 group">
        <img
          v-if="!isDraw"
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
          <nuxt-link
            :to="`/game?id=${value.id_string}`" :title="`Coloring ${value.name}`"
            class="cursor-pointer p-3 py-2 rounded-[2px] bg-yellow-300">
            <div class="text-xs uppercase font-bold">Play</div>
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
const {value, isDraw} = defineProps<{ value: SharedPage, isDraw?: boolean }>()
const config = useRuntimeConfig()

const src = computed(() => {
  return `${config.public.apiBase}/coloring/files/${value.is_template ? '' : 'art-'}thumbnail/${value.id_string}.png`
})
const to = computed(() => {
  return `/${value.is_template ? 'page': 'post'}/${value.id_string}`
})

onMounted(() => {
  if (isDraw) {
    drawThumbnail(value)
  }
})
</script>
