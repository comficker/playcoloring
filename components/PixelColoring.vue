<template>
  <div class="max-w-lg mx-auto flex md:flex-row flex-col gap-2">
    <div class="flex-1 bg-white">
      <div
        class="relative pt-full overflow-hidden"
        :style="{'--zoom-size': `${cellScaleSize}px ${cellScaleSize}px`}">
        <div
          class="absolute inset-0 border-t border-l border-[#F0F0F0]"
          :class="{'cursor-move': holdDetector.isHold || holdDetector.isFoldHold}"
        >
          <div
            id="workload" class="absolute"
            :style="{
              width: `${PICTURE_SIZE.w}px`,
              height: `${PICTURE_SIZE.h}px`
            }"
          >
            <canvas
              id="background" :width="PICTURE_SIZE.w" :height="PICTURE_SIZE.h"
            >An alternative text describing what your canvas displays.
            </canvas>
            <canvas
              id="workspace" :width="PICTURE_SIZE.w" :height="PICTURE_SIZE.h"
              class="absolute inset-0"
            >An alternative text describing what your canvas displays.
            </canvas>
            <div
              v-show="!(holdDetector.isHold || holdDetector.isFoldHold)"
              id="cursor" class="absolute"
              :style="{
                backgroundColor: options.color,
                width: `${cellScaleSize}px`,
                height: `${cellScaleSize}px`
              }"
            />
            <div
              class="absolute z-50 inset-0"
              @mousedown="handleMouseDown"
              @mouseup="handleMouseUp"
              @mousemove="handleMouseHover"
              @mouseover="handleMouseUp"
            ></div>
          </div>
        </div>
        <Transition
          enter-active-class="animated animated-faster animate-fade-in-up"
          leave-active-class="animated animated-faster animate-fade-out-down"
        >
          <div
            v-if="showModal"
            class="absolute bottom-0 left-6 right-6 bg-white z-60 shadow-xl rounded-tl-xl rounded-tr-xl border"
          >
            <div v-if="showModal === 'loadFile'" class="p-4">
              <div class="w-full btn bg-white h-full border text-xs">
                <input
                  id="inputFile" type="file" class="w-full" placeholder="Load"
                  @input="loadFile"
                >
              </div>
            </div>
            <div v-if="showModal === 'saving'" class="p-4">
              <div v-if="!saved" class="">
                <div class="flex justify-between items-center text-xs">
                  <div class="uppercase font-bold">Share your work</div>
                  <div v-if="!layers.background.id" class="flex items-center gap-2">
                    <span>Only template</span>
                    <button
                      type="button"
                      class="bg-gray-200 relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                      role="switch" aria-checked="false"
                      :class="{'bg-indigo-600': form.only_template}"
                      @click="form.only_template = !form.only_template"
                    >
                      <span class="sr-only">Use setting</span>
                      <span
                        aria-hidden="true"
                        class="translate-x-0 pointer-events-none inline-block h-4 w-4 transform bg-white shadow ring-0 transition duration-200 ease-in-out"
                        :class="{
                      'translate-x-4 bg-green-500': form.only_template
                    }"
                      />
                    </button>
                  </div>
                </div>
                <div class="mt-2">
                  <input v-model="form.name" type="text" class="w-full border px-3 py-1" placeholder="Title">
                </div>
                <div class="mt-2">
                  <div class="flex gap-2 flex-wrap items-center border p-1 px-2 text-sm">
                    <div
                      class="p-0.5 px-3 rounded bg-gray-100 relative group"
                      v-for="item in form.tags" :key="item"
                    >
                      <span>{{ item }}</span>
                      <div
                        class="opacity-0 group-hover:opacity-100 duration-300 absolute -top-1 -right-1 cursor-pointer p-0.5 rounded-full bg-red-500">
                        <div class="i-con-close w-3 h-3 text-white"/>
                      </div>
                    </div>
                    <input
                      type="text" class="outline-none p-1" placeholder="#"
                      @keyup.enter="onAddTag"
                    />
                  </div>
                </div>
                <div class="mb-1 mt-2">
                  <textarea v-model="form.desc" class="w-full border px-3 py-1" placeholder="Description"/>
                </div>
                <div>
                  <div class="btn bg-green-500 text-white" @click="actionSave">
                    <div class="i-con-download w-5 h-5"/>
                    <span>Submit</span>
                  </div>
                </div>
              </div>
              <div v-else>
                <p class="text-gray-500">Your work was saved, you can check it
                  <nuxt-link class="underline" :to="`/pages/${saved.id_string}`">here</nuxt-link>
                </p>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
    <div class="flex md:flex-col gap-4 justify-between md:-mr-8">
      <div class="flex md:flex-col md:w-6">
        <div
          v-for="(c, i) in colors.slice(0, 6)" :key="c"
          class="cursor-pointer"
          :class="{'border-[#776e65]': c === options.color}"
          @click="onClickColor(c)"
        >
          <div class="w-6 h-6 text-center text-white text-xs leading-6" :style="{backgroundColor: c}">
            <div class="invert" :style="{'color': c}">{{ i }}</div>
          </div>
        </div>
        <div class="cursor-pointer p-1 w-6 h-6 bg-white" ref="moreColor">
          <div class="i-con-more w-4 h-4"/>
        </div>
        <div class="cursor-pointer p-1 w-6 h-6 bg-white" @click="onClickColor(null)">
          <div class="i-con-eraser w-4 h-4"/>
        </div>
      </div>
      <div class="flex md:flex-col md:w-6 gap-1">
        <div
          class="cursor-pointer p-1.5 w-6 h-6 border"
          :class="{'bg-white': !holdDetector.isFoldHold}"
          @click="holdDetector.isFoldHold = !holdDetector.isFoldHold"
        >
          <div class="i-con-move w-3 h-3"/>
        </div>
        <div class="cursor-pointer p-1.5 w-6 h-6 bg-white border" @click="handleZoom(true)">
          <div class="i-con-plus w-3 h-3"/>
        </div>
        <div class="cursor-pointer p-1 w-6 h-6 bg-white border" @click="handleZoom(false)">
          <div class="i-con-minus w-4 h-4"/>
        </div>
      </div>
    </div>
  </div>
  <div class="max-w-lg mx-auto flex gap-4 mt-4 justify-between">
    <div class="flex flex-col md:flex-row gap-4 w-full">
      <div class="btn bg-rose-700 text-white">
        <div class="i-con-plus w-3 h-3"/>
        <span>New</span>
      </div>
      <div class="md:block hidden">
        <div class="btn bg-white border" @click="toggleModal(showModal === 'loadFile' ? null : 'loadFile')">
          <span v-if="showModal === 'loadFile'">Done</span>
          <span v-else>Load</span>
        </div>
      </div>
    </div>
    <div class="flex gap-4">
      <div class="btn bg-white border" @click="toggleModal(showModal === 'saving' ? null : 'saving')">
        <div class="i-con-save w-5 h-5"/>
        <span>Save</span>
      </div>
      <div class="btn bg-green-500 text-white" @click="actionDownload">
        <div class="i-con-download w-5 h-5"/>
        <span>Download</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTippy } from 'vue-tippy'
