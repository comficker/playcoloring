<template>
  <div class="hh1 -mx-4 h-screen flex flex-col border-b divide-y relative">
    <div class="px-4 w-full mx-auto flex gap-2 font-semibold py-2 text-sm justify-between">
      <div class="flex gap-2 items-center">
        <nuxt-link class="flex gap-1 mr-2 md:mr-4" to="/">
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
        <div v-if="isEditor" class="hidden md:flex btn hover:shadow rounded p-2.5 px-5"
             @click="toggleModal(!!showModal ? null : 'load')">
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
          v-if="!isEditor"
          class="btn hover:shadow rounded"
          :class="{'border border-blue': isFilling}"
          @click="isFilling = !isFilling"
        >
          <div class="i-con-fill w-4 h-4"/>
        </div>
        <div
          v-if="isEditor"
          class="btn hover:shadow rounded"
          :class="{'border border-blue': isMoving}"
          @click="isMoving = !isMoving"
        >
          <div class="i-con-move w-4 h-4"/>
        </div>
        <div
          v-if="isEditor"
          class="btn hover:shadow rounded"
          :class="{'border border-blue': showModal === 'ruler'}"
          @click="showModal = showModal === 'ruler' ? null : 'ruler'"
        >
          <div class="i-con-ruler w-4 h-4"/>
        </div>
        <div class="btn hover:shadow rounded" :class="{'border border-blue': isDouble}" @click="isDouble = !isDouble">
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
    <div class="z-10 relative hh2 w-full flex-1 mx-auto overflow-hidden">
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
            'flex items-center justify-center': displaySize + 2 >= PICTURE_SIZE.w
          }"
        >
          <div
            id="workload" class="relative"
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
                    <div v-for="e in loadErrs" :key="e">{{ e }}</div>
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
                      <span>{{ s }}px</span>
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
        <div v-if="isMoving" class="absolute inset-0 z-60">
          <div class="absolute bottom-4 left-0 right-0 flex gap-4 justify-center">
            <div class="btn bg-white border-gray-200" @click="teleport('h', -1)">
              <div class="w-4 h-4 i-con-arrow-left"/>
            </div>
            <div class="btn bg-white border-gray-200" @click="teleport('h', 1)">
              <div class="w-4 h-4 i-con-arrow-right"/>
            </div>
          </div>
          <div class="absolute right-4 top-0 bottom-0 flex flex-col gap-4 justify-center">
            <div class="btn bg-white border-gray-200" @click="teleport('v', -1)">
              <div class="w-4 h-4 i-con-arrow-up"/>
            </div>
            <div class="btn bg-white border-gray-200" @click="teleport('v', 1)">
              <div class="w-4 h-4 i-con-arrow-down"/>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="z-20 w-full mx-auto px-4 font-semibold py-2 bottom-0 left-0 right-0 bg-white" :class="{'sticky': !showModal}">
      <div class="flex gap-2 text-sm flex-nowrap items-center">
        <div
          v-if="isCustomPalette || isMerging"
          class="btn hover:border-gray-2"
          @click="handleCancel"
        >
          <div class="w-4 h-4 i-con-rollback"/>
        </div>
        <div
          v-if="isCustomPalette || isMerging"
          class="btn hover:border-gray-2"
          @click="handleOK"
        >
          <div class="w-4 h-4 i-con-ok"/>
          <span>OK</span>
        </div>
        <div
          v-if="isEditor && !isMerging && !isCustomPalette"
          class="btn hover:border-gray-2" :class="{'border-blue': isCustomPalette}"
          @click="switchOpenPalette"
        >
          <div class="w-4 h-4 i-con-adjust"/>
        </div>
        <div
          v-if="isEditor && !isMerging && !isCustomPalette"
          class="btn hover:border-gray-200"
          @click="isMerging = true"
        >
          <div class="w-4 h-4 i-con-combine"/>
        </div>
        <div
          v-if="isCustomPalette && false"
          class="btn hover:border-gray-2"
        >
          <div class="w-4 h-4 i-con-down"/>
          <span>Palette</span>
        </div>
        <div
          v-if="!isCustomPalette && !isMerging"
          class="btn hover:border-gray-2"
          :class="{'border-blue': !options.color}"
          @click="options.color = null"
        >
          <div class="w-4 h-4 i-con-eraser"/>
        </div>
        <div class="flex-1 overflow-auto no-scrollbar">
          <div class="flex flex-nowrap gap-2 w-full">
            <template v-for="(c, i) in workspace.colors">
              <div
                v-if="isCustomPalette" :key="i"
                class="flex-none rounded-full overflow-hidden md:rounded-[2px] w-8 h-8 md:w-9 md:h-9">
                <input type="color" class="w-full h-full" v-model="workspace.colors[i]">
              </div>
              <div
                v-else
                :key="c"
                class="flex-none cursor-pointer border p-2 md:p-2.5 rounded-[2px] box-border"
                :class="{'border-blue': checkColor(i), 'border-transparent': !checkColor(i)}"
                :style="{backgroundColor: c}"
                @click="onClickColor(i)"
              >
                <div class="w-4 h-4" :class="{'text-white': !c.startsWith('#f')}">
                  <div>{{ i }}</div>
                </div>
              </div>
            </template>
          </div>
        </div>
        <div
          v-if="!isCustomPalette && !isMerging && isEditor"
          class="btn border-gray-100 hover:border-gray-200"
          @click="addColor"
        >
          <div class="w-4 h-4 i-con-plus"/>
        </div>
        <div v-if="isMerging && mergingList.length < 2" class="font-light">The first choose is main color!</div>
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
import {trimCanvas} from "~/helper/canvas";
import {rgbToHex} from "~/helper/color";

