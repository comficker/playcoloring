<template>
  <div class="space-y-4">
    <div class="flex gap-4 justify-between text-sm font-semibold">
      <div class="flex gap-2">
        <div class="btn bg-rose-700 text-white">
          <div class="i-con-plus w-3 h-3"/>
          <span>New</span>
        </div>
        <div class="md:block hidden">
          <div class="btn bg-gray-50 border" @click="toggleModal(showModal === 'loadFile' ? null : 'loadFile')">
            <span v-if="showModal === 'loadFile'">Done</span>
            <span v-else>Load</span>
          </div>
        </div>
      </div>
      <div class="flex gap-2">
        <div class="btn bg-gray-50 border" @click="toggleModal(showModal === 'saving' ? null : 'saving')">
          <div class="i-con-save w-5 h-5"/>
          <span>Save</span>
        </div>
        <div class="btn bg-green-500 text-white" @click="actionDownload">
          <div class="i-con-download w-5 h-5"/>
          <span>Download</span>
        </div>
      </div>
    </div>
    <div
      class="relative pt-full overflow-hidden"
      :style="{'--zoom-size': `${cellScaleSize}px ${cellScaleSize}px`}">
      <div id="wrapper">
        <div
          id="workload" class="absolute"
          :style="{
            width: `${PICTURE_SIZE.w}px`,
            height: `${PICTURE_SIZE.h}px`
          }"
        >
          <canvas
            id="workspace" :width="PICTURE_SIZE.w" :height="PICTURE_SIZE.h"
            class="absolute inset-0"
          />
          <div
            id="cursor" class="absolute"
            :style="{
              backgroundColor: options.color || '#FFF',
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
          class="absolute bottom-0 left-0 right-0 md:left-3 md:right-3 bg-white z-60 shadow-xl rounded-tl-xl rounded-tr-xl border"
        >
          <div v-if="showModal === 'loadFile'" class="p-4">
            <div class="w-full btn bg-white h-full border text-xs">
              <input
                id="inputFile" type="file" class="w-full" placeholder="Load"
                @input="loadFile"
              >
            </div>
          </div>
          <modal-save v-if="showModal === 'saving'" :workspace="workspace" @hide="showModal = null"/>
        </div>
      </Transition>
    </div>
    <div class="flex gap-4 justify-between flex-wrap">
      <div class="flex gap-2 font-semibold text-sm flex-wrap">
        <div
          v-for="(c, i) in workspace.colors" :key="c"
          class="cursor-pointer border p-2 rounded-[2px]"
          :class="{'border-blue': c === options.color, 'border-transparent': c !== options.color}"
          :style="{backgroundColor: c}"
          @click="onClickColor(c)"
        >
          <div class="w-4 h-4" :class="{'text-white': !c.startsWith('#f')}">
            <div>{{ i }}</div>
          </div>
        </div>
        <div
          class="cursor-pointer border p-2 bg-white"
          :class="{'border-blue': !options.color}"
          @click="onClickColor(null)"
        >
          <div class="w-4 h-4 i-con-eraser"/>
        </div>
      </div>
      <div class="flex gap-2 flex-wrap">
        <div class="cursor-pointer border p-2 rounded-[2px] bg-white" @click="handleZoom(true)">
          <div class="i-con-zoom-in w-4 h-4"/>
        </div>
        <div class="cursor-pointer border p-2 rounded-[2px] bg-white" @click="handleZoom(false)">
          <div class="i-con-zoom-out w-4 h-4"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import pkg from 'lodash'
import {onMounted, watch} from "@vue/runtime-core";
import {computed, ref} from "vue";
import {useAuthFetch} from "~/composables/useAuthFetch";
import {onBeforeRouteUpdate, useRoute} from "#app";
import {SharedPage, Step, Workspace} from "~/interface";
import ModalSave from "~/components/ModalSave.vue";

const {debounce, cloneDeep} = pkg
const route = useRoute()

interface Options {
  color: string | null,
  pointer: string,
  zoom: number
}

const workspace: Workspace = reactive<Workspace>({
  id: 0,
  width: 32,
  height: 32,
  colors: [
    "#FFF2CC",
    "#FFD966",
    "#F4B183",
    "#DFA67B",
    "#245953",
    "#408E91",
    "#B46060",
  ],
  map_numbers: {},
  steps: []
})

const displaySize = ref(512)
const isPainting = ref(false)
const showModal: any = ref(null)

const options = ref<Options>({
  color: '#FFF2CC',
  zoom: Math.log(displaySize.value / workspace.width) / Math.log(2),
  pointer: '',
})

const PICTURE_SIZE = computed(() => ({
  w: workspace.width * Math.pow(2, options.value.zoom),
  h: workspace.height * Math.pow(2, options.value.zoom)
}))

const cellScaleSize = computed(() => Math.pow(2, options.value.zoom))
const result = computed(() => {
  const out: {[key:string]: string} = {}
  workspace.steps.forEach((step: Step) => {
    if (step.c >= 0) {
      out[step.k] = workspace.colors[step.c]
    } else {
      delete out[step.k]
    }
  })
  return out
})

const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

const getCtx = (id: string): CanvasRenderingContext2D | null => {
  const canvas = document.getElementById(id) as HTMLCanvasElement
  return canvas?.getContext('2d', {
    willReadFrequently: true
  })
}

const handleMouseDown = (e: PointerEvent) => {
  isPainting.value = true
  fillColor(e)
}

const handleMouseUp = () => {
  isPainting.value = false
}

const handleMouseHover = (e: PointerEvent) => {
  const cs = cellScaleSize.value
  const cursor: HTMLElement | null = document.getElementById('cursor');
  if (!isPainting.value) {
    if (cursor) {
      cursor.style.left = `${e.offsetX - e.offsetX % (cs)}px`
      cursor.style.top = `${e.offsetY - e.offsetY % (cs)}px`
    }
  } else {
    fillColor(e)
  }
}

