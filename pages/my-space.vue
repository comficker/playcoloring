<script setup lang="ts">
import {ResponseSharedPage} from "~/interface";
import {useAuthFetch} from "~/composables/useAuthFetch";
import ColoringCard from "~/components/ColoringCard.vue";
import {useUserStore} from "~/stores/user";
import {useSeoMeta} from "#app";
import Breadcrumb from "~/components/Breadcrumb.vue";

const userStore = useUserStore()
userStore.setBC([
  {
    name: "My space",
    to: `/my-space`,
    icon: undefined
  }
])
const page = ref(1)

const response = ref<ResponseSharedPage | null >(null)
useSeoMeta({
  title: "My Space",
  description: 'Your area!',
})

useHead({
  meta: [
    {hid: 'robots', name: 'robots', content: 'noindex'}
  ]
})

onMounted(() => {
  useAuthFetch<ResponseSharedPage>(`/coloring/shared-pages/`, {
    params: {
      page: page.value,
      page_size: 32,
      user: userStore.logged.username,
      full_schema: true
    }
  }).then(r => {
    response.value = r.data.value
  })
})
</script>

<template>
  <breadcrumb/>
  <div class="max-w-xl mx-auto space-y-4">
    <div v-if="response" class="grid grid-cols-2 md:grid-cols-3 gap-3">
      <coloring-card v-for="item in response.results" :value="item"/>
    </div>
  </div>
</template>
