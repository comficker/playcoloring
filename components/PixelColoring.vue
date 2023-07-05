<template>
  <div class="-mx-4 h-screen flex flex-col border-b divide-y">
    <div class="px-4 w-full mx-auto flex gap-2 font-semibold py-2 text-sm justify-between">
      <div class="flex gap-2 items-center">
        <nuxt-link class="flex gap-1 md:mr-4" to="/">
          <div class="i-con-pad fill-red-400 h-8 w-8"/>
          <img class="md:block hidden w-auto h-8" src="/logo.png" alt="Play Coloring">
        </nuxt-link>
        <div v-if="isEditor" class="btn md:px-5 bg-rose-700 text-white h-full" @click="reset">
          <div class="i-con-plus w-4 h-4"/>
          <span class="hidden md:block">New</span>
        </div>
        <div v-else class="relative">
          <div class="btn md:px-5 bg-rose-700 text-white" @click="loadSharedPage('random')">
            <div class="i-con-refresh w-4 h-4"/>
            <span class="hidden md:block">Random picture</span>
          </div>
          <div
            v-if="fetchingPercent < 101"
            class="absolute top-0 bottom-0 left-0 bg-gray-100 opacity-75 duration-75 rounded-[2px]"
            :style="{width: `${fetchingPercent}%`}"
          />
        </div>
        <div v-if="isEditor" class="hidden md:flex btn hover:shadow rounded p-2.5 px-5" @click="toggleModal(!!showModal ? null : 'load')">
          <span>Load</span>
        </div>
        <div class="btn hover:shadow rounded" @click="toggleModal(showModal === 'saving' ? null : 'saving')">
          <div class="i-con-save w-4 h-4"/>
        </div>
        <div class="btn hover:shadow rounded" @click="actionDownload">
          <div class="i-con-download w-4 h-4"/>
        </div>
      </div>
      <div class="flex gap-2 items-center">
        <div
          v-if="isEditor"
          class="btn hover:shadow rounded"
          :class="{'border-blue': isMoving}"
          @click="isMoving = !isMoving"
        >
          <div class="i-con-move w-4 h-4"/>
        </div>
        <div
          v-if="isEditor"
          class="btn hover:shadow rounded"
          :class="{'border-blue': showModal === 'ruler'}"
          @click="showModal = showModal === 'ruler' ? null : 'ruler'"
        >
          <div class="i-con-ruler w-4 h-4"/>
        </div>
        <div class="btn hover:shadow rounded" :class="{'border-blue': isDouble}" @click="isDouble = !isDouble">
          <div class="i-con-compare w-4 h-4"/>
        </div>
        <div class="btn hover:shadow rounded" @click="handleZoom(true)">
          <div class="i-con-zoom-in w-4 h-4"/>
        </div>
        <div class="btn hover:shadow rounded" @click="handleZoom(false)">
          <div class="i-con-zoom-out w-4 h-4"/>
        </div>
      </div>
    </div>
    <div class="w-full flex-1 mx-auto overflow-hidden">
      <div
        class="relative h-full overflow-hidden"
        :style="{
          '--zoom-size': `${cellScaleSize}px ${cellScaleSize}px`,
        }"
      >
        <div
          id="wrapper"
          :class="{
            'grayscale': !!showModal,
            'flex items-center justify-center': options.zoomOriginal >= options.zoom
          }"
        >
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
                  width: `${Math.ceil(cellScaleSize)}px`,
                  height: `${Math.ceil(cellScaleSize)}px`
                }"
            />
            <div
              id="controller"
              class="absolute inset-0"
              @touchstart="handleMouseDown"
              @touchmove="handleMouseHover"
              @touchend="handleMouseUp"
              @mousedown="handleMouseDown"
              @mouseup="handleMouseUp"
              @mousemove="handleMouseHover"
              @mouseover="handleMouseUp"
            ></div>
          </div>
        </div>
        <client-only>
          <Transition
            enter-active-class="animated animated-faster animate-fade-in"
            leave-active-class="animated animated-faster animate-fade-out"
          >
            <div v-if="!!showModal" class="fixed md:absolute inset-0 bg-black/50" @click="showModal = null"/>
          </Transition>
          <Transition
            enter-active-class="animated animated-faster animate-slide-in-up"
            leave-active-class="animated animated-faster animate-slide-out-down"
          >
            <div
              v-if="!!showModal"
              class="fixed md:absolute bottom-[-1px] left-[-1px] right-[-1px] z-60"
            >
              <div class="max-w-xl mx-auto bg-white shadow-xl rounded-tl-2xl rounded-tr-2xl border">
                <div v-if="showModal === 'load'" class="p-4 space-y-3 cursor-pointer">
                  <div class="p-4 bg-blue-100 py-2 text-sm border rounded-[2px]">
                    <p>You can load your pixel art by click to select file!</p>
                  </div>
                  <input
                    id="inputFile" type="file" class="w-full" placeholder="Load"
                    @input="loadFile"
                  >
                  <div v-if="loadErrs.length" class="p-4 bg-yellow-100 py-2 text-sm border rounded-[2px]">
                    <div v-for="e in loadErrs" :key="e">{{e}}</div>
                  </div>
                </div>
                <modal-save v-else-if="showModal === 'saving'" :workspace="workspace" @hide="showModal = null"/>
                <div v-else-if="showModal === 'ruler'" class="p-4 space-y-3">
                  <div class="flex justify-between items-center text-xs">
                    <div class="text-2xl font-bold">Resize</div>
                    <div class="i-con-minimize w-4 h-4 cursor-pointer" @click="showModal = null"/>
                  </div>
                  <div class="flex gap-4 text-xs font-bold">
                    <div
                      v-for="s in [8, 16, 24, 32]" :key="s"
                      class="border w-12 h-12 p-1 hover:border-blue-500 cursor-pointer duration-200"
                      :class="{'border-blue-500': newSize === s}"
                      @click="newSize = s"
                    >
                      <span>{{s}}px</span>
                    </div>
                  </div>
                  <div class="flex gap-4">
                    <div class="btn bg-green-500 text-white font-semibold text-sm" @click="reSize()">
                      <span>Resize</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </client-only>
      </div>
    </div>
    <div class="w-full mx-auto px-4 font-semibold py-2 min-h-24 md:min-h-auto">
      <div class="flex gap-2 text-sm flex-wrap">
        <div v-if="isEditor" class="btn border" @click="openPalette">
          <div class="w-4 h-4" :class="{'i-con-adjust': !isCustomPalette, 'i-con-rollback': isCustomPalette}"/>
        </div>
        <div
          v-if="isCustomPalette"
          class="btn border"
          @click="changePalette"
        >
          <span>Palette</span>
          <div class="w-4 h-4 i-con-down"/>
        </div>
        <div
          v-if="isCustomPalette"
          class="btn border"
          @click="changePalette"
        >
          <span>OK</span>
          <div class="w-4 h-4 i-con-ok"/>
        </div>
        <div
          class="btn border"
          :class="{'border-blue': !options.color}"
          @click="onClickColor(null)"
        >
          <div class="w-4 h-4 i-con-eraser"/>
        </div>
        <template v-for="(c, i) in workspace.colors">
          <div v-if="isCustomPalette" key="i" class="border rounded-full overflow-hidden md:rounded box-content w-8 h-8 md:w-9 md:h-9">
            <input type="color" class="w-full h-full" v-model="workspace.colors[i]">
          </div>
          <div
            v-else
            :key="c"
            class="cursor-pointer border p-2 md:p-2.5 rounded-[2px] box-border"
            :class="{'border-blue': c === options.color, 'border-transparent': c !== options.color}"
            :style="{backgroundColor: c}"
            @click="onClickColor(c)"
          >
            <div class="w-4 h-4" :class="{'text-white': !c.startsWith('#f')}">
              <div>{{ i }}</div>
            </div>
          </div>
        </template>
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

