<script setup lang="ts">
import {useEditor} from "~/stores/editor";
import {onMounted} from "@vue/runtime-core";
import {useUserStore} from "~/stores/user";
import {useRoute} from "#app";

const DEFAULT_FONT = "'I pixel u', Inter, Arial, sans-serif"
const editorStore = useEditor()

const dpr = ref(2)
const isMouseDown = ref(false)

const realPixelSize = computed(() => 16 * editorStore.options.zoom)
const pixelSize = computed(() => dpr.value * realPixelSize.value)
const pictureSize = computed(() => pixelSize.value * editorStore.workspace.width)
const workspaceStyle = computed(() => ({
  width: `${pictureSize.value / dpr.value}px`,
  height: `${pictureSize.value / dpr.value}px`,
}))

const getPosition = (e: MouseEvent) => {
  return {
    x: Math.round(e.offsetX - e.offsetX % realPixelSize.value) / realPixelSize.value,
    y: Math.round(e.offsetY - e.offsetY % realPixelSize.value) / realPixelSize.value
  }
}

const fill = (e: MouseEvent) => {
  const p = getPosition(e)
  const step = {
    type: editorStore.options.boardFunc ? editorStore.options.boardFunc : 'fill',
    value: {
      key: `${p.x}_${p.y}`,
      color: editorStore.options.color
    }
  }
  if (editorStore.preCheckStep(step)) {
    editorStore.addStep(step)
  }
}

const handleMouseDown = (e: MouseEvent) => {
  isMouseDown.value = true
  fill(e)
}

const handleMouseUp = (e: MouseEvent) => {
  isMouseDown.value = false
}

const handleMouseHover = (e: MouseEvent) => {
  if (isMouseDown.value && ['', 'mirror'].includes(editorStore.options.boardFunc)) {
    fill(e)
  }
}

const draw = () => {
  const canvas = document.getElementById('workspace') as HTMLCanvasElement
  const ctx = canvas?.getContext('2d', {
    willReadFrequently: true
  })
  if (!ctx) return;
  ctx.clearRect(
    0, 0,
    pictureSize.value,
    pictureSize.value
  )
  ctx.font = `bold ${Math.round(pixelSize.value / 4)}px ${DEFAULT_FONT}`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#957777'
  if (!editorStore.isEditor) {
    Object.keys(editorStore.workspace.map_numbers).forEach((index: string) => {
      const arr = index.split("_").map(x => Number.parseInt(x))
      ctx.fillText(
        editorStore.workspace.map_numbers[index].toString(),
        pixelSize.value * (+arr[0] + 0.5),
        pixelSize.value * (+arr[1] + 0.5)
      );
    })
  }
  const colors = editorStore.workspace.results || {}
  Object.keys(colors).forEach((k: string) => {
    const arr = k.split("_").map(x => Number.parseInt(x))
    ctx.fillStyle = editorStore.workspace.colors[colors[k]];
    ctx.fillRect(
      arr[0] * pixelSize.value,
      arr[1] * pixelSize.value,
      pixelSize.value,
      pixelSize.value
    );
  })
}

watch(() => editorStore.workspace, () => {
  draw()
}, {deep: true})

watch(() => editorStore.options.zoom, () => {
  setTimeout(() => {
    draw()
  }, 100)
})

onMounted(() => {
  dpr.value = window.devicePixelRatio
  window.soundPop = new Audio('/brush.wav')
  let key = 'random'
  const es = useEditor()
  const us = useUserStore()
  const route = useRoute()
  if (route.query.id) {
    key = route.query.id.toString()
  } else {
    if (us.isLogged && us.logged?.meta?.coloring?.current) {
      key = us.logged.meta.coloring.current
    }
  }
  es.loadFromCloud(key).then(() => {
    draw()
  })
})
</script>

<template>
  <div
    id="wrapper"
    style="--zoom-size: 1px 1px"
    :style="{'--zoom-size': `${pixelSize / dpr}px ${pixelSize / dpr}px`,}"
  >
    <div>
      <div
        id="workload" class="relative cursor-crosshair mx-auto has-grid bg-white"
        :style="workspaceStyle"
      >
        <canvas
          id="workspace" class="absolute inset-0"
          :width="pictureSize" :height="pictureSize"
          :style="workspaceStyle"
        />
        <div
          id="controller"
          class="absolute inset-0 has-grid"
          @mousedown="handleMouseDown"
          @mouseup="handleMouseUp"
          @mousemove="handleMouseHover"
          @mouseover="handleMouseUp"
        ></div>
        <div v-if="editorStore.options.boardFunc === 'move'" class="absolute inset-0 z-10">
          <div class="absolute bottom-4 left-0 right-0 flex gap-4 justify-center">
            <div class="btn bg-white border-gray-200" @click="editorStore.handleTeleport('h', -1)">
              <div class="w-4 h-4 i-con-arrow-left"/>
            </div>
            <div class="btn bg-white border-gray-200" @click="editorStore.handleTeleport('h', 1)">
              <div class="w-4 h-4 i-con-arrow-right"/>
            </div>
          </div>
          <div class="absolute right-4 top-0 bottom-0 flex flex-col gap-4 justify-center">
            <div class="btn bg-white border-gray-200" @click="editorStore.handleTeleport('v', -1)">
              <div class="w-4 h-4 i-con-arrow-up"/>
            </div>
            <div class="btn bg-white border-gray-200" @click="editorStore.handleTeleport('v', 1)">
              <div class="w-4 h-4 i-con-arrow-down"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
#wrapper {
  @apply absolute overflow-auto bg-gray-50 flex flex-col items-center justify-center shrink-0 inset-0;
}

#wrapper::-webkit-scrollbar {
  display: none;
}

#workload {
  transform-origin: 0 0;
}

#workload.has-grid {
  @apply border-b border-r;
  border-color: #DDDDDD;
  background-size: var(--zoom-size);
  background-image: linear-gradient(to right, #F0F0F0 1px, transparent 1px),
  linear-gradient(to bottom, #F0F0F0 1px, transparent 1px);
}

#controller.has-grid {
  background-size: 50% 50%;
  background-image: linear-gradient(to right, #DDDDDD 1px, transparent 1px),
  linear-gradient(to bottom, #DDDDDD 1px, transparent 1px);
  background-position-x: 0;
  background-position-y: 0;
}
</style>