import {onMounted, watch} from "@vue/runtime-core";
import {computed, ref} from "vue";
import {cloneDeep} from "lodash"
import {useAuthFetch} from "~/composables/useAuthFetch";
import {onBeforeRouteUpdate, useRoute} from "#app";
import {SharedPage} from "~/interface";
import ColorPalette from "~/components/ColorPalette.vue"
//STATE
const route = useRoute()
const CELL_LENGTH = ref({
  w: 32,
  h: 32
})
const zoom = ref(4)
const PICTURE_SIZE = computed(() => ({
  w: CELL_LENGTH.value.w * Math.pow(2, zoom.value),
  h: CELL_LENGTH.value.h * Math.pow(2, zoom.value)
}))
const colors = ref([
  "#FFF2CC",
  "#FFD966",
  "#F4B183",
  "#DFA67B",
  "#245953",
  "#408E91",
  "#B46060",
])
const slugify = (text: string) =>
  text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')

const layers: any = ref({
  background: {
    id: 0,
    colors: [],
    map_numbers: {}
  },
  workspace: {
    id: 0,
    colors: [],
    map_numbers: {}
  }
})

const options = ref({
  color: '#005E7A',
})
const isPainting = ref(false)
const showModal: any = ref(null)
const holdDetector = ref({
  x: 0,
  y: 0,
  isHold: false,
  isFoldHold: false,
  isMoving: true
})
const translate = ref({x: 0, y: 0})
const form = ref({
  only_template: false,
  tags: [],
  name: null,
  desc: null
} as any)
const cellScaleSize = computed(() => {
  return Math.pow(2, zoom.value)
})
const saved = ref<SharedPage | null>(null)
const saving = ref(false)
const isMoving = computed(() => holdDetector.value.isHold || (holdDetector.value.isFoldHold && isPainting.value))

const moreColor = ref()

// HELPER
const makeChunk = (array: any[], chunkSize = 4) => {
  const out = []
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    out.push(chunk)
  }
  return out
}

const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

// METHOD
const getCtx = (id: string): CanvasRenderingContext2D | null => {
  const canvas = document.getElementById(id) as HTMLCanvasElement
  return canvas?.getContext('2d', {
    willReadFrequently: true
  })
}