const {debounce} = pkg
const route = useRoute()

interface Options {
  color: string | null,
  pointer: string,
  zoom: number,
  zoomOriginal: number
}

const {isEditor} = defineProps<{isEditor: boolean}>()

const workspace: Workspace = reactive<Workspace>({
  id: 0,
  width: 16,
  height: 16,
  colors: [
    "#FFF2CC",
    "#FFD966",
    "#F4B183",
    "#DFA67B",
    "#245953",
  ],
  map_numbers: {},
  steps: []
})

const palettes = ref<string[][]>([])
const newSize = ref(16)
const displaySize = ref(576)
const isPainting = ref(false)
const showModal = ref<null | string>(null)
const isDouble = ref(false)
const isCustomPalette = ref(false)
const isMoving = ref(false)
const fetchingPercent = ref(101)
const options = ref<Options>({
  color: '#FFF2CC',
  zoom: Math.log(displaySize.value / workspace.width) / Math.log(2),
  zoomOriginal: Math.log(displaySize.value / workspace.width) / Math.log(2),
  pointer: ''
})
const loadErrs = ref<string[]>([])

const PICTURE_SIZE = computed(() => ({
  w: Math.round(workspace.width * Math.pow(2, options.value.zoom)),
  h: Math.round(workspace.height * Math.pow(2, options.value.zoom))
}))

