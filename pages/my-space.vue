<script setup lang="ts">
import {ResponseSharedPage} from "~/interface";
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

useSeoMeta({
  title: "My Space",
  description: 'Your area!',
})

useHead({
  meta: [
    {hid: 'robots', name: 'robots', content: 'noindex'}
  ]
})

const {data: response} = await useAuthFetch<ResponseSharedPage>(`/coloring/shared-pages/`, {
  params: {
    page: page,
    page_size: 9,
    user: userStore.logged.username,
    full_schema: true
  },
  watch: [page]
})

function handlePaging(p: number) {
  page.value = p
}

watch(() => userStore.logged, () => {
  page.value = 1
}, {deep: true})
</script>

<template>
  <div>
    <breadcrumb/>
    <div v-if="response" class="max-w-xl mx-auto space-y-4">
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        <coloring-card v-for="item in response.results" :value="item" :key="item.id" is-draw/>
      </div>
      <div class="flex font-semibold">
        <div v-if="response.links.previous" class="btn hover:shadow" @click="handlePaging(page-1)">
          <div class="i-con-left w-6 h-6"/>
          <span>Previous</span>
        </div>
        <div class="flex-1 flex justify-center gap-3">
          <div class="btn hover:shadow">
            <span>Current:</span>
            <span>{{ page }}</span>
            <span>/</span>
            <span>{{ response.num_pages }}</span>
          </div>
        </div>
        <div v-if="response.links.next" class="btn hover:shadow" @click="handlePaging(page+1)">
          <span>Next</span>
          <div class="i-con-right w-6 h-6"/>
        </div>
      </div>
    </div>
  </div>
</template>
