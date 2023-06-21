<template>
  <div class="border-emerald-100 border divide-y divide-emerald-100">
    <div class="pt-full relative bg-white">
      <div class="absolute inset-0 p-3 group">
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
            <div class="w-4 h-4 i-con-palette"/>
          </nuxt-link>
        </div>
      </div>
    </div>
    <nuxt-link
      :to="to"
      class="block py-1 p-3 text-xs bg-gray-100 uppercase">{{ value.name || value.id_string }}
    </nuxt-link>
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
  return `/${value.is_template ? 'template': 'shared'}/${value.id_string}`
})
</script>