const cellScaleSize = computed(() => Math.pow(2, options.value.zoom))
const result = computed(() => {
  const out: {[key:string]: number} = {}
  workspace.steps.forEach((step: Step) => {
    if (step.c >= 0) {
      out[step.k] = step.c
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

const filCanvas = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
  const key = `${Math.round(x / cellScaleSize.value)}_${Math.round(y / cellScaleSize.value)}`
  if (options.value.pointer === key) {
    return
  }
  options.value.pointer = key
  if (options.value.color) {
    if (result.value[key] === workspace.colors.indexOf(options.value.color))
      return;
    ctx.fillStyle = options.value.color;
    ctx.fillRect(x, y, Math.ceil(cellScaleSize.value), Math.ceil(cellScaleSize.value));
    workspace.steps.push({
      k: key,
      c: workspace.colors.indexOf(options.value.color),
    })
  } else {
    if (typeof result.value[key] === 'undefined')
      return;

    ctx.clearRect(x, y, Math.ceil(cellScaleSize.value), Math.ceil(cellScaleSize.value));
    workspace.steps.push({
      k: key,
      c: -1
    })
    if (workspace.map_numbers.hasOwnProperty(key)) {
      ctx.font = `${cellScaleSize.value / 3}px Inter, Arial, sans-serif`
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

const fillColor = (e: PointerEvent) => {
  const ctx = getCtx('workspace')
  if (ctx) {
    const x = Math.round(e.offsetX - e.offsetX % cellScaleSize.value)
    const y = Math.round(e.offsetY - e.offsetY % cellScaleSize.value)
    filCanvas(ctx, x, y)
    if (isDouble.value) {
      const x2 = Math.round((workspace.width - 1 - x / cellScaleSize.value) * cellScaleSize.value)
      filCanvas(ctx, x2, y)
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
  ctx.font = `${cellScaleSize.value / 3}px Inter, Arial, sans-serif`
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
    ctx.fillStyle = workspace.colors[result.value[k]];
    ctx.fillRect(arr[0] * cellScaleSize.value, arr[1] * cellScaleSize.value, cellScaleSize.value, cellScaleSize.value);
  })
}

const loadFile = () => {
  loadErrs.value = []
  const fileElm: HTMLInputElement | null = document.getElementById("inputFile") as HTMLInputElement
  const ctx = getCtx('workspace')
  if (fileElm && ctx) {
    const img = new Image;
    img.onload = function () {
      if (img.width > 64 || img.height > 64) {
        loadErrs.value.push('Your pixel art must less than or equal 64x64 pixels')
        return
      }
      ctx?.drawImage(img, 0, 0)
      workspace.colors = []
      workspace.map_numbers = {}
      workspace.steps = []
      workspace.id = 0
      workspace.width = img.width
      workspace.height = img.height
      workspace.template = undefined
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
    img.onerror = function () {
      loadErrs.value.push('Sorry, I can\'t load your image!')
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
  showModal.value = null
  if (fetchingPercent.value < 101) return
  fetchingPercent.value = 0
  let timeLeft = 50
  const itv = setInterval(() => {
    fetchingPercent.value = fetchingPercent.value + timeLeft / 2
    timeLeft = timeLeft / 2
  }, 100)
  const {data} = await useAuthFetch(`/coloring/shared-pages/${id}/`)
  if (!data.value) return
  const value = data.value as SharedPage
  workspace.width = value.width
  workspace.height = value.height
  options.value.zoom = Math.log(displaySize.value / value.width) / Math.log(2);
  workspace.colors = value.colors
  workspace.map_numbers = value.map_numbers
  workspace.steps = []
  if (value.is_template) {
    workspace.template = workspace.template || value.id
  } else {
    workspace.template = undefined
  }
  options.value.color = value.colors[0]
  reDraw()
  document.body.scrollTop = document.documentElement.scrollTop = 0;
  clearInterval(itv)
  fetchingPercent.value = 100
  setTimeout(() => {
    fetchingPercent.value = 101
  }, 300)
}

const toggleModal = (type: string | null) => {
  showModal.value = type
}

const actionDownload = () => {
}

const reset = () => {
  workspace.map_numbers = {}
  workspace.steps = []
  reDraw()
}

const reSize = () => {
  workspace.width = newSize.value
  workspace.height = newSize.value
  options.value.zoom = Math.log(displaySize.value / workspace.width) / Math.log(2)
  reset()
  showModal.value = null
}

const openPalette = () => {
  if (!isCustomPalette.value) {
    isCustomPalette.value = true
    palettes.value.push([...workspace.colors])
  } else {
    const last = palettes.value.pop()
    workspace.colors = last ? [...last] : []
    isCustomPalette.value = false
  }
}

const changePalette = () => {
  options.value.color = workspace.colors[0] || null
  isCustomPalette.value = false
  reDraw()
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

watch(() => [displaySize, workspace.width, workspace.height], () => {
  options.value.zoom = Math.log(displaySize.value / workspace.width) / Math.log(2)
  options.value.zoomOriginal = options.value.zoom
  reDraw()
})

onMounted(() => {
  const wrapper = document.getElementById('wrapper')
  if (wrapper && wrapper.offsetWidth < 576) {
    displaySize.value = 384
  }

  const route = useRoute()
  if (route.query.id || !isEditor) {
    loadSharedPage(route.query?.id?.toString() || 'random')
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

#controller {
  background-size: 50% 50%;
  background-image: linear-gradient(to right, #DDDDDD 1px, transparent 1px),
  linear-gradient(to bottom, #DDDDDD 1px, transparent 1px);
  background-position-x: -0.5px;
  background-position-y: -0.5px;
}

#wrapper {
  @apply absolute overflow-auto;

  inset: -1px;
}

#wrapper::-webkit-scrollbar{
  display: none;
}

.pt-full {
  padding-top: calc(100% - 2px);
}
</style>