function gcd(a: number, b: number) {
  while (a != b) {
    if (a > b) {
      a -= b;
    } else {
      b -= a;
    }
  }
  return a;
}

function findSmallestOdd(num: number): number {
  if (num % 2 === 0) {
    return findSmallestOdd(num / 2)
  }
  return num
}

const {debounce, cloneDeep} = pkg
const route = useRoute()
const DEFAULT_COLORS = [
  "#FFF2CC",
  "#FFD966",
  "#F4B183",
  "#DFA67B",
  "#245953",
]

interface Options {
  color: string | null,
  pointer: string,
  zoom: number,
}

const {isEditor} = defineProps<{ isEditor: boolean }>()

const workspace: Workspace = reactive<Workspace>({
  id: 0,
  width: 16,
  height: 16,
  colors: cloneDeep(DEFAULT_COLORS),
  map_numbers: {},
  results: {},
  steps: [{
    t: 'init_colors',
    v: cloneDeep(DEFAULT_COLORS)
  }]
})

const palettes = ref<string[][]>([])
const newSize = ref(16)

const displaySize = ref(576)
const isPainting = ref(false)
const showModal = ref<null | string>(null)
const isDouble = ref(false)
const isCustomPalette = ref(false)
const isMoving = ref(false)
const isMerging = ref(false)
const isFilling = ref(false)
const fetchingPercent = ref(101)
const options = ref<Options>({
  color: '#FFF2CC',
  zoom: Math.log(displaySize.value / workspace.width) / Math.log(2),
  pointer: ''
})
const loadErrs = ref<string[]>([])
const mergingList = ref<number[]>([])

const cellScaleSize = computed(() => Math.round(Math.pow(2, options.value.zoom)))
const PICTURE_SIZE = computed(() => ({
  w: Math.round(workspace.width * cellScaleSize.value),
  h: Math.round(workspace.height * cellScaleSize.value)
}))

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

const onClickColor = (i: number) => {
  if (isMerging.value) {
    const index = mergingList.value.indexOf(i)
    if (index < 0) {
      mergingList.value.push(i)
    } else {
      mergingList.value.splice(index, 1)
    }
  } else {
    options.value.color = workspace.colors[i]
  }
}