const handleMouseDown = (e: PointerEvent) => {
  holdDetector.value.x = e.offsetX
  holdDetector.value.y = e.offsetY
  holdDetector.value.isMoving = false
  setTimeout(function () {
    if (!holdDetector.value.isMoving) {
      holdDetector.value.isHold = true
    }
  }, 1000);
  isPainting.value = true
  if (!holdDetector.value.isFoldHold) {
    fillColor(e)
  }
}

const handleMouseUp = () => {
  holdDetector.value.isMoving = true
  holdDetector.value.isHold = false
  isPainting.value = false
}

const handleMouseHover = (e: PointerEvent) => {
  const cs = cellScaleSize.value
  if (isMoving.value) {
    const nX = e.offsetX - holdDetector.value.x
    const nY = e.offsetY - holdDetector.value.y
    const x = translate.value.x + Math.round(nX / cs) * cs
    const y = translate.value.y + Math.round(nY / cs) * cs
    holdDetector.value.x = holdDetector.value.x + Math.round(nX / cs) * cs
    holdDetector.value.y = holdDetector.value.y + Math.round(nY / cs) * cs
    translate.value.x = x
    translate.value.y = y
    draw('background')
    draw('workspace', true)
  } else {
    holdDetector.value.isMoving = true
    holdDetector.value.isHold = false
    const cursor: HTMLElement | null = document.getElementById('cursor');
    if (!isPainting.value) {
      if (cursor) {
        cursor.style.left = `${e.offsetX - 1 - e.offsetX % (cs)}px`
        cursor.style.top = `${e.offsetY - 1 - e.offsetY % (cs)}px`
      }
    } else {
      fillColor(e)
    }
  }
}

const handleZoom = (isPlus = true) => {
  if (isPlus && zoom.value < 6) {
    zoom.value++
  } else if (!isPlus && zoom.value > 4) {
    zoom.value--
  }
  translate.value.x = translate.value.x + translate.value.x % (Math.pow(2, zoom.value))
  translate.value.y = translate.value.y + translate.value.y % (Math.pow(2, zoom.value))
}

const onClickColor = (color: string) => {
  holdDetector.value.isFoldHold = false
  options.value.color = color
}

const onAddTag = (e: KeyboardEvent) => {
  const target = e.target as HTMLTextAreaElement;
  if (!target.value) return;
  const r = form.value.tags.map((x: string) => slugify(x))
  if (!r.includes(slugify(target.value))) {
    form.value.tags.push(target.value)
    target.value = ''
  }
}

const onInput = (e: KeyboardEvent) => {
  console.log(e);
}

const fillColor = (e: PointerEvent) => {
  const ctx = getCtx('workspace')
  if (ctx) {
    const x = e.offsetX - e.offsetX % cellScaleSize.value
    const y = e.offsetY - e.offsetY % cellScaleSize.value
    const key = `${x / Math.pow(2, zoom.value)}-${y / Math.pow(2, zoom.value)}`
    const temp = layers.value['workspace'].map_numbers
    const colors = layers.value['workspace'].colors
    if (options.value.color) {
      if (!colors.includes(options.value.color)) {
        colors.push(options.value.color)
      }
      temp[key] = colors.indexOf(options.value.color)
      ctx.fillStyle = options.value.color;
      ctx.fillRect(x, y, cellScaleSize.value, cellScaleSize.value);
    } else {
      ctx.clearRect(x, y, cellScaleSize.value, cellScaleSize.value);
      delete temp[key]
    }
    layers.value['workspace'].map_numbers = {}
    layers.value['workspace'].map_numbers = temp
    layers.value['workspace'].colors = []
    layers.value['workspace'].colors = colors
    console.log(layers.value['workspace'].colors);
  }
}

const draw = (layerId: string, fillColor = false) => {
  const ctx = getCtx(layerId)
  if (!ctx) return;
  ctx.clearRect(
    0, 0,
    PICTURE_SIZE.value.w,
    PICTURE_SIZE.value.h
  )
  ctx.save()
  ctx.translate(translate.value.x, translate.value.y);
  ctx.scale(Math.pow(2, zoom.value), Math.pow(2, zoom.value))
  const colors: any = layers.value[layerId].colors
  for (let x = 0; x < CELL_LENGTH.value.w; x++) {
    for (let y = 0; y < CELL_LENGTH.value.h; y++) {
      const index = `${x}-${y}`
      if (layers.value[layerId].map_numbers[index] >= 0) {
        if (fillColor) {
          ctx.fillStyle = colors[layers.value[layerId].map_numbers[index]]
          ctx.fillRect(x, y, 1, 1);
        } else {
          ctx.font = `0.35px Proto Mono`
          ctx.fillStyle = '#776e65'
          ctx.textBaseline = 'middle'
          ctx.textAlign = 'center'
          ctx.fillText(
            layers.value[layerId].map_numbers[index],
            (x + 0.5),
            (y + 0.5),
            1
          );
        }
      } else {
        ctx.clearRect(x, y, 1, 1);
      }
    }
  }
  ctx.restore()
}

