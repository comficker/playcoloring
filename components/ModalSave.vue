<script setup lang="ts">
import {ref} from "vue";
import {SaveForm, SharedPage} from "~/interface";
import {useRuntimeConfig} from "#app";

const {workspace} = defineProps<{ workspace: SharedPage }>()
const emits = defineEmits(['hide', 'change'])
const config = useRuntimeConfig()
const networks = ["facebook", "twitter", "telegram", "pinterest"]
const cursor = ref<string | null>(null)

const meta = computed(() => {
  const defaultDesc = ''
  const url = `https://www.playcoloring.com/post/${workspace.id_string}`
  let src = `${config.public.apiBase}/coloring/files/${workspace.id_string}.png`
  if (workspace) {
    return {
      url: url,
      title: `${workspace.name || workspace.id_string}`,
      desc: workspace.desc || defaultDesc,
      imgSrc: src
    }
  } else {
    return {
      url: url,
      title: 'Untitled',
      desc: defaultDesc,
      imgSrc: '/screenshot/default.png'
    }
  }
})

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


function copy() {

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
      <div class="btn hover:shadow rounded" @click="emits('hide')">
        <div class="i-con-close w-4 h-4 cursor-pointer"/>
      </div>
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
      <template v-if="!cursor">
        <div class="menu-item justify-between" @click="cursor = 'privacy'">
          <span>Privacy</span>
          <div class="w-4 h-4 i-con-arrow-right"/>
        </div>
        <div class="menu-item justify-between" @click="cursor = 'share'">
          <span>Share on social</span>
          <div class="w-4 h-4 i-con-arrow-right"/>
        </div>
        <div class="menu-item justify-between" @click="cursor = 'download'">
          <span>Download</span>
          <div class="w-4 h-4 i-con-arrow-right"/>
        </div>
      </template>
      <div v-else class="menu-item" @click="cursor = null">
        <div class="w-4 h-4 i-con-arrow-left"/>
        <span class="capitalize">{{ cursor }}</span>
      </div>
      <template v-if="cursor === 'privacy'">
        <div></div>
      </template>
      <template v-if="cursor === 'share'">
        <div class="grid grid-cols-4 gap-4 capitalize">
          <client-only>
            <ShareNetwork
              v-for="item in networks"
              :key="item"
              :network="item"
              :url="meta.url"
              :title="`${meta.title} - Pixel Coloring - Coloring by Number - playcoloring.com`"
              :description="meta.desc"
              :quote="meta.desc"
              :hashtags="workspace.taxonomies.map(x => x.title).join(',')"
              :media="meta.imgSrc"
              class="p-6 hover:bg-gray-50 space-y-4 rounded"
            >
              <div class="w-8 h-8 mx-auto" :class="`i-con-${item}`"/>
              <div>{{ item }}</div>
            </ShareNetwork>
          </client-only>
        </div>
        <div class="relative overflow-auto no-scrollbar">
          <blockquote class="p-4 py-2 border rounded shadow-inner">{{ meta.url }}</blockquote>
          <div class="absolute right-0 top-0 bottom-0 cursor-pointer p-4" @click="copy">
            <div class="i-con-copy w-4 h-4"></div>
          </div>
        </div>
      </template>
      <template v-if="cursor === 'download'">
        <div></div>
      </template>
    </div>
  </div>
</template>
