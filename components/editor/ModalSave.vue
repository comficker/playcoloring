<script setup lang="ts">
import {ref} from "vue";
import {SaveForm} from "~/interface";
import {useRuntimeConfig} from "#app";
import {useEditor} from "~/stores/editor";

const editorStore = useEditor()
const config = useRuntimeConfig()
const networks = ["facebook", "twitter", "telegram", "pinterest"]
const cursor = ref<string | null>(null)
const privacy = [
  {
    id: 'draft',
    title: "Only Me"
  },
  {
    id: 'public',
    title: "Public on web"
  }
]
const meta = computed(() => {
  const defaultDesc = ''
  const url = `https://www.playcoloring.com/post/${editorStore.workspace.id_string}`
  let src = `${config.public.apiBase}/coloring/files/${editorStore.workspace.id_string}.png`
  if (editorStore.workspace) {
    return {
      url: url,
      title: `${editorStore.workspace.name || editorStore.workspace.id_string}`,
      desc: editorStore.workspace.desc || defaultDesc,
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
  is_template: editorStore.workspace.is_template,
  tags: editorStore.workspace.tags || [],
  name: editorStore.workspace.name || `${editorStore.workspace.is_template ? 'Page' : 'Art'} #${editorStore.workspace.id}`,
  desc: editorStore.workspace.desc,
  status: 'draft',
  new_id_string: editorStore.workspace.id_string || slugify(`${editorStore.workspace.is_template ? 'Page' : 'Art'} #${editorStore.workspace.id}`)
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
  editorStore.updateWorkspace(form.value)
}, {deep: true})

watch(() => editorStore.drawSignal, () => {
  const name = editorStore.workspace.name || `${editorStore.workspace.is_template ? 'Page' : 'Art'} #${editorStore.workspace.id}`
  form.value = {
    is_template: editorStore.workspace.is_template,
    tags: editorStore.workspace.tags || [],
    name: name,
    desc: editorStore.workspace.desc,
    status: 'draft',
    new_id_string: editorStore.workspace.id_string || slugify(name)
  }
})
</script>

<template>
  <div class="divide-y">
    <div class="p-4 py-2 flex justify-between items-center">
      <div class="flex gap-2 items-end">
        <div class="font-semibold text-xl">Public your work</div>
        <span class="italic text-xs">Automatic save enabled</span>
      </div>
      <div class="btn hover:shadow rounded" @click="editorStore.toggleModal('')">
        <div class="i-con-close w-4 h-4 cursor-pointer"/>
      </div>
    </div>
    <div class="p-4 py-2 space-y-3">
      <div>
        <div class="text-xs text-gray-500">Title</div>
        <input v-model="form.name" type="text" class="w-full outline-none" placeholder="Title">
      </div>
      <div>
        <div class="text-xs text-gray-500">Description</div>
        <textarea v-model="form.desc" class="w-full outline-none" placeholder="Description"/>
      </div>
      <div>
        <div class="text-xs text-gray-500">Permalink</div>
        <input v-model="form.new_id_string" type="text" class="w-full outline-none" placeholder="Permalink">
      </div>
      <div>
        <div class="text-xs text-gray-500">Tag</div>
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
        <span class="capitalize">Back</span>
      </div>
      <template v-if="cursor === 'privacy'">
        <div class="p-2 font-bold flex gap-2 items-center">
          <div class="w-4 h-4 i-con-eye"/>
          <span>View</span>
        </div>
        <div
          v-for="item in privacy"
          class="p-2 flex hover:bg-gray-50 flex items-center gap-2"
        >
          <input
            v-model="form.status"
            :id="item.id" type="radio" :value="item.id"
            class="duration-200 w-4 h-4 bg-gray-100 border-gray-300"
          >
          <label :for="item.id" class="flex-1 font-light text-gray-900">{{ item.title }}</label>
        </div>
        <div class="p-2 font-bold flex gap-2 items-center">
          <div class="w-4 h-4 i-con-download"/>
          <span>Download</span>
        </div>
        <div class="p-2 font-bold flex gap-2 items-center">
          <div class="w-4 h-4 i-con-license"/>
          <span>License</span>
        </div>
        <input class="p-2 border shadow-inner w-full rounded" type="text" placeholder="Free to use">
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
              :hashtags="editorStore.workspace.taxonomies.map(x => x.title).join(',')"
              :media="meta.imgSrc"
              class="p-4 hover:bg-gray-50 space-y-4 rounded text-center"
            >
              <div class="w-8 h-8 mx-auto" :class="`i-con-${item}`"/>
              <div>{{ item }}</div>
            </ShareNetwork>
          </client-only>
        </div>
        <div class="relative overflow-auto no-scrollbar mt-4">
          <blockquote class="p-4 py-2 border rounded shadow-inner">{{ meta.url }}</blockquote>
          <div class="absolute right-2 top-2 bottom-2 rounded cursor-pointer p-2 bg-white" @click="copy">
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