const loadFile = () => {
  const layerId = 'background'
  const fileElm: HTMLInputElement | null = document.getElementById("inputFile") as HTMLInputElement
  const ctx = getCtx(layerId)
  if (fileElm && ctx) {
    const img = new Image;
    img.onload = function () {
      ctx?.drawImage(img, 0, 0)
      layers.value[layerId].colors = []
      layers.value[layerId].map_numbers = {}
      layers.value[layerId].id = 0
      CELL_LENGTH.value.w = img.width
      CELL_LENGTH.value.h = img.height
      zoom.value = Math.log(512 / img.width) / Math.log(2);
      for (let x = 0; x < img.width; x++) {
        for (let y = 0; y < img.height; y++) {
          const pixelData: any = ctx?.getImageData(x, y, 1, 1);
          const color = rgbToHex(pixelData.data[0], pixelData.data[1], pixelData.data[2])
          console.log(pixelData.data[3], color);
          if (!(color === '#000000' && pixelData.data[3] === 0)) {
            if (!layers.value[layerId].colors.includes(color)) {
              layers.value[layerId].colors.push(color)
            }
            layers.value[layerId].map_numbers[`${x}-${y}`] = layers.value[layerId].colors.indexOf(color)
          }
        }
      }
      colors.value = layers.value.background.colors
      draw(layerId)
      resetWorkspace()
      showModal.value = null
    }
    const files = fileElm.files
    if (files && files[0]) {
      const reader = new FileReader
      reader.onload = (e: any) => {
        img.src = e?.target?.result
      }
      reader.readAsDataURL(files[0])
    }
  }
}

const loadSharedPage = async (id: string) => {
  const {data} = await useAuthFetch(`/coloring/shared-pages/${id}/`).then(async res => {
    if (res.pending.value) {
      await res.execute()
    }
    return res
  })
  if (!data.value) return
  const value = data.value as SharedPage
  CELL_LENGTH.value.w = value.width
  CELL_LENGTH.value.h = value.height
  zoom.value = Math.log(512 / value.width) / Math.log(2);
  layers.value.background = data.value as SharedPage
  draw('background')
  colors.value = layers.value.background.colors
  document.body.scrollTop = document.documentElement.scrollTop = 0;
  resetWorkspace()
}

const resetWorkspace = () => {
  layers.value.workspace.colors = []
  layers.value.workspace.map_numbers = {}
  draw('workspace', true)
}

const toggleModal = (type: string | null) => {
  saved.value = null
  showModal.value = type
}

const actionDownload = () => {
}

const actionSave = () => {
  let template = cloneDeep(layers.value.background)
  if (!template.colors.length) {
    template = cloneDeep(layers.value.workspace)
  }
  const data = {
    ...cloneDeep(form.value),
    ...cloneDeep(layers.value.workspace),
    width: CELL_LENGTH.value.w,
    height: CELL_LENGTH.value.h
  }
  if (template.id) {
    data.template = template.id
  } else {
    data.template_raw = template
  }
  saving.value = true
  useAuthFetch('/coloring/shared-pages/', {
    method: 'POST',
    body: data
  }).then(({data}) => {
    saved.value = data.value as unknown as SharedPage
  }).finally(() => {
    saving.value = false
  })
}

onMounted(() => {
  const route = useRoute()
  if (route.query.id) {
    loadSharedPage(route.query.id.toString())
  }
})

watch(isPainting, async (newValue) => {
  const workload = document.getElementById('workload')
  if (!workload) return;
  if (newValue) {
    workload.style.zIndex = '20'
  } else {
    workload.style.zIndex = '0'
  }
})

watch(zoom, (newVal, oldVal) => {
  setTimeout(() => {
    draw('background')
    draw('workspace', true)
  }, 100)
})

watch(colors, () => {
  useTippy(moreColor, {
    content: h(ColorPalette, {value: colors.value}),
    arrow: true,
    interactive: true,
    hideOnClick: true,
    trigger: 'click'
  })
})

onBeforeRouteUpdate(n => {
  if (n.query.id) {
    loadSharedPage(n.query.id.toString())
  }
})
</script>

<style>
#workload {
  @apply border-b border-r;

  background-size: var(--zoom-size);
  background-image: linear-gradient(to right, #F0F0F0 1px, transparent 1px),
  linear-gradient(to bottom, #F0F0F0 1px, transparent 1px);
  background-position-x: -2px;
  background-position-y: -2px;
  border-color: #F0F0F0;
  width: 100%;
  height: 100%;
}

#workload canvas {
  top: -1px;
  left: -1px;
}
</style>
