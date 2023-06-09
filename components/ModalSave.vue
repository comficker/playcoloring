<script setup lang="ts">
import {computed, ref} from "vue";
import {SharedPage, Step, Workspace} from "~/interface";
import {useAuthFetch} from "~/composables/useAuthFetch";
import pkg from "lodash";

const {cloneDeep} = pkg
const {workspace} = defineProps<{ workspace: Workspace }>()
const emits = defineEmits(['hide'])
function slugify(text: string) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

const saved = ref<SharedPage | null>(null)
const saving = ref(false)
const form = ref({
  as_template: false,
  tags: [],
  name: null,
  desc: null
} as any)

const isEditor = computed(() => useRoute().name === 'editor')

const onAddTag = (e: KeyboardEvent) => {
  const target = e.target as HTMLTextAreaElement;
  if (!target.value) return;
  const r = form.value.tags.map((x: string) => slugify(x))
  if (!r.includes(slugify(target.value))) {
    form.value.tags.push(target.value)
    target.value = ''
  }
}
const actionSave = async () => {
  const data = {
    ...cloneDeep(form.value),
    ...cloneDeep(workspace),
  }
  if (isEditor.value) {
    delete data.steps
    data.map_numbers = workspace.results
  }
  saving.value = true
  const {data: res} = await useAuthFetch<SharedPage>('/coloring/shared-pages/', {
    method: 'POST',
    body: data
  })
  saved.value = res.value as SharedPage
  saving.value = false
}
</script>

<template>
  <div class="p-4">
    <div v-if="!saved" class="space-y-3">
      <div class="flex justify-between items-center text-xs">
        <div class="text-3xl font-bold">Public your work</div>
        <div class="i-con-minimize w-4 h-4 cursor-pointer" @click="emits('hide')"/>
      </div>
      <div v-if="isEditor" class="flex items-center gap-2">
        <button
          type="button"
          class="bg-gray-200 rounded relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          role="switch" aria-checked="false"
          :class="{'bg-indigo-600': form.as_template}"
          @click="form.as_template = !form.as_template"
        >
          <span
            aria-hidden="true"
            class="translate-x-0 rounded pointer-events-none inline-block h-4 w-4 transform bg-white shadow ring-0 transition duration-200 ease-in-out"
            :class="{'translate-x-4 bg-green-500': form.as_template}"
          />
        </button>
        <span>Share as template</span>
      </div>
      <div>
        <input v-model="form.name" type="text" class="w-full border px-3 py-2 rounded" placeholder="Title">
      </div>
      <div>
        <div class="flex gap-2 flex-wrap items-center border p-2 px-2 text-sm rounded">
          <div
            class="p-0.5 px-3 rounded bg-gray-100 relative group"
            v-for="(item, i) in form.tags" :key="item"
          >
            <span>{{ item }}</span>
            <div
              class="opacity-0 group-hover:opacity-100 duration-300 absolute -top-1 -right-1 cursor-pointer p-0.5 rounded-full bg-red-500"
              @click="form.tags.splice(i, 1)"
            >
              <div class="i-con-close w-3 h-3 text-white"/>
            </div>
          </div>
          <input
            type="text" class="outline-none p-1" placeholder="#"
            @keyup.enter="onAddTag"
          />
        </div>
      </div>
      <div>
        <textarea v-model="form.desc" class="w-full border px-3 py-2 rounded" placeholder="Description"/>
      </div>
      <div class="flex gap-4 text-sm font-semibold">
        <div class="btn px-8 bg-green-500 text-white" @click="actionSave">
          <div class="i-con-download w-5 h-5"/>
          <span>Share</span>
        </div>
        <div class="btn px-8 border" @click="actionSave">
          <span>Save</span>
        </div>
      </div>
    </div>
    <div v-else>
      <p class="text-gray-500">Your work was saved, you can check it
        <nuxt-link class="underline" :to="`/post/${saved.id_string}`">here</nuxt-link>
      </p>
    </div>
  </div>
</template>
