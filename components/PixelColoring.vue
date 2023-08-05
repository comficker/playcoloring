<template>
  <div class="hh1 h-screen flex flex-col relative font-semibold">
    <div class="border-b -mx-4 px-4">
      <div class="mx-auto max-w-xl py-2 w-full mx-auto flex gap-2 justify-between relative">
        <div class="flex gap-6 items-center">
          <nuxt-link class="flex gap-1" to="/">
            <div class="i-con-pad fill-red-400 h-6 w-6"/>
            <img class="md:block hidden w-auto h-6" src="/logo.png" alt="Play Coloring">
          </nuxt-link>
          <main-navigator/>
        </div>
        <div class="flex gap-2 items-center">
          <div
            v-if="isEditor" class="hidden md:flex btn hover:shadow rounded p-2.5 px-5"
            @click="toggleModal(!!showModal ? null : 'load')">
            <span>Load</span>
          </div>
          <div class="btn hover:shadow rounded" @click="toggleModal(showModal === 'saving' ? null : 'saving')">
            <div class="i-con-save w-4 h-4"/>
            <span class="hidden md:block">Share</span>
          </div>
          <nuxt-link v-if="userStore.isLogged" to="/my-space" class="btn hover:shadow rounded">
            <div class="i-con-user w-4 h-4"/>
            <span class="hidden md:block">My space</span>
          </nuxt-link>
        </div>
      </div>
    </div>
    <div class="mx-auto max-w-xl z-10 relative hh2 w-full flex-1 mx-auto">
      <div
        class="relative h-full"
        style="--zoom-size: 1px 1px"
        :style="{'--zoom-size': `${cellScaleSize}px ${cellScaleSize}px`,}"
      >
        <div id="wrapper">
          <div
            id="workload" class="relative"
            :style="{
              width: `${PICTURE_SIZE.w}px`,
              height: `${PICTURE_SIZE.h}px`,
              marginTop: mt > 0 ? `${mt}px`: undefined
            }"
            :class="{'has-grid': isEditor,}"
          >
            <canvas
              id="workspace" :width="PICTURE_SIZE.w" :height="PICTURE_SIZE.h"
              :style="{width: `${PICTURE_SIZE.w}px`, height: `${PICTURE_SIZE.h}px`}"
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
              :class="{'has-grid': isEditor}"
              @mousedown="handleMouseDown"
              @mouseup="handleMouseUp"
              @mousemove="handleMouseHover"
              @mouseover="handleMouseUp"
            ></div>
          </div>
        </div>
        <client-only>
          <Transition
            enter-active-class="animated animated-duration-300 animate-slide-fade-in"
            leave-active-class="animated animated-duration-300 animate-slide-fade-out"
          >
            <div v-if="!!showModal" class="fixed inset-0" @click="showModal = null"/>
          </Transition>
          <Transition
            enter-active-class="animated animated-duration-300 animate-slide-in-down"
            leave-active-class="animated animated-duration-300 animate-slide-out-up"
          >
            <div
              v-if="!!showModal"
              class="z-20 fixed top-0 -right-[1px] -left-[1px] z-60"
            >
              <div class="absolute inset-0" @click="showModal = null"></div>
              <div class="relative max-w-xl mx-auto bg-white shadow-xl rounded-bl-lg rounded-br-lg border">
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
                <modal-save
                  v-else-if="showModal === 'saving'" :workspace="workspace"
                  @hide="showModal = null" @change="handleFormChange"
                />
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
        <div v-if="isMoving" class="absolute inset-0 z-50">
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
        <div class="absolute left-4 right-4 top-4 md:top-auto md:bottom-4 flex justify-center z-10 text-sm">
          <div class="flex gap-2 items-center rounded justify-center p-1 bg-white shadow">
            <div v-if="isEditor" class="btn hover:shadow rounded" @click="reset">
              <div class="i-con-plus w-3 h-3"/>
              <span class="hidden md:block">New</span>
            </div>
            <div v-else class="relative">
              <random-button/>
              <div
                v-if="fetchingPercent < 101"
                class="absolute top-0 bottom-0 left-0 bg-gray-100 opacity-75 duration-75 rounded-[2px]"
                :style="{width: `${fetchingPercent}%`}"
              />
            </div>
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
      </div>
    </div>
    <div
      class="mx-auto max-w-xl py-2 w-full mx-auto z-20 relative bottom-0 left-0 right-0 bg-white duration-200"
      :class="{'sticky': !showModal}"
    >
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
                class="flex-none rounded-full overflow-hidden md:rounded-[2px] w-9 h-9">
                <input type="color" class="w-full h-full" v-model="workspace.colors[i]">
              </div>
              <div
                v-else
                :key="c"
                class="flex-none cursor-pointer border p-2.5 rounded-[2px] box-border"
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
import {onBeforeRouteUpdate, useRoute} from "#app";
import {SaveForm, SharedPage, Step} from "~/interface";
import ModalSave from "~/components/ModalSave.vue";
import {trimCanvas, convertSteps} from "~/helper/canvas";
import {rgbToHex} from "~/helper/color";
import {useUserStore} from "~/stores/user";
import RandomButton from "~/components/RandomButton.vue";
import MainNavigator from "~/components/MainNavigator.vue";

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