const handleZoom = (isPlus = true) => {
  if (isPlus && options.value.zoom < 6) {
    options.value.zoom++
  } else if (!isPlus && options.value.zoom > 4) {
    options.value.zoom--
  }
}

const onClickColor = (color: string | null) => {
  options.value.color = color
}

const fillColor = (e: PointerEvent) => {
  const ctx = getCtx('workspace')
  if (ctx) {
    const x = e.offsetX - e.offsetX % cellScaleSize.value
    const y = e.offsetY - e.offsetY % cellScaleSize.value
    const key = `${x / cellScaleSize.value}_${y / cellScaleSize.value}`
    if (options.value.pointer === key) {
      return
    }
    options.value.pointer = key
    if (options.value.color) {
      ctx.fillStyle = options.value.color;
      ctx.fillRect(x, y, cellScaleSize.value, cellScaleSize.value);
      workspace.steps.push({
        k: key,
        c: workspace.colors.indexOf(options.value.color),
      })
    } else {
      ctx.clearRect(x, y, cellScaleSize.value, cellScaleSize.value);
      workspace.steps.push({
        k: key,
        c: -1
      })
      if (workspace.map_numbers.hasOwnProperty(key)) {
        ctx.font = `${cellScaleSize.value / 2}px Inter var`
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'center'
        ctx.fillStyle = '#000'
        ctx.fillText(
          workspace.map_numbers[key].toString(),
          x + cellScaleSize.value / 2,
          y + cellScaleSize.value / 2
        );
      }
    }
  }
}

const reDraw = () => {
  const ctx = getCtx('workspace')
  if (!ctx) return;
  ctx.clearRect(
    0, 0,
    PICTURE_SIZE.value.w,
    PICTURE_SIZE.value.h
  )
  // ctx.scale(Math.pow(2, options.value.zoom), Math.pow(2, options.value.zoom));
  ctx.font = `${cellScaleSize.value / 2}px Inter var`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#000'
  Object.keys(workspace.map_numbers).forEach((index: string) => {
    const arr = index.split("_").map(x => Number.parseInt(x))
    ctx.fillText(
      workspace.map_numbers[index].toString(),
      +arr[0] * cellScaleSize.value + cellScaleSize.value / 2,
      +arr[1] * cellScaleSize.value + cellScaleSize.value / 2
    );
  })
  Object.keys(result.value).forEach((k: string) => {
    const arr = k.split("_").map(x => Number.parseInt(x))
    ctx.fillStyle = result.value[k];
    ctx.fillRect(arr[0], arr[1], 1, 1);
  })
}

const loadFile = () => {
  const fileElm: HTMLInputElement | null = document.getElementById("inputFile") as HTMLInputElement
  const ctx = getCtx('workspace')
  if (fileElm && ctx) {
    const img = new Image;
    img.onload = function () {
      ctx?.drawImage(img, 0, 0)
      workspace.colors = []
      workspace.map_numbers = {}
      workspace.steps = []
      workspace.id = 0
      workspace.width = img.width
      workspace.height = img.height
      for (let x = 0; x < img.width; x++) {
        for (let y = 0; y < img.height; y++) {
          const pixelData: any = ctx?.getImageData(x, y, 1, 1);
          const color = rgbToHex(pixelData.data[0], pixelData.data[1], pixelData.data[2])
          if (!(color === '#000000' && pixelData.data[3] === 0)) {
            if (!workspace.colors.includes(color)) {
              workspace.colors.push(color)
            }
            workspace.map_numbers[`${x}_${y}`] = workspace.colors.indexOf(color)
          }
        }
      }
      options.value.zoom = Math.log(displaySize.value / img.width) / Math.log(2);
      options.value.color = workspace.colors[0]
      showModal.value = null
      reDraw()
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
  const {data} = await useAuthFetch(`/coloring/shared-pages/${id}/`)
  if (!data.value) return
  const value = data.value as SharedPage
  workspace.width = value.width
  workspace.height = value.height
  options.value.zoom = Math.log(displaySize.value / value.width) / Math.log(2);
  workspace.colors = value.colors
  workspace.map_numbers = value.map_numbers
  workspace.steps = value.steps
  options.value.color = value.colors[0]
  reDraw()
  document.body.scrollTop = document.documentElement.scrollTop = 0;
}

const toggleModal = (type: string | null) => {
  showModal.value = type
}

const actionDownload = () => {
}

watch(isPainting, async (newValue) => {
  const workload = document.getElementById('workload')
  if (!workload) return;
  if (newValue) {
    workload.style.zIndex = '20'
  } else {
    workload.style.zIndex = '0'
  }
})

watch(() => options.value.zoom, () => {
  const elm = document.getElementById("wrapper")
  if (elm) {
    elm.scrollTop = 0
    elm.scrollLeft = 0
  }
  debounce(reDraw, 100)()
})

onMounted(() => {
  const route = useRoute()
  if (route.query.id) {
    loadSharedPage(route.query.id.toString())
  }
})

onBeforeRouteUpdate(n => {
  if (n.query.id) {
    loadSharedPage(n.query.id.toString())
  }
})
</script>

<style>
#workload {
  background-size: var(--zoom-size);
  background-image: linear-gradient(to right, #F0F0F0 1px, transparent 1px),
  linear-gradient(to bottom, #F0F0F0 1px, transparent 1px);
  background-position-x: -0.5px;
  background-position-y: -0.5px;
}

#wrapper {
  @apply absolute overflow-auto border;

  inset: -1px;
}

#wrapper::-webkit-scrollbar{
  display: none;
}
</style>
