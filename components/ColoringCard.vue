<template>
  <div class="border-emerald-100 group border divide-y divide-emerald-100">
    <div class="pt-full relative bg-white">
      <div class="absolute inset-0 p-3">
        <img :src="src" :alt="item.name" class="group-hover:blur-sm duration-300 w-full h-full"/>
        <div
          class="absolute inset-0 flex items-center justify-center group-hover:opacity-100 opacity-0 duration-300 gap-2">
          <nuxt-link :to="`/shared/${item.id_string}`" class="cursor-pointer p-2 rounded bg-yellow-300">
            <div class="w-4 h-4 i-con-expand"/>
          </nuxt-link>
          <nuxt-link :to="`/?id=${item.id_string}`" class="cursor-pointer p-2 rounded bg-yellow-300">
            <div class="w-4 h-4 i-con-palette"/>
          </nuxt-link>
        </div>
      </div>
    </div>
    <nuxt-link
      :to="`/pages/${item.id_string}`"
      class="block py-1 p-3 text-xs bg-gray-100 uppercase">{{ item.name || item.id_string }}
    </nuxt-link>
  </div>
</template>

<script setup lang="ts">
import {SharedPage} from "~/interface";
import {useRuntimeConfig} from "nuxt/app";
import {onMounted} from "@vue/runtime-core";
import {computed} from "vue";

const props = defineProps(['value'])
const config = useRuntimeConfig()
const item: SharedPage = props.value

const src = computed(() => `${config.public.apiBase}/coloring/files/${item.id_string}.png?type=thumbnail`)
</script>