const { $touch } = useNuxtApp()
const {debounce, cloneDeep} = pkg
const route = useRoute()
interface Options {
  color: string | null,
  pointer: string,
  zoom: number,
}

const userStore = useUserStore()

const {isEditor} = defineProps<{ isEditor: boolean }>()

const DEFAULT_COLORS = [
  "#FFF2CC",
  "#FFD966",
  "#F4B183",
  "#DFA67B",
  "#245953",
]
const DEFAULT_WORKSPACE: SharedPage = {
  id: 0,
  name: '',
  id_string: '',
  desc: '',
  width: 16,
  height: 16,
  colors: cloneDeep(DEFAULT_COLORS),
  map_numbers: {},
  steps: [{
    t: 'init_colors',
    v: cloneDeep(DEFAULT_COLORS)
  }],
  db_status: 0,
  is_template: isEditor,
  meta: undefined,
  user: null,
  taxonomies: [],

  tags: [],
  results: {},
  status: 'draft'
}

const workspace: SharedPage = reactive<SharedPage>(DEFAULT_WORKSPACE)

const palettes = ref<string[][]>([])
const newSize = ref(16)
const dpr = ref(1)
const displaySize = ref(576)
const wrapperSize = ref(576)
const wrapperHeight = ref(576)
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
const mt = computed(() => (wrapperHeight.value - PICTURE_SIZE.value.h) / 2)
const handleMouseDown = (e: MouseEvent) => {
  isPainting.value = true
  fillColor(e)
}

const handleMouseUp = () => {
  isPainting.value = false
}

const handleMouseHover = (e: MouseEvent) => {
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

const handleFormChange = (form: SaveForm) => {
  workspace.name = form.name
  workspace.desc = form.desc
  workspace.tags = form.tags
  saveLate()
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

const filCanvas = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string | null) => {
  if (isNaN(x) || isNaN(y))
    return;

  const key = `${Math.round(x / cellScaleSize.value)}_${Math.round(y / cellScaleSize.value)}`
  if (options.value.pointer === key) {
    return
  }
  options.value.pointer = key
  const colors = workspace.results || {}
  if (color) {
    const index = workspace.colors.indexOf(color)
    if (colors[key] === index)
      return;
    ctx.fillStyle = color;
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
      ctx.font = `${cellScaleSize.value / 4}px 'I pixel u', Arial, sans-serif`
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'
      ctx.fillStyle = '#957777'
      ctx.fillText(
        workspace.map_numbers[key].toString(),
        x + cellScaleSize.value / 2,
        y + cellScaleSize.value / 2
      );
    }
  }
  step2Result()
  saveLate()
}

