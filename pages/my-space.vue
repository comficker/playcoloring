<script setup lang="ts">

import Breadcrumb from "~/components/Breadcrumb.vue";
import {computed} from "vue";
import {IBreadcrumb, ResponseSharedPage} from "~/interface";
import {useAuthFetch} from "~/composables/useAuthFetch";
import ColoringCard from "~/components/ColoringCard.vue";
import {useUserStore} from "~/stores/user";
import {useSeoMeta} from "#app";

const crumbs = computed<IBreadcrumb[]>(() => {
  return [
    {
      name: "My space",
      to: `/my-space`,
      icon: undefined
    }
  ]
})

const userStore = useUserStore()
const page = ref(1)

const {data: response} = await useAuthFetch<ResponseSharedPage>(`/coloring/shared-pages/`, {
  params: {
    page: page.value,
    page_size: 32,
    user: userStore.logged.username,
    full_schema: true
  }
})

useSeoMeta({
  title: "My Space",
  description: 'Your area!',
})

useHead({
  meta: [
    { hid: 'robots', name: 'robots', content: 'noindex' }
  ]
})
</script>

<template>
  <div class="py-4 space-y-4">
    <breadcrumb :crumbs="crumbs"/>
    <div v-if="response" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-5">
      <coloring-card v-for="item in response.results" :value="item"/>
    </div>
  </div>
</template>
