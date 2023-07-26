<script setup lang="ts">
import {ref} from "vue";
import {SaveForm, SharedPage} from "~/interface";

const {workspace} = defineProps<{ workspace: SharedPage }>()
const emits = defineEmits(['hide', 'change'])

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

const form = ref<SaveForm>({
  is_template: workspace.is_template,
  tags: workspace.tags || [],
  name: workspace.name || `Untitled #${workspace.id}`,
  desc: workspace.desc
})

const onAddTag = (e: KeyboardEvent) => {
  const target = e.target as HTMLTextAreaElement;
  if (!target.value) return;
  const r = form.value.tags.map((x: string) => slugify(x))
  if (!r.includes(slugify(target.value))) {
    form.value.tags.push(target.value)
    target.value = ''
  }
}

watch(form, () => {
  emits('change', form.value)
}, {deep: true})
</script>

<template>
  <div class="divide-y">
    <div class="p-4 py-2 flex justify-between items-center">
      <div class="flex gap-2 items-end">
        <div class="font-semibold text-xl">Public your work</div>
        <span class="italic text-xs">Automatic save enabled</span>
      </div>
      <div class="i-con-minimize w-4 h-4 cursor-pointer" @click="emits('hide')"/>
    </div>
    <div class="p-4 py-2 space-y-3">
      <div>
        <input v-model="form.name" type="text" class="w-full outline-none" placeholder="Title">
      </div>
      <div>
        <textarea v-model="form.desc" class="w-full outline-none" placeholder="Description"/>
      </div>
      <div class="flex gap-2 flex-wrap items-center">
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
          type="text" class="outline-none" placeholder="Add tag"
          @keyup.enter="onAddTag"
        />
      </div>
    </div>
    <div class="p-2">
      <div class="p-2 flex justify-between items-center cursor-pointer hover:bg-gray-50 duration-200 rounded">
        <span>Privacy</span>
        <div class="w-4 h-4 i-con-right"/>
      </div>
      <div class="p-2 flex justify-between items-center cursor-pointer hover:bg-gray-50 duration-200 rounded">
        <span>Share on social</span>
        <div class="w-4 h-4 i-con-right"/>
      </div>
      <div class="p-2 flex justify-between items-center cursor-pointer hover:bg-gray-50 duration-200 rounded">
        <span>Download</span>
        <div class="w-4 h-4 i-con-right"/>
      </div>
    </div>
  </div>
</template>