const fillColor = (e: MouseEvent) => {
  const canvas = document.getElementById('workspace') as HTMLCanvasElement
  const ctx = canvas?.getContext('2d', {
    willReadFrequently: true
  })
  const color = options.value.color
  if (ctx) {
    const x = Math.round(e.offsetX - e.offsetX % cellScaleSize.value)
    const y = Math.round(e.offsetY - e.offsetY % cellScaleSize.value)
    filCanvas(ctx, x, y, color)
    pop(e.clientX, e.clientY)
    window.soundPop.play()
    if (isDouble.value) {
      const x2 = Math.round((workspace.width - 1 - x / cellScaleSize.value) * cellScaleSize.value)
      filCanvas(ctx, x2, y, color)
    }
    if (isFilling.value) {
      const cIndex = workspace.map_numbers[`${Math.round(x / cellScaleSize.value)}_${Math.round(y / cellScaleSize.value)}`]
      const keys = Object.keys(workspace.map_numbers)
      let start = 1
      const e = document.getElementById('controller')
      const b = e?.getBoundingClientRect()

      Object.values(workspace.map_numbers).forEach((value: number, index: number) => {
        if (cIndex === value && b) {
          const arr = keys[index].split("_").map(n => Number.parseInt(n))
          setTimeout(() => {
            filCanvas(ctx, arr[0] * cellScaleSize.value, arr[1] * cellScaleSize.value, color)
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
  ctx.font = `${Math.round(cellScaleSize.value / 4)}px 'I pixel u', Arial, sans-serif`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#957777'
  Object.keys(workspace.map_numbers).forEach((index: string) => {
    const arr = index.split("_").map(x => Number.parseInt(x))
    ctx.fillText(
      workspace.map_numbers[index].toString(),
      +arr[0] * cellScaleSize.value + cellScaleSize.value / 2,
      +arr[1] * cellScaleSize.value + cellScaleSize.value / 2
    );
  })
  const colors = workspace.results || {}
  Object.keys(colors).forEach((k: string) => {
    const arr = k.split("_").map(x => Number.parseInt(x))
    ctx.fillStyle = workspace.colors[colors[k]];
    ctx.fillRect(
      arr[0] * cellScaleSize.value,
      arr[1] * cellScaleSize.value,
      cellScaleSize.value,
      cellScaleSize.value
    );
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
      Object.assign(workspace, cloneDeep(DEFAULT_WORKSPACE))
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
      workspace.steps = [{
        t: 'init_colors',
        v: colors
      }, {
        t: 'init_results',
        v: results
      }]
      workspace.width = size
      workspace.height = size
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
  Object.assign(workspace, cloneDeep(DEFAULT_WORKSPACE))
  showModal.value = null
  if (fetchingPercent.value < 101) return
  fetchingPercent.value = 0
  let timeLeft = 50
  const itv = setInterval(() => {
    fetchingPercent.value = fetchingPercent.value + timeLeft / 2
    timeLeft = timeLeft / 2
  }, 100)
  const response: SharedPage = await $touch(`/coloring/shared-pages/${id}/`)
  if (!response) return
  Object.assign(workspace, response)
  workspace.tags = workspace.taxonomies.map(x => x.name)
  if (!isEditor) {
    workspace.name = ''
    workspace.desc = ''
    workspace.is_template = false
    workspace.id_string = ''
    workspace.template = workspace.template ? workspace.template : workspace.id
    workspace.id = 0
  }
  options.value.zoom = Math.log(displaySize.value / response.width) / Math.log(2);
  step2Result()
  options.value.color = response.colors[0]
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
  const out = convertSteps(workspace.steps, workspace.colors)
  workspace.results = out.results as {[key: string]: number}
  workspace.colors = out.colors
  options.value.color = out.color
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

const saveLate = debounce(async () => {
  if (!!workspace.id && (!workspace.user || !userStore.isLogged || workspace.user.id !== userStore.logged.id)) return

  let uri = '/coloring/shared-pages/'
  let method: "POST" | "PUT" = 'POST'
  if (workspace.id_string) {
    method = 'PUT'
    uri = uri + workspace.id_string + '/'
  }
  if (workspace.is_template && workspace.results) {
    workspace.map_numbers = workspace.results
  }
  const response: SharedPage = await $touch(uri, {
    method: method,
    body: {
      ...workspace,
      user: undefined,
      taxonomies: undefined
    }
  })
  Object.assign(workspace, response)
  workspace.tags = workspace.taxonomies.map(x => x.name)
}, 800)

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

watch(showModal, () => {
  isMoving.value = false
})

onMounted(() => {
  dpr.value = window.devicePixelRatio
  const wrapper = document.getElementById('wrapper')
  wrapperSize.value = wrapper ? wrapper.offsetWidth > wrapper.offsetHeight ? wrapper.offsetHeight : wrapper.offsetWidth : 576
  wrapperHeight.value = wrapper ? wrapper.offsetHeight : 576
  if (wrapper && wrapper.offsetWidth < 576) {
    displaySize.value = wrapperSize.value - 2 // for border
  }

  if (!isEditor) {
    const route = useRoute()
    if (route.query.id) {
      loadSharedPage(route.query.id.toString())
    } else if (userStore.isLogged) {
      loadSharedPage(userStore.logged.meta?.coloring?.current || 'random')
    } else {
      loadSharedPage('random')
    }
  }

  window.soundPop = new Audio('/brush.wav')
})

onBeforeRouteUpdate(n => {
  if (n.query.id) {
    loadSharedPage(n.query.id.toString())
  }
})

function pop(x: number, y: number) {
  for (let i = 0; i < 4; i++) {
    createParticle(x, y);
  }
}

function createParticle(x: number, y: number) {
  if (!x || !y)
    return
  const particle = document.createElement('span');
  particle.classList.add('particle')
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
  transform-origin: 0 0;
}

#workload.has-grid {
  background-size: var(--zoom-size);
  background-image: linear-gradient(to right, #F0F0F0 1px, transparent 1px),
  linear-gradient(to bottom, #F0F0F0 1px, transparent 1px);
  background-position-x: -0.5px;
  background-position-y: -0.5px;
}

#controller.has-grid {
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
  min-height: -webkit-fill-available;
}

.hh2 {
  height: -webkit-fill-available;
}

span.particle {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  opacity: 0;
}
</style>
