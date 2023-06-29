<template>
  <div class="border-emerald-100 border divide-y divide-emerald-100 rounded-lg overflow-hidden">
    <div class="pt-full relative bg-white">
      <div class="absolute inset-4 group">
        <img :src="src" :alt="value.name" class="group-hover:blur-sm duration-300 w-full h-full"/>
        <div
          class="absolute inset-0 flex items-center justify-center group-hover:opacity-100 opacity-0 duration-300 gap-2">
          <div
            class="cursor-pointer p-2 rounded bg-yellow-300"
            @click="useRouter().replace(to)"
          >
            <div class="w-4 h-4 i-con-expand"/>
          </div>
          <nuxt-link :to="`/?id=${value.id_string}`" class="cursor-pointer p-2 rounded bg-yellow-300">
            <div class="w-4 h-4 i-con-color"/>
          </nuxt-link>
        </div>
      </div>
    </div>
    <div class="space-y-2 py-2 p-3 bg-gray-50 text-xs">
      <div class="flex gap-1 items-center">
        <div class="i-con-picture w-4 h-4"></div>
        <nuxt-link
          :to="to"
          class="font-semibold hover:underline uppercase">{{ value.name || value.id_string }}
        </nuxt-link>
      </div>
      <div class="flex gap-1 items-center">
        <div class="i-con-user w-4 h-4"></div>
        <nuxt-link
          :to="`/${value.is_template ? 'pages': 'arts'}/author-anonymous`"
          class="font-semibold hover:underline">
          <span>Anonymous</span>
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {SharedPage} from "~/interface";
import {useRuntimeConfig} from "nuxt/app";
import {onMounted} from "@vue/runtime-core";
import {computed} from "vue";

const {value} = defineProps<{value: SharedPage}>()
const config = useRuntimeConfig()

const src = computed(() => `${config.public.apiBase}/coloring/files/${value.id_string}.png?type=thumbnail`)
const to = computed(() => {
  return `/post/${value.id_string}`
})
</script>
