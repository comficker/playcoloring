<script setup lang="ts">
import {ResponseSharedPage} from "~/interface";
import ColoringCard from "~/components/ColoringCard.vue";
import {useUserStore} from "~/stores/user";
import {useSeoMeta} from "#app";
import Breadcrumb from "~/components/Breadcrumb.vue";
const {$touch} = useNuxtApp()
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
  fetch()
})

const fetch = function () {
  $touch(`/coloring/shared-pages/`, {
    params: {
      page: page.value,
      page_size: 32,
      user: userStore.logged.username,
      full_schema: true
    }
  }).then(r => {
    response.value = r
  })
}

function handlePaging(p: number) {
  page.value = p
  fetch()
}

watch(() => userStore.logged, () => {
  page.value = 1
  fetch()
}, {deep: true})
</script>

<template>
  <div>
    <breadcrumb/>
    <div v-if="response" class="max-w-xl mx-auto space-y-4">
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        <coloring-card v-for="item in response.results" :value="item"/>
      </div>
      <div class="flex font-semibold">
        <div v-if="response.links.previous" class="btn hover:shadow" @click="handlePaging(page--)">
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
        <div v-if="response.links.next" class="btn hover:shadow" @click="handlePaging(page++)">
          <span>Next</span>
          <div class="i-con-right w-6 h-6"/>
        </div>
      </div>
    </div>
  </div>
</template>