const filCanvas = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
  const key = `${Math.round(x / cellScaleSize.value)}_${Math.round(y / cellScaleSize.value)}`
  if (options.value.pointer === key) {
    return
  }
  options.value.pointer = key
  const colors = workspace.results
  if (options.value.color) {
    const index = workspace.colors.indexOf(options.value.color)
    if (colors[key] === index)
      return;
    ctx.fillStyle = options.value.color;
    ctx.fillRect(x, y, Math.ceil(cellScaleSize.value), Math.ceil(cellScaleSize.value));
    workspace.steps.push({
      t: 'fill',
      k: key,
      c: index,
    })
  } else {
    if (typeof colors[key] === 'undefined')
      return;

    ctx.clearRect(x, y, Math.ceil(cellScaleSize.value), Math.ceil(cellScaleSize.value));
    workspace.steps.push({
      t: 'fill',
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
  step2Result()
}

const fillColor = (e: PointerEvent) => {
  const canvas = document.getElementById('workspace') as HTMLCanvasElement
  const ctx = canvas?.getContext('2d', {
    willReadFrequently: true
  })
  if (ctx) {
    const x = Math.round(e.offsetX - e.offsetX % cellScaleSize.value)
    const y = Math.round(e.offsetY - e.offsetY % cellScaleSize.value)
    filCanvas(ctx, x, y)
    pop(e.clientX, e.clientY)
    window.soundPop.play()
    if (isDouble.value) {
      const x2 = Math.round((workspace.width - 1 - x / cellScaleSize.value) * cellScaleSize.value)
      filCanvas(ctx, x2, y)
    }
    if (isFilling.value) {
      const cIndex = workspace.map_numbers[`${Math.round(x  / cellScaleSize.value)}_${Math.round(y / cellScaleSize.value)}`]
      const keys = Object.keys(workspace.map_numbers)
      let start = 1
      const e = document.getElementById('controller')
      const b = e?.getBoundingClientRect()
      Object.values(workspace.map_numbers).forEach((value: number, index: number) => {
        if (cIndex === value && b) {
          const arr = keys[index].split("_").map(n => Number.parseInt(n))
          setTimeout(() => {
            filCanvas(ctx, arr[0] * cellScaleSize.value, arr[1] * cellScaleSize.value)
            pop(b.x + arr[0] * cellScaleSize.value, b.y + arr[1] * cellScaleSize.value)
          }, start * 100)
          if (index % 2) {
            start++
          }
        }
      })
    }
  }
}

const reDraw = () => {
  const canvas = document.getElementById('workspace') as HTMLCanvasElement
  const ctx = canvas?.getContext('2d', {
    willReadFrequently: true
  })
  if (!ctx) return;
  ctx.clearRect(
    0, 0,
    PICTURE_SIZE.value.w,
    PICTURE_SIZE.value.h
  )
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
  const colors = workspace.results
  Object.keys(colors).forEach((k: string) => {
    const arr = k.split("_").map(x => Number.parseInt(x))
    ctx.fillStyle = workspace.colors[colors[k]];
    ctx.fillRect(arr[0] * cellScaleSize.value, arr[1] * cellScaleSize.value, cellScaleSize.value, cellScaleSize.value);
  })
}

const loadFile = () => {
  loadErrs.value = []
  const fileElm: HTMLInputElement | null = document.getElementById("inputFile") as HTMLInputElement
  const canvas = document.getElementById('workspace') as HTMLCanvasElement
  const ctx = canvas?.getContext('2d', {
    willReadFrequently: true
  })
  if (fileElm && ctx) {
    const img = new Image;
    canvas.width = PICTURE_SIZE.value.w
    canvas.height = PICTURE_SIZE.value.h
    img.onload = function () {
      ctx.imageSmoothingEnabled = false;
      const greater = gcd(img.width, img.height)
      let width = img.width / greater, height = img.height / greater
      if (img.width === img.height) {
        width = height = 64
      }
      if (width > 128 || height > 128) {
        loadErrs.value.push('Your pixel art must less than or equal 64x64 pixels')
        return
      }

      ctx?.drawImage(img, 0, 0, width, height)
      trimCanvas(canvas)
      width = canvas.width
      height = canvas.height
      const size = width > height ? width : height
      const colors: string[] = []
      const results: { [key: string]: number } = {}
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          const pixelData: any = ctx?.getImageData(x, y, 1, 1);
          const color = rgbToHex(pixelData.data[0], pixelData.data[1], pixelData.data[2])
          if (!(color === '#000000' && pixelData.data[3] === 0)) {
            if (!colors.includes(color)) {
              colors.push(color)
            }
            results[`${x}_${y}`] = colors.indexOf(color)
          }
        }
      }
      workspace.results = {}
      workspace.colors = []
      workspace.map_numbers = {}
      workspace.steps = [{
        t: 'init_colors',
        v: colors
      }, {
        t: 'init_results',
        v: results
      }]
      workspace.id = 0
      workspace.width = size
      workspace.height = size
      workspace.template = undefined
      step2Result()
      setTimeout(() => {
        reDraw()
        options.value.zoom = Math.log(displaySize.value / size) / Math.log(2);
      }, 100)
      showModal.value = null
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
  workspace.steps = [{
    t: 'init_colors',
    v: cloneDeep(value.colors)
  }]
  step2Result()
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
  workspace.colors = cloneDeep(DEFAULT_COLORS)
  workspace.steps = [{
    t: 'init_colors',
    v: cloneDeep(DEFAULT_COLORS)
  }]
  reDraw()
}

const reSize = () => {
  workspace.width = newSize.value
  workspace.height = newSize.value
  options.value.zoom = Math.log(displaySize.value / workspace.width) / Math.log(2)
  showModal.value = null
}

const checkColor = (i: number) => {
  return (!isMerging.value && workspace.colors[i] === options.value.color) || mergingList.value.includes(i)
}

const handleOK = () => {
  if (isCustomPalette.value) {
    options.value.color = workspace.colors[0] || null
    isCustomPalette.value = false
    reDraw()
  }
  if (isMerging.value && mergingList.value.length > 1) {
    workspace.steps.push({
      t: 'merge',
      v: mergingList.value
    })
    step2Result()
    reDraw()
  }
  mergingList.value = []
  isMerging.value = false
  isCustomPalette.value = false
}

const handleCancel = () => {
  if (isCustomPalette.value) {
    const last = palettes.value.pop()
    workspace.colors = last ? [...last] : []
  }
  mergingList.value = []
  isMerging.value = false
  isCustomPalette.value = false
}

const switchOpenPalette = () => {
  isCustomPalette.value = true
  palettes.value.push([...workspace.colors])
}

const step2Result = () => {
  let currentColors = cloneDeep(workspace.colors)
  let results: { [key: string]: number } = {}
  workspace.steps.forEach((step: Step) => {
    if ((!step.t || step.t === 'fill') && step.c !== undefined && step.k !== undefined) {
      if (step.c >= 0) {
        results[step.k] = step.c
        options.value.color = currentColors[step.c]
      } else {
        delete results[step.k]
        options.value.color = null
      }
    } else if (step.t === 'merge' && step.v) {
      const mergingList: number[] = cloneDeep(step.v)
      const old = cloneDeep(currentColors)
      const except = currentColors.indexOf(old[mergingList[0]])
      mergingList.sort((x: number, y: number) => y - x).forEach((index: number) => {
        if (index !== except)
          currentColors.splice(index, 1)
      })

      Object.keys(results).forEach((key: string) => {
        const newIndex = currentColors.indexOf(old[results[key]])
        results[key] = newIndex >= 0 ? newIndex : currentColors.indexOf(old[except])
      })

      options.value.color = old[except]
    } else if (step.t === 'init_colors' && step.v) {
      currentColors = cloneDeep(step.v)
      options.value.color = currentColors[0]
    } else if (step.t === 'init_results' && step.v) {
      results = cloneDeep(step.v)
    } else if (step.t === 'teleport' && step.v) {
      const newR : { [key: string]: number } = {}
      const arr = step.v.split("_")
      const p = arr[0] === 'v' ? 1 : 0
      Object.keys(results).forEach((k: string) => {
        const pa = k.split("_").map(x => Number.parseInt(x))
        pa[p] = pa[p] + Number.parseInt(arr[1])
        newR[pa.join("_")] = results[k]
      })
      results = newR
    }
  })
  workspace.results = results
  workspace.colors = currentColors
}

const addColor = () => {
  workspace.colors.push('#000000')
  workspace.steps.push({
    t: 'init_colors',
    v: cloneDeep(workspace.colors)
  })
}

const teleport = (direction: string, value: number) => {
  workspace.steps.push({
    t: 'teleport',
    v: `${direction}_${value}`
  })
  step2Result()
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
  // options.value.zoom = Math.log(displaySize.value / workspace.width) / Math.log(2)
  // reDraw()
})

watch(showModal, () => {
  isMoving.value = false
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

  window.soundPop = new Audio('/brush.wav')
})

onBeforeRouteUpdate(n => {
  if (n.query.id) {
    loadSharedPage(n.query.id.toString())
  }
})

function pop(x:number, y: number) {
  for (let i = 0; i < 4; i++) {
    createParticle(x, y);
  }
}
function createParticle(x: number, y: number) {
  if (!x || !y)
    return
  const particle = document.createElement('particle');
  document.body.appendChild(particle);
  const size = Math.floor(Math.random() * 15 + 5);
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;
  particle.style.background = options.value.color || '#FFF';
  particle.style.zIndex = '99999'
  const destinationX = x + (Math.random() - 0.5) * 2 * 50;
  const destinationY = y + (Math.random() - 0.5) * 2 * 50;
  const animation = particle.animate([
    {
      transform: `translate(${x - (size / 2)}px, ${y - (size / 2)}px)`,
      opacity: 1
    },
    {
      transform: `translate(${destinationX}px, ${destinationY}px)`,
      opacity: 0
    }
  ], {
    duration: 500 + Math.random() * 1000,
    easing: 'cubic-bezier(0, .9, .57, 1)',
    delay: Math.random() * 200
  });
  animation.onfinish = () => {
    particle.remove();
  };
}
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

#wrapper::-webkit-scrollbar {
  display: none;
}

.hh1 {
  min-height: 100vh;
  /* mobile viewport bug fix */
  min-height: -webkit-fill-available;
}

.hh2 {
  height: -webkit-fill-available;
}

particle {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  opacity: 0;
}
</style>
